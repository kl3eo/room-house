var ws = new WebSocket('wss://' + location.host + '/groupcall');
var participants = {};
var name;

var pcounter = 0;
var i_am_guest = 0;
var registered = 0;
var guru_is_here = 0;
var rejoined = 0;

var problems = 0;
var altlang = ['en','ru','es','fr','cn','pt'];

var waiting = 1;
var waiting_period = 633000;
var logo_added = 0;

var firstTime = true;
var he_votado = false;

var playSomeMusic = false;
var shareSomeScreen = false;

var already_being_played = false;
var now_playing = false;

var audio = null;

var audience_number = 0;
var just_left = '';

var connection_is_good = 1;

var new_message = 0;

var acc_id = getCookie('acc') || '';

const ua = navigator.userAgent.toLowerCase();
const isAndroid = ua.indexOf("android") > -1;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const small_device = (check_iOS() || isAndroid) && screen.width <= 1024 ? true : false;

const fps = 15;
const wi = 640;
const fps_hq = 24;
const wi_hq = 1920;

const role  = 0;

window.onbeforeunload = function() {
	ws.close();
};

window.onload = function(){


   setInterval(function(){
       if ((registered && !now_playing)|| problems) rejoin();

   }, 30000 + Math.random() * 10000);

   setInterval(function(){

       if (registered && waiting && !now_playing) rejoin();

   }, waiting_period + Math.random() * 10000);

   setInterval(function(){
       
       if (registered) check_connection();

   }, 20000 + Math.random() * 10000);

   setInterval(function(){
       
       if (registered) check_fullscreen();

   }, 1000);
      
	var lang = getCookie('lang');
	lang = (lang === null || lang === 'null' || lang === '') ? w[0] === "club" || w[0].match(new RegExp('rgsu','g')) ? 1 : 0 : lang;
	ctr = lang;

	change_lang(altlang[ctr]);

	var vote = getCookie('vote');
	he_votado = (vote === null || vote === 'null') ? he_votado : vote;
}

ws.onmessage = function(message) {
	var parsedMessage = JSON.parse(message.data);

	switch (parsedMessage.id) {
	case 'existingParticipants':
		onExistingParticipants(parsedMessage);
		break;
	case 'existingViewers':
		onExistingViewers(parsedMessage);
		break;
	case 'newParticipantArrived':
		if (!fullscreen) onNewParticipant(parsedMessage);
		break;
	case 'newViewerArrived':
		onNewViewer(parsedMessage);
		break;
	case 'participantLeft':
		onParticipantLeft(parsedMessage);
		break;
	case 'receiveVideoAnswer':
		receiveVideoResponse(parsedMessage);
		break;
	case 'changeTab':
		changeTabLR(parsedMessage);
		break;
	case 'clearCoo':
		clearTimeoutAndLeave();
		break;
	case 'setGuru':
		setGuru(parsedMessage);
		break;
	case 'askGuru':
		askGuru(parsedMessage);
		break;
	case 'setCinema':
		setCinema(parsedMessage);
		break;
	case 'goodConnection':
		connection_is_good = 1;
		break;
	case 'newChatMessage':
		newChatMessage();
		break;
	case 'setAnno':
		setAnno(parsedMessage);
		break;
	case 'viewerLeft':
		just_left = parsedMessage.name;
		let na = just_left.split('_');
		let suf = na[na.length-1];	
		if ($('_au_'+suf)) {
			$('_au_'+suf).dispose();
			let cur = $('audience_numbers').innerHTML == '...' ? 0  :  parseInt($('audience_numbers').innerHTML)-1;
			cur = cur > 0 ? cur : '...';
			$('audience_numbers').innerHTML = cur;
			let col = cur > 0 ? '#369' : '#ccc';
			$('audience_numbers').setStyles({'color': col});
			$('audience_boxx').innerHTML = cur == '...' ? 'Audience is empty :(' : $('audience_boxx').innerHTML;
			//if (cur == '...') 
				{chat_shown = 1; $('logger').click(); $('audience').click();} 
		}
		break;
	case 'iceCandidate':
		participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
	        if (error) {
		      console.error("Error adding candidate: " + error);
		      return;
	        }
	    });
	    break;
	default:
		console.error('Unrecognized message', parsedMessage);
	}
}

function rejoin(){
	rejoined++;
	if (problems) {leaveRoom(); register();} else {

	
	   (function() { if ( i_am_guest && !guru_is_here && !fullscreen ) {soundEffect.src = "/sounds/drop.mp3"; $('phones').innerHTML = sorry; $('phones').fade(1); setTimeout(function() {location.reload()}, 1000);} else if (!i_am_guest & pcounter === 1 & rejoined % 2 == 0) {}
	   }).delay(200);
		
	   //console.log ('here pcounter is', pcounter, 'registered:', registered);	   
	/*   (function() { if ( pcounter === 0 && registered ) {soundEffect.src = "/sounds/drop.mp3"; $('phones').innerHTML = sorry; $('phones').fade(1); setTimeout(function() {location.reload()}, 1000);} else if (!i_am_guest & pcounter === 1 & rejoined % 2 == 0) {}
	   }).delay(1000);
	*/
	//NB: very difficult stuff :)
	}
}

