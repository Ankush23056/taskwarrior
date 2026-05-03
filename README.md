🎯 TaskWarrior – Gamified Task Management App

🔗 Live Demo: https://taskwarrior.netlify.app/

💻 Github : https://github.com/Ankush23056/taskwarrior.git

---

TaskWarrior is a frontend web application that applies simple gamification concepts to task management. The goal of this project is to make daily task completion more engaging while improving my understanding of JavaScript logic, state management, and UI interactions.

This project was built as a learning-focused project and is intended for internship applications.

---

✨ Features

- ✅ Task Management
  - Add, edit, delete, and complete tasks
  - Set task difficulty and due dates
  - Tasks are stored using browser localStorage

- 🎮 XP & Level System
  - XP awarded based on task difficulty:
    - Easy → +10 XP
    - Medium → +20 XP
    - Hard → +40 XP
  - Level increases every 100 XP
  - XP progress updates dynamically with animations

- 🔥 Daily Streak System
  - Streak increases when at least one task is completed per day
  - Streak resets if a day is missed
  - Tracks current streak and best streak
  - Bonus and penalty XP handled using JavaScript date logic

- 🎯 Goal (Story Quest) Logic
  - Important tasks can be marked as goal tasks
  - Bonus XP for completing tasks before the due date
  - XP penalty for completing late or missing goals
  - XP calculation handled through a reusable function

- 💬 Motivational Quotes
  - Displays a random motivational quote on each session reload

- 🎨 UI & Interactions
  - Dark-themed interface
  - Built using Tailwind CSS
  - Button hover effects and task completion animations

---

🕹️ How It Works

1. User creates a task with a difficulty level
2. On task completion, XP is calculated based on difficulty and goal status
3. Daily completion updates streaks
4. XP and level update automatically
5. All data persists using localStorage

---

📊 XP Rules

| Action                |      XP |
| --------------------- | ------: |
| Easy Task             |     +10 |
| Medium Task           |     +20 |
| Hard Task             |     +40 |
| Daily Streak Bonus    |      +5 |
| Early Goal Completion | +25% XP |
| Late Goal Completion  | -30% XP |
| Broken Streak         |     -10 |

XP never goes below zero.

---

🛠️ Tech Stack

- HTML
- CSS
- JavaScript
- Browser LocalStorage API

---

🧠 Key Learnings

- JavaScript DOM manipulation and event handling
- Managing application state with localStorage
- Implementing date-based logic (streaks and deadlines)
- Writing modular and reusable JavaScript functions
- Improving UI/UX using Tailwind CSS and animations

---

👤 Author

Ankush Kumar |
Frontend Developer Intern
📍 Mumbai, India  
🌐 [Portfolio](https://dev-ankush.vercel.app/)
