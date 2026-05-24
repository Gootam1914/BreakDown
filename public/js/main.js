
document.addEventListener('DOMContentLoaded', () => {
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }
    const newArchBtn = document.getElementById('newBlueprintBtn');
    if (newArchBtn) {
        newArchBtn.addEventListener('click', async () => {
            console.log("[WORKSPACE RESET] Storing active thread and clearing layout channels...");

            if (window.SessionCore && typeof window.SessionCore.hydrateWorkspace === 'function') {
                await window.SessionCore.hydrateWorkspace();
            } else if (typeof window.loadSidebarHistory === 'function') {
                await window.loadSidebarHistory();
            }

            window.currentConversationId = null;

            const scroller = document.getElementById('chatScroller');
            if (scroller) {
                scroller.innerHTML = `
                    <div class="chat-bubble system" style="animation: fade-in 0.3s ease;">
                        Workspace reinitialized. Prior session committed to storage matrix history. What are we engineering next?
                    </div>
                `;
            }
            const matrixOutput = document.getElementById('matrixOutput');
            if (matrixOutput) {
                matrixOutput.innerHTML = `
                    <div class="empty-state" style="animation: fade-in 0.3s ease;">
                        Awaiting execution. Enter system directives to populate the matrix.
                    </div>
                `;
            }
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
            });
            if (sidebar) sidebar.classList.remove('collapsed');
            
            console.log("[WORKSPACE RESET INITIALIZED SUCCESS] Execution sandbox clean.");
        });
    }
});

window.loadSidebarHistory = async function() {
    const storedUser = localStorage.getItem('breakdown_user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    const userId = userObj ? userObj.id : 'local_guest_session';
    const listContainer = document.getElementById('historyList');
    
    if (!listContainer) return;

    try {
        const res = await fetch(`/api/history?userId=${userId}`);
        if (!res.ok) throw new Error();
        const items = await res.json();
        
        listContainer.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = `history-item ${window.currentConversationId === item.id ? 'active' : ''}`;
            row.innerText = item.title || "Architecture Thread";
            row.dataset.id = item.id;
            
            row.addEventListener('click', () => {
                document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
                row.classList.add('active');
                window.currentConversationId = item.id;
            });
            listContainer.appendChild(row);
        });
    } catch (e) {
        console.warn("[SIDEBAR SYNC STUB] Matrix history sync waiting for session auth loop initialization.");
    }
};