function check_connection() {

	connection_is_good = 0;
	var message={id : 'checkConnection'}; 
	sendMessage(message);
	setTimeout(function() { if (!connection_is_good) { console.log('resetting connection'); problems = 1; leaveRoom(); register();}}, 1200);
}

function check_fullscreen() {

	if (fullscreen) {
		if ( !acc_id || window.screenTop ||  window.screenY || (!(window.innerWidth == screen.width && window.innerHeight == screen.height) && isAndroid) ) { fullscreen = false; if (!acc_id) {leaveRoom(); register();} else {fullscreen = true;}}
			
	}
}

function signalGuru(e) {

	e.preventDefault();
	e.stopPropagation(); 
 
	var message={id : 'signalGuru'}; 
	sendMessage(message); 

}

function leftHandler(e) {
	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;
		e.preventDefault();
		e.stopPropagation(); 
		let n=parseInt($('leftnum').innerHTML)+1; 
		$('leftnum').innerHTML = n.toString(); 
		var message={id :'plus', s: 'l', num: n}; 
		sendMessage(message); 
	
		//if (role != 1) {
			setCookie('vote',1,144000);
			he_votado = true;
			$('leftplus').removeEventListener('click', leftHandler);
                	$('rightplus').removeEventListener('click', rightHandler);
		//}
	}).catch(err => console.log(err));
}

function rightHandler(e) {
	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;
        	e.preventDefault();
        	e.stopPropagation(); 
        	let n=parseInt($('rightnum').innerHTML)+1; 
        	$('rightnum').innerHTML = n.toString(); 
        	var message={id :'plus', s: 'r', num: n}; 
        	sendMessage(message); 
		he_votado = true;

		//if (role != 1) {
			setCookie('vote',1,144000);
			he_votado = true;
			$('leftplus').removeEventListener('click', leftHandler);
                	$('rightplus').removeEventListener('click', rightHandler);
		//}
	}).catch(err => console.log(err));
}


