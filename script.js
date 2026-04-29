const root = document.documentElement;
const body = document.body;
const topNav = document.getElementById("topNav");
const leftNav = document.getElementById("leftNav");
const leftNavToggle = document.getElementById("leftNavToggle");
const sentinelBtn = document.getElementById("sentinelBtn");
const authorizeBtn = document.getElementById("authorizeBtn");
const miniPopup = document.getElementById("miniPopup");
const globalLoading = document.getElementById("globalLoading");
const idleOverlay = document.getElementById("idleOverlay");
const sentinelModal = document.getElementById("sentinelModal");
const sentinelKicker = document.getElementById("sentinelKicker");
const sentinelTitle = document.getElementById("sentinelTitle");
const sentinelPrompt = document.getElementById("sentinelPrompt");
const sentinelInput = document.getElementById("sentinelInput");
const sentinelInputLabel = document.getElementById("sentinelInputLabel");
const sentinelSubmit = document.getElementById("sentinelSubmit");
const sentinelLog = document.getElementById("sentinelLog");
const footerTickerText = document.getElementById("footerTickerText");
const uplinkTerminatedPage = document.getElementById("uplinkTerminatedPage");
const loggedInPage = document.getElementById("loggedInPage");
const archive = document.getElementById("ladecaArchive");
const bgVideo = document.getElementById("bgVideo");

const audio = {
  failure: document.getElementById("audioFailure"),
  popupClose: document.getElementById("audioPopupClose"),
  popupClose2: document.getElementById("audioPopupClose2"),
  voice1: document.getElementById("audioVoice1"),
  voice2: document.getElementById("audioVoice2"),
  hum: document.getElementById("audioHum"),
  initializing: document.getElementById("audioInitializing"),
  shipHum: document.getElementById("audioShipHum"),
  failed: document.getElementById("audioFailed"),
  unauthorized: document.getElementById("audioUnauthorized")
};

const tickerMessages = [
  "LADECA_HOME: video signal anchored to PLACEHOLDER.mp4 // public layer stable",
  "PROJECT: LADECA // largest Archive in the world // mission clock listening",
  "CTC NEWS: recent branch drift held below public warning threshold",
  "FORUMS: commune with Research and Art // talk News // plan meetups",
  "SENTINEL:OU:STILLPOINT // authorization available from top-right terminal",
  "ARCHIVE ADVISORY: unauthorized nodes are monitored and self-closing"
];

const sentinel = {
  step: "idle",
  codename: "",
  ouId: "",
  stillpoint: ""
};

let miniPopupCoolingDown = false;
let tickerIndex = 0;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function playAudio(name, options = {}) {
  const element = audio[name];
  if (!element) return;
  try {
    if (options.restart !== false) element.currentTime = 0;
    const playAttempt = element.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
  } catch (_) {
    /* Missing files or autoplay restrictions should not break the prototype. */
  }
}

function stopAudio(name) {
  const element = audio[name];
  if (!element) return;
  try {
    element.pause();
    element.currentTime = 0;
  } catch (_) {
    /* no-op */
  }
}

function setPointerVars(event) {
  root.style.setProperty("--mx", `${event.clientX}px`);
  root.style.setProperty("--my", `${event.clientY}px`);
}

function runInitialCinematicEntry() {
  topNav.classList.add("force-open");
  leftNav.classList.add("force-open");
  const videoSection = document.querySelector(".video-section");
  videoSection?.classList.add("cinematic-enter");

  window.setTimeout(() => {
    topNav.classList.remove("force-open");
    leftNav.classList.remove("force-open");
    topNav.classList.add("collapsed");
    leftNav.classList.add("collapsed");
    body.classList.remove("intro-active");
  }, 2000);
}

function updateTicker() {
  if (!footerTickerText) return;
  footerTickerText.textContent = tickerMessages[tickerIndex];
  tickerIndex = (tickerIndex + 1) % tickerMessages.length;
}

