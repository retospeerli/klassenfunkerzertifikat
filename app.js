const STORAGE_KEY = "funkerschule15_final_cert_v1";

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

    const letter = document.createElement("div");
    letter.className = "signal-char";
    letter.textContent = char.toUpperCase();
    stack.appendChild(letter);

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
  return '<svg viewBox="0 0 38 58" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">';
}

function svgPole() {
  return '<rect x="1" y="0" width="2" height="58" fill="#444"/>';
}

function svgClose() {
  return "</svg>";
}

function svgA() {
  return `${svgOpen()}${svgPole()}
    <path d="M3 4H35L19 29L35 54H3Z" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <path d="M19 29L35 4V54Z" fill="#1d62ff"/>
  ${svgClose()}`;
}

function svgB() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#d81f26" stroke="#000" stroke-width="1.2"/>
  ${svgClose()}`;
}

function svgC() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#1d62ff" stroke="#000" stroke-width="1.2"/>
    <rect x="11" y="4" width="16" height="50" fill="#ffffff"/>
    <rect x="3" y="17" width="32" height="24" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgD() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <rect x="19" y="4" width="16" height="50" fill="#1d62ff"/>
  ${svgClose()}`;
}

function svgE() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#1d62ff" stroke="#000" stroke-width="1.2"/>
    <path d="M3 4L35 54M35 4L3 54" stroke="#d81f26" stroke-width="6"/>
  ${svgClose()}`;
}

function svgF() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <path d="M3 4L35 54M35 4L3 54" stroke="#d81f26" stroke-width="6"/>
  ${svgClose()}`;
}

function svgG() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <rect x="3" y="4" width="16" height="25" fill="#1d62ff"/>
    <rect x="19" y="29" width="16" height="25" fill="#1d62ff"/>
  ${svgClose()}`;
}

function svgH() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <rect x="19" y="4" width="16" height="25" fill="#d81f26"/>
    <rect x="3" y="29" width="16" height="25" fill="#d81f26"/>
  ${svgClose()}`;
}

function svgI() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <circle cx="19" cy="29" r="9" fill="#000"/>
  ${svgClose()}`;
}

function svgJ() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#1d62ff" stroke="#000" stroke-width="1.2"/>
    <rect x="3" y="4" width="16" height="25" fill="#ffffff"/>
    <rect x="19" y="29" width="16" height="25" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgK() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <rect x="3" y="4" width="16" height="25" fill="#1d62ff"/>
    <rect x="19" y="29" width="16" height="25" fill="#1d62ff"/>
  ${svgClose()}`;
}

function svgL() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <path d="M3 4L35 54M35 4L3 54" stroke="#000" stroke-width="5"/>
  ${svgClose()}`;
}

function svgM() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#1d62ff" stroke="#000" stroke-width="1.2"/>
    <path d="M3 4L35 54M35 4L3 54" stroke="#ffffff" stroke-width="6"/>
  ${svgClose()}`;
}

function svgN() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <path d="M3 4L35 54M35 4L3 54" stroke="#1d62ff" stroke-width="6"/>
  ${svgClose()}`;
}

function svgO() {
  return `${svgOpen()}${svgPole()}
    <path d="M3 4H35L19 29L35 54H3L19 29Z" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
  ${svgClose()}`;
}

function svgP() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#1d62ff" stroke="#000" stroke-width="1.2"/>
    <rect x="3" y="4" width="16" height="25" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgQ() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <rect x="3" y="4" width="16" height="25" fill="#000"/>
    <rect x="19" y="29" width="16" height="25" fill="#000"/>
  ${svgClose()}`;
}

function svgR() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#d81f26" stroke="#000" stroke-width="1.2"/>
    <path d="M3 4L35 54M35 4L3 54" stroke="#f1d41a" stroke-width="6"/>
  ${svgClose()}`;
}

function svgS() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <rect x="11" y="4" width="16" height="50" fill="#1d62ff"/>
  ${svgClose()}`;
}

