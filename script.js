/* =============================================================
   SOLMNEX // PROTOTYPE 01 — script.js

   CONTROL MAP
   -----------
   ROUTES:
     P1 HOME (landing + live feed demo)
     P2 FORUMS
     P3 NEWS  (disguise news page)
     P4 ART
     P5 HELP
     P6 SENTINEL (lock-in console)
     P7 HUB    (windowed agent desktop — unlocked only)

   MODES:
     disguise  — pre-lock-in. Public top-nav visible.
     agent     — post-lock-in. Hub top-nav visible, HUB desktop active,
                 floating windows spawnable from registry.

   MODULAR WINDOW REGISTRY
   -----------------------
   Add a window: append an entry to WINDOWS below.
     { id, title, subtitle, icon, locked, render() => HTML, defaults: {x,y,w,h} }
   The dock + side-nav use data-open="<id>" to spawn it. Each window
   becomes a draggable, focusable panel on the Hub desktop.

   BACKEND HOOKS (no backend yet — markers for later):
     // BACKEND_HOOK_AUTH      — real Sentinel auth
     // BACKEND_HOOK_PROGRESS  — sync unlock/role/signal
     // BACKEND_HOOK_FORUM     — replace fake chat with real forum API
     // BACKEND_HOOK_LOGS      — persist textlogs to DB
     // BACKEND_HOOK_CONTENT   — CMS for dossiers / articles
   ============================================================= */

"use strict";

// -------------------------------------------------------------
// CONFIG & DATA
// -------------------------------------------------------------
const CONFIG = {
  storageKey: "solmnex.proto.v1",
  toastCooldownMs: 950,
  timeline: [
    { id: "TL-P1-2", time:  800, action: "feed-start" },
    { id: "TL-P1-3", time: 1600, action: "chat-1" },
    { id: "TL-P1-3", time: 2800, action: "chat-2" },
    { id: "TL-P1-3", time: 4200, action: "chat-3" },
    { id: "TL-P1-4", time: 6100, action: "uplink" },
    { id: "TL-P1-6", time: 9300, action: "moon" }
  ],
  publicRoutes: ["P1", "P2", "P3", "P4", "P5", "P6"],
  hubRoutes:    ["P7"]
};

const ROUTE_NAMES = {
  P1: "HOME", P2: "FORUMS", P3: "NEWS", P4: "ART",
  P5: "HELP", P6: "SENTINEL", P7: "HUB"
};

const ARTICLES = {
  A1: ["2024", "First Earth inhabitant visits Dine's Digital Corridor.",
       "Officials called it a civic misunderstanding. Witnesses called it a door that remembered their names."],
  A2: ["July 24, 2028", "Golden statue turns into Mercury overnight.",
       "The ministry called it vandalism. Metallurgists called it impossible. A city worker called it the third warning."],
  A3: ["2033", "What will Dine look like in 2040?",
       "Forecast models show signage updating before events occur. Critics call the renderings recovery footage."]
};

const CHAT = [
  ["CivicMod",  "Feed opened. Keep replies ordinary."],
  ["Guest_028", "That date stamp is wrong by three years."],
  ["Meryl",     "Do not identify the corridor in public."],
  ["System",    "UPLINK integrity falling.", "alert"],
  ["Willow",    "Stop refreshing. The URL is already terminated.", "alert"]
];

