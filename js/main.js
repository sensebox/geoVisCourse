mapboxgl.accessToken = 'pk.eyJ1IjoidW11dDAwIiwiYSI6ImNqbHozcmh5NjF2MmozcGw5dGRkaTU1bXkifQ.XnRUqIPWjsTOz5zYOOMAow';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    zoom: 8,
    center: [13, 52]
});

let globaleDate = '2018-08-01T00:00:00.000Z';

let fromDate = '2018-08-01T00:00:00.000Z'
let toDate = '2018-08-02T00:00:00.000Z'

function getData(){
    console.log(map.getBounds());
    let bbox = map.getBounds();

    let url = `https://api.opensensemap.org/statistics/descriptive
?phenomenon=Temperatur
&from-date=${fromDate}
&to-date=${toDate}
&exposure=outdoor
&operation=arithmeticMean
&format=json
&columns=lat,lon
&window=360000
&bbox=${bbox._sw.lng},${bbox._sw.lat},${bbox._ne.lng},${bbox._ne.lat}`


    fetch(url)
        .then(data => data.json())
        .then(data => {
            drawData(data);
        });

}


function drawData(data) {
    console.log(data);

    let geoJsonData = data.map(data => {
        return {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [data.lon, data.lat]
            },
            "properties": data
          }
    })

    let geoJson = {
        "type" : "FeatureCollection",
        "features" : geoJsonData
    }

    map.addSource('temp', {
        type: 'geojson',
        data: geoJson
    })

    map.addLayer({
        id: 'tempLayer',
        source: 'temp',
        type: 'circle',
        paint: {
            'circle-radius':  {stops: [[8, 4], [11, 6], [16, 40]]},
            'circle-color': [
                'interpolate',
                ['linear'],
                ['get', fromDate],
                15, 'blue',
                25, 'yellow',
                35, 'red'
            ]
        }
    })

    map.addLayer({
        id: "temp-value",
        type: "symbol",
        source: "temp",
        layout: {
            "text-field": "{2018-08-01T00:00:00.000Z}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'tempLayer', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = parseFloat(e.features[0].properties[globaleDate]).toFixed(2);

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    map.on('mouseleave', 'tempLayer', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });

    var slider = document.getElementById('rangeSlider');

    slider.setAttribute('min', new Date(fromDate).getTime());
    slider.setAttribute('max', new Date(toDate).getTime());
}


function changeData(date){

    let dateObj = new Date(parseInt(date));

    globalDate = dateObj.toISOString();
    document.getElementById('dateString').innerHTML = dateObj.toLocaleString();
    map.setPaintProperty('tempLayer', 'circle-color', [
        'interpolate',
        ['linear'],
        ['get', dateObj.toISOString()],
        15, 'blue',
        25, 'yellow',
        35, 'red'
    ])

}