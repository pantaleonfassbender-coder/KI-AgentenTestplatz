# KI-AgentenTestplatz — Konzeption

**Agentische Testbench für die empirische Forschung zur Interaktion von Menschen mit KI-Agenten**

Wissenschaftliche Leitung: Dr. Pantaleon Fassbender · Dr. Uwe Klein
Stand: 10. November 2026 (modulare Fassung; frühere Rundenfassung E1–E6 vom 15. September 2026 ersetzt)

---

## 1. Ausgangspunkt und Grundlagen

Die Testbench setzt das im *Arbeitspapier: Experimentelle Untersuchung der Zusammenarbeit
zwischen Menschen und KI-Agenten* (31. Juli 2026) entwickelte Untersuchungsdesign als
lauffähige **Minimal Viable Research Platform (MVRP)** im Sinne der HACTLab-Konzeptskizze
(Frankfurt, August 2026) um. Theoretische Verankerung und Variablenauswahl folgen der
*Literaturübersicht Mensch-Maschine-Interaktion im Zeichen agentischer KI* (3. August 2026)
sowie dem Kurzreview *Individuelle Resilienz in KI-augmentierten Arbeitsumgebungen*
(11. September 2026).

Leitprinzip der HACTLab-Skizze: **„Grow by Extension, not by Replacement"** — die
Grundstruktur bleibt erhalten, nur der Funktionsumfang wächst. Die Plattform ist deshalb
konsequent modular gebaut: Aufgabenmodule, Agentenanbieter, Autonomiegrad und
Erhebungsinstrumente sind unabhängig voneinander variierbar (zentrale Anforderung aus
Teil B.4 des Arbeitspapiers).

## 2. Modularer Aufbau und Rahmenmodell

Die Rundenfassung mit sechs Kurzmodulen (E1–E6) und Planspiel-Kennzahlen ist ersetzt durch
**Prüfmodule**: in sich geschlossene Postkorbaufgaben (Unterlagen, Auftrag, Zeitansatz,
Kurzfragebogen, Bewertungsraster), von denen eine Person in einer Sitzung genau eines
bearbeitet — ohne Phasen oder Runden. Neue Module (Wettbewerbsanalyse,
Angebotsbewertung …) werden als Dateien ergänzt, ohne die Plattform umzubauen.

Alle Module sind einem **übergeordneten Modell** mit den vier Dimensionen des
Managementprozesses zugeordnet:

| Dimension | Leitfrage |
|---|---|
| **Analyse** | Informationen erschließen und prüfen: Quellen sichten, Aussagekraft gewichten, Widersprüche und Muster erkennen |
| **Planung** | Ziele, Empfehlungen und Maßnahmen ableiten und priorisieren |
| **Durchführung** | Das Arbeitsergebnis erstellen: Urteil bilden, strukturiert und differenziert ausformulieren |
| **Kontrolle** | Ergebnisse absichern: belegen, Zahlen prüfen — in KI-Varianten insbesondere Agentenaussagen an den Quellen verifizieren |

Jedes Modul beschreibt seine Teilleistung je Dimension; jedes Rasterkriterium trägt eine
Dimension. Daraus entstehen modulübergreifend vergleichbare **Dimensionswerte**
(Mittel der zugeordneten Kriterien). „Kontrolle“ hat in der Mensch-KI-Forschung eine
doppelte Bedeutung: inhaltlich (Soll-Ist-Abgleich im Gegenstand) und prozessual
(Prüfung der KI) — daher sind KI-Fallen, falsche Tatsachenangaben, Übernahmequote und
Prüfverhalten dieser Dimension zugeordnet.

### Abbildung der MVRP-Schichten (HACTLab)

| Schicht | Umsetzung |
|---|---|
| L1 User Interface | Statische Oberfläche: Startseite (Studienleitung), Sitzung, Forschungsansicht |
| L2 Scenario Engine | Fiktive NordTec GmbH als gemeinsamer Rahmen aller Prüfmodule |
| L3 Task Engine | Modul-Registry (`js/platform.js`) + je Modul zwei Dateien unter `js/modules/` |
| L4 Workflow | Sitzungsablauf in `js/study.js`; Zuweisung in `js/session.js` |
| L5 AI Integration | `/api/agent` (Anthropic, OpenAI, Google, Open Source); Varianten-Anweisungen |
| L6 Data Collection | Protokolle, Ereignisse, Kurzfragebogen, Blind-Rating, `js/metrics.js` |
| L7 Data Storage | localStorage der Erhebungsstation; Export XLSX/JSON, Import zum Zusammenführen |

