// ===== DATA.JS =====
// Tämä tiedosto sisältää kaiken perustiedon:
// työntekijät, vuorotyypit, säännöt ja sesonkiasetukset.

// ===== VUOROTYYPIT =====
const SHIFT_TYPES = {
  AP: {
    code: "AP",
    name: "Asiakaspalvelu",
    start: "09:00",
    end: "17:00",
    hours: 7.5,
    includesCheckIn: false,
    weekendAllowed: false
  },
  AP_L: {
    code: "AP-L",
    name: "Asiakaspalvelu + lähtöselvitys",
    start: "09:00",
    end: "17:00",
    hours: 7.5,
    includesCheckIn: true,
    checkInStart: "12:00",
    checkInEnd: "14:00",
    weekendAllowed: false
  },
  AP_LY: {
    code: "AP-LY",
    name: "Asiakaspalvelu lyhyt",
    start: "09:00",
    end: "15:00",
    hours: 6,
    includesCheckIn: false,
    weekendAllowed: false
  },
  AP_LY_L: {
    code: "AP-LY-L",
    name: "Asiakaspalvelu lyhyt + lähtöselvitys",
    start: "09:00",
    end: "15:00",
    hours: 6,
    includesCheckIn: true,
    checkInStart: "12:00",
    checkInEnd: "14:00",
    weekendAllowed: false
  },
  VKL: {
    code: "VKL",
    name: "Viikonloppu lähtöselvitys",
    start: "12:00",
    end: "15:00",
    hours: 3,
    includesCheckIn: true,
    weekendAllowed: true,
    weekendOnly: true
  },
  RM: {
    code: "RM",
    name: "Ryhmämyynti",
    start: "08:00",
    end: "16:00",
    hours: 7.5,
    includesCheckIn: false,
    weekendAllowed: false
  },
  SAT: {
    code: "SAT",
    name: "Satamavastaava",
    start: "08:00",
    end: "16:00",
    hours: 7.5,
    includesCheckIn: false,
    weekendAllowed: true
  }
};

// ===== TIIMIT =====
const TEAMS = {
  RYHMAMYYNTI: "Ryhmämyynti",
  ESIMIES: "Esimies",
  SATAMA: "Satamavastaava",
  ASIAKASPALVELU: "Asiakaspalvelu"
};

// ===== SOPIMUSTYPIT =====
const CONTRACT_TYPES = {
  FULLTIME: {
    code: "fulltime",
    name: "Kokoaikainen",
    weeklyHours: 37.5,
    weekendAllowed: false  // kokoaikaiset eivät tee viikonloppuja (paitsi satama)
  },
  PARTTIME_FLEX: {
    code: "parttime_flex",
    name: "Osa-aikainen vaihteleva",
    minWeeklyHours: 20,
    maxWeeklyHours: 37.5,
    weekendAllowed: true
  },
  SUMMER: {
    code: "summer",
    name: "Kesätyöntekijä",
    minWeeklyHours: 10,
    maxWeeklyHours: 37.5,
    weekendAllowed: true
  }
};

