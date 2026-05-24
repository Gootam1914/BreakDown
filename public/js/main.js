document.querySelectorAll('.nav-node').forEach(node => {
    node.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-node, .pane').forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');
        document.getElementById(e.target.dataset.target).classList.add('active');

        // Cytoscape needs a resize trigger if rendered while hidden
        if(e.target.dataset.target === 'graph-view' && window.GraphEngine.cy) {
            window.GraphEngine.cy.resize();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const cmd = document.getElementById('cmdPalette');
        cmd.classList.toggle('hidden');
        if (!cmd.classList.contains('hidden')) cmd.querySelector('input').focus();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Override default tab behaviors since layout is unified into an immersive modern view matrix
    console.log("[SYSTEM INITIALIZATION COMPLETE] Matte Minimal Workspace Configured.");
});