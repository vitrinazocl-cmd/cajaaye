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
            // Check descriptions flexibly
            const desc = item.DESCRIPCION || item.descripcion || item.Descripcion;
            if (!desc || desc.trim() === '') return;

            const card = document.createElement('div');
            card.className = 'product-card ripple';

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

    filterTable() {
        const term = document.getElementById('inv-search').value.toLowerCase();
        const cards = document.querySelectorAll('#inv-product-list .product-card');
        
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(term) ? '' : 'none';
        });
    }
};
