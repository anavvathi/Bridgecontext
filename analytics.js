// BridgeContext Analytics Module v1.5.0

const Analytics = {
    async trackContextSaved(pack) {
        const stats = await this.getStats();
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        if (!stats.monthlyContexts[currentMonth]) {
            stats.monthlyContexts[currentMonth] = 0;
        }
        stats.monthlyContexts[currentMonth]++;

        stats.totalContextsSaved++;
        stats.lastSaved = Date.now();

        // Track tags
        if (pack.tags && pack.tags.length > 0) {
            pack.tags.forEach(tag => {
                if (!stats.tagUsage[tag]) {
                    stats.tagUsage[tag] = 0;
                }
                stats.tagUsage[tag]++;
            });
        }

        await this.saveStats(stats);
    },

    async getStats() {
        const defaultStats = {
            totalContextsSaved: 0,
            monthlyContexts: {},
            tagUsage: {},
            lastSaved: null,
            firstUsed: Date.now()
        };

        const stats = await StorageLocal.get('analytics_stats');
        return stats || defaultStats;
    },

    async saveStats(stats) {
        await StorageLocal.set('analytics_stats', stats);
    },

    async getCurrentMonthCount() {
        const stats = await this.getStats();
        const currentMonth = new Date().toISOString().slice(0, 7);
        return stats.monthlyContexts[currentMonth] || 0;
    },

    async getMostUsedTags(limit = 5) {
        const stats = await this.getStats();
        const tagEntries = Object.entries(stats.tagUsage);
        tagEntries.sort((a, b) => b[1] - a[1]);
        return tagEntries.slice(0, limit);
    },

    async calculateTimeSaved() {
        const stats = await this.getStats();
        // Estimate: Each context reuse saves ~5 minutes of re-explaining
        const minutesSaved = stats.totalContextsSaved * 5;
        const hoursSaved = Math.floor(minutesSaved / 60);
        return { minutesSaved, hoursSaved };
    },

    async getUsageSummary() {
        const stats = await this.getStats();
        const currentMonthCount = await this.getCurrentMonthCount();
        const mostUsedTags = await this.getMostUsedTags(3);
        const timeSaved = await this.calculateTimeSaved();

        return {
            totalContexts: stats.totalContextsSaved,
            thisMonth: currentMonthCount,
            mostUsedTags: mostUsedTags.map(([tag, count]) => ({ tag, count })),
            timeSaved: timeSaved.hoursSaved,
            daysSinceFirstUse: Math.floor((Date.now() - stats.firstUsed) / (1000 * 60 * 60 * 24))
        };
    },

    formatSummaryText(summary) {
        let text = `📊 Your BridgeContext Stats\\n\\n`;
        text += `Total Contexts: ${summary.totalContexts}\\n`;
        text += `This Month: ${summary.thisMonth}\\n`;

        if (summary.mostUsedTags.length > 0) {
            text += `\\nMost Used Tags:\\n`;
            summary.mostUsedTags.forEach(({ tag, count }) => {
                text += `  • ${tag} (${count}x)\\n`;
            });
        }

        text += `\\nTime Saved: ~${summary.timeSaved} hours\\n`;
        text += `Days Active: ${summary.daysSinceFirstUse}`;

        return text;
    }
};

// Make Analytics available globally
if (typeof window !== 'undefined') {
    window.BridgeAnalytics = Analytics;
}
