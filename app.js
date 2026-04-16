const STORAGE_KEY = "funkerschule15_cert_bg_v1";

// Interne Passwörter
const PASSWORD_1 = "Speerli";
const PASSWORD_2 = "Untermosen";
const PASSWORD_3 = "Guglielmo Marconi";

let appState = {
  fullName: "",
  unlocked: false
};

const fullNameInput = document.getElementById("fullName");
const pw1Input = document.getElementById("pw1");
const pw2Input = document.getElementById("pw2");
const pw3Input = document.getElementById("pw3");
const unlockBtn = document.getElementById("unlockBtn");
const resetBtn = document.getElementById("resetBtn");
const messageBox = document.getElementById("messageBox");
const certificateHost = document.getElementById("certificateHost");
const certificateTemplate = document.getElementById("certificateTemplate");
const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");
const statusBadge = document.getElementById("statusBadge");

init();

function init() {
  loadState();
  bindEvents();
  renderAll();
}

function bindEvents() {
  unlockBtn.addEventListener("click", handleUnlock);
  resetBtn.addEventListener("click", handleReset);

  fullNameInput.addEventListener("input", () => {
    appState.fullName = fullNameInput.value.trim();
    saveState();
    renderCertificate();
    renderStatus();
  });

  [pw1Input, pw2Input, pw3Input].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleUnlock();
      }
    });
  });
}

function handleUnlock() {
  const fullName = fullNameInput.value.trim();
  const p1 = normalizeValue(pw1Input.value);
  const p2 = normalizeValue(pw2Input.value);
  const p3 = normalizeValue(pw3Input.value);

  clearMessage();

  if (!fullName) {
    showMessage("Bitte gib zuerst deinen Vor- und Nachnamen ein.", "error");
    fullNameInput.focus();
    return;
  }

  if (!p1 && !p2 && !p3) {
    showMessage("Bitte gib die Passwörter ein.", "error");
    return;
  }

  appState.fullName = fullName;

  const allCorrect =
    p1 === normalizeValue(PASSWORD_1) &&
    p2 === normalizeValue(PASSWORD_2) &&
    p3 === normalizeValue(PASSWORD_3);

  if (allCorrect) {
    appState.unlocked = true;
    showMessage("Das Zertifikat wurde erfolgreich freigeschaltet.", "success");
  } else {
    appState.unlocked = false;
    showMessage("Die eingegebenen Passwörter sind nicht korrekt.", "error");
  }

  saveState();
  renderAll();

  pw1Input.value = "";
  pw2Input.value = "";
  pw3Input.value = "";
}

function handleReset() {
  appState = {
    fullName: "",
    unlocked: false
  };

  fullNameInput.value = "";
  pw1Input.value = "";
  pw2Input.value = "";
  pw3Input.value = "";
  clearMessage();
  saveState();
  renderAll();
  showMessage("Alle gespeicherten Daten wurden zurückgesetzt.", "info");
}

function renderAll() {
  fullNameInput.value = appState.fullName || "";
  renderStatus();
  renderCertificate();
}

function renderStatus() {
  statusCard.classList.toggle("unlocked", appState.unlocked);
  statusBadge.classList.toggle("unlocked", appState.unlocked);
  statusBadge.classList.toggle("locked", !appState.unlocked);
  statusBadge.textContent = appState.unlocked ? "Freigeschaltet" : "Gesperrt";
  statusText.textContent = appState.unlocked
    ? `Freigeschaltet für ${appState.fullName || "den Lernenden"}`
    : "Noch nicht freigeschaltet";
}

