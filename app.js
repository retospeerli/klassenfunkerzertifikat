/* =========================================================
   FUNKERSCHULE 15 – ZERTIFIKATS-APP
   ---------------------------------------------------------
   Zweck:
   - Kein Quiz, keine Lernkarten.
   - Lernende geben Namen und vier Passwörter ein.
   - Sind alle Passwörter korrekt, wird ein Zertifikat freigeschaltet.
   - Das Zertifikat nutzt assets/Klassenfunkerlizenz.jpg als Hintergrund.
   - Signalflaggen werden als SVG direkt im Code erzeugt.
   - PDF-Export öffnet ein Druckfenster und wartet, bis das JPG geladen ist.

   Wichtige Datei:
   /assets/Klassenfunkerlizenz.jpg
   ========================================================= */


/* =========================================================
   KONFIGURATION: LOCALSTORAGE
   ---------------------------------------------------------
   Wenn du alte gespeicherte Freischaltungen löschen willst:
   - entweder Browserdaten löschen
   - oder STORAGE_KEY umbenennen
   ========================================================= */

const STORAGE_KEY = "funkerschule15_cert_bg_final_v6";


/* =========================================================
   KONFIGURATION: INTERNE PASSWÖRTER
   ---------------------------------------------------------
   Diese Passwörter erscheinen nirgends in der Benutzeroberfläche.
   Vergleich:
   - Passwort 1–3: Gross-/Kleinschreibung wird ignoriert.
   - Passwort 4: Gross-/Kleinschreibung UND Wortabstände werden ignoriert.
   ========================================================= */

const PASSWORD_1 = "Speerli";
const PASSWORD_2 = "Untermosen";
const PASSWORD_3 = "Guglielmo Marconi";
const PASSWORD_4 = "Heinrich Hertz";


/* =========================================================
   APP-ZUSTAND
   ========================================================= */

let appState = {
  fullName: "",
  unlocked: false
};


/* =========================================================
   DOM-ELEMENTE
   ========================================================= */

const fullNameInput = document.getElementById("fullName");

const pw1Input = document.getElementById("pw1");
const pw2Input = document.getElementById("pw2");
const pw3Input = document.getElementById("pw3");
const pw4Input = document.getElementById("pw4");

const unlockBtn = document.getElementById("unlockBtn");
const resetBtn = document.getElementById("resetBtn");

const messageBox = document.getElementById("messageBox");

const certificateHost = document.getElementById("certificateHost");
const certificateTemplate = document.getElementById("certificateTemplate");

const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");
const statusBadge = document.getElementById("statusBadge");


/* =========================================================
   START DER APP
   ========================================================= */

init();

function init() {
  loadState();
  bindEvents();
  renderAll();
}


/* =========================================================
   EVENT-LISTENER
   ========================================================= */

function bindEvents() {
  unlockBtn.addEventListener("click", handleUnlock);
  resetBtn.addEventListener("click", handleReset);

  fullNameInput.addEventListener("input", () => {
    appState.fullName = fullNameInput.value.trim();
    saveState();
    renderStatus();
    renderCertificate();
  });

  [pw1Input, pw2Input, pw3Input, pw4Input].forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        handleUnlock();
      }
    });
  });
}


/* =========================================================
   PASSWÖRTER PRÜFEN
   ========================================================= */

function handleUnlock() {
  const fullName = fullNameInput.value.trim();

  const p1 = normalizeValue(pw1Input.value);
  const p2 = normalizeValue(pw2Input.value);
  const p3 = normalizeValue(pw3Input.value);
  const p4 = normalizeValueNoSpace(pw4Input.value);

  clearMessage();

  if (!fullName) {
    showMessage("Bitte gib zuerst deinen Vor- und Nachnamen ein.", "error");
    fullNameInput.focus();
    return;
  }

  if (!p1 && !p2 && !p3 && !p4) {
    showMessage("Bitte gib die Passwörter ein.", "error");
    return;
  }

  appState.fullName = fullName;

  const allCorrect =
    p1 === normalizeValue(PASSWORD_1) &&
    p2 === normalizeValue(PASSWORD_2) &&
    p3 === normalizeValue(PASSWORD_3) &&
    p4 === normalizeValueNoSpace(PASSWORD_4);

  if (allCorrect) {
    appState.unlocked = true;
    showMessage("Das Zertifikat wurde erfolgreich freigeschaltet.", "success");
  } else {
    appState.unlocked = false;
    showMessage("Die eingegebenen Passwörter sind nicht korrekt.", "error");
  }

  saveState();
  renderAll();

  clearPasswordFields();
}


