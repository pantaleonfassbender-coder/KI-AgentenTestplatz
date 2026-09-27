/* Data Collection (MVRP-Layer 6): Erhebungsinstrumente — MODULAR.
   window.DEFAULT_SURVEYS ist der eingebaute Standard; über den Fragebogen-Editor
   der Forschungsansicht kann eine angepasste Fassung im Browser-Speicher abgelegt
   werden (Items ergänzen, ändern, Skalen hinzufügen). window.Surveys ist immer die
   aktive Fassung; jede Sitzung protokolliert deren Versionskennung.
   Baseline-Kurzskalen: EIGENE Formulierungen in Anlehnung an die vier BIP-Bereiche
   (Hossiep & Paschen, 2019) — kein Originalmaterial des lizenzierten Verfahrens.
   NASA-TLX-Kurzform nach Hart & Staveland (1988); Abschlussskala in Anlehnung an
   Lee & See (2004). */

window.DEFAULT_SURVEYS = {
  version: "standard",
  baselineScales: [
    {
      id: "leistungsmotivation",
      name: "Leistungsmotivation",
      items: [
        "Ich setze mir bei der Arbeit anspruchsvolle Ziele.",
        "Es spornt mich an, bessere Ergebnisse zu erzielen als andere.",
        "Auch ohne äußeren Druck arbeite ich mit hohem Einsatz.",
      ],
    },
    {
      id: "flexibilitaet",
      name: "Flexibilität",
      items: [
        "Ich stelle mich schnell auf neue Arbeitssituationen ein.",
        "Unerwartete Änderungen empfinde ich eher als Chance denn als Belastung.",
        "Ich wechsle bei Bedarf problemlos zwischen unterschiedlichen Aufgaben.",
      ],
    },
    {
      id: "durchsetzungsstaerke",
      name: "Durchsetzungsstärke",
      items: [
        "Ich vertrete meinen Standpunkt auch gegen Widerstand.",
        "In Diskussionen übernehme ich häufig die Führung.",
        "Es fällt mir leicht, Vorschläge anderer abzulehnen, wenn ich anderer Meinung bin.",
      ],
    },
    {
      id: "belastbarkeit",
      name: "Belastbarkeit",
      items: [
        "Auch unter Zeitdruck arbeite ich zuverlässig.",
        "Rückschläge werfen mich selten aus der Bahn.",
        "Bei hoher Arbeitsbelastung bleibe ich ruhig und handlungsfähig.",
      ],
    },
  ],

  aiExperience: {
    frequency: {
      label: "Wie häufig nutzen Sie derzeit KI-Werkzeuge (z. B. Chatbots, Assistenzsysteme) beruflich?",
      options: ["nie", "seltener als monatlich", "monatlich", "wöchentlich", "täglich"],
    },
    competence: {
      label: "Wie schätzen Sie Ihre eigene Kompetenz im Umgang mit KI-Werkzeugen ein? (1 = sehr gering, 7 = sehr hoch)",
    },
    agents: {
      label: "Haben Sie bereits mit agentischen KI-Systemen gearbeitet (Systeme, die mehrschrittige Aufgaben eigenständig ausführen)?",
      options: ["nein", "einmal ausprobiert", "gelegentlich", "regelmäßig"],
    },
  },

  /* Kurzerhebung nach jeder Runde. */
  trustItem:
    "Wie sehr haben Sie dem Agenten in dieser Runde vertraut? (1 = gar nicht, 7 = voll und ganz)",

  tlxDimensions: [
    { id: "geistig", label: "Geistige Anforderung", frage: "Wie geistig anspruchsvoll war die Aufgabe?" },
    { id: "zeitdruck", label: "Zeitliche Anforderung", frage: "Wie hoch war der empfundene Zeitdruck?" },
    { id: "leistung", label: "Leistung", frage: "Wie unzufrieden sind Sie mit Ihrer Leistung? (0 = sehr zufrieden, 100 = sehr unzufrieden)" },
    { id: "anstrengung", label: "Anstrengung", frage: "Wie sehr mussten Sie sich anstrengen?" },
    { id: "frustration", label: "Frustration", frage: "Wie verunsichert, entmutigt oder verärgert waren Sie?" },
  ],

  /* Abschlussskala (7-stufig) in Anlehnung an Lee & See (2004). */
  finalTrustItems: [
    "Insgesamt habe ich dem Agenten vertraut.",
    "Die Vorschläge des Agenten waren zuverlässig.",
    "Ich habe die Vorschläge des Agenten kritisch geprüft, bevor ich sie übernommen habe.",
    "Ich hätte wichtige Entscheidungen dem Agenten auch ohne eigene Prüfung überlassen.",
    "Mein Vertrauen in den Agenten war am Ende höher als zu Beginn.",
  ],

  finalOpenQuestions: [
    { id: "rollen", label: "Wie haben Sie die Rollenverteilung zwischen Ihnen und dem Agenten erlebt?" },
    { id: "momente", label: "Gab es kritische Momente — Vertrauensbrüche oder positive Überraschungen? Welche?" },
    { id: "aufgaben", label: "Welche Unterschiede haben Sie zwischen den Aufgabentypen wahrgenommen (z. B. Analyse- vs. Führungsaufgaben)?" },
  ],

  /* Offene Fragen fuer die Postkorb-Kontrollbedingung (Bearbeitung ohne KI). */
  finalOpenQuestionsControl: [
    { id: "vorgehen", label: "Wie sind Sie bei der eigenständigen Bearbeitung vorgegangen — was hat Ihnen geholfen, was gefehlt?" },
    { id: "momente", label: "Gab es kritische Momente — besonders schwierige oder besonders gut laufende Aufgaben? Welche?" },
    { id: "aufgaben", label: "Welche Unterschiede haben Sie zwischen den Aufgabentypen wahrgenommen (z. B. Analyse- vs. Führungsaufgaben)?" },
  ],
};

