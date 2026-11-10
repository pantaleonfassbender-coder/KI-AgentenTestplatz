# KI-AgentenTestplatz

**Modulare Testbench für die empirische Forschung zur Zusammenarbeit von Menschen mit
KI-Agenten** (Claude · GPT · Gemini · Open-Source-Modelle · Bearbeitung ohne KI)

Wissenschaftliche Leitung: Dr. Pantaleon Fassbender · Dr. Uwe Klein

Teilnehmende bearbeiten ein **Prüfmodul** — eine Postkorbaufgabe der fiktiven
**NordTec GmbH** mit Unterlagen, Auftrag und Zeitansatz — in einer von drei
Studienvarianten: **ohne KI**, mit **KI als reiner Unterstützung** (Autonomie niedrig) oder
mit einem **hoch autonomen KI-Assistenten**, der die ganze Aufgabe übernehmen kann.
Alle Module sind einem gemeinsamen Rahmenmodell zugeordnet (**Analyse · Planung ·
Durchführung · Kontrolle**). Konzeption: [KONZEPT.md](KONZEPT.md).

Erstes Modul: **Mitarbeiterbewertung** (MB-NORDTEC-01, Aufgabengestaltung Dr. Uwe Klein) —
schriftliche Bewertung des Teamleiters Gunnar Müller auf Basis von sieben Dokumenten,
400–600 Wörter, 30–60 Minuten. In Vorbereitung: Wettbewerbsanalyse, Angebotsbewertung.

## Aufbau

| Pfad | Inhalt |
|---|---|
| `index.html` + `js/index-page.js` | Startseite der Studienleitung: Rahmenmodell und Modulzuordnung, Varianten, Sitzungsanlage (Modul, Variante oder ausgewogene Zufallszuweisung, Anbieter, Vorbefragung), Modulkatalog |
| `study.html` + `js/study.js` | Sitzung: Einverständnis → (Vorbefragung) → Instruktion → Bearbeitung (Dokument-Reiter, ggf. KI-Assistent, Endtext mit Wortzähler, Countdown) → Kurzfragebogen |
| `admin.html` + `js/admin.js` | Forschungsansicht: Modulunterlagen der Studienleitung, Sitzungen mit Detail und Protokollcodierung, **Blind-Rating** (mehrere Rater:innen), Export/Import, Vorbefragungs-Editor |
| `js/platform.js` | Plattformkern: Rahmenmodell (`DIMENSIONEN`), Varianten mit Agentenanweisungen (`VARIANTEN`), Modul-Registry, Dokument-Rendering, Systemanweisung |
| `js/modules/<id>.js` | Prüfmodul, teilnehmendenseitig (Instruktion, Dokumente, Kurzfragebogen, Basis-Systemanweisung, Dimensionszuordnung) |
| `js/modules/<id>.studienleitung.js` | Studienleitungsteil (Profil, Widersprüche, Fallen, Raster mit Dimension, Messgrößen, Musterlösung, Faktenblatt) — **nur in `admin.html` geladen**, nie an den Agenten übermittelt |
| `js/modules/VORLAGE_pruefmodul.js.txt` | Vorlage für weitere Prüfmodule |
| `js/session.js`, `js/metrics.js` | Sitzungsanlage/Zuweisung; Prozessmaße (Dauer, Übernahmequote, Reliance, Verweildauer, Einfügen) und Rating-Aggregation |
| `js/surveys.js` | Vorbefragung (BIP-angelehnte eigene Kurzskalen, KI-Vorerfahrung), editierbar, versioniert |
| `js/api-client.js`, `netlify/functions/agent.mts` | Agenten-Abstraktionsschicht `/api/agent` (Anthropic, OpenAI, Google, OpenAI-kompatibler Open-Source-Endpunkt) |
| `js/xlsx-export.js` | Abhängigkeitsfreier XLSX-Generator |

Kein Build-Schritt, keine Abhängigkeiten, keine Fremdressourcen. Alle Studiendaten liegen
ausschließlich lokal im Browser der Erhebungsstation (localStorage, Schlüssel
`katp_sessions_v2`).

## Studienvarianten

| Variante | Rolle der KI |
|---|---|
| Ohne KI | Postkorb-Bearbeitung ohne Assistenz; keine Übermittlung an Modellanbieter |
| KI-Unterstützung (Autonomie niedrig) | beantwortet Fragen, sucht Belege, prüft auf Anfrage; verfasst die Bewertung **nicht** |
| KI-Assistent (Autonomie hoch) | erstellt zu Beginn eigenständig eine vollständige Fassung, überarbeitet auf Wunsch; Knopf „In Endtext übernehmen“ |