// -------------------------------------------------------------
// MODULAR WINDOW REGISTRY
// Add new windows here. Each window's `render()` returns HTML.
// -------------------------------------------------------------
const WINDOWS = [
  {
    id: "hub",
    title: "HUB Index",
    subtitle: "P7 // PRIMARY",
    icon: "H",
    defaults: { x: 40, y: 40, w: 520 },
    render: () => `
      <div>
        <h2>Welcome back, Agent.</h2>
        <p>Sentinel lock-in confirmed. You now have read-access to the classified workspace. Open any module from the left index or top nav. Every panel is a draggable window — arrange your desk however you prefer.</p>
      </div>
      <div class="row">
        <div class="mini"><strong>Clearance</strong>Sentinel · Tier 1</div>
        <div class="mini"><strong>Branch</strong>2026 // CTC-stable</div>
        <div class="mini"><strong>Origin</strong>2100 // SOLMNEX</div>
        <div class="mini"><strong>Channel</strong>LIVE</div>
      </div>
      <div class="mini">
        <strong>Quick keys</strong>
        Press <code>L</code> open LADECA · <code>S</code> SOLMNEX · <code>M</code> LATTICE · <code>Esc</code> close top window.
      </div>`
  },
  {
    id: "authorize",
    title: "Authorize",
    subtitle: "P8 // ROLE LADDER",
    icon: "@",
    defaults: { x: 580, y: 60, w: 480 },
    render: () => `
      <div>
        <h2>Role Ladder</h2>
        <p>Static unlocks are theatrical only. Real restrictions require server enforcement.</p>
      </div>
      <div class="row">
        <div class="mini"><strong>Current</strong><span id="ROLE-IN-WIN">Locked-In Agent</span></div>
        <div class="mini"><strong>Next</strong>Sentinel → HELIX → LADECA SSS → SOLMNEX HAX</div>
      </div>
      <div class="mini">
        <strong>Progress</strong>
        <div class="meter" style="--fill: 28%"></div>
      </div>`
  },
  {
    id: "ladeca",
    title: "LADECA",
    subtitle: "P9 // LOCKED DOSSIER",
    icon: "L",
    defaults: { x: 120, y: 240, w: 520 },
    render: () => `
      <div>
        <h2>LADECA</h2>
        <p>Created in 2060. Pillar stone of Human Ingenuity.</p>
        <p>Access requires future LADECA clearance. <span class="redacted">Lunar archive origin withheld.</span></p>
      </div>
      <div class="row">
        <div class="mini"><strong>Founded</strong>2060</div>
        <div class="mini"><strong>Status</strong>Operational</div>
      </div>`
  },
  {
    id: "solmnex",
    title: "SOLMNEX",
    subtitle: "P10 // PROTECTED",
    icon: "S",
    defaults: { x: 680, y: 280, w: 500 },
    render: () => `
      <div>
        <h2>SOLMNEX</h2>
        <p>Protected system intelligence and growth entity.</p>
        <p>Help SOLMNEX by nurturing growth. <span class="redacted">Simulation root hidden.</span></p>
      </div>
      <div class="mini"><strong>Growth Index</strong>
        <div class="meter" style="--fill: 64%"></div>
      </div>`
  },
  {
    id: "sss",
    title: "SSS",
    subtitle: "P11 // STABILITY",
    icon: "Σ",
    defaults: { x: 240, y: 460, w: 460 },
    render: () => `
      <div>
        <h2>Simulation Stability Security</h2>
        <p>Operation SSS monitors catastrophic branch collapse and ensures continuity across known timelines.</p>
      </div>
      <div class="mini"><strong>Branch Integrity</strong>
        <div class="meter" style="--fill: 88%"></div>
      </div>`
  },
  {
    id: "hax",
    title: "HAX",
    subtitle: "P12 // HOSTILE",
    icon: "X",
    defaults: { x: 760, y: 480, w: 460 },
    render: () => `
      <div>
        <h2>Hostile Anomaly eXclusion</h2>
        <p>Do not touch containment paths without clearance. Anomaly count classified.</p>
      </div>
      <div class="row">
        <div class="mini"><strong>Containment</strong>Nominal</div>
        <div class="mini"><strong>Last Breach</strong><span class="redacted">REDACTED</span></div>
      </div>`
  },
  {
    id: "lattice",
    title: "LATTICE",
    subtitle: "P13 // MAP STUB",
    icon: "✦",
    defaults: { x: 160, y: 120, w: 620 },
    render: () => `
      <div>
        <h2>Lattice Coordinate Screen</h2>
        <p>Interactive nodes. Locked destinations remain theatrical until clearance.</p>
      </div>
      <div class="map-stub">
        <button class="map-node" style="--x:18%;--y:35%" type="button">EARTH</button>
        <button class="map-node" style="--x:46%;--y:18%" type="button">DINE</button>
        <button class="map-node locked" style="--x:72%;--y:50%" type="button">LADECA</button>
        <button class="map-node" style="--x:54%;--y:74%" type="button">STILLPOINT</button>
        <button class="map-node locked" style="--x:30%;--y:64%" type="button">2100</button>
      </div>`
  },
  {
    id: "helix",
    title: "HELIX",
    subtitle: "P14 // LINEAGE",
    icon: "%",
    defaults: { x: 320, y: 200, w: 460 },
    render: () => `
      <div>
        <h2>Helix</h2>
        <p>Lineage, identity, and branch relation. Helix access binds names across divergent schemas.</p>
      </div>
      <div class="mini"><strong>Active Branches</strong>3 known · 14 suspected</div>`
  },
  {
    id: "research",
    title: "Research",
    subtitle: "P15 // ARCHIVE",
    icon: "R",
    defaults: { x: 80, y: 320, w: 540 },
    render: () => `
      <div>
        <h2>Research Archive</h2>
        <p>Textlogs begin locally. Real submissions later.</p>
      </div>
      <div class="textlog-form" style="display: grid; gap: 8px;">
        <input id="INPUT-LOG-TITLE" type="text" placeholder="Textlog title" autocomplete="off" />
        <textarea id="INPUT-LOG-BODY" placeholder="Write markdown textlog..."></textarea>
        <button id="BTN-SAVE-TEXTLOG" class="small-btn" type="button">Save Local Textlog</button>
      </div>
      <div id="TEXTLOG-LIST" class="textlog-list"></div>`
  },
  {
    id: "council",
    title: "Council",
    subtitle: "P16 // GOVERNANCE",
    icon: "Ω",
    defaults: { x: 600, y: 360, w: 460 },
    render: () => `
      <div>
        <h2>Council</h2>
        <p>Governance, moderation, archive decisions. Petitions are recorded after authorization.</p>
      </div>
      <div class="mini"><strong>Pending Petitions</strong>4</div>`
  },
  {
    id: "projects",
    title: "Projects",
    subtitle: "P17 // TRACKING",
    icon: "P",
    defaults: { x: 380, y: 540, w: 520 },
    render: () => `
      <div>
        <h2>Operational Projects</h2>
      </div>
      <div class="mini"><strong>LADECA</strong>
        <div class="meter" style="--fill: 34%"></div>
      </div>
      <div class="mini"><strong>SSS</strong>
        <div class="meter" style="--fill: 88%"></div>
      </div>
      <div class="mini"><strong>Dr. Burns // 2100 Return</strong>
        <div class="meter" style="--fill: 12%"></div>
      </div>`
  }
];

