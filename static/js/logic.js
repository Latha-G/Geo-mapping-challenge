var apiKey = "pk.eyJ1IjoiYmthcHNhbGlzIiwiYSI6ImNrMzg2OTZnMzA0bTMzaW5yMWhyb2hxN3AifQ.LCoY1nACfyPGDfOOP7C5hg";

var graymap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {

  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox/light-v10",
  accessToken: apiKey

});

var satellitemap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {

  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox/satellite-streets-v11",
  accessToken: apiKey
});

var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox/outdoors-v11",
  accessToken: apiKey
});

// We then create the map object with options and then add the tile layers we just created to an array of layers.
var map = L.map("mapid", {
  center: [ 40.7, -94.5 ],
  zoom: 3,
  layers: [graymap, satellitemap, outdoors]
});

// Add our 'graymap' tile layer to the map.
graymap.addTo(map);

// We create the layers for our two different sets of data, earthquakes and tectonicplates.
var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Defining an object that contains all of our different map choices.
// Only one of these maps will be visible at a time!
var baseMaps = {
  Grayscale: graymap,
  Outdoors: outdoors,
  Satellite: satellitemap
};

// We define an object that contains all of our overlays. 
// Any combination of these overlays may be visible at the same time!

var overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// Add a control to the map that will allow the user to change which layers are visible.
L
  .control
  .layers(baseMaps, overlays)
  .addTo(map);

// Our AJAX call retrieves our earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // This function returns the style data for each of the earthquakes we plot on the map. 
  // We pass the magnitude of the earthquake into two separate functions to calculate the color and radius.

  function styleInfo(feature) {
      return {
        opacity: 1,
        fillOpacity: 1,
        fillColor: getColor(feature.properties.mag),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
  }

  // Determines the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
      switch (true) {
      case magnitude > 5:
        return "#1E0FA0";
      case magnitude > 4:
        return "#650AA2";
      case magnitude > 3:
        return "#13499E";
      case magnitude > 2:
        return "#188C9C";
      case magnitude > 1:
        return "#56B870";
      default:
        return "#BFE1B0";
      }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }
  
  console.log(data)

  // Here we add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {

    // Turn each feature into a circleMarker on the map.
    pointToLayer: function(feature, latlng) {
      console.log(feature)
      console.log(latlng)
      return L.circleMarker(latlng);
    },

    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    // Create a popup for each marker to display the magnitude and location of
    // the earthquake after the marker has been created and styled
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
    // We add the data to the earthquake layer instead of directly to the map.
  }).addTo(earthquakes);

  // Then we add the earthquake layer to our map.
  earthquakes.addTo(map);

  // Here we create a legend control object.
  var legend = L.control({
    position: "bottomright"
  });

  // Then we add all the details for our legend
  legend.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#BFE1B0",
      "#56B870",
      "#188C9C",
      "#13499E",
      "#650AA2",
      "#1E0FA0",
    ];

    // Loop through our intervals and generate a label with a colored square for each interval.
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // We add our legend to the map.
  legend.addTo(map);

  // Here we make an AJAX call to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(platedata) {
      
      // Adding our geoJSON data, along with style information, to the tectonicplates layer.
      L.geoJson(platedata, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicplates);

      // Then add the tectonicplates layer to the map.
      tectonicplates.addTo(map);
    });
});
