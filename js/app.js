//initialize a map
var map = L.map('map', {
  layers: MQ.mapLayer(),
  center: [0, 0],
  zoom: 1
});
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var marker = L.marker();
var time;
var routeLineArr = [];//array of points for the route line overlay
var markerArr = [];
var dirToSound = {
  steps: undefined,
  timeArr: [], //becomes time argument in polysynth/part
  latArr: [], //becomes freq1 in polysynth
  lngArr: [],  //becomes freq2 in polysynth
  timeLatToneJSInstructionsArr: [], //the nested array to pass to part
  timeLngToneJSInstructionsArr: []
}

$(document).ready(function() {
  //tester to add a marker to the map. Uncomment if things get weird.
  //L.marker([50.5, 30.5]).addTo(map);
  $('.modal').hide();

  $('#panel').on('submit', function(evt){
    var address1 = $('#address1').val();
    var address2 = $('#address2').val();
    //var countDown = setInterval(timer, 10);
    evt.preventDefault();
    getDirections(address1, address2);
  });

  $('.tone').on('click', function() {
    mixArrays(dirToSound.timeArr, dirToSound.latArr, dirToSound.timeLatToneJSInstructionsArr);
    mixArrays(dirToSound.timeArr, dirToSound.lngArr, dirToSound.timeLngToneJSInstructionsArr);

    //Tone.setContext(audioContext);

    debugger;
    var synth1 = new Tone.simpleSynth().toMaster();
    //var synth2 = tone.simpleSynth().toMaster();

    //    var synth1 = new Tone.SimpleSynth().toMaster();
//    //var pan1 = new Tone.Panner(0.25).toMaster();
//    var synth2 = new Tone.SimpleSynth().toMaster();
//    //var pan2 = new Tone.Panner(0.75).toMaster();

    var part1 = new Tone.Part(function(time, note){
      synth1.triggerAttackRelease(note, '16n', time);
    }, dirToSound.timeLatToneJSInstructionsArr);

    var part2 = new Tone.Part(function(time, note){
      synth1.triggerAttackRelease(note, '16n', time);
    }, dirToSound.timeLngToneJSInstructionsArr);

    part1.start();
    part2.start();
    Tone.Transport.start();
    progressBar();
  });

  $('.reset').on('click', function(){
    $('#address1').val('');
    $('#address2').val('');
    map.setView([0, 0], 1);
    time = 0;
    routeLineArr.length = 0;
    dirToSound.steps = undefined;
    dirToSound.latArr.length = 0;
    dirToSound.lngArr.length = 0;
    dirToSound.timeArr.length = 0;
    dirToSound.timeLatToneJSInstructionsArr.length = 0;
    dirToSound.timeLngToneJSInstructionsArr.length = 0;
    clearRouteLine();
    clearProgressBar();
  });

  $('.info').on('click', function(){
    $('.modal').show();
  });

  $('.modal__button').on('click', function(){
    $('.modal').hide();
  });

});

/*map functions*/
//plot the route as a line with markers at beginning and end.
function routeLine(routeLineArr){
  var i;
  var startMarker = L.marker(routeLineArr[0]);
  var endMarker = L.marker(routeLineArr[routeLineArr.length - 1]);
  var polyLine = L.polyline(routeLineArr, {color: 'red', smoothFactor: 1.0});
  var layerGroup = L.layerGroup([startMarker, endMarker, polyLine]);
  console.log(layerGroup);
  layerGroup.addTo(map);
  map.fitBounds(polyLine.getBounds());
}

//clear the markers and route line from the map by accessing properties of the map directly
function clearRouteLine(){
  for(i in map._layers) {
    if((map._layers[i]._path != undefined) || (map._layers[i]._latlng != undefined)) {
      map.removeLayer(map._layers[i]);
    }
  }
}

function clearProgressBar(){
  $('.progress-bar__content').css({'width': 0});
}

//mouseEventToLatLng  - Returns the geographical coordinates of the point the mouse clicked on given the click's event object.
  function onMapClick(evt){
    console.log('a click! ' + evt.latlng);
    marker
      .setLatLng(evt.latlng)
      .addTo(map);
  }

/*helper functions*/
//shorten the times from the GET request by 1/1000
function timeStringToMS(time){
  var timeArr = time.split(':');
  var timeString = timeArr[0].concat(timeArr[1]).concat(timeArr[2]);
  var timeInt = parseInt(timeString, 10) / 1000;
  return timeInt;
}

/*
  This function takes two arrays and interleaves them to produce a new array - [1, 2, 3, 4].....[a, b, c, d]......[1,a,2,b,3,c,4,d]
  Then the array is split into groups of 2 and pushed to "Instructions"
  [[1,a], [2,b].... ]
*/
function mixArrays(array1, array2, destinationArray){
  if(array1.length !== array2.length){
    throw new Error('Arrays are not the same length.')
  }
  return array1.map(function(currentValue, index){
    destinationArray.push([currentValue, array2[index]]);
    return [currentValue, array2[index]];
  });
}

function progressBar(){
  $('.progress-bar__content').animate({
    width: "100%"
  }, time);
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
    time = result.route.legs[0].time;
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

/*sound functions try some different synths etc....*/
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
