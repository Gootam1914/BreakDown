window.currentConversationId = null;

document.getElementById('compileBtn').addEventListener('click', async () => {
    const inputElement = document.getElementById('directiveInput');
    const compileButton = document.getElementById('compileBtn');
    const scroller = document.getElementById('chatScroller');
    const systemDirective = inputElement.value.trim();

    if (!systemDirective) return;

    const storedUser = localStorage.getItem('breakdown_user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    const userId = userObj ? userObj.id : 'local_guest_session';
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.innerText = systemDirective;
    scroller.appendChild(userBubble);
    scroller.scrollTop = scroller.scrollHeight;
    inputElement.value = '';
    compileButton.innerText = "COMPILING STRATEGY...";
    compileButton.disabled = true;
    
    try {
        const response = await fetch('/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: systemDirective,
                userId: userId,
                conversationId: window.currentConversationId 
            })
        });
        if (!response.ok) throw new Error("API compilation processing failure.");
        const data = await response.json();
        
        if (data.success && data.blueprint) {
            window.currentConversationId = data.conversationId;

            const systemicConfirmation = document.createElement('div');
            systemicConfirmation.className = 'chat-bubble system';
            systemicConfirmation.innerText = `Matrix updated for "${data.blueprint.title}". Key objectives extracted and mapped.`;
            scroller.appendChild(systemicConfirmation);
            scroller.scrollTop = scroller.scrollHeight;

            renderArchitectureMatrix(data.blueprint);
            
            if (window.SessionCore && typeof window.SessionCore.hydrateWorkspace === 'function') {
                await window.SessionCore.hydrateWorkspace();
            } else if (typeof window.loadSidebarHistory === 'function') {
                await window.loadSidebarHistory();
            }
        }
    } catch (error) {
        console.error('[ANALYSIS CORE FAILURE]:', error);
        const errorBubble = document.createElement('div');
        errorBubble.className = 'chat-bubble system';
        errorBubble.style.borderColor = '#ff4a4a';
        errorBubble.innerText = "System error encountered during compilation sequencing parameters.";
        scroller.appendChild(errorBubble);
    } {
        compileButton.disabled = false;
        compileButton.innerText = "Compile Architecture";
    }
});
function renderArchitectureMatrix(blueprint) {
    const target = document.getElementById('matrixOutput');
    target.innerHTML = ''; 
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
window.RenderMatrixCore = renderArchitectureMatrix;