/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
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
#   Copyright (c) 2021-22 Alex Shevlakov alex@motivation.ru
#   All Rights Reserved.

#   This program is free software; you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation; version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
*/

var ws = new WebSocket('wss://' + location.host + '/groupcall');
var participants = {};
var name;

var pcounter = 0;
var real_pcnt = 0;
var vcounter = 0;
var i_am_guest = 0;
var registered = 0;
var guru_is_here = 0;

var problems = 0;
var altlang = ['en','ru','es','fr','cn','pt'];

var waiting_period = 633000;
var logo_added = 0;

var firstTime = true;
var he_votado = false;

var playSomeMusic = false;
var shareSomeScreen = false;

var already_being_played = false;

var now_playing = false;
var __playing = true;

var audio = null;

var audience_numberr = 0; //restored after erroneous commit; THAT should be used for sounding steps.mp3, and not vcounter - or you miss ~50% of new viewers, perhaps due to race --ash
var just_left = '';

var connection_is_good = 1;

var new_message = 0;

var i_am_viewer = true;

//var acc_id = getCookie('acc') || '';
//let acc_id = '';
 
var i_am_dummy_guest = false; //check demo dummy from join_

var nump = 0; var numv = 0; var num_cinemas = 0;

const ua = navigator.userAgent.toLowerCase();
const isAndroid = ua.indexOf("android") > -1;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const fps = 15;
const wi = 640;
const fps_hq = 24;
const wi_hq = 1920;

const sp_setter_url = w[0].match(new RegExp('rgsu','g')) ? "https://cube.room-house.com:8449" : "https://aspen.room-house.com:8447";
const sp_container_url = w[0].match(new RegExp('rgsu','g')) ? "https://cube.room-house.com:8444" : "https://aspen.room-house.com:8446";
const sm_url = "https://slotmachine.room-house.com";
//const poker_url = "https://room-house.com/poker/";
const poker_url = "https://poker.room-house.com";
const chess_url = "https://chess.room-house.com";
const air_url = "https://bot.skypirl.net";
const swap_url = "https://coins.room-house.com";

//const role  = 0;

const small_device = (check_iOS() || isAndroid) && screen.width <= 1024 ? true : false;
const notebook = screen.height <= 800 ? true : false;

const controller = new AbortController();

const fetchTimeout = (url, ms, { signal, ...options } = {}) => {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal, ...options });
    if (signal) signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return promise.finally(() => clearTimeout(timeout));
};

window.onbeforeunload = function() {
	ws.close();
};

window.onload = function(){


   setInterval(function(){
       if ((registered && !now_playing)|| problems) {if (problems) rejoin();}

   }, 10000 + Math.random() * 10000);

   setInterval(function(){

       if (registered && !now_playing) {if (problems) rejoin();}

   }, waiting_period + Math.random() * 10000);

   setInterval(function(){
       
       if (registered) check_connection();

   }, 20000 + Math.random() * 10000);

   setInterval(function(){
       
       if (registered) check_fullscreen();

   }, 1000);
      
	let lang = getCookie('lang');
	lang = (lang === null || lang === 'null' || lang === '') ? w[0] === "club" || w[0].match(new RegExp('rgsu','g')) ? 1 : 1 : lang;
	ctr = lang;

	change_lang(altlang[ctr]);
	
	if (!small_device && window == window.top) {
		elements = Array.prototype.slice.call(document.getElementsByClassName("pricee"));

		elements.forEach(function(item) {
			let buy = buy_.get(altlang[ctr]);
        		item.innerHTML = buy;
		});

        	elements = Array.prototype.slice.call(document.getElementsByClassName("gowee"));

        	elements.forEach(function(item) {
                	let go = go_.get(altlang[ctr]);
                	item.innerHTML = go;
        	});
		
		//let he = he_.get(altlang[ctr]);
		//document.id('helpcapo').innerHTML = he;
		
	}
	
	document.id('helplink').href = ctr == 1 ? 'https://github.com/kl3eo/room-house/blob/main/R-H_manual_RUS.pdf' : 'https://github.com/kl3eo/room-house/blob/main/R-H_manual_ENG.pdf';
	
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
	case 'bongoKey':
		bongoKey(parsedMessage);
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
	case 'roomConnection':
		//console.log('nump is', parsedMessage.nump, 'numv is', parsedMessage.numv);
		nump = parsedMessage.nump; numv = parsedMessage.numv;  (function(){if (document.id('bstats')) document.id('bstats').fade(1);}).delay(1000);
		//if (document.id('bnump')) document.id('bnump').innerHTML = nump; if (document.id('bnumv')) document.id('bnumv').innerHTML = numv;
		break;
	case 'newChatMessage':
		newChatMessage();
		break;
	case 'setAnno':
		setAnno(parsedMessage);
		break;
	case 'viewerLeft':
		just_left = parsedMessage.name;
		onViewerLeft(just_left);
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
	leaveRoom(); register();
}

