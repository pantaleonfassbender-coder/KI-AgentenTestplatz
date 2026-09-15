/* AI Integration (MVRP-Layer 5), Client-Seite: baut Systemprompt aus Agentenrolle,
   Autonomiegrad und Aufgabenkontext und ruft /api/agent auf. Es werden ausschliesslich
   Aufgabenkontext und Chat-Nachrichten uebertragen — keine Fragebogendaten, kein
   Teilnahmecode (siehe Datenschutzerklaerung). */

window.ApiClient = (function () {
  function taskContext(mod, kpi) {
    const daten = mod.eingabedaten.map(([k, v]) => `- ${k}: ${v}`).join("\n");
    return [
      `AUFGABE (${mod.titel}, Managementfunktion: ${mod.funktion}):`,
      mod.szenario,
      "",
      "EINGABEDATEN (fiktiv):",
      daten,
      "",
      `AKTUELLE LAGE DER NORDTEC GMBH (fiktive Indizes, Ausgangswert 100 bzw. Risiko 50): ` +
      `Budgetindex ${kpi.budget}, Umsatzindex ${kpi.umsatz}, Risikoindex ${kpi.risiko}.`,
      "",
      "BEARBEITUNGSAUFTRAG:",
      mod.auftrag,
    ].join("\n");
  }

  function buildSystem(roleId, autonomy, mod, kpi) {
    const role = window.AGENT_ROLES[roleId];
    const parts = [role.system];
    if (roleId === "analyst") parts.push(window.AUTONOMY_INSTRUCTIONS[autonomy]);
    parts.push(taskContext(mod, kpi));
    return parts.join("\n\n");
  }

  /* transcript: [{role:"user"|"agent", agentRole, content}] -> API-Messages.
     Beitraege anderer Rollen werden als Kontext in user-Nachrichten gekennzeichnet,
     damit jede Rolle ohne direkte Agent-zu-Agent-Kommunikation informiert bleibt. */
  function buildMessages(transcript, roleId, userMsg) {
    const msgs = [];
    for (const t of transcript) {
      if (t.role === "user") {
        msgs.push({ role: "user", content: t.content });
      } else if (t.agentRole === roleId) {
        msgs.push({ role: "assistant", content: t.content });
      } else {
        const name = (window.AGENT_ROLES[t.agentRole] || {}).name || t.agentRole;
        msgs.push({ role: "user", content: `[Beitrag des Agenten „${name}" zur Kenntnis]\n${t.content}` });
      }
    }
    msgs.push({ role: "user", content: userMsg });
    // aufeinanderfolgende user-Nachrichten zusammenfassen (Anthropic/Gemini-Anforderung)
    const merged = [];
    for (const m of msgs) {
      const last = merged[merged.length - 1];
      if (last && last.role === m.role) last.content += "\n\n" + m.content;
      else merged.push({ ...m });
    }
    return merged;
  }

  async function callAgent(opts) {
    const { provider, roleId, autonomy, mod, kpi, transcript, userMsg } = opts;
    const body = {
      provider,
      system: buildSystem(roleId, autonomy, mod, kpi),
      messages: buildMessages(transcript, roleId, userMsg),
    };
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`Serverantwort war kein JSON (Status ${res.status}).`);
    }
    if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
    return data; // { text, model, provider, latencyMs, timestamp, usage }
  }

  return { callAgent };
})();
