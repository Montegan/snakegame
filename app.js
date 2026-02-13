import {
  createInitialState,
  setQueuedDirection,
  step,
  togglePause,
  restart,
  DEFAULT_GRID_SIZE,
} from "./snakeLogic.js";

const TICK_MS = 120;
const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const pageTabs = document.querySelector(".page-tabs");
const gamePageEl = document.getElementById("game-page");
const leaderboardPageEl = document.getElementById("leaderboard-page");
const leaderboardListEl = document.getElementById("leaderboard-list");
const leaderboardEmptyEl = document.getElementById("leaderboard-empty");

const LEADERBOARD_KEY = "snake:last10";
const LEADERBOARD_LIMIT = 10;

let state = createInitialState(DEFAULT_GRID_SIZE);
const cells = [];
let leaderboardScores = loadLeaderboardScores();

function createBoard(gridSize) {
  boardEl.style.setProperty("--grid-size", String(gridSize));
  for (let y = 0; y < gridSize; y += 1) {
    const row = [];
    for (let x = 0; x < gridSize; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      boardEl.appendChild(cell);
      row.push(cell);
    }
    cells.push(row);
  }
}

function clearBoardClasses() {
  for (let y = 0; y < cells.length; y += 1) {
    for (let x = 0; x < cells[y].length; x += 1) {
      cells[y][x].className = "cell";
    }
  }
}

function render() {
  clearBoardClasses();

  state.snake.forEach((part, index) => {
    const cell = cells[part.y][part.x];
    cell.classList.add(index === 0 ? "snake-head" : "snake");
  });

  if (state.food) {
    cells[state.food.y][state.food.x].classList.add("food");
  }

  scoreEl.textContent = String(state.score);
  if (state.gameOver) {
    statusEl.textContent = "Game over";
  } else if (state.paused) {
    statusEl.textContent = "Paused";
  } else {
    statusEl.textContent = "Running";
  }
}

function loadLeaderboardScores() {
  try {
    const value = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!value) {
      return [];
    }
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((entry) => ({
        score: Number(entry.score) || 0,
        playedAt: Number(entry.playedAt) || Date.now(),
        playerName:
          typeof entry.playerName === "string" && entry.playerName.trim()
            ? entry.playerName.trim()
            : null,
        avatarHue:
          Number.isFinite(Number(entry.avatarHue)) ? Number(entry.avatarHue) : null,
      }))
      .slice(0, LEADERBOARD_LIMIT);
  } catch {
    return [];
  }
}

function saveLeaderboardScores() {
  window.localStorage.setItem(
    LEADERBOARD_KEY,
    JSON.stringify(leaderboardScores.slice(0, LEADERBOARD_LIMIT)),
  );
}

function addLeaderboardScore(score) {
  const now = Date.now();
  leaderboardScores = [
    {
      score,
      playedAt: now,
      playerName: generatePlayerName(now),
      avatarHue: now % 360,
    },
    ...leaderboardScores,
  ].slice(0, LEADERBOARD_LIMIT);
  saveLeaderboardScores();
  renderLeaderboard();
}

function generatePlayerName(seed) {
  const prefixes = ["Neo", "Swift", "Shadow", "Storm", "Vibe", "Turbo", "Nova"];
  const suffixes = ["Rider", "Fox", "Blaze", "Drift", "Knight", "Scout", "Ace"];
  const first = prefixes[seed % prefixes.length];
  const second = suffixes[Math.floor(seed / 7) % suffixes.length];
  return `${first} ${second}`;
}

function getInitials(name) {
  const words = name.split(" ").filter(Boolean);
  const first = words[0]?.[0] ?? "P";
  const second = words[1]?.[0] ?? "L";
  return `${first}${second}`.toUpperCase();
}

function renderLeaderboard() {
  leaderboardListEl.innerHTML = "";
  const ranked = [...leaderboardScores].sort((a, b) => b.score - a.score);
  leaderboardEmptyEl.hidden = ranked.length > 0;

  ranked.forEach((entry, index) => {
    const playerName = entry.playerName || `Player ${index + 1}`;
    const avatarHue = Number.isFinite(entry.avatarHue)
      ? entry.avatarHue
      : (index * 47) % 360;
    const item = document.createElement("li");
    item.className = "leaderboard-item";

    const player = document.createElement("div");
    player.className = "player";
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.style.setProperty("--avatar-hue", String(avatarHue));
    avatar.textContent = getInitials(playerName);
    const name = document.createElement("span");
    name.className = "player-name";
    name.textContent = playerName;
    if (index === 0) {
      name.textContent = `${playerName} 👑`;
    }
    player.append(avatar, name);

    const score = document.createElement("span");
    score.className = "entry-score";
    score.textContent = `Score ${entry.score}`;

    const played = document.createElement("span");
    played.className = "entry-time";
    played.textContent = new Date(entry.playedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    item.append(player, score, played);
    leaderboardListEl.appendChild(item);
  });
}

function setActivePage(page) {
  const isLeaderboard = page === "leaderboard";
  gamePageEl.classList.toggle("active", !isLeaderboard);
  leaderboardPageEl.classList.toggle("active", isLeaderboard);

  const tabs = pageTabs.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.page === page);
  });
}

function updateDirection(direction) {
  state = setQueuedDirection(state, direction);
}

const keyToDirection = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

window.addEventListener("keydown", (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === " " || key === "Spacebar") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (key === "r") {
    state = restart(state);
    render();
    return;
  }

  const direction = keyToDirection[key];
  if (!direction) {
    return;
  }
  event.preventDefault();
  updateDirection(direction);
});

document.querySelector(".directional").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-dir]");
  if (!button) {
    return;
  }
  updateDirection(button.dataset.dir);
});

pauseBtn.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartBtn.addEventListener("click", () => {
  state = restart(state);
  render();
});

pageTabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-page]");
  if (!button) {
    return;
  }
  setActivePage(button.dataset.page);
});

function loop() {
  const wasGameOver = state.gameOver;
  state = step(state);
  if (!wasGameOver && state.gameOver) {
    addLeaderboardScore(state.score);
  }
  render();
}

createBoard(state.gridSize);
renderLeaderboard();
render();
setInterval(loop, TICK_MS);
