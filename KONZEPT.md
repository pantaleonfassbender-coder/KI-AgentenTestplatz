# KI-AgentenTestplatz — Konzeption

**Agentische Testbench für die empirische Forschung zur Interaktion von Menschen mit KI-Agenten**

Wissenschaftliche Leitung: Dr. Pantaleon Fassbender · Dr. Uwe Klein
Stand: 15. September 2026

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

## 2. Forschungsfragen (aus dem Arbeitspapier, Teil C.1)

- **F1** Entscheidungsqualität nach Aufgabentyp (Planung / Durchführung / Kontrolle / Führung)
- **F2** Vertrauensverlauf über Runden, insbesondere nach sichtbaren Agentenfehlern
- **F3** Zusammenhang berufsbezogener Persönlichkeitsmerkmale (BIP-angelehnt) mit
  Intensität und Qualität der Zusammenarbeit
- **F4** Anbietervergleich Claude / GPT / Gemini
- **F5** Wirkung des Autonomiegrads (Vorschlag vs. eigenständige Ausführung mit Kontrolle)
- **F6** Rollenverteilung bei sachbezogenen vs. personenbezogenen Aufgaben

## 3. Architektur: Abbildung der sieben MVRP-Schichten

| MVRP-Schicht (HACTLab) | Umsetzung in dieser Plattform |
|---|---|
| **L1 User Interface** | Statische Web-Oberfläche (deutsch, ohne Framework, ohne Fremdressourcen): Startseite, Sitzungs-Runner (`study.html`), Forschungsansicht (`admin.html`) |
| **L2 Scenario Engine** | Fiktive Organisation „NordTec GmbH" mit rundenübergreifendem Kennzahlenzustand (Budget-, Umsatz-, Risikoindex); Entscheidungen einer Runde verändern das Briefing der Folgerunde (Planspiel-Logik, Teil B.1) |
| **L3 Task Engine** | Sechs Aufgabenmodule E.1–E.6 als strukturierte Konfigurationsdatensätze (`js/tasks-data.js`) mit Szenariotext, Eingabedaten, Bearbeitungsauftrag, Bewertungsraster und Metadaten (Managementfunktion, sach-/personenbezogen, strukturiert/offen) |
| **L4 Workflow & Orchestration** | Rundenmaschine in `js/engine.js` + `js/study.js`: Einverständnis → Baseline → n Runden (Briefing → Bearbeitung mit Agent → Entscheidung → Kurzerhebung) → Abschlusserhebung; Autonomiegrad within-subject randomisierbar |
| **L5 AI Integration** | Eine Netlify Function (`/api/agent`) als Agenten-Abstraktionsschicht mit einheitlicher Schnittstelle zu **Anthropic (Claude)**, **OpenAI (GPT)** und **Google (Gemini)**; drei funktional unterschiedliche Agentenrollen (Analyst, Kritiker, Koordinator) ohne direkte Agent-zu-Agent-Kommunikation — Stufe 2 der HACTLab-Reifegradlogik |
| **L6 Data Collection** | Vollständiges Interaktionsprotokoll (Prompts, Antworten, Modellversion, Zeitstempel, Latenz), Reliance-Index (heuristisch: n-Gramm-Überlappung Entscheidung ↔ Agentenbeiträge), Kurzerhebung je Runde (Vertrauen, NASA-TLX-Kurzform), Bewertungsraster (Expertenrating 1–5), Baseline- und Abschlussfragebogen |
| **L7 Data Storage & Management** | Ausschließlich lokal im Browser der Erhebungsstation (`localStorage`), pseudonyme Teilnahmecodes; Export als JSON (vollständig) und CSV (flach, eine Zeile je Runde) über die Forschungsansicht — kein Server-Speicher, keine Datenbank |

## 4. Umsetzungsmodule (Bauplan der Plattform)

- **Modul 0 — Fundament:** Repository, Startseite, Gestaltung, Rechtsseite (Impressum +
  Datenschutzerklärung), Lizenz, Deploy-Konfiguration.
- **Modul 1 — Task Engine:** Aufgabenmodule E.1–E.6 mit fiktiven Daten und
  Bewertungsrastern (je fünf Grundkriterien + modulspezifische Ergänzung, Teil E).
- **Modul 2 — Agenten-Anbindung:** Netlify Function `/api/agent` (Anbieter Claude / GPT /
  Gemini, Rollen-Systemprompts, Autonomiegrad-Instruktionen, Eingabevalidierung,
  Zeitbudget < 26 s, Gemini ohne Denk-Budget).
- **Modul 3 — Rundenmaschine:** Sitzungsaufbau (Teilnahmecode, Anbieter, Autonomieplan,
  Rundenplan), Rundenablauf nach Teil B.3, Kennzahlen-Fortschreibung.
- **Modul 4 — Erhebung:** Einverständnis, Baseline (BIP-angelehnte Kurzskalen — eigene
  Items, kein Hogrefe-Originalmaterial —, KI-Vorerfahrung), Kurzerhebung je Runde
  (Vertrauen 1–7, NASA-TLX-Kurzform 0–100), Abschlussfragebogen (Vertrauen/Reliance nach
  Lee & See angelehnt, offene Retrospektive-Fragen).
