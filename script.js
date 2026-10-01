// Memory Match — retro arcade game
// All data stays in the browser (localStorage). No backend, no build step.

const ICONS = ["👾", "🚀", "⭐", "🎮", "💎", "🔥", "🍀", "🎧"]; // 8 pairs = 16 cards
const STORAGE_KEY = "memoryMatchScores";

const boardEl = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const leaderboardEl = document.getElementById("leaderboard");
const winMsg = document.getElementById("winMsg");
const winDetails = document.getElementById("winDetails");
const playerNameInput = document.getElementById("playerName");

let cards = [];
let flipped = [];
let matchedCount = 0;
let moves = 0;
let seconds = 0;
let timerId = null;
let locked = false;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startTimer() {
  clearInterval(timerId);
  seconds = 0;
  timeEl.textContent = "0s";
  timerId = setInterval(() => {
    seconds++;
    timeEl.textContent = seconds + "s";
  }, 1000);
}

function newGame() {
  clearInterval(timerId);
  moves = 0;
  matchedCount = 0;
  flipped = [];
  locked = false;
  movesEl.textContent = "0";
  timeEl.textContent = "0s";
  winMsg.classList.add("hidden");

  const deck = shuffle([...ICONS, ...ICONS]);
  cards = deck.map((icon, i) => ({ id: i, icon, matched: false }));
  renderBoard();
  startTimer();
}

function renderBoard() {
  boardEl.innerHTML = "";
  cards.forEach((card) => {
    const el = document.createElement("div");
    el.className = "card" + (card.matched ? " matched" : "");
    el.dataset.id = card.id;
    el.innerHTML = `<span class="face">${card.icon}</span>`;
    el.addEventListener("click", () => onCardClick(card, el));
    boardEl.appendChild(el);
  });
}

function onCardClick(card, el) {
  if (locked || card.matched || flipped.some((f) => f.card.id === card.id)) return;

  el.classList.add("flipped");
  flipped.push({ card, el });

  if (flipped.length === 2) {
    moves++;
    movesEl.textContent = moves;
    locked = true;
    const [a, b] = flipped;
    if (a.card.icon === b.card.icon) {
      a.card.matched = true;
      b.card.matched = true;
      a.el.classList.add("matched");
      b.el.classList.add("matched");
      matchedCount += 2;
      flipped = [];
      locked = false;
      if (matchedCount === cards.length) onWin();
    } else {
      setTimeout(() => {
        a.el.classList.remove("flipped");
        b.el.classList.remove("flipped");
        flipped = [];
        locked = false;
      }, 700);
    }
  }
}

function onWin() {
  clearInterval(timerId);
  winDetails.textContent = `${moves} moves — ${seconds}s`;
  winMsg.classList.remove("hidden");
  playerNameInput.value = "";
}

function getScores() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return window.SAMPLE_SCORES ? window.SAMPLE_SCORES.slice() : [];
}

function setScores(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

function renderLeaderboard() {
  const scores = getScores()
    .slice()
    .sort((a, b) => a.moves - b.moves || a.time - b.time)
    .slice(0, 5);
  leaderboardEl.innerHTML = "";
  if (scores.length === 0) {
    leaderboardEl.innerHTML = "<li>No scores yet — play a game!</li>";
    return;
  }
  scores.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.name} — ${s.moves} moves, ${s.time}s`;
    leaderboardEl.appendChild(li);
  });
}

document.getElementById("newGame").addEventListener("click", newGame);

document.getElementById("loadExample").addEventListener("click", () => {
  setScores(window.SAMPLE_SCORES ? window.SAMPLE_SCORES.slice() : []);
  renderLeaderboard();
});

document.getElementById("saveScore").addEventListener("click", () => {
  const name = playerNameInput.value.trim() || "PLAYER";
  const scores = getScores();
  scores.push({ name, moves, time: seconds });
  setScores(scores);
  renderLeaderboard();
  winMsg.classList.add("hidden");
});

renderLeaderboard();
newGame();
