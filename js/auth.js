// auth.js - Authentication Logic

const auth = {
    users: {
        'distribuidora': { password: '123456', role: 'cashier' },
        'laguna': { password: '654321', role: 'admin' }
    },

    handleLogin(event) {
        event.preventDefault();
        const usernameInput = document.getElementById('username').value.trim().toLowerCase();
        const passwordInput = document.getElementById('password').value;
        const errorMsg = document.getElementById('login-error');

        const user = this.users[usernameInput];

        if (user && user.password === passwordInput) {
            
            // Check permissions based on target module
            const target = app.state.targetModule;
            
            if ((target === 'ventas' || target === 'logistica') && user.role !== 'admin') {
                errorMsg.innerText = 'Acceso denegado. Se requiere clave de administrador.';
                errorMsg.style.display = 'block';
                return;
            }

            // Success
            errorMsg.style.display = 'none';
            app.state.user = {
                username: usernameInput,
                role: user.role
            };
            
            // Clear forms
            document.getElementById('login-form').reset();

            // Proceed to app
            app.showApp();
        } else {
            // Failed
            errorMsg.innerText = 'Usuario o contraseña incorrectos.';
            errorMsg.style.display = 'block';
        }
    },

    logoutAndGoMenu() {
        app.state.user = null;
        
        // Clear pos cart
        pos.cart = [];
        pos.renderCart();
        
        app.showView('view-menu');
    },

    logout() {
        app.state.user = null;
        app.state.branch = null;
        app.state.targetModule = null;
        
        // Clear pos cart
        pos.cart = [];
        pos.renderCart();
        
        app.showView('view-home');
    }
};
