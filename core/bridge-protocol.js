/**
 * BridgeContext Core Protocol v1.0.0
 * Standardizes the data structure for Context Packs across Browser and IDE.
 */

const BridgeProtocol = {
    VERSION: '1.0.0',

    /**
     * Creates a standardized Context Pack object.
     */
    createPack(name, desc, data, source = 'Unknown') {
        return {
            id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: name || 'Untitled Pack',
            desc: desc || 'No description provided',
            data: data || '',
            source: source,
            timestamp: Date.now(),
            version: this.VERSION
        };
    },

    /**
     * Validates a Context Pack object.
     */
    isValid(pack) {
        return pack &&
            typeof pack.name === 'string' &&
            typeof pack.data === 'string' &&
            pack.version === this.VERSION;
    }
};

if (typeof module !== 'undefined') {
    module.exports = BridgeProtocol;
}
