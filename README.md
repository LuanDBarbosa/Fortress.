# Fortress — Secure CRM & Zero-Knowledge Vault

> A desktop & web client relationship management (CRM) platform featuring an infinite fluid canvas, zero-knowledge secret storage, and native cross-platform performance powered by Tauri 2.0, React 19, and Rust.

---

## 🌟 Overview

**Fortress** bridges the gap between structured project management and uncompromising data security. Designed for distributed agencies and remote teams (such as cross-border teams across the UK and Spain), it enables seamless collaboration on tasks, client briefing, media assets, and credentials without the server or any intermediary ever possessing the decryption keys.

### Key Highlights

- 🧠 **Infinite Fluid Canvas**: An interactive, node-based workspace powered by `@xyflow/react` and `d3-force` dynamic physics simulations.
- 🔐 **Zero-Knowledge Architecture**: Client-side cryptography leveraging the Web Crypto API (`window.crypto.subtle`) with PBKDF2, AES-256-GCM, and RSA-OAEP (4096-bit).
- ⚡ **Native Performance**: Powered by **Tauri 2.0** and **Rust** for native desktop and mobile binaries with minimal RAM footprint and hardware-accelerated rendering (targeting 144fps).
- 🧩 **Modular Node Ecosystem**: Embed tasks, notes, vault secrets, calendars, briefings, tickets, media players, and hierarchical nested environments directly on the canvas.
- 🔄 **Dual Recovery Protocol**: 24-word offline self-rescue mnemonic or cryptographic partner-rescue protocol to prevent catastrophic lockouts without compromising zero-knowledge guarantees.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Shell & Native Backend** | Tauri 2.0, Rust | Native window management, secure system calls, OS key storage |
| **Frontend Framework** | React 19, TypeScript, Vite 7 | Modern reactive component architecture & fast HMR |
| **Canvas & Physics** | `@xyflow/react` (v12), `d3-force` | Infinite pan/zoom canvas, custom node renderers, dynamic node repulsion/attraction |
| **State Management** | Zustand (with shallow selectors) | High-performance, decoupled state persistence across canvas layers |
| **Styling & Theme** | Tailwind CSS v4, Lucide React, Geist Sans | Obsidian Shield dark palette, fluid typography, responsive layout |
| **Cryptography** | Native Web Crypto API | PBKDF2 (SHA-256, 600,000+ iters), AES-256-GCM, RSA-OAEP 4096-bit |
| **Relational Database** | PostgreSQL / SQLite | Metadata, relational project entities, and encrypted ciphertext blobs |

---

## 📦 Project Structure

```text
fortress/
├── crm-vault/                      # Main client application (Tauri + React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── nodes/              # Canvas node components (Note, Vault, Task, etc.)
│   │   │   ├── edges/              # Custom connection edges
│   │   │   ├── ui/                 # Reusable UI controls (Video Player, DateTime Picker)
│   │   │   ├── CanvasContextMenu.tsx  # Dynamic right-click context menu (screen-to-flow projection)
│   │   │   ├── NodeEditorModal.tsx    # Modal editor for comprehensive node inspection
│   │   │   └── Layout.tsx          # App navigation layout and topbar
│   │   ├── hooks/                  # Custom React hooks (usePhysicsLayout, etc.)
│   │   ├── pages/                  # Top-level views (Dashboard Canvas, Clients directory)
│   │   ├── store/                  # Zustand stores (canvas state, viewport, node hierarchy)
│   │   └── utils/                  # Storage helpers, group color maps
│   ├── src-tauri/                  # Rust native backend and Tauri configuration
│   │   ├── src/                    # Rust entrypoints (main.rs, lib.rs, schema.sql)
│   │   └── tauri.conf.json         # Tauri 2.0 configuration & capabilities
│   └── package.json
├── stitch_fluid_client_canvas/     # Design specifications & style guides (Obsidian Shield)
│   ├── DESIGN.md                   # Color design tokens and typography specifications
│   └── screen.png                  # UI reference capture
├── crm_vault_architecture_plan.md  # Detailed security and cryptographic architecture specification
└── README.md                       # This repository overview
```