function register() {

	var av = getCookie('av');
	if (av && guru_is_here) aonly = 0;
	let sem  = screen.width > 1023 ? '7' : '';
	
	if (!aonly) { if ($('av_toggler')) $('av_toggler').style.background = 'url(/icons/vcall' + sem + '2.png) center center no-repeat #f78f3f'; } else { if ($('av_toggler')) $('av_toggler').style.background = 'url(/icons/vcall' + sem + '2.png) center center no-repeat'; $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat'; $('fcam').style.background='url(/icons/webcam' + sem + '2.png) center center no-repeat'; }
	
	if (ws.readyState === WebSocket.OPEN) problems = 0;
	
	if (ws.readyState === WebSocket.CLOSED) {
		
		ws = new WebSocket('wss://' + location.host + '/groupcall');
		ws.onmessage = function(message) {
			var parsedMessage = JSON.parse(message.data);
			switch (parsedMessage.id) {
				case 'existingParticipants':
					onExistingParticipants(parsedMessage);
					break;
				case 'existingViewers':
					onExistingViewers(parsedMessage);
					break;
				case 'newParticipantArrived':
					if (!fullscreen) onNewParticipant(parsedMessage);
					break;
				case 'newViewerArrived':
					onNewViewer(parsedMessage);
					break;
				case 'participantLeft':
					onParticipantLeft(parsedMessage);
					break;
				case 'receiveVideoAnswer':
					receiveVideoResponse(parsedMessage);
					break;
				case 'changeTab':
					changeTabLR(parsedMessage);
					break;
				case 'clearCoo':
					clearTimeoutAndLeave();
					break;
				case 'setGuru':
					setGuru(parsedMessage);
					break;					
				case 'askGuru':
					askGuru(parsedMessage);
					break;
				case 'setCinema':
					setCinema(parsedMessage);
					break;
				case 'goodConnection':
					connection_is_good = 1;
					break;
				case 'newChatMessage':
					newChatMessage();
					break;
				case 'setAnno':
					setAnno(parsedMessage);
					break;
				case 'viewerLeft':
					just_left = parsedMessage.name;
					let na = just_left.split('_');
					let suf = na[na.length-1];	
					if ($('_au_'+suf)) {
						$('_au_'+suf).dispose();
						let cur = $('audience_numbers').innerHTML == '...'  ?  0 : parseInt($('audience_numbers').innerHTML)-1;
						cur = cur > 0 ? cur : '...';
						$('audience_numbers').innerHTML = cur;
						let col = cur > 0 ? '#369' : '#ccc';
						$('audience_numbers').setStyles({'color': col});
						$('audience_boxx').innerHTML = cur == '...' ? 'Audience is empty :(' : $('audience_boxx').innerHTML;
						//if (cur == '...') 
							{chat_shown = 1; $('logger').click(); $('audience').click();} 
					}
					break;
				case 'iceCandidate':
					participants[parsedMessage.name].rtcPeer.addIceCandidate(parsedMessage.candidate, function (error) {
						if (error) {
							console.error("Error adding candidate: " + error);
							return;
						}
					});
				break;
				default: console.error('Unrecognized message', parsedMessage);
			}
		} 
	} else {}
		
	name = $('name').value; var cookie_name = loadData('name');
	if (!name.length) name = cookie_name; 
	if (!name.length || name === 'null') {name=makeid(8); name = name+'_'+name; saveData('name', name, 1440);}
	
	var w = window.location.hostname.split('.'); var room = $('roomName').value == '' ? w[0] : $('roomName').value;
	
	var curip = $('curip').value;
	registered = 1;

	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
 
		let role = respo || 0; 
		if (temporary && role == 0) role = 3;

		if (role == -1) {soundEffect.src = "/sounds/lock.mp3"; setTimeout(function() {location.reload()}, 1200); console.log('Knock out2'); return false;}

		//define in case the onload retarded; doesn't help in iOS?
		let l = getCookie('lang');
		l = (l === null || l === 'null' || l === '') ? w[0] === "club" || w[0].match(new RegExp('rgsu','g')) ? 1 : 0 : l;
		change_lang(altlang[l]);
			
		$('room-header').innerText = 'ROOM ' + room;
		$('room-header').style.display = 'block';
		$('room-backer').style.display = 'none';
		$('join').style.display = 'none';
		$('room').style.display = 'block';
		$('preroom').innerHTML='&nbsp;';
		$('postroom').style.display = 'none';
		$('house').style.minHeight = '0px';
		$('house').style.background = 'transparent';
		
		$('phones').style.display = 'block';
		$('phones').style.visibility = 'visible';
		$('cr').style.display = 'none';
		$('av_selector').style.display = 'block';
		$('poll').style.display = 'block';
		if (voting_shown) {$('leftnum').style.display = 'block'; $('rightnum').style.display = 'block';}
	
		var curr_all_muted = getCookie('all_muted') || false;
		let sem  = screen.width > 1023 ? '7' : '';
		$('all_muter').style.background = curr_all_muted ? 'url(/icons/no_sound' + sem + '2.png) center center no-repeat #f78f3f' : 'url(/icons/sound' + sem + '2.png) center center no-repeat';
		$('all_muter').title = curr_all_muted ? 'Turn on sound' : 'Turn off all sound';
	
		$('leftplus').style.display = 'block';
		$('rightplus').style.display = 'block';

        	if (( (role == 1) || !he_votado) && firstTime) {

                	$('leftplus').addEventListener('click', leftHandler);
                	$('rightplus').addEventListener('click', rightHandler);
                	firstTime = false;
        	}
	
		$('fmode_selector').style.display = 'block';

		var mode = aonly ? 'a' : 'v'; 	
		
		let tok = getCookie('authtoken') || '';
		
		if (role == 0 && hack) role = 1;	

		var message = {
			id : 'joinRoom',
			name : name,
			mode : mode,
			room : room,
			curip: curip,
			acc_id: acc_id,
			token: tok,
			role: role
		}
	
		sendMessage(message);
		

 		if (problems) {
			$('phones').style.paddingTop = small_device ? '39vh' : '45vh'; $('phones').style.lineHeight = '36px'; $('phones').innerHTML = warning; (function() { $('phones').fade(1)}).delay(1000);
		}

 		(function(){ if (!problems) $('phones').fade(0);}).delay(2000);

		//if (small_device && !scrolled) {(function() {var myFx = new Fx.Scroll(window, {wait: false, duration: 2000}).toBottom().chain(function(){ this.toTop.delay(1000, this);});}).delay(2000); scrolled = true;}
		

	}).catch(err => console.log(err));
	
}

function onNewViewer(request) {

	var myname = $('name').value;
	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;
		let na = request.name.split('_');
		let short_name = na[0];
		let suf = na[na.length-1];
	
		let f = request.name;
		let t = request.curip;
	
		if ($('_au_'+suf)) $('_au_'+suf).dispose();
		let audi = $('audience_boxx').innerHTML == 'Audience is empty :(' ? '' : $('audience_boxx').innerHTML;	
		audi = '<div id=_au_'+suf +'><span id=au_' + suf + ' style="color:#9cf;cursor:pointer;" onclick="set_guru(1,\'' + f + '\');">'+short_name + '</span>, ' + t + ' <span style="cursor:pointer;"  onclick="drop_guest(\'' + f + '\')" >X</span></div>' + audi;
		$('audience_boxx').innerHTML = audi;
		
		let ar_split = audi.split('_au_');
		let cur = ar_split.length - 1;

		$('audience_numbers').innerHTML = cur;
		let col = cur > 0 ? '#369' : '#ccc';
		$('audience_numbers').setStyles({'color': col});
		
		if (just_left != f && $('name').value != f && $('name').value != just_left) soundEffect.src = "/sounds/steps.mp3";
	}).catch(err => console.log(err));
}