// -------------------------------------------------------------
// SHORTCUTS
// -------------------------------------------------------------
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const els = {
  body:         document.body,
  pages:        $$(".page"),
  publicNav:    $("#NAV-PUBLIC"),
  hubNav:       $("#NAV-HUB"),
  sideNav:      $("#SIDENAV"),
  sideOpen:     $("#BTN-SIDENAV-OPEN"),
  toast:        $("#FX-UNAUTH-TOAST"),
  uplink:       $("#FX-UPLINK"),
  chat:         $("#FORUM-CHAT"),
  timeline:     $("#TIMELINE-STATUS"),
  routeStatus:  $("#ROUTE-STATUS"),
  signal:       $("#HUD-SIGNAL"),
  threads:      $("#HUD-THREADS"),
  alerts:       $("#HUD-ALERTS"),
  statusSignal: $("#STATUS-SIGNAL"),
  statusMode:   $("#STATUS-MODE"),
  moonHud:      $("#HUD-MOON"),
  moonEye:      $("#BTN-MOON"),
  moonChat:     $("#MOON-CHAT"),
  articleModal: $("#MODAL-ARTICLE"),
  articleDate:  $("#ARTICLE-DATE"),
  articleTitle: $("#ARTICLE-TITLE"),
  articleBody:  $("#ARTICLE-BODY"),
  role:         $("#ROLE-CURRENT"),
  windowLayer:  $("#WINDOW-LAYER"),
  feedTimestamp:$("#FEED-TIMESTAMP")
};

