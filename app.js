// app.js - Main Application Controller

const app = {
    state: {
        branch: null, // 'norte' or 'sur'
        user: null,   // { role: 'cashier'|'admin', username: string }
        targetModule: null // 'pos', 'ventas', 'logistica'
    },

    init() {
        // Initialize modules
        inventory.init();
        reports.init();
        this.showView('view-home');
    },

    selectBranch(branchId) {
        this.state.branch = branchId;
        localStorage.setItem('pos_branch', branchId);
        
        // Show main menu view
        this.showView('view-menu');
    },

    goHome() {
        this.state.branch = null;
        localStorage.removeItem('pos_branch');
        this.showView('view-home');
    },

    selectModule(moduleId) {
        this.state.targetModule = moduleId;
        
        // Update login title
        let moduleName = '';
        if(moduleId === 'pos') moduleName = 'Caja Registradora';
        if(moduleId === 'ventas') moduleName = 'Ventas';
        if(moduleId === 'logistica') moduleName = 'Logística';
        
        document.getElementById('login-title').innerText = `Ingreso a ${moduleName}`;
        this.showView('view-login');
    },

    showApp() {
        // Setup UI
        document.getElementById('current-branch-display').innerText = `Pudahuel ${this.state.branch === 'norte' ? 'Norte' : 'Sur'}`;
        document.getElementById('current-user-display').innerText = this.state.user.username;

        this.showView('view-main');
        
        // Hide all modules
        document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
        
        // Show target module
        document.getElementById(`module-${this.state.targetModule}`).classList.add('active');
        
        // Trigger module specific actions
        if (this.state.targetModule === 'ventas') {
            reports.updateDashboard();
        }
        if (this.state.targetModule === 'logistica' || this.state.targetModule === 'pos') {
            inventory.loadCSV(); // load/refresh data
        }
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
