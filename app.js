// =========================================================
// Funkerschule 15 – reine Zertifikats-App
// Nur Passwortprüfung, keine Hinweise auf die Passwörter in der UI
// =========================================================

// ---------------------------------------------------------
// PASSWÖRTER HIER INTERN ANPASSEN
// Diese Werte werden nirgends in der Oberfläche angezeigt.
// ---------------------------------------------------------
const PASSWORD_1 = "Speerli";
const PASSWORD_2 = "Untermosen";
const PASSWORD_3 = "Guglielmo Marconi";

// ---------------------------------------------------------
// localStorage
// ---------------------------------------------------------
const STORAGE_KEY = "funkerschule15_klassenfunkerlizenz_v2";

// ---------------------------------------------------------
// Zertifikatsdaten gemäss hochgeladener Vorlage
// Grundlage: Inhalt der Vorlage „Klassenfunkerlizenz.pptx“ :contentReference[oaicite:0]{index=0}
// ---------------------------------------------------------
const CERTIFICATE_DATA = {
  titleTop: "Klassenfunker/in",
  titleBottom: "Lizenz",
  canText: "kann:",
  sections: [
    {
      title: "Rechtliches & Technik",
      lines: [
        "Frequenzen korrekt und regelkonform nutzen",
        "erlaubte und verbotene Funknutzung sicher unterscheiden"
      ]
    },
    {
      title: "NATO-Buchstabieralphabet",
      lines: [
        "Wörter, Namen und Rufzeichen korrekt buchstabieren",
        "gehörte Buchstabierungen sicher verstehen"
      ]
    },
    {
      title: "Telegrafie & Morsen",
      lines: [
        "einfache Nachrichten in Morse senden",
        "Morsezeichen sicher erkennen und verstehen"
      ]
    },
    {
      title: "Praktische Anwendung & Funkdisziplin",
      lines: [
        "ein Handfunkgerät sicher bedienen",
        "Funkgespräche klar, kurz und regelkonform führen"
      ]
    }
  ],
  alphaLine: "Alpha Bravo Charlie",
  signature: "Kursleiter"
};

// ---------------------------------------------------------
// State
// ---------------------------------------------------------
let appState = {
  fullName: "",
  certificateUnlocked: false
};

// ---------------------------------------------------------
// DOM
// ---------------------------------------------------------
const fullNameInput = document.getElementById("fullName");
const pw1Input = document.getElementById("pw1");
const pw2Input = document.getElementById("pw2");
const pw3Input = document.getElementById("pw3");
const checkBtn = document.getElementById("checkBtn");
const resetBtn = document.getElementById("resetBtn");
const messageBox = document.getElementById("messageBox");
const certificatesContainer = document.getElementById("certificatesContainer");
const certificateCardTemplate = document.getElementById("certificateCardTemplate");
const statusCard = document.getElementById("statusCard");
const statusText = document.getElementById("statusText");
const statusBadge = document.getElementById("statusBadge");

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
init();

function init() {
  loadState();
  bindEvents();
  renderAll();
}

function bindEvents() {
  checkBtn.addEventListener("click", handleCheckCertificate);
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
        handleCheckCertificate();
      }
    });
  });
}

// ---------------------------------------------------------
// Logik
// ---------------------------------------------------------
function handleCheckCertificate() {
  const fullName = fullNameInput.value.trim();
  const pw1 = normalizeValue(pw1Input.value);
  const pw2 = normalizeValue(pw2Input.value);
  const pw3 = normalizeValue(pw3Input.value);

  clearMessage();

  if (!fullName) {
    showMessage("Bitte gib zuerst deinen Vor- und Nachnamen ein.", "error");
    fullNameInput.focus();
    return;
  }

  if (!pw1 && !pw2 && !pw3) {
    showMessage("Bitte gib die Passwörter ein.", "error");
    return;
  }

  appState.fullName = fullName;

  const allCorrect =
    pw1 === normalizeValue(PASSWORD_1) &&
    pw2 === normalizeValue(PASSWORD_2) &&
    pw3 === normalizeValue(PASSWORD_3);

  if (allCorrect) {
    appState.certificateUnlocked = true;
    saveState();
    renderAll();
    showMessage("Das Zertifikat wurde erfolgreich freigeschaltet.", "success");
  } else {
    saveState();
    renderAll();
    showMessage("Die eingegebenen Passwörter sind nicht korrekt.", "error");
  }

  pw1Input.value = "";
  pw2Input.value = "";
  pw3Input.value = "";
}

