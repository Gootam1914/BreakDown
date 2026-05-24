window.activeId = null;

document.getElementById('runBtn').addEventListener('click', async () => {
    const field = document.getElementById('box');
    const btn = document.getElementById('runBtn');
    const feed = document.getElementById('feed');
    const text = field.value.trim();

    if (!text) return;

    const user = localStorage.getItem('breakdown_user');
    const profile = user ? JSON.parse(user) : null;
    const uid = profile ? profile.id : 'local_guest_session';
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-bubble user';
    userMsg.innerText = text;
    feed.appendChild(userMsg);
    feed.scrollTop = feed.scrollHeight;
    field.value = '';
    btn.innerText = "COMPILING STRATEGY...";
    btn.disabled = true;
    try {
        const res = await fetch('/api/ai/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: text,
                userId: uid,
                conversationId: window.activeId 
            })
        });
        if (!res.ok) throw new Error("API compilation processing failure.");
        const data = await res.json();
        
        if (data.success && data.blueprint) {
            window.activeId = data.conversationId;

            const sysMsg = document.createElement('div');
            sysMsg.className = 'chat-bubble system';
            sysMsg.innerText = `Matrix updated for "${data.blueprint.title}". Key objectives extracted and mapped.`;
            feed.appendChild(sysMsg);
            feed.scrollTop = feed.scrollHeight;

            showBlueprint(data.blueprint);
            
            if (window.SessionCore && typeof window.SessionCore.hydrateWorkspace === 'function') {
                await window.SessionCore.hydrateWorkspace();
            } else if (typeof window.loadSidebarHistory === 'function') {
                await window.loadSidebarHistory();
            }
        }
    } catch (err) {
        console.error('[ANALYSIS CORE FAILURE]:', err);
        const errMsg = document.createElement('div');
        errMsg.className = 'chat-bubble system';
        errMsg.style.borderColor = '#ff4a4a';
        errMsg.innerText = "System error encountered during compilation sequencing parameters.";
        feed.appendChild(errMsg);
    } {
        btn.disabled = false;
        btn.innerText = "Compile Architecture";
    }
});

function showBlueprint(blueprint) {
    const pane = document.getElementById('panel');
    pane.innerHTML = ''; 
    const item = document.createElement('div');
    item.className = 'matrix-card';
    
    let rows = '';
    if (blueprint.tasks && Array.isArray(blueprint.tasks)) {
        blueprint.tasks.forEach(task => {
            rows += `
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
    item.innerHTML = `
        <h3>${blueprint.title || 'Untitled Blueprint'}</h3>
        <p>${blueprint.description || 'No overview details populated.'}</p>
        
        <div class="metric-row">
            <span class="metric-badge">Feasibility Score: ${blueprint.score || 'N/A'}%</span>
            <span class="metric-badge">Realism: ${blueprint.metrics?.realism || 100}%</span>
        </div>

        <div class="task-list-container">
            ${rows || '<div class="empty-state">No sequenced steps mapped.</div>'}
        </div>
    `;
    pane.appendChild(item);
}

window.RenderMatrixCore = showBlueprint;