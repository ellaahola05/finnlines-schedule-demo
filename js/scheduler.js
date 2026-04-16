// ===== SCHEDULER.JS =====
// Työvuorolistan generointilogiikka

// Pääfunktio: luo kuukauden työvuorolista
function generateSchedule(year, month, seasonSettings, employeeWishes) {
  const days = getDaysInMonth(year, month);
  const employees = loadData("employees", DEFAULT_EMPLOYEES);

  // schedule = { "2026-05-01": { employeeId: "AP", ... }, ... }
  const schedule = {};

  days.forEach(dateStr => {
    schedule[dateStr] = {};
  });

  // Käy läpi jokainen päivä
  days.forEach(dateStr => {
    const weekend = isWeekend(dateStr);
    const holiday = isHoliday(dateStr);
    const dayOfWeek = new Date(dateStr).getDay(); // 0=Su, 6=La

    // Pyhäpäivänä: vain satama ja lähtöselvitys
    if (holiday && !weekend) {
      assignHolidayShifts(schedule, dateStr, employees, seasonSettings);
      return;
    }

    // Viikonloppu (la/su): vain satama ja lähtöselvitys (VKL)
    if (weekend) {
      assignWeekendShifts(schedule, dateStr, employees, seasonSettings, employeeWishes);
      return;
    }

    // Arkipäivä: kaikki tiimit
    assignWeekdayShifts(schedule, dateStr, employees, seasonSettings, employeeWishes);
  });

  // Tarkista max 5 päivää putkeen -sääntö ja korjaa tarvittaessa
  enforceMaxConsecutiveDays(schedule, days, employees);

  return schedule;
}

// ===== ARKIPÄIVÄ =====
function assignWeekdayShifts(schedule, dateStr, employees, seasonSettings, wishes) {
  // Ryhmämyynti: kaikki paikalle (jos ei lomaa tms.)
  employees.filter(e => e.team === TEAMS.RYHMAMYYNTI).forEach(emp => {
    if (canWork(emp, dateStr, schedule, wishes)) {
      schedule[dateStr][emp.id] = "RM";
    }
  });

  // Esimies + kollega
  employees.filter(e => e.team === TEAMS.ESIMIES).forEach(emp => {
    if (canWork(emp, dateStr, schedule, wishes)) {
      schedule[dateStr][emp.id] = "AP";
    }
  });

  // Satamavastaava: yksi kerrallaan, vuorotellen
  assignSatama(schedule, dateStr, employees, wishes);

  // Asiakaspalvelu: tarvittava määrä sesongista riippuen
  assignAsiakaspalvelu(schedule, dateStr, employees, seasonSettings, wishes);
}

// ===== VIIKONLOPPU =====
function assignWeekendShifts(schedule, dateStr, employees, seasonSettings, wishes) {
  // Satamavastaava
  assignSatama(schedule, dateStr, employees, wishes);

  // Lähtöselvitys (VKL): asiakaspalvelijat jotka voivat tehdä viikonloppuja
  const checkInCount = seasonSettings.checkInStaff.min;
  const eligible = employees.filter(e =>
    e.team === TEAMS.ASIAKASPALVELU &&
    e.weekendAllowed &&
    canWork(e, dateStr, schedule, wishes)
  );

  // Priorisoi toiveet
  const sorted = sortByWish(eligible, dateStr, wishes);
  sorted.slice(0, checkInCount).forEach(emp => {
    schedule[dateStr][emp.id] = "VKL";
  });
}

// ===== PYHÄPÄIVÄ =====
function assignHolidayShifts(schedule, dateStr, employees, seasonSettings) {
  // Satamavastaava
  assignSatama(schedule, dateStr, employees, {});

  // Yksi lähtöselvittäjä pyhänä
  const eligible = employees.filter(e =>
    e.team === TEAMS.ASIAKASPALVELU &&
    e.weekendAllowed
  );
  if (eligible.length > 0) {
    schedule[dateStr][eligible[0].id] = "VKL";
  }
}

// ===== SATAMAVASTAAVA (vuorottelu) =====
function assignSatama(schedule, dateStr, employees, wishes) {
  const satamaEmployees = employees.filter(e => e.team === TEAMS.SATAMA);
  if (satamaEmployees.length === 0) return;

  // Laske kumpi on vuorossa: katsotaan aiempia päiviä
  // Yksinkertainen logiikka: jos edellinen päivä oli henkilö A → nyt henkilö B
  // (paitsi jos yhteen putki ei ole vielä 5 päivää)
  const lastAssigned = getLastSatama(schedule, dateStr, satamaEmployees);

  let assignThis;
  if (!lastAssigned) {
    assignThis = satamaEmployees[0];
  } else {
    // Laske kuinka monta päivää putkeen lastAssigned on ollut
    const streak = getSatamaStreak(schedule, dateStr, lastAssigned.id);
    if (streak >= 5) {
      // Vaihdetaan toiseen jos mahdollista
      assignThis = satamaEmployees.find(e => e.id !== lastAssigned.id) || satamaEmployees[0];
    } else {
      assignThis = lastAssigned;
    }
  }

  if (canWork(assignThis, dateStr, schedule, wishes)) {
    schedule[dateStr][assignThis.id] = "SAT";
  }
}

