# TabOut - Website Blocker Chrome Extension

🚫 **TabOut** is a productivity-focused Chrome extension that helps you block distracting websites for a specified duration. With a motivational block screen, password-protected unblocking, and a real-time countdown, it keeps your attention where it matters.


---

## 📌 Features

- 🔒 Temporarily block websites with a custom timer (hours + minutes)
- 🔐 Prevent unblocking with a password and reflection prompt
- ⏳ Real-time countdown for each blocked site
- 🎯 Motivational full-screen block page with custom image
- ⚙️ All data stored in `chrome.storage.local` — no backend, no sync
- 🧠 Built using **React**, **Vite**, and **Tailwind CSS**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tabout.git
cd tabout
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Build the Extension

```bash
npm run build
```

---

### 4. Load into Chrome

- Open `chrome://extensions`
- Enable **Developer mode** (top right)
- Click **Load Unpacked**
- Select the `dist/` folder

---

## 🛡️ Privacy

TabOut stores all settings (blocked sites, password, timers) **locally** on your device using `chrome.storage.local`. No data is ever sent or synced externally.

---

## ✨ Future Improvements

- Using AI to suggest websites that should be blocked.
- Pomodoro Timer
- Google Authentication
- Statistics and time saved dashboard

---
