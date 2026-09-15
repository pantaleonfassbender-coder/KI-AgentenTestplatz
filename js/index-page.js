/* Startseite: Modulübersicht + Sitzungsanlage. */
(function () {
  // Modulkarten rendern
  const karten = document.getElementById("modulKarten");
  for (const id of Object.keys(window.TASK_MODULES)) {
    const m = window.TASK_MODULES[id];
    const el = document.createElement("div");
    el.className = "karte";
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.textContent = `${m.id} · ${m.funktion} · ${m.aufgabentyp}`;
    const h = document.createElement("h3");
    h.textContent = m.titel;
    const p = document.createElement("p");
    p.textContent = m.szenario.length > 160 ? m.szenario.slice(0, 157) + "…" : m.szenario;
    el.append(tag, h, p);
    karten.appendChild(el);
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