function check_connection() {

	connection_is_good = 0;
	var message={id : 'checkConnection'}; 
	sendMessage(message);
	setTimeout(function() { if (!connection_is_good) { console.log('resetting connection'); problems = 1; rejoin();}}, 1200);
}

const check_fullscreen_strict = () => {
	acc_id.then(data => {
	   if (fullscreen) {
		if ( !data.length || window.screenTop ||  window.screenY || (!(window.innerWidth == screen.width && window.innerHeight == screen.height) && isAndroid) ) {
			fullscreen = false; if (!data.length && cinemaEnabled) rejoin(); else fullscreen = true;
		}		
	   } else {
	   	if ((window.innerWidth == screen.width && window.innerHeight == screen.height) || (!window.screenTop && !window.screenY) || window.fullScreen )
			if (!data.length) rejoin();
	   }
	});
	
}

function check_fullscreen() {
	acc_id.then(data => {
	   if (fullscreen) {
		if ( !data.length || window.screenTop ||  window.screenY || (!(window.innerWidth == screen.width && window.innerHeight == screen.height) && isAndroid) ) {
			fullscreen = false; if (!data.length) rejoin(); else {fullscreen = true;}
		}		
	   }
	});
}

function signalGuru(e) {

	e.preventDefault();
	e.stopPropagation(); 
 
	var message={id : 'signalGuru'}; 
	sendMessage(message); 

}

function eventHandler(n) {

		var message={id :'keyDown', num: n, name: ''}; 
		sendMessage(message);
}

function leftHandler(e) {
	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;
		e.preventDefault();
		e.stopPropagation(); 
		let n=parseInt(document.id('leftnum').innerHTML)+1; 
		document.id('leftnum').innerHTML = n.toString(); 
		var message={id :'plus', s: 'l', num: n}; 
		sendMessage(message); 
	
		if (role != 1) {
			setCookie('vote',1,144000);
			he_votado = true;
			//document.id('leftplus').removeEventListener('click', leftHandler);
                	//document.id('rightplus').removeEventListener('click', rightHandler);
		}
	}).catch(err => console.log(err));
}

function noHandler(e) { }
function rightHandler(e) {
	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;
        	e.preventDefault();
        	e.stopPropagation(); 
        	let n=parseInt(document.id('rightnum').innerHTML)+1; 
        	document.id('rightnum').innerHTML = n.toString(); 
        	var message={id :'plus', s: 'r', num: n}; 
        	sendMessage(message); 
		he_votado = true;

		if (role != 1) {
			setCookie('vote',1,144000);
			he_votado = true;
			//document.id('leftplus').removeEventListener('click', leftHandler);
                	//document.id('rightplus').removeEventListener('click', rightHandler);
		}
	}).catch(err => console.log(err));
}


const register = () => {

	var av = getCookie('av');
	if (av && guru_is_here) aonly = 0;
	
	let sem  = window.innerWidth > 1024 ? '7' : '';
	
	if (!aonly) { if (document.id('av_toggler')) document.id('av_toggler').className = "bigO av_toggler_f" } else { if (document.id('av_toggler')) document.id('av_toggler').className = "bigO av_toggler"; document.id('bcam').className="bigO bcam"; document.id('fcam').className="bigO fcam"; }
	
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
				case 'bongoKey':
					bongoKey(parsedMessage);
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
				case 'roomConnection':
					//console.log('nump is', parsedMessage.nump, 'numv is', parsedMessage.numv);
					nump = parsedMessage.nump; numv = parsedMessage.numv; (function(){if (document.id('bstats')) document.id('bstats').fade(1);}).delay(2000);
					//if (document.id('bnump')) document.id('bnump').innerHTML = nump; if (document.id('bnumv')) document.id('bnumv').innerHTML = numv;
					break;
				case 'newChatMessage':
					newChatMessage();
					break;
				case 'setAnno':
					setAnno(parsedMessage);
					break;
				case 'viewerLeft':
					just_left = parsedMessage.name;
					onViewerLeft(just_left);
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
		
	name = document.id('name').value; let cookie_name = loadData('name');
	if (!name.length) name = cookie_name; 
	if (!name.length || name === 'null') {name=makeid(8); name = name+'_'+name; saveData('name', name, 1440);}
	
	if (i_am_dummy_guest) { //it wouldn't help?!

		fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
 
			let role = respo || 0;
//console.log('registering as dummy guest, after fetch');
			register_body(role);
			i_am_dummy_guest = false; //only one time is enough?! 
		
		}).catch(err => console.log(err));
	} else { register_body(role);}

}

