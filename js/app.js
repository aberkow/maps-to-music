//var poi = new MQA.Poi({lat: 39.743943, lng: -105.020089});
 //tester request 
//  $.getJSON('http://www.mapquestapi.com/geocoding/v1/address?key=HXvKIUqt6UDLbQxrqm9hV2Gds65G8QbL&location=Lancaster,PA', function(data){
//    var data = data.results;
//    console.log(data);
//  });

var marker = L.marker();
var test = [[0,1], [2, 3], [4,5]]
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
    debugger;
    var synth1 = new Tone.SimpleSynth().toMaster();
    //var pan1 = new Tone.Panner(0.25).toMaster();
    var synth2 = new Tone.SimpleSynth().toMaster();
    //var pan2 = new Tone.Panner(0.75).toMaster();
    
    /*****Figure out how to remake the dirToSound.time.... Arrays into an array of arrays, not an array of objects*************/

    var part1 = new Tone.Part(function(time, note){
      synth1.triggerAttackRelease(note, '8n', time);
    }, dirToSound.timeLatToneJSInstructionsArr);
  
    var part2 = new Tone.Part(function(time, note){
      synth2.triggerAttackRelease(note, '8n', time);
    }, dirToSound.timeLngToneJSInstructionsArr);
    
//    var part1 = new Tone.Part(function(time, note){
//      synth1.triggerAttackRelease(note, '8n', time);
//    }, [[0, 220], [0.5, 440], [1, 880]]);
//  
//    var part2 = new Tone.Part(function(time, note){
//      synth2.triggerAttackRelease(note, '8n', time);
//    }, [[0, 330], [0.5, 600], [1, 1000]]);
    part1.start();
    part2.start();
//    var oscSynth = function(freq1, freq2){
//      var osc1 = new Tone.Oscillator(freq1, square).connect(pan1);
//      var osc2 = new Tone.Oscillator(freq2, sine).connect(pan2);
//      var pan1 = new Tone.Panner(0.25).toMaster();
//      var pan2 = new Tone.Panner(0.75).toMaster();
//    }
//    var part = new Tone.Part(function(time, note1, note2){
//      oscSynth.triggerAttackRelease(note1, note2, '8n', time);
//    }, [[0, [220, 330]], [0.5, [440, 600]], [ 1, [880, 1000]]]);
//    part.start();
    Tone.Transport.start();
    
    
//    var synth = new Tone.SimpleSynth().toMaster();
//    var loop = new Tone.Loop(function(time){
//    synth.triggerAttackRelease("C4", "8n", time); 
//    console.log(time);
//  }, "4n");
//  loop.start("1m").stop("4m");
//  
//  Tone.Transport.start();
  });
  
  map.on('click', onMapClick);
  
  //getDirections('West Hartford, CT', 'Boston, MA');
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
  //try to find a way to implement smoothFactor option currently not working.
  var polyLine = L.polyline(routeLineArr, {color: 'red', smoothFactor: 1.0}).addTo(map);
  //debugger;
  startMarker.addTo(map);
  //debugger;
  endMarker.addTo(map);
  //debugger;
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
  var timeInt = parseInt(timeString, 10) / 100;
  //debugger;   
  //console.log(timeInt);
  return timeInt;
}

function formatDirToSound() {
  //create nested arrays from the dirToSound obj to pass to Tone.Part
  var timeLatCoordinates = [];
  var timeLngCoordinates = [];
  for (var i = 0; i < dirToSound.steps; i++){
    var timeLatCoordinateObj = {
      time: dirToSound.timeArr[i],
      lat: dirToSound.latArr[i],
    };
    var timeLngCoordinateObj = {
      time: dirToSound.timeArr[i],
      lng: dirToSound.lngArr[i]
    }
    timeLatCoordinates.push(timeLatCoordinateObj);
    timeLngCoordinates.push(timeLngCoordinateObj);
  };
  dirToSound.timeLatToneJSInstructionsArr.push(timeLatCoordinates);
  dirToSound.timeLngToneJSInstructionsArr.push(timeLngCoordinates);
  return dirToSound.timeLatToneJSInstructionsArr;
  return dirToSound.timeLngToneJSInstructionsArr;
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
      routeLine(routeLineArr); 
      //formatDirToSound();
    }
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

    
    






