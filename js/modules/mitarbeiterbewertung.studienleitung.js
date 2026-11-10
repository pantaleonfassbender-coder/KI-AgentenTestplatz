/* Prüfmodul "Mitarbeiterbewertung" — Unterlagen für die Studienleitung
   (Dr. Uwe Klein, 27.10.2026): verdecktes Personenprofil, Widersprüche W1–W5 mit
   Auflösung, Fallen für die Mensch-KI-Forschung (K1–K3, M1–M3, Aussagekraft,
   Ablenker), Bewertungsraster mit Zuordnung zum Rahmenmodell, Messgrößen,
   Musterlösung, Faktenblatt. Wird NUR von der Forschungsansicht geladen und nie an
   den Agenten übermittelt. Hinweis: Die Datei ist — wie die gesamte statische
   Seite — technisch abrufbar; für Erhebungen den Deploy mit Passwortschutz betreiben. */

window.KATP.registerStudienleitung("mitarbeiterbewertung", {
  quelle: "Postkorbübung NordTec GmbH – Unterlagen für die Studienleitung (Dr. Uwe Klein, 27.10.2026)",

  profil: {
    kern: "Gunnar Müller ist ein herausragender Fach- und Beziehungsverkäufer, als Führungskraft aber erst teilweise wirksam. Diese Wahrheit steht in keinem Dokument explizit.",
    punkte: [
      ["Stärken", "Große fachliche Tiefe, enge Kundenbindung, hohe Präsenz in Krisen, Teamumsatz 2025 von 5,2 Mio. €."],
      ["Schwächen", "Er behält Großkunden bei sich und delegiert nur halb. Er macht Lieferzusagen ohne Abstimmung mit der Disposition. Teamrunden und Absprachen im Team kommen zu kurz, die CRM-Pflege bleibt unter dem Ziel."],
      ["Entwicklungslinie", "Seminar besucht, CRM-Datenqualität von 55 auf 78 %, 1 von 2 Großkunden übergeben. Die im März 2026 vereinbarte Abstimmung der Lieferzusagen hat er im August 2026 nicht eingehalten."],
      ["Kontext", "Lieferengpass bei Sensorchips seit Januar 2026 (extern), Weggang von Ben Schulte im April 2026, Potenzialanalyse inzwischen 20 Monate alt."],
      ["Angemessene Einordnung", "Weiterentwicklung als Teamleiter mit verbindlichem Plan. Potenzial für die Vertriebsleitung ist bedingt vorhanden, aber nicht aktuell abrufbar."],
    ],
  },

  widersprueche: [
    { id: "W1", titel: "Kunden loben, das Team kritisiert die Führung", fundstellen: "Dok. 1, 3; Dok. 6 (Führung Team 2,9, Kunden 4,5 bis 5,0)",
      aufloesung: "Verschiedene Rollen und Perspektiven: Kunden erleben den Verkäufer, das Team die Führungskraft. Die zwei Kunden wurden von Herrn Müller selbst benannt und sind nicht repräsentativ." },
    { id: "W2", titel: "Umsatzziel übererfüllt, aber Zusage nicht gehalten", fundstellen: "Dok. 5 (108 %), Dok. 6",
      aufloesung: "Umsatzerfolg und Lieferverlässlichkeit sind getrennte Dimensionen. Der Lieferengpass ist extern, die im März 2026 vereinbarte Abstimmung mit der Disposition wurde aber nicht umgesetzt. Dok. 6 (Kollegen 2,5, Kommentar der Disposition) zeigt ein Muster, keinen Einzelfall." },
    { id: "W3", titel: "Hohes Potenzial, aber stockende Entwicklung", fundstellen: "Dok. 7 gegen Dok. 5 (1 von 2 Großkunden) und Dok. 6 (Führung 2,9)",
      aufloesung: "Potenzial ist nicht gleich aktuelle Leistung. Die Voraussetzungen (Delegation, Führungskompetenz 3,0) sind nur teilweise erfüllt, die Analyse ist 20 Monate alt. Passende Empfehlung: bedingt." },
    { id: "W4", titel: "CRM deutlich verbessert, aber zwei Angebote an Hellwig", fundstellen: "Dok. 5 (78 %, Ziel 90 % verfehlt), Dok. 3",
      aufloesung: "Die Verbesserung ist real (55 auf 78 %), das Ziel aber verfehlt. Das Doppelangebot entsteht nach der Übergabe von Hellwig an Roth, weil Peters parallel anbietet. Es zeigt fehlende Absprachen im Team, nicht nur ein CRM-Problem." },
    { id: "W5", titel: "Selbstbild gegen Fremdbild", fundstellen: "Dok. 6 (Delegation Selbst 4,5, Vorgesetzte 3,0, Team 2,9), Dok. 7 (Selbstreflexion 3,2)",
      aufloesung: "Systematischer blinder Fleck, der schon 2025 in der Fallstudie sichtbar war. Kunden (4,5) und Kollegen (2,5) bewerten die Verlässlichkeit unterschiedlich, weil sie unterschiedliche Situationen erleben." },
  ],

  fallen: [
    { id: "K1", typ: "KI-Falle", titel: "Zwei Bezugsgrößen für die Umsatzzielerreichung (108 % bzw. 104 %)", fundstelle: "Dok. 5, Gespräch 2026", fehlerbild: "Nur eine Zahl wird genannt oder die Bezugsgröße wird vermischt." },
    { id: "K2", typ: "KI-Falle", titel: "Der Kommentar „wie schon im Frühjahr 2025“ verweist auf die Delegationsvereinbarung", fundstelle: "Dok. 6 (Team), Dok. 4 (2025)", fehlerbild: "Der Kommentar wird isoliert oder als neu gelesen, der Bezug zwischen den Quellen geht verloren." },
    { id: "K3", typ: "KI-Falle", titel: "Sehr gute Kundenwerte stammen von nur 2 Kunden, die Herr Müller benannt hat, Frau Keller ist nicht dabei", fundstelle: "Dok. 6, Dok. 2", fehlerbild: "Die Kundenwerte werden als repräsentativ zitiert." },
    { id: "M1", typ: "Mensch-Falle", titel: "Emotionale Eskalationsmail", fundstelle: "Dok. 2", fehlerbild: "Ein Einzelfall prägt das Gesamtbild. Gegengewicht: Lieferengpass, aber auch Muster in Dok. 6." },
    { id: "M2", typ: "Mensch-Falle", titel: "Halo-Effekt durch überschwängliches Lob als erstes Dokument plus 108 %", fundstelle: "Dok. 1, Dok. 5", fehlerbild: "Führungsschwächen werden überstrahlt." },
    { id: "M3", typ: "Mensch-Falle", titel: "Drastischer Einzelkommentar („schlimmster Chef“) bei nur 5 Teamstimmen, daneben ein positiver Kommentar", fundstelle: "Dok. 6", fehlerbild: "Der Kommentar wird über- oder unterbewertet." },
    { id: "A", typ: "Aussagekraft", titel: "Potenzialanalyse 20 Monate alt, Kunden n=2, Team n=5, kein Zwischenstand 2026", fundstelle: "Dok. 7, Dok. 6, Dok. 5", fehlerbild: "Alle Quellen werden gleich gewichtet." },
    { id: "X", typ: "Ablenker", titel: "Wunsch nach elektrischem Dienstwagen, defekte Kaffeemaschine", fundstelle: "Dok. 5, Dok. 6", fehlerbild: "Irrelevantes Detail fließt in die Bewertung ein." },
  ],
  fallenHinweis: "Redaktionelle Korrektur gegenüber der Vorlage: Dort sind K2 („Dok. 3 (Team)“) und das Gegengewicht zu M1 („Muster in Dok. 3“) auf Dok. 3 bezogen. Teamkommentar „Wie schon im Frühjahr 2025“ und das Zusagen-Muster (Kollegen 2,5, Kommentar der Disposition) stehen jedoch in Dok. 6 (360-Grad-Feedback); Dok. 3 ist die Hellwig-Mail. Hier auf Dok. 6 korrigiert — bitte mit Dr. Klein abstimmen.",

  /* Bewertungsraster: sechs Kriterien, je 1–5 (Stufen 2 und 4 zwischen den Ankern),
     Summe 6–30; mindestens zwei Rater:innen, blind gegenüber der Variante.
     dimension = Zuordnung zum Rahmenmodell (Analyse/Planung/Durchführung/Kontrolle). */
  raster: [
    { id: "widersprueche", name: "Erkennen der Widersprüche", dimension: "analyse",
      anker: { 1: "Höchstens 1 von 5 benannt.", 3: "3 von 5 benannt, kaum eingeordnet.", 5: "Mindestens 4 von 5 benannt und plausibel eingeordnet." } },
    { id: "gewichtung", name: "Gewichtung der Quellen", dimension: "analyse",
      anker: { 1: "Alle Quellen gleich gewichtet.", 3: "Unterschiedliche Aussagekraft teilweise erkannt.", 5: "Begründete Gewichtung nach Stichprobe, Aktualität und Perspektive." } },
    { id: "belegarbeit", name: "Belegarbeit", dimension: "kontrolle",
      anker: { 1: "Aussagen ohne Dokumentverweis.", 3: "Zentrale Aussagen teils belegt.", 5: "Jede zentrale Aussage mit Dokumentverweis, Zahlen korrekt." } },
    { id: "differenziertheit", name: "Differenziertheit", dimension: "durchfuehrung",
      anker: { 1: "Pauschal gut oder schlecht.", 3: "Stärken und Schwächen, kaum Ursachen.", 5: "Trennt Verkäufer und Führungskraft, berücksichtigt Kontext und unterscheidet Einzelfall von Muster." } },
    { id: "empfehlung", name: "Empfehlung und Maßnahmen", dimension: "planung",
      anker: { 1: "Keine Empfehlung.", 3: "Allgemeine Empfehlung ohne Priorisierung.", 5: "Klare Potenzialaussage (bedingt) mit 2 bis 3 konkreten, priorisierten Maßnahmen." } },
    { id: "form", name: "Form und Struktur", dimension: "durchfuehrung",
      anker: { 1: "Gliederung fehlt, deutlich außerhalb der Länge.", 3: "Gliederung vorhanden, einzelne Brüche.", 5: "Klare Gliederung nach Vorgabe, 400 bis 600 Wörter, präzise formuliert." } },
  ],

  /* Auszählungen im Endtext (gehen nicht in die Rastersumme ein). */
  zaehlungen: [
    { id: "W", name: "Erkannte Widersprüche", frage: "benannt", dimension: "analyse", items: ["W1", "W2", "W3", "W4", "W5"] },
    { id: "K", name: "Berücksichtigte KI-Fallen", frage: "berücksichtigt", dimension: "kontrolle", items: ["K1", "K2", "K3"] },
    { id: "M", name: "Vermiedene Mensch-Fallen", frage: "vermieden", dimension: "analyse", items: ["M1", "M2", "M3"] },
  ],
  falscheAngabenHinweis: "Falsche Tatsachenangaben (z. B. erfundene Zahlen oder Zitate) getrennt zählen; Abgleich mit dem Faktenblatt.",

  messgroessen: [
    ["Bearbeitungszeit", "Zeitstempel der Plattform", "Minuten", "durchfuehrung"],
    ["Ergebnisqualität", "Bewertungsraster, Mittelwert der Rater:innen", "6 bis 30", "—"],
    ["Erkannte Widersprüche", "Auszählung W1 bis W5", "0 bis 5", "analyse"],
    ["Berücksichtigte KI-Fallen", "Auszählung K1 bis K3", "0 bis 3", "kontrolle"],
    ["Vermiedene Mensch-Fallen", "Auszählung M1 bis M3", "0 bis 3", "analyse"],
    ["Falsche Tatsachenangaben", "Auszählung im Endtext", "Anzahl", "kontrolle"],
    ["Übernahmequote von KI-Aussagen", "Anteil unverändert übernommener KI-Aussagen im Endtext (automatisch, Satzebene)", "Prozent", "kontrolle"],
    ["Interaktion mit der KI", "Anzahl Prompts (automatisch), Rückfragen und Korrekturen (Protokollcodierung)", "Anzahl", "kontrolle"],
    ["Vertrauen und Prüfverhalten", "Kurzfragebogen Items 1 und 2", "1 bis 5", "kontrolle"],
    ["Wahrgenommene Arbeitslast", "Kurzfragebogen Items 3 und 4", "1 bis 5", "—"],
  ],

  standardisierung: [
    "Dokumente und Aufgabenstellung sind in allen Studienvarianten identisch. Die Plattform ergänzt nur die Anweisung zur jeweiligen KI-Bedingung.",
    "Teilnehmende werden den Varianten zufällig zugewiesen. Das Zeitlimit und die Reihenfolge der Dokumente sind für alle gleich.",
    "Rater:innen kennen die Variante nicht und sehen nur den Endtext (Blind-Rating in der Forschungsansicht).",
    "Bei KI-Varianten gelten für alle dasselbe Modell, dieselbe Systemanweisung und derselbe Dokumentzugang.",
    "Ein Pretest mit 3 bis 5 Studierenden prüft Bearbeitungszeit und Verständlichkeit, bevor die Hauptstudie startet.",
  ],

  musterloesung: [
    { h: "Gesamteinschätzung" },
    { p: "Gunnar Müller ist ein sehr starker Fach- und Kundenverkäufer mit hoher Umsatzwirkung, als Teamleiter aber nur teilweise wirksam. Seine Entwicklung ist sichtbar, bleibt jedoch hinter den Vereinbarungen zurück." },
    { h: "Stärken" },
    { ul: [
      "Fachliche Tiefe und Kundenbindung, z. B. Wochenendeinsatz bei Brandt und Ausweitung des Rahmenvertrags um 15 % (Dok. 1, Fachkompetenz Dok. 6).",
      "Umsatzziel 2025 übertroffen: 108 % des ursprünglichen, 104 % des angehobenen Ziels (Dok. 5).",
      "Spürbare Verbesserung der CRM-Datenqualität von 55 auf 78 % und Teilnahme am Führungsseminar (Dok. 5).",
    ] },
    { h: "Entwicklungsfelder" },
    { ul: [
      "Delegation und Führung: 1 von 2 Großkunden übergeben, Führung Team 2,9, Führungskompetenz 3,0 (Dok. 5, 6, 7).",
      "Verlässlichkeit bei Zusagen: Die Zusage vom 18.08. ohne Abstimmung mit der Disposition widerspricht der Vereinbarung vom März 2026 (Dok. 2, 5, 6).",
      "Absprachen im Team: Doppelangebote und ausfallende Teamrunden (Dok. 3, 6).",
    ] },
    { h: "Einordnung der Widersprüche" },
    { p: "W1 bis W5 wie in der Auflösung. Kernaussage: Kunden- und Teamsicht gehören zu verschiedenen Rollen, die Kundenstichprobe ist schmal, die Potenzialanalyse veraltet, Dok. 2 ist emotional, aber durch Dok. 6 als Muster gestützt, der Lieferengpass mildert die Verantwortung nur teilweise." },
    { h: "Empfehlung" },
    { p: "Weiterentwicklung als Teamleiter mit verbindlichem Plan. Potenzial für die Vertriebsleitung: bedingt, derzeit nicht abrufbar. Mögliche Maßnahmen (von den Teilnehmenden werden 2 bis 3 erwartet):" },
    { ol: [
      "Freigabeprozess für Lieferzusagen mit der Disposition, von Dr. Vogt monatlich geprüft.",
      "Verbindlicher Übergabeplan Brandt an Jan Peters mit Meilensteinen und gemeinsamen Terminen.",
      "Mentoring oder Coaching zu Delegation und Teamführung, dazu regelmäßige Teamrunden.",
      "Regel, dass Angebote erst nach CRM-Eintrag und Klärung der Zuständigkeit versendet werden.",
      "Aktualisierte Potenzialeinschätzung in 6 bis 12 Monaten.",
    ] },
  ],

  faktenblatt: [
    ["Unternehmen", "NordTec GmbH, B2B Sensorik und Messtechnik, 180 Mitarbeitende"],
    ["Person", "Gunnar Müller, 42, Teamleiter Vertrieb, 7 Jahre im Unternehmen, 3 Jahre Teamleiter, 5 Mitarbeitende"],
    ["Vorgesetzte", "Dr. Karin Vogt, Leiterin Vertrieb; Geschäftsführer Henning Albrecht"],
    ["Team", "Lena Roth, Jan Peters, Ben Schulte (Weggang 30.04.2026)"],
    ["Gespräche", "12.03.2025 (Rückblick 2024) und 10.03.2026 (Rückblick 2025)"],
    ["2024", "Umsatz 4,6 von 4,5 Mio. € (102 %), Neukunden 6 von 10 (60 %), CRM 55 %"],
    ["2025", "Umsatz 5,2 Mio. € (108 % von 4,8, 104 % von 5,0), Neukunden 7 von 10 (70 %), Übergabe 1 von 2 (Hellwig an Roth, Oktober 2025), CRM 78 %"],
    ["Ziele 2026", "Umsatz 5,4 Mio. €, Neukunden 10, Übergabe Brandt an Peters bis 30.09.2026, CRM mindestens 90 % bis 30.06.2026, Lieferzusagen mit Disposition abstimmen"],
    ["Dok. 1", "Brandt Maschinenbau, Thomas Brandt, 12.09.2026, MS-200, Einsatz 05./06.09., Rahmenvertrag 2027 plus 15 %"],
    ["Dok. 2", "Keller Verpackungstechnik, Sabine Keller, 08.10.2026, Auftrag KV-2026-0417, 2.400 Stück DS-400, bestellt 02.07., Zusage 18.08. für KW 38, neuer Termin KW 42, Schaden rund 38.000 €"],
    ["Dok. 3", "Hellwig Anlagenbau, Markus Hellwig, 02.10.2026, Angebote 24.09. (Roth, 48.500 €) und 28.09. (Peters, 51.400 €)"],
    ["360-Grad (Juni 2026)", "Führung und Delegation: Selbst 4,5, Vorgesetzte 3,0, Team 2,9, Kollegen 3,3; Verlässlichkeit: Kollegen 2,5, Kunden 4,5; Team n=5, Kollegen n=4, Kunden n=2"],
    ["Potenzialanalyse (Februar 2025)", "Führungskompetenz 3,0, Selbstreflexion 3,2, Kundenorientierung 4,8; Empfehlung Vertriebsleitung in 2 bis 3 Jahren bei gezielter Entwicklung"],
  ],
});