const register_body = (ro) => {
	
		var plr = getCookie('player');
		
		let w = window.location.hostname.split('.'); 
		let room = document.id('roomName').value == '' ? w[0] : document.id('roomName').value;
	
		let curip = document.id('curip').value;
		registered = 1;
	
		let sem  = window.innerWidth > 1024 ? '7' : '';
		if (temporary && ro == 0) role = 3;

		if (ro == -1) {soundEffect.src = "/sounds/lock.mp3"; setTimeout(function() {location.reload()}, 1200); console.log('Knock out2'); return false;}

		//define in case the onload retarded; doesn't help in iOS?
		let l = checkLang();		
		change_lang(altlang[l]);
			
		document.id('room-header').innerText = 'ROOM ' + room;

		document.id('join').style.display = 'none';
		document.id('room').style.display = 'block';
		document.id('preroom').innerHTML='&nbsp;';
		document.id('postroom').style.display = 'none';
		document.id('house').style.minHeight = '0px';
		document.id('house').style.background = 'transparent';
		
		document.id('phones').style.display = 'block';
		document.id('phones').style.visibility = 'visible';
		document.id('cr').style.display = 'none';
		document.id('av_selector').style.display = 'block';
		document.id('poll').style.display = 'block';
		if (voting_shown) {document.id('leftnum').style.display = 'block'; document.id('rightnum').style.display = 'block';}
	
		let curr_all_muted = getCookie('all_muted') || false;

		document.id('all_muter').className = curr_all_muted ? "bigO allmuter_off" : "bigO allmuter_on";
		
		document.id('all_muter').title = curr_all_muted ? 'Turn on sound' : 'Turn off all sound';
	
		document.id('leftplus').style.display = 'block';
		document.id('rightplus').style.display = 'block';

        	if (( (ro == 1) || !he_votado) && firstTime) {

                	//document.id('leftplus').addEventListener('click', leftHandler);
                	//document.id('rightplus').addEventListener('click', rightHandler);
			addEventListener("keydown", (event) => {
  				//event.keyCode === 65 ? leftHandler(event) : event.keyCode === 76 ? rightHandler(event) : noHandler(event);
				let n = event.keyCode ? event.keyCode : 65;
				eventHandler(n);
			});
                	firstTime = false;
        	}
	
		document.id('fmode_selector').style.display = 'block';
		//if (document.id('newsub') && ro == 1) 
			document.id('newsub').style.display = 'block';
		
		//if (!small_device && !w[0].match(new RegExp('rgsu','g')) && window == window.top && !notebook) document.id('slide_container').style.display = 'block';

		// brute force
		all_muted = getCookie('all_muted');
		if (all_muted === true || all_muted === 'true') i_am_muted = true;

		let mode = (i_am_muted === true || i_am_muted === 'true') ? 'm' : aonly ? 'a' : 'v';
		
		mode = plr ? 'p' : mode;
		
		let tok = getCookie('authtoken') || '';
		
		if (ro == 0 && hack) role = 1;	

//console.log('registering, mode is' ,mode, 'role is', role);
		let formData = new FormData();
		formData.append('addr', curip);
		
		fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {body: formData, method: 'post', credentials: 'include'}).then(respo => respo.text()).then((respo) => {
			let role = respo || 0;
		}).catch(err => console.log(err));
	
		acc_id.then(data=>{
//console.log('reg: acc_id is', data);
		   let message = {
			id : 'joinRoom',
			name : name,
			mode : mode,
			room : room,
			curip: curip,
			acc_id: data,
			token: tok,
			role: role
		   }
	
		   sendMessage(message);		

		});

 		if (problems) {
			document.id('phones').style.paddingTop = small_device ? '39vh' : '45vh'; document.id('phones').style.lineHeight = '36px'; document.id('phones').innerHTML = warning; document.id('phones').onclick=location.reload(); (function() { document.id('phones').fade(1)}).delay(1000);
		}

		(function() { if (pcounter == 0 && vcounter == 0 ) {problems = 1; document.id('phones').innerHTML = warning; document.id('phones').fade(1); (function() {rejoin();}).delay(1000); }}).delay(2000);

  		if(stats_shown) { (function(){document.id('stats').style.display='block'; document.id('stats').fade(1);}).delay(1000);}		

		if (document.id('want')) (function() {document.id('want').style.display = "block"; document.id('want').fade(1); /*if (small_device) document.id('want').style.marginRight = "0px";*/}).delay(500);
		
		if (!small_device && document.id('helpdoc')) (function() {let l = checkLang(); /*if (!small_device) document.id('helpdoc').style.marginRight = "4.8vw";*/

		if (small_device) {document.id('helpdoc').style.paddingTop = "0.4vh"; document.id('helpdoc').style.paddingRight = "2vw";}
		
		if (!small_device && window != window.top) {document.id('helpdoc').style.marginRight = "2vw";} document.id('helpdoc').fade(1);}).delay(500);
				
		(function() {dummies = true;}).delay(3000);

}

