class Session {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('breakdown_user')) || null;
        this.currentId = null;
        this.init();
        this.check();
    }

    init() {
        this.modal = document.getElementById('loginScreen');
        this.nameText = document.getElementById('userDisplay');
        this.imgText = document.getElementById('avatar');

        document.getElementById('guestBtn').addEventListener('click', () => this.guestLogin());
        document.getElementById('outBtn').addEventListener('click', () => this.logout());
        document.getElementById('addBtn').addEventListener('click', () => this.reset());

        window.addEventListener('load', () => this.oauth());
    }

    oauth() {
        if (typeof google === 'undefined') {
            console.warn("Google Identity script could not be loaded.");
            return;
        }
        google.accounts.id.initialize({
            client_id: "59820944251-1a5cen7hpj0ketedljp20uhioql2ebag.apps.googleusercontent.com",
            callback: (res) => this.oauthDone(res)
        });
        google.accounts.id.renderButton(
            document.getElementById("googleBtn"),
            { theme: "outline", size: "large", width: 320, text: "continue_with" }
        );
    }

    oauthDone(res) {
        try {
            const url = res.credential.split('.')[1];
            const base64 = url.replace(/-/g, '+').replace(/_/g, '/');
            const str = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const data = JSON.parse(str);

            this.user = {
                id: 'goog_usr_' + data.sub,
                name: data.name
            };
            localStorage.setItem('breakdown_user', JSON.stringify(this.user));
            this.check();
        } 
        catch (err) {
            console.error("Google authentication decoding fault:", err);
            alert("OAuth structural handshake failed.");
        }
    }

    check() {
        if (this.user) {
            this.modal.classList.remove('active');
            this.load();
        } else {
            this.modal.classList.add('active');
        }
    }

    guestLogin() {
        const box = document.getElementById('guestName');
        const val = box.value.trim();
        if (!val) {
            alert("Identification tag required.");
            return;
        }

        this.user = {
            id: 'local_usr_' + Math.random().toString(36).substr(2, 9),
            name: val
        };

        localStorage.setItem('breakdown_user', JSON.stringify(this.user));
        box.value = '';
        this.check();
    }

    simulateGoogleAuth() {
        this.user = {
            id: 'goog_usr_77x92a3b',
            name: 'Alex Mercer'
        };
        localStorage.setItem('breakdown_user', JSON.stringify(this.user));
        this.check();
    }

    logout() {
        localStorage.removeItem('breakdown_user');
        this.user = null;
        this.currentId = null;

        document.getElementById('list').innerHTML = '';
        document.getElementById('box').value = '';
        if (window.GraphEngine && window.GraphEngine.cy) {
            window.GraphEngine.cy.elements().remove();
        }

        this.check();
    }

    async load() {
        this.nameText.innerText = this.user.name;
        this.imgText.innerText = this.user.name.charAt(0).toUpperCase();

        try {
            const res = await fetch(`/api/history?userId=${this.user.id}`);
            if (!res.ok) throw new Error("History synchronization failure.");

            const items = await res.json();
            this.show(items);
        } catch (err) {
            console.error('[AUTH HYDRATION FAULT]:', err);
            this.show([
                { id: 'mock-1', title: 'Example Data Startup' }
            ]);
        }
    }

    show(items) {
        const wrap = document.getElementById('list');
        wrap.innerHTML = '';

        if (items.length === 0) {
            wrap.innerHTML = '<div class="history-item empty" style="color: #666; font-size: 0.8rem;">No previous architectures</div>';
            return;
        }

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = `history-item ${this.currentId === item.id ? 'active' : ''}`;
            row.innerText = item.title;
            row.dataset.id = item.id;
            row.addEventListener('click', () => this.fetch(item.id, row));
            wrap.appendChild(row);
        });
    }

    reset() {
        this.currentId = null;
        document.getElementById('box').value = '';
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        if (window.GraphEngine && window.GraphEngine.cy) {
            window.GraphEngine.cy.elements().remove();
        }
    }

    async fetch(id, row) {
        this.currentId = id;

        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        row.classList.add('active');

        try {
            const res = await fetch(`/api/blueprint/${id}?userId=${this.user.id}`);
            if (res.ok) {
                const data = await res.json();
                window.GraphEngine.render(data.blueprint);
            }
        } catch (err) {
            console.error("Failed to load blueprint.", err);
        }
    }
}
window.addEventListener('DOMContentLoaded', () => window.SessionCore = new Session());