/* Data Storage & Management (MVRP-Layer 7): Sitzungen ausschliesslich lokal im Browser
   (localStorage). Kein Server-Speicher. Jede Funktion ist gegen fehlenden/verweigerten
   Browser-Speicher abgesichert. */

window.Store = (function () {
  const KEY = "katp_sessions_v1";

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

  return { loadAll, get, put, remove, available };
})();
