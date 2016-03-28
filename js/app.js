//var poi = new MQA.Poi({lat: 39.743943, lng: -105.020089});
 //tester request 
//  $.getJSON('http://www.mapquestapi.com/geocoding/v1/address?key=HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL&location=Lancaster,PA', function(data){
//    var data = data.results;
//    console.log(data);
//  });

var marker = L.marker();
var time;
var routeLineArr = [];//array of points for the route line overlay
var dirToSound = {
  steps: undefined,
  timeArr: [], //becomes time argument in polysynth/part
  latArr: [], //becomes freq1 in polysynth
  lngArr: [],  //becomes freq2 in polysynth
  timeLatToneJSInstructionsArr: [], //the nested array to pass to part
  timeLngToneJSInstructionsArr: []
}

$(document).ready(function() {
  //tester to add a marker to the map.
  //L.marker([50.5, 30.5]).addTo(map);
  $('#panel').on('submit', function(evt){
    var address1 = $('#address1').val();
    var address2 = $('#address2').val();
    evt.preventDefault();
    //get the json data
    getDirections(address1, address2);
    //formatDirToSound();
    //routeLine(routeLineArr); //trouble showing the line at this point. 
    //console complains of uncaught typeError
    //but I can call it separately after everything is loaded......
  });
  
  //tester to make sure I'm not crazy - can be removed later
  $('.tone').on('click', function() {
    formatDirToSound();
    //debugger;
    var synth1 = new Tone.SimpleSynth().toMaster();
    //var pan1 = new Tone.Panner(0.25).toMaster();
    var synth2 = new Tone.SimpleSynth().toMaster();
    //var pan2 = new Tone.Panner(0.75).toMaster();

    var part1 = new Tone.Part(function(time, note){
      synth1.triggerAttackRelease(note, '16n', time);
    }, dirToSound.timeLatToneJSInstructionsArr[0]);
  
    var part2 = new Tone.Part(function(time, note){
      synth2.triggerAttackRelease(note, '16n', time);
    }, dirToSound.timeLngToneJSInstructionsArr[0]);
    
    part1.start();
    part2.start();
    Tone.Transport.start();
  });
  
  map.on('click', onMapClick);

});

/*map functions*/
//initialize a map
var map = L.map('map', {
  layers: MQ.mapLayer(),
  center: [0, 0],
  zoom: 1
});

//geocode a location
function geocode(address) {
  MQ.geocode({map: map})
  .search(address);
}

//plot the route as a line with markers at beginning and end.
function routeLine(routeLineArr){
  var startMarker = L.marker(routeLineArr[0]);
  var endMarker = L.marker(routeLineArr[routeLineArr.length - 1]);
  var polyLine = L.polyline(routeLineArr, {color: 'red', smoothFactor: 1.0}).addTo(map);
  //find a way to add other markers back to map.
  startMarker.addTo(map);
  endMarker.addTo(map);
  map.fitBounds(polyLine.getBounds());  
}

//mouseEventToLatLng  - Returns the geographical coordinates of the point the mouse clicked on given the click's event object.
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
  var timeInt = parseInt(timeString, 10) / 1000;
  //debugger;   
  //console.log(timeInt);
  return timeInt;
}

function formatDirToSound() {
  //interleave the time and Lat arrays so they alternate
  var timeLatCoordinates = $.map(dirToSound.timeArr, function (value, index){
    return [value, dirToSound.latArr[index]];
  });
  var timeLngCoordinates = $.map(dirToSound.timeArr, function (value, index){
    return [value, dirToSound.lngArr[index]];
  });
  //Chunk every 2 elements in the large array and push them in to "Instructions" 
  //confirm what this means.....
  Array.prototype.chunk = function(number){
    if (!this.length){
      return [];
    }
    //debugger;
    return [this.slice(0, number)].concat(this.slice(number).chunk(number));
  }
  //push the chunked arrays to "Instructions"
  dirToSound.timeLatToneJSInstructionsArr.push(timeLatCoordinates.chunk(2));
  dirToSound.timeLngToneJSInstructionsArr.push(timeLngCoordinates.chunk(2));
}

// MIDI info is in steps btwn 0 - 127
function convertLatToMIDINote(lat) {
  if (lat >= -90.0 && lat <= 90.0) {
    return parseInt((parseInt(lat, 10) + 90) / 180 * 127);
  } else {
    console.log('Please enter a number between -90 and 90');
  } 
}

function convertLngToMIDINote(lng) {
  if (lng >= -180.0 && lng <= 180.0) {
    return parseInt((parseInt(lng, 10) + 180) / 360 * 127);
  } else {
    console.log('Please enter a number between -180.0 and 180.0');
  }  
}
/*get function*/

//function to get directions. returns json obj access @ results.route etc
function getDirections(address1, address2){
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
    dirToSound.steps = result.route.legs[0].maneuvers.length;
    for (var i = 0; i < result.route.legs[0].maneuvers.length; i++){
      routeLineArr.push(result.route.legs[0].maneuvers[i].startPoint);
      dirToSound.latArr.push(result.route.legs[0].maneuvers[i].startPoint.lat);
      dirToSound.lngArr.push(result.route.legs[0].maneuvers[i].startPoint.lng);
      dirToSound.timeArr.push(timeStringToMS(result.route.legs[0].maneuvers[i].formattedTime));
    }
    routeLine(routeLineArr);
  })
  .fail(function(jqXHR, error){
    console.log(error);
  });
}

/*sound functions*/
function quickSynth(freq){
  var synth = new Tone.SimpleSynth().toMaster();
  synth.triggerAttackRelease(freq, '8n');               
  }

function testSynth(freq){
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

function quickFMSynth(freq1, freq2){
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

function polySynth(freq1, freq2){
  var synth = new Tone.PolySynth(2, Tone.FMSynth).toMaster();
  synth.triggerAttackRelease([freq1, freq2], '2n');
}

function playDirections(){
  var synth = new Tone.SimpleSynth.toMaster();
  var part = new Tone.Part(function(time, note){
    synth.triggerAttackRelease(note, "8n", time);
  })
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

    
    






