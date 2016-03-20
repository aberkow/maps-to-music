$(document).ready(function() {
  $('#panel').submit(function() {
    //evt.preventDefault();
    geoCodeAddress(geocoder, map);
    console.log('click');
  });
});


var map;
  
  function initMap() {
    var geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });
    console.log(geocoder);
    console.log(map);
    console.log(initMap);
    
  } 

function geoCodeAddress(geocoder, resultsMap) {
  var address = $('#address').value;
  geocoder.geocode({'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location
      });
      console.log(marker);
    } else {
      alert("Geocode unsuccessful because" + status);
    }
  });
  console.log(address);
  
}


//$.getJSON('https://maps.googleapis.com/maps/api/directions/json?origin="185 West Ridge Dr., West Hartford, CT"&destination="2626 Albany Ave., West Hartford, CT"', function(data){
//    console.log(data);
//  });