/* ========================================================================
3. ENCICLOPEDIA DE EJERCICIOS (GRUPOS, FILTROS, DETALLE Y ENVÍO AL TIMER)
   ======================================================================== */
const EXERCISE_GROUPS = [
  { id: "Strength & Power", name: "Fuerza y Potencia",             color: "#fb7185", soft: "rgba(251, 113, 133, 0.13)" },
  { id: "Power Endurance",  name: "Fuerza-Resistencia",            color: "#fb923c", soft: "rgba(251, 146, 60, 0.14)" },
  { id: "Aerobic Base",     name: "Base Aeróbica",                 color: "#38bdf8", soft: "rgba(56, 189, 248, 0.13)" },
  { id: "Conditioning",     name: "Tren inferior",                 color: "#fbbf24", soft: "rgba(251, 191, 36, 0.13)" },
  { id: "Flexibility",      name: "Antagonistas y Estabilizadores",color: "#34d399", soft: "rgba(52, 211, 153, 0.13)" },
  { id: "Fingerboard",      name: "Multipresa / Dedos",            color: "#2dd4bf", soft: "rgba(45, 212, 191, 0.13)" },
  { id: "Open",             name: "Técnica y Búlder",              color: "#c084fc", soft: "rgba(192, 132, 252, 0.13)" },
  { id: "Other",            name: "Descarga / Tendón",             color: "#94a3b8", soft: "rgba(148, 163, 184, 0.14)" }
];

function resolveExerciseGroup(ex) {
  const fRaw = String((ex && (ex.focus || ex.category)) || "").toLowerCase();
  if (/tren inferior|pierna|isquio|psoas|zancada|propiocep|core/.test(fRaw)) {
    return EXERCISE_GROUPS.find(g => g.id === "Conditioning");
  }
  if (/antagonista|estabilizador|empuje|tríceps|triceps|movilidad|prehab|manguito/.test(fRaw)) {
    return EXERCISE_GROUPS.find(g => g.id === "Flexibility");
  }
  if (ex && ex.group) {
    const rawGrp = String(ex.group).trim().toLowerCase();
    const byExact = EXERCISE_GROUPS.find(g => g.id.toLowerCase() === rawGrp || g.name.toLowerCase() === rawGrp);
    if (byExact) return byExact;
  }
  return EXERCISE_GROUPS[0];
}

function onEncySearchInput() {
  state.encySearch = document.getElementById("ency-search")?.value || "";
  document.getElementById("ency-search-clear")?.classList.toggle("hidden", !state.encySearch.trim());
  renderEncyclopedia();
}

function clearEncySearch() {
  state.encySearch = "";
  const input = document.getElementById("ency-search");
  if (input) input.value = "";
  document.getElementById("ency-search-clear")?.classList.add("hidden");
  renderEncyclopedia();
}

function selectEncyGroup(groupId) {
  state.encyGroup = (state.encyGroup === groupId) ? "" : groupId;
  state.encyFocus = "";
  state.encyDetailId = null;
  renderEncyclopedia();
}

function selectEncyFocus(tag) {
  state.encyFocus = (state.encyFocus === tag) ? "" : tag;
  state.encyDetailId = null;
  renderEncyclopedia();
}

function clearEncyFilters() {
  state.encyGroup = "";
  state.encyFocus = "";
  clearEncySearch();
}

function openExerciseDetail(exId) {
  const ex = state.data.encyclopedia.find(e => e.id === exId);
  if (!ex) return;

  if (!state.encyDetailId && state.currentView !== "ency") {
    state.prevView = state.currentView;
  }
  state.encyDetailId = exId;

  ["home", "train", "ency", "log"].forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle("hidden", v !== "ency");
  });
  document.getElementById("global-plan-card")?.classList.add("hidden");

  renderEncyclopedia();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeExerciseDetail() {
  const returnTo = state.prevView;
  state.encyDetailId = null;
  state.prevView = null;
  if (returnTo && returnTo !== "ency") {
    switchView(returnTo, document.querySelector(`.nav-btn[data-view="${returnTo}"]`));
    return;
  }
  switchView("ency", document.querySelector('.nav-btn[data-view="ency"]'));
}

