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
        const thead = document.getElementById('inv-table-head');
        const tbody = document.getElementById('inv-table-body');
        
        if (!thead || !tbody) return;

        thead.innerHTML = '';
        tbody.innerHTML = '';

        if (this.data.length === 0) return;

        // Headers
        const headers = ['IMAGEN', 'CODIGO', 'DESCRIPCION', 'MARCA', 'UNIDADES POR CAJA', 'PRECIO POR CAJA', 'STOCK CAJA'];
        headers.forEach(h => {
            const th = document.createElement('th');
            th.innerText = h;
            thead.appendChild(th);
        });

        // Rows
        this.data.forEach(item => {
            const desc = item.DESCRIPCION || item.descripcion || item.Descripcion;
            if (!desc || desc.trim() === '') return;

            const cleanDesc = desc.trim().toLowerCase().replace(/\s+/g, ' ');
            const imgUrl = (typeof imageMap !== 'undefined' ? imageMap[cleanDesc] : null) || `stock productos/${desc}.jpg`;
            const stockVal = parseFloat(item['STOCK CAJA'] || item['stock'] || item['UNIDADES POR CAJA'] || item['unidades_por_caja']) || 0;
            const stockStyle = stockVal <= 5 ? 'color: red; font-weight: bold;' : '';
            const pNum = Number(item.PRICE_NUM) || Number(item.precio_caja) || 0;
            const cod = item.CODIGO || item.codigo || '';
            const mar = item.MARCA || item.marca || 'N/A';
            const unids = item['UNIDADES POR CAJA'] || item.unidades_por_caja || '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${imgUrl}" style="width:50px; height:50px; object-fit:contain; border-radius:4px;" onerror="this.src='logo.jpg.jpeg'"></td>
                <td>${cod}</td>
                <td>${desc}</td>
                <td>${mar}</td>
                <td>${unids}</td>
                <td>$${pNum.toLocaleString('es-CL')}</td>
                <td style="${stockStyle}">${Math.floor(stockVal)}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    filterTable() {
        const term = document.getElementById('inv-search').value.toLowerCase();
        const rows = document.querySelectorAll('#inv-table-body tr');
        
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }
};
