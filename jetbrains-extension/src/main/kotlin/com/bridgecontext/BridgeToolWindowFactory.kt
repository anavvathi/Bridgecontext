package com.bridgecontext

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefJSQuery
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.application.ApplicationManager
import java.io.File
import java.nio.file.FileSystems
import java.nio.file.Path
import java.nio.file.StandardWatchEventKinds
import java.nio.file.WatchKey
import java.nio.file.WatchService
import javax.swing.JComponent

class BridgeToolWindowFactory : ToolWindowFactory {
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val browser = JBCefBrowser()
        val query = JBCefJSQuery.create(browser)
        
        // Inject callback for "Inject into Code"
        query.addHandler { text ->
            ApplicationManager.getApplication().invokeLater {
                val editor = EditorFactory.getInstance().allEditors.firstOrNull { it.project == project }
                if (editor != null) {
                    WriteCommandAction.runWriteCommandAction(project) {
                        val document = editor.document
                        val selectionModel = editor.selectionModel
                        val offset = selectionModel.selectionStart
                        document.insertString(offset, text)
                    }
                }
            }
            null
        }

        // Setup the UI
        val content = ContentFactory.getInstance().createContent(browser.component, "", false)
        toolWindow.contentManager.addContent(content)

        // Load content and start watcher
        val exchangePath = project.basePath + "/../native-host/exchange.json"
        loadBridgeContent(browser, exchangePath)
        startWatching(browser, exchangePath)
    }

    private fun loadBridgeContent(browser: JBCefBrowser, path: String) {
        val file = File(path)
        if (file.exists()) {
            val json = file.readText()
            // We reuse the VS Code HTML logic here
            val html = generateHtml(json)
            browser.loadHTML(html)
        } else {
            browser.loadHTML("<html><body><div style='text-align:center; padding:20px; opacity:0.5;'>Waiting for context...</div></body></html>")
        }
    }

    private fun startWatching(browser: JBCefBrowser, path: String) {
        ApplicationManager.getApplication().executeOnPooledThread {
            val file = File(path)
            val parent = file.parentFile ?: return@executeOnPooledThread
            val watchService = FileSystems.getDefault().newWatchService()
            parent.toPath().register(watchService, StandardWatchEventKinds.ENTRY_MODIFY)

            while (true) {
                val key = watchService.take()
                for (event in key.pollEvents()) {
                    if (event.context().toString() == file.name) {
                        ApplicationManager.getApplication().invokeLater {
                            loadBridgeContent(browser, path)
                        }
                    }
                }
                key.reset()
            }
        }
    }

    private fun generateHtml(json: String): String {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    :root {
                        --bg: #1e1e1e; --fg: #cccccc; --card-bg: #252526; --border: #333333; --accent: #007acc; --accent-fg: #ffffff;
                    }
                    /* Simple JetBrains-like theme detection / variables */
                    body { font-family: 'Inter', sans-serif; padding: 12px; background: var(--bg); color: var(--fg); margin: 0; }
                    .card { border: 1px solid var(--border); padding: 12px; border-radius: 4px; background: var(--card-bg); margin-bottom: 12px; transition: transform 0.1s; }
                    .title { font-weight: bold; margin-bottom: 6px; color: var(--accent); font-size: 1.1em; }
                    .desc { font-size: 0.9em; opacity: 0.8; margin-bottom: 12px; line-height: 1.4; }
                    button { background: var(--accent); color: var(--accent-fg); border: none; padding: 8px 12px; cursor: pointer; width: 100%; border-radius: 3px; font-weight: 500; }
                    button:hover { filter: brightness(1.2); }
                    .empty { text-align: center; padding: 40px 20px; opacity: 0.5; font-style: italic; }
                </style>
            </head>
            <body>
                <div id="content"></div>
                <script>
                    const message = $json;
                    const container = document.getElementById('content');
                    
                    function render() {
                        if (!message || !message.name) {
                            container.innerHTML = '<div class="empty">Waiting for context...</div>';
                            return;
                        }
                        
                        container.innerHTML = '';
                        const card = document.createElement('div');
                        card.className = 'card';
                        
                        const title = document.createElement('div');
                        title.className = 'title';
                        title.textContent = message.name;
                        
                        const desc = document.createElement('div');
                        desc.className = 'desc';
                        desc.textContent = message.desc;
                        
                        const btn = document.createElement('button');
                        btn.textContent = 'Inject into Code';
                        btn.onclick = () => {
                            if (window.cefQuery) {
                                window.cefQuery({ request: message.data });
                            }
                        };
                        
                        card.appendChild(title);
                        card.appendChild(desc);
                        card.appendChild(btn);
                        container.appendChild(card);
                    }
                    
                    render();
                </script>
            </body>
            </html>
        """.trimIndent()
    }
}
