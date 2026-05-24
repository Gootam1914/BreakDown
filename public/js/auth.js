/**
 * Breakdown OS - Identity & Session Management Core
 * Handles user-isolated secure caching and sandbox execution toggles.
 */
class SessionManager {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('breakdown_user')) || null;
        this.currentConversationId = null;
        this.initDOM();
        this.checkSession();
    }

    initDOM() {
        this.modal = document.getElementById('authOverlay');
        this.userNameDisplay = document.getElementById('userNameDisplay');
        this.userAvatar = document.getElementById('userAvatar');

        // Setup Component Event Listeners
        document.getElementById('guestAuthBtn').addEventListener('click', () => this.loginAsGuest());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('newBlueprintBtn').addEventListener('click', () => this.startNewBlueprint());

        // Initialize Official Google Identity Services
        window.addEventListener('load', () => this.initializeGoogleOAuth());
    }

    initializeGoogleOAuth() {
        if (typeof google === 'undefined') {
            console.warn("Google Identity script could not be loaded.");
            return;
        }

        // Initialize Google Client Framework
        google.accounts.id.initialize({
            // Replace with your real client ID when deploying to production
            client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
            callback: (response) => this.handleGoogleCredentialResponse(response)
        });

        // Render the official minimalist button inside our target wrapper
        google.accounts.id.renderButton(
            document.getElementById("googleAuthBtnWrapper"),
            { theme: "outline", size: "large", width: 320, text: "continue_with" }
        );
    }

    handleGoogleCredentialResponse(response) {
        try {
            // Decode the secure JWT payload sent back by Google's servers
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const googleUser = JSON.parse(jsonPayload);

            // Isolate data by pulling Google's permanent sub ID string
            this.user = {
                id: 'goog_usr_' + googleUser.sub,
                name: googleUser.name
            };

            localStorage.setItem('breakdown_user', JSON.stringify(this.user));
            this.checkSession();
        } catch (error) {
            console.error("Google authentication decoding fault:", error);
            alert("OAuth structural handshake failed.");
        }
    }

    checkSession() {
        if (this.user) {
            this.modal.classList.remove('active');
            this.hydrateWorkspace();
        } else {
            this.modal.classList.add('active');
        }
    }

    loginAsGuest() {
        const nameInput = document.getElementById('guestName');
        const name = nameInput.value.trim();
        if (!name) {
            alert("Identification tag required.");
            return;
        }

        // Construct localized user signature
        this.user = {
            id: 'local_usr_' + Math.random().toString(36).substr(2, 9),
            name: name
        };

        localStorage.setItem('breakdown_user', JSON.stringify(this.user));
        nameInput.value = '';
        this.checkSession();
    }

    simulateGoogleAuth() {
        // Mocking Google OAuth payload redirection match
        this.user = {
            id: 'goog_usr_77x92a3b',
            name: 'Alex Mercer'
        };
        localStorage.setItem('breakdown_user', JSON.stringify(this.user));
        this.checkSession();
    }

    logout() {
        localStorage.removeItem('breakdown_user');
        this.user = null;
        this.currentConversationId = null;

        // Clear the screen of private data
        document.getElementById('historyList').innerHTML = '';
        document.getElementById('directiveInput').value = '';
        if (window.GraphEngine && window.GraphEngine.cy) {
            window.GraphEngine.cy.elements().remove();
        }

        this.checkSession();
    }

    async hydrateWorkspace() {
        this.userNameDisplay.innerText = this.user.name;
        this.userAvatar.innerText = this.user.name.charAt(0).toUpperCase();

        try {
            // Fetch ONLY this user's history from the backend
            const response = await fetch(`/api/history?userId=${this.user.id}`);
            if (!response.ok) throw new Error("History synchronization failure.");

            const conversations = await response.json();
            this.renderSidebarHistory(conversations);
        } catch (error) {
            console.error('[AUTH HYDRATION FAULT]:', error);
            // Fallback for UI testing if backend isn't ready
            this.renderSidebarHistory([
                { id: 'mock-1', title: 'Example Data Startup' }
            ]);
        }
    }

    renderSidebarHistory(conversations) {
        const list = document.getElementById('historyList');
        list.innerHTML = '';

        if (conversations.length === 0) {
            list.innerHTML = '<div class="history-item empty" style="color: #666; font-size: 0.8rem;">No previous architectures</div>';
            return;
        }

        conversations.forEach(item => {
            const div = document.createElement('div');
            div.className = `history-item ${this.currentConversationId === item.id ? 'active' : ''}`;
            div.innerText = item.title;
            div.dataset.id = item.id;
            div.addEventListener('click', () => this.loadPastBlueprint(item.id, div));
            list.appendChild(div);
        });
    }

    startNewBlueprint() {
        this.currentConversationId = null;
        document.getElementById('directiveInput').value = '';
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        if (window.GraphEngine && window.GraphEngine.cy) {
            window.GraphEngine.cy.elements().remove();
        }
    }

    async loadPastBlueprint(blueprintId, clickedElement) {
        this.currentConversationId = blueprintId;

        // Update UI selection
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
        clickedElement.classList.add('active');

        try {
            const response = await fetch(`/api/blueprint/${blueprintId}?userId=${this.user.id}`);
            if (response.ok) {
                const data = await response.json();
                window.GraphEngine.render(data.blueprint);
            }
        } catch (e) {
            console.error("Failed to load blueprint.", e);
        }
    }
}

// Boot the system
window.addEventListener('DOMContentLoaded', () => window.SessionCore = new SessionManager());