function renderEncyclopedia() {
  const browserEl = document.getElementById("ency-browser");
  const detailEl = document.getElementById("ency-detail");
  if (!browserEl || !detailEl) return;

  const allItems = state.data.encyclopedia || [];
  const totalBadge = document.getElementById("ency-total-badge");
  if (totalBadge) totalBadge.textContent = allItems.length;

  if (state.encyDetailId) {
    const ex = allItems.find(e => e.id === state.encyDetailId);
    if (ex) {
      const grp = resolveExerciseGroup(ex);
      const imgSrc = ex.media_url ? (ex.media_url.startsWith("http") ? ex.media_url : `./${ex.media_url}`) : "";
      const backLabel = state.prevView === "train"
        ? `Volver a Entrenar (${state.dayCode})`
        : (state.prevView === "home" ? "Volver a Inicio" : "Volver a Enciclopedia");

      const prevEx = ex.regression_prev_id ? allItems.find(e => e.id === ex.regression_prev_id) : null;
      const nextEx = ex.progression_next_id ? allItems.find(e => e.id === ex.progression_next_id) : null;
      const chainHtml = (prevEx || nextEx) ? `
        <div class="chain-box">
          ${prevEx ? `<button type="button" class="chain-btn" onclick="openExerciseDetail('${prevEx.id}')"><small>↓ Regresión más fácil</small><span>${prevEx.name}</span></button>` : `<div></div>`}
          ${nextEx ? `<button type="button" class="chain-btn" onclick="openExerciseDetail('${nextEx.id}')"><small>↑ Siguiente progresión</small><span>${nextEx.name}</span></button>` : `<div></div>`}
        </div>
      ` : "";

      browserEl.classList.add("hidden");
      detailEl.classList.remove("hidden");
      detailEl.innerHTML = `
        <div class="card" style="border-top: 3px solid ${grp.color};">
          <div class="detail-header">
            <button type="button" class="btn-secondary" onclick="closeExerciseDetail()">
              ${iconSvg("back", 14)}<span>${backLabel}</span>
            </button>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <span class="grp-pill" style="background:${grp.soft}; color:${grp.color};">
                <span class="grp-dot" style="background:${grp.color};"></span><span>${grp.name}</span>
              </span>
              ${ex.focus ? `<span class="focus-badge">${ex.focus}</span>` : ""}
            </div>
          </div>

          <h2 style="font-size:20px; font-weight:800;">${ex.name}</h2>
          ${imgSrc ? `<img src="${imgSrc}" alt="${ex.name}" class="detail-hero-img" onerror="this.style.display='none'" />` : ""}

          <div style="margin-top:12px;">
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:${grp.color};">Objetivo</div>
            <p style="font-size:13.5px; margin-top:4px;">${ex.goal}</p>
          </div>

          <div style="margin-top:14px;">
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:${grp.color};">Ejecución paso a paso</div>
            <ol class="detail-steps">${(ex.steps || []).map(s => `<li>${s}</li>`).join("")}</ol>
          </div>

          <div style="background:var(--surface-2); border-left:3px solid ${grp.color}; padding:11px 13px; border-radius:10px; font-size:12.5px;">
            <strong style="color:${grp.color};">Alternativa Segura (safeAlt):</strong>
            <span style="color:var(--text-muted);">${ex.safeAlt}</span>
          </div>

          ${chainHtml}

          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-top:16px; padding-top:12px; border-top:1px solid var(--hairline);">
            <span style="font-size:11px; color:var(--text-muted);">Fuente: ${ex.author}</span>
            <button type="button" class="btn-primary" style="width:auto; padding:9px 14px;" onclick="sendExerciseToTimer('${ex.id}')">Cargar en Timer</button>
          </div>
        </div>
      `;
      return;
    }
    state.encyDetailId = null;
  }

  detailEl.classList.add("hidden");
  browserEl.classList.remove("hidden");

  document.getElementById("ency-groups-grid").innerHTML = EXERCISE_GROUPS.map(g => {
    const count = allItems.filter(e => resolveExerciseGroup(e).id === g.id).length;
    const isSelected = state.encyGroup === g.id;
    return `
      <button type="button" class="group-tile"
        style="${isSelected ? `border-color:${g.color}; background:${g.soft};` : ""}"
        onclick="selectEncyGroup('${g.id}')">
        <div class="group-tile-top">
          <span class="group-swatch" style="background:${g.color};"></span>
          <span class="group-count">${count}</span>
        </div>
        <div class="group-name">${g.name}</div>
      </button>
    `;
  }).join("");

  const basePool = state.encyGroup ? allItems.filter(e => resolveExerciseGroup(e).id === state.encyGroup) : allItems;
  const focusTags = Array.from(new Set(basePool.map(e => e.focus).filter(Boolean)));
  const focusBar = document.getElementById("ency-focus-bar");
  if (focusTags.length > 1) {
    focusBar.classList.remove("hidden");
    focusBar.innerHTML = focusTags.map(tag => `
      <button type="button" class="focus-chip ${state.encyFocus === tag ? "active" : ""}" onclick="selectEncyFocus('${tag.replace(/'/g, "\\'")}')">${tag}</button>
    `).join("");
  } else {
    focusBar.classList.add("hidden");
  }

  const q = state.encySearch.toLowerCase().trim();
  const list = allItems.filter(e => {
    const grp = resolveExerciseGroup(e);
    const matchGroup = !state.encyGroup || grp.id === state.encyGroup;
    const matchFocus = !state.encyFocus || e.focus === state.encyFocus;
    const matchQ = !q || e.name.toLowerCase().includes(q) || (e.goal || "").toLowerCase().includes(q) || (e.focus || "").toLowerCase().includes(q);
    return matchGroup && matchFocus && matchQ;
  });

  document.getElementById("ency-active-heading").textContent = `Mostrando ${list.length} de ${allItems.length} ejercicios`;
  document.getElementById("ency-show-all-btn").classList.toggle("hidden", !state.encyGroup && !state.encyFocus && !q);

  document.getElementById("ency-list").innerHTML = list.map(e => {
    const grp = resolveExerciseGroup(e);
    const imgSrc = e.media_url ? (e.media_url.startsWith("http") ? e.media_url : `./${e.media_url}`) : "";
    return `
      <div class="ency-card" onclick="openExerciseDetail('${e.id}')">
        <span class="ency-accent-bar" style="background:${grp.color};"></span>
        ${imgSrc ? `<img src="${imgSrc}" alt="${e.name}" class="ency-img" loading="lazy" onerror="this.style.display='none'" />` : ""}
        <div style="flex:1; min-width:0;">
          <div class="ency-top">
            <span class="grp-pill" style="background:${grp.soft}; color:${grp.color};">
              <span class="grp-dot" style="background:${grp.color};"></span><span>${grp.name}</span>
            </span>
            ${e.focus ? `<span class="focus-badge">${e.focus}</span>` : ""}
          </div>
          <div class="ency-title">${e.name}</div>
          <p class="muted-small" style="margin-top:4px;">${e.goal}</p>
        </div>
      </div>
    `;
  }).join("");
}