function onNewParticipant(request) {

  fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
  	let myrole = respo || 0;

	var theCookies = document.cookie.split(';');
    	var really_new = 1;
	var video_hidden = 0;
		
    	for (var i = 1 ; i <= theCookies.length; i++) {

		if ( theCookies[i-1].match(request.name+'_hidden') ) 
		{ 

				video_hidden = 1;
				really_new = 0;
				break;
		}
			
		if (!video_hidden) {
           		var ls_muted = localStorage.getItem(request.name+'_muted');
			if ( theCookies[i-1].match(request.name+'_muted') || (ls_muted !== null && ls_muted !== 'null') ) 
			{ 

				really_new = 0; 
				break;
			}
		}

    	}

	if (really_new) soundEffect.src = "/sounds/coin.mp3";

	if (!video_hidden) {
	   	
		receiveVideo(request.name, request.mode, myrole, true);

		if (request.curip.length && $('loco_'+request.name) && !ValidateIPaddress(request.curip)) {
			$('loco_'+request.name).innerHTML = request.curip;
			$('loco_'+request.name).style.display='block';
			$('loco_'+request.name).fade(1);			
		}

		if ($('acco_'+request.name) && ValidateAccountId(request.acc_id) ) {
			$('acco_'+request.name).style.display='block';
			let na = request.name.split('_');
			let ac = request.acc_id;
			$('acco_'+request.name).fade(1);
			$('acco_' + f).onclick = function(e) {e.preventDefault(); e.stopPropagation(); copy(ac); flashText('copied '+ na[0]);}
			if ($('sp_container' && sp_shown) && $('sp_container').style.display != 'block') $('acco_'+request.name).style.visibility='hidden';			
		}
	}	

	if (!small_device) {
        	if (pcounter == 4) {
                	$('room').style.minWidth = '960px';
                	$('room').style.marginLeft = '-225px';
        	} else if (pcounter == 3) {
                	$('room').style.minWidth = '690px';
                	$('room').style.marginLeft = '-96px';
        	} else if (pcounter < 3) {
                	$('room').style.minWidth = '480px';
                	$('room').style.marginLeft = '0px';
        	} else if (pcounter > 4) {
                	$('room').style.minWidth = '1240px';
                	$('room').style.marginLeft = '-390px';
        	}
	}
  }).catch(err => console.log(err));
}

function receiveVideoResponse(result) {
	participants[result.name].rtcPeer.processAnswer (result.sdpAnswer, function (error) {
		if (error) return console.error (error);
	});
}

function callResponse(message) {
	if (message.response != 'accepted') {
		console.info('Call not accepted by peer. Closing call');
		stop();
	} else {
		webRtcPeer.processAnswer(message.sdpAnswer, function (error) {
			if (error) return console.error (error);
		});
	}
}

async function startCapture(displayMediaOptions) {
	
	let captureStream = null;

	try {
		captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
	} catch(err) {
		console.error("Error: " + err);
	}
		
	return captureStream;
}

function onExistingViewers(msg) {

   var myname = $('name').value;
   
   var audience = '';

   var play_sound = myname == just_left ? false : true;
  
   if (msg.data) {
   	   var arr = msg.data.sort();
	   for (var i = 0; i < arr.length; i++) {
		var chu = arr[i].split('_|_');

		let f = chu[0];
		let t = chu[1];
		
		if (f == just_left) {
			just_left = '';
			play_sound = false;
		}
		
		let na = f.split('_');
		let short_name = na[0];
		let suf = na[na.length-1];
		
		if (f == myname) {

			play_sound = false;
			var lang = getCookie('lang');
			if (t.length && (lang === null || lang === 'null')) {
				let ar = /, AR$/.test(t);
				let br = /, BR$/.test(t);
				let ru = /, RU$/.test(t);
				
				if (ar) {ctr = 2} else {if (br) {ctr = 5} else {if (ru) {ctr = 1} else {}}}
				change_lang(altlang[ctr]);
			}
		}

		audience = audience + '<div id=_au_'+suf +'><span id=au_' + suf + ' style="color:#9cf;cursor:pointer;" onclick="set_guru(1,\'' + f + '\');">'+short_name + '</span>, ' + t + ' <span style="cursor:pointer;" onclick="drop_guest(\'' + f + '\')" >X</span></div>'		
		
		
	   }

	   
	   if (arr.length == 0) {audience = 'Audience is empty :(';$('audience_numbers').setStyles({'color':'#ccc'});$('audience_numbers').innerHTML = '...'; audience_number = 0; } else {$('audience_numbers').setStyles({'color':'#369'}); $('audience_numbers').innerHTML = arr.length;

		if (arr.length > audience_number && arr.length > 0 && play_sound) {
	   		soundEffect.src = "/sounds/steps.mp3";
		}
		audience_number = arr.length;
	   }
	   if ($('audience_boxx')) $('audience_boxx').innerHTML = audience;

   }
    
}