function svgT() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#d81f26" stroke="#000" stroke-width="1.2"/>
    <rect x="11" y="4" width="16" height="50" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgU() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <rect x="3" y="4" width="16" height="25" fill="#d81f26"/>
    <rect x="19" y="29" width="16" height="25" fill="#d81f26"/>
  ${svgClose()}`;
}

function svgV() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <path d="M19 4L35 29L19 54L3 29Z" fill="#d81f26"/>
  ${svgClose()}`;
}

function svgW() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#1d62ff" stroke="#000" stroke-width="1.2"/>
    <rect x="11" y="17" width="16" height="24" fill="#ffffff"/>
  ${svgClose()}`;
}

function svgX() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <path d="M19 4L35 29L19 54L3 29Z" fill="#1d62ff"/>
  ${svgClose()}`;
}

function svgY() {
  return `${svgOpen()}${svgPole()}
    <path d="M3 4H35L19 29L35 54H3L19 29Z" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <path d="M19 4L35 29L19 54L3 29Z" fill="#d81f26"/>
  ${svgClose()}`;
}

function svgZ() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#f1d41a" stroke="#000" stroke-width="1.2"/>
    <path d="M3 4L35 54M35 4L3 54" stroke="#1d62ff" stroke-width="6"/>
  ${svgClose()}`;
}

function svgDash() {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="26" width="32" height="6" fill="#111"/>
  ${svgClose()}`;
}

function svgFallback(letter) {
  return `${svgOpen()}${svgPole()}
    <rect x="3" y="4" width="32" height="50" fill="#ffffff" stroke="#000" stroke-width="1.2"/>
    <text x="19" y="34" text-anchor="middle" font-size="18" font-family="Arial" fill="#111">${escapeXml(letter)}</text>
  ${svgClose()}`;
}