function checkLang() {
	let l = getCookie('lang');
	l = (l === null || l === 'null' || l === '') ? w[0] === "club" || w[0].match(new RegExp('rgsu','g')) ? 1 : 0 : l;
	return l;
}
const onNewViewer = (request) => {

	let myname = document.id('name').value;
	let myvideo = 'video-' + myname;	
	if (now_playing) (function() {document.id(myvideo).play()}).delay(1000);

	if (request.ng) {if (document.id('num_guests')) document.id('num_guests').innerHTML = request.ng;}
	room_limit = (typeof request.rl !== 'undefined') ? request.rl : room_limit;

		let na = request.name.split('_');
		let short_name = na[0];
		let suf = na[na.length-1];
	
		let f = request.name;
		let t = request.curip;
	
		if (document.id('_au_'+suf)) document.id('_au_'+suf).dispose();
		let audi = document.id('audience_boxx').innerHTML == 'Audience is empty :(' ? '' : document.id('audience_boxx').innerHTML;	
		audi = '<div id=_au_'+suf +'><span id=au_' + suf + ' style="color:#9cf;cursor:pointer;" onclick="set_guru(1,\'' + f + '\');">'+short_name + '</span>, ' + t + ' <span style="cursor:pointer;"  onclick="drop_guest(\'' + f + '\')" >X</span></div>' + audi;
		document.id('audience_boxx').innerHTML = audi;
		
		let ar_split = audi.split('_au_');
		let cur = ar_split.length - 1;

		document.id('audience_numbers').innerHTML = cur;
		let col = cur > 0 ? '#369' : '#ccc';
		document.id('audience_numbers').setStyles({'color': col});
		
		vcounter = cur; if (document.id('vcounter')) document.id('vcounter').innerHTML = vcounter;
		
		if (just_left != f && document.id('name').value != f && document.id('name').value != just_left) soundEffect.src = "/sounds/steps.mp3";
}

const onNewParticipant = (request) => {

  if (request.ng) {if (document.id('num_guests')) document.id('num_guests').innerHTML = request.ng;}
	
	let myrole = role;
	
	let myname = document.id('name').value;
	let myvideo = 'video-' + myname;	
	if (now_playing) (function() {document.id(myvideo).play()}).delay(1000);

	var theCookies = document.cookie.split(';');
    	var really_new = 1;
	var video_hidden = 0;
	
	room_limit = (typeof request.rl !== 'undefined') ? request.rl : room_limit;
		
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

		//preparing logics in advance
		let pctr = pcounter + 1;
		if (pctr > room_limit - 1 && i_am_viewer) {if (document.id('bell')) document.id('bell').style.display = 'block'; if (document.id('av_toggler')) document.id('av_toggler').style.display='none';}

		if (!small_device) resizer(pctr);

		   	
		receiveVideo(request.name, request.mode, myrole, true);
		
		(function() {if (document.id(request.name)) {document.id(request.name).style.display='block'; document.id(request.name).fade(1);}}).delay(500); //need this animation because the new video appears under the row, so we hide it

		if (request.curip.length && document.id('loco_'+request.name) && !ValidateIPaddress(request.curip)) {
			document.id('loco_'+request.name).innerHTML = request.curip;
			document.id('loco_'+request.name).style.display='block';
			document.id('loco_'+request.name).fade(1);			
		}

		if (document.id('acco_'+request.name) && ValidateAccountId(request.acc_id) ) {
			document.id('acco_'+request.name).style.display='block';
			let na = request.name.split('_');
			let ac = request.acc_id;
			document.id('acco_'+ request.name).fade(1);
			document.id('acco_' + request.name).onclick = function(e) {e.preventDefault(); e.stopPropagation(); copy(ac); flashText('copied '+ na[0]);}
			if (document.id('sp_container' && sp_shown) && document.id('sp_container').style.display != 'block') document.id('acco_'+request.name).style.visibility='hidden';			
		}

	}
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

const onExistingViewers = (msg) => {

   let myname = document.id('name').value;
   
   let audience = '';

   let play_sound = myname == just_left ? false : true;
   
   if (msg.ng) {if (document.id('num_guests')) document.id('num_guests').innerHTML = msg.ng;}
   
   room_limit = (typeof msg.rl !== 'undefined') ? msg.rl : room_limit;
  
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

	   
	   if (arr.length == 0) {audience = 'Audience is empty :(';document.id('audience_numbers').setStyles({'color':'#ccc'});document.id('audience_numbers').innerHTML = '...'; audience_numberr = 0; vcounter = 0; if (document.id('vcounter')) (function(){document.id('vcounter').innerHTML = vcounter;}).delay(500);} else {document.id('audience_numbers').setStyles({'color':'#369'}); document.id('audience_numbers').innerHTML = arr.length;

		if (arr.length > audience_numberr && arr.length > 0 && play_sound) {
	   		soundEffect.src = "/sounds/steps.mp3";
		}
		audience_numberr = arr.length; vcounter = arr.length; if (document.id('vcounter')) document.id('vcounter').innerHTML = vcounter;
	   }
	   if (document.id('audience_boxx')) document.id('audience_boxx').innerHTML = audience;

   }
    
}

const set_guru = (par, who) => {
	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
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

			if (document.id('name').value == who ) {
				chat_shown = 1; document.id('logger').click(); document.id('audience').click(); rejoin();
			}
		}
	}).catch(err => console.log(err));
}

