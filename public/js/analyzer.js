/**
 * Breakdown OS - AI Analyzer Engine Liaison
 * Handles asynchronous streaming pipelines and context insertion.
 */

document.getElementById('compileBtn').addEventListener('click', async () => {
    const inputElement = document.getElementById('directiveInput');
    const compileButton = document.getElementById('compileBtn');
    const scroller = document.getElementById('chatScroller');
    const outputArea = document.getElementById('matrixOutput');
    const systemDirective = inputElement.value.trim();

    if (!systemDirective) return;

    if (!window.SessionCore || !window.SessionCore.user) {
        alert("Session parameters lost. Please refresh.");
        return;
    }

    // 1. Instantly inject the user's prompt into the ongoing Chat history window
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.innerText = systemDirective;
    scroller.appendChild(userBubble);
    scroller.scrollTop = scroller.scrollHeight;

    // Clear input interface immediately
    inputElement.value = '';

    // Set loading dynamics
    compileButton.innerText = "COMPILING STRATEGY...";
    compileButton.disabled = true;

    try {
        const response = await fetch('/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: systemDirective,
                userId: window.SessionCore.user.id
            })
        });

        if (!response.ok) throw new Error("API system failure.");
        const data = await response.json();

        if (data.success && data.blueprint) {
            // 2. Stream confirmation phrase into chat window
            const systemicConfirmation = document.createElement('div');
            systemicConfirmation.className = 'chat-bubble system';
            systemicConfirmation.innerText = `Architecture matrix components configured for "${data.blueprint.title}". Visualizations mapped inside the layout engine parameters.`;
            scroller.appendChild(systemicConfirmation);
            scroller.scrollTop = scroller.scrollHeight;

            // 3. Render raw structured components clean and legibly into data panel
            renderArchitectureMatrix(data.blueprint);

            // Refresh historic records list
            if (window.SessionCore) await window.SessionCore.hydrateWorkspace();
        }
    } catch (error) {
        console.error('[ANALYSIS CORE FAILURE]:', error);
        const errorBubble = document.createElement('div');
        errorBubble.className = 'chat-bubble system';
        errorBubble.style.borderColor = '#ff4a4a';
        errorBubble.innerText = "System error encountered during compilation sequencing parameters.";
        scroller.appendChild(errorBubble);
    } finally {
        compileButton.disabled = false;
        compileButton.innerText = "Compile Architecture";
    }
});

function renderArchitectureMatrix(blueprint) {
    const target = document.getElementById('matrixOutput');
    target.innerHTML = ''; // Wipe pre-existing values

    const card = document.createElement('div');
    card.className = 'matrix-card';

    let taskRowsHTML = '';
    if (blueprint.tasks && Array.isArray(blueprint.tasks)) {
        blueprint.tasks.forEach(task => {
            taskRowsHTML += `
                <div class="task-row-item">
                    <div class="task-title-info">${task.title}</div>
                    <div class="task-meta-tags">
                        <span class="metric-badge">${task.durationDays} Days</span>
                        <span class="metric-badge" style="color: ${task.complexity === 'High' ? '#ff4a4a' : '#00e5ff'}">${task.complexity}</span>
                    </div>
                </div>
            `;
        });
    }

    card.innerHTML = `
        <h3>${blueprint.title || 'Untitled Blueprint'}</h3>
        <p>${blueprint.description || 'No overview details populated.'}</p>
        
        <div class="metric-row">
            <span class="metric-badge">Feasibility Score: ${blueprint.score || 'N/A'}%</span>
            <span class="metric-badge">Realism: ${blueprint.metrics?.realism || 100}%</span>
        </div>

        <div class="task-list-container">
            ${taskRowsHTML || '<div class="empty-state">No sequenced steps mapped.</div>'}
        </div>
    `;

    target.appendChild(card);
}

// Attach access reference globally to load from historical sidebar clicks seamlessly
window.RenderMatrixCore = renderArchitectureMatrix;