function renderCertificate() {
  certificateHost.innerHTML = "";

  if (!appState.fullName) {
    certificateHost.innerHTML = '<div class="empty-state">Gib zuerst deinen Namen ein und schalte dann das Zertifikat frei.</div>';
    return;
  }

  if (!appState.unlocked) {
    certificateHost.innerHTML = '<div class="empty-state">Das Zertifikat ist noch nicht freigeschaltet.</div>';
    return;
  }

  const fragment = certificateTemplate.content.cloneNode(true);

  fragment.getElementById("studentName").textContent = appState.fullName;
  fragment.getElementById("certDate").textContent = formatDate(new Date());

  const signalHost = fragment.getElementById("signalName");
  signalHost.appendChild(buildSignalName(appState.fullName));

  fragment.getElementById("exportBtn").addEventListener("click", exportCertificateToPrint);

  certificateHost.appendChild(fragment);
}

function buildSignalName(name) {
  const wrapper = document.createDocumentFragment();

  for (const char of name) {
    if (char === " ") {
      const spacer = document.createElement("div");
      spacer.className = "flag-letter-stack space";
      wrapper.appendChild(spacer);
      continue;
    }

    const stack = document.createElement("div");
    stack.className = "flag-letter-stack";

    const normalized = normalizeSignalChar(char);

    const flag = document.createElement("div");
    flag.className = "signal-flag";
    flag.innerHTML = getSignalFlagSVG(normalized);
    stack.appendChild(flag);

    wrapper.appendChild(stack);
  }

  return wrapper;
}

function normalizeSignalChar(char) {
  const c = char.toUpperCase();
  const map = {
    "Ä": "A",
    "Ö": "O",
    "Ü": "U",
    "É": "E",
    "È": "E",
    "Ê": "E",
    "À": "A",
    "Á": "A",
    "Â": "A",
    "Î": "I",
    "Ï": "I",
    "Ô": "O",
    "Û": "U",
    "Ç": "C",
    "-": "-"
  };

  return map[c] || c;
}

function getSignalFlagSVG(letter) {
  const defs = {
    A: svgA(),
    B: svgB(),
    C: svgC(),
    D: svgD(),
    E: svgE(),
    F: svgF(),
    G: svgG(),
    H: svgH(),
    I: svgI(),
    J: svgJ(),
    K: svgK(),
    L: svgL(),
    M: svgM(),
    N: svgN(),
    O: svgO(),
    P: svgP(),
    Q: svgQ(),
    R: svgR(),
    S: svgS(),
    T: svgT(),
    U: svgU(),
    V: svgV(),
    W: svgW(),
    X: svgX(),
    Y: svgY(),
    Z: svgZ(),
    "-": svgDash()
  };

  return defs[letter] || svgFallback(letter);
}

function svgOpen() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">';
}

function svgClose() {
  return "</svg>";
}

function svgA() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <polygon points="50,0 100,0 100,100 50,100 72,50" fill="#0b39c7"/>
  ${svgClose()}`;
}

function svgB() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ff1d12"/>
    <polygon points="100,0 78,50 100,100" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgC() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect y="0" width="100" height="20" fill="#173bbd"/>
    <rect y="20" width="100" height="20" fill="#ffffff"/>
    <rect y="40" width="100" height="20" fill="#ff2222"/>
    <rect y="60" width="100" height="20" fill="#ffffff"/>
    <rect y="80" width="100" height="20" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgD() {
  return `${svgOpen()}
    <rect width="100" height="50" fill="#163ab8"/>
    <rect y="50" width="100" height="50" fill="#f0dd19"/>
  ${svgClose()}`;
}

function svgE() {
  return `${svgOpen()}
    <rect width="100" height="50" fill="#173bbd"/>
    <rect y="50" width="100" height="50" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgF() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <polygon points="50,0 100,50 50,100 0,50" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgG() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f0dd19"/>
    <rect x="16" width="16" height="100" fill="#173bbd"/>
    <rect x="42" width="16" height="100" fill="#173bbd"/>
    <rect x="68" width="16" height="100" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgH() {
  return `${svgOpen()}
    <rect width="50" height="100" fill="#ffffff"/>
    <rect x="50" width="50" height="100" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgI() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f0dd19"/>
    <circle cx="50" cy="50" r="22" fill="#111111"/>
  ${svgClose()}`;
}

