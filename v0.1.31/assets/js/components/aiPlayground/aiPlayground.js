class AIPlayground extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentMode = 'repo-explorer'; // Default mode
        this.isLoading = false;
    }

    connectedCallback() {
        this.render();
        this.initEventListeners();
    }

    static get observedAttributes() {
        return ['mode'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'mode' && oldValue !== newValue) {
            this.currentMode = newValue;
            this.render();
            this.initEventListeners();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/assets/css/components/aiPlayground/aiPlayground.css">
            <div class="ai-playground-container">
                <header class="playground-header">
                    <h1>AI Playground</h1>
                    <nav class="playground-nav">
                        <button data-mode="repo-explorer" class="${this.currentMode === 'repo-explorer' ? 'active' : ''}">Repository Explorer</button>
                        <button data-mode="scene-creator" class="${this.currentMode === 'scene-creator' ? 'active' : ''}">Scene Creator</button>
                        <button data-mode="code-assistant" class="${this.currentMode === 'code-assistant' ? 'active' : ''}">Code Assistant</button>
                    </nav>
                </header>
                <main class="playground-main">
                    ${this.isLoading ? '<div class="loader">Loading...</div>' : this.getCurrentModeTemplate()}
                </main>
                <footer class="playground-footer">
                    <p>Powered by OpenAI &bull; Ensure your API key is configured server-side.</p>
                </footer>
            </div>
        `;
    }

    initEventListeners() {
        this.shadowRoot.querySelectorAll('.playground-nav button').forEach(button => {
            button.addEventListener('click', (e) => {
                const newMode = e.target.dataset.mode;
                if (newMode !== this.currentMode) {
                    this.setAttribute('mode', newMode);
                }
            });
        });

        // Add mode-specific event listeners
        if (this.currentMode === 'repo-explorer') {
            this.initRepoExplorerListeners();
        } else if (this.currentMode === 'scene-creator') {
            this.initSceneCreatorListeners();
        } else if (this.currentMode === 'code-assistant') {
            this.initCodeAssistantListeners();
        }
    }

    getCurrentModeTemplate() {
        switch (this.currentMode) {
            case 'repo-explorer':
                return '<div id="repo-explorer-content"><p>Repository Explorer Mode</p><!-- Repo explorer UI will be loaded here --></div>';
            case 'scene-creator':
                return '<div id="scene-creator-content"><p>Scene Creator Mode</p><!-- Scene creator UI will be loaded here --></div>';
            case 'code-assistant':
                return '<div id="code-assistant-content"><p>Code Assistant Mode</p><!-- Code assistant UI will be loaded here --></div>';
            default:
                return '<p>Select a mode to begin.</p>';
        }
    }

    async fetchTemplate(templatePath, targetElementId) {
        this.isLoading = true;
        this.render(); // Re-render to show loader

        try {
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.statusText}`);
            }
            const templateHTML = await response.text();
            const targetElement = this.shadowRoot.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = templateHTML;
            } else {
                console.error(\`Target element \${targetElementId} not found.\`);
            }
        } catch (error) {
            console.error(\`Error fetching template \${templatePath}:\`, error);
            const targetElement = this.shadowRoot.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = \`<p class="error-message">Error loading content. Please try again later.</p>\`;
            }
        } finally {
            this.isLoading = false;
            this.render(); // Re-render to remove loader and show content/error
        }
    }

    // --- Repository Explorer ---
    initRepoExplorerListeners() {
        this.fetchTemplate('/assets/templates/repo-explorer.html', 'repo-explorer-content').then(() => {
            const analyzeButton = this.shadowRoot.getElementById('analyzeRepoButton');
            if (analyzeButton) {
                analyzeButton.addEventListener('click', () => this.handleRepoAnalysis());
            }
        });
    }

    async handleRepoAnalysis() {
        const repoSelect = this.shadowRoot.getElementById('repoSelect');
        const insightTypes = this.shadowRoot.querySelectorAll('input[name="insightType"]:checked');
        const resultsDiv = this.shadowRoot.getElementById('repoResults');

        if (!repoSelect || !repoSelect.value) {
            resultsDiv.innerHTML = '<p class="error-message">Please select a repository.</p>';
            return;
        }
        if (insightTypes.length === 0) {
            resultsDiv.innerHTML = '<p class="error-message">Please select at least one insight type.</p>';
            return;
        }

        const selectedRepo = repoSelect.value;
        const selectedInsights = Array.from(insightTypes).map(cb => cb.value);

        resultsDiv.innerHTML = '<div class="loader-small">Analyzing...</div>';
        this.isLoading = true; // Potentially use a more granular loading state

        try {
            // TODO: Replace with actual API call to backend endpoint defined in open_ai_page_profile.json ("apiEndpoints": {"repoAnalysis": "/api/ai/repo-analysis"})
            const response = await fetch('/api/ai/repo-analysis', { // This endpoint needs to be implemented on your server
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ repository: selectedRepo, insights: selectedInsights })
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json();
            resultsDiv.innerHTML = this.formatRepoResults(data);
        } catch (error) {
            console.error('Repository analysis error:', error);
            resultsDiv.innerHTML = `<p class="error-message">Error analyzing repository: ${error.message}</p>`;
        } finally {
            this.isLoading = false;
        }
    }

    formatRepoResults(data) {
        // Based on "repoExplorerFeature.resultDisplay" in profile
        let html = '<h3>Analysis Results</h3>';
        if (data.summary) html += `<h4>Summary</h4><p>${data.summary}</p>`;
        if (data.details) html += `<h4>Details</h4><div>${data.details}</div>`; // Assuming details might be HTML or Markdown
        if (data.codeExamples && data.codeExamples.length > 0) {
            html += '<h4>Code Examples</h4>';
            data.codeExamples.forEach(ex => {
                html += \`<pre><code>${ex.code}</code></pre><p>${ex.description}</p>\`;
            });
        }
        if (data.recommendations && data.recommendations.length > 0) {
            html += '<h4>Recommendations</h4><ul>';
            data.recommendations.forEach(rec => {
                html += \`<li>${rec}</li>\`;
            });
            html += '</ul>';
        }
        return html || '<p>No results to display.</p>';
    }

    // --- Scene Creator ---
    initSceneCreatorListeners() {
         this.fetchTemplate('/assets/templates/scene-creator.html', 'scene-creator-content').then(() => {
            const generateButton = this.shadowRoot.getElementById('generateSceneButton');
            if (generateButton) {
                generateButton.addEventListener('click', () => this.handleSceneGeneration());
            }
            // Initialize CodeMirror or other editor if specified in profile for the code editor
            // this.initializeCodeEditor('sceneCodeEditor');
        });
    }
    
    // Placeholder for initializing a code editor like CodeMirror
    // initializeCodeEditor(elementId, initialContent = '') {
    //     const textArea = this.shadowRoot.getElementById(elementId);
    //     if (textArea && typeof CodeMirror !== 'undefined') {
    //         this.editor = CodeMirror.fromTextArea(textArea, {
    //             lineNumbers: true,
    //             mode: 'javascript', // Or based on scene type
    //             theme: 'material-darker', // Or from profile
    //             // ... other configurations
    //         });
    //         this.editor.setValue(initialContent);
    //     } else if (textArea) {
    //         textArea.value = initialContent; // Fallback to textarea
    //     }
    // }

    async handleSceneGeneration() {
        const descriptionInput = this.shadowRoot.getElementById('sceneDescription');
        const codeEditor = this.shadowRoot.getElementById('sceneCodeEditor'); // Or this.editor if using CodeMirror
        const previewFrame = this.shadowRoot.getElementById('scenePreviewFrame');
        const resultsDiv = this.shadowRoot.getElementById('sceneResults');


        if (!descriptionInput || !descriptionInput.value) {
            resultsDiv.innerHTML = '<p class="error-message">Please describe the scene you want to create.</p>';
            return;
        }
        
        resultsDiv.innerHTML = '<div class="loader-small">Generating scene...</div>';
        this.isLoading = true;

        try {
            // TODO: API call to backend endpoint from profile ("apiEndpoints": {"generateScene": "/api/ai/generate-scene"})
            const response = await fetch('/api/ai/generate-scene', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: descriptionInput.value })
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json(); // Expecting { html: "...", js: "...", css: "..." } or similar

            if (data.code && codeEditor) {
                 // If using CodeMirror: this.editor.setValue(data.code);
                codeEditor.value = data.code; // For textarea
            }
            if (data.htmlContent && previewFrame) {
                previewFrame.srcdoc = data.htmlContent; // For self-contained HTML
            } else if (data.jsCode && previewFrame) {
                // More complex preview setup might be needed if not self-contained
                const previewContent = \`
                    <html>
                        <head>
                            <style>body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }</style>
                            ${ data.cssCode ? \`<style>\${data.cssCode}</style>\` : '' }
                        </head>
                        <body>
                            <script type="module">
                                ${data.jsCode}
                            </script>
                        </body>
                    </html>
                \`;
                previewFrame.srcdoc = previewContent;
            }
            resultsDiv.innerHTML = '<p class="success-message">Scene generated successfully!</p>';

        } catch (error) {
            console.error('Scene generation error:', error);
            resultsDiv.innerHTML = `<p class="error-message">Error generating scene: ${error.message}</p>`;
        } finally {
            this.isLoading = false;
        }
    }

    // --- Code Assistant ---
    initCodeAssistantListeners() {
        this.fetchTemplate('/assets/templates/code-assistant.html', 'code-assistant-content').then(() => {
            const analyzeCodeButton = this.shadowRoot.getElementById('analyzeCodeButton');
            if (analyzeCodeButton) {
                analyzeCodeButton.addEventListener('click', () => this.handleCodeAnalysis());
            }
            // Initialize code editor for code input
            // this.initializeCodeEditor('codeInputEditor');
        });
    }

    async handleCodeAnalysis() {
        const codeInput = this.shadowRoot.getElementById('codeInputEditor'); // Or this.editor.getValue()
        const taskSelect = this.shadowRoot.getElementById('assistantTaskSelect');
        const resultsDiv = this.shadowRoot.getElementById('assistantResults');

        if (!codeInput || !codeInput.value) {
            resultsDiv.innerHTML = '<p class="error-message">Please enter some code to analyze.</p>';
            return;
        }
        if (!taskSelect || !taskSelect.value) {
            resultsDiv.innerHTML = '<p class="error-message">Please select a task.</p>';
            return;
        }
        
        resultsDiv.innerHTML = '<div class="loader-small">Processing...</div>';
        this.isLoading = true;

        try {
            // TODO: API call to backend endpoint from profile ("apiEndpoints": {"codeAssistant": "/api/ai/code-assistant"})
            const response = await fetch('/api/ai/code-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeInput.value, task: taskSelect.value })
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json(); // Expecting { result: "markdown or text" }
            
            // Render markdown if applicable (using a library or basic conversion)
            resultsDiv.innerHTML = \`<h3>Assistant Response</h3><div>\${data.result}</div>\`;

        } catch (error) {
            console.error('Code assistant error:', error);
            resultsDiv.innerHTML = `<p class="error-message">Error with code assistant: ${error.message}</p>`;
        } finally {
            this.isLoading = false;
        }
    }
}

customElements.define('ai-playground', AIPlayground);
