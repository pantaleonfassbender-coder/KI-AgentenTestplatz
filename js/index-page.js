/* Startseite: Rahmenmodell, Varianten, Sitzungsanlage, Modulkatalog. */
(function () {
  const $ = (id) => document.getElementById(id);
  const K = window.KATP;
  const { el } = K;

  // Dimensionen
  const dimBody = $("dimTabelle").querySelector("tbody");
  for (const id of K.DIM_IDS) {
    const tr = el("tr");
    tr.append(el("th", null, K.DIMENSIONEN[id].name), el("td", null, K.DIMENSIONEN[id].def));
    dimBody.appendChild(tr);
  }

  // Matrix Prüfmodul × Dimension
  const matrix = $("matrix");
  const thead = el("thead");
  const htr = el("tr");
  htr.appendChild(el("th", null, "Prüfmodul"));
  for (const id of K.DIM_IDS) htr.appendChild(el("th", null, K.DIMENSIONEN[id].name));
  thead.appendChild(htr);
  matrix.appendChild(thead);
  const mbody = el("tbody");
  for (const m of K.aktiveModule()) {
    const tr = el("tr");
    const th = el("th");
    th.append(el("div", null, m.titel), el("div", "status", `${m.kennung} · ${m.gegenstandsbereich} · ${m.aufgabentyp}`));
    tr.appendChild(th);
    for (const id of K.DIM_IDS) {
      const td = el("td");
      td.append(el("div", null, m.dimensionen[id].teilleistung), el("div", "status", m.dimensionen[id].gliederung));
      tr.appendChild(td);
    }
    mbody.appendChild(tr);
  }
  for (const g of K.GEPLANT) {
    const tr = el("tr", "geplant");
    const th = el("th");
    th.append(el("div", null, g.titel), el("div", "status", `in Vorbereitung · ${g.gegenstandsbereich} · ${g.aufgabentyp}`));
    tr.appendChild(th);
    const td = el("td", "status", "Zuordnung folgt mit dem Modul.");
    td.colSpan = K.DIM_IDS.length;
    tr.appendChild(td);
    mbody.appendChild(tr);
  }
  matrix.appendChild(mbody);

  // Varianten
  const vBody = $("variantenTabelle").querySelector("tbody");
  for (const v of Object.values(K.VARIANTEN)) {
    const tr = el("tr");
    tr.append(el("th", null, v.name), el("td", null, v.beschreibung));
    vBody.appendChild(tr);
  }

  // Formular
  const modSel = $("modul");
  for (const m of K.aktiveModule()) {
    const op = el("option", null, `${m.titel} (${m.kennung}, ${m.zeit.richtMin}–${m.zeit.limitMin} Min.)`);
    op.value = m.id;
    modSel.appendChild(op);
  }
  const varSel = $("variante");
  const zuf = el("option", null, "Zufällig zuweisen (ausgewogen je Gerät und Modul)");
  zuf.value = "zufall";
  varSel.appendChild(zuf);
  for (const v of Object.values(K.VARIANTEN)) {
    const op = el("option", null, `${v.name} — ${v.kurz}`);
    op.value = v.id;
    varSel.appendChild(op);
  }
  const syncProvider = () => {
    $("provider").disabled = varSel.value === "ohne_ki";
  };
  varSel.addEventListener("change", syncProvider);
  syncProvider();

  // Modulkatalog (Instruktion + Unterlagen, aufklappbar)
  const liste = $("modulListe");
  for (const m of K.aktiveModule()) {
    const panel = el("div", "panel");
    panel.appendChild(el("div", "tag", `${m.kennung} · ${m.gegenstandsbereich} · ${m.aufgabentyp} · ` +
      `${m.zeit.richtMin}–${m.zeit.limitMin} Min. · ${m.woerter.min}–${m.woerter.max} Wörter · ` +
      `Aufgabengestaltung: ${m.autorin} (${m.stand})`));
    panel.appendChild(el("h3", null, `${m.titel} — ${m.untertitel}`));
    const det = el("details");
    det.appendChild(el("summary", null, mod2Summary(m)));
    const ins = el("article", "dokument");
    ins.appendChild(el("h3", null, m.instruktion.titel));
    K.renderBlocks(m.instruktion.inhalt, ins);
    det.appendChild(ins);
    for (const d of m.dokumente) det.appendChild(K.renderDokument(d));
    panel.appendChild(det);
    liste.appendChild(panel);
  }
  for (const g of K.GEPLANT) {
    const panel = el("div", "panel geplant");
    panel.appendChild(el("div", "tag", `in Vorbereitung · ${g.gegenstandsbereich} · ${g.aufgabentyp}`));
    panel.appendChild(el("h3", null, g.titel));
    liste.appendChild(panel);
  }

  function mod2Summary(m) {
    return `Instruktion und ${m.dokumente.length} Dokumente anzeigen`;
  }

  if (!window.Store.available()) {
    $("speicherStatus").textContent =
      "Achtung: Browser-Speicher nicht verfügbar (privates Fenster?). Sitzungen können nicht gespeichert werden.";
    $("speicherStatus").classList.add("fehler");
  }

  $("setupForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const status = $("setupStatus");
    const code = $("code").value.trim();
    if (!code) { status.textContent = "Bitte Teilnahmecode angeben."; status.classList.add("fehler"); return; }
    if (!modSel.value) { status.textContent = "Kein Prüfmodul verfügbar."; status.classList.add("fehler"); return; }
    const session = window.Session.create({
      code,
      moduleId: modSel.value,
      variante: varSel.value,
      provider: $("provider").value,
      vorbefragung: $("vorbefragung").checked,
    });
    if (!window.Store.put(session)) {
      status.textContent = "Speichern fehlgeschlagen — Browser-Speicher nicht verfügbar.";
      status.classList.add("fehler");
      return;
    }
    location.href = "study.html?session=" + encodeURIComponent(session.id);
  });
})();
