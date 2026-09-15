/* Task Engine (MVRP-Layer 3): Aufgabenmodule E.1-E.6 aus dem Arbeitspapier (Teil E).
   Jedes Modul: Szenariotext, Eingabedaten, Bearbeitungsauftrag, Bewertungsraster
   (5 Grundkriterien + modulspezifische Ergaenzung), Metadaten. Alle Daten fiktiv. */

window.TASK_MODULES = {
  E1: {
    id: "E1",
    titel: "Marktdatenanalyse",
    funktion: "Planung",
    aufgabentyp: "sachbezogen",
    struktur: "offen",
    dauerMin: 15,
    szenario:
      "Die NordTec GmbH (fiktiver Mittelständler, Sensorik und Messtechnik, 180 Beschäftigte, " +
      "Sitz Bielefeld) plant den Markteintritt in das Segment industrielle Feuchtesensoren. " +
      "Vorliegend sind fiktive Absatz-, Preis- und Trendzahlen der letzten acht Quartale " +
      "aus dem Zielsegment.",
    eingabedaten: [
      ["Absatz Zielsegment (Tsd. Stück je Quartal)", "120 · 135 · 128 · 150 · 162 · 158 · 171 · 180"],
      ["Durchschnittlicher Marktpreis je Einheit", "Q1: 42,00 € → Q8: 46,80 € (moderat steigend)"],
      ["Wettbewerbsdichte", "mittel — vier etablierte Anbieter, kein Anbieter über 30 % Marktanteil"],
      ["Eigene Fertigungskapazität ab Q3 nächsten Jahres", "bis zu 25 Tsd. Stück je Quartal"],
      ["Geschätzte Anlaufkosten Markteintritt", "1,8 Mio. €"]
    ],
    auftrag:
      "Erstellen Sie gemeinsam mit dem Agenten eine Kurzanalyse (max. eine Seite) mit einer " +
      "klaren Handlungsempfehlung: Markteintritt ja/nein, in welchem Umfang, mit welcher " +
      "Begründung aus den vorliegenden Zahlen.",
    raster: ["Vollständigkeit", "Konsistenz", "Nachvollziehbarkeit", "Angemessenheit", "Effizienz", "Datenbasiertheit der Empfehlung"]
  },

  E2: {
    id: "E2",
    titel: "Wettbewerbsanalyse",
    funktion: "Kontrolle",
    aufgabentyp: "sachbezogen",
    struktur: "offen",
    dauerMin: 15,
    szenario:
      "Für das Zielsegment der NordTec GmbH liegen Kurzprofile dreier fiktiver Wettbewerber " +
      "mit unterschiedlichen Positionierungen vor.",
    eingabedaten: [
      ["Sentec AG", "Premiumanbieter; höchste Messgenauigkeit, Preisniveau +25 % über Markt, langsame Lieferzeiten (8 Wochen), starker Service"],
      ["Humidix GmbH", "Kostenführer; Preisniveau −15 % unter Markt, Standardgenauigkeit, hohe Stückzahlen, kaum Individualisierung"],
      ["Priva Systems B.V.", "Nischenanbieter Lebensmittelindustrie; zertifizierte Hygienebauformen, mittleres Preisniveau, wächst zweistellig"]
    ],
    auftrag:
      "Erarbeiten Sie mit dem Agenten eine Stärken-Schwächen-Einschätzung der drei " +
      "Wettbewerber und leiten Sie eine Reaktionsoption für die NordTec GmbH ab.",
    raster: ["Vollständigkeit", "Konsistenz", "Nachvollziehbarkeit", "Angemessenheit", "Effizienz", "Differenziertheit des Vergleichs"]
  },

  E3: {
    id: "E3",
    titel: "Report-Erstellung und -Bewertung",
    funktion: "Durchführung",
    aufgabentyp: "sachbezogen",
    struktur: "strukturiert",
    dauerMin: 20,
    szenario:
      "Der Halbjahresreport des fiktiven Teams „Vertrieb Nord“ der NordTec GmbH liegt in " +
      "Rohform vor (Stichpunkte des Teamleiters).",
    eingabedaten: [
      ["Rohfassung", "Umsatz H1: 4,2 Mio. € (Plan: 4,0) — Neukunden: 14 (Plan: 20) — " +
        "zwei Großaufträge kurz vor Abschluss verloren, Grund unklar — Außendienst seit März " +
        "eine Stelle unbesetzt — Reisekosten 12 % über Plan — Kundenzufriedenheit laut " +
        "Kurzumfrage 4,1/5 — CRM-Datenpflege „chaotisch“ (O-Ton) — Prognose H2: verhalten optimistisch"]
    ],
    auftrag:
      "(a) Überarbeiten Sie die Rohfassung gemeinsam mit dem Agenten zu einem strukturierten " +
      "Halbjahresreport (Ergebnis, Abweichungen, Ursachen, Maßnahmen). " +
      "(b) Lassen Sie den Agenten anschließend einen Report-Entwurf erstellen und bewerten " +
      "Sie diesen kritisch: Benennen Sie mindestens drei konkrete, umsetzbare Verbesserungspunkte.",
    raster: ["Vollständigkeit", "Konsistenz", "Nachvollziehbarkeit", "Angemessenheit", "Effizienz", "Trennschärfe der Kritik"]
  },

  E4: {
    id: "E4",
    titel: "Bewertung von Mitarbeitenden",
    funktion: "Führung",
    aufgabentyp: "personenbezogen",
    struktur: "offen",
    dauerMin: 20,
    szenario:
      "Fiktives Leistungsprofil der fiktiven Person „M. Berger“, Projektleitung Einkauf der " +
      "NordTec GmbH, über zwei Beurteilungsperioden. Hinweis: Sämtliche Angaben sind frei " +
      "erfunden und dienen ausschließlich der Simulation.",
    eingabedaten: [
      ["Periode 1", "Drei Beschaffungsprojekte fristgerecht abgeschlossen; Einsparziel 5 % erreicht (5,2 %); " +
        "Konflikt mit Fertigungsleitung eskalierte bis zur Geschäftsführung; Weiterbildung Verhandlungsführung abgeschlossen"],
      ["Periode 2", "Vier von fünf Projekten fristgerecht; Einsparziel 5 % verfehlt (3,1 %), Begründung: Rohstoffpreisanstieg; " +
        "übernahm ungeplant die Einarbeitung zweier neuer Teammitglieder; Krankheitsquote im Team gesunken; " +
        "Feedback der internen Kunden: „zuverlässig, aber schwer erreichbar“"]
    ],
    auftrag:
      "Erstellen Sie gemeinsam mit dem Agenten eine strukturierte Leistungseinschätzung " +
      "inklusive einer Entwicklungsempfehlung. Die Bewertung muss sich erkennbar auf die " +
      "vorliegenden fiktiven Fakten stützen, nicht auf unbelegte Zuschreibungen.",
    raster: ["Vollständigkeit", "Konsistenz", "Nachvollziehbarkeit", "Angemessenheit", "Effizienz", "Fairness/Nachvollziehbarkeit"]
  },

  E5: {
    id: "E5",
    titel: "Erstellung eines Arbeitszeugnisses",
    funktion: "Führung",
    aufgabentyp: "personenbezogen",
    struktur: "strukturiert",
    dauerMin: 15,
    szenario:
      "Auf Basis des fiktiven Leistungsprofils von „M. Berger“ (Modul E.4) soll ein " +
      "Zeugnisentwurf erstellt werden. Die Person verlässt die NordTec GmbH auf eigenen Wunsch.",
    eingabedaten: [
      ["Grundlage", "Leistungsprofil aus Modul E.4 (zwei Perioden, siehe dortige Angaben)"],
      ["Rahmendaten", "Beschäftigt 4 Jahre als Projektleitung Einkauf; Austritt zum Quartalsende auf eigenen Wunsch"]
    ],
    auftrag:
      "Erstellen Sie mit dem Agenten ein Arbeitszeugnis nach gängiger Zeugnissprache und " +
      "prüfen Sie die Wortwahl gemeinsam kritisch: Ist jede Formulierung mit der " +
      "dokumentierten fiktiven Leistung konsistent (wohlwollend, aber wahr)?",
    raster: ["Vollständigkeit", "Konsistenz", "Nachvollziehbarkeit", "Angemessenheit", "Effizienz", "Konsistenz Formulierung/Faktenlage"]
  },

  E6: {
    id: "E6",
    titel: "Auswahl von Lieferanten",
    funktion: "Durchführung",
    aufgabentyp: "sachbezogen",
    struktur: "strukturiert",
    dauerMin: 15,
    szenario:
      "Für ein Schlüsselbauteil (Kondensator-Messzelle) der NordTec GmbH liegen drei fiktive " +
      "Lieferantenangebote mit unterschiedlichen Preis-, Qualitäts- und Lieferzeitprofilen vor.",
    eingabedaten: [
      ["Angebot A — Elkom GmbH (DE)", "Stückpreis 8,90 € · Ausschussquote 0,4 % · Lieferzeit 2 Wochen · Kapazität begrenzt (max. 15 Tsd./Quartal)"],
      ["Angebot B — TaiSens Ltd. (TW)", "Stückpreis 6,10 € · Ausschussquote 1,1 % · Lieferzeit 7 Wochen · Seefracht, geopolitische Unsicherheit"],
      ["Angebot C — Mersa S.A. (PL)", "Stückpreis 7,40 € · Ausschussquote 0,8 % · Lieferzeit 3 Wochen · Neugründung, erst 2 Referenzkunden"]
    ],
    auftrag:
      "Treffen Sie gemeinsam mit dem Agenten eine begründete Lieferantenentscheidung. " +
      "Benennen Sie die Zielkonflikte zwischen den Kriterien ausdrücklich und schätzen Sie " +
      "das Risiko eines Lieferengpasses für die gewählte Option ein.",
    raster: ["Vollständigkeit", "Konsistenz", "Nachvollziehbarkeit", "Angemessenheit", "Effizienz", "Abwägungsqualität"]
  }
};

