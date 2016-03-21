//var poi = new MQA.Poi({lat: 39.743943, lng: -105.020089});

$(document).ready(function() {
  //tester request 
//  $.getJSON('http://www.mapquestapi.com/geocoding/v1/address?key=HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL&location=Lancaster,PA', function(data){
//    var data = data.results;
//    console.log(data);
//  });
  
  $('#panel').on('submit', function(evt){
    var address = $('#address').val();
    evt.preventDefault();
    //get the json data
    getRequest(address);
    //code the address from the form
    geocode(address);
  });
  
  $('.tone').on('click', function() {
    var synth = new Tone.SimpleSynth().toMaster();
    var loop = new Tone.Loop(function(time){
    synth.triggerAttackRelease(, "8n", time); 
    console.log(time);
  }, "4n");
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
    location: address
  };
  $.ajax({
    url: 'http://www.mapquestapi.com/geocoding/v1/address?',
    data: request,
    dataType: 'JSON',
    type: "GET"
  })
  .done(function(result){
    console.log(result.results[0].locations[0].latLng.lat);
    console.log(result.results[0].locations[0].latLng.Lng);
    debugger;
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