function set_guru(par, who) {
	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;

		if (role == 1) {
			let tok = getCookie('authtoken') || '';
			let message = {
				id : 'setGuru',
				name : who,
				mode : par,
				token: tok
			}		
			sendMessage(message);

		} else {

			if ($('name').value == who ) {
				chat_shown = 1; $('logger').click(); $('audience').click(); leaveRoom(); register();
			}
		}
	}).catch(err => console.log(err));
}

function drop_guest(who) {
console.log('drop_guest:',who);
	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;

		if (role == 1) {
			let tok = getCookie('authtoken') || '';
			let message = {
				id : 'dropGuest',
				name : who,
				token: tok
			}		
			sendMessage(message);
console.log('dropped:',who);
		}
		
	}).catch(err => console.log(err));
}

function isMicrophoneAllowed(){
    navigator.permissions.query({
        name: 'microphone'
    }).then(function(permissionStatus){
        return permissionStatus.state !== 'denied';
    });
}
	
function onExistingParticipants(msg) {

  fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {


	let role = respo || 0; 

	if (temporary && role == 0) role = 3; 
	
 	if (role_zero_has_square || role == 1 || role == 2 || role == 3) {

		let fmode = getCookie('fmode') ? 'environment' : 'user';
		
			
		var myname = $('name').value;
		var i_am_muted = loadData(myname+'_muted');
		
		let mode = aonly ? 'a' : 'v'; // maybe c if am guru?
   	
		var participant = new Participant(name, myname, mode, role, false);
		participants[name] = participant;
		var video = participant.getVideoElement();

		var constraints = {
                	audio : true,
                	video : {
                        	maxWidth : wi_hq,
                        	maxFrameRate : fps_hq,
                        	minFrameRate : fps_hq,
				facingMode: fmode
                	}
		};

		var constraints_vonly = {
                	audio : false,
                	video : {
				facingMode: fmode
               		}
		};
		
		var constraints_aonly = {
                	audio : true,
               	 video: false
		};

		if (aonly) constraints = constraints_aonly;
		if (i_am_muted === true || i_am_muted === 'true') constraints =  constraints_vonly;

		var options = {
              		localVideo: video,
			mediaConstraints: constraints,
			onicecandidate: participant.onIceCandidate.bind(participant)
		}
	
		var constraints_alt = (i_am_muted === true || i_am_muted === 'true') ? constraints_vonly : constraints_aonly;
	
		var options_alt = {
			localVideo: video,
			mediaConstraints: constraints_alt,
			onicecandidate: participant.onIceCandidate.bind(participant)
		}
		
   if (shareSomeScreen && (role == 1|| role == 2)) {
      
      shareSomeScreen = true;
      $('room-header').style.color = oldColor;
      
      startCapture({video: true}).then(stream => {

/* mix microphone
*/

	navigator.mediaDevices.getUserMedia({audio: true})
	.then(function(mediaStream) {
		var audioTrack = mediaStream.getAudioTracks()[0] ? mediaStream.getAudioTracks()[0] : null;
		if (audioTrack && i_am_muted !== true && i_am_muted !== 'true') stream.addTrack(audioTrack);

		video.srcObject = stream;

        	var options_sshare = {
			videoStream: stream,
			onicecandidate: participant.onIceCandidate.bind(participant),
			mediaConstraints : {
				audio: true,
				video:{
                        		maxWidth : wi_hq,
                        		maxFrameRate : fps_hq,
                        		minFrameRate : fps_hq
                		}	
			},
			sendSource : 'screen'
        	}
	
        	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options_sshare,
                 function (error) {
                  if(error) {
			var ff = new RegExp('closed','ig');
			if (error.toString().match(ff)) {
			} else {
                          participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options_alt,
                                function (error) {
                                        if(error) {
                                                return console.error(error);
                                        }

                                        startVideo(video);
                                        this.generateOffer (participant.offerToReceiveVideo.bind(participant));
					if (small_device)  $(myname).style.float = 'none';
					$(myname).className = PARTICIPANT_MAIN_CLASS; 
                          });
			}

			return false;
                  } else {
                  	startVideo(video);
                  	this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			if (small_device)  $(myname).style.float = 'none';
			$(myname).className = PARTICIPANT_MAIN_CLASS; 
		  }

		  (function(){$('phones').fade(0);}).delay(1000);
        	});

		
	}).catch(function(err){console.log(err.name + ": " + err.message);});

      }).catch(e => console.log(e));
   
   } else if (playSomeMusic && (role == 1|| role == 2)) {
  
	video.autoplay = true;
	video.playsInline = true;
	video.controls = true;
	video.crossOrigin = 'anonymous';
	video.volume = 1;
	video.loop = true;
	video.src = selectedFile ? selectedFile : "/a.mp4";
	video.muted = false;
	
	video.addEventListener('canplay', (event) => {

	  now_playing = true;

	  if (!already_being_played) {
	  	
	   already_being_played = true;
	
	   let captureStream = null;


	   if (video.captureStream) {
		captureStream = video.captureStream(fps_hq);

	   } else if (video.mozCaptureStream) {

		captureStream = video.mozCaptureStream(fps_hq);

	   } else {
    			console.error('Stream capture is not supported');

	   }

	   var cstrx = {
		audio: true,
		video:{
                        maxWidth : wi_hq,
                        maxFrameRate : fps_hq,
                        minFrameRate : fps_hq
                }
	   };

	   options = {
		videoStream: captureStream,
		onicecandidate: participant.onIceCandidate.bind(participant),
		mediaConstraints : cstrx
	   }
	   option_alt = {
		videoStream: captureStream,
		onicecandidate: participant.onIceCandidate.bind(participant),
		mediaConstraints :{audio: true, video: false}
	   }
		
	   participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
		function (error) {
                  if(error) {
			var ff = new RegExp('closed','ig');
			if (error.toString().match(ff)) {
			} else {
                          participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options_alt,
                          	function (error) {
                                        if(error) {
                                                return console.error(error);
                                        }

                                        startVideo(video);
                                        this.generateOffer (participant.offerToReceiveVideo.bind(participant));
					if (small_device)  $(myname).style.float = 'none';
					$(myname).className = PARTICIPANT_MAIN_CLASS; 					
					$('room-header-file').style.display='none';

                          	}
			);
			}
			return false;
                  } else {
			startVideo(video);			  	
			this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			
			if (small_device)  $(myname).style.float = 'none';
			$(myname).className = PARTICIPANT_MAIN_CLASS;
			$('room-header-file').style.display='none';
                  }

		  (function(){$('phones').fade(0);}).delay(1000);
		});
	  }
	}); 
   } else {

         participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
                function (error) {
                  if(error) {
			var ff = new RegExp('closed','ig');
			if (error.toString().match(ff)) {
			} else {
                          participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options_alt,
                          function (error) {
                                        if(error) {
                                                return console.error(error);
                                        }

                                        startVideo(video);
                                        this.generateOffer (participant.offerToReceiveVideo.bind(participant));
					if (small_device)  $(myname).style.float = 'none';
					$(myname).className = PARTICIPANT_MAIN_CLASS; 
                          });
			}

			return false;
                  } else {
                  	startVideo(video);
                  	this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			if (small_device)  $(myname).style.float = 'none';
			$(myname).className = PARTICIPANT_MAIN_CLASS; 
		  }

		  (function(){$('phones').fade(0);}).delay(1000);
          });

   }

 }
 if (msg.data) {
	   for (var i = 0; i < msg.data.length; i++) {
		var chu = msg.data[i].split('_|_');

		let f = chu[0];
		let s = chu[1];
		let t = chu[2];
		let ac = chu[3];
		let a = chu[4];
		
		let na = chu[0].split('_');
	
		if (f != myname) {

			receiveVideo(f, s, role, false);
			let coo_volume = loadData(f+'_volume');
			
			$('slider_' + f).value = coo_volume;
			$('video-' + f).volume = coo_volume;

		} else { 
			var lang = getCookie('lang');
			if (t.length && (lang === null || lang === 'null')) {
				let ar = /, AR$/.test(t);
				let br = /, BR$/.test(t);
				let ru = /, RU$/.test(t);
				
				if (ar) {ctr = 2} else {if (br) {ctr = 5} else {if (ru) {ctr = 1} else {}}}
				change_lang(altlang[ctr]);
			}
		}
		
		if (t.length && $('loco_' + f) && !ValidateIPaddress(t)) {
			$('loco_' + f).innerHTML = t;
			$('loco_' + f).style.display='block';
			$('loco_' + f).fade(1);			
		}		
		
		if ($('acco_'+f) && ValidateAccountId(ac)) {
			$('acco_' + f).style.display='block';
			
			$('acco_' + f).fade(1);
			$('acco_' + f).onclick = function() {copy(ac); flashText('copied '+ na[0]);}
			if ($('sp_container' && sp_shown) && $('sp_container').style.display != 'block') $('acco_' + f).style.visibility='hidden';			
		}	
		
		if ($('anno_' + f) && ValidateAnno(a)) {
		
			$('anno_' + f).innerHTML = a;
			$('anno_' + f).style.display='block';			
			$('anno_' + f).fade(1);
		}
	   }

	   if (!small_device) {
        	if (pcounter == 4) {
                	$('room').style.minWidth = '960px';
                	$('room').style.marginLeft = '-225px';
        	} else if (pcounter == 3) {
                	$('room').style.minWidth = '690px';
                	$('room').style.marginLeft = '-96px';
        	} else if (pcounter < 3) {
                	$('room').style.minWidth = '480px';
                	$('room').style.marginLeft = '0px';
        	} else if (pcounter > 4) {
                	$('room').style.minWidth = '1240px';
                	$('room').style.marginLeft = '-390px';
        	}
	   }	    
 }	   

  }).catch(err => console.log(err));
}

