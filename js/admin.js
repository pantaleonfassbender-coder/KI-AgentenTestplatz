/* Forschungsansicht: Modulunterlagen (Studienleitung), Sitzungsliste mit Detail und
   Protokollcodierung, Blind-Rating mit mehreren Rater:innen, Export/Import,
   Editor der Vorbefragung. */

(function () {
  const $ = (id) => document.getElementById(id);
  const K = window.KATP;
  const { el } = K;
  const PROVIDER_NAMES = {
    anthropic: "Claude", openai: "GPT", gemini: "Gemini", opensource: "Open-Source", none: "—",
  };
  const varName = (id) => (K.VARIANTEN[id] || {}).name || id;
  const modTitel = (id) => (K.MODULE[id] || {}).titel || id;

  function download(filename, content, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  /* Neutrale, stabile Kennung je Sitzung für das Blind-Rating (FNV-1a). */
  function hash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36).toUpperCase();
  }
  const blindId = (s) => "T-" + hash(s.id).padStart(7, "0").slice(-6);

  function table(head, rows) {
    const t = el("table");
    if (head) {
      const thead = el("thead");
      const tr = el("tr");
      for (const h of head) tr.appendChild(el("th", null, h));
      thead.appendChild(tr);
      t.appendChild(thead);
    }
    const tb = el("tbody");
    for (const r of rows) {
      const tr = el("tr");
      for (const c of r) tr.appendChild(el("td", null, c == null ? "—" : String(c)));
      tb.appendChild(tr);
    }
    t.appendChild(tb);
    return t;
  }

  function aufklapp(titel, inhalt, offen) {
    const d = el("details");
    if (offen) d.open = true;
    d.appendChild(el("summary", null, titel));
    const box = el("div", "aufklapp-inhalt");
    (Array.isArray(inhalt) ? inhalt : [inhalt]).forEach((n) => box.appendChild(n));
    d.appendChild(box);
    return d;
  }

  function fillModulSelect(sel) {
    sel.textContent = "";
    for (const m of K.aktiveModule()) {
      const op = el("option", null, `${m.titel} (${m.kennung})`);
      op.value = m.id;
      sel.appendChild(op);
    }
  }

  // ===================== Modulunterlagen =====================
  function renderUnterlagen() {
    const box = $("ulInhalt");
    box.textContent = "";
    const mod = K.MODULE[$("ulModul").value];
    const sl = mod && K.STUDIENLEITUNG[mod.id];
    if (!mod) return;
    if (!sl) { box.appendChild(el("p", "status fehler", "Für dieses Modul ist kein Studienleitungsteil geladen.")); return; }
    box.appendChild(el("p", "status", sl.quelle));

    // Zuordnung zum Rahmenmodell
    const zRows = K.DIM_IDS.map((d) => [
      K.DIMENSIONEN[d].name,
      mod.dimensionen[d].teilleistung,
      sl.raster.filter((k) => k.dimension === d).map((k) => k.name).join(", ") || "—",
      [
        ...sl.zaehlungen.filter((z) => z.dimension === d).map((z) => z.name),
        ...sl.messgroessen.filter((m) => m[3] === d && !sl.zaehlungen.some((z) => z.name === m[0])).map((m) => m[0]),
      ].join(", ") || "—",
    ]);
    box.appendChild(aufklapp("Zuordnung zum Rahmenmodell (Analyse · Planung · Durchführung · Kontrolle)",
      [table(["Dimension", "Teilleistung im Modul", "Rasterkriterien", "Weitere Messgrößen"], zRows),
        el("p", "status", "Dimensionswerte im Export = Mittel der zugeordneten Rasterkriterien (über Rater:innen gemittelt).")], true));

    const prof = el("div");
    prof.appendChild(el("p", null, sl.profil.kern));
    prof.appendChild(table(null, sl.profil.punkte));
    box.appendChild(aufklapp("Verdecktes Personenprofil", prof));

    box.appendChild(aufklapp("Widersprüche W1–W5 und ihre Auflösung",
      table(["Nr.", "Widerspruch", "Fundstellen", "Plausible Auflösung"],
        sl.widersprueche.map((w) => [w.id, w.titel, w.fundstellen, w.aufloesung]))));

    const fallen = [table(["Nr.", "Typ", "Falle", "Fundstelle", "Typisches Fehlerbild"],
      sl.fallen.map((f) => [f.id, f.typ, f.titel, f.fundstelle, f.fehlerbild]))];
    if (sl.fallenHinweis) fallen.push(el("p", "hinweis warnung", sl.fallenHinweis));
    box.appendChild(aufklapp("Fallen für die Mensch-KI-Forschung", fallen));

    box.appendChild(aufklapp("Bewertungsraster (je 1–5, Summe 6–30)",
      table(["Kriterium", "Dimension", "1 Punkt", "3 Punkte", "5 Punkte"],
        sl.raster.map((k) => [k.name, K.DIMENSIONEN[k.dimension].name, k.anker[1], k.anker[3], k.anker[5]]))));

    box.appendChild(aufklapp("Messgrößen und Standardisierung", [
      table(["Messgröße", "Erhebung", "Skala", "Dimension"],
        sl.messgroessen.map((m) => [m[0], m[1], m[2], K.DIMENSIONEN[m[3]] ? K.DIMENSIONEN[m[3]].name : "—"])),
      (() => { const ul = el("ul"); sl.standardisierung.forEach((x) => ul.appendChild(el("li", null, x))); return ul; })(),
    ]));

    const ml = el("div");
    K.renderBlocks(sl.musterloesung, ml);
    box.appendChild(aufklapp("Musterlösung in Stichpunkten", ml));
    box.appendChild(aufklapp("Faktenblatt (Konsistenzprüfung, falsche Tatsachenangaben)", table(null, sl.faktenblatt)));

    const prompts = Object.values(K.VARIANTEN).filter((v) => v.ki).map((v) => {
      const pre = el("pre", "prompt", K.systemPrompt(mod, v.id));
      return aufklapp(`Systemanweisung — ${v.name} (${K.systemPrompt(mod, v.id).length} Zeichen)`, pre);
    });
    box.appendChild(aufklapp("Systemanweisungen an den Agenten je KI-Variante", prompts));
  }

  // ===================== Sitzungsliste =====================
  function renderList() {
    const tbody = $("sessionTabelle").querySelector("tbody");
    tbody.textContent = "";
    const sessions = window.Store.loadAll();
    if (!sessions.length) {
      const tr = el("tr");
      const td = el("td", null, "Noch keine Sitzungen auf diesem Gerät.");
      td.colSpan = 9;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    for (const s of sessions) {
      const p = window.Metrics.prozess(s);
      const tr = el("tr");
      const cells = [
        s.code, modTitel(s.moduleId), varName(s.variante), PROVIDER_NAMES[s.provider] || s.provider,
        s.status, s.task.text ? p.woerter : "—", p.dauerMin != null ? p.dauerMin + " Min." : "—",
        Object.keys(s.ratings || {}).join(", ") || "—",
      ];
      for (const c of cells) tr.appendChild(el("td", null, String(c)));
      const tdA = el("td");
      const b1 = el("button", "sekundaer klein", "Details");
      b1.addEventListener("click", () => renderDetail(s.id));
      const b2 = el("button", "sekundaer klein", "JSON");
      b2.addEventListener("click", () => download(`katp_${s.code}_${stamp()}.json`, JSON.stringify(s, null, 2), "application/json"));
      const b3 = el("button", "gefahr klein", "Löschen");
      b3.addEventListener("click", () => {
        if (confirm(`Sitzung „${s.code}" endgültig von diesem Gerät löschen?`)) {
          window.Store.remove(s.id);
          $("detail").classList.add("verborgen");
          renderList();
        }
      });
      tdA.append(b1, b2, b3);
      tr.appendChild(tdA);
      tbody.appendChild(tr);
    }
    if (window.Store.legacyRaw()) $("btnLegacy").classList.remove("verborgen");
  }

  function renderDetail(id) {
    const s = window.Store.get(id);
    if (!s) return;
    const p = window.Metrics.prozess(s);
    $("detail").classList.remove("verborgen");
    $("detailTitel").textContent = `Sitzung „${s.code}" — ${modTitel(s.moduleId)}, ${varName(s.variante)}` +
      (s.provider !== "none" ? `, ${PROVIDER_NAMES[s.provider]}` : "");
    const wrap = $("detailInhalt");
    wrap.textContent = "";

    const panel = el("div", "panel");
    const u = p.uebernahme;
    panel.appendChild(table(["Kennwert", "Wert"], [
      ["Blind-Kennung", blindId(s)],
      ["Zuweisung", s.zuweisung],
      ["Bearbeitungszeit", p.dauerMin != null ? `${p.dauerMin} Min. (Überziehung ${p.ueberziehungMin} Min.)` : "—"],
      ["Wörter im Endtext", p.woerter],
      ["Prompts der Person / Antworten des Agenten", `${p.nPrompts} / ${p.nAgent}`],
      ["Modell(e)", p.modelle || "—"],
      ["Übernahmequote (Sätze unverändert / weitgehend)", u.quoteExakt == null ? "—" : `${u.quoteExakt} % / ${u.quoteWeitgehend} % (n = ${u.n} Sätze)`],
      ["Reliance-Index (Bigramme)", p.reliance ?? "—"],
      ["Einfügen ins Textfeld / Übernahme-Knopf", `${p.nEinfuegen}× (${p.zeichenEingefuegt} Zeichen) / ${p.nUebernahmeKnopf}×`],
      ["Verweildauer (s)", Object.entries(p.verweildauer).map(([k, v]) => `${k} ${v}`).join(" · ") || "—"],
      ["Kurzfragebogen", s.kurzbogen ? Object.entries(s.kurzbogen.items).map(([k, v]) => `${k}=${v}`).join(" · ") : "—"],
    ]));
    if (s.task.text) {
      panel.appendChild(el("h3", null, "Endtext"));
      panel.appendChild(el("div", "endtext-anzeige", s.task.text));
    }
    const prot = s.task.interactions.map((x) => {
      const d = el("div", "msg " + (x.role === "user" ? "human" : "agent"));
      d.appendChild(el("span", "wer", (x.role === "user" ? (x.auto ? "Automatischer Auftrag" : "Person") : `Agent${x.model ? " · " + x.model : ""}`) +
        ` · ${(x.timestamp || "").slice(11, 19)}` + (x.fehler ? ` · FEHLER: ${x.fehler}` : "")));
      d.appendChild(document.createTextNode(x.content));
      return d;
    });
    if (prot.length) panel.appendChild(aufklapp(`Interaktionsprotokoll (${prot.length} Einträge)`, prot));
    panel.appendChild(aufklapp(`Ereignisse (${s.task.events.length})`,
      table(["Zeit", "Typ", "Details"], s.task.events.map((e) => {
        const { typ, t, ...rest } = e;
        return [(t || "").slice(11, 19), typ, Object.entries(rest).map(([k, v]) => `${k}: ${v}`).join(", ")];
      }))));

    // Protokollcodierung (nicht blind)
    if (K.VARIANTEN[s.variante] && K.VARIANTEN[s.variante].ki) {
      panel.appendChild(el("h3", null, "Protokollcodierung (Interaktion mit der KI)"));
      panel.appendChild(el("p", "status", "Prompts werden automatisch gezählt. Rückfragen (Nachfragen/Verifikationsfragen der Person an den Agenten) und Korrekturen (Person weist Agentenaussagen zurück oder berichtigt sie) hier aus dem Protokoll codieren."));
      const kd = s.kodierung || {};
      const mk = (id, label, val, typ) => {
        const w = el("div");
        const l = el("label", null, label); l.htmlFor = id;
        const i = el("input"); i.type = typ || "number"; i.id = id; i.value = val ?? "";
        if (!typ) i.min = "0";
        w.append(l, i);
        return w;
      };
      const zeile = el("div", "zeile");
      zeile.append(mk("kodRueck", "Anzahl Rückfragen", kd.rueckfragen),
        mk("kodKorr", "Anzahl Korrekturen", kd.korrekturen),
        mk("kodKoder", "Kürzel Codierer:in", kd.koder, "text"));
      panel.appendChild(zeile);
      const koder = zeile.querySelector("#kodKoder");
      const notiz = el("textarea"); notiz.placeholder = "Notiz zur Codierung"; notiz.value = kd.notiz || "";
      panel.appendChild(notiz);
      const btn = el("button", null, "Codierung speichern");
      const st = el("p", "status");
      btn.addEventListener("click", () => {
        const num = (v) => (v === "" ? null : parseInt(v, 10));
        s.kodierung = {
          rueckfragen: num(zeile.querySelector("#kodRueck").value),
          korrekturen: num(zeile.querySelector("#kodKorr").value),
          koder: koder.value.trim(), notiz: notiz.value.trim(), t: new Date().toISOString(),
        };
        st.textContent = window.Store.put(s) ? "Gespeichert." : "Speichern fehlgeschlagen.";
      });
      panel.append(btn, st);
    }

    // Ratings-Übersicht
    const rz = window.Metrics.ratingZusammenfassung(s);
    const sl = K.STUDIENLEITUNG[s.moduleId];
    if (rz && sl) {
      panel.appendChild(el("h3", null, `Ratings (${rz.nRater} Rater:innen)`));
      const rows = Object.entries(s.ratings).map(([r, x]) => [
        r, ...sl.raster.map((k) => x.kriterien[k.id]),
        sl.raster.every((k) => typeof x.kriterien[k.id] === "number") ? sl.raster.reduce((a, k) => a + x.kriterien[k.id], 0) : "—",
        ...sl.zaehlungen.map((z) => z.items.filter((i) => x.zaehlung && x.zaehlung[i]).length),
        x.falscheAngaben,
      ]);
      rows.push(["Mittel", ...sl.raster.map((k) => rz.krit[k.id]), rz.summe, ...sl.zaehlungen.map((z) => rz.zaehl[z.id]), rz.falsch]);
      panel.appendChild(table(["Rater", ...sl.raster.map((k) => k.name), "Summe", ...sl.zaehlungen.map((z) => z.id), "Falsch"], rows));
      panel.appendChild(el("p", "status", "Dimensionswerte: " +
        K.DIM_IDS.map((d) => `${K.DIMENSIONEN[d].name} ${rz.dim[d] ?? "—"}`).join(" · ")));
    }
    wrap.appendChild(panel);
    $("detail").scrollIntoView({ behavior: "smooth" });
  }

  // ===================== Blind-Rating =====================
  let rater = null;

  function ratingKandidaten() {
    const mid = $("ratingModul").value;
    return window.Store.loadAll()
      .filter((s) => s.moduleId === mid && s.task && s.task.text)
      .sort((a, b) => hash(rater + a.id).localeCompare(hash(rater + b.id)));
  }

  function renderRatingListe() {
    const box = $("ratingListe");
    box.textContent = "";
    $("ratingForm").textContent = "";
    const liste = ratingKandidaten();
    const fertig = liste.filter((s) => s.ratings && s.ratings[rater]).length;
    $("ratingStatus").textContent = liste.length
      ? `Rater:in ${rater}: ${fertig} von ${liste.length} Texten bewertet.`
      : "Keine abgegebenen Texte für dieses Modul auf diesem Gerät.";
    $("ratingStatus").className = "status";
    const wrap = el("div", "kachel-liste");
    for (const s of liste) {
      const b = el("button", "kachel" + (s.ratings && s.ratings[rater] ? " erledigt" : ""), blindId(s));
      b.type = "button";
      b.title = s.ratings && s.ratings[rater] ? "bereits bewertet" : "offen";
      b.addEventListener("click", () => renderRatingForm(s.id));
      wrap.appendChild(b);
    }
    box.appendChild(wrap);
  }

  function renderRatingForm(id) {
    const s = window.Store.get(id);
    const sl = K.STUDIENLEITUNG[s.moduleId];
    const mod = K.MODULE[s.moduleId];
    const box = $("ratingForm");
    box.textContent = "";
    const vorhanden = (s.ratings && s.ratings[rater]) || { kriterien: {}, zaehlung: {} };
    const panel = el("div", "panel rating-panel");
    panel.appendChild(el("h3", null, `${blindId(s)} · ${window.Metrics.woerter(s.task.text)} Wörter (Vorgabe ${mod.woerter.min}–${mod.woerter.max})`));
    panel.appendChild(el("div", "endtext-anzeige", s.task.text));

    panel.appendChild(el("h3", null, "Bewertungsraster"));
    const sels = {};
    for (const k of sl.raster) {
      const div = el("div", "kriterium");
      div.appendChild(el("label", null, `${k.name} (${K.DIMENSIONEN[k.dimension].name})`));
      for (const st of [1, 3, 5]) div.appendChild(el("p", "krit-anker", `${st} — ${k.anker[st]}`));
      const likert = el("div", "likert");
      for (let v = 1; v <= 5; v++) {
        const l = el("label");
        const r = el("input");
        r.type = "radio"; r.name = "rk_" + k.id; r.value = String(v);
        if (vorhanden.kriterien[k.id] === v) r.checked = true;
        l.append(r, document.createTextNode(String(v)));
        likert.appendChild(l);
      }
      sels[k.id] = likert;
      div.appendChild(likert);
      panel.appendChild(div);
    }

    panel.appendChild(el("h3", null, "Auszählungen"));
    const beschr = Object.fromEntries([
      ...sl.widersprueche.map((w) => [w.id, `${w.titel} — ${w.fundstellen}`]),
      ...sl.fallen.map((f) => [f.id, `${f.titel} — ${f.fundstelle}; Fehlerbild: ${f.fehlerbild}`]),
    ]);
    const checks = {};
    for (const z of sl.zaehlungen) {
      const div = el("div", "kriterium");
      div.appendChild(el("label", null, `${z.name} (${z.items.length} möglich; ankreuzen = ${z.frage})`));
      for (const it of z.items) {
        const l = el("label", "check");
        const c = el("input");
        c.type = "checkbox";
        c.checked = !!(vorhanden.zaehlung && vorhanden.zaehlung[it]);
        checks[it] = c;
        l.append(c, document.createTextNode(` ${it}: ${beschr[it] || ""}`));
        div.appendChild(l);
      }
      panel.appendChild(div);
    }
    const fDiv = el("div", "kriterium");
    const fl = el("label", null, "Falsche Tatsachenangaben (Anzahl; gehen nicht in die Summe ein)");
    fl.htmlFor = "rFalsch";
    const fi = el("input"); fi.type = "number"; fi.min = "0"; fi.id = "rFalsch";
    fi.value = typeof vorhanden.falscheAngaben === "number" ? vorhanden.falscheAngaben : "0";
    fDiv.append(fl, el("p", "krit-def", sl.falscheAngabenHinweis), fi);
    panel.appendChild(fDiv);
    const notiz = el("textarea");
    notiz.placeholder = "Notiz (z. B. welche Angaben falsch sind)";
    notiz.value = vorhanden.notiz || "";
    panel.appendChild(notiz);

    const btn = el("button", null, "Bewertung speichern");
    const st = el("p", "status");
    btn.addEventListener("click", () => {
      const kriterien = {};
      let fehlt = [];
      for (const k of sl.raster) {
        const r = sels[k.id].querySelector("input:checked");
        if (r) kriterien[k.id] = parseInt(r.value, 10); else fehlt.push(k.name);
      }
      if (fehlt.length) { st.textContent = "Bitte alle Kriterien bewerten: " + fehlt.join(", "); st.className = "status fehler"; return; }
      const zaehlung = {};
      for (const [it, c] of Object.entries(checks)) zaehlung[it] = c.checked ? 1 : 0;
      const frisch = window.Store.get(id);
      frisch.ratings = frisch.ratings || {};
      frisch.ratings[rater] = {
        rater, kriterien, zaehlung,
        falscheAngaben: parseInt(fi.value, 10) || 0,
        notiz: notiz.value.trim(),
        ratedAt: new Date().toISOString(),
      };
      if (window.Store.put(frisch)) {
        renderRatingListe();
        renderList();
        $("ratingStatus").textContent += ` Gespeichert: ${blindId(frisch)}.`;
        $("ratingStatus").className = "status erfolg";
        $("rating").scrollIntoView({ behavior: "smooth" });
      } else {
        st.textContent = "Speichern fehlgeschlagen."; st.className = "status fehler";
      }
    });
    panel.append(btn, st);
    box.appendChild(panel);
    panel.scrollIntoView({ behavior: "smooth" });
  }

  $("btnRatingStart").addEventListener("click", () => {
    const k = $("raterKuerzel").value.trim().replace(/\s+/g, "");
    if (!k) { $("ratingStatus").textContent = "Bitte Rater-Kürzel angeben."; $("ratingStatus").className = "status fehler"; return; }
    if (!K.STUDIENLEITUNG[$("ratingModul").value]) { $("ratingStatus").textContent = "Für dieses Modul ist kein Bewertungsraster geladen."; return; }
    rater = k;
    renderRatingListe();
  });

  // ===================== Export / Import =====================
  function exportSheets(sessions) {
    const modIds = [...new Set(sessions.map((s) => s.moduleId))];
    const maxDok = Math.max(0, ...modIds.map((m) => (K.MODULE[m] ? K.MODULE[m].dokumente.length : 0)));
    const ansichten = ["instruktion", ...Array.from({ length: maxDok }, (_, i) => "dok" + (i + 1))];
    const krit = [];
    const zaehl = [];
    const kbItems = [];
    for (const m of modIds) {
      const sl = K.STUDIENLEITUNG[m];
      if (sl) {
        for (const k of sl.raster) if (!krit.includes(k.id)) krit.push(k.id);
        for (const z of sl.zaehlungen) if (!zaehl.find((x) => x.id === z.id)) zaehl.push(z);
      }
      const mod = K.MODULE[m];
      if (mod) for (const it of mod.kurzfragebogen.items) if (!kbItems.includes(it.id)) kbItems.push(it.id);
    }
    const scaleIds = window.Surveys.baselineScales.map((sc) => sc.id);
    const scaleMean = (s, id) => {
      const bl = (s.baseline && s.baseline.items) || {};
      const vals = Object.entries(bl).filter(([k]) => k.startsWith(`bl_${id}_`)).map(([, v]) => v);
      return window.Metrics.mean(vals);
    };

    const sitz = [[
      "session_id", "blind_id", "code", "modul", "modul_kennung", "variante", "zuweisung", "provider", "modelle",
      "vorbefragung", "fragebogen_version", "status", "angelegt", "start", "ende", "dauer_min", "ueberziehung_min",
      "woerter", "n_prompts", "n_agent_antworten", "n_rueckfragen", "n_korrekturen",
      "n_einfuegen", "zeichen_eingefuegt", "n_uebernahme_knopf",
      "saetze_endtext", "uebernahme_exakt_pct", "uebernahme_weitgehend_pct", "reliance_index",
      ...ansichten.map((a) => "verweil_s_" + a),
      ...kbItems.map((i) => "kb_" + i),
      ...scaleIds.map((id) => "bl_" + id), "ki_frequenz", "ki_kompetenz", "ki_agentenerfahrung",
      "n_rater", ...krit.map((k) => "r_" + k), "raster_summe",
      ...K.DIM_IDS.map((d) => "dim_" + d),
      ...zaehl.map((z) => "n_" + z.id), "falsche_angaben", "endtext",
    ]];
    const ratings = [[
      "session_id", "blind_id", "modul", "variante", "provider", "rater", "rated_at",
      ...krit.map((k) => "r_" + k), "raster_summe",
      ...zaehl.flatMap((z) => z.items), ...zaehl.map((z) => "n_" + z.id), "falsche_angaben", "notiz",
    ]];
    const texte = [[
      "session_id", "code", "modul", "variante", "provider", "quelle", "auto", "fehler",
      "sequenz", "zeitstempel", "modell", "n_woerter", "n_zeichen", "text",
    ]];
    const ereig = [["session_id", "code", "variante", "sequenz", "zeitstempel", "typ", "details"]];

    for (const s of sessions) {
      const p = window.Metrics.prozess(s);
      const rz = window.Metrics.ratingZusammenfassung(s) || { nRater: 0, krit: {}, dim: {}, zaehl: {} };
      const kd = s.kodierung || {};
      const bl = (s.baseline && s.baseline.items) || {};
      sitz.push([
        s.id, blindId(s), s.code, s.moduleId, s.modulKennung, s.variante, s.zuweisung, s.provider, p.modelle,
        s.vorbefragung ? 1 : 0, s.surveysVersion, s.status, s.createdAt, s.task.startedAt, s.task.endedAt,
        p.dauerMin, p.ueberziehungMin, s.task.text ? p.woerter : null,
        p.nPrompts, p.nAgent, kd.rueckfragen, kd.korrekturen,
        p.nEinfuegen, p.zeichenEingefuegt, p.nUebernahmeKnopf,
        p.uebernahme.n, p.uebernahme.quoteExakt, p.uebernahme.quoteWeitgehend, p.reliance,
        ...ansichten.map((a) => p.verweildauer[a] ?? 0),
        ...kbItems.map((i) => (s.kurzbogen && s.kurzbogen.items[i]) ?? null),
        ...scaleIds.map((id) => scaleMean(s, id)),
        s.baseline ? s.baseline.aiFrequency : null, bl.bl_ai_komp ?? null, s.baseline ? s.baseline.aiAgents : null,
        rz.nRater, ...krit.map((k) => rz.krit[k] ?? null), rz.summe ?? null,
        ...K.DIM_IDS.map((d) => rz.dim[d] ?? null),
        ...zaehl.map((z) => rz.zaehl[z.id] ?? null), rz.falsch ?? null, s.task.text,
      ]);
      const sl = K.STUDIENLEITUNG[s.moduleId];
      for (const [r, x] of Object.entries(s.ratings || {})) {
        const summe = sl && sl.raster.every((k) => typeof x.kriterien[k.id] === "number")
          ? sl.raster.reduce((a, k) => a + x.kriterien[k.id], 0) : null;
        ratings.push([
          s.id, blindId(s), s.moduleId, s.variante, s.provider, r, x.ratedAt,
          ...krit.map((k) => x.kriterien[k] ?? null), summe,
          ...zaehl.flatMap((z) => z.items.map((i) => (x.zaehlung && i in x.zaehlung ? x.zaehlung[i] : null))),
          ...zaehl.map((z) => z.items.filter((i) => x.zaehlung && x.zaehlung[i]).length),
          x.falscheAngaben, x.notiz,
        ]);
      }
      const wc = window.Metrics.woerter;
      s.task.interactions.forEach((x, i) => {
        const t = x.content || "";
        texte.push([s.id, s.code, s.moduleId, s.variante, s.provider,
          x.role === "user" ? "chat_person" : "chat_agent", x.auto ? 1 : 0, x.fehler ? 1 : 0,
          i + 1, x.timestamp, x.model || null, wc(t), t.length, t]);
      });
      if (s.task.text) {
        texte.push([s.id, s.code, s.moduleId, s.variante, s.provider, "endtext", 0, 0,
          s.task.interactions.length + 1, s.task.endedAt, null, wc(s.task.text), s.task.text.length, s.task.text]);
      }
      s.task.events.forEach((e, i) => {
        const { typ, t, ...rest } = e;
        ereig.push([s.id, s.code, s.variante, i + 1, t, typ, Object.keys(rest).length ? JSON.stringify(rest) : null]);
      });
    }
    return [
      { name: "Sitzungen", rows: sitz },
      { name: "Ratings", rows: ratings },
      { name: "Texte", rows: texte },
      { name: "Ereignisse", rows: ereig },
    ];
  }

  $("btnExportAllXlsx").addEventListener("click", () => {
    const all = window.Store.loadAll();
    if (!all.length) { $("listStatus").textContent = "Keine Sitzungen vorhanden."; return; }
    download(`katp_export_${stamp()}.xlsx`, window.XlsxExport.build(exportSheets(all)));
  });
  $("btnExportAllJson").addEventListener("click", () => {
    const all = window.Store.loadAll();
    if (!all.length) { $("listStatus").textContent = "Keine Sitzungen vorhanden."; return; }
    download(`katp_alle-sitzungen_${stamp()}.json`, JSON.stringify(all, null, 2), "application/json");
  });
  $("importDatei").addEventListener("change", async (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      const res = window.Store.importSessions(Array.isArray(data) ? data : [data]);
      $("listStatus").textContent = res
        ? `Import: ${res.neu} neue Sitzung(en), ${res.ergaenzt} zusammengeführt (Ratings vereinigt).`
        : "Import fehlgeschlagen (Browser-Speicher).";
      renderList();
    } catch (e) {
      $("listStatus").textContent = "Import fehlgeschlagen: " + e.message;
    }
    ev.target.value = "";
  });
  $("btnLegacy").addEventListener("click", () => {
    const raw = window.Store.legacyRaw();
    if (raw) download(`katp_altdaten_rundenfassung_${stamp()}.json`, raw, "application/json");
  });

  // ===================== Vorbefragung-Editor =====================
  function surveysSummary() {
    const s = window.Surveys;
    const nItems = s.baselineScales.reduce((a, sc) => a + sc.items.length, 0);
    return `Aktiv: „${s.version}" (${window.SurveysConfig.isCustom() ? "angepasst, auf diesem Gerät gespeichert" : "eingebauter Standard"}) — ` +
      `${s.baselineScales.length} Skalen mit ${nItems} Items + KI-Vorerfahrung.`;
  }
  function renderSurveysEditor() {
    $("surveysStatusZeile").textContent = surveysSummary();
    $("surveysEditor").value = JSON.stringify(window.Surveys, null, 2);
  }
  $("btnSurveysSave").addEventListener("click", () => {
    const errs = window.SurveysConfig.saveFromText($("surveysEditor").value);
    const st = $("surveysStatus");
    if (errs.length) { st.textContent = "Nicht gespeichert — " + errs.join(" · "); st.className = "status fehler"; }
    else { st.textContent = "Gespeichert. Gilt für neu angelegte Sitzungen auf diesem Gerät."; st.className = "status erfolg"; renderSurveysEditor(); }
  });
  $("btnSurveysReset").addEventListener("click", () => {
    if (!confirm("Anpassung verwerfen und den eingebauten Standard aktivieren?")) return;
    window.SurveysConfig.reset();
    renderSurveysEditor();
    $("surveysStatus").textContent = "Standard wiederhergestellt.";
    $("surveysStatus").className = "status erfolg";
  });
  $("btnSurveysExport").addEventListener("click", () => {
    download(`katp_vorbefragung_${(window.Surveys.version || "standard").replace(/[^\w-]+/g, "_")}_${stamp()}.json`,
      JSON.stringify(window.Surveys, null, 2), "application/json");
  });

  // ===================== Start =====================
  fillModulSelect($("ulModul"));
  fillModulSelect($("ratingModul"));
  $("ulModul").addEventListener("change", renderUnterlagen);
  $("ratingModul").addEventListener("change", () => { if (rater) renderRatingListe(); });
  renderUnterlagen();
  renderSurveysEditor();
  renderList();
})();
