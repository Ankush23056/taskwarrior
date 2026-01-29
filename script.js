/**
 * TASKWARRIOR - Gamified Task Manager
 * Vanilla JS Logic
 */

console.log("TaskWarrior: Script loading...");

// ==========================================
// 0. QUOTE GENERATOR
// ==========================================
const QuoteGenerator = {
  quotes: [
    {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
    },
    {
      text: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
    },
    {
      text: "Success is not final, failure is not fatal.",
      author: "Winston Churchill",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "Excellence is not a destination; it is a continuous journey.",
      author: "Brian Tracy",
    },
    {
      text: "Do something today that your future self will thank you for.",
      author: "Sean Patrick Flanery",
    },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    {
      text: "Push yourself, because no one else is going to do it for you.",
      author: "Unknown",
    },
    {
      text: "Sometimes we're tested not to show our weaknesses but to discover our strengths.",
      author: "Unknown",
    },
    {
      text: "The harder you work for something, the greater you'll feel when you achieve it.",
      author: "Unknown",
    },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    {
      text: "Don't stop when you're tired. Stop when you're done.",
      author: "Unknown",
    },
    { text: "Great things never came from comfort zones.", author: "Unknown" },
    {
      text: "Success is the sum of small efforts repeated day in and day out.",
      author: "Robert Collier",
    },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Nothing is impossible to a willing heart.", author: "Unknown" },
  ],

  fetchQuote: async () => {
    // Use local quotes (reliable, no API issues)
    const randomIndex = Math.floor(
      Math.random() * QuoteGenerator.quotes.length,
    );
    return QuoteGenerator.quotes[randomIndex];
  },

  displayQuote: async () => {
    const quoteEl = document.getElementById("motivational-quote");
    if (!quoteEl) return;

    quoteEl.style.opacity = "0.5";
    quoteEl.style.transition = "opacity 0.3s ease";

    const quote = await QuoteGenerator.fetchQuote();

    setTimeout(() => {
      quoteEl.innerHTML = `"${quote.text}" - ${quote.author}`;
      quoteEl.style.opacity = "1";
    }, 300);
  },
};

// ==========================================
// 1. CONFIG & UTILS
// ==========================================
const CONFIG = {
  XP: {
    EASY: 10,
    MEDIUM: 20,
    HARD: 40,
    LEVEL_CAP: 100,
    DAILY_BONUS: 5,
    STREAK_PENALTY: 10,
    GOAL_BONUS_PCT: 0.25,
    GOAL_LATE_PENALTY_PCT: 0.3,
    MISSED_EASY: 5,
    MISSED_MED: 10,
    MISSED_HARD: 20,
  },
};

const Utils = {
  generateId: () => "_" + Math.random().toString(36).substr(2, 9),

  getToday: () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  },

  formatDate: (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }).format(date);
      }
      return dateStr;
    } catch (e) {
      console.error("Date formatting error", e);
      return dateStr;
    }
  },

  daysDiff: (d1, d2) => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },
};

