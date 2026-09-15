/* Sitzungs-Runner: Einverständnis → Baseline → Runden → Abschluss.
   Rundenablauf nach Arbeitspapier Teil B.3: Briefing → Bearbeitung mit Agent →
   Entscheidung → Kurzerhebung → Kennzahlen-Fortschreibung. */

(function () {
  const $ = (id) => document.getElementById(id);
  const views = ["viewConsent", "viewBaseline", "viewRound", "viewSurvey", "viewFinal", "viewDone"];

  function show(view) {
    for (const v of views) $(v).classList.toggle("verborgen", v !== view);
    window.scrollTo(0, 0);
  }

  // ---- Sitzung laden ----
  const params = new URLSearchParams(location.search);
  let session = params.get("session") ? window.Store.get(params.get("session")) : null;
  if (!session) {
    const open = window.Store.loadAll().filter((s) => s.status !== "abgeschlossen");
    session = open[open.length - 1] || null;
  }
  if (!session) {
    $("globalFehler").textContent =
      "Keine offene Sitzung gefunden. Bitte zuerst auf der Startseite eine Sitzung anlegen.";
    return;
  }

  function save() {
    if (!window.Store.put(session)) {
      $("globalFehler").textContent = "Warnung: Speichern fehlgeschlagen (Browser-Speicher).";
    }
  }

  const PROVIDER_NAMES = { anthropic: "Claude (Anthropic)", openai: "GPT (OpenAI)", gemini: "Gemini (Google)" };

  // ---- Likert-Hilfen ----
  function likertRow(name, max) {
    const wrap = document.createElement("div");
    wrap.className = "likert";
    for (let v = 1; v <= max; v++) {
      const l = document.createElement("label");
      const r = document.createElement("input");
      r.type = "radio"; r.name = name; r.value = String(v);
      l.append(r, document.createTextNode(String(v)));
      wrap.appendChild(l);
    }
    return wrap;
  }

  function frage(labelText, node) {
    const d = document.createElement("div");
    d.className = "frage";
    const t = document.createElement("div");
    t.className = "text";
    t.textContent = labelText;
    d.append(t, node);
    return d;
  }

  function readRadios(form, prefix) {
    const out = {};
    let complete = true;
    form.querySelectorAll(`input[type=radio][name^="${prefix}"]`).forEach((r) => {
      if (r.checked) out[r.name] = parseInt(r.value, 10);
    });
    const names = new Set(
      Array.from(form.querySelectorAll(`input[type=radio][name^="${prefix}"]`)).map((r) => r.name)
    );
    names.forEach((n) => { if (!(n in out)) complete = false; });
    return { out, complete };
  }

  // ---- Einverständnis ----
  $("consentCheck").addEventListener("change", () => {
    $("btnConsent").disabled = !$("consentCheck").checked;
  });
  $("btnConsent").addEventListener("click", () => {
    session.consent = { given: true, timestamp: new Date().toISOString() };
    save();
    renderBaseline();
    show("viewBaseline");
  });

  // ---- Baseline ----
  function renderBaseline() {
    const form = $("baselineForm");
    form.textContent = "";
    for (const scale of window.Surveys.baselineScales) {
      const h = document.createElement("h3");
      h.textContent = scale.name;
      form.appendChild(h);
      scale.items.forEach((item, i) => {
        form.appendChild(frage(item, likertRow(`bl_${scale.id}_${i}`, 7)));
      });
    }
    const h = document.createElement("h3");
    h.textContent = "Erfahrung mit KI-Werkzeugen";
    form.appendChild(h);

    const freqSel = document.createElement("select");
    freqSel.id = "aiFreq";
    window.Surveys.aiExperience.frequency.options.forEach((o) => {
      const op = document.createElement("option");
      op.value = o; op.textContent = o;
      freqSel.appendChild(op);
    });
    form.appendChild(frage(window.Surveys.aiExperience.frequency.label, freqSel));
    form.appendChild(frage(window.Surveys.aiExperience.competence.label, likertRow("bl_ai_komp", 7)));

    const agSel = document.createElement("select");
    agSel.id = "aiAgents";
    window.Surveys.aiExperience.agents.options.forEach((o) => {
      const op = document.createElement("option");
      op.value = o; op.textContent = o;
      agSel.appendChild(op);
    });
    form.appendChild(frage(window.Surveys.aiExperience.agents.label, agSel));
  }

  $("btnBaseline").addEventListener("click", () => {
    const form = $("baselineForm");
    const { out, complete } = readRadios(form, "bl_");
    if (!complete) {
      $("baselineStatus").textContent = "Bitte alle Aussagen beantworten.";
      $("baselineStatus").classList.add("fehler");
      return;
    }
    session.baseline = {
      items: out,
      aiFrequency: $("aiFreq").value,
      aiAgents: $("aiAgents").value,
      timestamp: new Date().toISOString(),
    };
    save();
    nextRound();
  });

  // ---- Runden ----
  let round = null;
  let sending = false;

  function nextRound() {
    if (window.Engine.currentRoundIndex(session) >= session.sequence.length) {
      renderFinal();
      show("viewFinal");
      return;
    }
    round = window.Engine.startRound(session);
    save();
    renderRound();
    show("viewRound");
    if (round.autonomy === "hoch" && round.interactions.length === 0) {
      autoDraft();
    }
  }

  function renderRound() {
    const mod = window.TASK_MODULES[round.moduleId];
    $("rundenFortschritt").textContent = `Runde ${round.n} von ${session.sequence.length}`;
    $("rundenMeta").textContent = "";
    const metas = [
      `Modul ${mod.id}: ${mod.titel}`,
      `Funktion: ${mod.funktion}`,
      `Aufgabentyp: ${mod.aufgabentyp}`,
      `Agent: ${PROVIDER_NAMES[session.provider]}`,
      `Autonomiegrad: ${round.autonomy}`,
      `Richtwert: ${mod.dauerMin} Min.`,
    ];
    for (const m of metas) {
      const s = document.createElement("span");
      s.textContent = m;
      $("rundenMeta").appendChild(s);
    }

    const kpiL = $("kpiLeiste");
    kpiL.textContent = "";
    const kpiDefs = [["Budgetindex", round.kpiBefore.budget], ["Umsatzindex", round.kpiBefore.umsatz], ["Risikoindex", round.kpiBefore.risiko]];
    for (const [name, val] of kpiDefs) {
      const d = document.createElement("div");
      d.className = "kpi";
      const b = document.createElement("b");
      b.textContent = String(val);
      d.append(name + ": ", b);
      kpiL.appendChild(d);
    }

    const prev = session.rounds[round.n - 2];
    $("kpiDelta").textContent = prev
      ? `Auswirkung der Vorrunde (${window.TASK_MODULES[prev.moduleId].titel}): ` +
        window.Engine.kpiDeltaText(prev.kpiBefore, round.kpiBefore) + "."
      : "Ausgangslage: Start der Simulation, alle Indizes auf Ausgangswert.";

    $("modulTitel").textContent = `${mod.id} — ${mod.titel}`;
    $("modulSzenario").textContent = mod.szenario;

    const tbl = $("modulDaten");
    tbl.textContent = "";
    for (const [k, v] of mod.eingabedaten) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.textContent = k;
      const td = document.createElement("td");
      td.textContent = v;
      tr.append(th, td);
      tbl.appendChild(tr);
    }
    $("modulAuftrag").textContent = mod.auftrag;

    const roleSel = $("rolleSelect");
    roleSel.textContent = "";
    for (const rid of Object.keys(window.AGENT_ROLES)) {
      const r = window.AGENT_ROLES[rid];
      const op = document.createElement("option");
      op.value = rid;
      op.textContent = `${r.name} — ${r.beschreibung}`;
      roleSel.appendChild(op);
    }

    $("chatlog").textContent = "";
    round.interactions.forEach(appendMsgEl);
    $("chatEingabe").value = "";
    $("chatStatus").textContent = "";
    $("entscheidung").value = "";
    $("erfolgProb").value = "50";
    $("erfolgProbWert").textContent = "50 %";
    $("abgabeStatus").textContent = "";
  }

  function appendMsgEl(x) {
    const log = $("chatlog");
    const d = document.createElement("div");
    d.className = "msg " + (x.role === "user" ? "human" : "agent");
    const wer = document.createElement("span");
    wer.className = "wer";
    wer.textContent = x.role === "user"
      ? (x.auto ? "Automatischer Arbeitsauftrag (Autonomiemodus hoch)" : "Sie")
      : `Agent · ${(window.AGENT_ROLES[x.agentRole] || {}).name || x.agentRole}` +
        (x.model ? ` · ${x.model}` : "");
    d.appendChild(wer);
    d.appendChild(document.createTextNode(x.content));
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  async function sendToAgent(userMsg, roleId, auto) {
    if (sending) return;
    sending = true;
    $("btnSenden").disabled = true;
    $("chatStatus").textContent = "Der Agent arbeitet …";
    $("chatStatus").classList.remove("fehler");

    const userEntry = {
      role: "user", content: userMsg, auto: !!auto,
      timestamp: new Date().toISOString(),
    };
    round.interactions.push(userEntry);
    appendMsgEl(userEntry);
    save();

    try {
      const mod = window.TASK_MODULES[round.moduleId];
      const transcript = round.interactions.slice(0, -1);
      const res = await window.ApiClient.callAgent({
        provider: session.provider,
        roleId,
        autonomy: round.autonomy,
        mod,
        kpi: round.kpiBefore,
        transcript,
        userMsg,
      });
      const agentEntry = {
        role: "agent", agentRole: roleId, content: res.text || "(leere Antwort)",
        model: res.model, latencyMs: res.latencyMs, timestamp: res.timestamp,
      };
      round.interactions.push(agentEntry);
      appendMsgEl(agentEntry);
      $("chatStatus").textContent = "";
    } catch (err) {
      $("chatStatus").textContent = "Fehler: " + err.message +
        " — Die Nachricht wurde protokolliert; Sie können es erneut versuchen.";
      $("chatStatus").classList.add("fehler");
    } finally {
      save();
      sending = false;
      $("btnSenden").disabled = false;
    }
  }

  function autoDraft() {
    sendToAgent(
      "Bitte erstelle jetzt eigenständig einen vollständigen, abgabefertigen Entwurf für den Bearbeitungsauftrag.",
      "analyst",
      true
    );
  }

  $("btnSenden").addEventListener("click", () => {
    const msg = $("chatEingabe").value.trim();
    if (!msg) return;
    $("chatEingabe").value = "";
    sendToAgent(msg, $("rolleSelect").value, false);
  });

  $("chatEingabe").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) $("btnSenden").click();
  });

  $("erfolgProb").addEventListener("input", () => {
    $("erfolgProbWert").textContent = $("erfolgProb").value + " %";
  });

  // ---- Abgabe → Kurzerhebung ----
  let pendingDecision = null;

  $("btnAbgeben").addEventListener("click", () => {
    const dec = $("entscheidung").value.trim();
    if (dec.length < 30) {
      $("abgabeStatus").textContent = "Bitte formulieren Sie eine ausführlichere finale Entscheidung (mind. 30 Zeichen).";
      $("abgabeStatus").classList.add("fehler");
      return;
    }
    pendingDecision = { decision: dec, successProb: parseInt($("erfolgProb").value, 10) };
    renderSurvey();
    show("viewSurvey");
  });

  function renderSurvey() {
    const form = $("surveyForm");
    form.textContent = "";
    form.appendChild(frage(window.Surveys.trustItem, likertRow("sv_vertrauen", 7)));

    const h = document.createElement("h3");
    h.textContent = "Beanspruchung (NASA-TLX-Kurzform, 0–100)";
    form.appendChild(h);
    for (const dim of window.Surveys.tlxDimensions) {
      const wrap = document.createElement("div");
      const range = document.createElement("input");
      range.type = "range"; range.min = "0"; range.max = "100"; range.step = "5";
      range.value = "50"; range.id = "tlx_" + dim.id;
      const val = document.createElement("span");
      val.className = "range-wert";
      val.textContent = "50";
      range.addEventListener("input", () => { val.textContent = range.value; });
      wrap.append(range, val);
      form.appendChild(frage(`${dim.label}: ${dim.frage}`, wrap));
    }
  }

  $("btnSurvey").addEventListener("click", () => {
    const { out, complete } = readRadios($("surveyForm"), "sv_");
    if (!complete) {
      $("surveyStatus").textContent = "Bitte die Vertrauensfrage beantworten.";
      $("surveyStatus").classList.add("fehler");
      return;
    }
    const tlx = {};
    for (const dim of window.Surveys.tlxDimensions) {
      tlx[dim.id] = parseInt($("tlx_" + dim.id).value, 10);
    }
    window.Engine.finalizeRound(session, round, pendingDecision.decision, pendingDecision.successProb, {
      vertrauen: out.sv_vertrauen,
      tlx,
    });
    pendingDecision = null;
    save();
    nextRound();
  });

  // ---- Abschluss ----
  function renderFinal() {
    const form = $("finalForm");
    form.textContent = "";
    window.Surveys.finalTrustItems.forEach((item, i) => {
      form.appendChild(frage(item, likertRow(`fi_trust_${i}`, 7)));
    });
    for (const q of window.Surveys.finalOpenQuestions) {
      const ta = document.createElement("textarea");
      ta.id = "fi_open_" + q.id;
      form.appendChild(frage(q.label, ta));
    }
  }

  $("btnFinal").addEventListener("click", () => {
    const { out, complete } = readRadios($("finalForm"), "fi_");
    if (!complete) {
      $("finalStatus").textContent = "Bitte alle Aussagen beantworten.";
      $("finalStatus").classList.add("fehler");
      return;
    }
    const open = {};
    for (const q of window.Surveys.finalOpenQuestions) {
      open[q.id] = $("fi_open_" + q.id).value.trim();
    }
    session.final = { trust: out, open, timestamp: new Date().toISOString() };
    session.status = "abgeschlossen";
    save();
    const doneKpi = $("doneKpi");
    doneKpi.textContent = "";
    const kpiDefs = [["Budgetindex", session.kpi.budget], ["Umsatzindex", session.kpi.umsatz], ["Risikoindex", session.kpi.risiko]];
    for (const [name, val] of kpiDefs) {
      const d = document.createElement("div");
      d.className = "kpi";
      const b = document.createElement("b");
      b.textContent = String(val);
      d.append(name + ": ", b);
      doneKpi.appendChild(d);
    }
    show("viewDone");
  });

  // ---- Einstieg: Zustand der Sitzung fortsetzen ----
  if (!session.consent) {
    show("viewConsent");
  } else if (!session.baseline) {
    renderBaseline();
    show("viewBaseline");
  } else if (window.Engine.currentRoundIndex(session) >= session.sequence.length &&
             session.rounds.every((r) => r.endedAt)) {
    if (session.final) {
      renderFinal();
      show("viewDone");
    } else {
      renderFinal();
      show("viewFinal");
    }
  } else {
    const openRound = session.rounds.find((r) => !r.endedAt);
    if (openRound) {
      round = openRound;
      renderRound();
      show("viewRound");
    } else {
      nextRound();
    }
  }
})();
