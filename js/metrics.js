/* Automatisch berechnete Prozess- und Ergebnismaße (MVRP-Layer 6). Heuristiken zur
   Erstsichtung; Referenzverfahren bleiben Expertenrating und manuelle Codierung. */

window.Metrics = (function () {
  function woerter(text) {
    const t = (text || "").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function norm(s) {
    return (s || "").toLowerCase()
      .replace(/[„“”"'‚‘’»«()\[\]:;,!?*_#>–—-]/g, " ")
      .replace(/\.(?!\d)/g, " ")
      .replace(/\s+/g, " ").trim();
  }

  /* Satzsegmentierung: Satzende-Zeichen und Zeilenumbrüche; Fragmente < 4 Wörter
     (Überschriften, Aufzählungsnummern) zählen nicht als Aussage. */
  function aussagen(text) {
    return (text || "")
      .split(/\n+|(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9„"(\[])/)
      .map((s) => s.replace(/^\s*(\d+[.)]|[-•*])\s*/, "").trim())
      .filter((s) => woerter(s) >= 4);
  }

  function bigramme(text) {
    const w = norm(text).split(" ").filter(Boolean);
    const set = new Set();
    for (let i = 0; i < w.length - 1; i++) set.add(w[i] + " " + w[i + 1]);
    return set;
  }

  /* Übernahmequote: Anteil der Aussagen (Sätze) des Endtexts, die unverändert
     (normalisiert wortgleich) bzw. weitgehend (≥ 80 % der Wort-Bigramme) in den
     Agentenbeiträgen vorkommen. */
  function uebernahme(endtext, agentTexte) {
    const agentNorm = " " + agentTexte.map(norm).join(" | ") + " ";
    const agentBi = bigramme(agentTexte.join("\n"));
    const saetze = aussagen(endtext);
    if (!saetze.length || !agentTexte.length) {
      return { n: saetze.length, exakt: null, weitgehend: null, quoteExakt: null, quoteWeitgehend: null };
    }
    let exakt = 0, weitgehend = 0;
    for (const s of saetze) {
      const ns = norm(s);
      if (ns && agentNorm.includes(" " + ns + " ")) { exakt++; weitgehend++; continue; }
      const bi = bigramme(s);
      if (bi.size) {
        let hit = 0;
        bi.forEach((b) => { if (agentBi.has(b)) hit++; });
        if (hit / bi.size >= 0.8) weitgehend++;
      }
    }
    const r = (x) => Math.round((x / saetze.length) * 1000) / 10;
    return { n: saetze.length, exakt, weitgehend, quoteExakt: r(exakt), quoteWeitgehend: r(weitgehend) };
  }

  /* Reliance-Index (wie bisher): Anteil der Wort-Bigramme des Endtexts, die in den
     Agentenbeiträgen vorkommen (0–1). */
  function reliance(endtext, agentTexte) {
    const dec = bigramme(endtext);
    const ag = bigramme(agentTexte.join("\n"));
    if (!dec.size || !ag.size) return null;
    let hit = 0;
    dec.forEach((b) => { if (ag.has(b)) hit++; });
    return Math.round((hit / dec.size) * 100) / 100;
  }

  /* Verweildauer je Ansicht (Instruktion, Dok. 1–n) aus den Ansichtsereignissen. */
  function verweildauer(task) {
    const out = {};
    const ev = task.events.filter((e) => e.typ === "ansicht");
    const ende = task.endedAt ? new Date(task.endedAt) : null;
    ev.forEach((e, i) => {
      const bis = ev[i + 1] ? new Date(ev[i + 1].t) : ende;
      if (!bis) return;
      out[e.ansicht] = (out[e.ansicht] || 0) + Math.max(0, (bis - new Date(e.t)) / 1000);
    });
    for (const k of Object.keys(out)) out[k] = Math.round(out[k]);
    return out;
  }

  function prozess(session) {
    const t = session.task;
    const agentTexte = t.interactions.filter((x) => x.role === "agent").map((x) => x.content);
    const userMsgs = t.interactions.filter((x) => x.role === "user" && !x.auto && !x.fehler);
    const text = t.text || "";
    const dauerS = t.startedAt && t.endedAt ? Math.round((new Date(t.endedAt) - new Date(t.startedAt)) / 1000) : null;
    const einf = t.events.filter((e) => e.typ === "einfuegen");
    const ueb = uebernahme(text, agentTexte);
    return {
      dauerMin: dauerS == null ? null : Math.round(dauerS / 6) / 10,
      ueberziehungMin: dauerS == null ? null : Math.max(0, Math.round((dauerS / 60 - t.limitMin) * 10) / 10),
      woerter: woerter(text),
      nPrompts: userMsgs.length,
      nAgent: agentTexte.length,
      modelle: [...new Set(t.interactions.filter((x) => x.model).map((x) => x.model))].join("|"),
      nEinfuegen: einf.length,
      zeichenEingefuegt: einf.reduce((a, e) => a + (e.zeichen || 0), 0),
      nUebernahmeKnopf: t.events.filter((e) => e.typ === "uebernahme").length,
      uebernahme: ueb,
      reliance: reliance(text, agentTexte),
      verweildauer: verweildauer(t),
    };
  }

  const mean = (a) => (a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 100) / 100 : null);

  /* Zusammenfassung der Ratings über alle Rater:innen einer Sitzung. */
  function ratingZusammenfassung(session) {
    const sl = window.KATP.STUDIENLEITUNG[session.moduleId];
    const raters = Object.values(session.ratings || {});
    if (!sl || !raters.length) return null;
    const krit = {};
    for (const k of sl.raster) {
      krit[k.id] = mean(raters.map((r) => r.kriterien[k.id]).filter((v) => typeof v === "number"));
    }
    const vollst = raters.filter((r) => sl.raster.every((k) => typeof r.kriterien[k.id] === "number"));
    const summe = mean(vollst.map((r) => sl.raster.reduce((a, k) => a + r.kriterien[k.id], 0)));
    const dim = {};
    for (const d of window.KATP.DIM_IDS) {
      dim[d] = mean(sl.raster.filter((k) => k.dimension === d).map((k) => krit[k.id]).filter((v) => v != null));
    }
    const zaehl = {};
    for (const z of sl.zaehlungen) {
      zaehl[z.id] = mean(raters.map((r) => z.items.filter((i) => r.zaehlung && r.zaehlung[i]).length));
    }
    const falsch = mean(raters.map((r) => r.falscheAngaben).filter((v) => typeof v === "number"));
    return { nRater: raters.length, krit, summe, dim, zaehl, falsch };
  }

  return { woerter, aussagen, uebernahme, reliance, verweildauer, prozess, ratingZusammenfassung, mean };
})();