---

## 🧩 Canvas Node Types

The interactive dashboard workspace provides specialized nodes to organize every aspect of client operations:

1. **Vault Node (`VaultNode`)**: Encrypted credentials, API keys, and sensitive tokens with one-click copy, hidden-by-default fields, and zero-knowledge storage.
2. **Tasks Node (`TasksNode`)**: Mini Kanban boards and task checklists for active deliverables.
3. **Note Node (`NoteNode`)**: Full Markdown notes with inline quick-editing and autosizing text areas.
4. **Briefing Node (`BriefingNode`)**: Client project scopes, stakeholder summaries, and alignment documents.
5. **Projects Node (`ProjectsNode`)**: Milestones, deadline tracking, and status health indicators.
6. **Tickets Node (`TicketsNode`)**: Support requests and bug ticket tracking with priority badges.
7. **Media Node (`MediaNode`)**: Custom fluid video player and asset viewer.
8. **File Node (`FileNode`)**: Linked documentation, attachments, and downloadable assets.
9. **Calendar Node (`CalendarNode`)**: Meeting schedules, deadlines, and inline calendar event management.
10. **Global & Inner Environment Nodes (`GlobalEnvNode` / `InnerFeatureNode`)**: Hierarchical sub-canvases allowing drill-down into client-specific or feature-specific nested workspaces.
11. **Group Node (`GroupNode`)**: Color-coded visual containers for clustering related nodes together.
12. **Graph Node (`GraphNode`)**: Interactive network graphs visualizing relationships and dependencies.

---

## 🔒 Cryptographic Model

All data stored inside the Vault uses client-side encryption. The backend database never sees plaintext values or master passphrases:

- **Master Key Derivation**: PBKDF2 using SHA-256 and 600,000+ iterations transforms the master password into a 256-bit AES master key.
- **Data Encryption**: All secrets, client notes, and vault items are encrypted via AES-256-GCM with a unique 12-byte initialization vector (IV) per entry.
- **Multi-User Collaboration**: Each workspace maintains a shared Organization Key (AES-256). When inviting a team member, the Organization Key is wrapped with the recipient's RSA-OAEP 4096-bit public key.
- **Account Recovery Paths**:
  - **Self-Rescue**: A 24-word BIP39 mnemonic phrase encrypts a recovery private key payload.
  - **Partner-Rescue**: Intact workspace partners can re-encrypt the Organization Key with a locked-out member's newly generated public key.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher, v20+ recommended)
- [Rust](https://www.rust-lang.org/tools/install) and `cargo` (for building the Tauri desktop application)
- Platform-specific build tools for Tauri (see [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/))

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/LuanDBarbosa/Fortress.git
cd Fortress/crm-vault
npm install
```

### Running the Development Server (Web Mode)

To run the web version of the frontend:

```bash
npm run dev
```

The Vite dev server will start at:
👉 **[http://localhost:1420](http://localhost:1420)** *(Port 1420 is configured for Tauri compatibility)*

### Running as Desktop Application (Tauri Mode)

To launch the native desktop application with live hot-reloading:

```bash
npm run tauri dev
```

### Building for Production

Compile the web frontend:
```bash
npm run build
```

Bundle the production desktop application installer (`.msi`, `.exe`, `.dmg`, or `.deb`):
```bash
npm run tauri build
```

---

## 🎯 Performance Principles

- **Fluid 144Hz Experience**: Heavy CSS filters (such as `backdrop-filter`) are minimized during active drag/pan operations.
- **Optimized Re-renders**: Zustand shallow comparison selectors (`useShallow`) and memoized node types prevent unnecessary React reconciliation loops.
- **Decoupled Physics Engine**: `d3-force` layouts execute in discrete animation ticks with configurable alpha cooling to eliminate CPU churn.

---

## 📄 License

Private / Proprietary. All rights reserved.
