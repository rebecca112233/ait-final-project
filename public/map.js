let mymap = L.map('mapid').setView([51.505, -0.09], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(mymap);

const popup = L.popup();
const pin = $(".pin");
let pinArray = [];
let descArray = [];
let latLng;

function onMapClick(e){
    //shows popup with directions
    popup
        .setLatLng(e.latlng)
        .setContent('Want to pin? Add a description and click "Pin"')
        .openOn(mymap)
        latLng = e.latlng
}

//adds a marker with a popup description
pin.click(function(){
    const description = document.getElementById("description").value;
    pinArray.push(latLng);
    console.log(latLng);
    descArray.push(description);
    L.marker(latLng).addTo(mymap).bindPopup(description).openPopup();

    //store in html
    let hiddenPins = document.getElementById("myHiddenPins");
    hiddenPins.value = pinArray;

    let hiddenDescs = document.getElementById("myHiddenDescs");
    hiddenDescs.value = descArray;
})

mymap.on('click', onMapClick);

let currentPinString = $('#currentPins').text();
let currentDescString = $('#currentDescs').text();

let currentPinArray = currentPinString.split(",");
let currentDescArray = currentDescString.split(",");

//shows previous pins
if(currentPinArray !== null || currentPinArray !== undefined){
    for(let i = 0; i < currentPinArray.length; i+=2){
        let currentPin = currentPinArray[i] + currentPinArray[i+1];
        let first = parseFloat(currentPin.substring(7, 16));
        let second = parseFloat(currentPin.substring(17, 26));
        let currentDesc = currentDescArray[i/2];

        L.marker([first,second]).addTo(mymap).bindPopup(currentDesc).openPopup();
    }
}