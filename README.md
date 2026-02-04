# 🌉 BridgeContext
**The local-first bridge between AI silos.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Version](https://img.shields.io/badge/version-1.4.1-green.svg)](https://github.com/anavvathi/Bridgecontext)

BridgeContext is a Chrome Extension designed for "model-polyglot" AI power users. It allows you to seamlessly capture context from one AI platform (like ChatGPT) and "inject" it into another (like Claude or Gemini) with zero copy-pasting and 100% local privacy.

## 🚀 Why BridgeContext?
We live in an era of model fragmentation. One AI is better at coding, another at creative writing, and a third at long-context analysis. Moving your conversational "brain" between them is a manual, high-friction process.

**BridgeContext removes that friction.**

### ✨ Key Features
- **Web Shuttles (v1.4.1)**: Instant 1-click transport to ChatGPT, Claude, or Gemini.
- **Universal Capture**: Robust scraping engine for ChatGPT, Claude, Gemini, DeepSeek, Grok, and more.
- **Smart Injection**: Injects context directly into chat inputs, supporting complex React and Svelte frameworks.
- **Local-Only Memory**: Your context never leaves your machine. Data is stored securely in your browser's local sandbox.
- **Expert Packs**: Pre-loaded with specialized personas (Architect, API Master) to prime your AI conversations.
- **Native IDE Bridge**: Direct context piping into VS Code for a seamless browser-to-code workflow.

## 🛠️ How it Works
1. **Bridge**: Click "Bridge Context" in the popup on any AI page to save the current thread.
2. **Shuttle**: Or click a model button (e.g., **Claude**) to instantly shuttle context to a new tab.
3. **Inject**: On the target AI page, BridgeContext will prompt you to "Bridge Context?"—one click and your memory is injected.

## 🔒 Privacy First
BridgeContext was built with a privacy-native architecture:
- **No Remote Servers**: v1.4.1 is 100% local. We have no backend. 
- **Zero Collection**: We do not track what you capture or inject.
- **Open Source**: Verify the logic yourself in our [scraper.js](scraper.js) and [storage.js](storage.js).

Check out our full [Privacy Policy](PRIVACY.md).

## 📥 Installation
The easiest way is to install via the **[Chrome Web Store](https://chromewebstore.google.com/detail/bridgecontext/kgfdnbpnjilbclbobhcmnbbkfenlfafh)**.

For manual development:
1. Download this repository.
2. Go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the root folder of this project.

## 🤝 Contributing
Contributions are welcome! If you find a selector is broken due to a UI update on an AI platform, please open an issue or submit a Pull Request.

## 📄 License
This project is licensed under the **GNU GPL v3.0** - see the [LICENSE](LICENSE) file for details. Protecting your rights and ensuring the tool remains free for everyone.

---

## 💻 IDE Integration (VS Code)

BridgeContext now supports direct context injection into VS Code, allowing you to bridge the gap between AI research and local development.

### Features
- **One-Click Sync**: Move your AI thought process from browser to IDE instantly.
- **Persistent Context**: Your research stays with you even as you switch sidebars.
- **Privacy First**: Secure, OS-level communication (Native Messaging) with zero open network ports.

### Installation & Setup

#### 1. Register the Native Bridge
This step allows any Chromium browser (Chrome, Edge, Brave, etc.) to securely communicate with your local machine.
- **Any OS Supported**: Registration scripts are optimized for **Windows**, **macOS**, and **Linux**.
- **Windows**: Run `native-host/install.bat` as Administrator.
- **macOS/Linux**: Run `native-host/install.sh` from your terminal.

#### 2. Connect the Chrome Extension
1. Go to `chrome://extensions` and find **BridgeContext**.
2. Copy your **Extension ID**.
3. Open `native-host/com.bridgecontext.host.json`.
4. Add your ID to the `allowed_origins` list (remove the placeholder).
5. **Reload** the extension in Chrome.

#### 3. Load the VS Code Extension
1. Open the `vscode-extension` folder in VS Code.
2. Press **F5** (or use the "Run and Debug" sidebar) to launch the BridgeContext IDE view.
3. Look for the **Bridge** icon in your VS Code Activity Bar!

---
Created with ❤️ for AI Power Users by [Anvesh](https://github.com/anavvathi).
