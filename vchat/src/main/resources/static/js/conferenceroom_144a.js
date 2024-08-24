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
var playSomeMusic_muted = true;
var audioContext = null;
var mediaSource;
var analyser;

var only_once = 1;

var shareSomeScreen = false;

var already_being_played = false;
var savedSrc = null;
var recordedVideo = null;

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
const wi_hq = 1280;

//const sp_setter_url = w[0].match(new RegExp('rgsu','g')) ? "https://cube.room-house.com:8449" : "https://aspen.room-house.com:8447";
//const sp_container_url = w[0].match(new RegExp('rgsu','g')) ? "https://cube.room-house.com:8444" : "https://aspen.room-house.com:8446";
const sp_setter_url = "https://coins2.room-house.com";
const sp_container_url = "https://coins1.room-house.com";
const sm_url = "https://slotmachine.room-house.com";
//const poker_url = "https://room-house.com/poker/";
const poker_url = "https://poker.room-house.com";
const chess_url = "https://chess.room-house.com";
const air_url = "https://bot.skypirl.net";
const swap_url = "https://coins.room-house.com";

//const role  = 0;

const small_device = ((check_iOS() || isAndroid) && screen.width <= 1024) || window != window.top ? true : false;
const tablet = small_device && screen.width >= 960 ? true : false;
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
       
       if (registered || problems) check_connection();

   }, 20000 + Math.random() * 10000);

   setInterval(function(){
       
       if (registered) check_fullscreen();

   }, 1000);
      
	let lang = getCookie('lang');
	lang = (lang === null || lang === 'null') ? 0 : lang;
	lang = lang === '' ? 0 : lang;
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
	case 'newDrop':
		newDrop(parsedMessage);
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

function check_locked() {
	if ((vcounter == 0 || vcounter == '0') && (pcounter == 0 || pcounter == '0') && !cine) { console.log('locked!'); (function() {clearAllCookies(); location.reload();}).delay(1000) } 
}

