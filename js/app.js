

$(document).ready(function() {
  
  $('#panel').on('submit', function(evt){
    var address = $('#address').val();
    evt.preventDefault();
    getRequest(address);
    geocode(address);
  });
});


//initialize a map
var map = L.map('map', {
  layers: MQ.mapLayer()
});

//geocode a location
function geocode(address) {
  MQ.geocode({map: map})
  .search(address);
}

var getRequest = function(address){
  var request = {
    key: 'HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL',
    locations: address
  };
  $.ajax({
    url: 'http://www.mapquestapi.com/geocoding/v1/address?',
    data: request,
    dataType: 'json',
    type: "GET"
  })
  .done(function(result){
    console.log(result);
  })
  .fail(function(jqXHR, error){
    console.log(error);
  });
}


//function getRequest(address){
//  var params = {
//    key: 'HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL',
//    locations: address
//  } 
//  url = 'http://www.mapquestapi.com/geocoding/v1/address?';
//  
//  $.getJSON(url, params, function(data){
//    debugger;
//    console.log(data);
//  })
//}


// $.getJSON('http://www.mapquestapi.com/geocoding/v1/address?key=HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL&location=Lancaster,PA', function(data){
//    var data = data.results;
//    console.log(data);
//  });





