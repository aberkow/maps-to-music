//var poi = new MQA.Poi({lat: 39.743943, lng: -105.020089});
 //tester request 
//  $.getJSON('http://www.mapquestapi.com/geocoding/v1/address?key=HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL&location=Lancaster,PA', function(data){
//    var data = data.results;
//    console.log(data);
//  });

var marker = L.marker();
var time;
var dirToSound = {
  timeArr: [],
  latArr: [],
  lngArr: [] 
}

$(document).ready(function() {
 
  L.marker([50.5, 30.5]).addTo(map);
  $('#panel').on('submit', function(evt){
    var address = $('#address').val();
    evt.preventDefault();
    //get the json data
    getRequest(address);
    //code the address from the form
    geocode(address);
  });
  //tester to make sure I'm not crazy - can be removed later
  $('.tone').on('click', function() {
    var synth = new Tone.SimpleSynth().toMaster();
    var loop = new Tone.Loop(function(time){
    synth.triggerAttackRelease("C4", "8n", time); 
    console.log(time);
  }, "4n");
  loop.start("1m").stop("4m");
  
  Tone.Transport.start();
  });
  
  map.on('click', onMapClick);
  
  getDirections('West Hartford, CT', 'Boston, MA');
});

/*map functions*/
//initialize a map
var map = L.map('map', {
  layers: MQ.mapLayer(),
  center: [51.505, -0.09],
  zoom: 5
});

//geocode a location
function geocode(address) {
  MQ.geocode({map: map})
  .search(address);
}

//mouseEventToLatLng  - Returns the geographical coordinates of the point the mouse clicked on given the cl ick's event object.
  function onMapClick(evt){
    console.log('a click! ' + evt.latlng);
    marker
      .setLatLng(evt.latlng)
      .addTo(map);
  }  

/*helper functions*/
function timeStringToMS(time){
  var timeArr = time.split(':');
  var timeString = timeArr[0].concat(timeArr[1]).concat(timeArr[2]);
  var timeInt = parseInt(timeString, 10);
  //debugger;   
  //console.log(timeInt);
  return timeInt;
}
/*get function*/

//function to get directions. returns json obj access @ results.route etc
var getDirections = function(address1, address2){
  var request = {
    key: 'HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL',
    from: address1,
    to: address2
  };
  $.ajax({
    url:'http://www.mapquestapi.com/directions/v2/route?',
    data: request,
    dataType: 'JSON',
    type: 'GET'
  })
  .done(function(result){
    console.log(result.route.legs[0]);
    for (var i = 0; i < result.route.legs[0].maneuvers.length; i++) {
      dirToSound.latArr.push(result.route.legs[0].maneuvers[i].startPoint.lat);
      dirToSound.lngArr.push(result.route.legs[0].maneuvers[i].startPoint.lng);
      dirToSound.timeArr.push(timeStringToMS(result.route.legs[0].maneuvers[i].formattedTime));
    }
  })
  .fail(function(jqXHR, error){
    console.log(error);
  });
}

/*sound functions*/
var quickSynth = function(freq){
  var synth = new Tone.SimpleSynth().toMaster();
  synth.triggerAttackRelease(freq, '8n');               
  }

var testSynth = function(freq){
  var synth = new Tone.SimpleSynth({
    oscillator: {type: 'square'},
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1
    }
  })
  .toMaster();
  synth.triggerAttackRelease(freq, '2n');
}

var quickFMSynth = function(freq1, freq2){
  var synth = new Tone.FMSynth({
    carrier: {
      filterEnvelope: {baseFrequency: freq1}
    },
    modulator: {
      filterEnvelope: {baseFrequency: freq2}
    }
  }).toMaster();
  synth.triggerAttackRelease("c4", "2n");
}

var polySynth = function(freq1, freq2){
  var synth = new Tone.PolySynth(2, Tone.FMSynth).toMaster();
  synth.triggerAttackRelease([freq1, freq2], '2n');
}


//var getRequest = function(address){
//  var request = {
//    key: 'HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL',
//    location: address
//  };
//  $.ajax({
//    url: 'http://www.mapquestapi.com/geocoding/v1/address?',
//    data: request,
//    dataType: 'JSON',
//    type: "GET"
//  })
//  .done(function(result){
//   console.log(result.results[0].locations[0]); console.log(result.results[0].locations[0].latLng.lat);
//    console.log(result.results[0].locations[0].latLng.lng);
//    //debugger;
//    var lat = result.results[0].locations[0].latLng.lat;
//    var lng = result.results[0].locations[0].latLng.lng;
//    //quickSynth(lat);
//    //testSynth(lat);
//    //quickFMSynth(lat, lng);
//    polySynth(lat, lng);
//    //debugger;
//  })
//  .fail(function(jqXHR, error){
//    console.log(error);
//  });
//}

    
    






