/* Startseite: vollständige Moduldarstellung + Sitzungsanlage. */
(function () {
  // Aufgabenmodule im Volltext rendern
  const liste = document.getElementById("modulListe");
  for (const id of Object.keys(window.TASK_MODULES)) {
    const m = window.TASK_MODULES[id];
    const panel = document.createElement("div");
    panel.className = "panel";

    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent =
      `${m.id} · Managementfunktion: ${m.funktion} · ${m.aufgabentyp} · ` +
      `${m.struktur} · Richtwert ${m.dauerMin} Min.`;

    const h = document.createElement("h3");
    h.textContent = `${m.id} — ${m.titel}`;

    const sz = document.createElement("p");
    sz.textContent = m.szenario;

    const tbl = document.createElement("table");
    for (const [k, v] of m.eingabedaten) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = k;
      const td = document.createElement("td");
      td.textContent = v;
      tr.append(th, td);
      tbl.appendChild(tr);
    }

    const auftrag = document.createElement("div");
    auftrag.className = "hinweis";
    const b = document.createElement("strong");
    b.textContent = "Bearbeitungsauftrag: ";
    auftrag.append(b, document.createTextNode(m.auftrag));

    const raster = document.createElement("p");
    const rb = document.createElement("strong");
    rb.textContent = "Bewertungsraster (je 1–5): ";
    raster.append(rb, document.createTextNode(m.raster.join(" · ")));

    panel.append(tag, h, sz, tbl, auftrag, raster);
    liste.appendChild(panel);
  }

  const speicherStatus = document.getElementById("speicherStatus");
  if (!window.Store.available()) {
    speicherStatus.textContent =
      "Achtung: Browser-Speicher nicht verfügbar (privates Fenster?). Sitzungen können nicht gespeichert werden.";
    speicherStatus.classList.add("fehler");
  }

  document.getElementById("setupForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const status = document.getElementById("setupStatus");
    const code = document.getElementById("code").value.trim();
    if (!code) { status.textContent = "Bitte Teilnahmecode angeben."; status.classList.add("fehler"); return; }
    const session = window.Engine.createSession({
      code,
      provider: document.getElementById("provider").value,
      autonomyPlan: document.getElementById("autonomyPlan").value,
      rounds: parseInt(document.getElementById("rounds").value, 10) || 6,
    });
    if (!window.Store.put(session)) {
      status.textContent = "Speichern fehlgeschlagen — Browser-Speicher nicht verfügbar.";
      status.classList.add("fehler");
      return;
    }
    location.href = "study.html?session=" + encodeURIComponent(session.id);
  });
})();