function drop_guest(who) {

	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo || 0;

		if (role == 1) {
			let tok = getCookie('authtoken') || '';
			let message = {
				id : 'dropGuest',
				name : who,
				token: tok
			}		
			sendMessage(message);

		} else {
			onViewerLeft(who);
		}

		let l = who.split('_');
		if (document.id('_au_'+l[1])) document.id('_au_'+l[1]).dispose(); //let it happen	
		
	}).catch(err => console.log(err));
}

function isMicrophoneAllowed(){
    navigator.permissions.query({
        name: 'microphone'
    }).then(function(permissionStatus){
        return permissionStatus.state !== 'denied';
    });
}
	
const onExistingParticipants = (msg) => {
//sets up every video in the room I just joined

  let myname = document.id('name').value; 
  
  //fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {

   //let role = respo || 0;
   
   if (role == 0 && hack) role = 1;
   if (msg.ng) {if (document.id('num_guests')) document.id('num_guests').innerHTML = msg.ng;}

   if (temporary && role == 0) role = 3;
	
   if (role == 1 || role == 2 || role == 3)  {

	let fmode = getCookie('fmode') ? 'environment' : 'user';
		
	i_am_viewer = false;	

//?! brute force
all_muted = getCookie('all_muted');
if (all_muted === true || all_muted === 'true') i_am_muted = true;

	let mode = (i_am_muted === true || i_am_muted === 'true') ? 'm' : aonly ? 'a' : 'v';
		
	var participant = new Participant(name, myname, mode, role, false);
	participants[name] = participant;
	
	var video = participant.getVideoElement();
	
	var canvas = check_iOS() ? participant.getCanvasElement() : '';

	var constraints = {
                audio: true,
                video: {
                        maxWidth : wi_hq,
                        maxFrameRate : fps_hq,
                        minFrameRate : fps_hq,
			facingMode: fmode
                }
	};

	var constraints_vonly = {
                audio: false,
                video: {
			facingMode: fmode
               	}
	};
		
	var constraints_aonly = {
                audio: true,
               	video: false
	};

	if (aonly) constraints = constraints_aonly;

	var constraints_alt = (i_am_muted === true || i_am_muted === 'true') ? constraints_vonly : constraints_aonly;

	var options = {
              	localVideo: video,
		mediaConstraints: constraints,
		onicecandidate: participant.onIceCandidate.bind(participant)
	}
	
	var options_alt = {
		localVideo: video,
		mediaConstraints: constraints_alt,
		onicecandidate: participant.onIceCandidate.bind(participant)
	}
		
	if (shareSomeScreen && (role == 1 || role == 2)) {
      
		shareSomeScreen = true;
		document.id('room-header').style.color = oldColor;
      
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
	
        	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options_sshare, function(error) {
                  if(error) {
			var ff = new RegExp('closed','ig');
			if (error.toString().match(ff)) {
			} else {
                          participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options_alt,
                                function(error) {
                                        if(error) {
                                                return console.error(error);
                                        }

                                        startVideo(video);
                                        this.generateOffer (participant.offerToReceiveVideo.bind(participant));
					if (small_device)  document.id(myname).style.float = 'none';
                          });
			}

			return false;
                  } else {
                  	startVideo(video);
                  	this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			if (small_device)  document.id(myname).style.float = 'none';
		  }

		  (function(){document.id('phones').fade(0);}).delay(1000);
        	});
		}).catch(function(err){console.log(err.name + ": " + err.message);}); //mediaStream
		}).catch(e => console.log(e)); //startCapture
   
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
/* mix microphone
*/			
			navigator.mediaDevices.getUserMedia({audio: true})
			.then(function(mediaStream) {
			var audioTrack = mediaStream.getAudioTracks()[0] ? mediaStream.getAudioTracks()[0] : null;
			
			if (canvas.captureStream) {
			   	captureStream = canvas.captureStream(fps_hq);
				if (audioTrack && i_am_muted !== true && i_am_muted !== 'true') captureStream.addTrack(audioTrack);
			} else 
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
		
			participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
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
					if (small_device)  document.id(myname).style.float = 'none'; 					
					document.id('room-header-file').style.display='none';

                          	}
			);
			}
			return false;
                  	} else {
				startVideo(video);			  	
				this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			
				if (small_device)  document.id(myname).style.float = 'none';
					document.id('room-header-file').style.display='none';
                  	}

		  	(function(){document.id('phones').fade(0);}).delay(1000);
			}); //rtcPeer
		    }).catch(function(err){console.log(err.name + ": " + err.message);}); //mediaStream
	  	  } //already_being_played
		});//video.addEventListener 

	} else {

         	participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
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
					if (small_device)  document.id(myname).style.float = 'none';
                          });
			}

			return false;
                  } else {
                  	startVideo(video);
                  	this.generateOffer (participant.offerToReceiveVideo.bind(participant));
			if (small_device)  document.id(myname).style.float = 'none';
		  }

		  (function(){document.id('phones').fade(0);}).delay(1000);
         	});

	}
	
	(function() {document.id(myname).style.display='block'; document.id(myname).fade(1);}).delay(500);//need this animation because the new video appears under the row, so we hide it
   }// if role

   if (msg.data) {
	   
	   cinemaEnabled = false; num_cinemas = 0;
	   for (var i = 0; i < msg.data.length; i++) {
		var chu = msg.data[i].split('_|_');

		let f = chu[0];
		let s = chu[1];
		let t = chu[2];
		let ac = chu[3];
		let a = chu[4];

console.log('here f is', f, 's is', s);		
		let na = chu[0].split('_');
		
		if (s === 'c') {cinemaEnabled = true; num_cinemas += 1;}
		if (f != myname) {
			//prepare logics in advance
			let pctr = pcounter +1;
			if (pctr < room_limit && role == 0) {document.id('bell').style.display = 'none'; document.id('av_toggler').style.display='block';}
			if (pctr > room_limit - 1 && role == 0) {document.id('bell').style.display = 'block'; document.id('av_toggler').style.display='none';}

			if (!small_device) resizer(pctr);
	    
			
			receiveVideo(f, s, role, false);
			let coo_volume = loadData(f+'_volume');
			
			document.id('slider_' + f).value = coo_volume;
			document.id('video-' + f).volume = coo_volume;
			(function() {document.id(f).style.display='block'; document.id(f).fade(1);}).delay(500);//need this animation because the new video appears under the row, so we hide it

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
		
		if (t.length && document.id('loco_' + f) && !ValidateIPaddress(t)) {
			document.id('loco_' + f).innerHTML = t;
			document.id('loco_' + f).style.display='block';
			document.id('loco_' + f).fade(1);			
		}		
		
		if (document.id('acco_' + f) && ValidateAccountId(ac)) {
			document.id('acco_' + f).style.display='block';
			
			document.id('acco_' + f).fade(1);
			document.id('acco_' + f).onclick = function() {copy(ac); flashText('copied '+ na[0]);}
			if (document.id('sp_container' && sp_shown) && document.id('sp_container').style.display != 'block') document.id('acco_' + f).style.visibility='hidden';			
		}	
		
		if (document.id('anno_' + f) && ValidateAnno(a)) {
		
			document.id('anno_' + f).innerHTML = a;
			document.id('anno_' + f).style.display='block';			
			document.id('anno_' + f).fade(1);
		}

		if (document.id('lol_' + f) && a.length && s === 'p') {
		
			document.id('lol_' + f).innerHTML = 'STOP/PLAY';
			document.id('lol_' + f).style.display='block';			
			document.id('lol_' + f).fade(1);
			document.id('rew_' + f).innerHTML = '<< -10s';
			document.id('rew_' + f).style.display='block';			
			document.id('rew_' + f).fade(1);
		}
	   } //for
   } // msg.data
   	   
   //if (role == 1 || role == 2 || role == 3) (function() {document.id('room-header').style.display = 'block'; document.id('room-header').fade(1);}).delay(1500);
   
//  }).catch(err => console.log(err)); //fetch
}

