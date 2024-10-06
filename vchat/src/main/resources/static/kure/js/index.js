/*
* (C) Copyright 2014-2015 Kurento (http://kurento.org/)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getopts(args, opts)
{
  var result = opts.default || {};
  args.replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function($0, $1, $2, $3) { result[$1] = decodeURI($3); });

  return result;
};

var args = getopts(location.search,
{
  default:
  {
    // Non-secure WebSocket
    // Only valid for localhost access! Browsers won't allow using this for
    // URLs that are not localhost. Also, this matches the default KMS config:
    // ws_uri: "ws://" + location.hostname + ":8888/kurento",

    // Secure WebSocket
    // Valid for localhost and remote access. To use this, you have to edit the
    // KMS settings file "kurento.conf.json", and configure the section
    // "mediaServer.net.websocket.secure". Check the docs:
    // https://doc-kurento.readthedocs.io/en/latest/features/security.html#features-security-kms-wss
    // ws_uri: "wss://81.25.50.12:8433/kurento",
    // ws_uri: "wss://motivation.ru:8433/kurento",
    ws_uri: "wss://demo.xter.tech:8433/kurento",
    file_name: 'welcome.webm',
    file_uri: 'file:///',
    o: '',
    p: 0,
    ice_servers: undefined
  }
});

var videoInput;
var videoOutput;
var webRtcPeer;
var client;
var pipeline;
var file_to_play='';
var pref = getCookie('cdAuth');pref=pref.substr(8,8);

const IDLE = 0;
const DISABLED = 1;
const CALLING = 2;
const PLAYING = 3;

function setStatus(nextState){
  switch(nextState){
    case IDLE:
      $('#start').attr('disabled', false)
      $('#stop').attr('disabled',  true)
      $('#play').attr('disabled',  false)
      break;

    case CALLING:
      $('#start').attr('disabled', true)
      $('#stop').attr('disabled',  false)
      $('#play').attr('disabled',  true)
      break;

    case PLAYING:
      $('#start').attr('disabled', true)
      $('#stop').attr('disabled',  false)
      $('#play').attr('disabled',  true)
      break;

    case DISABLED:
      $('#start').attr('disabled', true)
      $('#stop').attr('disabled',  true)
      $('#play').attr('disabled',  true)
      break;
  }
}


function setIceCandidateCallbacks(webRtcPeer, webRtcEp, onerror)
{
  webRtcPeer.on('icecandidate', function(candidate) {
    console.log("Local candidate:",candidate);

    candidate = kurentoClient.getComplexType('IceCandidate')(candidate);

    webRtcEp.addIceCandidate(candidate, onerror)
  });

  webRtcEp.on('IceCandidateFound', function(event) {
    var candidate = event.candidate;

    console.log("Remote candidate:",candidate);

    webRtcPeer.addIceCandidate(candidate, onerror);
  });
}


window.onload = function() {
  console = new Console();

  videoInput = document.getElementById('videoInput');
  videoOutput = document.getElementById('videoOutput');

  setStatus(IDLE);
//console.log('local',local);
}

function start() {
  setStatus(DISABLED);
  showSpinner(videoInput, videoOutput);
  
  var options =
  {
    localVideo: videoOutput,
    remoteVideo: null 
  }

  if (args.ice_servers) {
    console.log("Use ICE servers: " + args.ice_servers);
    options.configuration = {
      iceServers : JSON.parse(args.ice_servers)
    };
  } else {
   // console.log("Use freeice")
  }

  webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(error)
  {
    if(error) return onError(error)

    this.generateOffer(onStartOffer)
  });
console.log('Preparing to start .. hold on');
}

function stop(err) {
  if (webRtcPeer) {
    webRtcPeer.dispose();
    webRtcPeer = null;
  }

  if(pipeline){
    pipeline.release();
    pipeline = null;
  }

  hideSpinner(videoInput, videoOutput);
  setStatus(IDLE);
  var why = 'Really?';
if (bu == 1) {var ha = err ? '' : '-- BUFFER --';document.getElementById('informer').innerHTML=ha;return false;} if (bu == 2) {if ($('#myForm_unbuf_vmail')) $('#myForm_unbuf_vmail').remove();let form = document.createElement('form');
			form.setAttribute('method', 'get');
			form.setAttribute('id', 'myForm_unbuf_vmail');
			document.body.appendChild(form);let frm=$('#myForm_unbuf_vmail');frm.submit(function(e) {e.preventDefault();$.ajax({type: frm.attr('method'),url: act_unbuf+'&id='+curr,success: function(response) {check_response(response);console.log('clean buffer:',response);let obj = JSON.parse(response);
			if (obj.result == 'OK') {console.log('buffer cleaned');} else {console.log('could not clean buffer');}}})});frm.trigger('submit');document.getElementById('informer').innerHTML=su;}
}

function play(f){
  setStatus(DISABLED)
  showSpinner(videoOutput);
  document.getElementById('informer').innerHTML='';
  
  file_to_play = f;
 
  var options =
  {
    localVideo: null,
    remoteVideo: videoOutput
  }

  if (args.ice_servers) {
    console.log("Use ICE servers: " + args.ice_servers);
    options.configuration = {
      iceServers : JSON.parse(args.ice_servers)
    };
  } else {
  //  console.log("Use freeice")
  }


  webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error)
  {
    if(error) return onError(error)

    this.generateOffer(onPlayOffer);
  });
}

function onPlayOffer(error, sdpOffer){
  if(error) return onError(error);

  co(function*(){
    try{
      
      var addr = local ? "wss://192.168.88.99:8432/kurento" : args.ws_uri;
      
      if(!client) client = yield kurentoClient(addr);

      pipeline = yield client.create('MediaPipeline');

      var webRtc = yield pipeline.create('WebRtcEndpoint');
      setIceCandidateCallbacks(webRtcPeer, webRtc, onError)
      
      var f = file_to_play.length ? args.file_uri+'tmp/'+args.o+'/'+pref+'.'+file_to_play : args.file_uri+'tmp/'+pref+args.o+'rec.webm';
//console.log('play file',f);
      var player = yield pipeline.create('PlayerEndpoint', {uri : f});

      player.on('EndOfStream', stop);

      yield player.connect(webRtc);

      var sdpAnswer = yield webRtc.processOffer(sdpOffer);
      webRtc.gatherCandidates(onError);
      webRtcPeer.processAnswer(sdpAnswer);

      yield player.play()

      setStatus(PLAYING)
    }
    catch(e)
    {
      onError(e);
    }
  })();
}

function onStartOffer(error, sdpOffer)
{
  if(error) return onError(error)

  co(function*(){
    try{
    var addr = local ? "wss://192.168.88.99:8432/kurento" : args.ws_uri;
      if(!client)
        client = yield kurentoClient(addr);

      pipeline = yield client.create('MediaPipeline');

      var webRtc = yield pipeline.create('WebRtcEndpoint');
      setIceCandidateCallbacks(webRtcPeer, webRtc, onError)
      
      var f = args.file_uri+'tmp/'+pref+args.o+'rec.webm';
//console.log('rec file',f);

      var recorder = yield pipeline.create('RecorderEndpoint', {uri: f, mediaProfile:'WEBM'});
      yield webRtc.connect(recorder);
      yield webRtc.connect(webRtc);
      
      yield recorder.record();
      
      var sdpAnswer = yield webRtc.processOffer(sdpOffer);
      webRtc.gatherCandidates(onError);
      webRtcPeer.processAnswer(sdpAnswer)

      setStatus(CALLING);
setTimeout(function(){ alert('RECORDING!'); }, 1000);
console.log('RECORDING...');

    } catch(e){
      onError(e);
    }
  })();
}

function onError(error) {
  if(error)
  {
    console.error(error);
    stop(1);
  }
}

function showSpinner() {
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].poster = '/kure/img/transparent-1px.png';
    arguments[i].style.background = "center transparent url('/kure/img/spinner.gif') no-repeat";
  }
}

function hideSpinner() {
  for (var i = 0; i < arguments.length; i++) {
    arguments[i].src = '';
    arguments[i].poster = '/kure/img/webrtc.png';
    arguments[i].style.background = '';
  }
}

/**
 * Lightbox utility (to display media pipeline image in a modal dialog)
 */
$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
  event.preventDefault();
  $(this).ekkoLightbox();
});