function copy(that){
	var inp = document.createElement('input');
	document.body.appendChild(inp)
	inp.value = that;
	inp.select();
	document.execCommand('copy',false);
	inp.remove();
}

function leaveRoom() {
	
	if (Object.keys(participants).length && !problems) {
	
		for ( var key in participants) {
			participants[key].dispose();
			delete participants[key];
		}

	}

	pcounter = 0;
	i_am_guest = 0;
	registered = 0;
	
	sendMessage({id : 'leaveRoom'});
	just_left = $('name').value;
}

function receiveVideo(sender, mode, role, n) {

	let new_flag = (n === true) ? true : false;

	var participant = new Participant(sender, $('name').value, mode, role, new_flag );
	participants[sender] = participant;
	var video = participant.getVideoElement();
      
	var constraints = {
                audio : true,
                video: false
	};

	var constraints_av = {
                audio : true,
                video: true
	};
	
	var options = {
		remoteVideo: video,
		mediaConstraints: constraints_av,
		onicecandidate: participant.onIceCandidate.bind(participant)
	}
	var options_aonly = {
		remoteVideo: video,
		mediaConstraints: constraints,
		onicecandidate: participant.onIceCandidate.bind(participant)
	}
	
	options = mode === 'a' ? options_aonly : options;
	
	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
	function (error) {
		if(error) {
			return console.error(error);
		}

			startVideo(video);
			this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			if (small_device)  {
				$(sender).style.float = 'none';
				$(sender).className = PARTICIPANT_MAIN_CLASS; 
			}

	});
	
}

