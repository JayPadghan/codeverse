# CodeVerse Editor – AI-Powered Web IDE

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama">
</p>

> CodeVerse Editor is a blazing-fast, AI-integrated web IDE built entirely in the browser using Next.js App Router, WebContainers, Monaco Editor, and local LLMs via Ollama. It offers real-time code execution, an AI-powered chat assistant, and support for multiple tech stacks — all wrapped in a stunning developer-first UI.

---

## Features

*  **OAuth Login with NextAuth** – Supports Google & GitHub login.
*  **Modern UI** – Built with TailwindCSS & ShadCN UI.
*  **Dark/Light Mode** – Seamlessly toggle between themes.
*  **Project Templates** – Choose from React, Next.js, Express, Hono, Vue, or Angular.
*  **Custom File Explorer** – Create, rename, delete, and manage files/folders easily.
*  **Enhanced Monaco Editor** – Syntax highlighting, formatting, keybindings, and AI autocomplete.
*  **AI Suggestions with Ollama** – Local models give you code completion on `Ctrl + Space` or double `Enter`. Accept with `Tab`.
*  **WebContainers Integration** – Instantly run frontend/backend apps right in the browser.
*  **Terminal with xterm.js** – Fully interactive embedded terminal experience.
*  **AI Chat Assistant** – Share files with the AI and get help, refactors, or explanations.

---

##  Tech Stack

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| **Framework** | Next.js 15 (App Router)                     |
| **Styling** | TailwindCSS, ShadCN UI                      |
| **Language** | TypeScript                                  |
| **Auth** | NextAuth (Google + GitHub OAuth)            |
| **Editor** | Monaco Editor                               |
| **AI Suggestion** | Ollama (LLMs running locally )    |
| **Runtime** | WebContainers                               |
| **Terminal** | xterm.js                                    |
| **Database** | MongoDB (via `DATABASE_URL`)                |

---

## 🛠️ Getting Started

### 1. Clone the Repo
```bash
git clone [https://github.com/your-username/codeverse-editor.git](https://github.com/your-username/codeverse-editor.git)
cd codeverse-editor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file using the template:
```bash
cp .env.example .env.local
```
Then, fill in your credentials in the new `.env.local` file:
```env
AUTH_SECRET=your_auth_secret
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_secret
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_secret
DATABASE_URL=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start Local Ollama Model
Make sure **Ollama** is installed, then run:
```bash
ollama run codellama
```
*Or use your preferred model that supports code generation.*

### 5. Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

---

## 🎯 Keyboard Shortcuts

| Command                          | Action                  |
| -------------------------------- | ----------------------- |
| `Ctrl + Space` or `Double Enter` | Trigger AI suggestions  |
| `Tab`                            | Accept AI suggestion    |

---