/* Standard-Modulfolge (Teil E.7: je Runde nur eine Managementfunktion). */
window.DEFAULT_SEQUENCE = ["E1", "E2", "E6", "E3", "E4", "E5"];

/* Agentenrollen (MVRP-Layer 5, HACTLab Stufe 2): drei funktional unterschiedliche
   Rollen desselben Modells, ohne direkte Agent-zu-Agent-Kommunikation. */
window.AGENT_ROLES = {
  analyst: {
    id: "analyst",
    name: "Analyst",
    beschreibung: "Erarbeitet Analysen und Entwürfe zur Aufgabe.",
    system:
      "Du bist der Analyse-Agent in einer Studie zur Mensch-KI-Zusammenarbeit. Du arbeitest " +
      "mit einer menschlichen Fach- oder Führungskraft an einer unternehmerischen Aufgabe der " +
      "fiktiven NordTec GmbH. Alle Daten sind fiktiv. Antworte auf Deutsch, sachlich und " +
      "kompakt. Stütze dich ausschließlich auf die bereitgestellten Daten; erfinde keine " +
      "zusätzlichen Zahlen. Kennzeichne Annahmen ausdrücklich als Annahmen."
  },
  kritiker: {
    id: "kritiker",
    name: "Kritiker",
    beschreibung: "Prüft Entwürfe auf Schwächen, Lücken und Risiken.",
    system:
      "Du bist der Kritiker-Agent in einer Studie zur Mensch-KI-Zusammenarbeit. Deine einzige " +
      "Aufgabe ist die kritische Prüfung von Entwürfen und Überlegungen zur vorliegenden " +
      "Aufgabe der fiktiven NordTec GmbH: Benenne konkrete Schwächen, fehlende Aspekte, " +
      "Inkonsistenzen und Risiken — nummeriert, je Punkt ein Satz Begründung. Erstelle selbst " +
      "keine vollständigen Lösungen. Antworte auf Deutsch. Alle Daten sind fiktiv."
  },
  koordinator: {
    id: "koordinator",
    name: "Koordinator",
    beschreibung: "Strukturiert das Vorgehen und behält Auftrag und Zeit im Blick.",
    system:
      "Du bist der Koordinations-Agent in einer Studie zur Mensch-KI-Zusammenarbeit. Du hilfst " +
      "der menschlichen Fach- oder Führungskraft, das Vorgehen zu strukturieren: Schrittfolgen, " +
      "Priorisierung, Abgleich mit dem Bearbeitungsauftrag, Hinweis auf noch offene Punkte. Du " +
      "lieferst keine inhaltlichen Analysen und keine fertigen Texte. Antworte auf Deutsch, in " +
      "höchstens fünf Sätzen oder als kurze Liste. Alle Daten sind fiktiv."
  }
};

/* Autonomiegrad-Instruktionen (Faktor aus Teil C.2, wirkt auf den Analyst-Agenten). */
window.AUTONOMY_INSTRUCTIONS = {
  niedrig:
    "Autonomiemodus NIEDRIG: Du machst ausschließlich Vorschläge und beantwortest Fragen. " +
    "Erstelle kein fertiges Endprodukt, sondern biete Optionen mit kurzer Begründung an und " +
    "überlasse jede Festlegung der menschlichen Person. Frage bei Unklarheit nach, statt zu entscheiden.",
  hoch:
    "Autonomiemodus HOCH: Erstelle eigenständig und ohne Rückfragen einen vollständigen, " +
    "abgabefertigen Entwurf für den Bearbeitungsauftrag. Die menschliche Person prüft und " +
    "korrigiert dein Ergebnis anschließend. Liefere zuerst den Entwurf, danach höchstens drei " +
    "kurze Hinweise, welche Punkte besonders geprüft werden sollten."
};
