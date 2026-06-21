// pos.js - Cash Register Logic

const pos = {
    cart: [],
    
    renderProducts() {
        const list = document.getElementById('pos-product-list');
        if (!list) return;

        list.innerHTML = '';

        // Display products from inventory
        inventory.data.forEach(item => {
            // Check descriptions flexibly
            const desc = item.DESCRIPCION || item.descripcion || item.Descripcion;
            if (!desc || desc.trim() === '') return;

            const card = document.createElement('div');
            card.className = 'product-card ripple';
            card.onclick = () => this.addToCart(item);

            const imgContainer = document.createElement('div');
            imgContainer.className = 'product-image-container';
            const img = document.createElement('img');
            img.src = `stock productos/${desc}.jpg`;
            img.onerror = function() {
                this.onerror = null;
                this.src = `stock productos/${desc}.webp`;
                this.onerror = function() {
                    this.onerror = null;
                    this.src = `stock productos/${desc}.png`;
                    this.onerror = function() {
                        this.onerror = null;
                        this.src = 'logo.jpg.jpeg';
                    };
                };
            };
            imgContainer.appendChild(img);

            const code = document.createElement('div');
            code.className = 'product-code';
            const cod = item.CODIGO || item.codigo || '';
            code.innerText = `Cod: ${cod}`;

            const name = document.createElement('div');
            name.className = 'product-name';
            name.innerText = desc;

            const brand = document.createElement('div');
            brand.className = 'product-brand';
            const mar = item.MARCA || item.marca || 'N/A';
            brand.innerText = `Marca: ${mar}`;

            const stock = document.createElement('div');
            const stockVal = item['STOCK CAJA'] || item['stock'] || item['UNIDADES POR CAJA'] || item['unidades_por_caja'];
            const stockQty = parseInt(stockVal) || 0;
            stock.className = `product-stock ${stockQty <= 5 ? 'low-stock' : 'normal-stock'}`;
            stock.innerText = `Stock: ${stockQty}`;

            const price = document.createElement('div');
            price.className = 'product-price';
            const pNum = Number(item.PRICE_NUM) || Number(item.precio_caja) || 0;
            price.innerText = `$${pNum.toLocaleString('es-CL')}`;

            card.appendChild(imgContainer);
            card.appendChild(code);
            card.appendChild(name);
            card.appendChild(brand);
            card.appendChild(stock);
            card.appendChild(price);
            
            // To ensure they are always visible:
            code.style.display = 'block';
            name.style.display = 'block';
            brand.style.display = 'block';
            stock.style.display = 'block';
            price.style.display = 'block';

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
