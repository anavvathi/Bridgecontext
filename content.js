// BridgeContext: Content Script v1.4.0 (Icon-less)

if (!window._contextBridgeInitialized) {
    window._contextBridgeInitialized = true;

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

    function injectContext(pack) {
        if (!pack || !pack.data) {
            showToast('Injection Failed', 'Pack data is empty.', '⚠️');
            return;
        }

        const selectors = [
            '#prompt-textarea', // ChatGPT
            'div[contenteditable="true"].ql-editor', // Claude New
            'div[contenteditable="true"]', // Generic
            'div[role="textbox"]', // Generic
            'rich-textarea div', // Gemini
            '#chat-input-textarea', // DeepSeek
            'textarea' // Fallback
        ];

        let input = null;
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el && (el.offsetWidth > 0 || el.offsetHeight > 0)) {
                input = el;
                console.log(`BridgeContext: Matched selector "${selector}"`);
                break;
            }
        }

        if (!input) {
            console.error("BridgeContext: No input field found among selectors:", selectors);
            showToast('Injection Failed', 'Could not find a chat box.', '⚠️');
            return;
        }

        const timestamp = new Date().toLocaleString();
        const header = `[Context: ${pack.name}] - Added via BridgeContext (${timestamp})\n` +
            `[Source: ${pack.desc || 'Local Memory'}]\n` +
            `--------------------------------------------------\n\n`;

        const fullContext = header + pack.data + `\n\n[End of Context: ${pack.name}]\n`;

        input.focus();

        const isEditable = input.tagName === 'DIV' || input.getAttribute('contenteditable') === 'true';

        if (isEditable) {
            // Priority 1: execCommand (Works best for Rich Text/React if supported)
            try {
                const selection = window.getSelection();
                const range = document.createRange();
                selection.removeAllRanges();
                range.selectNodeContents(input);
                range.collapse(false);
                selection.addRange(range);

                if (!document.execCommand('insertText', false, fullContext)) {
                    input.innerText = fullContext + input.innerText;
                }
            } catch (e) {
                input.innerText = fullContext + input.innerText;
            }
        } else {
            // Standard Textarea/Input
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const value = input.value;
            input.value = value.substring(0, start) + fullContext + value.substring(end);
            input.selectionStart = input.selectionEnd = start + fullContext.length;
        }

        // Trigger React/Internal state updates
        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: fullContext
        });
        input.dispatchEvent(inputEvent);

        const changeEvent = new Event('change', { bubbles: true });
        input.dispatchEvent(changeEvent);

        // Final focus to ensure the AI container notices
        setTimeout(() => {
            input.focus();
            input.dispatchEvent(new Event('blur', { bubbles: true }));
            input.focus();
        }, 100);

        showToast('Context Injected', `Memory "${pack.name}" is now ready.`, '⚡');
    }

    async function checkActiveBridge() {
        const bridge = await StorageLocal.getActiveBridge();
        if (!bridge) return;

        const tenMinutes = 10 * 60 * 1000;
        if (Date.now() - bridge.timestamp > tenMinutes) return;

        // Don't prompt if we're already in a chat with messages (unless it's a new chat URL)
        const messageExists = document.querySelector('div[data-testid*="message"], .chat-message, article, .font-claude-message, [data-testid="user-message"]');
        const isNewChatUrl = window.location.href.includes('/new') || window.location.href.includes('/app');

        if (messageExists && !isNewChatUrl) return;

        showBridgePrompt(bridge);
    }

    function showBridgePrompt(bridge) {
        if (document.getElementById('bridge-context-prompt')) return;

        const prompt = document.createElement('div');
        prompt.id = 'bridge-context-prompt';
        prompt.className = 'bridge-prompt-toast';
        prompt.innerHTML = `
            <div class="bridge-prompt-icon">🚀</div>
            <div class="bridge-prompt-content">
                <div class="bridge-prompt-title">Bridge Context?</div>
                <div class="bridge-prompt-desc">Incoming Context: <b>${bridge.name}</b></div>
            </div>
            <div class="bridge-prompt-actions">
                <button id="bridge-prompt-inject" class="bridge-confirm-btn">Inject</button>
                <button id="bridge-prompt-dismiss" class="bridge-dismiss-btn">✕</button>
            </div>
        `;

        document.body.appendChild(prompt);

        const cleanup = () => {
            prompt.remove();
        };

        document.getElementById('bridge-prompt-inject').onclick = () => {
            injectContext(bridge);
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
            setTimeout(checkActiveBridge, 1000);
            return;
        }
    });

    const runInit = () => {
        window._lastUrl = window.location.href;
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(checkActiveBridge, 1500);
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
            sendResponse({ success: true });
        }
    });
}
