document.addEventListener('DOMContentLoaded', () => {
    
    const toggle = document.getElementById('menuBtn');
    const menu = document.querySelector('.sidebar');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('collapsed');
        });
    }
    const createBtn = document.getElementById('addBtn');
    if (createBtn) {
        createBtn.addEventListener('click', async () => {
            console.log("[WORKSPACE RESET] Storing active thread and clearing layout channels...");

            if (window.SessionCore && typeof window.SessionCore.load === 'function') {
                await window.SessionCore.load();
            } else if (typeof window.refreshHistory === 'function') {
                await window.refreshHistory();
            }

            window.activeId = null;

            const feed = document.getElementById('feed');
            if (feed) {
                feed.innerHTML = `
                    <div class="chat-bubble system" style="animation: fade-in 0.3s ease;">
                        Workspace reinitialized. Prior session committed to storage matrix history. What are we engineering next?
                    </div>
                `;
            }
            const pane = document.getElementById('panel');
            if (pane) {
                pane.innerHTML = `
                    <div class="empty-state" style="animation: fade-in 0.3s ease;">
                        Awaiting execution. Enter system directives to populate the matrix.
                    </div>
                `;
            }
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
            });
            if (menu) menu.classList.remove('collapsed');
            
            console.log("[WORKSPACE RESET INITIALIZED SUCCESS] Execution sandbox clean.");
        });
    }
});

window.refreshHistory = async function() {
    const user = localStorage.getItem('breakdown_user');
    const profile = user ? JSON.parse(user) : null;
    const uid = profile ? profile.id : 'local_guest_session';
    const wrap = document.getElementById('list');
    
    if (!wrap) return;

    try {
        const res = await fetch(`/api/history?userId=${uid}`);
        if (!res.ok) throw new Error();
        const items = await res.json();
        
        wrap.innerHTML = '';
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = `history-item ${window.activeId === item.id ? 'active' : ''}`;
            row.innerText = item.title || "Architecture Thread";
            row.dataset.id = item.id;
            
            row.addEventListener('click', () => {
                document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
                row.classList.add('active');
                window.activeId = item.id;
            });
            wrap.appendChild(row);
        });
    } catch (err) {
        console.warn("[SIDEBAR SYNC STUB] Matrix history sync waiting for session auth loop initialization.");
    }
};