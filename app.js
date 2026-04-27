const PW1 = "speerli";
const PW2 = "untermosen";
const PW3 = "guglielmo marconi";

const nameInput = document.getElementById("name");
const msg = document.getElementById("msg");
const container = document.getElementById("certContainer");

document.getElementById("check").onclick = () => {
  const name = nameInput.value.trim();
  const p1 = document.getElementById("pw1").value.toLowerCase().trim();
  const p2 = document.getElementById("pw2").value.toLowerCase().trim();
  const p3 = document.getElementById("pw3").value.toLowerCase().trim();

  if (!name) {
    msg.textContent = "Name fehlt";
    return;
  }

  if (p1 === PW1 && p2 === PW2 && p3 === PW3) {
    msg.textContent = "Zertifikat freigeschaltet";
    showCert(name);
  } else {
    msg.textContent = "Falsche Passwörter";
  }
};

function showCert(name) {
  container.innerHTML = "";
  const tpl = document.getElementById("certTemplate").content.cloneNode(true);

  tpl.getElementById("student").textContent = name;

  const flags = tpl.getElementById("flags");
  for (let c of name.toUpperCase()) {
    if (c === " ") continue;
    const el = document.createElement("div");
    el.className = "flag";
    el.innerHTML = simpleFlag(c);
    flags.appendChild(el);
  }

  tpl.getElementById("printBtn").onclick = () => printCert(name);

  container.appendChild(tpl);
}

function simpleFlag(letter) {
  return `<svg viewBox="0 0 100 100">
    <rect width="100" height="100" fill="white"/>
    <text x="50" y="60" text-anchor="middle" font-size="50">${letter}</text>
  </svg>`;
}

function printCert(name) {
  const win = window.open("", "_blank");

  win.document.write(`
  <html>
  <head>
  <style>
    @page { size: A4 landscape; margin: 0; }
    body { margin:0; }

    .paper {
      width: 297mm;
      height: 210mm;
      position: relative;
    }

    .bg {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .flags {
      position: absolute;
      top: 38mm;
      left: 50%;
      transform: translateX(-50%);
      display:flex;
      gap:2mm;
    }

    .flag {
      width: 8mm;
      height: 8mm;
    }

    .name {
      position:absolute;
      top:62mm;
      left:50%;
      transform:translateX(-50%);
      font-size:20pt;
      font-family:Georgia;
    }
  </style>
  </head>
  <body>

  <div class="paper">
    <img id="bg" class="bg" src="assets/Klassenfunkerlizenz.jpg">

    <div class="flags">
      ${name.split("").map(c => c===" "?"":`<div class="flag">${simpleFlag(c)}</div>`).join("")}
    </div>

    <div class="name">${name}</div>
  </div>

  <script>
    const img = document.getElementById("bg");
    img.onload = () => {
      setTimeout(() => window.print(), 200);
    };
  <\/script>

  </body>
  </html>
  `);

  win.document.close();
}