/* =========================================================
   ZURÜCKSETZEN
   ========================================================= */

function handleReset() {
  appState = {
    fullName: "",
    unlocked: false
  };

  fullNameInput.value = "";
  clearPasswordFields();
  clearMessage();

  saveState();
  renderAll();

  showMessage("Alle gespeicherten Daten wurden zurückgesetzt.", "info");
}

function clearPasswordFields() {
  pw1Input.value = "";
  pw2Input.value = "";
  pw3Input.value = "";
  pw4Input.value = "";
}


/* =========================================================
   GESAMT-RENDERING
   ========================================================= */

function renderAll() {
  fullNameInput.value = appState.fullName || "";
  renderStatus();
  renderCertificate();
}


/* =========================================================
   STATUS ANZEIGEN
   ========================================================= */

function renderStatus() {
  statusCard.classList.toggle("unlocked", appState.unlocked);

  statusBadge.classList.toggle("unlocked", appState.unlocked);
  statusBadge.classList.toggle("locked", !appState.unlocked);

  statusBadge.textContent = appState.unlocked ? "Freigeschaltet" : "Gesperrt";

  statusText.textContent = appState.unlocked
    ? `Freigeschaltet für ${appState.fullName || "den Lernenden"}`
    : "Noch nicht freigeschaltet";
}


/* =========================================================
   ZERTIFIKAT IN DER VORSCHAU ANZEIGEN
   ========================================================= */