Dokumente, Aufgabenstellung, Modell und Basis-Systemanweisung sind in allen KI-Varianten
identisch; ergänzt wird nur die Varianten-Anweisung (einsehbar unter Forschungsansicht →
Modulunterlagen → Systemanweisungen). Zuweisung manuell oder „zufällig (ausgewogen)“
(Variante mit den wenigsten Sitzungen je Gerät und Modul).

## Erhebung und Auswertung

- **Automatisch:** Bearbeitungszeit und Überziehung (weiches Zeitlimit mit Countdown),
  Wortzahl, Prompts, Agentenantworten, Modellversion, Ansicht und Verweildauer je
  Dokument, Einfügen ins Textfeld, Nutzung des Übernahme-Knopfs, **Übernahmequote**
  (Anteil der Sätze des Endtexts, die unverändert bzw. weitgehend ≥ 80 % aus
  Agentenbeiträgen stammen), Reliance-Index (Bigramme).
- **Kurzfragebogen** des Moduls (1–5; Items zu Vertrauen und Prüfverhalten nur in KI-Varianten).
- **Blind-Rating:** Rater:innen sehen nur Endtext und neutrale Kennung; sechs Kriterien
  (1–5, Summe 6–30) mit Ankern, Auszählung W1–W5 / K1–K3 / M1–M3, falsche
  Tatsachenangaben. Mehrere Rater:innen je Text; Zusammenführung über JSON-Import.
- **Protokollcodierung** (nicht blind): Rückfragen und Korrekturen der Person.
- **Excel-Export:** Blätter „Sitzungen“ (eine Zeile je Sitzung, inkl. Rater-Mittel,
  Rastersumme und **Dimensionswerte** `dim_analyse` … `dim_kontrolle`), „Ratings“ (eine
  Zeile je Sitzung × Rater:in, für Übereinstimmungsmaße), „Texte“ (LIWC-tauglich) und
  „Ereignisse“.

## Neues Prüfmodul ergänzen

Siehe `js/modules/VORLAGE_pruefmodul.js.txt`: zwei Dateien anlegen, jede Teilleistung und
jedes Rasterkriterium einer Dimension zuordnen, Script-Tags in `index.html`, `study.html`
und `admin.html` ergänzen (Studienleitungsdatei nur in `admin.html`).

## Deployment (Netlify)

1. Repository mit Netlify verbinden (Publish directory `.`, kein Build-Befehl).
2. API-Schlüssel per Netlify AI Gateway oder Umgebungsvariablen `ANTHROPIC_API_KEY`,
   `OPENAI_API_KEY`, `GEMINI_API_KEY`; optional Modelle via `ANTHROPIC_MODEL`
   (Standard `claude-sonnet-5`), `OPENAI_MODEL` (`gpt-5`), `GEMINI_MODEL`
   (`gemini-2.5-flash`); Open Source via `OSS_BASE_URL`, `OSS_MODEL`, `OSS_API_KEY`;
   optional `AGENT_TIMEOUT_MS` (Standard 55000, zulässig 10000–58000).
3. **Zugriffsschutz empfohlen** (Passwortschutz des Deploys): Der Studienleitungsteil
   (Musterlösung, Fallen) ist als statische Datei technisch abrufbar, und `/api/agent`
   ist nur durch Größen- und Zeitlimits geschützt.

Lokal: beliebiger statischer Server (z. B. `python -m http.server`); Agentenaufrufe
erfordern `netlify dev`.

## Hinweise

- Sämtliche Szenariodaten sind **fiktiv**.
- Die Vorbefragungsskalen sind **eigene Formulierungen** in Anlehnung an die BIP-Bereiche
  (Hossiep & Paschen, 2019); kein Originalmaterial.
- Übernahmequote und Reliance-Index sind Heuristiken zur Erstsichtung; Referenz bleibt die
  manuelle Codierung.
- Sitzungen der früheren Rundenfassung (E1–E6) bleiben im Browser unter
  `katp_sessions_v1` erhalten und lassen sich in der Forschungsansicht als JSON sichern.
- Pretest (3–5 Personen) vor der Hauptstudie: Bearbeitungszeit, Verständlichkeit und die
  Antwortzeit der Erstfassung in der Variante „Autonomie hoch“. Zeitbudget der Function: 55 s
  (Netlify-Limit für synchrone Functions: 60 s), anpassbar über die Umgebungsvariable
  `AGENT_TIMEOUT_MS`.

## Lizenz

Code: MIT. Texte/Aufgabenmaterial: CC BY 4.0. Details in [LICENSE](LICENSE).
