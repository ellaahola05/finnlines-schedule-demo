// ===== APP.JS =====
// Yleiset toiminnot jotka toimivat kaikilla sivuilla

// Merkitse aktiivinen navigaatiolinkki
function setActiveNav() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(link => {
    if (link.getAttribute("href") === page) {
      link.classList.add("active");
    }
  });
}

// Näytä ilmoitus sivulla
function showAlert(message, type = "info", containerId = "alert-container") {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { container.innerHTML = ""; }, 4000);
}

// Muodosta navigaatio HTML roolin mukaan
function buildNav(session) {
  const isManager = session && session.role === "manager";
  const employeeLinks = `
    <a href="my-schedule.html">Oma näkymä</a>
  `;
  const managerLinks = `
    <a href="index.html">Dashboard</a>
    <a href="employees.html">Työntekijät</a>
    <a href="wishes.html">Toiveet</a>
    <a href="schedule.html">Luo lista</a>
    <a href="my-schedule.html">Oma näkymä</a>
  `;
  const userLabel = session
    ? `<span style="color:#aac4e0;font-size:0.85rem;margin-right:0.5rem;">${session.username}${isManager ? " (esimies)" : ""}</span>`
    : "";

  return `
    <nav>
      <span class="logo">Finnlines — Työvuorot</span>
      ${isManager ? managerLinks : employeeLinks}
      ${userLabel}
      <button onclick="logoutUser()" style="background:#ffffff22;padding:0.3rem 0.8rem;font-size:0.82rem;">Kirjaudu ulos</button>
    </nav>
  `;
}

// Alusta sivu
document.addEventListener("DOMContentLoaded", () => {
  initEmployees();
  initUsers();

  const navPlaceholder = document.getElementById("nav-placeholder");
  if (navPlaceholder) {
    const session = getSession();
    navPlaceholder.innerHTML = buildNav(session);
    setActiveNav();
  }
});
