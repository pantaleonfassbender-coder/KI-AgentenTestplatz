/* Workflow & Orchestration + Scenario Engine (MVRP-Layer 2 und 4).
   Rundenmaschine, Kennzahlen-Fortschreibung (vereinfachtes Planspielmodell),
   Reliance-Index (Heuristik: Wort-Bigramm-Ueberlappung). */

window.Engine = (function () {
  function uuid() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      "s-" + Date.now() + "-" + Math.floor(Math.random() * 1e9);
  }

  /* Autonomieplan: konstant oder within-subject in zwei Bloecken (Reihenfolge randomisiert). */
  function buildAutonomyByRound(plan, nRounds) {
    if (plan === "niedrig" || plan === "hoch") {
      return Array(nRounds).fill(plan);
    }
    const half = Math.ceil(nRounds / 2);
    const firstLow = Math.random() < 0.5;
    return Array.from({ length: nRounds }, (_, i) =>
      (i < half) === firstLow ? "niedrig" : "hoch"
    );
  }

  /* Modulfolge: Standardsequenz, bei mehr Runden Vertiefungsrunden (Wiederholung
     der Sequenz mit fortgeschriebenen Kennzahlen). */
  function buildSequence(nRounds) {
    const seq = [];
    for (let i = 0; i < nRounds; i++) {
      seq.push(window.DEFAULT_SEQUENCE[i % window.DEFAULT_SEQUENCE.length]);
    }
    return seq;
  }

  function createSession(opts) {
    const n = Math.min(Math.max(opts.rounds || 6, 3), 15);
    return {
      id: uuid(),
      code: opts.code,
      provider: opts.provider,
      autonomyPlan: opts.autonomyPlan,
      autonomyByRound: buildAutonomyByRound(opts.autonomyPlan, n),
      sequence: buildSequence(n),
      createdAt: new Date().toISOString(),
      status: "neu",
      consent: null,
      baseline: null,
      kpi: { budget: 100, umsatz: 100, risiko: 50 },
      rounds: [],
      final: null,
    };
  }

  function currentRoundIndex(session) {
    return session.rounds.length;
  }

  function isFinished(session) {
    return session.rounds.length >= session.sequence.length &&
      session.rounds.every((r) => r.endedAt);
  }

  function startRound(session) {
    const i = currentRoundIndex(session);
    if (i >= session.sequence.length) return null;
    const round = {
      n: i + 1,
      moduleId: session.sequence[i],
      autonomy: session.autonomyByRound[i],
      startedAt: new Date().toISOString(),
      endedAt: null,
      kpiBefore: { ...session.kpi },
      interactions: [],
      decision: null,
      successProb: null,
      relianceIndex: null,
      survey: null,
      rating: null,
    };
    session.rounds.push(round);
    session.status = "laufend";
    return round;
  }

  /* Reliance-Index: Anteil der Wort-Bigramme der finalen Entscheidung, die in den
     Agentenbeitraegen derselben Runde vorkommen (0-1). Heuristik zur Erstsichtung. */
  function computeReliance(decision, agentTexts) {
    const bigrams = (text) => {
      const words = text.toLowerCase().replace(/[^\wäöüß\s-]/g, " ").split(/\s+/).filter(Boolean);
      const set = new Set();
      for (let i = 0; i < words.length - 1; i++) set.add(words[i] + " " + words[i + 1]);
      return set;
    };
    const dec = bigrams(decision);
    if (dec.size === 0) return null;
    const agent = bigrams(agentTexts.join(" \n "));
    if (agent.size === 0) return 0;
    let hits = 0;
    dec.forEach((b) => { if (agent.has(b)) hits++; });
    return Math.round((hits / dec.size) * 100) / 100;
  }

  /* Kennzahlen-Fortschreibung: deterministisch aus Selbsteinschaetzung der
     Erfolgswahrscheinlichkeit; ausdruecklich Kontextsignal, kein validiertes Erfolgsmass. */
  function updateKpi(kpi, successProb) {
    const delta = ((successProb ?? 50) - 50) / 12.5; // -4 .. +4
    return {
      budget: Math.max(0, Math.round(kpi.budget - 2 + delta / 2)),
      umsatz: Math.max(0, Math.round(kpi.umsatz + delta)),
      risiko: Math.min(100, Math.max(0, Math.round(kpi.risiko - delta))),
    };
  }

  function finalizeRound(session, round, decision, successProb, survey) {
    round.decision = decision;
    round.successProb = successProb;
    round.survey = survey;
    round.relianceIndex = computeReliance(
      decision,
      round.interactions.filter((x) => x.role === "agent").map((x) => x.content)
    );
    round.endedAt = new Date().toISOString();
    session.kpi = updateKpi(session.kpi, successProb);
    if (isFinished(session) && session.final) session.status = "abgeschlossen";
  }

  function kpiDeltaText(before, after) {
    const parts = [];
    const label = { budget: "Budgetindex", umsatz: "Umsatzindex", risiko: "Risikoindex" };
    for (const k of ["budget", "umsatz", "risiko"]) {
      const d = after[k] - before[k];
      if (d !== 0) parts.push(`${label[k]} ${d > 0 ? "+" : ""}${d}`);
    }
    return parts.length ? parts.join(", ") : "Kennzahlen unverändert";
  }

  return {
    createSession, currentRoundIndex, isFinished, startRound,
    computeReliance, finalizeRound, kpiDeltaText,
  };
})();
