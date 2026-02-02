# 🌉 BridgeContext
**The local-first bridge between AI silos.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Version](https://img.shields.io/badge/version-1.4.0-green.svg)](https://github.com/anavvathi/Bridgecontext)

BridgeContext is a Chrome Extension designed for "model-polyglot" AI power users. It allows you to seamlessly capture context from one AI platform (like ChatGPT) and "inject" it into another (like Claude or Gemini) with zero copy-pasting and 100% local privacy.

## 🚀 Why BridgeContext?
We live in an era of model fragmentation. One AI is better at coding, another at creative writing, and a third at long-context analysis. Moving your conversational "brain" between them is a manual, high-friction process.

**BridgeContext removes that friction.**

### ✨ Key Features
- **Universal Capture**: Robust scraping engine for ChatGPT, Claude, Gemini, DeepSeek, Grok, and more.
- **Smart Injection**: Injects context directly into chat inputs, supporting complex React and Svelte frameworks.
- **Local-Only Memory**: Your context never leaves your machine. Data is stored securely in your browser's local sandbox.
- **Context Management**: Save "Context Packs" for different projects or expert personas.
- **One-Click Workflow**: A floating, pulsing UI that alerts you when a context match is ready.

## 🛠️ How it Works
1. **Capture**: Click the Bridge icon on a message in ChatGPT or Claude.
2. **Store**: BridgeContext saves that thread's essence to your local storage.
3. **Bridge**: Navigate to another AI tool.
4. **Inject**: The Bridge icon appears on the new input field. Click it to paste your entire context history instantly.

## 🔒 Privacy First
BridgeContext was built with a privacy-native architecture:
- **No Remote Servers**: We have no backend. 
- **Zero Collection**: We do not track what you capture or inject.
- **Open Source**: Verify the logic yourself in our [scraper.js](scraper.js) and [storage.js](storage.js).

Check out our full [Privacy Policy](PRIVACY.md).

## 📥 Installation
1. Download this repository.
2. Go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the root folder of this project.

*Note: BridgeContext v1.4.0 is currently under review for the official Chrome Web Store.*

## 🤝 Contributing
Contributions are welcome! If you find a selector is broken due to a UI update on an AI platform, please open an issue or submit a Pull Request.

## 📄 License
This project is licensed under the **GNU GPL v3.0** - see the [LICENSE](LICENSE) file for details. Protecting your rights and ensuring the tool remains free for everyone.

---
Created with ❤️ for AI Power Users by [Anvesh](https://github.com/anavvathi).
