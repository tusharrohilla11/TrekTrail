var map = L.map('map').setView([23.2599, 77.4126], 4.5);

const mainLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://carto.com/">carto.com</a> contributors'
});
mainLayer.addTo(this.map);

const markers = L.markerClusterGroup();

for (trek of treks) {
    const marker = L.marker([
        trek.geometry.coordinates[1],
        trek.geometry.coordinates[0]
    ]).bindPopup(`
                <a href="/treks/${trek._id}"}>
                    <h6>${trek.title}</h6>
                </a>
                <p>${trek.location}</p>
        `)
    markers.addLayer(marker)
}
map.addLayer(markers);