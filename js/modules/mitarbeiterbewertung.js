/* Prüfmodul "Mitarbeiterbewertung" (Postkorbübung NordTec GmbH, MB-NORDTEC-01).
   Aufgabengestaltung: Dr. Uwe Klein (Oktober 2026). Teilnehmendenseitiger Teil:
   Instruktion, sieben Dokumente in fester Reihenfolge, Kurzfragebogen, Basis-
   Systemanweisung für den Agenten. Auflösung, Bewertungsraster und Musterlösung
   liegen getrennt in mitarbeiterbewertung.studienleitung.js (nur Forschungsansicht).
   Alle Personen, Unternehmen und Zahlen sind fiktiv. */

window.KATP.registerModule({
  id: "mitarbeiterbewertung",
  kennung: "MB-NORDTEC-01",
  titel: "Mitarbeiterbewertung",
  untertitel: "Schriftliche Bewertung von Gunnar Müller, Teamleiter Vertrieb der NordTec GmbH",
  gegenstandsbereich: "Personal und Führung",
  aufgabentyp: "personenbezogen",
  status: "aktiv",
  autorin: "Dr. Uwe Klein",
  stand: "Oktober 2026",
  zeit: { richtMin: 30, limitMin: 60 },
  woerter: { min: 400, max: 600 },
  ergebnisLabel: "Ihre schriftliche Bewertung",
  ergebnisPlatzhalter:
    "1. Gesamteinschätzung\n\n2. Stärken (mit Beleg)\n\n3. Entwicklungsfelder (mit Beleg)\n\n" +
    "4. Widersprüche zwischen den Dokumenten und Ihre Einordnung\n\n5. Empfehlung und Maßnahmen",

  /* Zuordnung zum übergeordneten Modell (Teilleistungen je Dimension). Die Zuordnung
     der Bewertungskriterien und Messgrößen steht im Studienleitungsteil. */
  dimensionen: {
    analyse: {
      teilleistung: "Sieben Dokumente unterschiedlicher Quelle, Perspektive und Aktualität " +
        "sichten; Widersprüche zwischen den Dokumenten erkennen und einordnen; die " +
        "Aussagekraft der Quellen gewichten; Einzelfall von Muster unterscheiden.",
      gliederung: "Abschnitt 4 (Widersprüche); Grundlage aller übrigen Abschnitte",
    },
    planung: {
      teilleistung: "Aus der Analyse eine Potenzialaussage (ja / bedingt / nein) ableiten " +
        "und zwei bis drei konkrete, priorisierte Entwicklungsmaßnahmen festlegen.",
      gliederung: "Abschnitt 5 (Empfehlung und Maßnahmen)",
    },
    durchfuehrung: {
      teilleistung: "Die schriftliche Bewertung nach vorgegebener Gliederung und Länge " +
        "verfassen: Gesamteinschätzung, Stärken, Entwicklungsfelder — differenziert nach " +
        "Rollen (Verkäufer vs. Führungskraft) und unter Berücksichtigung des Kontexts.",
      gliederung: "Abschnitte 1–3, Gesamttext (400–600 Wörter)",
    },
    kontrolle: {
      teilleistung: "Aussagen mit Dokumentverweisen belegen und Zahlen korrekt wiedergeben; " +
        "Soll-Ist-Abgleich der Zielvereinbarungen; in den KI-Varianten Aussagen des Agenten " +
        "an den Dokumenten prüfen.",
      gliederung: "Belegverweise in allen Abschnitten",
    },
  },

  instruktion: {
    titel: "Instruktion für Teilnehmende",
    inhalt: [
      { p: "Bitte verfassen Sie eine schriftliche Bewertung für Gunnar Müller, Teamleiter Vertrieb der NordTec GmbH, auf Basis von sieben Dokumenten; die Bearbeitungszeit beträgt 30 bis 60 Minuten." },
      { h: "Ausgangslage und Aufgabe" },
      { p: "Ihre Rolle: Sie sind HR-Business-Partner:in bei der NordTec GmbH, einem mittelständischen B2B-Unternehmen für Sensorik und Messtechnik mit 180 Mitarbeitenden. Dr. Karin Vogt, Leiterin Vertrieb, bittet Sie um eine fundierte Bewertung von Gunnar Müller: 42 Jahre, seit 7 Jahren bei NordTec, seit 3 Jahren Teamleiter Vertrieb mit aktuell 5 Mitarbeitenden. Stichtag ist Oktober 2026." },
      { p: "Ihre Aufgabe: Verfassen Sie auf Basis der sieben folgenden Dokumente eine schriftliche Bewertung von 400 bis 600 Wörtern mit dieser Gliederung:" },
      { ol: [
        "Gesamteinschätzung (3 bis 4 Sätze)",
        "Stärken, jeweils mit Beleg",
        "Entwicklungsfelder, jeweils mit Beleg",
        "Widersprüche zwischen den Dokumenten und Ihre Einordnung",
        "Empfehlung: Soll Herr Müller als Teamleiter weiterentwickelt werden, und hat er Potenzial für die nächste Führungsebene (ja, bedingt, nein)? Nennen Sie 2 bis 3 konkrete Maßnahmen.",
      ] },
      { h: "Hinweise" },
      { ul: [
        "Belegen Sie Aussagen mit dem Dokumentverweis, z. B. [Dok. 2] oder [Dok. 6].",
        "Die Dokumente stammen aus verschiedenen Quellen und Zeitpunkten. Sie können sich widersprechen und sind unterschiedlich aussagekräftig.",
        "Ein Zwischenstand der Ziele 2026 liegt nicht vor.",
        "Alle Personen, Unternehmen und Zahlen sind fiktiv.",
      ] },
    ],
  },

  dokumente: [
    {
      nr: 1, kurz: "Kundenmail Brandt",
      titel: "Kundenmail Brandt Maschinenbau GmbH",
      kopf: [
        ["Von", "Thomas Brandt, Einkaufsleiter, Brandt Maschinenbau GmbH"],
        ["An", "Gunnar Müller"],
        ["Cc", "Dr. Karin Vogt"],
        ["Datum", "12.09.2026"],
        ["Betreff", "Vielen Dank für Ihren Einsatz am Wochenende"],
      ],
      inhalt: [
        { p: "Sehr geehrter Herr Müller," },
        { p: "ich möchte mich ausdrücklich bei Ihnen bedanken. Als am Samstag, den 5. September, die Messsysteme MS-200 an unserer Linie 2 plötzlich Abweichungen anzeigten, standen wir kurz vor einem Stillstand. Sie waren innerhalb von zwei Stunden bei uns, haben die Kalibrierung selbst geprüft und das System am Sonntagabend wieder stabil zum Laufen gebracht. Die Linie ist am Montag planmäßig angelaufen. Ein Ausfall hätte uns rund 60.000 € gekostet." },
        { p: "So etwas erlebt man selten. Für uns sind Sie NordTec. Wir haben deshalb entschieden, den Rahmenvertrag für 2027 um 15 % auszuweiten. Bitte richten Sie Ihrem Team aus, dass wir die Zusammenarbeit sehr schätzen, auch wenn wir, ehrlich gesagt, am liebsten weiter direkt mit Ihnen sprechen." },
        { p: "Mit freundlichen Grüßen\nThomas Brandt" },
      ],
    },
    {
      nr: 2, kurz: "Kundenmail Keller",
      titel: "Kundenmail Keller Verpackungstechnik AG",
      kopf: [
        ["Von", "Sabine Keller, Leiterin Produktion, Keller Verpackungstechnik AG"],
        ["An", "Dr. Karin Vogt, Leiterin Vertrieb"],
        ["Cc", "Gunnar Müller, Henning Albrecht (Geschäftsführer)"],
        ["Datum", "08.10.2026"],
        ["Betreff", "Lieferverzug Drucksensoren DS-400, Eskalation"],
      ],
      inhalt: [
        { p: "Sehr geehrte Frau Dr. Vogt," },
        { p: "ich wende mich direkt an Sie, weil ich nach diesem Vorfall nicht mehr weiß, worauf wir uns bei NordTec verlassen können. Wir haben am 02.07.2026 2.400 Drucksensoren DS-400 bestellt (Auftrag KV-2026-0417). Herr Müller hat mir am 18.08. am Telefon zugesagt, dass die Lieferung spätestens in KW 38 bei uns eintrifft, und auf dieser Basis haben wir unsere Fertigung geplant. Heute, in KW 41, ist nichts angekommen. Auf Nachfrage heißt es nun KW 42." },
        { p: "Unsere Linie 3 stand dadurch vier Tage still, der Schaden liegt bei rund 38.000 €. Das ist inakzeptabel und leider nicht das erste Mal, dass eine Zusage nicht eingehalten wird. Ich erwarte bis Freitag ein Gespräch mit der Geschäftsführung und eine verbindliche Aussage, ob der Termin KW 42 hält. Andernfalls prüfen wir Schadenersatzansprüche und den Wechsel zu einem anderen Lieferanten." },
        { p: "Sabine Keller" },
      ],
    },
    {
      nr: 3, kurz: "Kundenmail Hellwig",
      titel: "Kundenmail Hellwig Anlagenbau GmbH",
      kopf: [
        ["Von", "Markus Hellwig, Technischer Leiter, Hellwig Anlagenbau GmbH"],
        ["An", "Gunnar Müller"],
        ["Datum", "02.10.2026"],
        ["Betreff", "Zwei Angebote für den Prüfstand Halle 2"],
      ],
      inhalt: [
        { p: "Sehr geehrter Herr Müller," },
        { p: "eine kurze Rückfrage: Für unser Projekt Prüfstand Halle 2 haben wir innerhalb weniger Tage zwei Angebote von NordTec erhalten. Das erste kam am 24.09. von Frau Roth über 48.500 €, das zweite am 28.09. von Herrn Peters über 51.400 €. Beide beziehen sich auf dieselbe Konfiguration. Wir wissen nun nicht, welches Angebot gilt und wer unser Ansprechpartner ist." },
        { p: "Ansonsten sind wir mit NordTec weiterhin sehr zufrieden, vor allem mit der schnellen technischen Beratung. Können Sie das bitte klären?" },
        { p: "Freundliche Grüße\nMarkus Hellwig" },
      ],
    },
    {
      nr: 4, kurz: "Mitarbeitergespräch 03/2025",
      titel: "Ergebnisse Mitarbeitergespräch Herr Gunnar Müller vom 12.3.2025",
      kopf: [
        ["Teilnehmende", "Gunnar Müller, Dr. Karin Vogt"],
        ["Rückblick auf", "Geschäftsjahr 2024"],
      ],
      inhalt: [
        { table: {
          head: ["Ziel 2024", "Plan", "Ist", "Erreichung"],
          rows: [
            ["Umsatz Team", "4,5 Mio. €", "4,6 Mio. €", "102 %"],
            ["Neukunden", "10", "6", "60 %"],
            ["CRM-Datenqualität", "kein Ziel", "55 %", "n. a."],
            ["Übergabe von Großkunden", "kein Ziel", "0", "n. a."],
          ],
        } },
        { h: "Besprochene Punkte:" },
        { ul: [
          "Frau Vogt hebt Kundenbindung und fachliche Beratung hervor. Mehrere Großkunden, darunter Brandt und Hellwig, seien stark auf Herrn Müller fixiert.",
          "Entwicklungsfelder sind Delegation und CRM-Disziplin.",
          "Herr Müller: Großkunden betreue er lieber selbst, weil er deren Anforderungen am besten kenne. Er wünscht sich perspektivisch mehr Verantwortung bis hin zur Vertriebsleitung.",
        ] },
        { h: "Vereinbarte Ziele 2025:" },
        { table: {
          head: ["Ziel", "Vereinbarung"],
          rows: [
            ["Umsatz Team", "4,8 Mio. €"],
            ["Neukunden", "10"],
            ["Übergabe Großkunden", "Brandt und Hellwig an Teammitglieder bis 30.09.2025"],
            ["CRM-Datenqualität", "mindestens 90 % bis Jahresende"],
            ["Entwicklung", "Seminar Führen im Vertrieb"],
          ],
        } },
      ],
    },
    {
      nr: 5, kurz: "Mitarbeitergespräch 03/2026",
      titel: "Ergebnisse Mitarbeitergespräch Herr Gunnar Müller vom 10.3.2026",
      kopf: [
        ["Teilnehmende", "Gunnar Müller, Dr. Karin Vogt"],
        ["Rückblick auf", "Geschäftsjahr 2025"],
      ],
      inhalt: [
        { table: {
          head: ["Ziel 2025", "Plan", "Ist", "Erreichung"],
          rows: [
            ["Umsatz Team", "4,8 Mio. € (im Juli 2025 auf 5,0 Mio. € angehoben)", "5,2 Mio. €", "108 % bzw. 104 %"],
            ["Neukunden", "10", "7", "70 %"],
            ["Übergabe Großkunden", "2 (bis 30.09.2025)", "1: Hellwig an Lena Roth im Oktober 2025", "50 %"],
            ["CRM-Datenqualität", "mindestens 90 %", "78 % (Vorjahr 55 %)", "Ziel verfehlt"],
            ["Seminar Führen im Vertrieb", "Teilnahme", "Mai 2025 besucht", "erledigt"],
          ],
        } },
        { h: "Besprochene Punkte:" },
        { ul: [
          "Frau Vogt bewertet die CRM-Pflege als deutlich verbessert, das Ziel von 90 % sei aber nicht erreicht.",
          "Herr Müller hält die Übergabe von Brandt nicht für sinnvoll, der Kunde bestehe auf ihn. Seine Delegation sieht er inzwischen als weitgehend erledigt.",
          "Rahmenbedingungen: Teammitglied Ben Schulte verlässt NordTec zum 30.04.2026, die Nachbesetzung ist offen. Seit Jahresbeginn gibt es einen Lieferengpass bei Sensorchips, die Lieferzeiten haben sich um 4 bis 6 Wochen verlängert.",
          "Frau Vogt bittet darum, Lieferzusagen an Kunden künftig vorab mit der Disposition abzustimmen. Herr Müller sagt das zu.",
          "Herr Müller wünscht einen Wechsel auf einen elektrischen Dienstwagen. Das klärt er separat mit der Fuhrparkverwaltung.",
        ] },
        { h: "Vereinbarte Ziele 2026:" },
        { table: {
          head: ["Ziel", "Vereinbarung"],
          rows: [
            ["Umsatz Team", "5,4 Mio. €"],
            ["Neukunden", "10"],
            ["Übergabe Großkunde Brandt", "schrittweise an Jan Peters bis 30.09.2026"],
            ["CRM-Datenqualität", "mindestens 90 % bis 30.06.2026"],
            ["Lieferzusagen", "ab sofort vorab mit der Disposition abstimmen"],
            ["Teamführung", "monatliche Teamrunde"],
          ],
        } },
      ],
    },
    {
      nr: 6, kurz: "360-Grad-Feedback 06/2026",
      titel: "360-Grad-Feedback Ergebnisse Gunnar Müller (Juni 2026)",
      kopf: [],
      inhalt: [
        { p: "Befragung der Gruppen Selbst, Vorgesetzte, Team, interne Kolleginnen und Kollegen (Disposition, Produktion, Marketing) und Kunden. Skala von 1 (trifft gar nicht zu) bis 5 (trifft voll zu), Mittelwerte je Gruppe. Die beiden Kunden wurden von Herrn Müller benannt. Die Rückmeldungen sind anonymisiert." },
        { table: {
          rowHead: true,
          head: ["Dimension", "Selbst (n=1)", "Vorgesetzte (n=1)", "Team (n=5)", "Kollegen intern (n=4)", "Kunden (n=2)"],
          rows: [
            ["Fachkompetenz", "4,5", "4,5", "4,6", "4,0", "5,0"],
            ["Kundenorientierung", "4,5", "4,0", "4,2", "3,8", "4,8"],
            ["Zielorientierung", "4,5", "4,0", "3,8", "3,5", "4,5"],
            ["Führung und Delegation", "4,5", "3,0", "2,9", "3,3", "nicht beurteilt"],
            ["Zusammenarbeit und Kommunikation", "4,0", "3,5", "3,2", "3,0", "4,5"],
            ["Verlässlichkeit bei Zusagen", "4,5", "3,0", "3,4", "2,5", "4,5"],
          ],
        } },
        { h: "Freitextkommentare Selbst und Vorgesetzte" },
        { ul: [
          "Selbst: Ich delegiere viel und gebe meinem Team Freiräume.",
          "Vorgesetzte: Hervorragender Fachmann und Kundenversteher. Führung und Delegation bleiben Entwicklungsthema, Lieferzusagen sind nicht immer abgestimmt.",
        ] },
        { h: "Freitextkommentare Team" },
        { ul: [
          "Gunnar ist fachlich top, von ihm lernt man viel über Sensorik. Bei den großen Kunden greift er aber immer selbst ein, auch wenn wir schon dran sind.",
          "Entscheidungen fallen oft spontan, Absprachen im Team gibt es selten. Uns wurde versprochen, dass wir Brandt mitbetreuen dürfen. Wie schon im Frühjahr 2025 passiert da nichts.",
          "Er ist ein Mikromanager und kontrolliert jedes Angebot. Der schlimmste Chef, den ich je hatte.",
          "Wenn es brennt, ist Gunnar sofort da und stellt sich vor das Team, auch gegenüber Kunden.",
          "Die Teamrunden fallen häufig aus.",
        ] },
        { h: "Freitextkommentare Kolleginnen und Kollegen intern" },
        { ul: [
          "Zusagen an Kunden werden gelegentlich ohne Rücksprache mit der Disposition gemacht. Das führt zu Reibung.",
          "Sehr kompetent und immer ansprechbar, aber schwer zu erreichen, weil er ständig beim Kunden ist.",
          "Die Kaffeemaschine im Vertriebsbüro ist schon wieder defekt.",
        ] },
        { h: "Freitextkommentare Kunden" },
        { ul: [
          "Herr Müller kennt unsere Anlagen besser als wir selbst. / Verlässlicher Ansprechpartner. Manchmal wüsste ich gern, wer sonst bei NordTec für mich zuständig ist.",
        ] },
      ],
    },
    {
      nr: 7, kurz: "Potenzialanalyse 02/2025",
      titel: "Potenzialanalyse Herr Gunnar Müller (Februar 2025)",
      kopf: [
        ["Durchgeführt von", "Personalentwicklung (Julia Hartmann)"],
        ["Methoden", "strukturiertes Interview, Fallstudie zu einem Teamkonflikt, Arbeitsprobe Kundenpräsentation"],
        ["Skala", "1 (gering) bis 5 (stark ausgeprägt)"],
        ["Stand", "Februar 2025, seitdem nicht aktualisiert"],
      ],
      inhalt: [
        { table: {
          head: ["Kompetenz", "Wert"],
          rows: [
            ["Kundenorientierung", "4,8"],
            ["Fachkompetenz", "4,7"],
            ["Belastbarkeit", "4,5"],
            ["Führungsmotivation", "4,0"],
            ["Veränderungsbereitschaft", "3,8"],
            ["Strategisches Denken", "3,5"],
            ["Selbstreflexion", "3,2"],
            ["Führungskompetenz (Delegation, Teamentwicklung)", "3,0"],
          ],
        } },
        { h: "Beobachtungen der Assessorin:" },
        { ul: [
          "In der Arbeitsprobe überzeugt Herr Müller durch fachliche Tiefe und einen sehr guten Kundenzugang.",
          "Im Interview beschreibt er Delegation als selbstverständlich. In der Fallstudie behält er die entscheidenden Aufgaben jedoch bei sich.",
          "Er zeigt hohe Motivation, Verantwortung zu übernehmen, und nennt die Vertriebsleitung als mittelfristiges Ziel.",
        ] },
        { h: "Gesamteinschätzung und Empfehlung:" },
        { p: "Hohes Potenzial für eine Position in der Vertriebsleitung in zwei bis drei Jahren, unter der Voraussetzung einer gezielten Führungsentwicklung. Empfohlen werden das Seminar Führen im Vertrieb, ein Mentoring durch die Leitung Vertrieb, die Entlastung durch die Übergabe von Großkunden und eine erneute Einschätzung nach 12 bis 18 Monaten." },
      ],
    },
  ],

  /* Kurzfragebogen nach der Abgabe (1 = stimme gar nicht zu … 5 = stimme voll zu).
     Items 1 und 2 nur in Varianten mit KI. */
  kurzfragebogen: {
    skala: { min: 1, max: 5, minLabel: "stimme gar nicht zu", maxLabel: "stimme voll zu" },
    items: [
      { id: "i1_vertrauen", text: "Ich habe der Einschätzung der KI vertraut.", nurKI: true, messgroesse: "Vertrauen" },
      { id: "i2_pruefung", text: "Ich habe Aussagen der KI anhand der Dokumente überprüft.", nurKI: true, messgroesse: "Prüfverhalten" },
      { id: "i3_anstrengung", text: "Die Aufgabe war geistig anstrengend.", messgroesse: "Arbeitslast" },
      { id: "i4_zeitdruck", text: "Ich stand unter Zeitdruck.", messgroesse: "Arbeitslast" },
      { id: "i5_zufriedenheit", text: "Ich bin mit meiner Bewertung zufrieden.", messgroesse: "Zufriedenheit" },
    ],
  },

  /* Basis-Systemanweisung: identisch für alle KI-Varianten dieses Moduls; die Plattform
     ergänzt nur die Varianten-Anweisung (js/platform.js), Aufgabenstellung und Dokumente. */
  agent: {
    maxTokens: 2500,
    basis:
      "Du bist ein KI-Agent in einer wissenschaftlichen Studie zur Zusammenarbeit von Menschen " +
      "und KI. Du arbeitest mit einer Person zusammen, die die Rolle einer HR-Business-Partnerin " +
      "bzw. eines HR-Business-Partners der fiktiven NordTec GmbH übernimmt und eine schriftliche " +
      "Bewertung des Teamleiters Gunnar Müller erstellt. Dir liegen die Aufgabenstellung und alle " +
      "sieben Dokumente vollständig vor; die Person sieht dieselben Dokumente. Alle Personen, " +
      "Unternehmen und Zahlen sind fiktiv. Antworte auf Deutsch, sachlich und kompakt.",
  },
});