// ===== TYÖNTEKIJÄT =====
// Tämä on oletusdata — voit muokata employees.html-sivulla
const DEFAULT_EMPLOYEES = [
  // Ryhmämyynti (4 hlö)
  { id: 1, name: "Ryhmämyynti 1", team: TEAMS.RYHMAMYYNTI, contract: "fulltime", allowedShifts: ["RM"], weekendAllowed: false },
  { id: 2, name: "Ryhmämyynti 2", team: TEAMS.RYHMAMYYNTI, contract: "fulltime", allowedShifts: ["RM"], weekendAllowed: false },
  { id: 3, name: "Ryhmämyynti 3", team: TEAMS.RYHMAMYYNTI, contract: "fulltime", allowedShifts: ["RM"], weekendAllowed: false },
  { id: 4, name: "Ryhmämyynti 4", team: TEAMS.RYHMAMYYNTI, contract: "fulltime", allowedShifts: ["RM"], weekendAllowed: false },

  // Esimies + kollega
  { id: 5, name: "Esimies", team: TEAMS.ESIMIES, contract: "fulltime", allowedShifts: ["AP"], weekendAllowed: false, isManager: true },
  { id: 6, name: "Esimiehen kollega", team: TEAMS.ESIMIES, contract: "fulltime", allowedShifts: ["AP"], weekendAllowed: false },

  // Satamavastaavat (2 hlö, vuorottelevat)
  { id: 7, name: "Satamavastaava 1", team: TEAMS.SATAMA, contract: "fulltime", allowedShifts: ["SAT", "VKL"], weekendAllowed: true },
  { id: 8, name: "Satamavastaava 2", team: TEAMS.SATAMA, contract: "fulltime", allowedShifts: ["SAT", "VKL"], weekendAllowed: true },

  // Asiakaspalvelu kokoaikaiset (3 hlö)
  { id: 9,  name: "Asiakaspalvelu 1", team: TEAMS.ASIAKASPALVELU, contract: "fulltime", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L"], weekendAllowed: false },
  { id: 10, name: "Asiakaspalvelu 2", team: TEAMS.ASIAKASPALVELU, contract: "fulltime", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L"], weekendAllowed: false },
  { id: 11, name: "Asiakaspalvelu 3", team: TEAMS.ASIAKASPALVELU, contract: "fulltime", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L"], weekendAllowed: false },

  // Asiakaspalvelu kesätyöntekijät (3 hlö)
  { id: 12, name: "Kesätyöntekijä 1", team: TEAMS.ASIAKASPALVELU, contract: "summer", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L", "VKL"], weekendAllowed: true, isSummer: true },
  { id: 13, name: "Kesätyöntekijä 2", team: TEAMS.ASIAKASPALVELU, contract: "summer", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L", "VKL"], weekendAllowed: true, isSummer: true },
  { id: 14, name: "Kesätyöntekijä 3", team: TEAMS.ASIAKASPALVELU, contract: "summer", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L", "VKL"], weekendAllowed: true, isSummer: true },

  // Asiakaspalvelu osa-aikaiset (3 hlö)
  { id: 15, name: "Osa-aikainen 1", team: TEAMS.ASIAKASPALVELU, contract: "parttime_flex", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L", "VKL"], weekendAllowed: true },
  { id: 16, name: "Osa-aikainen 2", team: TEAMS.ASIAKASPALVELU, contract: "parttime_flex", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L", "VKL"], weekendAllowed: true },
  { id: 17, name: "Osa-aikainen 3", team: TEAMS.ASIAKASPALVELU, contract: "parttime_flex", allowedShifts: ["AP", "AP_L", "AP_LY", "AP_LY_L", "VKL"], weekendAllowed: true }
];

// ===== SESONKIASETUKSET =====
const SEASON_PRESETS = {
  winter: {
    name: "Talvi (matalakausi)",
    apStaffMin: 3,
    apStaffMax: 3,
    checkInStaff: { min: 1, max: 2 }
  },
  shoulder: {
    name: "Välikausi (kevät/syksy)",
    apStaffMin: 3,
    apStaffMax: 5,
    checkInStaff: { min: 1, max: 2 }
  },
  summer: {
    name: "Kesä (huippusesonki)",
    apStaffMin: 5,
    apStaffMax: 7,
    checkInStaff: { min: 2, max: 3 }
  }
};

// ===== SUOMEN PYHÄPÄIVÄT 2025 =====
// Lisää vuosittain tarvittaessa
const FINNISH_HOLIDAYS = {
  "2025-01-01": "Uudenvuodenpäivä",
  "2025-01-06": "Loppiainen",
  "2025-04-18": "Pitkäperjantai",
  "2025-04-20": "Pääsiäinen",
  "2025-04-21": "Toinen pääsiäispäivä",
  "2025-05-01": "Vappu",
  "2025-05-29": "Helatorstai",
  "2025-06-08": "Helluntai",
  "2025-06-20": "Juhannusaatto",
  "2025-06-21": "Juhannuspäivä",
  "2025-11-01": "Pyhäinpäivä",
  "2025-12-06": "Itsenäisyyspäivä",
  "2025-12-24": "Jouluaatto",
  "2025-12-25": "Joulupäivä",
  "2025-12-26": "Tapaninpäivä",
  "2026-01-01": "Uudenvuodenpäivä",
  "2026-01-06": "Loppiainen",
  "2026-04-03": "Pitkäperjantai",
  "2026-04-05": "Pääsiäinen",
  "2026-04-06": "Toinen pääsiäispäivä",
  "2026-05-01": "Vappu",
  "2026-05-14": "Helatorstai",
  "2026-05-24": "Helluntai",
  "2026-06-19": "Juhannusaatto",
  "2026-06-20": "Juhannuspäivä",
  "2026-10-31": "Pyhäinpäivä",
  "2026-12-06": "Itsenäisyyspäivä",
  "2026-12-24": "Jouluaatto",
  "2026-12-25": "Joulupäivä",
  "2026-12-26": "Tapaninpäivä"
};

// ===== APUFUNKTIOT =====

// Hae päivän nimi suomeksi
function getDayName(dateStr) {
  const days = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

// Onko päivä viikonloppu
function isWeekend(dateStr) {
  const d = new Date(dateStr);
  return d.getDay() === 0 || d.getDay() === 6;
}

// Onko päivä pyhä
function isHoliday(dateStr) {
  return !!FINNISH_HOLIDAYS[dateStr];
}

// Muodosta YYYY-MM-DD merkkijono päivämäärästä
function toDateStr(date) {
  return date.toISOString().split("T")[0];
}

// Hae kaikki päivät kuukaudessa
function getDaysInMonth(year, month) {
  const days = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    days.push(toDateStr(new Date(d)));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ===== TIETOVARASTO (localStorage) =====

function saveData(key, value) {
  localStorage.setItem("finnlines_" + key, JSON.stringify(value));
}

function loadData(key, defaultValue = null) {
  const raw = localStorage.getItem("finnlines_" + key);
  if (raw === null) return defaultValue;
  try { return JSON.parse(raw); } catch { return defaultValue; }
}

// Alusta työntekijädata jos ei ole vielä tallennettu
function initEmployees() {
  if (!loadData("employees")) {
    saveData("employees", DEFAULT_EMPLOYEES);
  }
}
