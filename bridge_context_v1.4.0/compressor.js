/* BridgeContext: Fact Compressor (MVP)
   Uses heuristics to separate "Signal" (User constraints, Technical facts) from "Noise" (Conversational filler).
*/

if (typeof Compressor === 'undefined') {
    var Compressor = {
        // Keywords that indicate a constraint or preference
        signals: [
            "always", "never", "prefer", "use", "constraint", "project",
            "stack", "database", "key", "password", "secret", "token",
            "i am", "my role", "the goal", "objective", "requirement",
            "coding standard", "styleguide", "workflow", "process"
        ],

        // Phrases indicating conversational fluff
        noise: [
            "hello", "hi", "thanks", "thank you", "great", "cool",
            "can you", "please", "help me", "write a", "ignore previous",
            "ok", "understand", "sure", "got it"
        ],

        process(text) {
            if (!text) return "";

            const lines = text.split('\n');
            const facts = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.length < 10) continue; // Skip short lines

                // Check for signal
                const isSignal = this.signals.some(keyword => trimmed.toLowerCase().includes(keyword));
                const isNoise = this.noise.some(keyword => trimmed.toLowerCase().startsWith(keyword));

                if (isSignal && !isNoise) {
                    facts.push(trimmed);
                }
            }

            // Return compressed text or original if compression failed
            return facts.length > 0 ? facts.join('\n') : text;
        }
    };
    window.Compressor = Compressor;
}
