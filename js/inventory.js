// inventory.js - Inventory Management

const inventory = {
    data: [],

    init() {
        // Attempt to load from localStorage first if we already parsed it
        const saved = localStorage.getItem('pos_inventory');
        if (saved) {
            this.data = JSON.parse(saved);
            this.renderTable();
        }
    },

    loadCSV() {
        // We use PapaParse to fetch and read the local CSV.
        // This requires the app to be served over HTTP (e.g. live server).
        Papa.parse("inventario.csv", {
            download: true,
            header: true,
            delimiter: ";",
            skipEmptyLines: true,
            complete: (results) => {
                // Clean headers and data
                this.data = results.data.map(row => {
                    const cleanRow = {};
                    for (let key in row) {
                        cleanRow[key.trim()] = row[key].trim();
                    }
                    
                    // Generate a random ID if CODIGO is empty for internal tracking
                    if (!cleanRow['CODIGO']) {
                        cleanRow['CODIGO'] = 'GEN-' + Math.random().toString(36).substr(2, 9);
                    }

                    // Parse price
                    if (cleanRow['PRECIO POR CAJA']) {
                        let priceStr = cleanRow['PRECIO POR CAJA'].replace('$', '').replace(/\./g, '').trim();
                        cleanRow['PRICE_NUM'] = parseInt(priceStr) || 0;
                    } else {
                        cleanRow['PRICE_NUM'] = 0;
                    }

                    return cleanRow;
                });
                
                // Save to local storage for quick access
                localStorage.setItem('pos_inventory', JSON.stringify(this.data));
                
                this.renderTable();
                
                // Also update POS products if we are in the app
                if (window.pos) {
                    pos.renderProducts();
                }
            },
            error: (err) => {
                console.error("Error loading CSV:", err);
                alert("Error al cargar el inventario. Asegúrese de estar ejecutando la aplicación a través de un servidor web local para poder leer el archivo CSV.");
            }
        });
    },

    renderTable() {
        const list = document.getElementById('inv-product-list');
        if (!list) return;

        list.innerHTML = '';

        if (this.data.length === 0) return;

        // Rows as Cards
        this.data.forEach(item => {
            // Skip items without a description
            if (!item.DESCRIPCION) return;

            const card = document.createElement('div');
            card.className = 'product-card ripple';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'product-image-container';
            const img = document.createElement('img');
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
            price.innerText = `$${(item.PRICE_NUM || 0).toLocaleString('es-CL')}`;

            card.appendChild(imgContainer);
            card.appendChild(code);
            card.appendChild(name);
            card.appendChild(brand);
            card.appendChild(stock);
            card.appendChild(price);
            
            list.appendChild(card);
        });
    },

    filterTable() {
        const term = document.getElementById('inv-search').value.toLowerCase();
        const cards = document.querySelectorAll('#inv-product-list .product-card');
        
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(term) ? '' : 'none';
        });
    }
};
