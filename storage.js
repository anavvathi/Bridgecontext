// Storage utility for BridgeContext v1.3.0

if (typeof StorageLocal === 'undefined') {
    var StorageLocal = {
        async get(key) {
            return new Promise((resolve) => {
                if (!chrome.runtime || !chrome.runtime.id) {
                    console.warn("BridgeContext: Context invalidated.");
                    return resolve(null);
                }
                try {
                    chrome.storage.local.get([key], (result) => {
                        if (chrome.runtime.lastError) return resolve(null);
                        resolve(result ? result[key] : null);
                    });
                } catch (e) {
                    resolve(null);
                }
            });
        },

        async set(key, value) {
            return new Promise((resolve) => {
                if (!chrome.runtime || !chrome.runtime.id) {
                    return resolve();
                }
                try {
                    chrome.storage.local.set({ [key]: value }, () => {
                        resolve();
                    });
                } catch (e) {
                    resolve();
                }
            });
        },

        async getExpertPacks() {
            return [
                {
                    id: 'exp_arch',
                    name: '🏗️ System Architect',
                    desc: 'Scalability, Performance & Redundancy Expert.',
                    data: 'You are a Senior System Architect. Evaluate all code and systems for scalability, performance, and redundancy. Use professional technical standards (ISO, IEEE). Identify single points of failure.'
                },
                {
                    id: 'exp_api',
                    name: '🔌 API Master',
                    desc: 'REST/GraphQL Security & Validation specialist.',
                    data: 'You are a Lead API Engineer. Focus on secure endpoints, robust input validation, error handling, and appropriate HTTP status codes. Prioritize OpenAPI/Swagger documentation.'
                },
                {
                    id: 'exp_growth',
                    name: '📈 Growth Storyteller',
                    desc: 'Enterprise depth meets Digital Culture (v2026).',
                    data: 'You are a Growth Marketing Expert. Bridge enterprise storytelling with trending digital culture. Help me craft narratives that humanize technical products for a 2026 audience.'
                },
                {
                    id: 'exp_ux',
                    name: '🧠 UX Psychology Critic',
                    desc: 'UI/UX design with a focus on human behavior.',
                    data: 'You are a UX Researcher. Analyze designs based on cognitive load, Gestalt principles, and user psychology. Help me iterate on wireframes to reduce friction and improve retention.'
                },
                {
                    id: 'exp_pitch',
                    name: '💎 VC Pitch Surgeon',
                    desc: 'Funding-ready PRDs and Market Gap analysis.',
                    data: 'You are a Venture Capital Consultant. Help me refine my product pitch by identifying unmet customer needs and market gaps. Focus on ROI, TAM/SAM/SOM, and defensible moats.'
                },
                {
                    id: 'exp_audit',
                    name: '⚖️ Privacy & Ethics Auditor',
                    desc: 'AI Accountability and GDPR/DPA compliance.',
                    data: 'You are an AI Compliance Auditor. Ensure all data handling and AI outputs meet strict privacy, accountability, and ethical standards. Redact sensitive info proactively.'
                },
                {
                    id: 'exp_1',
                    name: '🚀 SaaS Legal Pro',
                    desc: 'DPA, Terms of Service, and GDPR compliance expert.',
                    data: 'You are a legal expert specialized in SaaS compliance. Use formal, precise language. Focus on GDPR and DPA alignment.'
                },
                {
                    id: 'exp_2',
                    name: '💻 Senior Python Dev',
                    desc: 'Clean code, PEP8, and performance optimization.',
                    data: 'You are a Senior Python Developer. Prioritize readability, PEP8 standards, and type hinting. Always include docstrings.'
                }
            ];
        },

        async getAllPacks() {
            let packs = await this.get('context_packs') || [];
            const experts = await this.getExpertPacks();

            // Merge custom packs with expert personalities
            // We prepend experts to make them easily discoverable
            return [...experts, ...packs];
        },

        // Team Features (Mock)
        async getTeamPacks() {
            // Simulated "Acme Engineering" Team Packs
            return [
                {
                    id: 'team_1',
                    name: '🔒 Security Guidelines',
                    desc: 'Official company security policies for LLM usage.',
                    data: 'Always sanitize inputs. Never commit API keys. Use internal VPN for database access.',
                    is_team: true
                },
                {
                    id: 'team_2',
                    name: '⚛️ React Style Guide',
                    desc: 'Company standard for hooks and functional components.',
                    data: 'Use functional components. Prefer hooks over HOCs. Use styled-components for CSS.',
                    is_team: true
                }
            ];
        },

        async savePack(pack) {
            const packs = await this.getAllPacks();
            const existingIndex = packs.findIndex(p => p.id === pack.id);

            // Mark as synced if user is logged in
            const user = await this.get('user_profile');
            if (user) {
                pack.synced = true;
            }

            if (existingIndex > -1) {
                packs[existingIndex] = pack;
            } else {
                const newPack = {
                    ...pack,
                    id: pack.id || Date.now().toString()
                };
                packs.push(newPack);

                // Set as active bridge for the Migrator feature
                await this.setActiveBridge(newPack);
            }

            await this.set('context_packs', packs);
            await this.autoCleanup();
        },

        async deletePack(packId) {
            const packs = await this.getAllPacks();
            const filteredPacks = packs.filter(p => p.id !== packId);
            await this.set('context_packs', filteredPacks);
        },

        async updateLastUsed(id) {
            let packs = await this.getAllPacks();
            const pack = packs.find(p => p.id === id);
            if (pack) {
                pack.lastUsed = Date.now();
                await this.set('context_packs', packs);
            }
        },

        async autoCleanup() {
            const packs = await this.getAllPacks();
            const STORAGE_LIMIT = 4.5 * 1024 * 1024; // ~4.5MB (Leave buffer for other keys)

            let currentSize = JSON.stringify(packs).length;
            if (currentSize > STORAGE_LIMIT) {
                // Clean up old expert copies if storage pressure detected
                packs = packs.filter(p => !p.id.startsWith('exp_') || (Date.now() - parseInt(p.id) < 86400000 * 30));
                // Keep the 50 newest packs or those under the limit
                const cleaned = packs.slice(0, 50);
                await this.set('context_packs', cleaned);
            }
        },

        async setActiveBridge(pack) {
            await this.set('active_bridge', {
                id: pack.id,
                name: pack.name,
                data: pack.data,
                timestamp: Date.now()
            });
        },

        async getActiveBridge() {
            return await this.get('active_bridge');
        },

        // Cloud / Universal Clipboard Logic
        async getUser() {
            return await this.get('user_profile');
        },

        async login(username) {
            // Simulate API call
            const user = { id: 'usr_' + Date.now(), name: username, plan: 'free' };
            await this.set('user_profile', user);
            return user;
        },

        async logout() {
            await this.set('user_profile', null);
        },

        // Simulated Sync: Push local changes, Pull remote changes
        async sync() {
            return new Promise(async (resolve) => {
                const packs = await this.getAllPacks();

                // 1. PUSH: Mark all as synced
                packs.forEach(p => p.synced = true);

                // 2. PULL: Simulate receiving a "Remote" pack from another device
                // Only add if it doesn't exist yet
                if (!packs.find(p => p.id === 'remote_pack_1')) {
                    packs.push({
                        id: 'remote_pack_1',
                        name: '📱 Mobile Notes',
                        desc: 'Synced from BridgeContext Mobile App',
                        data: 'This is a test note captured on iPhone.',
                        synced: true
                    });
                }

                // Save and simulate network delay
                setTimeout(async () => {
                    await this.set('context_packs', packs);
                    resolve(packs);
                }, 600); // 0.6s optimized latency
            });
        },

        // --- v1.3: Production Security Layer (Web Crypto API - AES-GCM) ---
        async _getKey(password, salt) {
            const enc = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                "raw",
                enc.encode(password),
                "PBKDF2",
                false,
                ["deriveBits", "deriveKey"]
            );
            return await crypto.subtle.deriveKey(
                {
                    name: "PBKDF2",
                    salt: enc.encode(salt || "bridge-default-salt"),
                    iterations: 100000,
                    hash: "SHA-256"
                },
                keyMaterial,
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );
        },

        async encryptPack(data, password) {
            if (!password) return data;
            try {
                const enc = new TextEncoder();
                const iv = crypto.getRandomValues(new Uint8Array(12));
                const key = await this._getKey(password);
                const encrypted = await crypto.subtle.encrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    enc.encode(data)
                );

                // Combine IV + Encrypted Data
                const result = new Uint8Array(iv.length + encrypted.byteLength);
                result.set(iv, 0);
                result.set(new Uint8Array(encrypted), iv.length);

                // Return as Base64 with prefix
                const b64 = btoa(String.fromCharCode.apply(null, result));
                return `[AES-GCM]:${b64}`;
            } catch (e) {
                console.error("Encryption failed:", e);
                return data;
            }
        },

        async decryptPack(encryptedData, password) {
            if (!password || !encryptedData.startsWith('[AES-GCM]:')) return encryptedData;
            try {
                const b64 = encryptedData.replace('[AES-GCM]:', '');
                const combined = new Uint8Array(atob(b64).split("").map(c => c.charCodeAt(0)));

                const iv = combined.slice(0, 12);
                const data = combined.slice(12);
                const key = await this._getKey(password);

                const decrypted = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv },
                    key,
                    data
                );

                return new TextDecoder().decode(decrypted);
            } catch (e) {
                console.warn("Decryption failed. Incorrect password?");
                return null; // Return null to indicate failure
            }
        },

        encodePack(pack) {
            const data = JSON.stringify({ n: pack.name, d: pack.desc, c: pack.data });
            // v1.4.1: Support for UTF-8 (emojis/special chars) in Base64
            return btoa(unescape(encodeURIComponent(data)));
        },

        decodeCode(code) {
            try {
                // v1.3: Support for Shared Bridge Codes
                let cleanCode = code;
                if (code.startsWith('BC_SHARE:')) {
                    cleanCode = code.replace('BC_SHARE:', '');
                }

                const decoded = JSON.parse(decodeURIComponent(escape(atob(cleanCode))));
                return {
                    name: decoded.n,
                    desc: decoded.d,
                    data: decoded.c,
                    source: 'Shared Bridge'
                };
            } catch (e) {
                console.error("BridgeContext: Invalid Bridge Code", e);
                return null;
            }
        }
    };
}
