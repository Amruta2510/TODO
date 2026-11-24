# Cadence — Modern Todo List & Productivity Dashboard

A responsive, modern task management dashboard built with React, Vite, Tailwind CSS, and automatic `localStorage` persistence.

## Features

- **Full Task CRUD**: Create tasks via the Quick Add bar or detailed modal, edit title/notes/priority/due date, mark complete/pending, and delete with an instant Undo toast.
- **Dashboard Statistics**: Real-time summary cards for Total Tasks, Completed Tasks, Pending Tasks, Today's Tasks, overdue count, and an overall completion progress bar.
- **Sidebar Navigation & Smart Views**: Switch between All Tasks, Today's Tasks, Pending, Completed, and High Priority views.
- **Filtering, Search & Sorting**: Filter by status (`All`, `Active`, `Completed`) and priority (`Low`, `Medium`, `High`), search live across task titles and notes, and sort by due date, priority, newest, or oldest.
- **Automatic Persistence**: Tasks and theme preferences are automatically saved in browser `localStorage` with defensive parsing and JSON export support.
- **Light & Dark Mode**: Accessible dual-theme support respecting system preference on first visit and persisting user selection.
- **Responsive Design**: Collapsible mobile drawer navigation, adaptive grid cards, and keyboard-accessible controls.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **Icons & Motion**: Lucide React, Motion
- **Persistence**: Browser `localStorage`
- **Deployment**: GitHub + Vercel (`vercel.json` included)

---

## Local Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```
   The production-ready static bundle will be output to `dist/`.

4. **Preview the production build locally**:
   ```bash
   npm run preview
   ```

---

## Step-by-Step GitHub Upload Instructions

1. **Create a new repository on GitHub**:
   - Sign in to [GitHub](https://github.com) and click **New repository**.
   - Enter a repository name (e.g., `cadence-todo-dashboard`), choose **Public** or **Private**, and leave **Initialize this repository with a README** unchecked.
   - Click **Create repository**.

2. **Initialize Git and push your project**:
   Run these commands in your project root directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Modern Todo List Dashboard"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

*(The included `.gitignore` ensures `node_modules/`, `dist/`, `.vercel`, and `.env*` files are excluded from Git.)*

---

## Step-by-Step Vercel Deployment Instructions

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub using the steps above.
2. Go to [vercel.com](https://vercel.com) and sign in with your **GitHub** account.
3. Click **Add New...** → **Project**.
4. Import your `cadence-todo-dashboard` GitHub repository.
5. Vercel automatically detects the Vite configuration via `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your live URL will be ready in under a minute, and every subsequent `git push` to `main` will automatically trigger a fresh deployment.

### Option B: Deploy via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in and deploy from your project root:
   ```bash
   vercel login
   vercel --prod
   ```
   Follow the prompts to link or create the project and publish to production.