// -------------------------------------------------------------
// STATE
// -------------------------------------------------------------
let state = {
  route: "P1",
  mode: "disguise",     // disguise | agent
  unlockedHub: false,
  signal: 0,
  articlesOpened: 0,
  textlogs: [],
  openWindows: [],      // [{id, x, y, w, z}]
  toastCooldown: false,
  timelineStarted: false
};

let topZ = 50;
let dragState = null;

// -------------------------------------------------------------
// PERSISTENCE (in-memory only for prototype)
// BACKEND_HOOK_PROGRESS: replace these stubs with a real store
// (DB, server session, or a host-permitted storage layer).
// -------------------------------------------------------------
function saveState() {
  // No-op in static prototype. Hook a real persistence layer here.
}

function loadState() {
  // No-op in static prototype. Hook a real load layer here.
  if (!state.route) state.route = "P1";
  if (!Array.isArray(state.openWindows)) state.openWindows = [];
}

// -------------------------------------------------------------
// FX
// -------------------------------------------------------------
function setTimeline(id) {
  els.timeline.textContent = `${id} // ${ROUTE_NAMES[state.route] || state.route}`;
}

function glitch() {
  els.body.classList.add("glitching");
  window.setTimeout(() => els.body.classList.remove("glitching"), 440);
}

function showUnauthorized(event) {
  if (state.toastCooldown) return;
  state.toastCooldown = true;
  glitch();
  const x = event?.clientX || window.innerWidth / 2;
  const y = event?.clientY || window.innerHeight / 2;
  els.toast.style.setProperty("--toast-x", `${x}px`);
  els.toast.style.setProperty("--toast-y", `${y}px`);
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 850);
  window.setTimeout(() => { state.toastCooldown = false; }, CONFIG.toastCooldownMs);
}

// -------------------------------------------------------------
// ROUTING
// -------------------------------------------------------------
function canAccess(route) {
  if (CONFIG.publicRoutes.includes(route)) return true;
  if (CONFIG.hubRoutes.includes(route))    return state.unlockedHub;
  return false;
}

function routeTo(route, event) {
  if (!ROUTE_NAMES[route]) return;
  if (!canAccess(route)) {
    showUnauthorized(event);
    return;
  }
  state.route = route;
  saveState();
  renderRoute();
}

