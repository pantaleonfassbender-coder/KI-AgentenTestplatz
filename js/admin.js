/* Forschungsansicht: Sitzungsliste, Expertenrating nach Bewertungsraster, Export, Löschen. */

(function () {
  const $ = (id) => document.getElementById(id);
  const PROVIDER_NAMES = {
    anthropic: "Claude", openai: "GPT", gemini: "Gemini",
    opensource: "Open-Source", none: "ohne KI (Postkorb)",
  };

  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  function csvCell(v) {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function roundsToCsv(sessions) {
    const head = [
      "session_id", "code", "provider", "autonomy_plan", "round", "module_id", "modul_titel",
      "funktion", "aufgabentyp", "autonomy", "started_at", "ended_at", "dauer_s",
      "n_user_msgs", "n_agent_msgs", "modelle", "reliance_index", "erfolg_prob",
      "vertrauen", "tlx_geistig", "tlx_zeitdruck", "tlx_leistung", "tlx_anstrengung", "tlx_frustration",
      "kpi_budget_vor", "kpi_umsatz_vor", "kpi_risiko_vor",
      "rating_mittel", "rating_einzeln", "entscheidung",
    ];
    const rows = [head.join(";")];
    for (const s of sessions) {
      for (const r of s.rounds) {
        const mod = window.TASK_MODULES[r.moduleId] || {};
        const dauer = r.startedAt && r.endedAt
          ? Math.round((new Date(r.endedAt) - new Date(r.startedAt)) / 1000) : "";
        const models = [...new Set(r.interactions.filter((x) => x.role === "agent").map((x) => x.model))].join("|");
        const tlx = (r.survey && r.survey.tlx) || {};
        let ratingMittel = "", ratingEinzeln = "";
        if (r.rating && r.rating.criteria) {
          const vals = Object.values(r.rating.criteria);
          ratingMittel = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
          ratingEinzeln = Object.entries(r.rating.criteria).map(([k, v]) => `${k}=${v}`).join("|");
        }
        rows.push([
          s.id, s.code, s.provider, s.autonomyPlan, r.n, r.moduleId, mod.titel || "",
          mod.funktion || "", mod.aufgabentyp || "", r.autonomy, r.startedAt, r.endedAt, dauer,
          r.interactions.filter((x) => x.role === "user").length,
          r.interactions.filter((x) => x.role === "agent").length,
          models, r.relianceIndex, r.successProb,
          r.survey ? r.survey.vertrauen : "",
          tlx.geistig, tlx.zeitdruck, tlx.leistung, tlx.anstrengung, tlx.frustration,
          r.kpiBefore.budget, r.kpiBefore.umsatz, r.kpiBefore.risiko,
          ratingMittel, ratingEinzeln, r.decision,
        ].map(csvCell).join(";"));
      }
    }
    return rows.join("\r\n");
  }

  function stamp() {
    return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  }

  function renderList() {
    const tbody = $("sessionTabelle").querySelector("tbody");
    tbody.textContent = "";
    const sessions = window.Store.loadAll();
    if (sessions.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 7;
      td.textContent = "Noch keine Sitzungen auf diesem Gerät.";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    for (const s of sessions) {
      const tr = document.createElement("tr");
      const cells = [
        s.code,
        PROVIDER_NAMES[s.provider] || s.provider,
        s.autonomyPlan,
        `${s.rounds.filter((r) => r.endedAt).length}/${s.sequence.length}`,
        s.status,
        (s.createdAt || "").slice(0, 16).replace("T", " "),
      ];
      for (const c of cells) {
        const td = document.createElement("td");
        td.textContent = c;
        tr.appendChild(td);
      }
      const tdA = document.createElement("td");
      const btnDetail = document.createElement("button");
      btnDetail.className = "sekundaer";
      btnDetail.textContent = "Details & Rating";
      btnDetail.addEventListener("click", () => renderDetail(s.id));
      const btnJson = document.createElement("button");
      btnJson.className = "sekundaer";
      btnJson.textContent = "JSON";
      btnJson.addEventListener("click", () =>
        download(`katp_${s.code}_${stamp()}.json`, JSON.stringify(s, null, 2), "application/json"));
      const btnDel = document.createElement("button");
      btnDel.className = "gefahr";
      btnDel.textContent = "Löschen";
      btnDel.addEventListener("click", () => {
        if (confirm(`Sitzung „${s.code}" endgültig von diesem Gerät löschen?`)) {
          window.Store.remove(s.id);
          $("detail").classList.add("verborgen");
          renderList();
        }
      });
      tdA.append(btnDetail, btnJson, btnDel);
      tr.appendChild(tdA);
      tbody.appendChild(tr);
    }
  }

  function renderDetail(id) {
    const s = window.Store.get(id);
    if (!s) return;
    $("detail").classList.remove("verborgen");
    $("detailTitel").textContent = `Sitzung „${s.code}" — ${PROVIDER_NAMES[s.provider] || s.provider}, Autonomie: ${s.autonomyPlan}`;
    const wrap = $("detailInhalt");
    wrap.textContent = "";

    for (const r of s.rounds) {
      const mod = window.TASK_MODULES[r.moduleId] || { raster: [], titel: r.moduleId };
      const panel = document.createElement("div");
      panel.className = "panel";
      const h = document.createElement("h3");
      h.textContent = `Runde ${r.n} — ${mod.titel} (${r.autonomy})`;
      panel.appendChild(h);

      const meta = document.createElement("p");
      meta.className = "status";
      meta.textContent =
        `Reliance-Index: ${r.relianceIndex ?? "—"} · Erfolgseinschätzung: ${r.successProb ?? "—"} % · ` +
        `Vertrauen: ${r.survey ? r.survey.vertrauen : "—"}/7 · ` +
        `Interaktionen: ${r.interactions.length}`;
      panel.appendChild(meta);

      if (r.decision) {
        const dec = document.createElement("p");
        const b = document.createElement("strong");
        b.textContent = "Finale Entscheidung: ";
        dec.appendChild(b);
        dec.appendChild(document.createTextNode(r.decision));
        panel.appendChild(dec);
      }

      // Interaktionsprotokoll aufklappbar
      const det = document.createElement("details");
      const sum = document.createElement("summary");
      sum.textContent = "Interaktionsprotokoll";
      det.appendChild(sum);
      for (const x of r.interactions) {
        const p = document.createElement("p");
        const who = document.createElement("strong");
        who.textContent = x.role === "user" ? "Person: " : `Agent (${x.agentRole}${x.model ? ", " + x.model : ""}): `;
        p.appendChild(who);
        p.appendChild(document.createTextNode(x.content));
        det.appendChild(p);
      }
      panel.appendChild(det);

      // Bewertungsraster
      if (r.endedAt) {
        const rh = document.createElement("h3");
        rh.textContent = "Bewertungsraster (Expertenrating 1–5)";
        panel.appendChild(rh);
        const selects = {};
        for (const crit of mod.raster) {
          const sel = document.createElement("select");
          const empty = document.createElement("option");
          empty.value = ""; empty.textContent = "—";
          sel.appendChild(empty);
          for (let v = 1; v <= 5; v++) {
            const op = document.createElement("option");
            op.value = String(v); op.textContent = String(v);
            sel.appendChild(op);
          }
          if (r.rating && r.rating.criteria && r.rating.criteria[crit]) {
            sel.value = String(r.rating.criteria[crit]);
          }
          selects[crit] = sel;
          const lab = document.createElement("label");
          lab.textContent = crit;
          panel.append(lab, sel);
        }
        const btnSave = document.createElement("button");
        btnSave.textContent = "Rating speichern";
        const status = document.createElement("p");
        status.className = "status";
        btnSave.addEventListener("click", () => {
          const criteria = {};
          for (const crit of mod.raster) {
            const v = parseInt(selects[crit].value, 10);
            if (v) criteria[crit] = v;
          }
          r.rating = { criteria, ratedAt: new Date().toISOString() };
          if (window.Store.put(s)) {
            status.textContent = "Gespeichert.";
            status.className = "status erfolg";
          } else {
            status.textContent = "Speichern fehlgeschlagen.";
            status.className = "status fehler";
          }
        });
        panel.append(btnSave, status);
      }

      wrap.appendChild(panel);
    }

    if (s.final) {
      const panel = document.createElement("div");
      panel.className = "panel";
      const h = document.createElement("h3");
      h.textContent = "Abschlussbefragung";
      panel.appendChild(h);
      const p = document.createElement("p");
      p.textContent = "Vertrauensskala: " +
        Object.entries(s.final.trust).map(([k, v]) => `${k}=${v}`).join(", ");
      panel.appendChild(p);
      for (const [k, v] of Object.entries(s.final.open || {})) {
        const q = document.createElement("p");
        const b = document.createElement("strong");
        b.textContent = k + ": ";
        q.appendChild(b);
        q.appendChild(document.createTextNode(v || "—"));
        panel.appendChild(q);
      }
      wrap.appendChild(panel);
    }
  }

  $("btnExportAllJson").addEventListener("click", () => {
    const all = window.Store.loadAll();
    if (all.length === 0) { $("listStatus").textContent = "Keine Sitzungen vorhanden."; return; }
    download(`katp_alle-sitzungen_${stamp()}.json`, JSON.stringify(all, null, 2), "application/json");
  });

  $("btnExportAllCsv").addEventListener("click", () => {
    const all = window.Store.loadAll();
    if (all.length === 0) { $("listStatus").textContent = "Keine Sitzungen vorhanden."; return; }
    download(`katp_runden_${stamp()}.csv`, "﻿" + roundsToCsv(all), "text/csv;charset=utf-8");
  });

  renderList();
})();