function exportCertificateToPrint() {
  const name = appState.fullName;
  const date = formatDate(new Date());
  const signalMarkup = buildSignalMarkupString(name);
  const baseHref = getBaseHref();

  const popup = window.open("", "_blank", "width=1100,height=1500");

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
  @page { size: A4 portrait; margin: 0; }
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
    background: #1c5cff;
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
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: #fff;
  }
  .paper {
    width: 210mm;
    min-height: 297mm;
    background: #fffdf7;
    border: 2.2mm solid #111;
    box-sizing: border-box;
    padding: 10mm 10mm 8mm;
    position: relative;
  }
  .paper:before {
    content: "";
    position: absolute;
    inset: 5mm;
    border: .5mm solid #111;
  }
  .content {
    position: relative;
    z-index: 1;
  }
  .logos {
    display: grid;
    grid-template-columns: 28mm 1fr 38mm;
    align-items: center;
    gap: 4mm;
  }
  .logos img {
    display: block;
    object-fit: contain;
    max-width: 100%;
  }
  .diamond {
    width: 18mm;
  }
  .denkschule {
    height: 10mm;
    justify-self: center;
  }
  .wave {
    width: 34mm;
    justify-self: end;
  }
  .title-main {
    text-align: center;
    font-size: 24pt;
    font-weight: 800;
    line-height: 1.08;
    margin-top: 1mm;
  }
  .title-sub {
    text-align: center;
    font-size: 18pt;
    font-weight: 800;
    margin-top: 1mm;
  }
  .signal-name {
    margin-top: 5mm;
    min-height: 24mm;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 1.4mm;
    flex-wrap: wrap;
  }
  .stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1mm;
    min-width: 11mm;
  }
  .stack.space {
    min-width: 4mm;
  }
  .flag {
    width: 10mm;
    height: 15mm;
    border: .2mm solid rgba(0,0,0,.2);
    background: #fff;
  }
  .char {
    font-size: 7pt;
    font-weight: 700;
  }
  .name {
    text-align: center;
    font-size: 19pt;
    font-weight: 800;
    border-bottom: .45mm solid #111;
    padding-bottom: 2mm;
    margin: 2mm auto 4mm;
    max-width: 150mm;
  }
  .can {
    font-size: 11pt;
    font-weight: 700;
    margin-bottom: 3mm;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3mm;
  }
  .box {
    border: .45mm solid #111;
    border-radius: 2mm;
    padding: 3mm;
    min-height: 42mm;
    background: rgba(255,255,255,.9);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 3mm;
    margin-bottom: 2.5mm;
  }
  .head img {
    width: 12mm;
    height: 12mm;
    object-fit: contain;
    flex: 0 0 auto;
  }
  .head h3 {
    margin: 0;
    font-size: 9.5pt;
    line-height: 1.15;
  }
  .box ul {
    margin: 0;
    padding-left: 5mm;
  }
  .box li {
    font-size: 8.1pt;
    line-height: 1.28;
    margin-bottom: 2mm;
  }
  .abc {
    margin-top: 4.5mm;
    text-align: center;
    font-size: 15pt;
    font-weight: 800;
    letter-spacing: .06em;
  }
  .footer {
    margin-top: 7mm;
    display: flex;
    justify-content: space-between;
    gap: 6mm;
    align-items: flex-end;
  }
  .sign {
    width: 42%;
    text-align: center;
    padding-top: 3mm;
    border-top: .35mm solid #222;
    font-size: 10pt;
    font-weight: 700;
  }
  @media print {
    .helper-bar { display: none !important; }
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
      <div class="content">
        <div class="logos">
          <img class="diamond" src="assets/logo-diamond.png" alt="" />
          <img class="denkschule" src="assets/logo-denkschule.png" alt="" />
          <img class="wave" src="assets/logo-wave.jpg" alt="" />
        </div>

        <div class="title-main">Klassenfunker/in</div>
        <div class="title-sub">Lizenz</div>

        <div class="signal-name">${signalMarkup}</div>
        <div class="name">${escapeHtml(name)}</div>

        <div class="can">kann:</div>

        <div class="grid">
          <div class="box">
            <div class="head">
              <img src="assets/icon-law.png" alt="" />
              <h3>Rechtliches &amp; Technik</h3>
            </div>
            <ul>
              <li>Frequenzen korrekt und regelkonform nutzen</li>
              <li>erlaubte und verbotene Funknutzung sicher unterscheiden</li>
            </ul>
          </div>

          <div class="box">
            <div class="head">
              <img src="assets/icon-tech.png" alt="" />
              <h3>NATO-Buchstabieralphabet</h3>
            </div>
            <ul>
              <li>Wörter, Namen und Rufzeichen korrekt buchstabieren</li>
              <li>gehörte Buchstabierungen sicher verstehen</li>
            </ul>
          </div>

          <div class="box">
            <div class="head">
              <img src="assets/icon-radio.png" alt="" />
              <h3>Telegrafie &amp; Morsen</h3>
            </div>
            <ul>
              <li>einfache Nachrichten in Morse senden</li>
              <li>Morsezeichen sicher erkennen und verstehen</li>
            </ul>
          </div>

          <div class="box">
            <div class="head">
              <img src="assets/icon-radio.png" alt="" />
              <h3>Praktische Anwendung &amp; Funkdisziplin</h3>
            </div>
            <ul>
              <li>ein Handfunkgerät sicher bedienen</li>
              <li>Funkgespräche klar, kurz und regelkonform führen</li>
            </ul>
          </div>
        </div>

        <div class="abc">Alpha Bravo Charlie</div>

        <div class="footer">
          <div class="sign">Kursleiter</div>
          <div class="sign">${escapeHtml(date)}</div>
        </div>
      </div>
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

function buildSignalMarkupString(name) {
  let html = "";

  for (const char of name) {
    if (char === " ") {
      html += '<div class="stack space"></div>';
      continue;
    }

    const normalized = normalizeSignalChar(char);
    html += `<div class="stack"><div class="flag">${getSignalFlagSVG(normalized)}</div><div class="char">${escapeHtml(char.toUpperCase())}</div></div>`;
  }

  return html;
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
