-- Relational Tables (Project Management)
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    status VARCHAR(50) NOT NULL,
    deadline DATE
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    assignee_id INTEGER,
    kanban_state VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(50)
);

-- Cryptographic Tables (The Vault)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    public_key TEXT NOT NULL,
    private_key_master TEXT NOT NULL,
    private_key_recovery TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_users (
    workspace_id INTEGER REFERENCES workspaces(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    encrypted_org_key TEXT NOT NULL,
    PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS vault_items (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER REFERENCES workspaces(id),
    ciphertext TEXT NOT NULL,
    iv TEXT NOT NULL
);
