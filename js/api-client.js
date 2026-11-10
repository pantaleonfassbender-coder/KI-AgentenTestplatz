/* AI Integration (MVRP-Layer 5), Client-Seite: baut die Systemanweisung aus Modul
   (Basis), Variante (Anweisung), Aufgabenstellung und Dokumenten und ruft /api/agent
   auf. Übertragen werden ausschließlich Aufgabenkontext und Chat-Nachrichten — keine
   Fragebogendaten, kein Teilnahmecode, keine Studienleitungsunterlagen. */

window.ApiClient = (function () {
  function buildMessages(transcript, userMsg) {
    const msgs = transcript.map((t) => ({
      role: t.role === "user" ? "user" : "assistant",
      content: t.content,
    }));
    msgs.push({ role: "user", content: userMsg });
    const merged = [];
    for (const m of msgs) {
      const last = merged[merged.length - 1];
      if (last && last.role === m.role) last.content += "\n\n" + m.content;
      else merged.push({ ...m });
    }
    return merged;
  }

  async function callAgent({ provider, mod, variante, transcript, userMsg }) {
    const body = {
      provider,
      system: window.KATP.systemPrompt(mod, variante),
      messages: buildMessages(transcript, userMsg),
      maxTokens: (mod.agent && mod.agent.maxTokens) || 2000,
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

  return { callAgent, buildMessages };
})();
