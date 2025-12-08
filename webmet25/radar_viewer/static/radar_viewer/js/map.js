/**
 * Webmet25 Radar Viewer Map JavaScript
 */

// Initialize map centered on Spain (adjust as needed)
const map = L.map('map').setView([40.4168, -3.7038], 6);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Layer group for radar products
const radarLayer = L.layerGroup().addTo(map);

// Station markers layer
const stationsLayer = L.layerGroup().addTo(map);

// Load radar stations
function loadStations() {
    fetch('/api/stations/')
        .then(response => response.json())
        .then(data => {
            stationsLayer.clearLayers();
            data.stations.forEach(station => {
                const marker = L.circleMarker([station.latitude, station.longitude], {
                    radius: 8,
                    fillColor: '#e74c3c',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
                marker.bindPopup(`<b>${station.code}</b><br>${station.name}<br>Alt: ${station.altitude}m`);
                marker.addTo(stationsLayer);
            });
        })
        .catch(error => console.error('Error loading stations:', error));
}

// Load radar products
function loadProducts() {
    fetch('/api/products/')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('product-select');
            select.innerHTML = '<option value="">Select Product</option>';
            data.products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.name} - ${product.type} (${new Date(product.valid_time).toLocaleString()})`;
                option.dataset.product = JSON.stringify(product);
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading products:', error));
}

// Display product on map
function displayProduct(product) {
    radarLayer.clearLayers();
    
    // Add a marker at product location
    const marker = L.marker([product.latitude, product.longitude]);
    marker.bindPopup(`<b>${product.name}</b><br>Type: ${product.type}`);
    marker.addTo(radarLayer);
    
    // Center map on product
    map.setView([product.latitude, product.longitude], 8);
    
    // Update info panel
    document.getElementById('product-info').innerHTML = `
        <p><strong>Name:</strong> ${product.name}</p>
        <p><strong>Type:</strong> ${product.type}</p>
        <p><strong>Valid Time:</strong> ${new Date(product.valid_time).toLocaleString()}</p>
        <p><strong>Location:</strong> ${product.latitude.toFixed(4)}, ${product.longitude.toFixed(4)}</p>
    `;
}

// Event listeners
document.getElementById('product-select').addEventListener('change', function() {
    if (this.value && this.selectedOptions[0].dataset.product) {
        const product = JSON.parse(this.selectedOptions[0].dataset.product);
        displayProduct(product);
    }
});

document.getElementById('refresh-btn').addEventListener('click', function() {
    loadProducts();
    loadStations();
});

// Initial load
loadProducts();
loadStations();