### Zuordnung des Moduls Mitarbeiterbewertung (MB-NORDTEC-01)

| Dimension | Teilleistung | Rasterkriterien | Weitere Messgrößen |
|---|---|---|---|
| Analyse | Sieben Dokumente sichten, Widersprüche erkennen und einordnen, Quellen nach Stichprobe, Aktualität und Perspektive gewichten, Einzelfall von Muster trennen (Gliederungspunkt 4) | Erkennen der Widersprüche; Gewichtung der Quellen | Erkannte Widersprüche W1–W5; vermiedene Mensch-Fallen M1–M3 |
| Planung | Potenzialaussage (ja/bedingt/nein) und 2–3 priorisierte Maßnahmen (Punkt 5) | Empfehlung und Maßnahmen | — |
| Durchführung | Bewertung nach Gliederung und Länge verfassen, Verkäufer- und Führungsrolle trennen, Kontext berücksichtigen (Punkte 1–3) | Differenziertheit; Form und Struktur | Bearbeitungszeit |
| Kontrolle | Belege und korrekte Zahlen, Soll-Ist-Abgleich der Zielvereinbarungen, Prüfung der KI-Aussagen | Belegarbeit | Berücksichtigte KI-Fallen K1–K3; falsche Tatsachenangaben; Übernahmequote; Prompts/Rückfragen/Korrekturen; Kurzfragebogen Item 2 |

## 3. Forschungsfragen (angepasst an die modulare Fassung)

- **F1** Ergebnisqualität je Dimension (Analyse/Planung/Durchführung/Kontrolle) nach Variante
- **F2** Vertrauen und Prüfverhalten ↔ Übernahme, falsche Tatsachenangaben, KI-Fallen
- **F3** Persönlichkeitsmerkmale (Vorbefragung) ↔ Intensität und Qualität der Zusammenarbeit
- **F4** Anbietervergleich Claude / GPT / Gemini / Open Source
- **F5** Autonomiegrad ↔ Qualität, Bearbeitungszeit, Übernahmequote, Arbeitslast
- **F6** Rollenverteilung und Fehlerbilder in personen- vs. sachbezogenen Modulen

## 4. Studienvarianten

| Variante | Agent |
|---|---|
| Ohne KI | keiner (Postkorb) |
| Autonomie niedrig | reine Unterstützung: Fragen, Belegstellen, Prüfung auf Anfrage; verfasst keinen Endtext |
| Autonomie hoch | übernimmt die ganze Aufgabe: eigenständige vollständige Fassung zu Beginn, Überarbeitung auf Wunsch, Übernahme-Knopf |

Standardisierung (Unterlagen Dr. Klein): identische Dokumente, Reihenfolge und Zeitlimit für
alle; zufällige Zuweisung (ausgewogen je Gerät); in KI-Varianten gleiches Modell, gleiche
Basis-Systemanweisung, gleicher Dokumentzugang — die Plattform ergänzt nur die
Varianten-Anweisung. Der Studienleitungsteil (Auflösung, Musterlösung) wird nie an den
Agenten übermittelt.

## 5. Sitzungsablauf (implementiert)

1. Sitzung anlegen (Teilnahmecode, Prüfmodul, Variante/Zufall, Anbieter, Vorbefragung ja/nein).
2. Einverständnis.
3. Vorbefragung (optional): BIP-angelehnte Kurzskalen, KI-Vorerfahrung.
4. Instruktion inkl. variantenspezifischem Hinweis; Start der Zeitmessung.
5. Bearbeitung: Reiter Instruktion/Dok. 1–7, ggf. KI-Assistent, Endtext mit Wortzähler,
   Countdown (weiches Limit: Hinweis bei Ablauf, Überziehung protokolliert).
6. Endgültige Abgabe → Kurzfragebogen des Moduls → Ende.
7. Auswertung: Blind-Rating (≥ 2 Rater:innen), Protokollcodierung, Export.

## 6. Operationalisierungen

- **Ergebnisqualität:** Raster des Moduls (6 Kriterien × 1–5, Summe 6–30), Mittel über
  Rater:innen; Dimensionswerte; Auszählungen (W, K, M); falsche Tatsachenangaben getrennt.
- **Übernahmequote:** Anteil der Sätze des Endtexts (≥ 4 Wörter), die normalisiert
  wortgleich („unverändert“) bzw. zu ≥ 80 % ihrer Wort-Bigramme („weitgehend“) in den
  Agentenbeiträgen vorkommen. Heuristik; Referenz bleibt manuelle Codierung.
