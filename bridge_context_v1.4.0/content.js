if (typeof BRIDGE_CONTEXT_ICON === 'undefined') {
    var BRIDGE_CONTEXT_ICON = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bridge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M4 11C4 11 6 7 12 7C18 7 20 11 20 11" stroke="url(#bridge-grad)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M4 13C4 13 6 17 12 17C18 17 20 13 20 13" stroke="url(#bridge-grad)" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="12" cy="12" r="3" fill="url(#bridge-grad)" fill-opacity="0.2" stroke="url(#bridge-grad)" stroke-width="1.5"/>
      <path d="M12 9V15" stroke="url(#bridge-grad)" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    `;
}

if (!window._contextBridgeInitialized) {
    window._contextBridgeInitialized = true;

    function initSwitchboard() {
        if (document.getElementById('cr-switchboard-container')) return;

        const container = document.createElement('div');
        container.id = 'cr-switchboard-container';

        container.innerHTML = `
        <div id="cr-switchboard-menu">
          <div class="cr-menu-header">
            <span>BridgeContext</span>
            <button id="cr-capture-btn" style="font-size: 10px; background: #6366f1; color: white; border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer;">Bridge</button>
          </div>
          <div class="cr-menu-list" id="cr-menu-list">
            <div style="padding: 20px; text-align: center; font-size: 11px; opacity: 0.6;">Loading...</div>
          </div>
          <div class="cr-shuttle-tray" id="cr-shuttle-tray">
            <div class="cr-tray-label">Shuttle to:</div>
            <div class="cr-tray-actions">
                <button class="cr-shuttle-btn" data-target="gpt" title="Shuttle to ChatGPT">GPT</button>
                <button class="cr-shuttle-btn" data-target="claude" title="Shuttle to Claude">CLD</button>
                <button class="cr-shuttle-btn" data-target="gemini" title="Shuttle to Gemini">GEM</button>
            </div>
          </div>
        </div>
        <div id="cr-switchboard-trigger">
          ${BRIDGE_CONTEXT_ICON}
        </div>
      `;

        document.body.appendChild(container);
        renderMenuList();

        const trigger = document.getElementById('cr-switchboard-trigger');
        const menu = document.getElementById('cr-switchboard-menu');

        const stopParams = (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation(); // Stop other listeners on the same element
            e.preventDefault(); // Critical to prevent focus shift
        };

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
            menu.classList.toggle('open');
        });

        // Aggressive event blocking to prevent modal closing
        ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'touchstart', 'touchend'].forEach(evt => {
            trigger.addEventListener(evt, stopParams, { capture: true });
        });

        // Make elements non-focusable
        container.setAttribute('tabindex', '-1');
        trigger.setAttribute('tabindex', '-1');
        menu.setAttribute('tabindex', '-1');

        document.addEventListener('click', (e) => {
            const path = e.composedPath();
            if (!path.includes(container) && menu.classList.contains('open')) {
                menu.classList.remove('open');
            }
        });

        const captureBtn = document.getElementById('cr-capture-btn');
        captureBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await performBridge();
        });

        // Shared bridge logic
        async function performBridge() {
            const captureBtn = document.getElementById('cr-capture-btn');
            if (captureBtn) captureBtn.innerText = 'Bridging...';

            const captured = await Scraper.capture();
            if (captured) {
                const customName = prompt("Name this Context Pack:", captured.name);
                if (customName === null) {
                    if (captureBtn) captureBtn.innerText = 'Bridge';
                    return;
                }

                await StorageLocal.savePack({
                    name: customName || captured.name,
                    desc: `Imported from ${captured.source}`,
                    data: captured.data
                });
                showToast(`Bridged: ${customName || captured.name}`, `Added to your local memory.`);
                renderMenuList();
            } else {
                showToast('Bridge Failed', 'No significant context found on this page.', '⚠️');
            }
            if (captureBtn) captureBtn.innerText = 'Bridge';
        }
        window._performBridge = performBridge; // Export for hotkeys

        // Shuttle listeners
        document.querySelectorAll('.cr-shuttle-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const target = btn.getAttribute('data-target');
                const captured = await Scraper.capture();
                if (captured) {
                    shuttleContext(captured, target);
                } else {
                    showToast('Shuttle Failed', 'No context to transport.', '⚠️');
                }
            });
        });
    }

    async function shuttleContext(captured, target) {
        showToast('Shuttle Launching', `Transporting context to ${target.toUpperCase()}...`, '🚀');

        // Save as temporary "Shuttle" pack
        const shuttlePack = {
            id: 'shuttle_temp',
            name: `Shuttle: ${captured.name}`,
            desc: `Temporary shuttle from ${captured.source}`,
            data: captured.data,
            timestamp: Date.now()
        };

        await StorageLocal.setActiveBridge(shuttlePack);

        const urls = {
            gpt: 'https://chatgpt.com/',
            claude: 'https://claude.ai/new',
            gemini: 'https://gemini.google.com/app'
        };

        window.open(urls[target], '_blank');
    }

    function showToast(title, desc, icon = '✨') {
        let container = document.getElementById('cr-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cr-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'cr-toast';
        toast.innerHTML = `
            <div class="cr-toast-icon">${icon}</div>
            <div class="cr-toast-body">
                <div class="cr-toast-title">${title}</div>
                <div class="cr-toast-desc">${desc}</div>
            </div>
        `;

        container.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    async function renderMenuList() {
        const list = document.getElementById('cr-menu-list');
        if (!list) return;

        const packs = await StorageLocal.getAllPacks();

        if (packs.length === 0) {
            list.innerHTML = '<div style="padding: 20px; text-align: center; font-size: 11px; opacity: 0.6;">No packs yet. Use "Capture" or add via popup.</div>';
            return;
        }

        list.innerHTML = packs.map(pack => `
        <div class="cr-context-item" data-id="${pack.id}">
          <div class="cr-item-name">${pack.name}</div>
          <div class="cr-item-desc">${pack.desc}</div>
        </div>
      `).join('');

        document.querySelectorAll('.cr-context-item').forEach(item => {
            item.addEventListener('click', async () => {
                const packId = item.getAttribute('data-id');
                const allPacks = await StorageLocal.getAllPacks();
                const pack = allPacks.find(p => p.id === packId);
                if (pack) {
                    injectContext(pack);
                    StorageLocal.updateLastUsed(pack.id); // v1.3 Usage tracking
                }
                document.getElementById('cr-switchboard-menu').classList.remove('open');
            });
        });
    }

    function injectContext(pack) {
        const selectors = [
            'div[contenteditable="true"].ql-editor',
            'div[contenteditable="true"]',
            'div[role="textbox"]',
            'rich-textarea div',
            '#prompt-textarea',
            'textarea'
        ];

        let input = null;
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && el.offsetParent !== null) {
                input = el;
                break;
            }
        }

        if (!input) {
            showToast('Injection Failed', 'Could not find a chat box to inject into.', '⚠️');
            return;
        }

        const timestamp = new Date().toLocaleString();
        const header = `[Context: ${pack.name}] - Added via BridgeContext (${timestamp})\n` +
            `[Source: ${pack.desc || 'Local Memory'}]\n` +
            `--------------------------------------------------\n\n`;

        const fullContext = header + pack.data + `\n\n[End of Context: ${pack.name}]\n`;

        input.focus();

        // Universal Force Injector (React/Svelte/Vue aware)
        const isEditable = input.tagName === 'DIV' || input.getAttribute('contenteditable') === 'true';

        if (isEditable) {
            // Use Selection API + InputEvent for React compatibility
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                selection.removeAllRanges();
                range.selectNodeContents(input);
                range.collapse(false);
                selection.addRange(range);

                // Try native insertion
                if (!document.execCommand('insertText', false, fullContext)) {
                    input.innerText = fullContext + input.innerText;
                }
            } catch (e) {
                input.innerText = fullContext + input.innerText;
            }
        } else {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const value = input.value;
            input.value = value.substring(0, start) + fullContext + value.substring(end);
            input.selectionStart = input.selectionEnd = start + fullContext.length;
        }

        // Trigger React/Internal state updates
        const events = ['input', 'change', 'blur', 'keydown', 'keypress', 'keyup'];
        events.forEach(name => {
            input.dispatchEvent(new Event(name, { bubbles: true }));
            // Also try InputEvent (required for some Claude versions)
            input.dispatchEvent(new InputEvent(name, {
                bubbles: true,
                inputType: 'insertText',
                data: fullContext
            }));
        });

        // Final focus to ensure the AI container notices
        setTimeout(() => input.focus(), 50);

        showToast('Context Injected', `Memory "${pack.name}" is now ready.`, '⚡');
        input.addEventListener('input', handleSmartSuggestions);
    }

    let _suggestedPack = null;
    let _suggestionTimeout = null;

    function handleSmartSuggestions(e) {
        if (_suggestionTimeout) clearTimeout(_suggestionTimeout);

        _suggestionTimeout = setTimeout(() => {
            const text = e.target.value || e.target.innerText;
            if (!text || text.length < 5) return;

            StorageLocal.getAllPacks().then(packs => {
                const suggestion = Scraper.suggestContext(text, packs);
                const trigger = document.getElementById('cr-switchboard-trigger');

                if (suggestion && (!_suggestedPack || suggestion.id !== _suggestedPack.id)) {
                    _suggestedPack = suggestion;
                    if (trigger) {
                        trigger.classList.add('cr-pulse-urgent');
                        trigger.setAttribute('title', `Suggested: ${suggestion.name}`);
                    }
                } else if (!suggestion && _suggestedPack) {
                    _suggestedPack = null;
                    if (trigger && !document.getElementById('bridge-context-prompt')) {
                        trigger.classList.remove('cr-pulse-urgent');
                        trigger.removeAttribute('title');
                    }
                }
            });
        }, 300);
    }

    async function checkAndPulse() {
        const captured = await Scraper.capture();
        const trigger = document.getElementById('cr-switchboard-trigger');
        if (!trigger) return;

        if (captured && captured.data && captured.data.length > 50) {
            trigger.classList.remove('cr-pulse-active');
            trigger.classList.add('cr-pulse-detected');
        } else {
            trigger.classList.remove('cr-pulse-detected', 'cr-pulse-active');
        }
    }

    async function checkActiveBridge() {
        const bridge = await StorageLocal.getActiveBridge();
        if (!bridge) return;

        const tenMinutes = 10 * 60 * 1000;
        if (Date.now() - bridge.timestamp > tenMinutes) return;

        const messageExists = document.querySelector('div[data-testid*="message"], .chat-message, article, .font-claude-message, [data-testid="user-message"]');
        const isNewChatUrl = window.location.href.includes('/new');

        if (messageExists && !isNewChatUrl) return;

        const trigger = document.getElementById('cr-switchboard-trigger');
        if (trigger) trigger.classList.add('cr-pulse-urgent');

        showBridgePrompt(bridge);
    }

    function showBridgePrompt(bridge) {
        if (document.getElementById('bridge-context-prompt')) return;

        const prompt = document.createElement('div');
        prompt.id = 'bridge-context-prompt';
        prompt.className = 'bridge-prompt-toast';
        prompt.innerHTML = `
            <div class="bridge-prompt-icon">✨</div>
            <div class="bridge-prompt-content">
                <div class="bridge-prompt-title">Bridge Context?</div>
                <div class="bridge-prompt-desc">Detected fresh context: <b>${bridge.name}</b></div>
            </div>
            <div class="bridge-prompt-actions">
                <button id="bridge-prompt-inject" class="bridge-confirm-btn">Inject</button>
                <button id="bridge-prompt-dismiss" class="bridge-dismiss-btn">✕</button>
            </div>
        `;

        document.body.appendChild(prompt);

        const cleanup = () => {
            prompt.remove();
            const trigger = document.getElementById('cr-switchboard-trigger');
            if (trigger) trigger.classList.remove('cr-pulse-urgent');
        };

        document.getElementById('bridge-prompt-inject').onclick = () => {
            injectContext(bridge);
            StorageLocal.updateLastUsed(bridge.id);
            cleanup();
        };

        document.getElementById('bridge-prompt-dismiss').onclick = () => {
            cleanup();
        };
    }

    const observer = new MutationObserver((mutations) => {
        const currentUrl = window.location.href;
        if (window._lastUrl !== currentUrl) {
            window._lastUrl = currentUrl;
            setTimeout(() => {
                checkActiveBridge();
                checkAndPulse();
            }, 1500);
            return;
        }

        const significantChange = mutations.some(m =>
            Array.from(m.addedNodes).some(n => n.nodeType === 1 && (n.tagName === 'MAIN' || n.id === 'chat-container'))
        );

        if (significantChange) {
            checkAndPulse();
        }
    });

    const runInit = () => {
        initSwitchboard();
        window._lastUrl = window.location.href;
        observer.observe(document.body, { childList: true, subtree: true });

        const setupListeners = () => {
            document.querySelectorAll('#prompt-textarea, div[contenteditable="true"], textarea').forEach(el => {
                el.addEventListener('input', handleSmartSuggestions);
            });
        };
        setupListeners();

        setTimeout(checkAndPulse, 2000);
        setTimeout(checkActiveBridge, 3000);
    };

    if (document.body) {
        runInit();
    } else {
        document.addEventListener('DOMContentLoaded', runInit);
    }

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "ping") {
            sendResponse({ status: "alive" });
            return;
        }
        if (request.action === "capture") {
            Scraper.capture().then(captured => {
                sendResponse({ captured });
            });
            return true;
        }
        if (request.action === "inject") {
            injectContext(request.pack);
            StorageLocal.updateLastUsed(request.pack.id);
            sendResponse({ success: true });
        }
        if (request.action === "hotkey_bridge") {
            showToast('Hotkey: Bridge', 'Capturing context...', '⌨️');
            window._performBridge?.();
        }
        if (request.action === "hotkey_inject") {
            StorageLocal.getAllPacks().then(packs => {
                if (packs.length > 0) {
                    const latest = packs.sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))[0];
                    showToast('Hotkey: Inject', `Injecting ${latest.name}...`, '⌨️');
                    injectContext(latest);
                } else {
                    showToast('Hotkey: Inject', 'No packs found in memory.', '⚠️');
                }
            });
        }
    });
}