function showMiniPopupNear(button) {
  if (miniPopupCoolingDown || !miniPopup || !button) return;
  miniPopupCoolingDown = true;
  playAudio("failure");

  const rect = button.getBoundingClientRect();
  const width = Math.min(rect.width, 150);
  miniPopup.style.width = `${width}px`;
  miniPopup.style.left = `${Math.max(8, rect.right + 8)}px`;
  miniPopup.style.top = `${Math.max(8, rect.top + rect.height / 2 - 17)}px`;
  miniPopup.classList.remove("closing");
  miniPopup.classList.add("show");

  window.setTimeout(() => {
    playAudio("popupClose");
    miniPopup.classList.add("closing");
  }, 850);

  window.setTimeout(() => {
    miniPopup.classList.remove("show", "closing");
  }, 1180);

  window.setTimeout(() => {
    miniPopupCoolingDown = false;
  }, 1450);
}

function scrollToPanel(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function closeSentinelModal(soundName = "popupClose") {
  playAudio(soundName);
  sentinelModal.classList.add("closing");
  await wait(270);
  sentinelModal.classList.add("hidden");
  sentinelModal.classList.remove("closing");
}

function openSentinelModal(config) {
  sentinelKicker.textContent = config.kicker;
  sentinelTitle.textContent = config.title;
  sentinelPrompt.textContent = config.prompt;
  sentinelInputLabel.textContent = config.label;
  sentinelInput.value = "";
  sentinelInput.placeholder = config.placeholder || "";
  sentinelLog.innerHTML = "";
  sentinelInput.disabled = Boolean(config.inputDisabled);
  sentinelSubmit.disabled = Boolean(config.inputDisabled);
  sentinelModal.classList.remove("hidden");
  sentinelInput.focus();
}

function addLogLine(text, className = "") {
  const line = document.createElement("div");
  line.className = `sentinel-log-line ${className}`.trim();
  line.textContent = text;
  sentinelLog.appendChild(line);
  sentinelLog.scrollTop = sentinelLog.scrollHeight;
  return line;
}

async function addHomingStep(label) {
  const row = document.createElement("div");
  row.className = "homing-row";
  row.innerHTML = `
    <span>${label}</span>
    <span class="homing-bar"><i class="homing-bar-inner"></i></span>
    <span>100%</span>
  `;
  sentinelLog.appendChild(row);
  sentinelLog.scrollTop = sentinelLog.scrollHeight;
  await wait(1000);
}

async function showGlobalLoading(message = "Establishing Uplink . . .", duration = 900) {
  const loadingText = globalLoading.querySelector(".loading-text");
  if (loadingText) loadingText.textContent = message;
  globalLoading.classList.remove("hidden");
  await wait(duration);
  globalLoading.classList.add("hidden");
}

async function showIdleThinking(duration = 4000) {
  idleOverlay.classList.remove("hidden");
  playAudio("hum", { restart: true });
  await wait(duration);
  stopAudio("hum");
  idleOverlay.classList.add("hidden");
}

async function beginSentinelSequence() {
  sentinel.step = "codename";
  sentinel.codename = "";
  sentinel.ouId = "";
  sentinel.stillpoint = "";
  await showGlobalLoading("SENTINEL TERMINAL WAKING . . .", 900);
  openSentinelModal({
    kicker: "NONCLOSING_POP-UP",
    title: "SENTINEL",
    prompt: "Please enter your SENTINEL CODENAME.",
    label: "Please enter your Sentinel codename",
    placeholder: "SENTINEL CODENAME"
  });
  playAudio("voice1");
}

async function handleCodenameSubmit(value) {
  sentinel.codename = value;
  await closeSentinelModal("popupClose");
  sentinel.step = "ou";
  openSentinelModal({
    kicker: "NONCLOSING_POP-UP2",
    title: "OU ID",
    prompt: "Please enter your OU ID.",
    label: "Please enter your OU ID",
    placeholder: "OU ID"
  });
  playAudio("popupClose2");
  playAudio("voice2");
}

async function handleOuSubmit(value) {
  sentinel.ouId = value.trim();
  sentinelInput.disabled = true;
  sentinelSubmit.disabled = true;
  sentinelLog.innerHTML = "";
  addLogLine("OU ID received. LADECA Systems thinking . . .");
  await showIdleThinking(4000);

  if (sentinel.ouId.toUpperCase() !== "LPHISIX") {
    addLogLine("UNAUTHORIZED", "denied");
    playAudio("failure");
    sentinelInput.disabled = false;
    sentinelSubmit.disabled = false;
    return;
  }

  await runRegisteredSequence();
}

async function runRegisteredSequence() {
  addLogLine("LPHISIX is registered in LADECA Systems . . . Lphi.S11.Mg.Oa.W03.E", "complete");
  await addHomingStep("Homing");
  await addHomingStep("Laniakea");
  await addHomingStep("Sparta 11");
  await addHomingStep("Milky Way Galaxy");
  await addHomingStep("Orion Trajectory");
  await addHomingStep("Cygnus Trajector");
  await addHomingStep("Willow Group #3");
  await addHomingStep("Earth");
  addLogLine("COMPLETE.", "complete");
  playAudio("initializing");
  await wait(900);
  await closeSentinelModal("popupClose");
  sentinel.step = "stillpoint";
  openSentinelModal({
    kicker: "NONCLOSING_POP-UP3",
    title: "STILLPOINT COORDINATES",
    prompt: "Please enter your branches STILLPOINT Coordinates. This should be the coordinates of any CTC along your OU's Branch.",
    label: "Please enter your branch Stillpoint coordinates",
    placeholder: "STILLPOINT"
  });
  playAudio("shipHum", { restart: true });
}

async function handleStillpointSubmit(value) {
  sentinel.stillpoint = value.trim();
  sentinelInput.disabled = true;
  sentinelSubmit.disabled = true;

  if (sentinel.stillpoint.toUpperCase() !== "LADECA") {
    addLogLine("STILLPOINT rejected. UPLINK_TERMINATED_page redirecting . . .", "denied");
    playAudio("failed");
    playAudio("unauthorized");
    stopAudio("shipHum");
    await wait(850);
    await closeSentinelModal("popupClose");
    showStatePage("terminated");
    return;
  }

  addLogLine("STILLPOINT accepted. LOGGED_IN_PAGE redirecting . . .", "complete");
  stopAudio("shipHum");
  await wait(850);
  await closeSentinelModal("popupClose");
  showStatePage("logged-in");
}

function showStatePage(state) {
  archive.classList.add("hidden");
  if (state === "terminated") {
    loggedInPage.classList.add("hidden");
    uplinkTerminatedPage.classList.remove("hidden");
    uplinkTerminatedPage.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    uplinkTerminatedPage.classList.add("hidden");
    loggedInPage.classList.remove("hidden");
    loggedInPage.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function returnToArchive() {
  uplinkTerminatedPage.classList.add("hidden");
  loggedInPage.classList.add("hidden");
  archive.classList.remove("hidden");
  archive.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handleSentinelSubmit() {
  const value = sentinelInput.value.trim();
  if (!value) {
    addLogLine("INPUT REQUIRED.", "denied");
    playAudio("failure");
    return;
  }

  if (sentinel.step === "codename") {
    await handleCodenameSubmit(value);
    return;
  }

  if (sentinel.step === "ou") {
    await handleOuSubmit(value);
    return;
  }

  if (sentinel.step === "stillpoint") {
    await handleStillpointSubmit(value);
  }
}

function wireEvents() {
  document.addEventListener("mousemove", setPointerVars);

  if (bgVideo) {
    bgVideo.addEventListener("error", () => {
      bgVideo.classList.add("hidden");
    });
  }

  leftNavToggle.addEventListener("click", () => {
    leftNav.classList.toggle("collapsed");
  });

  document.querySelectorAll(".unauthorized-btn").forEach((button) => {
    button.addEventListener("click", () => showMiniPopupNear(button));
  });

  document.querySelectorAll("[data-target]").forEach((button) => {
    button.addEventListener("click", () => scrollToPanel(button.dataset.target));
  });

  sentinelBtn.addEventListener("click", beginSentinelSequence);
  authorizeBtn.addEventListener("click", beginSentinelSequence);
  sentinelSubmit.addEventListener("click", handleSentinelSubmit);
  sentinelInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSentinelSubmit();
    }
  });

  document.getElementById("returnHomeFailed")?.addEventListener("click", returnToArchive);
  document.getElementById("returnHomeSuccess")?.addEventListener("click", returnToArchive);
}

function init() {
  wireEvents();
  updateTicker();
  window.setInterval(updateTicker, 6000);
  runInitialCinematicEntry();
}

init();
