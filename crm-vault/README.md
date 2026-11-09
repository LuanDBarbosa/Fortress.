# CRM Vault Client (Tauri + React + Vite)

Frontend and native desktop client for **Fortress**, featuring a zero-knowledge secret vault and an infinite, fluid canvas for client and project management.

---

## 🛠️ Tech Stack

- **Framework**: [Tauri 2.0](https://v2.tauri.app/) (Rust native bridge)
- **UI Library**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 7
- **Canvas Engine**: `@xyflow/react` (v12)
- **Physics Simulation**: `d3-force`
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Styling**: Tailwind CSS v4 + `@tailwindcss/typography`
- **Icons & Typography**: [Lucide React](https://lucide.dev/), `@fontsource/geist-sans`
- **Rich Text & Media**: EasyMDE / SimpleMDE, `react-markdown`, `remark-gfm`

---

## 🚀 Quick Start

### 1. Install Dependencies

From this directory (`crm-vault`):

```bash
npm install
```

### 2. Development

Run the browser development server:

```bash
npm run dev
```

> **Note on Port**: The application binds to **port 1420** by default (`http://localhost:1420/`) to align with Tauri's configuration in `src-tauri/tauri.conf.json`.

Run with Tauri native desktop window:

```bash
npm run tauri dev
```

### 3. Build & Test

- **Typecheck & Web Build**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```
- **Desktop Release Bundle**:
  ```bash
  npm run tauri build
  ```

---

## 🎨 Interactive Canvas Features

- **Dynamic Physics Layout (`usePhysicsLayout`)**: Automatically spaces out nodes using force-directed graph algorithms (`d3-force`), preventing overlap while maintaining topological structure.
- **Hierarchical Environments**:
  - Global Environment (`GlobalEnvNode`) provides high-level client cards.
  - Drill-down into inner feature spaces (`InnerFeatureNode`) for dedicated project canvasing with breadcrumb navigation.
- **Context Menu & Flow Projection**: Right-click anywhere on the canvas or directly on a node to open the dynamic context menu. Screen coordinates automatically account for canvas zoom and pan transformations.
- **Rich Node Suite**:
  - `VaultNode`: Encrypted credentials with copy-to-clipboard and masked values.
  - `TasksNode`: Quick task tracking with status toggles.
  - `NoteNode`: Markdown note taking with auto-resizing text fields.
  - `BriefingNode`: Comprehensive client briefing records.
  - `ProjectsNode`: Milestone tracking with progress bars.
  - `TicketsNode`: Issue ticketing with severity tags.
  - `CalendarNode`: Date-driven schedule markers and events.
  - `MediaNode`: Embedded media player with custom video controls.
  - `GroupNode`: Customizable color themes (`groupColors.ts`) for categorizing node groups.

---

## 📂 Source Code Layout

```text
src/
├── components/
│   ├── edges/               # Custom edges with curved SVG paths and interactive endpoints
│   ├── nodes/               # React components for each canvas node type
│   ├── ui/                  # Reusable widgets (CustomVideoPlayer, DateTimePicker, InlineCalendarEditor)
│   ├── CanvasContextMenu.tsx# Floating radial/list action menu on right-click
│   ├── Layout.tsx           # Application sidebar, navigation, and top header
│   └── NodeEditorModal.tsx   # Detailed modal editor for node metadata
├── hooks/
│   └── usePhysicsLayout.ts  # D3 force-simulation integration with React Flow
├── pages/
│   ├── Dashboard.tsx        # The main infinite canvas view
│   └── Clients.tsx          # Tabular client relationship directory
├── store/
│   └── canvasStore.ts       # Central Zustand store (nodes, edges, selection, environments)
├── utils/
│   ├── groupColors.ts       # Color definitions for visual grouping
│   └── storage.ts           # Local persistence and state dehydration
├── App.tsx                  # Main router setup
└── main.tsx                 # React DOM mount point
```
