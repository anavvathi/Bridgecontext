/* BridgeContext: Scraper Utility v1.4.0 */

if (typeof Scraper === 'undefined') {
    var Scraper = {
        async scrape() {
            const url = window.location.href;
            let captured = null;

            // Determine which scraper to use based on the URL
            if (url.includes('chatgpt.com')) {
                captured = this.scrapeChatGPT();
            } else if (url.includes('claude.ai')) {
                captured = this.scrapeClaude();
            } else if (url.includes('gemini.google.com') || url.includes('aistudio.google.com')) {
                captured = this.scrapeGemini();
            } else if (url.includes('perplexity.ai')) {
                captured = this.scrapePerplexity();
            } else if (url.includes('grok.com')) {
                captured = this.scrapeGrok();
            } else if (url.includes('deepseek.com')) {
                captured = this.scrapeDeepSeek();
            } else if (url.includes('copilot.microsoft.com') || url.includes('bing.com')) {
                captured = this.scrapeCopilot();
            }

            if (captured && captured.data) {
                captured.data = this._sanitize(captured.data);
                captured.data = Sanitizer.redact(captured.data); // Apply Privacy Guard
                captured.data = Compressor.process(captured.data);
            }

            return captured;
        },

        scrapeChatGPT() {
            // 1. Try "Customize ChatGPT" Modal (Standard Check)
            const modal = document.querySelector('div[role="dialog"]');
            if (modal && (modal.textContent.includes('Custom instructions') || modal.textContent.includes('Personalization'))) {
                // Updated selector to catch more input types in the new UI
                const inputs = modal.querySelectorAll('textarea, input[type="text"], div[contenteditable="true"]');
                const data = Array.from(inputs).map(t => t.value || t.innerText).join('\n\n---\n\n');

                if (data.trim() && data.length > 2) {
                    return { name: 'ChatGPT: Instructions', data, source: 'ChatGPT' };
                }
            }

            // 1.5 Fallback: URL-based check (If selector fails)
            if (window.location.hash.includes('settings')) {
                // Capture any substantial text input on the screen
                const allInputs = document.querySelectorAll('textarea, div[contenteditable="true"]');
                const meaningfulData = Array.from(allInputs)
                    .map(t => t.value || t.innerText)
                    .filter(text => text && text.length > 5) // Filter out small UI bits
                    .join('\n\n---\n\n');

                if (meaningfulData) {
                    return { name: 'ChatGPT: Settings Data', data: meaningfulData, source: 'ChatGPT (Settings)' };
                }
            }

            // 2. Fallback: Capture the latest Assistant response
            // 2. Fallback: Capture Conversation History (Intelligent Slicing)
            const messages = document.querySelectorAll('div[data-message-author-role], .prose, .message-content');
            if (messages.length > 0) {
                let text = "";
                const charLimit = 15000;
                const recent = Array.from(messages).reverse(); // Start from newest

                for (const msg of recent) {
                    const msgText = msg.innerText + '\n\n---\n\n';
                    if ((text.length + msgText.length) > charLimit) break;
                    text = msgText + text; // Prepend to keep chronological
                }

                if (text.length > 20) {
                    return { name: 'ChatGPT: Chat Context', data: text.trim(), source: 'ChatGPT (Chat)' };
                }
            }

            // 3. Fallback: Generic Markdown (if role selector changes)
            const markdownBlocks = document.querySelectorAll('.markdown');
            if (markdownBlocks.length > 0) {
                const recent = Array.from(markdownBlocks).slice(-10);
                const text = recent.map(m => m.innerText).join('\n\n---\n\n');
                return { name: 'ChatGPT: Chat Context', data: text, source: 'ChatGPT (Chat)' };
            }

            return null;
        },

        scrapeClaude() {
            const projectTitle = document.querySelector('h1')?.innerText || 'Claude Project';
            const knowledgeElements = document.querySelectorAll('div');
            let knowledgeBase = "";

            // 1. Try Project Knowledge & Custom Instructions (Project level)
            knowledgeElements.forEach(el => {
                if (el.innerText.includes('Project Knowledge') || el.innerText.includes('Custom Instructions')) {
                    knowledgeBase = el.parentElement.innerText;
                }
            });

            if (knowledgeBase) {
                return { name: `Claude: ${projectTitle} `, data: knowledgeBase, source: 'Claude' };
            }

            // 1.5 Try User Profile / Global Custom Instructions (Settings Modal)
            const modal = document.querySelector('div[role="dialog"]');
            if (modal) {
                const inputs = modal.querySelectorAll('textarea, input[type="text"]');
                const data = Array.from(inputs)
                    .map(t => t.value)
                    .filter(val => val && val.trim().length > 0) // Capture anything non-empty
                    .join('\n\n---\n\n');

                if (data.trim()) {
                    return { name: 'Claude: User Profile', data: data, source: 'Claude (Profile)' };
                }
            }

            // 2. Fallback: Chat Context (Standard Messages)
            // 2. Fallback: Chat Context (Standard Messages)
            // Try multiple known selectors for messages
            const messageSelectors = [
                '.font-claude-message',
                '.font-user-message',
                '[data-test-id="completion-content"]',
                'div[data-testid="user-message"]',
                'div[data-testid="assistant-message"]',
                '.grid.gap-2', // Common wrapper for message bubbles
                '.prose' // Markdown container
            ];

            for (const selector of messageSelectors) {
                const els = document.querySelectorAll(selector);
                if (els.length > 0) {
                    let text = "";
                    const charLimit = 15000;
                    const recent = Array.from(els).reverse();

                    for (const el of recent) {
                        const msgText = el.innerText + '\n\n---\n\n';
                        if ((text.length + msgText.length) > charLimit) break;
                        text = msgText + text;
                    }

                    if (text.length > 10) {
                        return { name: 'Claude: Chat Context', data: text.trim(), source: 'Claude (Chat)' };
                    }
                }
            }

            // 3. Broad Fallback: Capture significant text in main area
            const mainContent = document.querySelector('main') || document.body;
            if (mainContent) {
                // Find significant text blocks
                const allDivs = mainContent.querySelectorAll('div, p');
                let conversation = [];
                let totalLength = 0;

                // Search backwards for meaningful content (Last 10 turns)
                for (let i = allDivs.length - 1; i >= 0; i--) {
                    const txt = allDivs[i].innerText;
                    if (txt && txt.length > 20 && txt.length < 3000) {
                        // Avoid nested duplicates (simple check)
                        const isDuplicate = conversation.some(c => c.includes(txt) || txt.includes(c));

                        if (!isDuplicate && allDivs[i].children.length < 3) {
                            conversation.unshift(txt); // Add to chronological top
                            totalLength += txt.length;
                            if (conversation.length >= 10 || totalLength > 10000) break;
                        }
                    }
                }

                if (conversation.length > 0) {
                    return { name: 'Claude: Chat Context', data: conversation.join('\n\n---\n\n'), source: 'Claude (Chat)' };
                }
            }

            // 4. NUCLEAR OPTION: Capture ANY input on the screen (for Settings/Profile)
            const allInputs = document.querySelectorAll('input:not([type="hidden"]), textarea, div[contenteditable="true"]');
            const inputData = Array.from(allInputs)
                .filter(el => {
                    // Filter out the main chat input to avoid capturing partial drafts
                    return !el.closest('[data-testid="user-message-input"]') && !el.placeholder?.toLowerCase().includes('message claude');
                })
                .map(el => {
                    let label = el.labels && el.labels[0] ? el.labels[0].innerText : "";
                    if (!label) label = el.placeholder;
                    if (!label) label = el.getAttribute('aria-label');
                    if (!label) {
                        // Look for nearby labels or headings if no explicit label exists
                        label = el.closest('div')?.querySelector('h2, h3, label')?.innerText || "";
                    }

                    const val = el.value || el.innerText;
                    if (val && val.trim().length > 5 && val !== "Send Message") {
                        return (label ? `[${label}]: ` : "") + val.trim();
                    }
                    return null;
                })
                .filter(Boolean)
                .join('\n\n');


            if (inputData.length > 0) {
                return { name: 'Claude: Input Data', data: inputData, source: 'Claude (Inputs)' };
            }

            return null;
        },

        scrapeGemini() {
            // 1. AI Studio (System Instructions & Prompt)
            // Look for generic system instruction placeholders and specific AI Studio IDs
            const aiStudioSelectors = [
                'textarea[placeholder*="System instructions"]',
                'textarea[aria-label*="System instructions"]',
                '.system-instructions textarea',
                '#system-instructions-input',
                'textarea[placeholder*="Enter a prompt"]'
            ];

            for (const selector of aiStudioSelectors) {
                const el = document.querySelector(selector);
                if (el && el.value && el.value.length > 10) {
                    return { name: 'Gemini: System Instructions', data: el.value, source: 'Gemini (AI Studio)' };
                }
            }

            // 2. Web UI: "Gems" or "Custom Instructions" equivalents (Modal search)
            const dialogs = document.querySelectorAll('div[role="dialog"], .mat-dialog-container, div[class*="dialog"]');
            for (const dialog of dialogs) {
                const text = dialog.innerText || "";
                if (text.toLowerCase().includes('saved info') || text.toLowerCase().includes('custom instructions') || text.toLowerCase().includes('gem detail')) {
                    // Capture text inputs within the dialog
                    const inputs = dialog.querySelectorAll('textarea, input[type="text"], div[contenteditable="true"]');
                    if (inputs.length > 0) {
                        const data = Array.from(inputs).map(i => i.value || i.innerText).join('\n\n');
                        if (data.trim().length > 10) {
                            return { name: 'Gemini: Custom Context', data, source: 'Gemini' };
                        }
                    }
                }
            }

            // 3. Web UI: Chat History (The active conversation)
            // Gemini uses 'message-content', 'model-response', 'user-query'
            // Added AI Studio specific chat bubble selectors
            const messages = document.querySelectorAll('.message-content, model-response, .query-content, .model-response-text, .user-query, .ms-chat-breakpoint-row, [role="article"], [data-message-id]');

            if (messages.length > 0) {
                let text = "";
                const charLimit = 15000;
                const recent = Array.from(messages).reverse();

                for (const msg of recent) {
                    const msgText = msg.innerText + '\n\n---\n\n';
                    if ((text.length + msgText.length) > charLimit) break;
                    text = msgText + text;
                }

                if (text.length > 20) {
                    return { name: 'Gemini: Chat Context', data: text.trim(), source: 'Gemini (Chat)' };
                }
            }

            // 4. Broad Fallback for Gemini / AI Studio (Capture significant text in main area)
            const chatContainer = document.querySelector('chat-window, .chat-history, main, ms-prompt-view, .prompt-container');
            if (chatContainer) {
                const chunks = Array.from(chatContainer.querySelectorAll('p, li, .text-block, span[role="presentation"]'))
                    .map(el => el.innerText)
                    .filter(t => t && t.length > 30)
                    .slice(-20); // Capture more chunks for context
                if (chunks.length > 0) {
                    return { name: 'Gemini: Discovered Context', data: chunks.join('\n\n'), source: 'Gemini (Crawl)' };
                }
            }

            // 5. FINAL NUCLEAR OPTION: Search for ANY substantial text area in the page
            const allTextAreas = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"]'))
                .map(el => el.value || el.innerText)
                .filter(t => t && t.length > 50)
                .join('\n\n---\n\n');

            if (allTextAreas.length > 20) {
                return { name: 'Gemini: Text Blocks', data: allTextAreas, source: 'Gemini (Deep Check)' };
            }

            return null;
        },

        scrapePerplexity() {
            // 1. Thread Title
            const title = document.querySelector('h1')?.innerText || 'Perplexity Search';

            // 2. Chat History
            const messages = document.querySelectorAll('.prose, .break-words, .text-textMain, [data-testid="thread-chat-message"]');
            if (messages.length > 0) {
                const text = Array.from(messages).slice(-15).map(m => m.innerText).join('\n\n---\n\n');
                return { name: `Perplexity: ${title}`, data: text, source: 'Perplexity' };
            }

            return null;
        },

        scrapeGrok() {
            // 1. Customization Modal
            const modal = document.querySelector('div[role="dialog"]');
            if (modal && (modal.textContent.includes('Customize') || modal.textContent.includes('Custom Instructions'))) {
                const inputs = modal.querySelectorAll('textarea, input[type="text"]');
                const data = Array.from(inputs).map(i => i.value || i.innerText).join('\n\n');
                if (data.trim()) {
                    return { name: 'Grok: Customizations', data, source: 'Grok' };
                }
            }

            // 2. Chat History
            const messages = document.querySelectorAll('div[class*="message"], .chat-line, [data-testid="message-row"]');
            if (messages.length > 0) {
                const text = Array.from(messages).slice(-15).map(m => m.innerText).join('\n\n---\n\n');
                return { name: 'Grok: Chat Context', data: text, source: 'Grok (Chat)' };
            }

            return null;
        },

        scrapeDeepSeek() {
            // 1. Templates/Instructions
            const textareas = document.querySelectorAll('textarea');
            for (const ta of textareas) {
                if (ta.placeholder.includes('template') || ta.placeholder.includes('instruction')) {
                    if (ta.value.length > 10) {
                        return { name: 'DeepSeek: Template', data: ta.value, source: 'DeepSeek' };
                    }
                }
            }

            // 2. Chat History
            const messages = document.querySelectorAll('.ds-markdown, .ds-message-row, .chat-message, [class*="message-content"]');
            if (messages.length > 0) {
                const text = Array.from(messages).slice(-10).map(m => m.innerText).join('\n\n---\n\n');
                return { name: 'DeepSeek: Chat Context', data: text, source: 'DeepSeek (Chat)' };
            }

            return null;
        },

        scrapeCopilot() {
            // 1. Standalone Copilot (copilot.microsoft.com/chats) - HEAVY Shadow DOM
            const serp = document.querySelector('cib-serp');
            if (serp) {
                try {
                    // Navigate the shadow tree for Standalone Copilot
                    const conversation = serp.shadowRoot?.querySelector('cib-conversation');
                    const turns = conversation?.shadowRoot?.querySelectorAll('cib-chat-turn');

                    if (turns && turns.length > 0) {
                        let text = "";
                        const recent = Array.from(turns).slice(-8); // Last 8 turns

                        recent.forEach(turn => {
                            // Each turn has user/assistant messages in more shadows
                            const response = turn.shadowRoot?.querySelector('cib-message-group[source="bot"]');
                            const userMsg = turn.shadowRoot?.querySelector('cib-message-group[source="user"]');

                            if (userMsg) text += `[User]: ${userMsg.innerText}\n`;
                            if (response) text += `[Copilot]: ${response.innerText}\n`;
                            text += "---\n";
                        });

                        if (text.trim().length > 20) {
                            return { name: 'Copilot: Conversation', data: text.trim(), source: 'Copilot (Deep)' };
                        }
                    }
                } catch (e) {
                }
            }

            // 2. Fallback: Search for known selectors in global space (or shallow shadows)
            const messages = document.querySelectorAll('.ac-textBlock, [data-testid="copilot-message"], .message-content, .font-claude-message');
            if (messages.length > 0) {
                const text = Array.from(messages).slice(-10).map(m => m.innerText).join('\n\n---\n\n');
                return { name: 'Copilot: Chat Context', data: text, source: 'Copilot' };
            }

            // 3. NUCLEAR FALLBACK: Traverse ALL Shadow Roots for code + text
            const shadowText = this._crawlShadows(document.body);
            if (shadowText && shadowText.length > 100) {
                return { name: 'Copilot: Discovered Data', data: shadowText, source: 'Copilot (Crawl)' };
            }

            return null;
        },

        // Helper to crawl all shadow roots recursively
        _crawlShadows(root, depth = 0) {
            if (depth > 15) return ""; // Safety limit
            let results = "";

            // 1. Get text from current root
            const items = Array.from(root.querySelectorAll('p, li, code, pre, span, div[role="presentation"]'));
            const meaningful = items
                .filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                })
                .map(el => el.innerText)
                .filter(t => t && t.trim().length > 40) // Only substantial lines
                .join('\n');

            if (meaningful) results += meaningful + "\n";

            // 2. Recurse into children's shadow roots
            const allElements = root.querySelectorAll('*');
            for (const el of allElements) {
                if (el.shadowRoot) {
                    results += this._crawlShadows(el.shadowRoot, depth + 1);
                }
            }

            return results;
        },

        // Private helper to strip residual HTML
        _sanitize(text) {
            if (!text) return "";
            return text.replace(/<[^>]*>?/gm, ''); // Simple tag stripping
        },

        // v2.6: Smart Snippet Extraction
        getSmartSnippets(data) {
            if (!data) return [];

            const snippets = [];

            // 1. Extract Code Blocks (The highest value snippet)
            const codeMatch = data.match(/```[\s\S]*?```/g);
            if (codeMatch) {
                codeMatch.forEach(block => {
                    snippets.push({ type: 'code', content: block.trim() });
                });
            }

            // 2. Extract Logic / Instructions (Lines starting with -, *, or starting with "Always"/"Never")
            const lines = data.split('\n');
            const instructions = lines
                .filter(l => l.trim().match(/^[-*•]/) || l.trim().match(/^(Always|Never|Prefer|Constraint|Stack)/i))
                .join('\n');

            if (instructions.trim()) {
                snippets.push({ type: 'logic', content: instructions.trim() });
            }

            return snippets;
        },

        // v2.0: Smart Context (RAG-lite) Matcher
        suggestContext(prompt, packs) {
            const sanitized = this._sanitize(prompt);
            if (!sanitized || !packs || packs.length === 0) return null;

            const words = sanitized.toLowerCase().split(/\W+/);
            const scores = packs.map(pack => {
                let score = 0;
                const contextText = (pack.name + " " + pack.desc + " " + (pack.data || "")).toLowerCase();

                words.forEach(word => {
                    if (word.length < 3) return;
                    if (contextText.includes(word)) score++;
                });

                return { pack, score };
            });

            // Return the highest scoring pack if score > 0
            const best = scores.sort((a, b) => b.score - a.score)[0];
            return (best && best.score > 0) ? best.pack : null;
        },

        // Alias for backward compatibility
        async capture() {
            return this.scrape();
        }
    };
}
