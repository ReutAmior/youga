// Youga app logic.
// Flow: Welcome (choose) → Builder (review and trim) → Play (one pose at a time).
// Content comes from data/content.json, which is exported from Airtable.
// See docs/architecture.md for the full picture.

// ---------- Settings ----------

// A practice can't be trimmed below this many poses.
const MIN_POSES = 3;
// How long the Undo option stays visible after removing a pose.
const UNDO_SECONDS = 6;
// How long the "can't remove" message stays under a pose.
const MESSAGE_SECONDS = 4;
// Shown under a pose from a part of the practice that can't be edited.
const PROTECTED_MESSAGE = "This pose is important to your practice, so it can't be deleted.";
// Shown under a pose when the practice is already at the minimum.
const MIN_MESSAGE = `Keep at least ${MIN_POSES} poses so your practice still flows.`;
// Shown in the picture slot until a pose has its own picture.
const PLACEHOLDER_IMAGE = "images/pose-placeholder.svg";
const PLACEHOLDER_TEXT = "Pose picture is coming soon";

// ---------- State ----------

let content = null;          // { sequences, poses } from data/content.json
let practice = null;         // { sequence, removed: Set of "section:step" keys }
let lastRemoved = null;      // key of the most recently removed step, for Undo
let undoTimer = null;
let messageTimer = null;
let playSteps = [];          // the steps left after removals, flattened for Play
let playIndex = 0;

const $ = (id) => document.getElementById(id);
const screens = ["welcome", "builder", "no-match", "play"];

// ---------- Loading ----------

fetch("data/content.json")
  .then((res) => {
    if (!res.ok) throw new Error(res.status);
    return res.json();
  })
  .then((data) => { content = data; })
  .catch(() => { $("load-error").hidden = false; });

// ---------- Helpers ----------

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

// Shows one screen and the bottom bar and footer that belong to it.
function showScreen(name) {
  screens.forEach((s) => { $(s).hidden = s !== name; });
  $("builder-bar").hidden = name !== "builder";
  $("play-bar").hidden = name !== "play";
  $("footer").hidden = name === "play";
  if (name !== "builder") hideUndo();
  window.scrollTo(0, 0);
}

// Picks a vetted sequence: exact match first, then the same level and goal
// at the closest length. Returns null when nothing fits yet.
function findSequence(level, minutes, goal) {
  const sameKind = content.sequences.filter((s) => s.level === level && s.goal === goal);
  if (!sameKind.length) return null;
  const exact = sameKind.find((s) => s.minutes === minutes);
  if (exact) return { sequence: exact, exact: true };
  const closest = sameKind.reduce((a, b) =>
    Math.abs(a.minutes - minutes) <= Math.abs(b.minutes - minutes) ? a : b);
  return { sequence: closest, exact: false };
}

// "Inhale", "Exhale · 5 breaths", or "5 breaths".
function breathBadge(step, large) {
  const hold = step.hold || 1;
  const kind = step.breath ? step.breath.toLowerCase() : "count";
  let label;
  if (step.breath) label = hold > 1 ? `${step.breath} · ${hold} breaths` : step.breath;
  else label = `${hold} ${hold === 1 ? "breath" : "breaths"}`;
  return el("span", `breath breath-${kind}${large ? " breath-lg" : ""}`, label);
}

// The pose picture, or a calm placeholder until a picture exists.
// A missing picture never blocks a pose from showing.
function poseArt(pose) {
  const wrap = el("div", "pose-art");
  if (pose.image) {
    const img = el("img");
    img.src = pose.image;
    img.alt = pose.name;
    img.loading = "lazy";
    wrap.appendChild(img);
  } else {
    const placeholder = el("div", "pose-placeholder");
    const art = el("img");
    art.src = PLACEHOLDER_IMAGE;
    art.alt = "";
    placeholder.appendChild(art);
    placeholder.appendChild(el("span", null, PLACEHOLDER_TEXT));
    wrap.appendChild(placeholder);
  }
  return wrap;
}

