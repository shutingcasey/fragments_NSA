# Fragments Backend Service
This repository contains the backend REST API for the **Fragments** service.  
The service is built with **Node.js** and **Express**, and is designed to run in a Linux-based environment for cloud deployment.

---

## Requirements

- **Node.js** LTS recommended
- **npm**
- A Unix-like environment:
  - Windows with WSL2

---

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

---

## Available npm Scripts

### Lint the Source Code

Runs ESLint against all JavaScript files in the `src/` directory:

```bash
npm run lint
```

---

### Start the Server (Production-style)

Starts the server normally using Node.js.

- Default port: `8080`
- Can be overridden using the `PORT` environment variable

```bash
npm start
```

---

### Start the Server in Development Mode (Watch)

Starts the server in development mode using Node.js built-in file watching.  
The server will automatically restart when source files change.

- Environment variables are loaded from `.env.debug`

```bash
npm run dev
```

---

### Start the Server in Debug Mode

Starts the server in watch mode and enables the Node.js inspector on port `9229`.  
This allows a debugger (e.g., VSCode) to attach to the running process.

```bash
npm run debug
```

---

## Environment Configuration

Development-specific environment variables are stored in `.env.debug`.

Example:

```env
FRAGMENTS_LOG_LEVEL=debug
```

This file is intended for local development only and **should not be committed** to version control.

---

## Logging

This project uses **Pino** for structured logging.

- Logs are output as **JSON** for cloud compatibility
- In debug mode, logs are prettified for local readability
- Log level is controlled via the `FRAGMENTS_LOG_LEVEL` environment variable

---

## Health Check Endpoint

The server exposes a simple health check endpoint to verify that it is running.

### Endpoint

```http
GET /
```

### Example Response

```json
{
  "status": "ok",
  "description": "fragments service running normally",
  "author": "<YOUR NAME>",
  "githubUrl": "https://github.com/<YOUR_GITHUB_USERNAME>/fragments",
  "version": "0.0.1",
  "timestamp": "2026-01-02T16:07:54.483Z"
}
```

---

## Testing the Server

### Using a Browser

```
http://localhost:8080
```

### Using curl

```bash
curl localhost:8080
```

To pretty-print the JSON response using `jq`:

```bash
curl -s localhost:8080 | jq
```

---

## Debugging with VSCode

A VSCode debug configuration is provided in `.vscode/launch.json`.

### Steps

1. Set a breakpoint in `src/app.js`
2. Open the **Run and Debug** panel in VSCode
3. Select **"Debug via npm run debug"**
4. Start debugging
5. Send a request to `http://localhost:8080`

---

## Notes

- This project uses structured logging and middleware suitable for cloud environments
- Graceful shutdown is implemented using the `stoppable` package
- Code formatting and linting are enforced via **Prettier** and **ESLint**
