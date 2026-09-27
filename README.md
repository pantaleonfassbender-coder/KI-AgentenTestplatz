# KI-AgentenTestplatz

**Agentische Testbench für die empirische Forschung zur Interaktion von Menschen mit
KI-Agenten** (Claude · GPT · Gemini · Open-Source-Modelle · Kontrollbedingung ohne KI)

Wissenschaftliche Leitung: Dr. Pantaleon Fassbender · Dr. Uwe Klein

Die Plattform ist eine Minimal Viable Research Platform für experimentelle Studien zur
Mensch-KI-Kollaboration bei unternehmerischen Entscheidungs- und Führungsaufgaben:
Teilnehmende bearbeiten über mehrere Geschäftsrunden Aufgabenmodule der fiktiven
**NordTec GmbH** — wahlweise gemeinsam mit einem KI-Agenten oder eigenständig in einer
Postkorb-Kontrollbedingung. Erfasst werden Interaktionsprotokolle, Reliance-Index,
Vertrauens- und Beanspruchungsmaße (NASA-TLX-Kurzform) sowie Entscheidungsqualität per
Bewertungsraster. Konzeption: [KONZEPT.md](KONZEPT.md).

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` | Startseite mit den sechs Aufgabenmodulen im Volltext, Sitzungsanlage (Bedingung, Autonomiegrad, Rundenzahl) |
| `study.html` + `js/study.js` | Sitzungs-Runner: Einverständnis → Baseline → Runden → Abschluss |
| `admin.html` + `js/admin.js` | Forschungsansicht: Forschungsfragen, Bewertungsleitfaden, kriterienbasiertes Expertenrating, Export (JSON/Excel), Löschen |
| `legal.html` | Impressum und Datenschutzerklärung |
| `js/tasks-data.js` | Task Engine: Aufgabenmodule E.1–E.6, Agentenrollen, Autonomie-Instruktionen, Bewertungsleitfaden (`RATING_CRITERIA`) |
| `js/xlsx-export.js` | Abhängigkeitsfreier XLSX-Generator für den Datenexport (Blätter „Runden" und „Teilnehmende") |
| `js/engine.js` | Rundenmaschine, Kennzahlen-Fortschreibung, Reliance-Index |
| `js/api-client.js` | Client der Agenten-Abstraktionsschicht |
| `js/surveys.js` | Erhebungsinstrumente als modulare Konfiguration (BIP-angelehnte eigene Kurzskalen, NASA-TLX, Abschlussskala); anpassbar über den Fragebogen-Editor der Forschungsansicht, Versionskennung je Sitzung |
| `netlify/functions/agent.mts` | Serverfunktion `/api/agent`: einheitliche Schnittstelle zu Anthropic, OpenAI, Google und einem Open-Source-Endpunkt |

Kein Build-Schritt, keine Abhängigkeiten, keine Fremdressourcen. Alle Studiendaten
liegen ausschließlich lokal im Browser des Erhebungsgeräts (localStorage) und werden
als JSON (vollständig) oder als Excel-Arbeitsmappe (.xlsx) exportiert — Blätter
„Runden" (eine Zeile je Runde), „Teilnehmende" (eine Zeile je Person) und „Texte"
(eine Zeile je Texteinheit: Chat-Beiträge von Person und Agent, finale
Entscheidungen, offene Abschlussantworten; Spalte `text` für psycholinguistische
Auswertungen, z. B. LIWC-22, inkl. Language Style Matching über die
Personen-/Agenten-Zeilen).

## Untersuchungsbedingungen

- **KI-Agent** (between-subject): Claude (Anthropic), GPT (OpenAI), Gemini (Google)
  oder ein frei konfigurierbares **Open-Source-Modell** über einen OpenAI-kompatiblen
  Endpunkt (z. B. Ollama, vLLM, Groq, Together).
- **Autonomiegrad** (within-subject randomisierbar): niedrig (Agent macht nur
  Vorschläge) vs. hoch (Agent erstellt eigenständig Entwürfe, Mensch kontrolliert).
- **Kontrollbedingung ohne KI**: Postkorb-Bearbeitung — dieselben Aufgabenmodule und
  Erhebungen, aber ohne Agent; es findet keine Übermittlung an Modellanbieter statt.
  Vertrauensitems entfallen, die offenen Abschlussfragen sind angepasst.

## Deployment (Netlify)

1. Repository mit Netlify verbinden (Publish directory `.`, kein Build-Befehl).
2. API-Schlüssel: Entweder das **Netlify AI Gateway** aktivieren (injiziert
   Schlüssel/Basis-URLs für Anthropic, OpenAI und Gemini automatisch) oder
   Umgebungsvariablen setzen: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`.
3. Optional Modelle überschreiben: `ANTHROPIC_MODEL` (Standard `claude-sonnet-5`),
   `OPENAI_MODEL` (Standard `gpt-5`), `GEMINI_MODEL` (Standard `gemini-2.5-flash`).
4. Für die Open-Source-Option: `OSS_BASE_URL` (OpenAI-kompatibler Endpunkt, ohne
   `/v1`), `OSS_MODEL` (Modellname beim Endpunkt), optional `OSS_API_KEY`.
   Ohne diese Variablen meldet die Option einen verständlichen Konfigurationsfehler.

Die tatsächlich verwendete Modellversion wird bei jeder Antwort mitprotokolliert.

Lokal testen: `netlify dev` (Functions inklusive). Ohne Functions lässt sich die
Oberfläche mit jedem statischen Server prüfen; Agentenaufrufe erfordern die Function.

## Hinweise

- Sämtliche Szenariodaten (NordTec GmbH, Personen, Angebote) sind **fiktiv**.
- Die Baseline-Kurzskalen sind **eigene Formulierungen in Anlehnung an die vier
  BIP-Bereiche** (Hossiep & Paschen, 2019); Originalmaterial des lizenzierten
  Verfahrens ist nicht enthalten.
- Der Reliance-Index (Wort-Bigramm-Überlappung) ist eine Heuristik zur Erstsichtung;
  Referenzverfahren bleibt die manuelle Codierung der Protokolle.
- Der Endpunkt `/api/agent` ist öffentlich erreichbar und nur durch Größen- und
  Zeitlimits geschützt; für Felderhebungen außerhalb kontrollierter Termine empfiehlt
  sich ein zusätzlicher Zugriffsschutz (z. B. Passwortschutz des Deploys).

## Lizenz

Code: MIT. Texte/Aufgabenmaterial: CC BY 4.0. Details in [LICENSE](LICENSE).
