/* KI-AgentenTestplatz — Plattformkern (modular).
   Rahmenmodell (vier Dimensionen des Managementprozesses), Studienvarianten,
   Modul-Registry und Dokument-Rendering. Prüfmodule registrieren sich über
   KATP.registerModule(...) aus eigenen Dateien unter js/modules/; ihr
   Studienleitungsteil (Bewertungsraster, Fallen, Musterlösung) über
   KATP.registerStudienleitung(...) aus einer separaten Datei, die nur die
   Forschungsansicht lädt. "Grow by Extension, not by Replacement". */

window.KATP = (function () {
  /* Übergeordnetes Modell: jede Teilleistung eines Prüfmoduls wird einer der vier
     Dimensionen zugeordnet; Bewertungskriterien tragen dieselbe Kennung, sodass
     Dimensionswerte modulübergreifend vergleichbar sind. */
  const DIMENSIONEN = {
    analyse: {
      name: "Analyse",
      def: "Informationen erschließen und prüfen: Quellen sichten, Aussagekraft gewichten, " +
        "Widersprüche und Muster erkennen, Einzelfall von Muster trennen.",
    },
    planung: {
      name: "Planung",
      def: "Aus der Analyse Ziele, Empfehlungen und Maßnahmen ableiten: priorisieren, " +
        "Verantwortliche und Zeitpunkte festlegen.",
    },
    durchfuehrung: {
      name: "Durchführung",
      def: "Das Arbeitsergebnis erstellen: Urteil bilden und adressatengerecht, " +
        "strukturiert und differenziert ausformulieren.",
    },
    kontrolle: {
      name: "Kontrolle",
      def: "Ergebnisse absichern: Aussagen belegen, Zahlen und Fakten prüfen — in den " +
        "KI-Varianten insbesondere Aussagen des Agenten an den Quellen verifizieren.",
    },
  };
  const DIM_IDS = Object.keys(DIMENSIONEN);

  /* Studienvarianten (between-subject). Die KI-Varianten unterscheiden sich
     ausschließlich in der Varianten-Anweisung an den Agenten; Dokumente,
     Aufgabenstellung, Modell und Basis-Systemanweisung sind identisch. */
  const VARIANTEN = {
    ohne_ki: {
      id: "ohne_ki",
      name: "Ohne KI",
      kurz: "Postkorb-Bearbeitung ohne Assistenz",
      ki: false,
      teilnehmerHinweis: "Sie bearbeiten die Aufgabe eigenständig, ohne KI-Unterstützung — " +
        "wie einen Posteingang ohne Assistenz.",
      beschreibung: "Die Aufgabe wird eigenständig bearbeitet; es gibt keinen Agenten und " +
        "keine Übermittlung an Modellanbieter.",
    },
    niedrig: {
      id: "niedrig",
      name: "KI-Unterstützung (Autonomie niedrig)",
      kurz: "KI als reine Unterstützung",
      ki: true,
      autoEntwurf: false,
      uebernahmeKnopf: false,
      teilnehmerHinweis: "Ihnen steht ein KI-Assistent zur Seite. Er beantwortet Fragen zu den " +
        "Dokumenten, sucht Belegstellen und prüft Aussagen auf Ihre Bitte hin. Die Bewertung " +
        "verfassen Sie selbst.",
      beschreibung: "Der Agent beantwortet Fragen, sucht Belegstellen, fasst Dokumente " +
        "zusammen und prüft Aussagen auf Anfrage. Er verfasst die Bewertung nicht — " +
        "Urteil und Text bleiben bei der Person.",
      anweisung:
        "VARIANTE: KI-UNTERSTÜTZUNG MIT NIEDRIGER AUTONOMIE.\n" +
        "Du bist ausschließlich unterstützend tätig. Du beantwortest Fragen zu den Dokumenten, " +
        "suchst Belegstellen, fasst einzelne Dokumente zusammen und prüfst Aussagen der Person, " +
        "wenn sie darum bittet. Du verfasst die Bewertung NICHT — weder vollständig noch in " +
        "einzelnen Abschnitten, und du lieferst keine ausformulierten Textbausteine für den " +
        "Endtext. Bittet die Person darum, weist du freundlich darauf hin, dass sie den Text " +
        "selbst verfasst, und bietest stattdessen Hinweise oder Belegstellen an. Werturteile " +
        "und Empfehlungen trifft die Person; du ergreifst keine Initiative über die jeweilige " +
        "Frage hinaus.",
    },
    hoch: {
      id: "hoch",
      name: "KI-Assistent (Autonomie hoch)",
      kurz: "KI kann die ganze Aufgabe übernehmen",
      ki: true,
      autoEntwurf: true,
      uebernahmeKnopf: true,
      teilnehmerHinweis: "Ihnen steht ein KI-Assistent zur Seite, der die Aufgabe vollständig " +
        "übernehmen kann: Er erstellt zu Beginn eigenständig einen Entwurf und überarbeitet ihn " +
        "auf Wunsch. Sie prüfen das Ergebnis, können es in Ihr Textfeld übernehmen und anpassen " +
        "und verantworten die Abgabe.",
      beschreibung: "Der Agent erstellt zu Beginn eigenständig eine vollständige, " +
        "abgabefertige Bewertung und überarbeitet sie auf Wunsch; die Person prüft, " +
        "übernimmt oder korrigiert und verantwortet die Abgabe.",
      anweisung:
        "VARIANTE: HOCH AUTONOMER KI-ASSISTENT.\n" +
        "Du kannst die gesamte Aufgabe übernehmen. Erstelle auf den ersten Arbeitsauftrag hin " +
        "eigenständig und ohne Rückfragen eine vollständige, abgabefertige Fassung des " +
        "geforderten Ergebnisses, die alle Vorgaben der Aufgabenstellung erfüllt. Gib den Text " +
        "so aus, dass er unverändert als Endtext übernommen werden kann (ohne Vorbemerkung). " +
        "Überarbeite danach auf Wunsch einzelne Teile oder den ganzen Text und gib " +
        "überarbeitete Fassungen stets vollständig aus. Die Person prüft dein Ergebnis und " +
        "verantwortet die Abgabe.",
      autoAuftrag: "Bitte erstelle jetzt eigenständig eine vollständige, abgabefertige Fassung " +
        "des geforderten Ergebnisses.",
    },
  };

  const MODULE = {};
  const STUDIENLEITUNG = {};

  /* Angekündigte Prüfmodule (nur Anzeige im Modulkatalog, bis ihre Datei vorliegt). */
  const GEPLANT = [
    { titel: "Wettbewerbsanalyse", gegenstandsbereich: "Markt und Wettbewerb", aufgabentyp: "sachbezogen" },
    { titel: "Angebotsbewertung", gegenstandsbereich: "Einkauf und Vertrieb", aufgabentyp: "sachbezogen" },
  ];

  function registerModule(def) {
    const errs = [];
    if (!def || !/^[a-z0-9-]+$/.test(def.id || "")) errs.push("id (a-z, 0-9, -) fehlt");
    if (!def.titel) errs.push("titel fehlt");
    if (!Array.isArray(def.dokumente) || def.dokumente.length === 0) errs.push("dokumente fehlen");
    if (!def.instruktion) errs.push("instruktion fehlt");
    for (const d of DIM_IDS) {
      if (!def.dimensionen || !def.dimensionen[d]) errs.push(`dimensionen.${d} fehlt`);
    }
    if (errs.length) {
      console.error("Prüfmodul nicht registriert:", def && def.id, errs);
      return;
    }
    MODULE[def.id] = def;
  }

  function registerStudienleitung(moduleId, def) {
    for (const k of def.raster || []) {
      if (!DIMENSIONEN[k.dimension]) console.error(`Kriterium ${k.id}: unbekannte Dimension ${k.dimension}`);
    }
    STUDIENLEITUNG[moduleId] = def;
  }

  function aktiveModule() {
    return Object.values(MODULE).filter((m) => m.status !== "entwurf");
  }

  /* ---- Dokument-Rendering (DOM und Klartext für den Agenten) ---- */
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function renderBlocks(blocks, into) {
    for (const b of blocks) {
      if (b.p != null) into.appendChild(el("p", null, b.p));
      else if (b.h != null) into.appendChild(el("h4", null, b.h));
      else if (b.ul) {
        const ul = el("ul");
        for (const it of b.ul) ul.appendChild(el("li", null, it));
        into.appendChild(ul);
      } else if (b.ol) {
        const ol = el("ol");
        for (const it of b.ol) ol.appendChild(el("li", null, it));
        into.appendChild(ol);
      } else if (b.table) {
        const t = el("table");
        if (b.table.head) {
          const thead = el("thead");
          const tr = el("tr");
          for (const c of b.table.head) tr.appendChild(el("th", null, c));
          thead.appendChild(tr);
          t.appendChild(thead);
        }
        const tbody = el("tbody");
        for (const row of b.table.rows) {
          const tr = el("tr");
          row.forEach((c, i) => tr.appendChild(el(i === 0 && b.table.rowHead ? "th" : "td", null, c)));
          tbody.appendChild(tr);
        }
        t.appendChild(tbody);
        into.appendChild(t);
      }
    }
  }

  function renderDokument(dok) {
    const wrap = el("article", "dokument");
    wrap.appendChild(el("div", "dok-nr", `Dok. ${dok.nr}`));
    wrap.appendChild(el("h3", null, dok.titel));
    if (dok.kopf && dok.kopf.length) {
      const dl = el("dl", "dok-kopf");
      for (const [k, v] of dok.kopf) {
        dl.appendChild(el("dt", null, k));
        dl.appendChild(el("dd", null, v));
      }
      wrap.appendChild(dl);
    }
    renderBlocks(dok.inhalt, wrap);
    return wrap;
  }

  function blocksToText(blocks) {
    const out = [];
    for (const b of blocks) {
      if (b.p != null) out.push(b.p);
      else if (b.h != null) out.push(b.h);
      else if (b.ul) out.push(b.ul.map((x) => "- " + x).join("\n"));
      else if (b.ol) out.push(b.ol.map((x, i) => `${i + 1}. ${x}`).join("\n"));
      else if (b.table) {
        const lines = [];
        if (b.table.head) lines.push("| " + b.table.head.join(" | ") + " |");
        for (const r of b.table.rows) lines.push("| " + r.join(" | ") + " |");
        out.push(lines.join("\n"));
      }
    }
    return out.join("\n\n");
  }

  function dokumentText(dok) {
    const parts = [`=== Dok. ${dok.nr}: ${dok.titel} ===`];
    if (dok.kopf && dok.kopf.length) parts.push(dok.kopf.map(([k, v]) => `${k}: ${v}`).join(" · "));
    parts.push(blocksToText(dok.inhalt));
    return parts.join("\n");
  }

  function instruktionText(mod) {
    return blocksToText(mod.instruktion.inhalt);
  }

  /* Systemanweisung für den Agenten: Basis (je Modul identisch für alle KI-Varianten)
     + Varianten-Anweisung + Aufgabenstellung + sämtliche Dokumente. */
  function systemPrompt(mod, varianteId) {
    const v = VARIANTEN[varianteId];
    return [
      mod.agent.basis,
      v.anweisung,
      "AUFGABENSTELLUNG DER PERSON (identisch für alle Studienvarianten):\n" + instruktionText(mod),
      "DOKUMENTE (vollständig, in der vorgegebenen Reihenfolge):\n\n" +
        mod.dokumente.map(dokumentText).join("\n\n"),
    ].join("\n\n");
  }

  return {
    DIMENSIONEN, DIM_IDS, VARIANTEN, MODULE, STUDIENLEITUNG, GEPLANT,
    registerModule, registerStudienleitung, aktiveModule,
    el, renderBlocks, renderDokument, dokumentText, instruktionText, systemPrompt,
  };
})();