function sendExerciseToTimer(exId) {
  const ex = state.data.encyclopedia.find(e => e.id === exId);
  if (!ex) return;
  state.encyDetailId = null;
  state.prevView = null;
  switchView("train", document.querySelector('.nav-btn[data-view="train"]'));

  const queue = getDayExerciseQueue();
  const idx = queue.findIndex(q => q.exId === exId);
  if (idx >= 0) { loadQueueExerciseAt(idx, false); return; }

  const holdSec = Number(ex.hold_sec) || 0;
  const sets = Math.max(1, Number(ex.sets) || 3);
  const setRest = Math.max(30, Number(ex.set_rest_sec) || 90);
  latLinked = { checkKey: null, exId: ex.id, exName: ex.name, sectionName: "", rx: holdSec > 0 ? `${sets} x ${holdSec}s` : `${sets} series`, restText: `${setRest}s`, queueIndex: 0 };
  timerCfg = { mode: holdSec > 0 ? "interval" : "rest", prep: 5, work: holdSec || 10, restRep: Number(ex.rest_rep_sec) || 0, reps: Number(ex.reps) || 1, sets, setRest, warmupSec: 900, blockWindowSec: 1200 };
  syncIntervalInputsFromCfg();
  resetTimer();
  renderTrainView();
}
