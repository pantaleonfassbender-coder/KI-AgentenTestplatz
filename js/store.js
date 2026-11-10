/* Data Storage & Management (MVRP-Layer 7): Sitzungen ausschliesslich lokal im Browser
   (localStorage). Kein Server-Speicher. Jede Funktion ist gegen fehlenden/verweigerten
   Browser-Speicher abgesichert. */

window.Store = (function () {
  const KEY = "katp_sessions_v2";
  const LEGACY_KEY = "katp_sessions_v1"; // Sitzungen der Rundenfassung (E1–E6)

  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveAll(sessions) {
    try {
      localStorage.setItem(KEY, JSON.stringify(sessions));
      return true;
    } catch {
      return false;
    }
  }

  function get(id) {
    return loadAll().find((s) => s.id === id) || null;
  }

  function put(session) {
    const all = loadAll();
    const i = all.findIndex((s) => s.id === session.id);
    if (i >= 0) all[i] = session;
    else all.push(session);
    return saveAll(all);
  }

  function remove(id) {
    return saveAll(loadAll().filter((s) => s.id !== id));
  }

  function available() {
    try {
      localStorage.setItem(KEY + "_probe", "1");
      localStorage.removeItem(KEY + "_probe");
      return true;
    } catch {
      return false;
    }
  }

  /* Altdaten der Rundenfassung (E1–E6) bleiben unverändert im Browser und können
     in der Forschungsansicht gesichert werden. */
  function legacyRaw() {
    try { return localStorage.getItem(LEGACY_KEY); } catch { return null; }
  }

  /* Import (z. B. Sitzungen anderer Erhebungsstationen oder Ratings anderer
     Rater:innen): Sitzungen per id zusammenführen, Ratings je Rater:in vereinigen. */
  function importSessions(list) {
    const all = loadAll();
    let neu = 0, ergaenzt = 0;
    for (const s of list) {
      if (!s || s.schema !== 2 || !s.id) continue;
      const i = all.findIndex((x) => x.id === s.id);
      if (i < 0) { all.push(s); neu++; continue; }
      const cur = all[i];
      const curEnd = cur.task && cur.task.endedAt;
      const base = (!curEnd && s.task && s.task.endedAt) ? s : cur;
      base.ratings = { ...(cur.ratings || {}), ...(s.ratings || {}) };
      base.kodierung = cur.kodierung || s.kodierung || null;
      all[i] = base;
      ergaenzt++;
    }
    return saveAll(all) ? { neu, ergaenzt } : null;
  }

  return { loadAll, get, put, remove, available, legacyRaw, importSessions };
})();
