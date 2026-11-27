/* ========================================================================
1. CONFIGURACIÓN, ALMACENAMIENTO Y SINCRONIZACIÓN API
   ======================================================================== */
const DEFAULT_API_URL = "https://script.google.com/macros/s/AKfycbyhs-VJFh0Apnj4kQcKjalThItp5POk6TOH9Kc8XEnZ6oCQVX0Inu_ziB0YEBElkCglrA/exec";
const PIN_CODE = "2026";

const STORAGE_KEYS = {
  AUTH: "sunblock_auth_v3",
  API_URL: "sunblock_api_url_v3",
  BLOCK: "sunblock_block_v3",
  WEEK: "sunblock_week_v3",
  CHECKS: "sunblock_checks_v3",
  EXTRAS: "sunblock_extras_v3",
  CACHE: "sunblock_cache_v3",
  PENDING_QUEUE: "sunblock_offline_queue_v3",
  DELOAD_ALERT: "sunblock_deload_alert_v3"
};

const memoryStorage = {};
const safeStorage = {
  get(key) {
    if (Object.prototype.hasOwnProperty.call(memoryStorage, key)) return memoryStorage[key];
    try { if (localStorage.getItem(key) !== null) return localStorage.getItem(key); } catch (_) {}
    try { if (sessionStorage.getItem(key) !== null) return sessionStorage.getItem(key); } catch (_) {}
    return null;
  },
  set(key, val) {
    const str = String(val);
    memoryStorage[key] = str;
    try { localStorage.setItem(key, str); } catch (_) {}
    try { sessionStorage.setItem(key, str); } catch (_) {}
  },
  remove(key) {
    delete memoryStorage[key];
    try { localStorage.removeItem(key); } catch (_) {}
    try { sessionStorage.removeItem(key); } catch (_) {}
  }
};

function safeJsonParse(raw, fallback) {
  if (!raw) return fallback;
  try { const p = JSON.parse(raw); return p ?? fallback; } catch (_) { return fallback; }
}

if (!safeStorage.get(STORAGE_KEYS.API_URL)) {
  safeStorage.set(STORAGE_KEYS.API_URL, DEFAULT_API_URL);
}

function getApiUrl() {
  return safeStorage.get(STORAGE_KEYS.API_URL) || DEFAULT_API_URL;
}

function normalizeDayCode(raw) {
  const m = String(raw || "").toUpperCase().match(/D[1-7]/);
  return m ? m[0] : String(raw || "").trim().toUpperCase();
}

