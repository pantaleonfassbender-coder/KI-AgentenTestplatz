/* Data Collection (MVRP-Layer 6): Erhebungsinstrumente — MODULAR.
   window.DEFAULT_SURVEYS ist der eingebaute Standard; über den Fragebogen-Editor
   der Forschungsansicht kann eine angepasste Fassung im Browser-Speicher abgelegt
   werden (Items ergänzen, ändern, Skalen hinzufügen). window.Surveys ist immer die
   aktive Fassung; jede Sitzung protokolliert deren Versionskennung.
   Baseline-Kurzskalen: EIGENE Formulierungen in Anlehnung an die vier BIP-Bereiche
   (Hossiep & Paschen, 2019) — kein Originalmaterial des lizenzierten Verfahrens.
   Seit der Modularisierung (v2) enthält die Plattform-Konfiguration nur noch die
   modulunabhängige Vorbefragung; der Kurzfragebogen nach der Abgabe gehört zum
   jeweiligen Prüfmodul (js/modules/…). */

window.DEFAULT_SURVEYS = {
  version: "standard-v2",
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