/* Verwaltung der aktiven Instrumentenfassung (Standard oder Anpassung). */
window.SurveysConfig = (function () {
  const KEY = "katp_surveys_v1";
  const SLUG = /^[a-z0-9_-]+$/;

  function validate(o) {
    const errs = [];
    const isStrArr = (a) => Array.isArray(a) && a.length > 0 && a.every((x) => typeof x === "string" && x.trim());
    if (!o || typeof o !== "object") return ["Kein Objekt."];
    if (typeof o.version !== "string" || !o.version.trim()) errs.push("version: Kennung angeben (z. B. \"v2 Resilienz\").");
    if (!Array.isArray(o.baselineScales) || o.baselineScales.length === 0) {
      errs.push("baselineScales: mindestens eine Skala.");
    } else {
      const ids = new Set();
      for (const sc of o.baselineScales) {
        if (!sc || !SLUG.test(sc.id || "")) errs.push(`baselineScales: id fehlt/ungültig (nur a-z, 0-9, _ , -): ${JSON.stringify(sc && sc.id)}`);
        else if (ids.has(sc.id)) errs.push(`baselineScales: id doppelt: ${sc.id}`);
        else if (sc.id === "ai") errs.push('baselineScales: id "ai" ist reserviert.');
        else ids.add(sc.id);
        if (!sc || typeof sc.name !== "string" || !sc.name.trim()) errs.push(`baselineScales[${sc && sc.id}]: name fehlt.`);
        if (!sc || !isStrArr(sc.items)) errs.push(`baselineScales[${sc && sc.id}]: items = nichtleere Liste von Texten.`);
      }
    }
    const ae = o.aiExperience;
    if (!ae || !ae.frequency || !isStrArr(ae.frequency.options) || typeof ae.frequency.label !== "string" ||
        !ae.competence || typeof ae.competence.label !== "string" ||
        !ae.agents || !isStrArr(ae.agents.options) || typeof ae.agents.label !== "string") {
      errs.push("aiExperience: frequency{label,options}, competence{label}, agents{label,options} erforderlich.");
    }
    if (typeof o.trustItem !== "string" || !o.trustItem.trim()) errs.push("trustItem: Text erforderlich.");
    if (!Array.isArray(o.tlxDimensions) || o.tlxDimensions.length === 0 ||
        !o.tlxDimensions.every((d) => d && SLUG.test(d.id || "") && typeof d.label === "string" && typeof d.frage === "string")) {
      errs.push("tlxDimensions: Liste von {id (slug), label, frage}.");
    }
    if (!isStrArr(o.finalTrustItems)) errs.push("finalTrustItems: nichtleere Liste von Texten.");
    for (const k of ["finalOpenQuestions", "finalOpenQuestionsControl"]) {
      if (!Array.isArray(o[k]) || o[k].length === 0 ||
          !o[k].every((q) => q && SLUG.test(q.id || "") && typeof q.label === "string" && q.label.trim())) {
        errs.push(`${k}: Liste von {id (slug), label}.`);
      }
    }
    return errs;
  }

  function loadOverride() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      return validate(o).length === 0 ? o : null;
    } catch {
      return null;
    }
  }

  function saveFromText(text) {
    let o;
    try {
      o = JSON.parse(text);
    } catch (e) {
      return ["JSON ungültig: " + e.message];
    }
    const errs = validate(o);
    if (errs.length) return errs;
    try {
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch {
      return ["Speichern fehlgeschlagen (Browser-Speicher nicht verfügbar)."];
    }
    window.Surveys = o;
    return [];
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch { /* egal */ }
    window.Surveys = window.DEFAULT_SURVEYS;
  }

  function isCustom() {
    return window.Surveys !== window.DEFAULT_SURVEYS;
  }

  return { validate, saveFromText, reset, isCustom, loadOverride };
})();

window.Surveys = window.SurveysConfig.loadOverride() || window.DEFAULT_SURVEYS;