function check_connection() {

	check_locked();
	connection_is_good = 0;
	var message={id : 'checkConnection'}; 
	sendMessage(message);
	setTimeout(function() { if (!connection_is_good) { problems = 1; already_clicked = false; /*setCookie('av', null, 0);*/ if (playSomeMusic) {setCookie('fmode',22,14400); let myname = document.id('name').value; let myvideo = 'video-' + myname; setCookie('cT', document.id(myvideo).currentTime, 14400); console.log('video', myvideo, 'cT', document.id(myvideo).currentTime);} aonly = 1; cammode = 0; playSomeMusic = 0; shareSomeScreen = 0; console.log('resetting connection'); document.id('phones').innerHTML = warning; (function() { document.id('phones').fade(1)}).delay(1000);} else {if (problems) {/*console.log('conn ok'); problems = 0; rejoin();*/} else {/*console.log('ok ,reg is', registered, 'al_cli', already_clicked, 'pctr', pcounter);*/ if (pcounter == 0 && role != 0) {/*hack ash -- unreacheable code*/ /*let ca = getCookie('fmode'); (function() { if (ca == 1) {console.log('ha!'); cli2();} if (ca == 2) {console.log('ha2!');cli3();} if (ca == 22) {console.log('ha22!'); cli6();}}).delay(100);*/} /*if (pcounter == 0 && role == 0) rejoin();*/}}}, 1200);
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

	if (document.id('house')) document.id('house').style.visibility='hidden';
	if (document.id('room_name_id')) document.id('room_name_id').style.display='none';
	if (document.id('preroom')) document.id('preroom').style.visibility='hidden';
	var av = getCookie('av');
	if (av && guru_is_here) aonly = 0;
// console.log('av', av, 'guru', guru_is_here, 'aonly', aonly);
	
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
				case 'newDrop':
					newDrop(parsedMessage);
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
		let house = w[0];
	
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
		
		(function() {
			document.id('house').style.minHeight = '0px';
			document.id('house').style.background = 'transparent';
			document.id('house').style.display = 'block';
			document.id('house').style.visibility = 'visible';
		
		}).delay(1000);
		
		document.id('phones').style.display = 'block';
		document.id('phones').style.visibility = 'visible';
		document.id('cr').style.display = 'none';
		document.id('av_selector').style.display = 'block';
		document.id('poll').style.display = 'block';
		if (voting_shown) {document.id('leftnum').style.display = 'block'; document.id('rightnum').style.display = 'block';}
	
		let curr_all_muted = getCookie('all_muted') || false;
		let my_mic_muted = loadData(document.id('name').value+'_muted');

		document.id('all_muter').className = check_iOS() && my_mic_muted !== true && my_mic_muted !== 'true' ? "bigO my_mic_on_all_off" : (my_mic_muted === true || my_mic_muted === 'true') && !curr_all_muted && role ? "bigO my_mic_off" : curr_all_muted ? "bigO allmuter_off" : "bigO allmuter_on";
		
		// document.id('all_muter').title = (my_mic_muted === true || my_mic_muted === 'true') && !curr_all_muted ? 'Turn on microphone' : curr_all_muted ? 'Turn on sound' : 'Turn off all sound';
		document.id('all_muter').title = document.id('all_muter').className === "bigO my_mic_on_all_off" ? 'Turn on sound' : document.id('all_muter').className === "bigO allmuter_off" ? 'Turn on sound' : document.id('all_muter').className === "bigO my_mic_off" ? 'Turn on microphone' : 'Turn off sound'
	
		document.id('leftplus').style.display = 'block';
		document.id('rightplus').style.display = 'block';

        	if (( (ro == 1) || !he_votado) && firstTime) {

                	//document.id('leftplus').addEventListener('click', leftHandler);
                	//document.id('rightplus').addEventListener('click', rightHandler);
			addEventListener("keydown", (event) => {
  				//event.keyCode === 65 ? leftHandler(event) : event.keyCode === 76 ? rightHandler(event) : noHandler(event);
				let n = event.keyCode ? event.keyCode : 65;
				if (n === 66) { if (document.id('controls').style.display === 'none' && !small_device) document.id('message_wrap').style.marginTop = '48vh'; cli5(); }
				eventHandler(n);
			});
                	firstTime = false;
        	}
	
		document.id('fmode_selector').style.display = 'block';
		//if (document.id('newsub') && ro == 1) 
			document.id('newsub').style.display = 'block';
		

		if(document.id('rh_container')) document.id('rh_container').style.display = 'none';
		
		// brute force
		all_muted = getCookie('all_muted');
		if (all_muted === true || all_muted === 'true') i_am_muted = true;

		let mode = (i_am_muted === true || i_am_muted === 'true') ? 'm' : aonly ? 'a' : 'v';
		
		mode = plr ? 'p' : mode;
		
		let tok = getCookie('authtoken') || '';
		
		if (ro == 0 && hack) role = 1;
	// if (document.id('house') && !small_device && role == 1) {document.id('house').style.minWidth='53vw'; document.id('house').style.maxWidth='1000px';}
	// if (document.id('house') && !small_device && role != 1) {document.id('house').style.minWidth='1000px';}
	
	if (document.id('house') && !small_device) {document.id('house').style.minWidth='1000px';}
	
		
// console.log('1: role is', role, 'mode is', mode);

		// if (role === 3 && mode === 'a' && only_once) { // hack ash
		//	(function() {if (document.id('speaker-' + name)) document.id('speaker-' + name).click(); only_once = 0;}).delay(3000);	
		// }

// console.log('registering, mode is' ,mode, 'role is', role, 'name is', name);
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
			house : house,
			curip: curip,
			acc_id: data,
			token: tok,
			role: role,
			currRoom: currRoom
		   }
	
		   sendMessage(message);		

		});

 		if (problems) {//use 'onclick' to reload client on connection breakup IMPORTANT
			document.id('phones').style.paddingTop = small_device ? '39vh' : '45vh'; document.id('phones').style.lineHeight = '36px'; document.id('phones').innerHTML = warning;
			/*document.id('phones').onclick=location.reload();*/ (function() { document.id('phones').fade(1)}).delay(1000);
		}

  		if(stats_shown) { (function(){document.id('stats').style.display='block'; document.id('stats').fade(1);}).delay(1000);}		

		// if (document.id('want') && window == window.top) (function() {document.id('want').style.display = "block"; document.id('want').fade(1);}).delay(500);
		
		if (!small_device && document.id('helpdoc')) (function() {let l = checkLang(); /*if (!small_device) document.id('helpdoc').style.marginRight = "4.8vw";*/

		if (small_device) {document.id('helpdoc').style.paddingTop = "0.4vh"; document.id('helpdoc').style.paddingRight = "2vw";}
		
		if (!small_device && window != window.top) {document.id('helpdoc').style.marginRight = "2vw";} document.id('helpdoc').fade(1);}).delay(500);
		
		document.body.style.overflowY = 'auto';
		// if (small_device && window != window.top && !tablet) document.body.style.zoom = '90%';
		// if (small_device && window != window.top) document.body.style.minHeight = '200vh';
				
		(function() {dummies = true;}).delay(3000);
		
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		
		// IMPORTANT: get SDP_ALREADY_NEGOTIATED for camera auto re-activation, so leave it only for players?!

		if (role == 1 && !already_clicked && problems) {already_clicked = true; let ca = getCookie('fmode'); let av = getCookie('av'); (function() { if (ca == 0 && av) {console.log('clicking 2!');cli2();} if (ca == 1 && av) {console.log('clicking 3!');cli3();} if (ca == 22) { playSomeMusic=true; getFile(); cli6(); } console.log('auto re-connect, ca is', ca, 'av is', av);}).delay(200);}

}

