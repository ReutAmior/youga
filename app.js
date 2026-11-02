// Youga app logic: read the choices, pick a sequence from poses.js, show it.

// How many poses each practice length uses (Savasana included).
const POSES_PER_DURATION = { 15: 6, 30: 10, 45: 14 };

// A practice can't be trimmed below this many poses (Savasana included).
const MIN_POSES = 3;

// How long the Undo option stays visible after removing a pose.
const UNDO_SECONDS = 6;

// How long the "can't remove" message stays under a pose.
const MIN_MESSAGE_SECONDS = 4;
const MIN_MESSAGE = `Keep at least ${MIN_POSES} poses so your practice still flows.`;

const form = document.getElementById("practice-form");
const welcome = document.getElementById("welcome");
const results = document.getElementById("results");
const summary = document.getElementById("summary");
const poseList = document.getElementById("pose-list");
const startOver = document.getElementById("start-over");
const undoBar = document.getElementById("undo");
const undoText = document.getElementById("undo-text");
const undoButton = document.getElementById("undo-button");

// The practice currently on screen.
let practice = { poses: [], duration: 0 };
// The most recently removed pose and where it was, for Undo.
let lastRemoved = null;
let undoTimer = null;
let minMessageTimer = null;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// Picks the poses: the first poses of the list, always ending with Savasana.
function buildPractice(level, duration, goal) {
  const sequence = SEQUENCES[goal][level];
  const count = Math.min(POSES_PER_DURATION[duration], sequence.length);
  return sequence.slice(0, count - 1).concat(sequence[sequence.length - 1]);
}

// Splits the total minutes as evenly as whole numbers allow. Leftover minutes
// go one each to the first poses, so the total always matches the duration.
// Example: 30 minutes over 9 poses → 4, 4, 4, 3, 3, 3, 3, 3, 3.
function assignMinutes(poses, duration) {
  const minutesEach = Math.floor(duration / poses.length);
  const leftover = duration - minutesEach * poses.length;
  return poses.map((pose, i) => ({ ...pose, minutes: minutesEach + (i < leftover ? 1 : 0) }));
}

// Shows the pose's picture, or a placeholder with its name until a picture is
// added. To add one, give the pose an `image` path in poses.js.
function poseImage(pose) {
  if (pose.image) {
    const img = document.createElement("img");
    img.src = pose.image;
    img.alt = pose.name;
    img.loading = "lazy";
    return img;
  }
  const placeholder = document.createElement("div");
  placeholder.className = "pose-placeholder";
  placeholder.setAttribute("aria-hidden", "true");
  placeholder.textContent = pose.name;
  return placeholder;
}

function render() {
  const timed = assignMinutes(practice.poses, practice.duration);
  const canRemove = practice.poses.length > MIN_POSES;
  poseList.innerHTML = "";

  timed.forEach((pose, index) => {
    const isClosing = index === timed.length - 1;
    const item = document.createElement("li");
    item.innerHTML = `
      <div class="pose-image"></div>
      <div class="pose-head">
        <span class="pose-name"></span>
        <span class="pose-actions">
          <span class="pose-minutes"></span>
        </span>
      </div>
      <div class="pose-sanskrit"></div>
      <div class="pose-cue"></div>`;
    item.querySelector(".pose-name").textContent = pose.name;
    item.querySelector(".pose-minutes").textContent = `${pose.minutes} min`;
    item.querySelector(".pose-sanskrit").textContent = pose.sanskrit;
    item.querySelector(".pose-cue").textContent = pose.cue;
    item.querySelector(".pose-image").appendChild(poseImage(pose));

    // Savasana closes every practice, so it has no remove button.
    if (!isClosing) {
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-pose";
      remove.textContent = "×";
      // aria-disabled rather than disabled so the tap still lands: at the
      // minimum, removePose() explains why instead of removing.
      remove.setAttribute("aria-disabled", String(!canRemove));
      if (canRemove) remove.title = "Remove this pose";
      remove.setAttribute("aria-label", `Remove ${pose.name}`);
      remove.addEventListener("click", () => removePose(index, item));
      item.querySelector(".pose-actions").appendChild(remove);
    }

    poseList.appendChild(item);
  });
}

function removePose(index, item) {
  if (practice.poses.length <= MIN_POSES) {
    showMinMessage(item);
    return;
  }
  const [pose] = practice.poses.splice(index, 1);
  lastRemoved = { pose, index };
  render();
  showUndo(pose.name);
}

// Explains, right under the pose that was tapped, why it can't be removed.
// Only one message shows at a time.
function showMinMessage(item) {
  hideMinMessage();
  const message = document.createElement("p");
  message.className = "pose-min-message";
  message.setAttribute("role", "status");
  message.textContent = MIN_MESSAGE;
  item.querySelector(".pose-head").after(message);
  message.scrollIntoView({ block: "nearest", behavior: "smooth" });
  minMessageTimer = setTimeout(hideMinMessage, MIN_MESSAGE_SECONDS * 1000);
}

function hideMinMessage() {
  clearTimeout(minMessageTimer);
  poseList.querySelectorAll(".pose-min-message").forEach((el) => el.remove());
}

function showUndo(poseName) {
  undoText.textContent = `Removed ${poseName}`;
  undoBar.hidden = false;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(hideUndo, UNDO_SECONDS * 1000);
}

function hideUndo() {
  clearTimeout(undoTimer);
  undoBar.hidden = true;
  lastRemoved = null;
}

undoButton.addEventListener("click", () => {
  if (!lastRemoved) return;
  practice.poses.splice(lastRemoved.index, 0, lastRemoved.pose);
  hideUndo();
  render();
});

function showResults(level, duration, goal) {
  practice = { poses: buildPractice(level, duration, goal), duration };
  hideUndo();

  summary.textContent = `${duration}-minute ${capitalize(level)} practice for ${capitalize(goal)}`;
  render();

  welcome.hidden = true;
  results.hidden = false;
  window.scrollTo(0, 0);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  showResults(form.level.value, Number(form.duration.value), form.goal.value);
});

startOver.addEventListener("click", () => {
  hideUndo();
  results.hidden = true;
  welcome.hidden = false;
});