function renderRoute() {
  els.pages.forEach((page) => page.classList.toggle("active", page.id === state.route));
  els.body.dataset.route = state.route;
  els.routeStatus.textContent = `ROUTE: ${state.route} // ${ROUTE_NAMES[state.route]}`;
  $$(".route-btn").forEach((btn) => {
    if (btn.dataset.route) {
      btn.classList.toggle("active", btn.dataset.route === state.route);
    }
  });
  setTimeline(`TL-${state.route}-1`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// -------------------------------------------------------------
// MODE — disguise vs agent
// -------------------------------------------------------------
function renderMode() {
  const isAgent = state.mode === "agent" && state.unlockedHub;
  els.body.classList.toggle("hub-unlocked", isAgent);
  els.body.dataset.mode = isAgent ? "agent" : "disguise";
  els.publicNav.classList.toggle("hidden", isAgent);
  els.hubNav.classList.toggle("hidden", !isAgent);
  if (els.role)        els.role.textContent       = isAgent ? "Locked-In Agent" : "Guest";
  if (els.statusMode)  els.statusMode.textContent = isAgent ? "Locked-In Agent" : "Guest";

  // Side-nav locked-buttons unlock visually
  $$(".side-nav__locked").forEach((btn) => {
    btn.classList.toggle("unlocked", isAgent);
  });
}

function completeLockIn() {
  state.unlockedHub = true;
  state.mode = "agent";
  state.route = "P7";
  saveState();
  renderMode();
  renderRoute();
  // Spawn HUB window by default
  if (!state.openWindows.some(w => w.id === "hub")) {
    openWindow("hub");
  } else {
    restoreWindows();
  }
  // Brief stinger
  glitch();
}

function disengage() {
  state.mode = "disguise";
  state.route = "P3"; // drop user onto the disguise NEWS page
  saveState();
  renderMode();
  renderRoute();
}

// -------------------------------------------------------------
// WINDOW SYSTEM
// -------------------------------------------------------------
function windowDef(id) { return WINDOWS.find(w => w.id === id); }

function bringToFront(winEl) {
  topZ += 1;
  winEl.style.zIndex = topZ;
  const id = winEl.dataset.windowId;
  const wRec = state.openWindows.find(w => w.id === id);
  if (wRec) { wRec.z = topZ; saveState(); }
}

function openWindow(id) {
  const def = windowDef(id);
  if (!def) return;
  // If already open, just focus it
  const existing = els.windowLayer.querySelector(`[data-window-id="${id}"]`);
  if (existing) {
    bringToFront(existing);
    return existing;
  }
  // Persist state record
  let rec = state.openWindows.find(w => w.id === id);
  if (!rec) {
    const d = def.defaults || {};
    rec = {
      id,
      x: d.x ?? 40 + state.openWindows.length * 24,
      y: d.y ?? 60 + state.openWindows.length * 24,
      w: d.w ?? 520,
      z: ++topZ
    };
    state.openWindows.push(rec);
    saveState();
  }
  const winEl = buildWindowEl(def, rec);
  els.windowLayer.appendChild(winEl);
  bringToFront(winEl);
  attachWindowHandlers(winEl, def);
  return winEl;
}

function closeWindow(id) {
  const el = els.windowLayer.querySelector(`[data-window-id="${id}"]`);
  if (el) el.remove();
  state.openWindows = state.openWindows.filter(w => w.id !== id);
  saveState();
}

function minimizeWindow(id) {
  // For prototype: minimize = close (will reopen via dock/side-nav)
  closeWindow(id);
}

function maximizeWindow(id) {
  const el = els.windowLayer.querySelector(`[data-window-id="${id}"]`);
  if (!el) return;
  const isMax = el.classList.toggle("maximized");
  if (isMax) {
    el.dataset.prevX = el.style.left;
    el.dataset.prevY = el.style.top;
    el.dataset.prevW = el.style.width;
    el.style.left = "10px";
    el.style.top = "10px";
    el.style.width = "calc(100% - 20px)";
  } else {
    if (el.dataset.prevX) el.style.left  = el.dataset.prevX;
    if (el.dataset.prevY) el.style.top   = el.dataset.prevY;
    if (el.dataset.prevW) el.style.width = el.dataset.prevW;
  }
}

function buildWindowEl(def, rec) {
  const win = document.createElement("article");
  win.className = "window";
  win.dataset.windowId = def.id;
  win.style.left   = `${rec.x}px`;
  win.style.top    = `${rec.y}px`;
  win.style.width  = `${rec.w}px`;
  win.style.zIndex = rec.z || (++topZ);

  win.innerHTML = `
    <header class="window-header">
      <div class="window-title-wrap">
        <div class="window-icon" aria-hidden="true">${def.icon || "■"}</div>
        <div>
          <div class="window-title">${def.title}</div>
          <div class="window-subtitle">${def.subtitle || ""}</div>
        </div>
      </div>
      <div class="window-actions" aria-hidden="true">
        <button class="traffic min"   data-action="min"   aria-label="Minimize"></button>
        <button class="traffic max"   data-action="max"   aria-label="Maximize"></button>
        <button class="traffic close" data-action="close" aria-label="Close"></button>
      </div>
    </header>
    <div class="window-body">${def.render()}</div>
  `;
  return win;
}

function attachWindowHandlers(winEl, def) {
  // Focus on pointer down
  winEl.addEventListener("pointerdown", () => bringToFront(winEl));

  // Traffic light actions
  winEl.querySelectorAll(".traffic").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      if (action === "close") closeWindow(def.id);
      if (action === "min")   minimizeWindow(def.id);
      if (action === "max")   maximizeWindow(def.id);
    });
  });

  // Per-window post-render hooks
  if (def.id === "research") {
    const saveBtn = winEl.querySelector("#BTN-SAVE-TEXTLOG");
    if (saveBtn) saveBtn.addEventListener("click", () => saveTextlog(winEl));
    renderTextlogs(winEl);
  }

  // Dragging
  const header = winEl.querySelector(".window-header");
  let startX = 0, startY = 0, startLeft = 0, startTop = 0, dragging = false;

  header.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".traffic")) return;
    if (window.innerWidth <= 700) return;
    dragging = true;
    bringToFront(winEl);
    startX = e.clientX;
    startY = e.clientY;
    startLeft = winEl.offsetLeft;
    startTop  = winEl.offsetTop;
    try { header.setPointerCapture(e.pointerId); } catch (_) {}
  });

  header.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const layerRect = els.windowLayer.getBoundingClientRect();
    const maxLeft = Math.max(0, layerRect.width - winEl.offsetWidth - 8);
    const maxTop  = Math.max(0, 4000); // allow vertical room
    const nextLeft = Math.min(maxLeft, Math.max(0, startLeft + dx));
    const nextTop  = Math.min(maxTop,  Math.max(0, startTop  + dy));
    winEl.style.left = `${nextLeft}px`;
    winEl.style.top  = `${nextTop}px`;
  });

  function stopDrag(e) {
    if (!dragging) return;
    dragging = false;
    try { header.releasePointerCapture(e.pointerId); } catch (_) {}
    const rec = state.openWindows.find(w => w.id === def.id);
    if (rec) { rec.x = winEl.offsetLeft; rec.y = winEl.offsetTop; saveState(); }
  }
  header.addEventListener("pointerup", stopDrag);
  header.addEventListener("pointercancel", stopDrag);
}

