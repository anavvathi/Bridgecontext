# 🧪 Cross-IDE Testing Guide: BridgeContext

Follow this guide to verify that BridgeContext is communicating correctly between your browser and all your installed editors.

---

## 🛠️ Phase 1: Capture (The Browser)
1. **Open Chrome/Edge** and navigate to an AI platform (e.g., [ChatGPT](https://chat.openai.com) or [Claude](https://claude.ai)).
2. **Open the BridgeContext Popup** (click the extension icon).
3. **Select a Pack** (e.g., "Architect") or click **"Bridge Context"** on a results page.
4. **Verify**: You should see a notification "Context Bridged!". This writes that data to your local `native-host/exchange.json`.

---

## 💻 Phase 2: Verification (The IDEs)

### 1. VS Code / Cursor
- **Open VS Code**.
- Click the **Bridge icon** in your Activity Bar (the left-most sidebar).
- You should see the name and description of the context you just captured in the browser.
- Open a file and click **"Inject into Code"**—the context should appear at your cursor.

### 2. JetBrains (IntelliJ, WebStorm, etc.)
- Open the `jetbrains-extension` project in IntelliJ.
- Run the Gradle task **`runIde`**.
- In the new IDE window that opens, look for the **BridgeContext tool window** on the far right edge.
- **Verify**: The UI should mirror your browser capture. Click **"Inject"** to test insertion.

### 3. Neovim
- Open a terminal and run `nvim`.
- Ensure you've run the `master-install.js` so the lua files are in your config.
- Run the command: `:BridgeContext`.
- **Verify**: A floating window should pop up showing your captured data.
- Run `:BridgeInject` to paste the data into your current buffer.

### 4. Sublime Text
- Open **Sublime Text**.
- Open the **Command Palette** (`Ctrl+Shift+P`).
- Type **"BridgeContext"** and select it.
- **Verify**: The context data should be pasted directly into your active view.

### 5. Antigravity IDE (The Agentic Way)
- In the Antigravity IDE (where we are now!), simply type:
    > **"/bridge"**
- **Verify**: I (the agent) will read the `exchange.json` and tell you exactly what context I've just synced from your browser.

---

## 🆘 Troubleshooting
- **No data?** Check if `native-host/exchange.json` is being updated by the browser. 
- **Permissions?** Ensure you ran the `master-install.js` as an Administrator so the Registry keys were set correctly.
- **Reloading?** Sometimes an IDE needs a restart after a fresh plugin installation.