function copy(that){
	var inp = document.createElement('input');
	document.body.appendChild(inp)
	inp.value = that;
	inp.select();
	document.execCommand('copy',false);
	inp.remove();
}

const leaveRoom = () => {
	
	let myname = document.id('name').value;
	
	//if (Object.keys(participants).length && !problems) { //?!
	if (Object.keys(participants).length) {
	
		for ( var key in participants) {
			//if (!problems || (problems && key != myname)) {
				participants[key].dispose();
				delete participants[key];
			//}
		}

	}

	//pcounter = problems ? 1 : 0;
	pcounter = 0;
	vcounter = 0;
	i_am_guest = 0;
	registered = 0;
	
	if (document.id('num_quests')) document.id('num_quests').innerHTML = 0;
	if (document.id('vcounter')) document.id('vcounter').innerHTML = vcounter;
	
	sendMessage({id : 'leaveRoom'});
	just_left = document.id('name').value;
}

const receiveVideo = (sender, mode, role, n) => {

	let new_flag = (n === true) ? true : false;
	
	var participant = new Participant(sender, document.id('name').value, mode, role, new_flag );
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
				document.id(sender).style.float = 'none';
				document.id(sender).className = PARTICIPANT_MAIN_CLASS; 
			}

	});
	
}

const setGuru = (request) => {
//	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
//		let role = respo || 0;
		let sem  = window.innerWidth > 1024 ? '7' : '';

		if (request.mode == '1' && role != 1) {
		
			temporary = 1; chat_shown = 1; document.id('logger').click(); document.id('audience').click(); rejoin();
			document.id('av_toggler').style.display='block';
			document.id('bell').style.display='none';	
		}
		if (request.mode == '0' && temporary) {

			role = 0; temporary = 0; chat_shown = 1; document.id('logger').click(); document.id('audience').click(); 
			cammode = 0;  
			document.id('fcam').className = "bigO fcam"; document.id('bcam').className = "bigO bcam";
			setCookie('av', false, 144000); aonly = 1; 
			document.id('av_toggler').style.display='none';
			document.id('bell').style.display='block';
			hack = false; //?!
			i_am_viewer = true;
			flashText_and_rejoin('AUDIO-ONLY');
		}
//	}).catch(err => console.log(err));
}