function restoreWindows() {
  if (!state.unlockedHub) return;
  els.windowLayer.innerHTML = "";
  // Sort by z so we re-stack correctly
  const sorted = [...state.openWindows].sort((a, b) => (a.z || 0) - (b.z || 0));
  sorted.forEach(rec => {
    const def = windowDef(rec.id);
    if (!def) return;
    const winEl = buildWindowEl(def, rec);
    els.windowLayer.appendChild(winEl);
    attachWindowHandlers(winEl, def);
  });
  // Reset topZ to max
  topZ = sorted.reduce((max, r) => Math.max(max, r.z || 0), 50);
}

// -------------------------------------------------------------
// HANDLE data-open clicks (top nav / side nav / cards)
// -------------------------------------------------------------
function handleOpen(id, event) {
  // Lock-gated: any data-open requires lock-in
  if (!state.unlockedHub) {
    showUnauthorized(event);
    // Subtly hint toward the lock-in
    return;
  }
  // Make sure we're on the HUB desktop route
  if (state.route !== "P7") {
    state.route = "P7";
    saveState();
    renderRoute();
  }
  openWindow(id);
}

// -------------------------------------------------------------
// TIMELINE (HOME landing demo)
// -------------------------------------------------------------
function startHomeTimeline() {
  if (state.timelineStarted) return;
  state.timelineStarted = true;
  CONFIG.timeline.forEach((entry) => {
    window.setTimeout(() => handleTimeline(entry), entry.time);
  });
}

function handleTimeline(entry) {
  setTimeline(entry.id);
  if (entry.action === "chat-1") addChat(CHAT[0]);
  if (entry.action === "chat-2") addChat(CHAT[1]);
  if (entry.action === "chat-3") { addChat(CHAT[2]); addChat(CHAT[3]); }
  if (entry.action === "uplink") {
    els.body.classList.remove("pre-uplink");
    els.uplink.classList.add("active");
    addChat(CHAT[4]);
    glitch();
  }
  if (entry.action === "moon") showMoon();
}

function addChat([name, text, cls = ""]) {
  if (!els.chat) return;
  const li = document.createElement("li");
  if (cls) li.classList.add(cls);
  li.innerHTML = `<strong>${name}:</strong> ${escapeHtml(text)}`;
  els.chat.appendChild(li);
  while (els.chat.children.length > 7) els.chat.firstElementChild.remove();
}