const stepKey = (sectionIndex, stepIndex) => `${sectionIndex}:${stepIndex}`;

// All steps still in the practice, in order, with their section name.
function remainingSteps() {
  const out = [];
  practice.sequence.sections.forEach((section, si) => {
    section.steps.forEach((step, k) => {
      if (!practice.removed.has(stepKey(si, k))) out.push({ ...step, section: section.name });
    });
  });
  return out;
}

// ---------- Builder ----------

function renderBuilder() {
  const { sequence } = practice;
  const canRemove = remainingSteps().length > MIN_POSES;
  const container = $("sections");
  container.innerHTML = "";

  sequence.sections.forEach((section, si) => {
    const visible = section.steps
      .map((step, k) => ({ step, k }))
      .filter(({ k }) => !practice.removed.has(stepKey(si, k)));

    const head = el("div", "section-head");
    head.appendChild(el("h3", null, section.name));
    if (visible.length) head.appendChild(el("span", "section-count", `${visible.length} ${visible.length === 1 ? "pose" : "poses"}`));
    container.appendChild(head);

    if (!section.steps.length) {
      container.appendChild(el("div", "empty", "No poses yet"));
      return;
    }
    if (!visible.length) {
      container.appendChild(el("div", "empty", "You removed all poses from this part"));
      return;
    }

    const grid = el("div", "pose-grid");
    visible.forEach(({ step, k }) => {
      const pose = content.poses[step.pose];
      const card = el("div", "card pose-card");
      const body = el("div", "pose-card-body");
      // Every pose gets an "×". On a protected pose, or at the minimum, it is
      // greyed out (aria-disabled, so the tap still lands) and explains why
      // right under the pose instead of removing it.
      const allowed = section.editable && canRemove;
      const remove = el("button", "btn-icon", "×");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remove ${pose.name}`);
      remove.setAttribute("aria-disabled", String(!allowed));
      if (allowed) remove.title = "Remove this pose";
      remove.addEventListener("click", () => {
        if (!section.editable) showPoseMessage(body, PROTECTED_MESSAGE);
        else if (!canRemove) showPoseMessage(body, MIN_MESSAGE);
        else removePose(si, k);
      });
      card.appendChild(remove);
      card.appendChild(poseArt(pose));
      body.appendChild(el("div", "pose-card-name", pose.name));
      if (pose.sanskrit) body.appendChild(el("p", "sanskrit", pose.sanskrit));
      body.appendChild(breathBadge(step, false));
      card.appendChild(body);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  });
}

// Explains, right under the pose that was tapped, why it can't be removed.
// Only one message shows at a time.
function showPoseMessage(body, text) {
  hidePoseMessage();
  const message = el("p", "pose-message", text);
  message.setAttribute("role", "status");
  body.appendChild(message);
  message.scrollIntoView({ block: "nearest", behavior: "smooth" });
  messageTimer = setTimeout(hidePoseMessage, MESSAGE_SECONDS * 1000);
}

function hidePoseMessage() {
  clearTimeout(messageTimer);
  document.querySelectorAll(".pose-message").forEach((node) => node.remove());
}

function removePose(sectionIndex, stepIndex) {
  if (remainingSteps().length <= MIN_POSES) return;
  const key = stepKey(sectionIndex, stepIndex);
  practice.removed.add(key);
  lastRemoved = key;
  const step = practice.sequence.sections[sectionIndex].steps[stepIndex];
  renderBuilder();
  showUndo(content.poses[step.pose].name);
}

function showUndo(poseName) {
  $("undo-text").textContent = `Removed ${poseName}`;
  $("undo").hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, UNDO_SECONDS * 1000);
}

function hideUndo() {
  clearTimeout(undoTimer);
  $("undo").hidden = true;
  lastRemoved = null;
}

$("undo-button").addEventListener("click", () => {
  if (!lastRemoved) return;
  practice.removed.delete(lastRemoved);
  hideUndo();
  renderBuilder();
});

function showBuilder(match, minutesAsked) {
  const { sequence } = match;
  practice = { sequence, removed: new Set() };
  $("sequence-name").textContent = sequence.name;
  const meta = $("sequence-meta");
  meta.innerHTML = "";
  meta.appendChild(el("span", "chip", `${sequence.minutes} min`));
  meta.appendChild(el("span", "chip chip-sage", sequence.level));
  meta.appendChild(el("span", "chip", sequence.goal));
  $("match-note").hidden = match.exact;
  if (!match.exact) {
    $("match-note").textContent = `We don't have a ${minutesAsked}-minute version yet, so here is the ${sequence.minutes}-minute one.`;
  }
  renderBuilder();
  showScreen("builder");
}

// ---------- Play ----------

function startPlay() {
  playSteps = remainingSteps();
  playIndex = 0;
  $("play-card").hidden = false;
  $("play-done").hidden = true;
  showScreen("play");
  renderPlay();
}

function setCue(node, text) {
  node.textContent = text || "Cue coming soon";
  node.classList.toggle("cue-missing", !text);
}

function renderPlay() {
  const step = playSteps[playIndex];
  const pose = content.poses[step.pose];
  const image = $("play-image");
  image.innerHTML = "";
  image.appendChild(poseArt(pose).firstChild);
  $("play-name").textContent = pose.name;
  $("play-sanskrit").textContent = pose.sanskrit || "";
  $("play-sanskrit").hidden = !pose.sanskrit;
  const breath = $("play-breath");
  breath.innerHTML = "";
  breath.appendChild(breathBadge(step, true));
  setCue($("play-in"), pose.cueIn);
  setCue($("play-out"), pose.cueOut);
  $("play-next").hidden = !step.transition;
  $("play-next-text").textContent = step.transition || "";
  $("play-section").textContent = step.section;
  $("play-counter").textContent = `${playIndex + 1} of ${playSteps.length}`;
  $("progress-fill").style.width = `${((playIndex + 1) / playSteps.length) * 100}%`;
  $("prev").disabled = playIndex === 0;
  $("next").textContent = playIndex === playSteps.length - 1 ? "Finish" : "Next pose";
  window.scrollTo(0, 0);
}

function finishPlay() {
  $("play-card").hidden = true;
  $("play-done").hidden = false;
  $("play-bar").hidden = true;
  $("progress-fill").style.width = "100%";
}

$("next").addEventListener("click", () => {
  if (playIndex < playSteps.length - 1) { playIndex += 1; renderPlay(); }
  else finishPlay();
});
$("prev").addEventListener("click", () => {
  if (playIndex > 0) { playIndex -= 1; renderPlay(); }
});
$("exit").addEventListener("click", () => showScreen("builder"));
$("lets-go").addEventListener("click", startPlay);

document.addEventListener("keydown", (event) => {
  if ($("play").hidden || !$("play-done").hidden) return;
  if (event.key === "ArrowRight") $("next").click();
  if (event.key === "ArrowLeft") $("prev").click();
});

// ---------- Welcome ----------

$("practice-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!content) { $("load-error").hidden = false; return; }
  const form = event.target;
  const level = form.level.value;
  const minutes = Number(form.minutes.value);
  const goal = form.goal.value;
  const match = findSequence(level, minutes, goal);
  if (match) { showBuilder(match, minutes); return; }

  const available = content.sequences.map((s) => `${s.level} · ${s.minutes} min · ${s.goal}`);
  $("no-match-text").textContent =
    `We're still creating a ${level.toLowerCase()} practice for "${goal}". ` +
    `Available now: ${available.join("; ")}.`;
  showScreen("no-match");
});

// Every "Change sequence" button goes back to the choices.
document.querySelectorAll('[data-action="change"]').forEach((button) =>
  button.addEventListener("click", () => showScreen("welcome")));
