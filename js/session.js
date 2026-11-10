/* Sitzungsverwaltung (ersetzt die frühere Rundenmaschine): eine Sitzung = eine
   Person bearbeitet genau ein Prüfmodul in einer Studienvariante. Keine Runden,
   keine Kennzahlen-Fortschreibung. */

window.Session = (function () {
  function uuid() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      "s-" + Date.now() + "-" + Math.floor(Math.random() * 1e9);
  }

  /* Zufallszuweisung, ausgewogen je Gerät und Modul: Variante mit den wenigsten
     bisherigen Sitzungen, bei Gleichstand zufällig. */
  function zuweisen(moduleId, sessions) {
    const ids = Object.keys(window.KATP.VARIANTEN);
    const n = Object.fromEntries(ids.map((id) => [id, 0]));
    for (const s of sessions) if (s.moduleId === moduleId && s.variante in n) n[s.variante]++;
    const min = Math.min(...Object.values(n));
    const kandidaten = ids.filter((id) => n[id] === min);
    return kandidaten[Math.floor(Math.random() * kandidaten.length)];
  }

  function create(opts) {
    const mod = window.KATP.MODULE[opts.moduleId];
    const variante = opts.variante === "zufall"
      ? zuweisen(opts.moduleId, window.Store.loadAll())
      : opts.variante;
    const ki = window.KATP.VARIANTEN[variante].ki;
    return {
      schema: 2,
      id: uuid(),
      code: opts.code,
      moduleId: mod.id,
      modulKennung: mod.kennung,
      variante,
      zuweisung: opts.variante === "zufall" ? "zufällig (ausgewogen)" : "manuell",
      provider: ki ? opts.provider : "none",
      vorbefragung: !!opts.vorbefragung,
      surveysVersion: (window.Surveys && window.Surveys.version) || "standard",
      createdAt: new Date().toISOString(),
      status: "neu",
      consent: null,
      baseline: null,
      task: {
        startedAt: null,
        endedAt: null,
        limitMin: mod.zeit.limitMin,
        interactions: [],
        events: [],
        entwurf: "",
        text: null,
      },
      kurzbogen: null,
      kodierung: null,
      ratings: {},
    };
  }

  function event(session, typ, daten) {
    session.task.events.push({ typ, t: new Date().toISOString(), ...(daten || {}) });
  }

  return { create, event, zuweisen };
})();