function askGuru(request) {

	let na = request.name.split('_');
	let short_name = na[0];
	let suf = na[na.length-1];
	
	if (document.id('_au_'+suf)) document.id('_au_'+suf).dispose();
	let audi = document.id('audience_boxx').innerHTML == 'Audience is empty :(' ? '' : document.id('audience_boxx').innerHTML;	
	audi = '<div id=_au_'+suf+'><span id=au_' + suf + ' style="color:#9cf;cursor:pointer;font-size:16px;font-weight:bold;" onclick="set_guru(1,\'' + request.name + '\');">'+short_name + '</span> ' + requ +  ' <span style="cursor:pointer;" onclick="drop_guest(\'' +request.name + '\')" >X</span></div>' + audi;
	
	let ar_split = audi.split('_au_');
	let cur = ar_split.length - 1;
	
	document.id('audience_boxx').innerHTML = audi;
	document.id('au_'+suf).setStyles({'color':'#faa'});

	//fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
	//	let role = respo || 0;
		//if (role == 1 || request.name == document.id('name').value) {
			soundEffect.src = "/sounds/wood_" + window.location.hostname + ".mp3";
			chat_shown = 0; document.id('logger').click();
			document.id('message_box').style.display = 'none';
			document.id('audience_box').style.display = 'table';
		//}
	//}).catch(err => console.log(err));

}

const setCinema = (request) => {

	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let myrole = respo || 0;	
		let p = participants[request.name];
		p.setMode(request.mode);
	
		let o = document.id('one-' + request.name);
		let m = request.mode;

		o.style.color = m == 'c' ? '#ff0' : '#369';
		o.style.fontWeight = m == 'c' ? 'bold' : 'normal';
		o.style.display = m == 'c' ? 'block' : myrole == 1 ? 'block' : 'none';
		o.innerHTML = m == 'c' ? 'CINEMA!' : 'CINEMA?';
		
		num_cinemas = m == 'c' ? num_cinemas + 1 : num_cinemas - 1;
		

		cinemaEnabled = m == 'c' ? true : num_cinemas ? cinemaEnabled : false;
//console.log('num_cinemas', num_cinemas, 'enabled', cinemaEnabled);

	}).catch(err => console.log(err));	
}

function newChatMessage() {
	let cnt = 0; let sem  = window.innerWidth > 1024 ? '7' : '';
	let old_color = document.id('logger').style.background == 'url(/icons/chat' + sem + '2.png) center center no-repeat' ? 'url(/icons/chat' + sem + '2.png) center center no-repeat #f78f3f' : 'url(/icons/chat' + sem + '2.png) center center no-repeat;';
	new_message = 1;
	let intervalID = setInterval(function() { if (new_message) {document.id('logger').style.background = cnt % 2 == 0 ? 'url(/icons/chat' + sem + '2.png) center center no-repeat #90ee90' : 'url(/icons/chat' + sem + '2.png) center center no-repeat'; cnt++;} else {document.id('logger').style.background = old_color; clearInterval(intervalID)}}, 1000);
	
	fetch('https://'+window.location.hostname+':'+port+'/log.html').then(response => response.text()).then((response) => {document.id('message_box').innerHTML = response; }).catch(err => console.log(err));

		soundEffect.src = "/sounds/buzz.mp3";
}

function setAnno(request) {
//console.log("setting anno:", request.participant, "anno:",request.anno);
	if (document.id('anno_' + request.participant)) {
		document.id('anno_' + request.participant).innerHTML = request.anno;
		document.id('anno_' + request.participant).style.display='block';			
		document.id('anno_' + request.participant).fade(1);
	}
	
}

function changeTabLR(request) {

	if (request.side == 'l') {
		if (document.id('leftnum')) document.id('leftnum').innerHTML = request.num.toString();
		soundEffect.src = "/sounds/track04.mp3";
	}
	if (request.side == 'r') {
		if (document.id('rightnum')) document.id('rightnum').innerHTML = request.num.toString();
		soundEffect.src = "/sounds/track01.mp3";
	}
}