function handleReset() {
  appState = {
    fullName: "",
    certificateUnlocked: false
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

// ---------------------------------------------------------
// Rendering
// ---------------------------------------------------------
function renderAll() {
  fullNameInput.value = appState.fullName || "";
  renderStatus();
  renderCertificate();
}

function renderStatus() {
  const unlocked = appState.certificateUnlocked;

  statusCard.classList.toggle("unlocked", unlocked);
  statusBadge.classList.toggle("unlocked", unlocked);
  statusBadge.classList.toggle("locked", !unlocked);
  statusBadge.textContent = unlocked ? "Freigeschaltet" : "Gesperrt";

  if (unlocked) {
    statusText.textContent = `Freigeschaltet für ${appState.fullName || "den Lernenden"}`;
  } else {
    statusText.textContent = "Noch nicht freigeschaltet";
  }
}

function renderCertificate() {
  certificatesContainer.innerHTML = "";

  if (!appState.fullName) {
    certificatesContainer.innerHTML = `
      <div class="empty-state">
        <p>Gib zuerst deinen Vor- und Nachnamen ein.</p>
      </div>
    `;
    return;
  }

  if (!appState.certificateUnlocked) {
    certificatesContainer.innerHTML = `
      <div class="empty-state">
        <p>Das Zertifikat ist noch nicht freigeschaltet.</p>
      </div>
    `;
    return;
  }

  const fragment = certificateCardTemplate.content.cloneNode(true);

  fragment.querySelector(".cert-name").textContent = appState.fullName;
  fragment.querySelector(".cert-date").textContent = formatDate(new Date());

  const exportBtn = fragment.querySelector(".export-btn");
  exportBtn.addEventListener("click", exportCertificateToPrint);

  certificatesContainer.appendChild(fragment);
}

// ---------------------------------------------------------
// Druck / PDF-Export
// ---------------------------------------------------------
function exportCertificateToPrint() {
  if (!appState.certificateUnlocked || !appState.fullName) {
    showMessage("Das Zertifikat ist noch nicht verfügbar.", "error");
    return;
  }

  const printWindow = window.open("", "_blank", "width=1000,height=1400");

  if (!printWindow) {
    showMessage("Das Druckfenster konnte nicht geöffnet werden. Bitte Popups erlauben.", "error");
    return;
  }

  const dateString = formatDate(new Date());
  const escapedName = escapeHtml(appState.fullName);

  const printHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Klassenfunker Lizenz</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      color: #111;
    }

    .helper-bar {
      display: flex;
      gap: 12px;
      justify-content: center;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #ddd;
      background: #f7f7f7;
      position: sticky;
      top: 0;
    }

    .helper-btn {
      border: none;
      background: #1b5cff;
      color: #fff;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
    }

    .helper-btn.secondary {
      background: #e9eef8;
      color: #111;
    }

    .print-root {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: #fff;
    }

    .print-certificate {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 12mm 10mm 10mm;
      border: 2mm solid #111;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      text-align: center;
      color: #111;
      background: #fff;
    }

    .print-license-title {
      font-size: 24pt;
      font-weight: 800;
      line-height: 1.1;
    }

    .print-license-subtitle {
      font-size: 19pt;
      font-weight: 700;
      margin-top: 2mm;
      margin-bottom: 8mm;
    }

    .print-name {
      font-size: 20pt;
      font-weight: 800;
      margin: 2mm 0 8mm;
      padding-bottom: 3mm;
      border-bottom: 0.5mm solid #111;
    }

    .print-can {
      font-size: 12pt;
      font-weight: 700;
      margin-bottom: 4mm;
    }

    .print-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm;
      text-align: left;
    }

    .print-box {
      border: 0.5mm solid #111;
      padding: 4mm;
      min-height: 43mm;
    }

    .print-box h3 {
      margin: 0 0 2.5mm;
      font-size: 10.5pt;
      line-height: 1.15;
    }

    .print-box p {
      margin: 0 0 2mm;
      font-size: 8.9pt;
      line-height: 1.28;
    }

    .print-alpha-line {
      margin-top: 8mm;
      font-size: 17pt;
      font-weight: 800;
      letter-spacing: 0.06em;
    }

    .print-footer {
      margin-top: auto;
      padding-top: 10mm;
      display: flex;
      justify-content: space-between;
      gap: 6mm;
      align-items: flex-end;
    }

    .print-signature,
    .print-date {
      width: 42%;
      border-top: 0.4mm solid #333;
      padding-top: 4mm;
      font-size: 10pt;
      font-weight: 700;
      text-align: center;
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

  <div class="print-root">
    <div class="print-certificate">
      <div class="print-license-title">Klassenfunker/in</div>
      <div class="print-license-subtitle">Lizenz</div>

      <div class="print-name">${escapedName}</div>

      <div class="print-can">kann:</div>

      <div class="print-grid">
        <div class="print-box">
          <h3>Rechtliches &amp; Technik</h3>
          <p>Frequenzen korrekt und regelkonform nutzen</p>
          <p>erlaubte und verbotene Funknutzung sicher unterscheiden</p>
        </div>

        <div class="print-box">
          <h3>NATO-Buchstabieralphabet</h3>
          <p>Wörter, Namen und Rufzeichen korrekt buchstabieren</p>
          <p>gehörte Buchstabierungen sicher verstehen</p>
        </div>

        <div class="print-box">
          <h3>Telegrafie &amp; Morsen</h3>
          <p>einfache Nachrichten in Morse senden</p>
          <p>Morsezeichen sicher erkennen und verstehen</p>
        </div>

        <div class="print-box">
          <h3>Praktische Anwendung &amp; Funkdisziplin</h3>
          <p>ein Handfunkgerät sicher bedienen</p>
          <p>Funkgespräche klar, kurz und regelkonform führen</p>
        </div>
      </div>

      <div class="print-alpha-line">Alpha Bravo Charlie</div>

      <div class="print-footer">
        <div class="print-signature">Kursleiter</div>
        <div class="print-date">${escapeHtml(dateString)}</div>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        window.print();
      }, 250);
    });

    window.addEventListener("afterprint", function () {
      setTimeout(function () {
        window.close();
      }, 200);
    });
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(printHtml);
  printWindow.document.close();
}

// ---------------------------------------------------------
// localStorage
// ---------------------------------------------------------
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    appState.fullName = typeof parsed.fullName === "string" ? parsed.fullName : "";
    appState.certificateUnlocked = !!parsed.certificateUnlocked;
  } catch (error) {
    console.error("Fehler beim Laden des Speicherstands:", error);
  }
}

// ---------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
