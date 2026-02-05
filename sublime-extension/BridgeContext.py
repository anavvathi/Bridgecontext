import sublime
import sublime_plugin
import json
import os

class BridgeContextCommand(sublime_plugin.TextCommand):
    """
    Command to inject context from BridgeContext.
    """
    def run(self, edit):
        # We assume the project root contains native-host/exchange.json
        # In a real plugin, this would be configurable
        folders = self.view.window().folders()
        if not folders:
            sublime.error_message("BridgeContext: Please open a project folder first.")
            return

        exchange_path = os.path.join(folders[0], "native-host", "exchange.json")
        
        if not os.path.exists(exchange_path):
            sublime.status_message("BridgeContext: No exchange file found.")
            return

        try:
            with open(exchange_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            context_data = data.get('data', '')
            if not context_data:
                sublime.status_message("BridgeContext: Exchange file is empty.")
                return

            # Insert at cursor(s)
            for region in self.view.sel():
                self.view.insert(edit, region.begin(), context_data)
            
            sublime.message_dialog(f"🌉 BridgeContext: Injected context from '{data.get('name')}'")
        
        except Exception as e:
            sublime.error_message(f"BridgeContext Error: {str(e)}")

class BridgeContextListener(sublime_plugin.EventListener):
    """
    Monitor the exchange file (Simple version: on file activation)
    """
    def on_activated(self, view):
        # We could use a proper file watcher here, but ST's API is limited.
        # Most ST users prefer manual triggers.
        pass