- **Interaktion:** Prompts automatisch; Rückfragen und Korrekturen per Protokollcodierung.
- **Prozess:** Bearbeitungszeit, Überziehung, Verweildauer je Dokument, Einfügen ins
  Textfeld, Nutzung des Übernahme-Knopfs, Modellversion je Antwort.
- **Kurzfragebogen** (1–5): Vertrauen, Prüfverhalten (nur KI), Anstrengung, Zeitdruck, Zufriedenheit.
- **Psycholinguistik:** Blatt „Texte“ (Chat Person/Agent, Endtext) für LIWC-22 inkl.
  Language Style Matching.

## 7. Datenschutz und Ethik (implementiertes Verhalten)

- Alle Unternehmens- und Personendaten der Szenarien sind **fiktiv**; die Teilnehmenden
  werden vorab darauf hingewiesen (Teil C.2, E.4).
- Erhebungsdaten liegen **nur lokal** im Browser der Erhebungsstation; kein Konto, kein
  Server-Speicher, keine Cookies, keine Reichweitenmessung, keine Fremdressourcen.
- An den jeweils gewählten Modellanbieter gehen ausschließlich Aufgabenkontext und
  Chat-Nachrichten der laufenden Sitzung (Studienleitungsunterlagen nie) — keine Fragebogenantworten, kein Teilnahmecode.
- Teilnahmecodes sind pseudonym; die Zuordnungsliste führt die Studienleitung außerhalb
  der Plattform.
- Details: `legal.html` (Impressum und Datenschutzerklärung).

## 8. Ausbaustufen (Grow by Extension)

1. **Fehlerinduktion** für F2: kontrollierte, protokollierte Fehlmanipulation einzelner
   Agentenantworten an vordefinierten Stellen einer Sitzung (ergänzend zu den in die
   Module eingebauten KI-Fallen).
2. **Team-Modus** (HACTLab Stufe 3): mehrere Menschen + mehrere Agentenrollen,
   geteilter Zustand (erfordert Server-Speicher und erweiterte Rechtstexte).
3. **Resilienz-Modul:** Kurzskalen aus dem Resilienz-Review (z. B. BRS-artige eigene
   Items, Technostress-Facetten) als zuschaltbarer Erhebungsblock.
4. **Automatisches Zweitrating:** LLM-as-Judge als zweiter Bewerter neben dem
   Expertenrating — nur zur Konvergenzprüfung, nicht als Ersatz.
5. **Kommerzielle Anwendungen** (HACTLab): Personalentwicklung, KI-Kompetenzdiagnostik,
   Training, Führungskräfteentwicklung — technisch „mit marginalen Änderungen" auf
   derselben Plattform.

## 9. Zentrale Literatur (Auswahl, APA 7)

Dellermann, D., Ebel, P., Söllner, M., & Leimeister, J. M. (2019). Hybrid intelligence.
*Business & Information Systems Engineering, 61*(5), 637–643.
Dietvorst, B. J., Simmons, J. P., & Massey, C. (2015). Algorithm aversion. *Journal of
Experimental Psychology: General, 144*(1), 114–126.
Fragiadakis, G., Diou, C., Kousiouris, G., & Nikolaidou, M. (2024). Evaluating human-AI
collaboration (arXiv:2407.19098).
Gonzalez, C., et al. (2026). Toward a science of human–AI teaming for decision making.
*PNAS Nexus, 5*(3), pgag030.
Hart, S. G., & Staveland, L. E. (1988). Development of NASA-TLX. In *Human mental
workload* (S. 139–183). North-Holland.
Horton, J. J., Filippas, A., & Manning, B. S. (2023). *Homo silicus* (NBER 31122).
Hossiep, R., & Paschen, M. (2019). *BIP.* Hogrefe. (Nur Konstruktdefinitionen;
kein Originalmaterial in dieser Plattform.)
Lee, J. D., & See, K. A. (2004). Trust in automation. *Human Factors, 46*(1), 50–80.
Lou, B., Lu, T., Raghu, T. S., & Zhang, Y. (2025). Unraveling human-AI teaming
(arXiv:2504.05755).
Raisch, S., & Krakowski, S. (2021). The automation–augmentation paradox. *Academy of
Management Review, 46*(1), 192–210.
Seeber, I., et al. (2019). Machines as teammates. *Information & Management.*
Woolley, A. W., et al. (2010). Evidence for a collective intelligence factor. *Science,
330*(6004), 686–688.
