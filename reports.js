// reports.js - Reports and Dashboard Logic

const reports = {
    sales: [],

    init() {
        const saved = localStorage.getItem('pos_sales');
        if (saved) {
            this.sales = JSON.parse(saved);
        }
    },

    addSale(sale) {
        this.sales.push(sale);
        localStorage.setItem('pos_sales', JSON.stringify(this.sales));
        // Update dashboard if active
        if (app.state.user && app.state.user.role === 'admin') {
            this.updateDashboard();
        }
    },

    updateDashboard() {
        this.calculateStats();
        this.renderRecentSales();
    },

    calculateStats() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        const dayOfWeek = now.getDay(); // 0 is Sunday
        const startOfWeek = new Date(startOfDay - (dayOfWeek * 24 * 60 * 60 * 1000)).getTime();
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        let daily = 0, weekly = 0, monthly = 0, yearly = 0;

        this.sales.forEach(sale => {
            const saleTime = new Date(sale.date).getTime();
            
            if (saleTime >= startOfYear) yearly += sale.total;
            if (saleTime >= startOfMonth) monthly += sale.total;
            if (saleTime >= startOfWeek) weekly += sale.total;
            if (saleTime >= startOfDay) daily += sale.total;
        });

        const f = (val) => `$${val.toLocaleString('es-CL')}`;

        if(document.getElementById('stat-daily')) document.getElementById('stat-daily').innerText = f(daily);
        if(document.getElementById('stat-weekly')) document.getElementById('stat-weekly').innerText = f(weekly);
        if(document.getElementById('stat-monthly')) document.getElementById('stat-monthly').innerText = f(monthly);
        if(document.getElementById('stat-yearly')) document.getElementById('stat-yearly').innerText = f(yearly);
    },

    renderRecentSales() {
        const tbody = document.getElementById('sales-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        // Show last 50 sales, reversed
        const recent = [...this.sales].reverse().slice(0, 50);

        recent.forEach(sale => {
            const tr = document.createElement('tr');
            
            const date = new Date(sale.date).toLocaleString('es-CL');
            const itemsCount = sale.items.reduce((sum, item) => sum + item.qty, 0);

            tr.innerHTML = `
                <td>${date}</td>
                <td style="text-transform: capitalize;">${sale.branch}</td>
                <td>${sale.user}</td>
                <td>${itemsCount}</td>
                <td style="font-weight: bold;">$${sale.total.toLocaleString('es-CL')}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    exportToExcel() {
        const startInput = document.getElementById('export-start').value;
        const endInput = document.getElementById('export-end').value;

        let filteredSales = this.sales;

        if (startInput || endInput) {
            const start = startInput ? new Date(startInput).getTime() : 0;
            // Set end to end of day
            const end = endInput ? new Date(endInput + 'T23:59:59').getTime() : Infinity;

            filteredSales = this.sales.filter(s => {
                const t = new Date(s.date).getTime();
                return t >= start && t <= end;
            });
        }

        if (filteredSales.length === 0) {
            alert('No hay ventas en el rango seleccionado.');
            return;
        }

        // Prepare data for Excel
        const data = filteredSales.map(sale => ({
            'ID Venta': sale.id,
            'Fecha': new Date(sale.date).toLocaleDateString('es-CL'),
            'Hora': new Date(sale.date).toLocaleTimeString('es-CL'),
            'Sucursal': sale.branch,
            'Vendedor': sale.user,
            'Total Venta': sale.total,
            'Detalle Items (Cant x Nombre)': sale.items.map(i => `${i.qty}x ${i.name}`).join(' | ')
        }));

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");

        // Generate filename
        const filename = `Reporte_Ventas_${new Date().toISOString().slice(0,10)}.xlsx`;

        // Download
        XLSX.writeFile(wb, filename);
    }
};
