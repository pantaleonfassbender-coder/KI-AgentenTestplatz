/* Sitzungs-Runner: Einverständnis → (Vorbefragung) → Instruktion → Bearbeitung des
   Prüfmoduls (Unterlagen, ggf. KI-Assistent, Endtext) → Kurzfragebogen → Ende.
   Keine Runden: eine Sitzung = ein Prüfmodul in einer Studienvariante. */

(function () {
  const $ = (id) => document.getElementById(id);
  const { el } = window.KATP;
  const views = ["viewConsent", "viewBaseline", "viewInstruktion", "viewArbeit", "viewKurzbogen", "viewDone"];

  function show(view) {
    for (const v of views) $(v).classList.toggle("verborgen", v !== view);
    document.body.classList.toggle("breit", view === "viewArbeit");
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
  const mod = window.KATP.MODULE[session.moduleId];
  if (!mod) {
    $("globalFehler").textContent = `Prüfmodul „${session.moduleId}" ist auf dieser Plattform nicht verfügbar.`;
    return;
  }
  const variante = window.KATP.VARIANTEN[session.variante];
  const mitKI = variante.ki;
  const task = session.task;

  function save() {
    if (!window.Store.put(session)) {
      $("globalFehler").textContent = "Warnung: Speichern fehlgeschlagen (Browser-Speicher).";
    }
  }
  const event = (typ, daten) => window.Session.event(session, typ, daten);

  if (!mitKI) {
    $("consentTransfer").textContent =
      "In dieser Sitzung arbeiten Sie ohne KI-Unterstützung. Es werden keine Inhalte an " +
      "Modellanbieter übermittelt.";
  }

  // ---- Fragebogen-Hilfen ----
  function likertRow(name, min, max) {
    const wrap = el("div", "likert");
    for (let v = min; v <= max; v++) {
      const l = el("label");
      const r = el("input");
      r.type = "radio"; r.name = name; r.value = String(v);
      l.append(r, document.createTextNode(String(v)));
      wrap.appendChild(l);
    }
    return wrap;
  }

  function frage(labelText, node) {
    const d = el("div", "frage");
    d.append(el("div", "text", labelText), node);
    return d;
  }

  function readRadios(form, prefix) {
    const out = {};
    const names = new Set();
    form.querySelectorAll(`input[type=radio][name^="${prefix}"]`).forEach((r) => {
      names.add(r.name);
      if (r.checked) out[r.name] = parseInt(r.value, 10);
    });
    let complete = true;
    names.forEach((n) => { if (!(n in out)) complete = false; });
    return { out, complete };
  }

  function setStatus(id, text, cls) {
    $(id).textContent = text;
    $(id).className = "status" + (cls ? " " + cls : "");
  }

  // ---- Einverständnis ----
  $("consentCheck").addEventListener("change", () => {
    $("btnConsent").disabled = !$("consentCheck").checked;
  });
  $("btnConsent").addEventListener("click", () => {
    session.consent = { given: true, timestamp: new Date().toISOString() };
    session.status = "laufend";
    save();
    weiter();
  });

  // ---- Vorbefragung ----
  function renderBaseline() {
    const form = $("baselineForm");
    form.textContent = "";
    for (const scale of window.Surveys.baselineScales) {
      form.appendChild(el("h3", null, scale.name));
      scale.items.forEach((item, i) => {
        form.appendChild(frage(item, likertRow(`bl_${scale.id}_${i}`, 1, 7)));
      });
    }
    form.appendChild(el("h3", null, "Erfahrung mit KI-Werkzeugen"));
    const ae = window.Surveys.aiExperience;
    const sel = (id, opts) => {
      const s = el("select");
      s.id = id;
      for (const o of opts) { const op = el("option", null, o); op.value = o; s.appendChild(op); }
      return s;
    };
    form.appendChild(frage(ae.frequency.label, sel("aiFreq", ae.frequency.options)));
    form.appendChild(frage(ae.competence.label, likertRow("bl_ai_komp", 1, 7)));
    form.appendChild(frage(ae.agents.label, sel("aiAgents", ae.agents.options)));
  }

  $("btnBaseline").addEventListener("click", () => {
    const { out, complete } = readRadios($("baselineForm"), "bl_");
    if (!complete) return setStatus("baselineStatus", "Bitte alle Aussagen beantworten.", "fehler");
    session.baseline = {
      items: out,
      aiFrequency: $("aiFreq").value,
      aiAgents: $("aiAgents").value,
      timestamp: new Date().toISOString(),
    };
    save();
    weiter();
  });

  // ---- Instruktion ----
  function renderInstruktion() {
    $("instrTitel").textContent = mod.instruktion.titel;
    const box = $("instrInhalt");
    box.textContent = "";
    window.KATP.renderBlocks(mod.instruktion.inhalt, box);
    $("instrVariante").textContent = variante.teilnehmerHinweis;
    $("instrZeit").textContent =
      `Mit „Bearbeitung starten“ beginnt die Zeitmessung. Vorgesehen sind ${mod.zeit.richtMin} bis ` +
      `${mod.zeit.limitMin} Minuten; die verbleibende Zeit wird oben rechts angezeigt. ` +
      "Instruktion und Dokumente bleiben während der Bearbeitung jederzeit einsehbar.";
  }

  $("btnStart").addEventListener("click", () => {
    task.startedAt = new Date().toISOString();
    event("start");
    save();
    startArbeit();
  });

  // ---- Bearbeitung ----
  let aktiveAnsicht = null;

  function zeigeAnsicht(id, protokollieren) {
    aktiveAnsicht = id;
    const pane = $("dokAnsicht");
    pane.textContent = "";
    if (id === "instruktion") {
      const art = el("article", "dokument");
      art.appendChild(el("h3", null, mod.instruktion.titel));
      window.KATP.renderBlocks(mod.instruktion.inhalt, art);
      art.appendChild(el("p", "hinweis", variante.teilnehmerHinweis));
      pane.appendChild(art);
    } else {
      const dok = mod.dokumente.find((d) => "dok" + d.nr === id);
      pane.appendChild(window.KATP.renderDokument(dok));
    }
    pane.scrollTop = 0;
    $("dokTabs").querySelectorAll("button").forEach((b) => {
      const aktiv = b.dataset.ansicht === id;
      b.classList.toggle("aktiv", aktiv);
      b.setAttribute("aria-selected", aktiv ? "true" : "false");
    });
    if (protokollieren) { event("ansicht", { ansicht: id }); save(); }
  }

  function renderTabs() {
    const tabs = $("dokTabs");
    tabs.textContent = "";
    const add = (id, label, title) => {
      const b = el("button", "tab", label);
      b.type = "button";
      b.dataset.ansicht = id;
      b.title = title;
      b.setAttribute("role", "tab");
      b.addEventListener("click", () => { if (aktiveAnsicht !== id) zeigeAnsicht(id, true); });
      tabs.appendChild(b);
    };
    add("instruktion", "Instruktion", mod.instruktion.titel);
    for (const d of mod.dokumente) add("dok" + d.nr, `Dok. ${d.nr}`, d.kurz);
  }

  function updateWortzahl() {
    const n = window.Metrics.woerter($("endtext").value);
    const { min, max } = mod.woerter;
    const w = $("wortzahl");
    w.textContent = `${n} Wörter · Vorgabe ${min}–${max}`;
    w.className = "wortzahl " + (n >= min && n <= max ? "erfolg" : n > 0 ? "warnung-text" : "");
  }

  let saveTimer = null;
  $("endtext").addEventListener("input", () => {
    updateWortzahl();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { task.entwurf = $("endtext").value; save(); }, 600);
  });
  $("endtext").addEventListener("paste", (ev) => {
    const txt = (ev.clipboardData && ev.clipboardData.getData("text")) || "";
    event("einfuegen", { zeichen: txt.length, woerter: window.Metrics.woerter(txt) });
    setTimeout(() => { task.entwurf = $("endtext").value; save(); }, 0);
  });

  let uhrTimer = null;
  function tick() {
    const verstrichen = (Date.now() - new Date(task.startedAt)) / 1000;
    const rest = task.limitMin * 60 - verstrichen;
    const fmt = (s) => {
      s = Math.floor(Math.abs(s));
      return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    };
    const uhr = $("uhr");
    if (rest >= 0) {
      uhr.textContent = `Verbleibende Zeit: ${fmt(rest)}`;
      uhr.classList.toggle("knapp", rest < 300);
    } else {
      uhr.textContent = `Zeit überschritten: +${fmt(rest)}`;
      uhr.classList.add("knapp");
      if ($("zeitHinweis").classList.contains("verborgen")) {
        $("zeitHinweis").classList.remove("verborgen");
        if (!task.events.some((e) => e.typ === "zeit_abgelaufen")) { event("zeit_abgelaufen"); save(); }
      }
    }
  }

  function startArbeit() {
    $("arbeitTitel").textContent = `${mod.titel} — ${mod.untertitel}`;
    $("arbeitMeta").textContent = mitKI ? " · mit KI-Assistent" : " · ohne KI-Unterstützung";
    $("ergebnisLabel").textContent = mod.ergebnisLabel;
    $("ergebnisHinweis").textContent =
      "Sie — nicht der KI-Assistent — verantworten die Abgabe. Ihr Text wird laufend " +
      "zwischengespeichert; abgegeben wird erst mit „Endgültig abgeben“.";
    if (!mitKI) $("ergebnisHinweis").textContent = "Ihr Text wird laufend zwischengespeichert; abgegeben wird erst mit „Endgültig abgeben“.";
    $("endtext").placeholder = mod.ergebnisPlatzhalter;
    $("endtext").value = task.entwurf || "";
    updateWortzahl();
    $("chatPanel").classList.toggle("verborgen", !mitKI);
    $("chatlog").textContent = "";
    task.interactions.forEach(appendMsgEl);
    renderTabs();
    const letzte = [...task.events].reverse().find((e) => e.typ === "ansicht");
    zeigeAnsicht(letzte ? letzte.ansicht : "instruktion", !letzte);
    show("viewArbeit");
    tick();
    uhrTimer = setInterval(tick, 1000);
    if (mitKI && variante.autoEntwurf &&
        !task.interactions.some((x) => x.role === "agent" || (x.role === "user" && !x.auto))) {
      sendToAgent(variante.autoAuftrag, true);
    }
  }

  function appendMsgEl(x, idx) {
    const log = $("chatlog");
    const d = el("div", "msg " + (x.role === "user" ? "human" : "agent"));
    const wer = x.role === "user"
      ? (x.auto ? "Automatischer Arbeitsauftrag" : "Sie")
      : "KI-Assistent";
    d.appendChild(el("span", "wer", wer));
    d.appendChild(document.createTextNode(x.content));
    if (x.role === "agent" && variante.uebernahmeKnopf) {
      const b = el("button", "sekundaer klein", "In Endtext übernehmen");
      b.type = "button";
      b.addEventListener("click", () => {
        const ta = $("endtext");
        if (ta.value.trim() && !confirm("Ihr bisheriger Text im Textfeld wird durch diese Fassung ersetzt. Fortfahren?")) return;
        ta.value = x.content;
        event("uebernahme", { zeichen: x.content.length, nachricht: typeof idx === "number" ? idx : task.interactions.indexOf(x) });
        task.entwurf = ta.value;
        updateWortzahl();
        save();
        ta.focus();
      });
      const bar = el("div", "msg-aktionen");
      bar.appendChild(b);
      d.appendChild(bar);
    }
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  let sending = false;
  async function sendToAgent(userMsg, auto) {
    if (sending) return;
    sending = true;
    $("btnSenden").disabled = true;
    setStatus("chatStatus", "Der KI-Assistent arbeitet …");
    const t0 = Date.now();
    const warte = setInterval(() => {
      const s = Math.round((Date.now() - t0) / 1000);
      setStatus("chatStatus", `Der KI-Assistent arbeitet … (${s} s` +
        (s >= 20 ? "; längere Texte können bis zu einer Minute dauern)" : ")"));
    }, 1000);
    const userEntry = { role: "user", content: userMsg, auto: !!auto, timestamp: new Date().toISOString() };
    task.interactions.push(userEntry);
    appendMsgEl(userEntry);
    save();
    try {
      const transcript = task.interactions.slice(0, -1).filter((x) => !x.fehler);
      const res = await window.ApiClient.callAgent({
        provider: session.provider, mod, variante: session.variante, transcript, userMsg,
      });
      const agentEntry = {
        role: "agent", content: res.text || "(leere Antwort)",
        model: res.model, latencyMs: res.latencyMs, timestamp: res.timestamp,
      };
      task.interactions.push(agentEntry);
      appendMsgEl(agentEntry, task.interactions.length - 1);
      setStatus("chatStatus", "");
    } catch (err) {
      userEntry.fehler = err.message;
      event("agent_fehler", { meldung: err.message });
      setStatus("chatStatus", "Fehler: " + err.message +
        " — Die Nachricht wurde protokolliert; Sie können es erneut versuchen.", "fehler");
      if (auto) {
        const retry = el("button", "sekundaer klein", "Entwurf erneut anfordern");
        retry.type = "button";
        retry.addEventListener("click", () => { retry.remove(); sendToAgent(variante.autoAuftrag, true); });
        $("chatStatus").appendChild(retry);
      }
    } finally {
      clearInterval(warte);
      save();
      sending = false;
      $("btnSenden").disabled = false;
    }
  }

  $("btnSenden").addEventListener("click", () => {
    const msg = $("chatEingabe").value.trim();
    if (!msg) return;
    $("chatEingabe").value = "";
    sendToAgent(msg, false);
  });
  $("chatEingabe").addEventListener("keydown", (ev) => {
    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) $("btnSenden").click();
  });

  $("btnAbgeben").addEventListener("click", () => {
    const text = $("endtext").value.trim();
    const n = window.Metrics.woerter(text);
    const { min, max } = mod.woerter;
    if (n < 30) return setStatus("abgabeStatus", "Bitte verfassen Sie zuerst Ihren Text (mindestens 30 Wörter).", "fehler");
    if (sending) return setStatus("abgabeStatus", "Bitte warten Sie, bis der KI-Assistent geantwortet hat.", "fehler");
    const laenge = n < min || n > max ? `Ihr Text hat ${n} Wörter (Vorgabe ${min}–${max}). ` : "";
    if (!confirm(laenge + "Möchten Sie Ihren Text jetzt endgültig abgeben? Danach sind keine Änderungen mehr möglich.")) return;
    clearInterval(uhrTimer);
    task.entwurf = text;
    task.text = text;
    task.endedAt = new Date().toISOString();
    event("abgabe", { woerter: n });
    session.metrik = window.Metrics.prozess(session);
    save();
    renderKurzbogen();
    show("viewKurzbogen");
  });

  // ---- Kurzfragebogen ----
  function kurzbogenItems() {
    return mod.kurzfragebogen.items.filter((it) => mitKI || !it.nurKI);
  }

  function renderKurzbogen() {
    const kb = mod.kurzfragebogen;
    $("kurzbogenSkala").textContent =
      `Bitte geben Sie an, wie sehr Sie zustimmen (${kb.skala.min} = ${kb.skala.minLabel}, ` +
      `${kb.skala.max} = ${kb.skala.maxLabel}).`;
    const form = $("kurzbogenForm");
    form.textContent = "";
    for (const it of kurzbogenItems()) {
      form.appendChild(frage(it.text, likertRow("kb_" + it.id, kb.skala.min, kb.skala.max)));
    }
  }

  $("btnKurzbogen").addEventListener("click", () => {
    const { out, complete } = readRadios($("kurzbogenForm"), "kb_");
    if (!complete) return setStatus("kurzbogenStatus", "Bitte alle Aussagen beantworten.", "fehler");
    const items = {};
    for (const it of kurzbogenItems()) items[it.id] = out["kb_" + it.id];
    session.kurzbogen = { items, timestamp: new Date().toISOString() };
    session.status = "abgeschlossen";
    save();
    show("viewDone");
  });

  // ---- Einstieg: Zustand fortsetzen ----
  function weiter() {
    if (!session.consent) return show("viewConsent");
    if (session.vorbefragung && !session.baseline) { renderBaseline(); return show("viewBaseline"); }
    if (!task.startedAt) { renderInstruktion(); return show("viewInstruktion"); }
    if (!task.endedAt) return startArbeit();
    if (!session.kurzbogen) { renderKurzbogen(); return show("viewKurzbogen"); }
    show("viewDone");
  }
  weiter();
})();
