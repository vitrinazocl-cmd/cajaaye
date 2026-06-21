// pos.js - Cash Register Logic

const pos = {
    cart: [],
    
    renderProducts() {
        const list = document.getElementById('pos-product-list');
        if (!list) return;

        list.innerHTML = '';

        // Display products from inventory
        inventory.data.forEach(item => {
            // Skip items without a description or price
            if (!item.DESCRIPCION) return;

            const card = document.createElement('div');
            card.className = 'product-card ripple';
            card.onclick = () => this.addToCart(item);

            // Using placeholder for image, you could try to match by name if mapped
            const imgContainer = document.createElement('div');
            imgContainer.className = 'product-image-container';
            const img = document.createElement('img');
            // Try to find image by description + .webp/.jpg/.png if you want, but for now fallback or exact description name 
            // The prompt says "salgan con ese mismo formato de la imagen que adjunte"
            img.src = `stock productos/${item.DESCRIPCION}.jpg`;
            img.onerror = function() {
                this.onerror = null;
                this.src = `stock productos/${item.DESCRIPCION}.webp`;
                this.onerror = function() {
                    this.onerror = null;
                    this.src = `stock productos/${item.DESCRIPCION}.png`;
                    this.onerror = function() {
                        this.onerror = null;
                        this.src = 'logo.jpg.jpeg'; // fallback logo
                    };
                };
            };
            imgContainer.appendChild(img);

            const code = document.createElement('div');
            code.className = 'product-code';
            code.innerText = `Cod: ${item.CODIGO || ''}`;

            const name = document.createElement('div');
            name.className = 'product-name';
            name.innerText = item.DESCRIPCION;

            const brand = document.createElement('div');
            brand.className = 'product-brand';
            brand.innerText = `Marca: ${item.MARCA || 'N/A'}`;

            const stock = document.createElement('div');
            const stockQty = parseInt(item['STOCK CAJA']) || parseInt(item['UNIDADES POR CAJA']) || 0;
            stock.className = `product-stock ${stockQty <= 5 ? 'low-stock' : 'normal-stock'}`;
            stock.innerText = `Stock: ${stockQty}`;

            const price = document.createElement('div');
            price.className = 'product-price';
            price.innerText = `$${item.PRICE_NUM.toLocaleString('es-CL')}`;

            card.appendChild(imgContainer);
            card.appendChild(code);
            card.appendChild(name);
            card.appendChild(brand);
            card.appendChild(stock);
            card.appendChild(price);
            list.appendChild(card);
        });
    },

    filterProducts() {
        const term = document.getElementById('pos-search').value.toLowerCase();
        const cards = document.querySelectorAll('.product-card');
        
        cards.forEach(card => {
            const name = card.querySelector('.product-name').innerText.toLowerCase();
            card.style.display = name.includes(term) ? '' : 'none';
        });
    },

    addToCart(item) {
        // Check if already in cart
        const existing = this.cart.find(c => c.codigo === item.CODIGO);
        if (existing) {
            existing.qty += 1;
        } else {
            this.cart.push({
                codigo: item.CODIGO,
                name: item.DESCRIPCION,
                price: item.PRICE_NUM,
                qty: 1
            });
        }
        this.renderCart();
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    },

    updateQty(index, change) {
        this.cart[index].qty += change;
        if (this.cart[index].qty <= 0) {
            this.removeFromCart(index);
        } else {
            this.renderCart();
        }
    },

    renderCart() {
        const list = document.getElementById('pos-cart-items');
        if (!list) return;

        list.innerHTML = '';
        let total = 0;

        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            
            div.innerHTML = `
                <div class="cart-item-info">
                    <div><strong>${item.name}</strong></div>
                    <div style="color: #666; font-size: 0.85rem;">$${item.price.toLocaleString('es-CL')} c/u</div>
                </div>
                <div class="cart-item-actions">
                    <button class="btn-icon" onclick="pos.updateQty(${index}, -1)"><span class="material-icons-outlined">remove</span></button>
                    <span>${item.qty}</span>
                    <button class="btn-icon" onclick="pos.updateQty(${index}, 1)"><span class="material-icons-outlined">add</span></button>
                    <span style="font-weight: bold; width: 70px; text-align: right;">$${itemTotal.toLocaleString('es-CL')}</span>
                    <button class="btn-icon" onclick="pos.removeFromCart(${index})" style="color: var(--md-sys-color-error)"><span class="material-icons-outlined">delete</span></button>
                </div>
            `;
            list.appendChild(div);
        });

        document.getElementById('pos-total').innerText = `$${total.toLocaleString('es-CL')}`;
    },

    checkout() {
        if (this.cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        
        // Create sale record
        const sale = {
            id: Date.now(),
            date: new Date().toISOString(),
            branch: app.state.branch,
            user: app.state.user.username,
            items: [...this.cart],
            total: total
        };

        // Save to reports
        reports.addSale(sale);

        // Clear cart
        this.cart = [];
        this.renderCart();

        alert(`Venta completada exitosamente. Total: $${total.toLocaleString('es-CL')}`);
    }
};