function normalizeBackendPayload(json) {
  const rawBlocks = json.mesociclos || json.blocks || [];
  const blocks = rawBlocks.map(b => {
    let phases = [];
    if (Array.isArray(b.phases)) phases = b.phases;
    else if (typeof b.phases_json === "string" && b.phases_json.trim()) {
      phases = safeJsonParse(b.phases_json, []);
    }
    return {
      id: b.block_id || b.id,
      title: b.title || b.block_id,
      weeks: Number(b.weeks) || 4,
      phases
    };
  });

  const rawEncy = json.enciclopedia || json.encyclopedia || [];
  const encyclopedia = rawEncy.map(e => ({
    ...e,
    id: String(e.id || "").trim(),
    name: String(e.name || "").trim(),
    group: String(e.group || "Conditioning").trim(),
    focus: String(e.focus || "").trim(),
    hold_sec: Number(e.hold_sec) || 0,
    rest_rep_sec: Number(e.rest_rep_sec) || 0,
    reps: Number(e.reps) || 1,
    sets: Number(e.sets) || 3,
    set_rest_sec: Number(e.set_rest_sec) || 90,
    steps: Array.isArray(e.steps)
      ? e.steps
      : String(e.steps || "").split("|").map(s => s.trim()).filter(Boolean),
    safeAlt: e.safeAlt || "Reducir carga o volumen según sensaciones.",
    author: e.author || "SUNBLOCK · Eric Hörst",
    media_url: e.media_url || "",
    progression_next_id: String(e.progression_next_id || "").trim(),
    regression_prev_id: String(e.regression_prev_id || "").trim()
  }));

  const rawMicro = json.microciclos || json.microcycles || [];
  const dayMap = new Map();
  rawMicro.forEach(r => {
    const bId = String(r.block_id || r.blockId || "").trim();
    const dCode = normalizeDayCode(r.day_code || r.code);
    if (!bId || !dCode) return;
    const key = `${bId}__${dCode}`;
    if (!dayMap.has(key)) {
      dayMap.set(key, {
        blockId: bId,
        code: dCode,
        shortTitle: r.day_short || r.shortTitle || dCode,
        title: r.day_title || r.title || dCode,
        tag: r.day_tag || r.tag || "SESIÓN",
        duration: r.duration || "",
        focus: r.rule || r.focus || "",
        sections: []
      });
    }
    const dayObj = dayMap.get(key);
    const secName = String(r.section || "").trim();
    const exId = String(r.ex_id || r.exId || "").trim();
    if (secName && exId) {
      let secObj = dayObj.sections.find(s => s.name === secName);
      if (!secObj) { secObj = { name: secName, items: [] }; dayObj.sections.push(secObj); }
      secObj.items.push({
        exId,
        rx: r.rx || "",
        rest: r.rest || "",
        p2: r.p2 || "",
        p3: r.p3 || ""
      });
    }
  });

  const rawLogs = json.bitacora || json.logs || [];
  const logs = rawLogs.map(l => ({
    _row_index: l._row_index || null,
    timestamp: l.timestamp || "",
    date: l.date || "",
    blockId: String(l.block_id || l.blockId || "").trim(),
    mesoTitle: l.meso_title || "",
    week: Number(l.week) || 1,
    dayCode: normalizeDayCode(l.day_code || l.dayCode),
    dayTitle: l.day_title || l.dayTitle || "",
    rpe: Number(l.rpe ?? 0),
    dedos: String(l.dedos || "verde").toLowerCase(),
    codos: String(l.codos || "verde").toLowerCase(),
    note: l.note || "",
    readiness: Number(l.readiness_score ?? 8),
    durationMin: Number(l.session_duration_min ?? 0),
    exercisesJson: l.exercises_log_json || "[]"
  }));

  return {
    blocks,
    encyclopedia,
    microcycles: Array.from(dayMap.values()),
    logs,
    dashboard: json.dashboard || {}
  };
}

async function flushOfflineQueue() {
  const queue = safeJsonParse(safeStorage.get(STORAGE_KEYS.PENDING_QUEUE), []);
  if (!queue.length) return;
  const url = getApiUrl();
  const remaining = [];

  for (const item of queue) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(item)
      });
      const json = await res.json();
      if (!json || json.status !== "ok") remaining.push(item);
    } catch (_) {
      remaining.push(item);
    }
  }
  safeStorage.set(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(remaining));
}

async function syncFromSheets(forceRefresh = false) {
  const url = getApiUrl();
  const dot = document.getElementById("sync-dot");
  const label = document.getElementById("sync-label");

  if (dot) dot.className = "dot";
  if (label) label.textContent = "Sincronizando...";

  try {
    await flushOfflineQueue();
    const fetchUrl = forceRefresh ? `${url}?action=get_all&refresh=true` : `${url}?action=get_all`;
    const res = await fetch(fetchUrl);
    const json = await res.json();

    if (json && json.status === "ok") {
      state.data = normalizeBackendPayload(json);
      safeStorage.set(STORAGE_KEYS.CACHE, JSON.stringify(state.data));
      if (dot) dot.className = "dot online";
      if (label) label.textContent = "Conectado";
      renderAll();
    } else {
      throw new Error("Respuesta inválida");
    }
  } catch (_) {
    if (dot) dot.className = "dot offline";
    if (label) label.textContent = "Modo Offline";
  }
}

async function postToSheets(payload) {
  const url = getApiUrl();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json && json.status === "ok") return json;
    throw new Error(json?.message || "Error en servidor");
  } catch (_) {
    const queue = safeJsonParse(safeStorage.get(STORAGE_KEYS.PENDING_QUEUE), []);
    queue.push(payload);
    safeStorage.set(STORAGE_KEYS.PENDING_QUEUE, JSON.stringify(queue));
    return { status: "queued" };
  }
}
