let newMarker = null;
let marker;
let map;
const latitude = [];
const longitude = [];
let options;
const markers = [];

$(window).on("load", function() {
  const mapID = window.location.pathname.toString().substr(6);
  $.ajax({
    type: "GET",
    url: `/api/maps/${mapID}`
  })
  .done(function(map) {
    const { x, y } = map[mapID].map_coordinates;
    options = {
        zoom: 14, //max is 14
        center: {
          lat: x,
          lng: y
        } // center of map
      };
      for (const marker of map.markers) {
        const { marker_title, marker_description, marker_coordinates, marker_img_url} = marker;
        const markerArray = [];

        console.log(map.markers)

        const { x, y } = marker_coordinates;
        markerArray.push(marker_title, marker_description, x, y, marker_img_url);
        markers.push(markerArray);
      }
    })
    .then(() => {
      initMap();
    });
});

function initMap() {
  //map options

  //new map
  map = new google.maps.Map(document.getElementById("map-canvas"), options);
  console.log(document.getElementById("map-canvas"))

  console.log(options,'options')
    // Display multiple markers on a map
    let infoWindow = new google.maps.InfoWindow(), marker, i;

    let infoWindowContent = [];

    for (let i = 0; i < markers.length; i++) {

      const position = new google.maps.LatLng(markers[i][2], markers[i][3]);
      console.log(position);

      marker = new google.maps.Marker({
        position: position,
        map: map,
        title:markers[i][0]
      });

      console.log(markers[i] ,'new markers')

      infoWindowContent.push([`
        <h4><strong>${markers[i][0]}</strong></h4>
        <p>${markers[i][1]}</p>
        <p><img src=${markers[i][4]}></p>`])

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infoWindow.setContent(infoWindowContent[i][0]);
          infoWindow.open(map, marker);
        }
      })(marker, i));
    }

  //listen for click on map
  google.maps.event.addListener(map, "click", function(event) {
    addMarker({ coords: event.latLng });

    $("#marker-form").on("submit", function(e) {
      e.preventDefault();

      console.log(e.target);
      let markerTitle = $("#marker-title").val();
      let markerImage = $("#marker-image").val();
      let markerDesc = $("#marker-desc").val();

      const mapID = window.location.pathname.toString().substr(6);

      const markerObj = {
        user_id: Cookies.get("user_id"),
        map_id: mapID,
        title: markerTitle,
        image_url: markerImage,
        description: markerDesc,
        coordinates: {
          lat: latitude[latitude.length - 1],
          lng: longitude[longitude.length - 1]
        }
      };
      console.log("~~~~~~~~~~~~~")
      console.log(markerObj)
      console.log("~~~~~~~~~~~~~")

      $.ajax({
        type: "POST",
        url: "/api/markers/new",
        data: markerObj,
        success: function(data) {
          console.log("~~~~~~~~~");
          console.log(data, "data");
          window.location.href = `/maps/${data.map_id}`;
        }
      });
    });
  });
}

//add marker function
function addMarker(props) {
  latitude.push(props.coords.lat());
  longitude.push(props.coords.lng());

  if (newMarker) {
    //if marker already was created change positon
    newMarker.setPosition(props.coords);
  } else {
    //create a marker
    newMarker = new google.maps.Marker({
      position: props.coords,
      map: map,
      draggable: true
    });
  }
}
