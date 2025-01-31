// Create the 'basemap' tile layer that will be the background of our map.
function createMap(earthquakes) {
    // Set tile layer for map
    let earthquake_map = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
    });

    // Create the map object with center and zoom options.
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [earthquake_map, earthquakes]
    });
    
  // Create a legend control object.
    let legend = L.control({ 
        position: "bottomright" 
    });

  // Then add all the details for the legend
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        div.style.backgroundColor = "white"; 
        div.style.padding = "6px 8px";
        div.style.fontSize = "12px";
        let depths = [-10, 10, 30, 50, 70, 90];  // depth intervals
        let colors = ["#00FF00", "#9ACD32", "#ADFF2F", "#FFD700", "#FF8C00", "#FF0000"];
    
        // Loop through our depth intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < depths.length; i++) {
            div.innerHTML +=
                `<i style="background:${colors[i]}; width: 12px; height: 12px; display: inline-block;"></i> ${depths[i]}${(depths[i + 1] ? '&ndash;' + depths[i + 1] : '+')}<br>`;
        }
        return div;
    };
    legend.addTo(myMap);
}

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    createFeatures(data.features);
});

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
function createFeatures(earthquakeData) {
    // Create popups for features
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>Lat, Lng, Depth: ${feature.geometry.coordinates}</h3>
            <hr><p>Location: ${feature.properties.place}</p>
            <hr><p>Magnitude: ${feature.properties.mag}</p>
            <hr><p>Date & Time: ${new Date(feature.properties.time)}</p>`);
    }

  // This function determines the color of the marker based on the depth of the earthquake.
    function getColor(depth) {
        return depth > 90 ? "#FF0000" :
               depth > 70 ? "#FF8C00" :
               depth > 50 ? "#FFD700" :
               depth > 30 ? "#ADFF2F" :
               depth > 10 ? "#9ACD32" :
                            "#00FF00";
    }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return magnitude * 4;
}

    // Add a GeoJSON layer to the map once the file is loaded.
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: Math.sqrt(feature.properties.mag) * 5,
                fillColor: getColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.65 
            });
        },
        onEachFeature: onEachFeature // Bind popups
    });

    // Create map
    createMap(earthquakes);
}