function addSignal(amount = 1) {
  state.signal += amount;
  if (els.signal)        els.signal.textContent        = String(state.signal);
  if (els.statusSignal)  els.statusSignal.textContent  = String(state.signal);
  if (els.threads)       els.threads.textContent       = String(Number(els.threads.textContent || 0) + 1);
  if (els.alerts && amount > 1) {
    els.alerts.textContent = String(Number(els.alerts.textContent || 0) + 1);
  }
  saveState();
}

// -------------------------------------------------------------
// MOON
// -------------------------------------------------------------
function showMoon() {
  els.moonHud.classList.remove("hidden");
}

function updateMoon(event) {
  els.body.style.setProperty("--mx", `${event.clientX}px`);
  els.body.style.setProperty("--my", `${event.clientY}px`);
  if (els.moonHud.classList.contains("hidden")) return;
  const rect = els.moonEye.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top  + rect.height / 2);
  const dist = Math.max(1, Math.hypot(dx, dy));
  els.moonEye.style.setProperty("--eye-x", `${(dx / dist) * 10}px`);
  els.moonEye.style.setProperty("--eye-y", `${(dy / dist) * 10}px`);
}

// -------------------------------------------------------------
// ARTICLE MODAL
// -------------------------------------------------------------
function openArticle(id) {
  const article = ARTICLES[id];
  if (!article) return;
  state.articlesOpened += 1;
  addSignal(1);
  els.articleDate.textContent  = article[0];
  els.articleTitle.textContent = article[1];
  els.articleBody.textContent  = article[2];
  els.articleModal.classList.remove("hidden");
}

function closeArticle() {
  els.articleModal.classList.add("hidden");
}

// -------------------------------------------------------------
// TEXTLOG (inside research window)
// -------------------------------------------------------------
function saveTextlog(winEl) {
  const titleEl = winEl.querySelector("#INPUT-LOG-TITLE");
  const bodyEl  = winEl.querySelector("#INPUT-LOG-BODY");
  const title = (titleEl?.value || "").trim();
  const body  = (bodyEl?.value  || "").trim();
  if (!body) return;
  state.textlogs.unshift({ title, body, createdAt: new Date().toISOString() });
  addSignal(3);
  if (titleEl) titleEl.value = "";
  if (bodyEl)  bodyEl.value  = "";
  renderTextlogs(winEl);
}