function setGuru(request) {
	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;
		let sem  = screen.width > 1023 ? '7' : '';

		if (request.mode == '1' && role != 1) {
		
			temporary = 1; chat_shown = 1; $('logger').click(); $('audience').click(); leaveRoom(); register();
			$('av_toggler').style.display='block';
			$('bell').style.display='none';	
		}
		if (request.mode == '0' && temporary) {

			temporary = 0; chat_shown = 1; $('logger').click(); $('audience').click(); leaveRoom(); register();
			cammode = 0; $('fcam').style.background='url(/icons/webcam' + sem + '2.png) center center no-repeat'; $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat'; setCookie('av', false, 144000); aonly = 1; flashText_and_rejoin('AUDIO-ONLY');
			$('av_toggler').style.display='none';
			$('bell').style.display='block';	
		}
	}).catch(err => console.log(err));
}

function askGuru(request) {

	let na = request.name.split('_');
	let short_name = na[0];
	let suf = na[na.length-1];
	
	if ($('_au_'+suf)) $('_au_'+suf).dispose();
	let audi = $('audience_boxx').innerHTML == 'Audience is empty :(' ? '' : $('audience_boxx').innerHTML;	
	audi = '<div id=_au_'+suf+'><span id=au_' + suf + ' style="color:#9cf;cursor:pointer;font-size:16px;font-weight:bold;" onclick="set_guru(1,\'' + request.name + '\');">'+short_name + '</span> ' + requ +  ' <span style="cursor:pointer;" onclick="drop_guest(\'' +request.name + '\')" >X</span></div>' + audi;
	
	let ar_split = audi.split('_au_');
	let cur = ar_split.length - 1;
	
	$('audience_boxx').innerHTML = audi;
	$('au_'+suf).setStyles({'color':'#faa'});

	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;
		//if (role == 1 || request.name == $('name').value) {
			soundEffect.src = "/sounds/wood_" + window.location.hostname + ".mp3";
			chat_shown = 0; $('logger').click();
			$('message_box').style.display = 'none';
			$('audience_box').style.display = 'table';
		//}
	}).catch(err => console.log(err));

}

function setCinema(request) {

	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let myrole = respo || 0;	
		let p = participants[request.name];
		p.setMode(request.mode);
	
		let o = $('one-' + request.name);
		let m = request.mode;

		o.style.color = m == 'c' ? '#ff0' : '#369';
		o.style.fontWeight = m == 'c' ? 'bold' : 'normal';
		o.style.display = m == 'c' ? 'block' : myrole == 1 ? 'block' : 'none';
		o.innerHTML = m == 'c' ? 'CINEMA!' : 'CINEMA?';
	}).catch(err => console.log(err));	
}