function renderCertificate() {
  certificateHost.innerHTML = "";

  if (!appState.fullName) {
    certificateHost.innerHTML =
      '<div class="empty-state">Gib zuerst deinen Namen ein und schalte dann das Zertifikat frei.</div>';
    return;
  }

  if (!appState.unlocked) {
    certificateHost.innerHTML =
      '<div class="empty-state">Das Zertifikat ist noch nicht freigeschaltet.</div>';
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


/* =========================================================
   SIGNALFLAGGEN: NAMEN IN FLAGGEN UMSETZEN
   ---------------------------------------------------------
   Wichtig:
   - Buchstaben unter den Flaggen werden NICHT angezeigt.
   - Leerzeichen erzeugen nur Abstand.
   - Umlaute werden auf Grundbuchstaben reduziert.
   ========================================================= */

function buildSignalName(name) {
  const wrapper = document.createDocumentFragment();

  for (const char of name) {
    if (char === " ") {
      const spacer = document.createElement("div");
      spacer.className = "flag-letter-stack space";
      wrapper.appendChild(spacer);
      continue;
    }

    const normalized = normalizeSignalChar(char);

    const stack = document.createElement("div");
    stack.className = "flag-letter-stack";

    const flag = document.createElement("div");
    flag.className = "signal-flag";
    flag.innerHTML = getSignalFlagSVG(normalized);

    stack.appendChild(flag);
    wrapper.appendChild(stack);
  }

  return wrapper;
}

function buildSignalMarkupString(name) {
  let html = "";

  for (const char of name) {
    if (char === " ") {
      html += '<div class="stack space"></div>';
      continue;
    }

    const normalized = normalizeSignalChar(char);

    html += `
      <div class="stack">
        <div class="flag">${getSignalFlagSVG(normalized)}</div>
      </div>
    `;
  }

  return html;
}


/* =========================================================
   SIGNALFLAGGEN: ZEICHEN NORMALISIEREN
   ========================================================= */

function normalizeSignalChar(char) {
  const c = String(char || "").toUpperCase();

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


/* =========================================================
   SIGNALFLAGGEN: A–Z ALS SVG
   ---------------------------------------------------------
   Die Flaggen sind direkt als SVG eingebettet.
   Vorteil:
   - offlinefähig
   - keine zusätzlichen Dateien
   - scharf im Druck/PDF
   ========================================================= */

function getSignalFlagSVG(letter) {
  const flags = {
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

  return flags[letter] || svgFallback(letter);
}

function svgOpen() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">';
}

function svgClose() {
  return "</svg>";
}

function svgA() {
  return `${svgOpen()}
    <rect width="50" height="100" fill="#ffffff"/>
    <rect x="50" width="50" height="100" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgB() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#d71920"/>
  ${svgClose()}`;
}

function svgC() {
  return `${svgOpen()}
    <rect y="0" width="100" height="20" fill="#1746b8"/>
    <rect y="20" width="100" height="20" fill="#ffffff"/>
    <rect y="40" width="100" height="20" fill="#d71920"/>
    <rect y="60" width="100" height="20" fill="#ffffff"/>
    <rect y="80" width="100" height="20" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgD() {
  return `${svgOpen()}
    <rect width="100" height="50" fill="#f2d21b"/>
    <rect y="50" width="100" height="50" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgE() {
  return `${svgOpen()}
    <rect width="100" height="50" fill="#1746b8"/>
    <rect y="50" width="100" height="50" fill="#d71920"/>
  ${svgClose()}`;
}

function svgF() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <polygon points="50,0 100,50 50,100 0,50" fill="#d71920"/>
  ${svgClose()}`;
}

function svgG() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f2d21b"/>
    <rect x="0" width="16.6" height="100" fill="#1746b8"/>
    <rect x="33.2" width="16.6" height="100" fill="#1746b8"/>
    <rect x="66.4" width="16.6" height="100" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgH() {
  return `${svgOpen()}
    <rect width="50" height="100" fill="#ffffff"/>
    <rect x="50" width="50" height="100" fill="#d71920"/>
  ${svgClose()}`;
}

function svgI() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f2d21b"/>
    <circle cx="50" cy="50" r="22" fill="#111111"/>
  ${svgClose()}`;
}

function svgJ() {
  return `${svgOpen()}
    <rect y="0" width="100" height="33.33" fill="#1746b8"/>
    <rect y="33.33" width="100" height="33.34" fill="#ffffff"/>
    <rect y="66.67" width="100" height="33.33" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgK() {
  return `${svgOpen()}
    <rect width="50" height="100" fill="#f2d21b"/>
    <rect x="50" width="50" height="100" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgL() {
  return `${svgOpen()}
    <rect width="50" height="50" fill="#f2d21b"/>
    <rect x="50" width="50" height="50" fill="#111111"/>
    <rect y="50" width="50" height="50" fill="#111111"/>
    <rect x="50" y="50" width="50" height="50" fill="#f2d21b"/>
  ${svgClose()}`;
}

function svgM() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#1746b8"/>
    <path d="M0,0 L100,100 M100,0 L0,100" stroke="#ffffff" stroke-width="18"/>
  ${svgClose()}`;
}

function svgN() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <path d="M0,0 L100,100 M100,0 L0,100" stroke="#1746b8" stroke-width="18"/>
  ${svgClose()}`;
}

function svgO() {
  return `${svgOpen()}
    <polygon points="0,0 100,0 0,100" fill="#f2d21b"/>
    <polygon points="100,0 100,100 0,100" fill="#d71920"/>
  ${svgClose()}`;
}

function svgP() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#1746b8"/>
    <rect x="25" y="25" width="50" height="50" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgQ() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f2d21b"/>
  ${svgClose()}`;
}

function svgR() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#d71920"/>
    <rect x="38" width="24" height="100" fill="#f2d21b"/>
    <rect y="38" width="100" height="24" fill="#f2d21b"/>
  ${svgClose()}`;
}

function svgS() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect x="25" y="25" width="50" height="50" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgT() {
  return `${svgOpen()}
    <rect x="0" width="33.33" height="100" fill="#d71920"/>
    <rect x="33.33" width="33.34" height="100" fill="#ffffff"/>
    <rect x="66.67" width="33.33" height="100" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgU() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect width="50" height="50" fill="#d71920"/>
    <rect x="50" y="50" width="50" height="50" fill="#d71920"/>
  ${svgClose()}`;
}

function svgV() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <path d="M0,0 L100,100 M100,0 L0,100" stroke="#d71920" stroke-width="18"/>
  ${svgClose()}`;
}

function svgW() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#1746b8"/>
    <rect x="20" y="20" width="60" height="60" fill="#ffffff"/>
    <rect x="38" y="38" width="24" height="24" fill="#d71920"/>
  ${svgClose()}`;
}

function svgX() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#ffffff"/>
    <rect x="40" width="20" height="100" fill="#1746b8"/>
    <rect y="40" width="100" height="20" fill="#1746b8"/>
  ${svgClose()}`;
}

function svgY() {
  return `${svgOpen()}
    <rect width="100" height="100" fill="#f2d21b"/>
    <path d="M0,0 L100,100 M100,0 L0,100" stroke="#d71920" stroke-width="18"/>
  ${svgClose()}`;
}

function svgZ() {
  return `${svgOpen()}
    <polygon points="0,0 50,0 50,50" fill="#f2d21b"/>
    <polygon points="50,0 100,0 50,50" fill="#1746b8"/>
    <polygon points="100,0 100,50 50,50" fill="#111111"/>
    <polygon points="100,50 100,100 50,50" fill="#d71920"/>
    <polygon points="100,100 50,100 50,50" fill="#f2d21b"/>
    <polygon points="50,100 0,100 50,50" fill="#1746b8"/>
    <polygon points="0,100 0,50 50,50" fill="#111111"/>
    <polygon points="0,50 0,0 50,50" fill="#d71920"/>
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


/* =========================================================
   PDF-EXPORT
   ---------------------------------------------------------
   Gewünschte aktuelle Anpassungen:
   - Nur im PDF:
     - Name des Lernenden tiefer setzen
     - Name ca. Faktor 1.5 grösser schreiben
     - Datum grösser schreiben
     - Datum weiter unten platzieren
   - Hintergrundbild wird als echtes IMG eingebunden.
   - Druck startet erst, wenn das JPG geladen ist.
   ========================================================= */

function exportCertificateToPrint() {
  const name = appState.fullName;
  const date = formatDate(new Date());
  const signalMarkup = buildSignalMarkupString(name);
  const bgUrl = `${getBaseHref()}assets/Klassenfunkerlizenz.jpg`;

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
<style>
  @page {
    size: A4 landscape;
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
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
    z-index: 20;
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
    height: 210mm;
    margin: 0 auto;
    background: #fff;
  }

  .paper {
    width: 297mm;
    height: 210mm;
    position: relative;
    overflow: hidden;
    background: #fff;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    width: 297mm;
    height: 210mm;
    object-fit: cover;
    z-index: 0;
    display: block;
  }

  /* PDF: Signalflaggen */
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

    z-index: 2;
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

  /*
     PDF: Name des Lernenden
     Änderung:
     - deutlich nach unten verschoben
     - ca. Faktor 1.5 grösser als vorher
  */
  .student-name {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 72mm;
    width: 80%;

    text-align: center;
    font-size: 30pt;
    font-weight: 700;
    color: #111;
    font-family: Georgia, "Times New Roman", serif;
    line-height: 1.1;

    z-index: 2;
  }

  /*
     PDF: Datum
     Änderung:
     - weiter nach unten gesetzt
     - grösser geschrieben
  */
  .cert-date {
    position: absolute;
    left: 56.3%;
    top: 169mm;
    width: 23%;

    text-align: left;
    font-size: 13pt;
    color: #666;
    line-height: 1;

    z-index: 2;
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
      <img id="bgImage" class="bg-image" src="${bgUrl}" alt="">
      <div class="signal-name">${signalMarkup}</div>
      <div class="student-name">${escapeHtml(name)}</div>
      <div class="cert-date">${escapeHtml(date)}</div>
    </div>
  </div>

  <script>
    const bg = document.getElementById("bgImage");

    function startPrint() {
      setTimeout(function () {
        window.print();
      }, 300);
    }

    if (bg.complete) {
      startPrint();
    } else {
      bg.addEventListener("load", startPrint, { once: true });
      bg.addEventListener("error", function () {
        alert("Das Hintergrundbild konnte im Druckfenster nicht geladen werden.");
      }, { once: true });
    }

    window.addEventListener("afterprint", function () {
      setTimeout(function () {
        window.close();
      }, 200);
    });
  <\/script>
</body>
</html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
}


/* =========================================================
   HILFSFUNKTIONEN: PFADE
   ========================================================= */

function getBaseHref() {
  const href = window.location.href;
  return href.substring(0, href.lastIndexOf("/") + 1);
}


/* =========================================================
   HILFSFUNKTIONEN: PASSWÖRTER NORMALISIEREN
   ========================================================= */

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeValueNoSpace(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}


/* =========================================================
   HILFSFUNKTIONEN: DATUM
   ========================================================= */

function formatDate(date) {
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}


/* =========================================================
   HILFSFUNKTIONEN: MELDUNGEN
   ========================================================= */

function showMessage(text, type = "info") {
  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.className = "message-box";
}


/* =========================================================
   HILFSFUNKTIONEN: LOCALSTORAGE
   ========================================================= */

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);

    appState.fullName = typeof parsed.fullName === "string"
      ? parsed.fullName
      : "";

    appState.unlocked = !!parsed.unlocked;
  } catch (error) {
    console.error("Fehler beim Laden des Speicherstands:", error);
  }
}


/* =========================================================
   HILFSFUNKTIONEN: HTML ESCAPING
   ========================================================= */

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