function getLastSatama(schedule, dateStr, satamaEmployees) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  const prev = toDateStr(d);
  if (!schedule[prev]) return null;
  return satamaEmployees.find(e => schedule[prev][e.id]);
}

function getSatamaStreak(schedule, dateStr, empId) {
  let count = 0;
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  while (true) {
    const prev = toDateStr(d);
    if (!schedule[prev] || !schedule[prev][empId]) break;
    count++;
    d.setDate(d.getDate() - 1);
    if (count >= 10) break; // turvaraja
  }
  return count;
}

// ===== ASIAKASPALVELU =====
function assignAsiakaspalvelu(schedule, dateStr, employees, seasonSettings, wishes) {
  const needed = seasonSettings.apStaffMin;
  const checkInNeeded = seasonSettings.checkInStaff.min;

  const eligible = employees.filter(e =>
    e.team === TEAMS.ASIAKASPALVELU &&
    canWork(e, dateStr, schedule, wishes)
  );

  // Priorisoi toiveet
  const sorted = sortByWish(eligible, dateStr, wishes);

  let assigned = 0;
  let checkInAssigned = 0;

  sorted.forEach(emp => {
    if (assigned >= needed) return;

    // Ensimmäiset checkInNeeded saavat lähtöselvitysvuoron
    if (checkInAssigned < checkInNeeded) {
      schedule[dateStr][emp.id] = "AP_L";
      checkInAssigned++;
    } else {
      schedule[dateStr][emp.id] = "AP";
    }
    assigned++;
  });
}

// ===== TOIVEIDEN PRIORISOINTI =====
// Järjestää työntekijät: "haluaa" ensin, "ei väliä" toisena, "ei pysty" viimeisenä
function sortByWish(employees, dateStr, wishes) {
  return [...employees].sort((a, b) => {
    const wa = getWish(a.id, dateStr, wishes);
    const wb = getWish(b.id, dateStr, wishes);
    const priority = { available: 0, neutral: 1, unavailable: 2 };
    return (priority[wa] ?? 1) - (priority[wb] ?? 1);
  });
}

function getWish(empId, dateStr, wishes) {
  if (!wishes[empId]) return "neutral";
  return wishes[empId][dateStr] || "neutral";
}

// ===== VOIKO HENKILÖ TULLA TÖIHIN? =====
function canWork(employee, dateStr, schedule, wishes) {
  // "Ei pysty" -toive
  if (getWish(employee.id, dateStr, wishes) === "unavailable") return false;

  // Tarkista ettei ylitä max 5 päivää putkeen
  const streak = getConsecutiveStreak(schedule, dateStr, employee.id);
  if (streak >= 5) return false;

  return true;
}

// Laske kuinka monta päivää putkeen henkilö on ollut töissä (ennen tätä päivää)
function getConsecutiveStreak(schedule, dateStr, empId) {
  let count = 0;
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  while (true) {
    const prev = toDateStr(d);
    if (!schedule[prev] || schedule[prev][empId] === undefined) break;
    count++;
    d.setDate(d.getDate() - 1);
    if (count >= 10) break;
  }
  return count;
}

// ===== MAX 5 PÄIVÄÄ PUTKEEN — TARKISTUS =====
function enforceMaxConsecutiveDays(schedule, days, employees) {
  employees.forEach(emp => {
    let streak = 0;
    days.forEach(dateStr => {
      if (schedule[dateStr][emp.id]) {
        streak++;
        if (streak > 5) {
          // Poista ylimääräinen vuoro
          delete schedule[dateStr][emp.id];
          streak = 0;
        }
      } else {
        streak = 0;
      }
    });
  });
}

// ===== STATISTIIKKA =====
function calcStats(schedule, employees) {
  const stats = {};
  employees.forEach(emp => {
    stats[emp.id] = { days: 0, hours: 0 };
  });

  Object.entries(schedule).forEach(([dateStr, day]) => {
    Object.entries(day).forEach(([empId, shiftCode]) => {
      const shift = SHIFT_TYPES[shiftCode];
      if (!shift) return;
      const id = parseInt(empId);
      if (stats[id]) {
        stats[id].days++;
        stats[id].hours += shift.hours;
      }
    });
  });

  return stats;
}