function renderTextlogs(winEl) {
  const list = winEl.querySelector("#TEXTLOG-LIST");
  if (!list) return;
  if (!state.textlogs.length) {
    list.innerHTML = `<div class="mini"><strong>No textlogs yet</strong>Save your first to seed the archive.</div>`;
    return;
  }
  list.innerHTML = state.textlogs.map((log, i) => `
    <div class="mini">
      <strong>${escapeHtml(log.title || `Textlog ${i+1}`)}</strong>
      <pre style="white-space:pre-wrap;color:var(--muted);">${escapeHtml(log.body)}</pre>
    </div>`).join("");
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

// -------------------------------------------------------------
// FEED TIMESTAMP (looks alive)
// -------------------------------------------------------------
function tickFeed() {
  if (!els.feedTimestamp) return;
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  els.feedTimestamp.textContent = `${hh}:${mm}:${ss} UTC`;
}

// -------------------------------------------------------------
// WIRE-UP
// -------------------------------------------------------------
function wire() {
  document.addEventListener("mousemove", updateMoon);

  // Delegated route/open clicks
  document.addEventListener("click", (event) => {
    const openTarget = event.target.closest("[data-open]");
    if (openTarget) {
      event.preventDefault();
      handleOpen(openTarget.dataset.open, event);
      return;
    }
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      event.preventDefault();
      routeTo(routeTarget.dataset.route, event);
      return;
    }
    const articleBtn = event.target.closest("[data-article]");
    if (articleBtn) {
      event.preventDefault();
      openArticle(articleBtn.dataset.article);
    }
  });

  // Side nav toggle
  els.sideOpen.addEventListener("click", () => {
    const open = els.sideNav.classList.contains("collapsed");
    els.sideNav.classList.toggle("collapsed", !open);
    els.sideOpen.setAttribute("aria-expanded", String(open));
  });

  // Reload buttons (glitch + timeline status)
  const reloadFeed = $("#BTN-RELOAD-FEED");
  if (reloadFeed) reloadFeed.addEventListener("click", () => { setTimeline("TL-P1-5"); glitch(); });
  const reloadForum = $("#BTN-RELOAD-FORUM");
  if (reloadForum) reloadForum.addEventListener("click", () => { setTimeline("TL-P1-5"); glitch(); });

  // Fake chat on home
  const fakeChatForm = $("#FORM-FAKE-CHAT");
  if (fakeChatForm) fakeChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addSignal(1);
    const input = $("#INPUT-FAKE-CHAT");
    if (input) input.value = "";
    routeTo("P6", e);
  });

  // Forum post on P2
  const forumForm = $("#FORM-FORUM");
  if (forumForm) forumForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("#INPUT-FORUM").value.trim();
    if (!text) return;
    addSignal(2);
    $("#INPUT-FORUM").value = "";
    routeTo("P6", e);
  });

  $$(".forum-action").forEach((btn) => btn.addEventListener("click", () => addSignal(1)));

  // Sentinel form
  const sentinelForm = $("#FORM-SENTINEL");
  if (sentinelForm) sentinelForm.addEventListener("submit", (e) => {
    e.preventDefault();
    completeLockIn();
  });

  // Disengage
  const lockout = $("#BTN-LOCKOUT");
  if (lockout) lockout.addEventListener("click", disengage);

  // Article modal close
  $("#BTN-ARTICLE-CLOSE").addEventListener("click", closeArticle);
  els.articleModal.addEventListener("click", (event) => {
    if (event.target === els.articleModal) closeArticle();
  });

  // Moon HUD
  $("#BTN-MOON").addEventListener("click", () => els.moonChat.classList.toggle("open"));
  const moonLost = $("#BTN-MOON-LOST");
  if (moonLost) moonLost.addEventListener("click", () => {
    glitch();
    alert("UPLINK TERMINATED. Return path not implemented in static mode.");
  });
  const callMoon = $("#BTN-CALL-MOON");
  if (callMoon) callMoon.addEventListener("click", showMoon);

  // Accordion
  $$(".accordion-toggle").forEach((btn) => {
    btn.addEventListener("click", () => btn.nextElementSibling?.classList.toggle("open"));
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (event) => {
    const tag = event.target?.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    const key = event.key.toLowerCase();
    if (event.key === "Escape") {
      closeArticle();
      // Close top-most window
      const topWin = [...els.windowLayer.querySelectorAll(".window")]
        .sort((a,b) => Number(b.style.zIndex||0) - Number(a.style.zIndex||0))[0];
      if (topWin) closeWindow(topWin.dataset.windowId);
      return;
    }
    if (state.unlockedHub) {
      if (key === "l") handleOpen("ladeca", event);
      if (key === "s") handleOpen("solmnex", event);
      if (key === "m") handleOpen("lattice", event);
      if (key === "r") handleOpen("research", event);
      if (key === "h") handleOpen("hub", event);
    } else {
      if (key === "f") routeTo("P2", event);
      if (key === "h") routeTo("P6", event);
      if (key === "l") routeTo("P6", event);
      if (key === "s") routeTo("P6", event);
    }
  });
}

// -------------------------------------------------------------
// INIT
// -------------------------------------------------------------
function init() {
  loadState();
  wire();
  renderMode();
  // If returning unlocked, restore desktop
  if (state.unlockedHub && state.mode === "agent") {
    restoreWindows();
  }
  renderRoute();
  if (els.signal) els.signal.textContent = String(state.signal);
  if (els.statusSignal) els.statusSignal.textContent = String(state.signal);
  startHomeTimeline();
  tickFeed();
  window.setInterval(tickFeed, 1000);
}

init();