// ==========================================
// 2. DATA MODULE
// ==========================================
const Data = {
  USER_KEY: "taskwarrior_user",
  DATA_KEY: "taskwarrior_data",

  initUser: () => {
    try {
      const existingUser = localStorage.getItem(Data.USER_KEY);
      if (!existingUser) {
        const newUser = {
          name: "Adventurer",
          xp: 0,
          level: 1,
          streak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
          questsCompleted: 0,
          xpToday: 0,
          lastLoginDate: Utils.getToday(),
        };
        localStorage.setItem(Data.USER_KEY, JSON.stringify(newUser));
        localStorage.setItem(Data.DATA_KEY, JSON.stringify([]));
      }
    } catch (e) {
      console.error("LocalStorage error:", e);
    }
  },

  getUser: () => {
    Data.initUser();
    try {
      return JSON.parse(localStorage.getItem(Data.USER_KEY));
    } catch (e) {
      return { name: "Error", xp: 0, level: 1, streak: 0 };
    }
  },

  updateUser: (newData) => {
    try {
      const user = Data.getUser();
      const updated = { ...user, ...newData };
      localStorage.setItem(Data.USER_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Update User Error", e);
    }
  },

  checkNewDay: () => {
    const user = Data.getUser();
    const today = Utils.getToday();
    if (user && user.lastLoginDate !== today) {
      Data.updateUser({
        xpToday: 0,
        lastLoginDate: today,
      });
    }
  },
};

// ==========================================
// 3. GAMIFICATION ENGINE
// ==========================================
const GameEngine = {
  calculateXP: (task, completionDateStr) => {
    let xp = CONFIG.XP[task.difficulty.toUpperCase()];
    let isBonus = false;
    let isPenalty = false;

    if (task.isGoal && task.dueDate) {
      if (completionDateStr < task.dueDate) {
        xp += Math.round(xp * CONFIG.XP.GOAL_BONUS_PCT);
        isBonus = true;
      } else if (completionDateStr > task.dueDate) {
        const penalty = Math.round(xp * CONFIG.XP.GOAL_LATE_PENALTY_PCT);
        xp -= penalty;
        isPenalty = true;
      }
    }

    return { val: Math.max(0, xp), isBonus, isPenalty };
  },

  addXP: (amount) => {
    const user = Data.getUser();
    let currentXP = user.xp + amount;
    if (currentXP < 0) currentXP = 0;

    let dailyXp = (user.xpToday || 0) + amount;
    const newLevel = Math.floor(currentXP / CONFIG.XP.LEVEL_CAP) + 1;
    const leveledUp = newLevel > user.level;

    Data.updateUser({
      xp: currentXP,
      level: newLevel,
      xpToday: dailyXp,
    });

    UI.updateHeroStats();
    UI.showFloatingXP(amount);
    if (leveledUp)
      UI.showToast(`Level Up! You are now Level ${newLevel}!`, "success");
  },

  checkDailyConsistency: () => {
    const user = Data.getUser();
    const today = Utils.getToday();

    if (user.lastCompletedDate === today) {
      Data.updateUser({ questsCompleted: (user.questsCompleted || 0) + 1 });
      return;
    }

    let newStreak = user.streak;
    let earnedDailyBonus = false;

    if (user.lastCompletedDate) {
      const diff = Utils.daysDiff(user.lastCompletedDate, today);
      if (diff === 1) {
        newStreak++;
        earnedDailyBonus = true;
      } else {
        newStreak = 1;
        earnedDailyBonus = true;
      }
    } else {
      newStreak = 1;
      earnedDailyBonus = true;
    }

    Data.updateUser({
      streak: newStreak,
      bestStreak: Math.max(newStreak, user.bestStreak),
      lastCompletedDate: today,
      questsCompleted: (user.questsCompleted || 0) + 1,
    });

    if (earnedDailyBonus && newStreak > 1) {
      GameEngine.addXP(CONFIG.XP.DAILY_BONUS);
      UI.showToast("Daily Streak Bonus: +5 XP!", "success");
    } else if (earnedDailyBonus && newStreak === 1) {
      UI.showToast("Streak Started!", "success");
    }
  },

  runPassiveChecks: () => {
    const user = Data.getUser();
    const today = Utils.getToday();
    const tasks = TaskManager.getTasks();
    let xpChange = 0;
    let toastMsg = "";

    if (user.lastCompletedDate) {
      const diff = Utils.daysDiff(user.lastCompletedDate, today);
      if (diff > 1 && user.streak > 0) {
        xpChange -= CONFIG.XP.STREAK_PENALTY;
        Data.updateUser({ streak: 0 });
        toastMsg += "Streak Lost! -10 XP. ";
      }
    }

    const updatedTasks = tasks.map((t) => {
      if (t.isGoal && !t.completed && t.dueDate && !t.penalized) {
        if (today > t.dueDate) {
          const penalty = CONFIG.XP[`MISSED_${t.difficulty.toUpperCase()}`];
          xpChange -= penalty;
          toastMsg += `Missed Quest "${t.title}": -${penalty} XP. `;
          return { ...t, penalized: true };
        }
      }
      return t;
    });

    if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
      TaskManager.saveTasks(updatedTasks);
    }

    if (xpChange !== 0) {
      GameEngine.addXP(xpChange);
      UI.showToast(toastMsg, "error");
    }
  },
};