function bongoKey(request) {

	let a = '';
	let myname = document.id('name').value;
	let myvideo = 'video-' + myname;
	
	let video_controlable = request.name === myname || request.name === '' ? true : false; 
	
	if (request.num == '65') {
		soundEffect.src = "/sounds/track01.mp3";
		a = 'a';

	}
	if (request.num == '66') {
		soundEffect.src = "/sounds/track02.mp3";
		a = 'b';

	}
	if (request.num == '67') {
		soundEffect.src = "/sounds/track03.mp3";
		a = 'c';

	}
	if (request.num == '68') {
		soundEffect.src = "/sounds/track04.mp3";
		a = 'd';

	}
	if (request.num == '69') {
		soundEffect.src = "/sounds/track05.mp3";
		a = 'e';

	}
	if (request.num == '70') {
		soundEffect.src = "/sounds/track06.mp3";
		a = 'f';
		if (now_playing && video_controlable) document.id(myvideo).currentTime += 10;

	}
	if (request.num == '71') {
		soundEffect.src = "/sounds/track07.mp3";
		a = 'g';

	}
	if (request.num == '72') {
		soundEffect.src = "/sounds/track08.mp3";
		a = 'h';

	}
	if (request.num == '73') {
		soundEffect.src = "/sounds/track09.mp3";
		a = 'i';

	}
	if (request.num == '74') {
		soundEffect.src = "/sounds/track10.mp3";
		a = 'j';

	}
	if (request.num == '75') {
		soundEffect.src = "/sounds/track11.mp3";
		a = 'k';

	}
	if (request.num == '76') {
		soundEffect.src = "/sounds/track12.mp3";
		a = 'l';

	}
	if (request.num == '77') {
		soundEffect.src = "/sounds/track13.mp3";
		a = 'm';

	}	
	if (request.num == '78') {
		soundEffect.src = "/sounds/track14.mp3";
		a = 'n';

	}
	if (request.num == '79') {
		soundEffect.src = "/sounds/track15.mp3";
		a = 'o';

	}
	if (request.num == '80') {
		soundEffect.src = "/sounds/track16.mp3";
		a = 'p';
		if (now_playing && video_controlable) document.id(myvideo).play();

	}
	if (request.num == '81') {
		soundEffect.src = "/sounds/track15.mp3";
		a = 'q';

	}
	if (request.num == '82') {
		soundEffect.src = "/sounds/track14.mp3";
		a = 'r';
		if (now_playing && video_controlable) document.id(myvideo).currentTime -= 10;

	}
	if (request.num == '83') {
		soundEffect.src = "/sounds/track13.mp3";
		a = 's';
		if (now_playing && video_controlable) document.id(myvideo).pause();

	}
	if (request.num == '84') {
		soundEffect.src = "/sounds/track12.mp3";
		a = 't';

	}
	if (request.num == '85') {
		soundEffect.src = "/sounds/track11.mp3";
		a = 'u';
		if (now_playing  && video_controlable && __playing) {document.id(myvideo).pause(); __playing = false;}
		else if (now_playing  && video_controlable && !__playing) {document.id(myvideo).play(); __playing = true;}

	}					
	if (document.id('leftbongo')) {document.id('leftbongo').innerHTML = a; document.id('leftbongo').fade(1); (function(){document.id('leftbongo').fade(0);}).delay(300);}
}

function clearTimeoutAndLeave() {

	if (role != 1) {eraseCookie('timeout_nc'); soundEffect.src = "/sounds/drop.mp3"; document.id('phones').innerHTML = 'Leaving room'; document.id('phones').fade(1); setTimeout(function() {location.reload()}, 1000);}

}

const onParticipantLeft = (request) => {

	//let myname = document.id('name').value;
	//let myvideo = 'video-' + myname;	
	//if (now_playing) document.id(myvideo).pause();
	
	var participant = participants[request.name];
	if (participant) {
		participant.dispose();
		if (pcounter < room_limit) {document.id('bell').style.display = 'none'; document.id('av_toggler').style.display='block';}
		delete participants[request.name];
		just_left = request.name;
        	if (!small_device) resizer(pcounter);			

	}
}

const onViewerLeft = (n) => {
	
	let na = n.split('_');
	let suf = na[na.length-1];	
	if (document.id('_au_'+suf)) {
		document.id('_au_'+suf).dispose();
		let cur = document.id('audience_numbers').innerHTML == '...'  ?  0 : parseInt(document.id('audience_numbers').innerHTML)-1;
		vcounter = cur > 0 ? cur : 0;

		if (document.id('vcounter')) { if (!vcounter) {(function(){document.id('vcounter').innerHTML = vcounter;}).delay(1000);} else {document.id('vcounter').innerHTML = vcounter;} }
		cur = cur > 0 ? cur : '...';
		document.id('audience_numbers').innerHTML = cur;
		let col = cur > 0 ? '#369' : '#ccc';
		document.id('audience_numbers').setStyles({'color': col});
		document.id('audience_boxx').innerHTML = cur == '...' ? 'Audience is empty :(' : document.id('audience_boxx').innerHTML;
		chat_shown = 1; document.id('logger').click(); document.id('audience').click(); 
	}
}

const sendMessage = (message) => {
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

function isIOSFirefox() {
  return navigator.userAgent.match("FxiOS");
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
