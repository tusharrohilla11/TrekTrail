// we have to swap geometry coordinates
var map = L.map('map').setView([trek.geometry.coordinates[1], trek.geometry.coordinates[0]], 12); // coordinates, zoomLevel


const mainLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://carto.com/">carto.com</a> contributors'
});
mainLayer.addTo(this.map);


var marker = L.marker([trek.geometry.coordinates[1], trek.geometry.coordinates[0]])
                .addTo(map);

marker.bindPopup(`<h6>${trek.title}</h6> <p>${trek.location}</p>`);

marker.on('mouseover', function () {
    this.openPopup();
});

marker.on('mouseout', function () {
    this.closePopup();
});

marker.on('click', function () {
    this.openPopup();
});