function svgJ() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect y="0" width="100" height="25" fill="#173bbd"/>
    <rect y="75" width="100" height="25" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgK() {
  return `${svgOpen()}
    <rect width="50" height="100" fill="#f0dd19"/>
    <rect x="50" width="50" height="100" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgL() {
  return `${svgOpen()}
    <rect width="50" height="50" fill="#f0dd19"/>
    <rect x="50" width="50" height="50" fill="#111111"/>
    <rect y="50" width="50" height="50" fill="#111111"/>
    <rect x="50" y="50" width="50" height="50" fill="#f0dd19"/>
  ${svgClose()}`;
}

function svgM() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#173bbd"/>
    <polygon points="0,0 20,0 100,80 100,100 80,100 0,20" fill="#ffffff"/>
    <polygon points="100,0 80,0 0,80 0,100 20,100 100,20" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgN() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect x="20" y="0" width="20" height="20" fill="#173bbd"/>
    <rect x="60" y="0" width="20" height="20" fill="#173bbd"/>
    <rect x="0" y="20" width="20" height="20" fill="#173bbd"/>
    <rect x="40" y="20" width="20" height="20" fill="#173bbd"/>
    <rect x="80" y="20" width="20" height="20" fill="#173bbd"/>
    <rect x="20" y="40" width="20" height="20" fill="#173bbd"/>
    <rect x="60" y="40" width="20" height="20" fill="#173bbd"/>
    <rect x="0" y="60" width="20" height="20" fill="#173bbd"/>
    <rect x="40" y="60" width="20" height="20" fill="#173bbd"/>
    <rect x="80" y="60" width="20" height="20" fill="#173bbd"/>
    <rect x="20" y="80" width="20" height="20" fill="#173bbd"/>
    <rect x="60" y="80" width="20" height="20" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgO() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f0dd19"/>
    <polygon points="0,0 100,100 100,0" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgP() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#173bbd"/>
    <rect x="20" y="20" width="60" height="60" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgQ() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f0dd19"/>
  ${svgClose()}`;
}

function svgR() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ff2323"/>
    <rect x="38" width="24" height="100" fill="#f0dd19"/>
    <rect y="38" width="100" height="24" fill="#f0dd19"/>
  ${svgClose()}`;
}

function svgS() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect x="25" y="25" width="50" height="50" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgT() {
  return `${svgOpen()}
    <rect width="33.333" height="100" x="0" fill="#ff2323"/>
    <rect width="33.333" height="100" x="33.333" fill="#ffffff"/>
    <rect width="33.334" height="100" x="66.666" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgU() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect width="50" height="50" x="0" y="0" fill="#ff2323"/>
    <rect width="50" height="50" x="50" y="50" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgV() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <polygon points="0,12 12,0 100,88 88,100" fill="#ff2323"/>
    <polygon points="88,0 100,12 12,100 0,88" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgW() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#173bbd"/>
    <rect x="16" y="16" width="68" height="68" fill="#ffffff"/>
    <rect x="35" y="35" width="30" height="30" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgX() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect x="40" width="20" height="100" fill="#173bbd"/>
    <rect y="40" width="100" height="20" fill="#173bbd"/>
  ${svgClose()}`;
}

function svgY() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f0dd19"/>
    <polygon points="20,0 36,0 100,100 84,100" fill="#ff2323"/>
    <polygon points="56,0 72,0 100,44 100,76" fill="#ff2323"/>
    <polygon points="0,24 0,0 4,0 68,100 52,100" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgZ() {
  return `${svgOpen()}
    <polygon points="50,50 0,0 50,0" fill="#f0dd19"/>
    <polygon points="50,50 50,0 100,0" fill="#173bbd"/>
    <polygon points="50,50 100,0 100,50" fill="#111111"/>
    <polygon points="50,50 100,50 100,100" fill="#ff2323"/>
  ${svgClose()}`;
}

function svgDash() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect x="10" y="44" width="80" height="12" fill="#111111"/>
  ${svgClose()}`;
}

