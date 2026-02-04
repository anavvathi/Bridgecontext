/* BridgeContext: Privacy Guard v1.0
   Lightweight regex-based redaction to prevent accidental storage of sensitive data.
*/

if (typeof Sanitizer === 'undefined') {
    var Sanitizer = {
        patterns: {
            // Email addresses
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,

            // API Keys (General patterns)
            genericKey: /(?:key|secret|token|password|auth|api)[-_]?[=:]\s*["']?([a-zA-Z0-9]{16,})["']?/gi,

            // Specific Platform Patterns
            openai: /sk-[a-zA-Z0-9]{32,}/g,
            github: /ghp_[a-zA-Z0-9]{36}/g,

            // Phone numbers (Basic international/domestic)
            phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
        },
        
        redact(text) {
            if (!text) return "";
            let cleaned = text;

            // 1. Redact platform-specific keys
            cleaned = cleaned.replace(this.patterns.openai, "[OPENAI_KEY_REDACTED]");
            cleaned = cleaned.replace(this.patterns.github, "[GITHUB_KEY_REDACTED]");

            // 2. Redact general keys/secrets
            cleaned = cleaned.replace(this.patterns.genericKey, (match, p1) => {
                return match.replace(p1, "********");
            });

            // 3. Redact Emails
            cleaned = cleaned.replace(this.patterns.email, "[EMAIL_REDACTED]");

            // 4. Redact Phone Numbers
            cleaned = cleaned.replace(this.patterns.phone, "[PHONE_REDACTED]");

            return cleaned;
        }
    };
    window.Sanitizer = Sanitizer;
}
