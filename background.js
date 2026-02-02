// Background service worker for BridgeContext
chrome.runtime.onInstalled.addListener(() => {
});

// Listening for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ping") {
        sendResponse({ status: "alive" });
    }
});

// v1.3: Command (Hotkey) Support
chrome.commands.onCommand.addListener(async (command) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    if (command === "trigger_bridge") {
        chrome.tabs.sendMessage(tab.id, { action: "hotkey_bridge" });
    } else if (command === "trigger_inject") {
        chrome.tabs.sendMessage(tab.id, { action: "hotkey_inject" });
    }
});