function svgFallback(letter) {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <text x="50" y="58" text-anchor="middle" font-size="42" font-family="Arial" fill="#111">${escapeXml(letter)}</text>
  ${svgClose()}`;
}

function buildSignalMarkupString(name) {
  let html = "";

  for (const char of name) {
    if (char === " ") {
      html += '<div class="stack space"></div>';
      continue;
    }

    const normalized = normalizeSignalChar(char);
    html += `<div class="stack"><div class="flag">${getSignalFlagSVG(normalized)}</div></div>`;
  }

  return html;
}

function exportCertificateToPrint() {
  const name = appState.fullName;
  const date = formatDate(new Date());
  const signalMarkup = buildSignalMarkupString(name);
  const baseHref = getBaseHref();

  const popup = window.open("", "_blank", "width=1200,height=900");

  if (!popup) {
    showMessage("Das Druckfenster konnte nicht geöffnet werden. Bitte Popups erlauben.", "error");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Klassenfunker/in Lizenz</title>
<base href="${baseHref}">
<style>
  @page { size: A4 landscape; margin: 0; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
  }

  .helper-bar {
    display: flex;
    gap: 12px;
    justify-content: center;
    align-items: center;
    padding: 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #ddd;
    position: sticky;
    top: 0;
  }

  .helper-btn {
    border: none;
    background: #1d5cff;
    color: #fff;
    padding: 12px 18px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
  }

  .helper-btn.secondary {
    background: #e8eef8;
    color: #111;
  }

  .page {
    width: 297mm;
    min-height: 210mm;
    margin: 0 auto;
    background: #fff;
  }

  .paper {
    width: 297mm;
    height: 210mm;
    position: relative;
    background-image: url("assets/Klassenfunkerlizenz.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    overflow: hidden;
  }

  .signal-name {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 37.7mm;
    width: 63%;
    min-height: 18mm;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 1.3mm;
    flex-wrap: wrap;
  }

  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 8.7mm;
  }

  .stack.space {
    min-width: 4.5mm;
  }

  .flag {
    width: 8.2mm;
    height: 8.2mm;
    border: .2mm solid rgba(0,0,0,.18);
    background: #fff;
  }

  .student-name {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 61.5mm;
    width: 64%;
    text-align: center;
    font-size: 20pt;
    font-weight: 700;
    color: #111;
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.1;
  }

  .cert-date {
    position: absolute;
    left: 56.3%;
    top: 168.4mm;
    width: 23%;
    text-align: left;
    font-size: 10pt;
    color: #666;
    line-height: 1;
    background: transparent;
  }

  @media print {
    .helper-bar {
      display: none !important;
    }
  }
</style>
</head>
<body>
  <div class="helper-bar">
    <button class="helper-btn" onclick="window.print()">Drucken / Als PDF speichern</button>
    <button class="helper-btn secondary" onclick="window.close()">Fenster schliessen</button>
  </div>

  <div class="page">
    <div class="paper">
      <div class="signal-name">${signalMarkup}</div>
      <div class="student-name">${escapeHtml(name)}</div>
      <div class="cert-date">${escapeHtml(date)}</div>
    </div>
  </div>

  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        window.print();
      }, 350);
    });

    window.addEventListener("afterprint", function () {
      setTimeout(function () {
        window.close();
      }, 200);
    });
  </script>
</body>
</html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}

function getBaseHref() {
  const href = window.location.href;
  return href.substring(0, href.lastIndexOf("/") + 1);
}

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

function showMessage(text, type = "info") {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message-box";
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    appState.fullName = typeof parsed.fullName === "string" ? parsed.fullName : "";
    appState.unlocked = !!parsed.unlocked;
  } catch (error) {
    console.error("Fehler beim Laden des Speicherstands:", error);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value);
}
