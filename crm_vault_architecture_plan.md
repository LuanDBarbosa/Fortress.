# Secure CRM & Zero-Knowledge Vault: Architecture Plan

## 1. Project Overview
A custom, highly scalable client relationship manager (CRM) and zero-knowledge password vault. The application is designed to natively handle project management (tasks, deadlines, client info) alongside cryptographically secure secret storage. Because this system is designed for distributed access, it inherently supports seamless and secure collaboration between the UK and Spain without the central server ever holding the keys.

---

## 2. The Tech Stack
* **Development Environment:** Google Antigravity (Leveraging multi-agent orchestration to build the Rust backend and React frontend in parallel).
* **Core Application Framework:** Tauri 2.0 (Compiling to lightweight, native apps for Desktop and Mobile).
* **Backend Systems Integration:** Rust (Tauri's native layer for system calls and secure memory management).
* **Frontend UI & State:** React + TypeScript via Vite.
* **Styling:** Tailwind CSS (For rapid, highly flexible UI experimentation).
* **Database:** PostgreSQL (For standard relational data and encrypted blob storage).
* **Cryptography:** Native Web Crypto API (`window.crypto.subtle`). No external crypto libraries required.

---

## 3. Cryptographic Primitives
The application relies strictly on client-side encryption. The server only ever receives and stores ciphertext.
* **Key Derivation:** PBKDF2 (SHA-256, 600,000+ iterations) — Converts the Master Password into a symmetric key.
* **Symmetric Encryption:** AES-256-GCM — Encrypts the client secrets, Private Keys, and Organization Keys.
* **Asymmetric Encryption:** RSA-OAEP (4096-bit) — Used strictly to securely wrap and share the Organization Key between users.

---

## 4. The Database Schema
By structuring the project management side cleanly in PostgreSQL, the foundation is primed to support automated workflows later on. It will easily accommodate an agentic backend, much like the LangGraph system driving the "Build it" architecture.

### Relational Tables (Project Management)
* **`clients`**: `id`, `name`, `contact_info`, `notes`
* **`projects`**: `id`, `client_id`, `status`, `deadline`
* **`tasks`**: `id`, `project_id`, `assignee_id`, `kanban_state`

### Cryptographic Tables (The Vault)
* **`users`**: 
  * `id`, `email`, `password_hash` (Strictly for server-side 2FA/Auth gate)
  * `public_key` (Plaintext RSA)
  * `private_key_master` (RSA Private Key encrypted by Master Password)
  * `private_key_recovery` (RSA Private Key encrypted by 24-word Offline Key)
* **`workspaces`**: `id`, `name`
* **`workspace_users`**: 
  * `workspace_id`, `user_id`, `role`
  * `encrypted_org_key` (The shared AES-256 key, encrypted by this specific user's `public_key`)
* **`vault_items`**: 
  * `id`, `workspace_id`
  * `ciphertext` (The client password/data, encrypted by the Org Key)
  * `iv` (Initialization Vector)

---

## 5. Security & Account Recovery Routing
To ensure enterprise-grade resilience, the system implements multi-factor authentication at the server gate, and two distinct zero-knowledge recovery paths on the client side.

1. **Authentication Gate (MFA):** TOTP (Authenticator App) or WebAuthn (Passkeys) verifying identity before the database releases the encrypted vault blobs.
2. **Recovery Path A (Self-Rescue):** 24-word offline recovery phrase generated at onboarding. Unlocks the `private_key_recovery` payload allowing the user to set a new Master Password without partner intervention.
3. **Recovery Path B (Partner-Rescue):** If all passwords are lost, the user generates a new RSA Key Pair. The partner logs in, decrypts the shared Organization Key using their own intact Private Key, and re-encrypts a copy of it using the locked-out user's new Public Key.

---

## 6. Implementation Roadmap

### Phase 1: Foundation & UI
1. Initialize the project via Antigravity using the Tauri + React + Vite template.
2. Build out the React frontend for the Kanban boards, task lists, and client pages.
3. Scaffold the standard PostgreSQL tables and basic API endpoints (ignoring encryption initially just to get the data flowing).

### Phase 2: The Cryptographic Engine
1. Implement the Web Crypto API hooks in React.
2. Create the User Onboarding flow: Master password derivation, RSA key pair generation, and Offline Recovery phrase generation.
3. Implement the Workspace logic: Organization Key generation and Asymmetric sharing.
4. Wire up the Vault UI to encrypt data before it hits the API calls.

### Phase 3: Hardening & Cross-Platform
1. Implement TOTP / 2FA at the server authentication layer.
2. Build the UI for the Partner-Rescue recovery method.
3. Configure Tauri for mobile compilation (Android/iOS) and test native system behavior.