function checkLang() {
	let l = getCookie('lang');
	l = (l === null || l === 'null') ? w[0].match(new RegExp('rgsu','g')) ? 1 : 0 : l === '' ? 0 : l;
	
	return l;
}
const onNewViewer = (request) => {

	if (request.currRoom && currRoom != request.currRoom) return false; // do not connect those coming to a room other than mine current
	
	let myname = document.id('name').value; let myvideo = 'video-' + myname;	
	if (now_playing) (function() {if (document.id(myvideo)) document.id(myvideo).play();__playing = true;}).delay(1000);

	if (request.ng) {if (document.id('num_guests')) document.id('num_guests').innerHTML = request.ng;}
	room_limit = (typeof request.rl !== 'undefined') ? request.rl : room_limit;

		let na = request.name.split('_');
		let short_name = na[0];
		let suf = na[na.length-1];
	
		let f = request.name;
		let t = request.curip;
	
		if (document.id('_au_'+suf)) document.id('_au_'+suf).dispose();
		
		let medal = !temporary ? '<span id=_o_'+suf+' style="cursor:pointer;font-size:36px;border-radius:20px;" onclick="if (this.style.background === \'#9cf\') {set_guru(3,\'' + f + '\');this.style.background=\'transparent\';this.onclick=function(){set_guru(2,f);this.style.background=\'#9cf\';}} else {set_guru(2,\'' + f + '\');this.style.background=\'#9cf\';this.onclick=function(){set_guru(3,\'' + f + '\');this.style.background=\'transparent\';}}">O</span> ' : '';

		let audi = document.id('audience_boxx').innerHTML == 'Audience is empty :(' ? '' : document.id('audience_boxx').innerHTML;	
		audi = '<div id=_au_'+suf +'>' + medal + '<span id=au_' + suf + ' style="color:#9cf;cursor:pointer;" onclick="set_guru(1,\'' + f + '\');">'+short_name + '</span>, ' + t + ' <span style="cursor:pointer;"  onclick="drop_guest(\'' + f + '\')" >X</span></div>' + audi;
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

  if (request.currRoom && currRoom != request.currRoom) return false; // do not connect those coming to a room other than mine current
  
  if (request.ng) {if (document.id('num_guests')) document.id('num_guests').innerHTML = request.ng;}
	
	let myrole = role;
	
	let myname = document.id('name').value;
	let myvideo = 'video-' + myname;	
	if (now_playing) (function() {document.id(myvideo).play();__playing = true;}).delay(3000);

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
	
	let my_mic_muted = loadData(document.id('name').value+'_muted');
	document.id('all_muter').className = check_iOS() && my_mic_muted !== true && my_mic_muted !== 'true' ? "bigO my_mic_on_all_off"	: document.id('all_muter').className;

	if (!video_hidden) {

		//preparing logics in advance
		let pctr = pcounter + 1;
		if (pctr > room_limit - 1 && i_am_viewer) {if (document.id('bell')) document.id('bell').style.display = 'block'; if (document.id('av_toggler')) document.id('av_toggler').style.display='none';}

		if (!small_device && window == window.top) resizer(pctr);
		if (small_device || tablet) {
		 pcounter === 0 && window == window.top ? isIOSFirefox() ? document.id('participants').style.marginTop = '10vh' : document.id('participants').style.marginTop = '-5vh' : document.id('participants').style.marginTop = '-8vh';		 
		 if (small_device && pcounter === 0) document.id('participants').style.height = window == window.top ? '50vh' : '63vh';
		 if (small_device && pcounter === 1) document.id('participants').style.height = window == window.top ? '110vh' : tablet ? '140vh' : '128vh';
		 if (small_device && pcounter === 2) document.id('participants').style.height = window == window.top ? '175vh' : '190vh';
		 if (small_device && pcounter === 3) document.id('participants').style.height = window == window.top ? '235vh' : '250vh';
		 if (small_device && pcounter > 3) document.id('participants').style.height = window == window.top ? '275vh' : '300vh';
		
		 /*if (tablet)  {

			if (pcounter === 0) document.id('participants').style.maxHeight = '460px';
			if (pcounter === 1) document.id('participants').style.maxHeight = '960px';
			if (pcounter === 2) document.id('participants').style.maxHeight = '1440px';
			if (pcounter > 2) document.id('participants').style.maxHeight = '1920px';
		 }*/
		 // take care when only 1 participant in audio mode, small device
		 if (small_device && pcounter === 0) {
			if (Object.keys(participants) && Object.keys(participants).length === 1) {	
				for (var key in participants) {
					if (participants[key].mode === 'a') {
						document.id('participants').style.height = '35vh';
						document.id('participants').style.marginTop = '12vh';
						//document.id('participants').style.float = 'bottom';
						//document.id('participants').style.position='absolute';
						//document.id('participants').style.bottom='-50vh';						
					}
				}
			}		 	
		 }
		 // calculate the height of participants
		 /*setTimeout(function() {
			let p_height = 0;
			if (Object.keys(participants).length) {	
				for (var key in participants) {

					let co = document.id(participants[key].name).getBoundingClientRect(); console.log ('co1 is', co);
			 		p_height += parseInt(co.height)
				}
			}
			console.log ('pheight1 is', p_height);
			let tot_height = parseInt((p_height / screen.height) *200); // padding
			let max_height = tot_height + 5;
			console.log ('tot_height1 is', tot_height);
			document.id('participants').style.height = tot_height + 'vh';
			// document.id('participants').style.maxHeight = max_height + 'vh';
		 }, 1000);*/
		}
		
// console.log('name:', request.name, 'mode:', request.mode, 'myrole:', myrole);
	   	
		receiveVideo(request.name, request.mode, myrole, true);
		
		(function() {if (document.id(request.name)) {document.id(request.name).style.display='block'; document.id(request.name).fade(1);}}).delay(500); //need this animation because the new video appears under the row, so we hide it
		
		//set new participant sound according to all_muter
		let noSound = document.id('all_muter').className === "bigO my_mic_on_all_off" || document.id('all_muter').className === "bigO allmuter_off"
		let vid = document.id('video-' + request.name);
		vid.muted = noSound;
		let spea = document.id('speaker-' + request.name);
		spea.removeChild(spea.childNodes[0]);
		request.mode !== 'm' && noSound && spea.appendChild(document.createTextNode('\uD83D\uDD07'));//muted icon
		request.mode !== 'm' && !noSound && spea.appendChild(document.createTextNode('\uD83D\uDD0A'));//speaker icon
		request.mode === 'm' && spea.appendChild(document.createTextNode('X'));//x icon
				
		if (request.curip.length && document.id('loco_'+request.name) && !ValidateIPaddress(request.curip)) {
			document.id('loco_'+request.name).innerHTML = request.curip;
			document.id('loco_'+request.name).style.display='block';
			document.id('loco_'+request.name).fade(1);			
		}
// console.log('cine:', cine, 'role', role);
		if (cine && role != 1) {
			(function() {document.id('loco_' + request.name).fade(0);document.id('span_' + request.name).fade(0);}).delay(2000);
		}
		
		if (document.id('acco_'+request.name) && ValidateAccountId(request.acc_id) ) {
			document.id('acco_'+request.name).style.display='block';
			let na = request.name.split('_');
			let ac = request.acc_id;
			document.id('acco_'+ request.name).fade(1);
			document.id('acco_' + request.name).onclick = function(e) {
				e.preventDefault(); e.stopPropagation(); copy(ac); flashText('copied '+ na[0]);
				acc_id.then(data => {
					setTimeout(function() {
						if (document.id('removerA')) {document.id('removerA').innerHTML = 'Error: Service unavailable';
						(function() {document.id('removerA').fade(0)}).delay(1000);}
					}, 10000);					
					(function() {
						if (document.id('sp_balance')){
								document.id('sp_balance').style.display='block';
								document.id('sp_balance').src=sp_container_url+'/?acc='+data;
						}
					}).delay(1000);
					document.id('sp_container').style.display = 'block'; sp_shown = 1; 
					ch_int = setInterval(function() { 
						if (document.id('sp_balance')) {
							document.id('sp_balance').style.display='block';
							document.id('sp_balance').src = sp_container_url + '/?acc=' + data;
						}
					}, 300000);	  
				});				
			}
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
	
		if (document.id('_au_'+suf)) document.id('_au_'+suf).dispose();
	
		let medal = !temporary ? '<span id=_o_'+suf+' style="cursor:pointer;font-size:36px;border-radius:20px;" onclick="if (this.style.background === \'#9cf\') {set_guru(3,\'' + f + '\');this.style.background=\'transparent\';this.onclick=function(){set_guru(2,f);this.style.background=\'#9cf\';}} else {set_guru(2,\'' + f + '\');this.style.background=\'#9cf\';this.onclick=function(){set_guru(3,\'' + f + '\');this.style.background=\'transparent\';}}">O</span> ' : '';

		audience = audience + '<div id=_au_'+suf +'>' + medal + '<span id=au_' + suf + ' style="color:#9cf;cursor:pointer;" onclick="set_guru(1,\'' + f + '\');">'+short_name + '</span>, ' + t + ' <span style="cursor:pointer;" onclick="drop_guest(\'' + f + '\')" >X</span></div>'		
		
		
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
/*
function isMicrophoneAllowed(){
    navigator.permissions.query({
        name: 'microphone'
    }).then(function(permissionStatus){
        return permissionStatus.state !== 'denied';
    });
}
*/	
const onExistingParticipants = (msg) => {
//sets up every video in the room I just joined

  let myname = document.id('name').value; 
  
  //fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {

   //let role = respo || 0;
   
   if (role == 0 && hack) role = 1;
   //if (msg.ng) {if (document.id('num_guests')) document.id('num_guests').innerHTML = msg.ng;}
   if (msg.num_rooms) num_rooms = msg.num_rooms;
   // console.log('num_rooms', num_rooms);
   let room_sel = ''; var sym = 'A'; 
   for (i = 1; i <= num_rooms; i++) {
   	sym = i == 2 ? 'B' : i == 3 ? 'C' : i == 4 ? 'D' : i == 5 ? 'E' : i == 6 ? 'F' : sym;
	let addon = sym == currRoom ? '&nbsp;&nbsp;<span style="color:#fed;border:1px solid #fed; padding:3px">ROOM' + i + '</span>&nbsp;&nbsp;' : '&nbsp;&nbsp;<span style="color:#9cf;cursor:pointer; padding:3px" onclick="currRoom = \'' + sym + '\';/*console.log(\'sym\',currRoom);*/(function(){document.id(\'bg_switch\').click()}).delay(500);flashText_and_rejoin(\'SKIP TO ROOM \' + currRoom);">ROOM' + i + '</span>&nbsp;&nbsp;';
 
	room_sel = room_sel + addon;
   }
   if (num_rooms == 1) room_sel = '';
   if (num_rooms < 4) document.id('room_selector_box').style.left=0;
   if (num_rooms === 4) document.id('room_selector_box').style.left='-25px';
   if (num_rooms === 5) document.id('room_selector_box').style.left='-80px';
   if (num_rooms > 5) document.id('room_selector_box').style.left='-135px';
   document.id('room_selector').innerHTML = room_sel;

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
	
	var video = recordedVideo ?  recordedVideo : participant.getVideoElement();
	
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

	var constraints_alt = (i_am_muted === true || i_am_muted === 'true' || role === 3) ? constraints_vonly : constraints_aonly; // hack ash

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
			
	//if (shareSomeScreen && (role == 1 || role == 2)) {
	if(recordedVideo && savedSrc) {
		
		shareSomeStream = true;
		var cstrx = {
			audio: true,
			video:{
				maxWidth : wi_hq,
				maxFrameRate : fps_hq,
				minFrameRate : fps_hq
			}
		};

		options = {
			videoStream: savedSrc,
			onicecandidate: participant.onIceCandidate.bind(participant),
			mediaConstraints : cstrx
		}
		option_alt = {
			videoStream: savedSrc,
			onicecandidate: participant.onIceCandidate.bind(participant),
			mediaConstraints :{audio: true, video: false}
		}
		
		
		/*
		const ctx = new AudioContext(); const dest = ctx.createMediaStreamSource(savedSrc); dest.connect(ctx.destination);
		recordedVideo.autoplay = true;
		recordedVideo.playsInline = true;
		recordedVideo.controls = true;
		recordedVideo.crossOrigin = 'anonymous';
		recordedVideo.volume = 1;
		recordedVideo.muted = false;
		*/
				
		participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
                  	 if(error) {
		  	var ff = new RegExp('closed','ig');
		  	if (error.toString().match(ff)) {
		  	} else {
                            		participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(option_alt,
                          		   function (error) {
                                        	if(error) {
                                                	return console.error(error);
                                        	}
				
                                        	startVideo(video);
                                        	this.generateOffer (participant.offerToReceiveVideo.bind(participant));
				if (small_device)  document.id(myname).style.float = 'none'; 				
				document.id('room-header-file').style.display='none';
				//if (!small_device) {document.id(myname).style.marginLeft = '2px'; document.id(myname).style.marginRight = '2px';}
                          		   }
		    		);
		  	}
		  	return false;
                  	 } else {
                  	  	startVideo(video);
		  	
				this.generateOffer (participant.offerToReceiveVideo.bind(participant));
		
				if (small_device)  document.id(myname).style.float = 'none';
				//if (!small_device) {document.id(myname).style.marginLeft = '2px'; document.id(myname).style.marginRight = '2px';}
				document.id('room-header-file').style.display='none';
                  	 }
		  	 (function(){document.id('phones').fade(0);}).delay(1000);
		}); //rtcPeer

	} else if (shareSomeScreen) {
      
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
   
	//} else if (playSomeMusic && (role == 1|| role == 2)) {
	} else if (playSomeMusic) {

		// with sound both in the stream and in the local video. 
		// initialize the audioContext
		if (playSomeMusic_muted === false) {
			audioContext = new AudioContext();
			//console.log('audioContext init1');
			mediaSource = audioContext.createMediaElementSource(video);
			analyser = audioContext.createAnalyser();
			mediaSource.connect(analyser);
			analyser.connect(audioContext.destination);
		}
  
		video.autoplay = true;
		video.playsInline = true;
		video.controls = true;
		video.crossOrigin = 'anonymous';
		video.volume = 1;
		video.loop = true;
		video.src = selectedFile ? selectedFile : null;
		video.muted = false;
		let cT = getCookie('cT') || 0; 
		//console.log('video name', video, 'cT', cT);
		video.currentTime = cT > 0 ? cT : 0;
	
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
			//NB: mix audio from mic to that of the video

			const ctx = new AudioContext();
			const dest = ctx.createMediaStreamDestination();
			const audioIn_01 = ctx.createMediaStreamSource(mediaStream);
			const audioIn_02 = ctx.createMediaStreamSource(captureStream);
 
			if (i_am_muted !== true && i_am_muted !== 'true') audioIn_01.connect(dest);
			audioIn_02.connect(dest);
			
			const audioStreamTrack = dest.stream.getAudioTracks()[0];
			const captureStreamVideoTrack = captureStream.getVideoTracks()[0];
			const mixStream = new MediaStream();
			mixStream.addTrack(captureStreamVideoTrack);
			mixStream.addTrack(audioStreamTrack);
			
			var cstrx = {
				audio: true,
				video:{
					maxWidth : wi_hq,
					maxFrameRate : fps_hq,
					minFrameRate : fps_hq
				}
			};

			options = {
				videoStream: mixStream,
				onicecandidate: participant.onIceCandidate.bind(participant),
				mediaConstraints : cstrx
			}
			option_alt = {
				videoStream: mixStream,
				onicecandidate: participant.onIceCandidate.bind(participant),
				mediaConstraints :{audio: true, video: false}
			}
		
			participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
                  	 if(error) {
			  	var ff = new RegExp('closed','ig');
			  	if (error.toString().match(ff)) {
			  	} else {
                            		participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(option_alt,
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
                  	  	//startVideo(video);
                  	  	video.play();

				if (playSomeMusic_muted === false) {
				    function getSoundData() {
				       var sample = new Float32Array(analyser.frequencyBinCount);
				       return analyser.getFloatFrequencyData(sample);  
				    }
				}
			  	
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
			// if (small_device && pcounter === 1)  document.id(myname).style.float = 'none';
			
			if (small_device || tablet) {
				pcounter === 1 && window == window.top ? isIOSFirefox() ? document.id('participants').style.marginTop = '10vh' : document.id('participants').style.marginTop = '0vh' : document.id('participants').style.marginTop = '-8vh';
				
				if (pcounter === 1) document.id('participants').style.height = window == window.top ? '50vh' : '63vh';
				if (pcounter === 2) document.id('participants').style.height = window == window.top ? '110vh' : tablet ? '140vh' : '128vh';
				if (pcounter === 3) document.id('participants').style.height = window == window.top ? '175vh' : '190vh';
				if (pcounter === 4) document.id('participants').style.height = window == window.top ? '235vh' : '250vh';
				if (pcounter > 4) document.id('participants').style.height = window == window.top ? '275vh' : '300vh';
				
				// this will make own video go down the participants div
				document.id('participants').style.position = 'relative';
				document.id(myname).style.position = 'absolute';
				document.id(myname).style.bottom = '0vh';

			 /*if (tablet)  {
				//document.id('room').style.marginTop = '-240px';
				if (pcounter === 1) document.id('participants').style.maxHeight = '460px';
				if (pcounter === 2) document.id('participants').style.maxHeight = '960px';
				if (pcounter === 3) document.id('participants').style.maxHeight = '1440px';
				if (pcounter > 3) document.id('participants').style.maxHeight = '1920px';
			 }*/

			// take care when only 1 participant in audio mode, small device
			if (small_device && pcounter === 1) {
				if (Object.keys(participants) && Object.keys(participants).length === 1) {	
					for (var key in participants) {
						if (participants[key].mode === 'a') {
							document.id('participants').style.height = '35vh';
							document.id('participants').style.marginTop = '12vh';
							
							//document.id('participants').style.float = 'bottom';
							//document.id('participants').style.position='absolute';
							//document.id('participants').style.bottom='-50vh';						
						}
					}
				}		 	
		 	}			
			 // calculate the height of participants
			 /*setTimeout(function() {
				let p_height = 0;
				if (Object.keys(participants).length) {
					for (var key in participants) {

						let co = document.id(participants[key].name).getBoundingClientRect(); console.log ('co2 is', co);
			 			p_height += parseInt(co.height)
					}
				}
				console.log ('pheight2 is', p_height);
				let tot_height = parseInt((p_height / screen.height) *200); // padding
				let max_height = tot_height + 5;
				console.log ('tot_height2 is', tot_height);
				document.id('participants').style.height = tot_height + 'vh';
				// document.id('participants').style.maxHeight = max_height + 'vh';
				
				// this will make own video go down the participants div
				document.id(myname).style.position = 'absolute';
				document.id(myname).style.bottom = '0vh';
			 }, 1000);*/
			}
			
			if (!small_device && window == window.top) resizer(1);
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

//console.log('here f is', f, 's is', s);		
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
			// if (check_iOS()) document.id('speaker-' + f).click(); //?! doesn't help; iphone needs manual unblock
			
			//let d = document.id( f).getBoundingClientRect(); let video_height = d.height-30; console.log('video_height', video_height, 'extra', document.id(f).offsetHeight, 'extra2', document.id(f).clientHeight, 'extra3',  document.id(f).style.height);
			//if (video_height >  max_video_height) max_video_height = video_height;
			
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

		if (cine) {
			(function() {document.id('loco_' + f).fade(0);document.id('span_' + f).fade(0);}).delay(2000);
		}
				
		if (document.id('acco_' + f) && ValidateAccountId(ac)) {
			document.id('acco_' + f).style.display='block';
			
			document.id('acco_' + f).fade(1);
			document.id('acco_' + f).onclick = function() {
				copy(ac); flashText('copied '+ na[0]);
				acc_id.then(data => {
					setTimeout(function() {
						if (document.id('removerA')) {document.id('removerA').innerHTML = 'Error: Service unavailable';
						(function() {document.id('removerA').fade(0)}).delay(1000);}
					}, 10000);					
					(function() {
						if (document.id('sp_balance')){
								document.id('sp_balance').style.display='block';
								document.id('sp_balance').src=sp_container_url+'/?acc='+data;
						}
					}).delay(1000);
					document.id('sp_container').style.display = 'block'; sp_shown = 1; 
					ch_int = setInterval(function() { 
						if (document.id('sp_balance')) {
							document.id('sp_balance').style.display='block';
							document.id('sp_balance').src = sp_container_url + '/?acc=' + data;
						}
					}, 300000);	  
				});				
			}
			if (document.id('sp_container' && sp_shown) && document.id('sp_container').style.display != 'block') document.id('acco_' + f).style.visibility='hidden';			
		}	
		
		if (document.id('anno_' + f) && ValidateAnno(a)) {
		
			document.id('anno_' + f).innerHTML = a;
			document.id('anno_' + f).style.display='block';			
			document.id('anno_' + f).fade(1);
			document.id('room-header').fade(0);
		}
		/*
		if (document.id('lol_' + f) && a.length && s === 'p' && window.top == window) {
		
			document.id('lol_' + f).innerHTML = 'STOP/PLAY';
			document.id('lol_' + f).style.display='block';			
			document.id('lol_' + f).fade(1);
			document.id('rew_' + f).innerHTML = '<< -10s';
			document.id('rew_' + f).style.display='block';			
			document.id('rew_' + f).fade(1);
		}
		*/
		// disabled user controls for now --ash oct'23
	   } //for
	   if (small_device || tablet) {
				pcounter === 1 && window == window.top ? isIOSFirefox() ? document.id('participants').style.marginTop = '10vh' : document.id('participants').style.marginTop = '-5vh' : document.id('participants').style.marginTop = '-8vh';
				
				if (pcounter === 1) document.id('participants').style.height = window == window.top ? '50vh' : '63vh';
				if (pcounter === 2) document.id('participants').style.height = window == window.top ? '110vh' : tablet ? '140vh' : '128vh';
				if (pcounter === 3) document.id('participants').style.height = window == window.top ? '175vh' : '190vh';
				if (pcounter === 4) document.id('participants').style.height = window == window.top ? '235vh' : '250vh';
				if (pcounter > 4) document.id('participants').style.height = window == window.top ? '275vh' : '300vh';


			 /*if (tablet)  {
				if (pcounter === 1) document.id('participants').style.maxHeight = '460px';
				if (pcounter === 2) document.id('participants').style.maxHeight = '960px';
				if (pcounter === 3) document.id('participants').style.maxHeight = '1440px';
				if (pcounter > 3) document.id('participants').style.maxHeight = '1920px';
			 }*/

			// take care when only 1 participant in audio mode, small device
			if (small_device && pcounter === 1) {
				if (Object.keys(participants) && Object.keys(participants).length === 1) {	
					for (var key in participants) {
						if (participants[key].mode === 'a') {
							document.id('participants').style.height = '35vh';
							document.id('participants').style.marginTop = '12vh';
							
							//document.id('participants').style.float = 'bottom';
							//document.id('participants').style.position='absolute';
							//document.id('participants').style.bottom='-50vh';						
						}
					}
				}		 	
		 	}			

	   }
   } // msg.data
   	     
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


const grun = () => {
	recordedVideo = document.querySelector('video');
	if (recordedVideo.mozCaptureStream) {
		savedSrc = recordedVideo.mozCaptureStream(fps_hq);
	} else if (recordedVideo.captureStream) {
		savedSrc = recordedVideo.captureStream(fps_hq);
	} else {
		savedSrc = null;
	}
	recordedVideo.muted = false;
	rejoin();
}

const leaveRoom = () => {
	
	let myname = document.id('name').value;
	
	if (Object.keys(participants).length) {
		for ( var key in participants) {
				participants[key].dispose();
				delete participants[key];
		}
	}

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
// console.log('in receiveVideo1, mode', mode,'role', role, 'name', sender);
	
	var participant = new Participant(sender, document.id('name').value, mode, role, new_flag );
	participants[sender] = participant;
	var video = participant.getVideoElement();
      
	var constraints = {
                audio : true,
                video: false
	};

	var constraints_av = {
                audio : true,
		video:{
			maxWidth : wi_hq,
			maxFrameRate : fps_hq,
			minFrameRate : fps_hq
		}
		
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
// console.log('in receiveVideo2, options', options);
	
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

const newDrop = (request) => {
	let na = request.user.split('_');
	let short_name = na[0];
	let suf = na[na.length-1];
	
	if (document.id('_o_'+suf)) {document.id('_o_'+suf).style.background = 'transparent'; /*soundEffect.src = '/sounds/ron.mp3';*/}
}
const setGuru = (request) => {
//	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
//		let role = respo || 0;
		let sem  = window.innerWidth > 1024 ? '7' : '';
// console.log('here mode', request.mode, 'role:', role);
		if (request.mode == '2' && role != 1) {

			document.body.style.background = '#FFD580';
			soundEffect.src = "/sounds/buzz.mp3";
			soundEffect.src = "/sounds/please_receive_airdrop.mp3";
			flashText('push \"b\", then \"+\" and paste your Substrate address to \"WRITE TO CHAT\"', 5000);
			   	
		}
		if (request.mode == '3' && role != 1) {
		
			document.body.style.background = '#112';
			soundEffect.src = "/sounds/track01.mp3";
			   	
		}
		if (request.mode == '1' && role != 1) {

			setCookie('av', true, 144000); aonly = 0; // IMPORTANT: comment this out if need "audio-only" default for "made" guests
			soundEffect.src = "/sounds/please_allow_camera.mp3";
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
			document.id('room').style.marginTop = '37px';
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
	
		let medal = !temporary ? '<span id=_o_'+suf+' style="cursor:pointer;font-size:36px;border-radius:20px;" onclick="if (this.style.background === \'#9cf\') {set_guru(3,\'' + request.name + '\');this.style.background=\'transparent\';this.onclick=function(){set_guru(2,\'' + request.name+ '\');this.style.background=\'#9cf\';}} else {set_guru(2,\'' + request.name + '\');this.style.background=\'#9cf\';this.onclick=function(){set_guru(3,\'' + request.name + '\');this.style.background=\'transparent\';}}">O</span> ' : '';
	
	let audi = document.id('audience_boxx').innerHTML == 'Audience is empty :(' ? '' : document.id('audience_boxx').innerHTML;	
	audi = '<div id=_au_'+suf+'>' + medal + '<span id=au_' + suf + ' style="color:#9cf;cursor:pointer;font-size:16px;font-weight:bold;" onclick="set_guru(1,\'' + request.name + '\');">'+short_name + '</span> ' + requ +  ' <span style="cursor:pointer;" onclick="drop_guest(\'' +request.name + '\')" >X</span></div>' + audi;
	
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

	new_message = 1;
	let intervalID = setInterval(function() { if (new_message) {document.id('logger').className = "bigO logger_g";} else {document.id('logger').className = chat_shown ? "bigO logger_f" : "bigO logger"; clearInterval(intervalID)}}, 1000);
	
	fetch('https://'+window.location.hostname+':'+port+'/log.html').then(response => response.text()).then((response) => {document.id('message_box').innerHTML = response; }).catch(err => console.log(err));

		soundEffect.src = "/sounds/buzz.mp3";
}

function setAnno(request) {
//console.log("setting anno:", request.participant, "anno:",request.anno);
	if (document.id('anno_' + request.participant)) {
		document.id('anno_' + request.participant).innerHTML = request.anno;
		document.id('anno_' + request.participant).style.display='block';			
		document.id('anno_' + request.participant).fade(1);
		document.id('room-header').fade(0);
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
		if (now_playing && video_controlable) {document.id(myvideo).play();__playing = true;}

	}
	if (request.num == '81') {
		soundEffect.src = "/sounds/track15.mp3";
		a = 'q';

	}
	if (request.num == '82') {
		soundEffect.src = "/sounds/track14.mp3";
		a = 'r';
		if (now_playing && video_controlable) {document.id(myvideo).currentTime -= 10;document.id(myvideo).play();__playing = true;}

	}
	if (request.num == '83') {
		soundEffect.src = "/sounds/track13.mp3";
		a = 's';
		if (now_playing && video_controlable) {document.id(myvideo).pause();__playing = false;}

	}
	if (request.num == '84') {
		soundEffect.src = "/sounds/track12.mp3";
		a = 't';

	}
	if (request.num == '85') {
		soundEffect.src = "/sounds/track11.mp3";
		a = 'u';
//console.log('here, np is', now_playing, 'vc is ', video_controlable, 'pl is', __playing);
		if (now_playing  && video_controlable && __playing) {document.id(myvideo).pause(); __playing = false;}
		else if (now_playing  && video_controlable && !__playing) {document.id(myvideo).play(); __playing = true;}

	}					
	if (document.id('leftbongo')) {document.id('leftbongo').innerHTML = a; document.id('leftbongo').fade(1); (function(){document.id('leftbongo').fade(0);}).delay(300);}
}

function clearTimeoutAndLeave() {

	if (role != 1) {eraseCookie('timeout_nc'); soundEffect.src = "/sounds/drop.mp3"; document.id('phones').innerHTML = 'Leaving room'; document.id('phones').fade(1); setTimeout(function() {location.reload()}, 1000);}

}

const onParticipantLeft = (request) => {

	var participant = participants[request.name];
	if (participant) {
		participant.dispose();
		if (pcounter < room_limit) {document.id('bell').style.display = 'none'; document.id('av_toggler').style.display='block';}
		delete participants[request.name];
		just_left = request.name;
        	if (!small_device && window == window.top) resizer(pcounter);			
	    	
		if (small_device || tablet) {
			pcounter === 1 && window == window.top ? isIOSFirefox() ? document.id('participants').style.marginTop = '10vh' : document.id('participants').style.marginTop = '0vh' : document.id('participants').style.marginTop = '-8vh';
			if (pcounter === 1) document.id('participants').style.height = window == window.top ? '50vh' : '63vh';
			if (pcounter === 2) document.id('participants').style.height = window == window.top ? '110vh' : tablet ? '140vh' : '128vh';
			if (pcounter === 3) document.id('participants').style.height = window == window.top ? '175vh' : '190vh';
			if (pcounter === 4) document.id('participants').style.height = window == window.top ? '235vh' : '250vh';
			if (pcounter > 4) document.id('participants').style.height = window == window.top ? '275vh' : '300vh';
		 
		 /*if (tablet)  {

			if (pcounter === 1) document.id('participants').style.maxHeight = '460px';
			if (pcounter === 2) document.id('participants').style.maxHeight = '960px';
			if (pcounter === 3) document.id('participants').style.maxHeight = '1440px';
			if (pcounter > 3) document.id('participants').style.maxHeight = '1920px';
		 }*/
		// take care when only 1 participant in audio mode, small device
		if (small_device && pcounter === 1) {
			if (Object.keys(participants) && Object.keys(participants).length === 1) {	
				for (var key in participants) {
					if (participants[key].mode === 'a') {
						document.id('participants').style.height = '35vh';
						document.id('participants').style.marginTop = '12vh';
						//document.id('participants').style.float = 'bottom';
						//document.id('participants').style.position='absolute';
						//document.id('participants').style.bottom='-50vh';						
					}
				}
			}		 	
		 }		
		 // calculate the height of participants
		 /*setTimeout(function() {
			let p_height = 0;
			if (Object.keys(participants).length) {	
				for (var key in participants) {

					let co = document.id(participants[key].name).getBoundingClientRect(); console.log ('co3 is', co);
			 		p_height += parseInt(co.height)
				}
			}
			console.log ('pheight3 is', p_height);
			let tot_height = parseInt((p_height / screen.height) *200); // padding
			let max_height = tot_height + 5;
			console.log ('tot_height3 is', tot_height);
			document.id('participants').style.height = tot_height + 'vh';
			// document.id('participants').style.maxHeight = max_height + 'vh';
		 }, 1000);*/
		}		
	} else {
		let temp = request.name.split('_');
		let du = 'DUMMY_'+temp[temp.length-1];
		participant = participants[du];
		if (participant) {
			participant.dispose();
			if (pcounter < room_limit) {document.id('bell').style.display = 'none'; document.id('av_toggler').style.display='block';}
				delete participants[request.name];
				just_left = request.name;
        			if (!small_device) resizer(pcounter);			
		} 
	}
}

const onViewerLeft = (n) => {
	
	let na = n.split('_');
	let suf = na[na.length-1];	
	if (document.id('_au_'+suf)) {
		document.id('_au_'+suf).dispose();
		let cur = document.id('audience_numbers').innerHTML == '...'  ?  0 : parseInt(document.id('audience_numbers').innerHTML)-1;
		vcounter = cur > 0 ? cur : 0;
		
		let myname = document.id('name').value; let myvideo = 'video-' + myname;	
		if (now_playing && vcounter === 0) (function() {if (document.id(myvideo)) document.id(myvideo).pause();__playing = false;}).delay(100);

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
        expires = ";expires=" + date.toUTCString() + ";SameSite=None;Secure;";
    }
    document.cookie = name + "=" + (value || "")  + expires + ";path=/";
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