// ==========================================
// 4. TASK MANAGEMENT
// ==========================================
const TaskManager = {
  getTasks: () => {
    try {
      return JSON.parse(localStorage.getItem(Data.DATA_KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  saveTasks: (tasks) => {
    try {
      localStorage.setItem(Data.DATA_KEY, JSON.stringify(tasks));
      UI.renderTasks();
      UI.updateHeroStats();
    } catch (e) {
      console.error("Save tasks error", e);
    }
  },

  add: (task) => {
    const tasks = TaskManager.getTasks();
    tasks.push(task);
    TaskManager.saveTasks(tasks);
  },

  delete: (id) => {
    let tasks = TaskManager.getTasks();
    tasks = tasks.filter((t) => t.id !== id);
    TaskManager.saveTasks(tasks);
  },

  complete: (id) => {
    const tasks = TaskManager.getTasks();
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      const today = Utils.getToday();
      const xpResult = GameEngine.calculateXP(task, today);

      task.completed = true;
      task.completedDate = today;

      TaskManager.saveTasks(tasks);
      GameEngine.addXP(xpResult.val);
      GameEngine.checkDailyConsistency();
      UI.animateCompletion(id);
    }
  },
};

// ==========================================
// 5. UI CONTROLLER
// ==========================================
const UI = {
  updateHeroStats: () => {
    const user = Data.getUser();
    if (!user) return;

    const tasks = TaskManager.getTasks();
    const activeCount = tasks.filter((t) => !t.completed).length;

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText("hero-level", user.level);
    setText("hero-level-text", user.level);
    setText("hero-name", user.name);
    setText("hero-total-xp", user.xp);
    setText("hero-streak", user.streak);
    setText("hero-today-xp", `+${user.xpToday || 0}`);

    const xpInLevel = user.xp % CONFIG.XP.LEVEL_CAP;
    const widthPct = (xpInLevel / CONFIG.XP.LEVEL_CAP) * 100;
    const xpNeeded = CONFIG.XP.LEVEL_CAP - xpInLevel;

    const xpBar = document.getElementById("hero-xp-bar");
    if (xpBar) xpBar.style.width = `${widthPct}%`;

    setText("xp-to-next", xpNeeded);

    // Stats Grid
    setText("stat-quests-done", user.questsCompleted || 0);
    setText("stat-total-xp", user.xp);
    setText("stat-best-streak", user.bestStreak);
    setText("active-count", activeCount);
  },

  renderTasks: () => {
    const listEl = document.getElementById("task-list");
    const tasks = TaskManager.getTasks();
    const emptyState = document.getElementById("empty-state");

    if (!listEl) return;

    listEl.innerHTML = "";
    const activeTasks = tasks.filter((t) => !t.completed);

    if (activeTasks.length === 0) {
      if (emptyState) emptyState.classList.remove("hidden");
    } else {
      if (emptyState) emptyState.classList.add("hidden");
    }

    activeTasks.forEach((task) => {
      const el = document.createElement("div");
      el.className = "task-card";
      el.id = `task-${task.id}`;

      const goalIcon = task.isGoal
        ? `<i class="fas fa-star goal-star" title="Story Quest"></i>`
        : "";
      const dateDisplay = task.dueDate
        ? `<span><i class="far fa-clock"></i> ${Utils.formatDate(task.dueDate)}</span>`
        : "";

      el.innerHTML = `
                <div class="task-left">
                    <button class="check-btn" onclick="TaskManager.complete('${task.id}')" aria-label="Complete">
                        <i class="fas fa-check"></i>
                    </button>
                    <div class="task-info">
                        <h4>${task.title}</h4>
                        <div class="task-meta">
                            ${goalIcon}
                            ${dateDisplay}
                        </div>
                    </div>
                </div>

                <div class="task-right">
                    <span class="diff-badge diff-${task.difficulty}">${task.difficulty}</span>
                    <button class="del-btn" onclick="TaskManager.delete('${task.id}')" aria-label="Delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
      listEl.appendChild(el);
    });
  },

  showFloatingXP: (amount) => {
    const el = document.createElement("div");
    const symbol = amount >= 0 ? "+" : "";
    const className = amount >= 0 ? "float-plus" : "float-minus";

    el.className = `float-xp ${className}`;
    el.innerText = `${symbol}${amount} XP`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  },

  showToast: (msg, type = "success") => {
    const toast = document.createElement("div");
    const typeClass = type === "success" ? "t-success" : "t-error";

    toast.className = `toast ${typeClass}`;
    toast.innerHTML = `<i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"}"></i> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  },

  animateCompletion: (id) => {
    const card = document.getElementById(`task-${id}`);
    if (card) {
      card.classList.add("completed-anim");
    }
  },

  changeName: () => {
    const user = Data.getUser();
    if (!user) return;
    const currentName = user.name;
    const newName = prompt("Enter your new Adventurer name:", currentName);
    if (newName && newName.trim() !== "") {
      Data.updateUser({ name: newName.trim() });
      UI.updateHeroStats();
      UI.showToast("Identity Updated!", "success");
    }
  },
};

// ==========================================
// 6. APP INITIALIZATION
// ==========================================
const App = {
  init: () => {
    window.TaskManager = TaskManager;
    window.UI = UI;

    Data.checkNewDay();
    Data.initUser();
    GameEngine.runPassiveChecks();

    UI.updateHeroStats();
    UI.renderTasks();
    QuoteGenerator.displayQuote();
    App.setupListeners();
  },

  setupListeners: () => {
    const modal = document.getElementById("task-modal");
    const quickAddBtn = document.getElementById("quick-add-btn");
    const quickAddInput = document.getElementById("quick-add-input");
    const closeModalBtn = document.getElementById("close-modal");
    const cancelBtn = document.getElementById("cancel-btn");
    const taskForm = document.getElementById("task-form");
    const editNameBtn = document.getElementById("edit-name-btn");

    const openModal = (initialTitle = "") => {
      if (modal) modal.classList.remove("hidden");
      const titleInput = document.getElementById("task-title");
      if (titleInput) {
        titleInput.value = initialTitle;
        setTimeout(() => titleInput.focus(), 50);
      }
    };

    const closeModal = () => {
      if (modal) modal.classList.add("hidden");
    };

    if (editNameBtn) editNameBtn.onclick = UI.changeName;

    if (quickAddBtn) {
      quickAddBtn.onclick = () => {
        if (quickAddInput) {
          openModal(quickAddInput.value);
          quickAddInput.value = "";
        }
      };
    }

    if (quickAddInput) {
      quickAddInput.onkeydown = (e) => {
        if (e.key === "Enter") {
          openModal(quickAddInput.value);
          quickAddInput.value = "";
        }
      };
    }

    if (closeModalBtn) closeModalBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;

    if (taskForm) {
      taskForm.onsubmit = (e) => {
        e.preventDefault();
        const titleInput = document.getElementById("task-title");
        const diffInput = document.getElementById("task-difficulty");
        const dueInput = document.getElementById("task-due");
        const goalInput = document.getElementById("task-goal");

        const newTask = {
          id: Utils.generateId(),
          title: titleInput ? titleInput.value : "New Quest",
          difficulty: diffInput ? diffInput.value : "easy",
          dueDate: dueInput && dueInput.value ? dueInput.value : null,
          isGoal: goalInput ? goalInput.checked : false,
          completed: false,
          completedDate: null,
          createdAt: new Date().toISOString(),
        };

        TaskManager.add(newTask);
        closeModal();
        UI.showToast("Quest Accepted");
      };
    }
  },
};

document.addEventListener("DOMContentLoaded", App.init);
