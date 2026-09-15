/* Data Collection (MVRP-Layer 6): Erhebungsinstrumente.
   Baseline-Kurzskalen: EIGENE Formulierungen in Anlehnung an die vier BIP-Bereiche
   (Hossiep & Paschen, 2019) — kein Originalmaterial des lizenzierten Verfahrens.
   NASA-TLX-Kurzform nach Hart & Staveland (1988); Abschlussskala in Anlehnung an
   Lee & See (2004). */

window.Surveys = {
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
};
