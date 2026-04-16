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

// Muodosta navigaatio HTML
function buildNav() {
  return `
    <nav>
      <span class="logo">Finnlines — Työvuorot</span>
      <a href="index.html">Dashboard</a>
      <a href="employees.html">Työntekijät</a>
      <a href="wishes.html">Toiveet</a>
      <a href="schedule.html">Luo lista</a>
    </nav>
  `;
}

// Alusta sivu
document.addEventListener("DOMContentLoaded", () => {
  // Lisää navigaatio jos elementti löytyy
  const navPlaceholder = document.getElementById("nav-placeholder");
  if (navPlaceholder) {
    navPlaceholder.innerHTML = buildNav();
  }
  setActiveNav();
  initEmployees();
});