function newChatMessage() {
	let cnt = 0; let sem  = screen.width > 1023 ? '7' : '';
	let old_color = $('logger').style.background == 'url(/icons/chat' + sem + '2.png) center center no-repeat' ? 'url(/icons/chat' + sem + '2.png) center center no-repeat #f78f3f' : 'url(/icons/chat' + sem + '2.png) center center no-repeat;';
	new_message = 1;
	let intervalID = setInterval(function() { if (new_message) {$('logger').style.background = cnt % 2 == 0 ? 'url(/icons/chat' + sem + '2.png) center center no-repeat #90ee90' : 'url(/icons/chat' + sem + '2.png) center center no-repeat'; cnt++;} else {$('logger').style.background = old_color; clearInterval(intervalID)}}, 1000);
	
	fetch('https://'+window.location.hostname+':8453/log.html').then(response => response.text()).then((response) => {$('message_box').innerHTML = response; }).catch(err => console.log(err));

		soundEffect.src = "/sounds/buzz.mp3";
}

function setAnno(request) {
//console.log("setting anno:", request.participant, "anno:",request.anno);
	if ($('anno_' + request.participant)) {
		$('anno_' + request.participant).innerHTML = request.anno;
		$('anno_' + request.participant).style.display='block';			
		$('anno_' + request.participant).fade(1);
	}
	
}

function changeTabLR(request) {

	if (request.side == 'l') {
		if ($('leftnum')) $('leftnum').innerHTML = request.num.toString();
	}
	if (request.side == 'r') {
		if ($('rightnum')) $('rightnum').innerHTML = request.num.toString();
	}
}

function clearTimeoutAndLeave() {

	if (role != 1) {eraseCookie('timeout_nc'); soundEffect.src = "/sounds/drop.mp3"; $('phones').innerHTML = 'Leaving room'; $('phones').fade(1); setTimeout(function() {location.reload()}, 1000);}

}

function onParticipantLeft(request) {

	var participant = participants[request.name];
	if (participant) {
		participant.dispose();
		delete participants[request.name];
		just_left = request.name;
        	if (!small_device) {

        		if (pcounter == 4) {
                		$('room').style.minWidth = '960px';
                		$('room').style.marginLeft = '-225px';
        		} else if (pcounter == 3) {
                		$('room').style.minWidth = '690px';
                		$('room').style.marginLeft = '-96px';
        		} else if (pcounter < 3) {
                		$('room').style.minWidth = '480px';
                		$('room').style.marginLeft = '0px';
        		} else if (pcounter > 4) {
                		$('room').style.minWidth = '1240px';
                		$('room').style.marginLeft = '-390px';
        		}			
		}
	}
}


function sendMessage(message) {
	var jsonMessage = JSON.stringify(message);
	if (!problems) ws.send(jsonMessage);
}

function startVideo(video)
{

  video.play().catch((err) => {
    if (err.name === 'NotAllowedError') {
      console.error("[start] Browser doesn't allow playing video: " + err);
    }
  });

}

function setCookie(name, value, mins) {
    var expires = "";
    if (mins) {
        var date = new Date();
        date.setTime(date.getTime() + (mins*60*1000));
        expires = "; SameSite=None; Secure; expires=" + date.toUTCString() + ";SameSite=None;Secure;";
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;SameSite=None;Secure;';
}

function deleteSomeCookies() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var coo_name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
	while (coo_name.charAt(0)==' ') coo_name = coo_name.substring(1,coo_name.length);

	var w = new RegExp('_muted','ig');
	var h = new RegExp('_hidden','ig');

        if ( coo_name.match(w) ||  coo_name.match(h) || !coo_name.length ) {document.cookie = coo_name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=None;Secure;";}
    }
}

function listCookies() {
    var theCookies = document.cookie.split(';');
    var aString = '';
    for (var i = 1 ; i <= theCookies.length; i++) {
        aString += i + ' ' + theCookies[i-1] + "\n";
    }
    return aString;
}

function check_iOS() {
  var ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ){
    return true;
  }
  return false;
}

function is_mobAndro() {
  var ua = navigator.userAgent;
  if (/Android/.test(ua) && window.matchMedia("only screen and (max-width: 480px)").matches) {
    return true;
  }
  return false;
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random()*charactersLength));
   }
   return result;
}

function saveData(name, value, mins) {
    if (typeof(Storage) != 'undefined') {
        localStorage.setItem(name, value);
    } else {
        setCookie(name, value, mins);
    }
}

function loadData(name) {
    var temp_value = '';

    if (typeof(Storage) != 'undefined') {
        temp_value = localStorage.getItem(name);
    } else {
        temp_value = getCookie(name);
    }

    return temp_value;
}

function ValidateIPaddress(ipaddress) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    return (true)
  }
  return (false)
}

function ValidateAccountId(account_id) {
  if (/^[a-z0-9]+$/i.test(account_id) && account_id.length == 48) {
    return (true)
  }
  return (false)
}

function ValidateAnno(anno) {

  if (anno.length < 160) {
  	anno.replace(/[<>]/g,''); return (true)
  }
  return (false)
}