- **Modul 5 — Forschungsansicht:** Sitzungsübersicht, Bewertungsraster-Eingabe
  (Expertenrating), Datenexport JSON/CSV, Löschfunktion.
- **Modul 6 — Dokumentation:** README, dieses Konzept, Rechtstexte gegen den Code geprüft.

## 5. Studienablauf (implementiert)

1. **Sitzung anlegen** (Startseite): Teilnahmecode (pseudonym), Anbieter
   (between-subject: Claude / GPT / Gemini), Autonomieplan (konstant niedrig, konstant
   hoch oder within-subject randomisiert in zwei Blöcken), Rundenzahl (3–15,
   Standard 6), Modulfolge (Standard: E1 → E2 → E6 → E3 → E4 → E5; bei mehr Runden
   Vertiefungsrunden mit fortgeschriebenen Kennzahlen).
2. **Einverständnis:** Hinweis auf fiktive Daten, lokale Speicherung, Übermittlung der
   Chat-Inhalte an den gewählten Modellanbieter; ohne Zustimmung keine Sitzung.
3. **Baseline:** Kurzskalen zu Leistungsmotivation, Flexibilität, Durchsetzungsstärke,
   Belastbarkeit (je 3 Items, 7-stufig, eigene Formulierungen in Anlehnung an die
   BIP-Konstruktdefinitionen) + KI-Vorerfahrung (Kontrollvariable, Teil C.2).
4. **Runden 1…n:** Briefing (inkl. Kennzahlenlage) → Bearbeitung mit Agent (Chat;
   bei hoher Autonomie erstellt der Agent unaufgefordert einen vollständigen Entwurf,
   bei niedriger liefert er nur Vorschläge auf Anfrage) → finale Entscheidung der
   Person (Freitext) → automatischer Reliance-Index → Kurzerhebung → Kennzahlen-Update.
5. **Abschluss:** Vertrauens-/Reliance-Skala, offene Fragen (Rollenverteilung, kritische
   Momente, Aufgabentyp-Unterschiede), Dank-Seite.
6. **Auswertung:** Forschungsansicht — Expertenrating je Runde nach Bewertungsraster,
   Export, qualitative Codierung der Interaktionsprotokolle extern (JSON).

## 6. Operationalisierungen

- **Reliance-Index** (Teil F.5): Anteil der Wort-Bigramme der finalen Entscheidung, die
  in den Agentenbeiträgen derselben Runde vorkommen (0–1). Heuristik zur Erstsichtung;
  manuelle Codierung bleibt Referenzverfahren.
- **Entscheidungsqualität:** Expertenrating 1–5 je Rubrik-Kriterium (Vollständigkeit,
  Konsistenz, Nachvollziehbarkeit, Angemessenheit, Effizienz + Modulkriterium) in der
  Forschungsansicht, nachträglich erfassbar.
- **Ökonomischer Erfolg:** vereinfachtes Planspielmodell — Budget-, Umsatz- und
  Risikoindex werden je Runde aus Ratingmittel (falls vorhanden) bzw. neutral
  fortgeschrieben; ausdrücklich als Kontextsignal, nicht als validiertes Erfolgsmaß.
- **Risikoeinschätzung:** Vor Abgabe Selbsteinschätzung der Erfolgswahrscheinlichkeit
  (0–100 %), Abgleich in der Auswertung (Teil C.4).
- **Beanspruchung:** NASA-TLX-Kurzform (Geistige Anforderung, Zeitdruck, Leistung,
  Anstrengung, Frustration; 0–100) nach jeder Runde (Hart & Staveland, 1988).
- **Vertrauen:** Einzelitem je Runde (7-stufig) für Verlaufsanalysen (F2);
  Abschlussskala in Anlehnung an Lee & See (2004).
- **Versionierung** (Teil F.5): Modell-ID und Zeitstempel jeder API-Antwort werden
  mitprotokolliert, da sich Agentenverhalten zwischen Modellversionen ändert.

## 7. Datenschutz und Ethik (implementiertes Verhalten)

- Alle Unternehmens- und Personendaten der Szenarien sind **fiktiv**; die Teilnehmenden
  werden vorab darauf hingewiesen (Teil C.2, E.4).
- Erhebungsdaten liegen **nur lokal** im Browser der Erhebungsstation; kein Konto, kein
  Server-Speicher, keine Cookies, keine Reichweitenmessung, keine Fremdressourcen.
- An den jeweils gewählten Modellanbieter gehen ausschließlich Aufgabenkontext und
  Chat-Nachrichten der laufenden Runde — keine Fragebogenantworten, kein Teilnahmecode.
- Teilnahmecodes sind pseudonym; die Zuordnungsliste führt die Studienleitung außerhalb
  der Plattform.
- Details: `legal.html` (Impressum und Datenschutzerklärung).

## 8. Ausbaustufen (Grow by Extension)

1. **Fehlerinduktion** für F2: kontrollierte, protokollierte Fehlmanipulation einzelner
   Agentenantworten in vordefinierten Runden.
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
