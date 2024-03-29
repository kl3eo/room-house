/*
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

var curIP = '';

var aonly = 1;

var mod1; var mod2; var mod5;

var altlang = ['en','ru','es','fr','cn','pt'];

var cam1 = getCookie('d1');
var cam2 = getCookie('d2');
var scanned = getCookie('s1');

const soundEffect = new Audio();
soundEffect.autoplay = true;

var snd_clicked = false;
var dummies = false;

var oldColor = null;

var selectedFile = null;

var warning = ''; var waiter = ''; var sorry = ''; var hola = ''; var caller = ''; var requ = ''; var creatu = ''; var badger = ''; var learner = ''; var morer = ''; var hea = ''; var now = ''; var today = ''; var roo = ''; var buy = ''; var helpcapo = '';

var chat_shown = 1;

var temporary = 0;

var cammode = 0; 

var stats_shown = 1;

var sp_shown = (window == window.top && (w[0].match(new RegExp('skypirl','g')) || w[0].match(new RegExp('club','g')) || w[0].match(new RegExp('milan','g')) )) ? 1 : 1;

var voting_shown = w[0] === "club" && small_device && !sp_shown ? 0 : 0;

var sound_on_played = w[0] === "club" || w[0].match(new RegExp('rgsu','g')) ? 1 : 0;

var scrolled = false;

var heard_info = getCookie('heard_info') || false;

var who_to = '';

var afterBinding = false;


function getIP(json) {
    curIP = json.ip;
	$('curip').value = curIP;
}

function ajax_chat() {
	fetch('https://'+window.location.hostname+':'+port+'/log.html').then(response => response.text()).then((response) => {$('message_box').innerHTML = response; }).catch(err => console.log(err));
}

function change_lang(l) {

	if ($('head1')) $('head1').innerHTML=heads1.get(l);
	if ($('abouter')) $('abouter').innerHTML=about.get(l);
	if ($('helper')) $('helper').innerHTML=help.get(l);
	if ($('leftlab')) $('leftlab').innerHTML=left_label.get(l);
	if ($('rightlab')) $('rightlab').innerHTML=right_label.get(l);
	if ($('dummy_p')) $('dummy_p').innerHTML=du_.get(l);
	if ($('dummy2_p')) $('dummy2_p').innerHTML=du2_.get(l);
		
	warning = warner.get(l);
	waiter = waiter_.get(l);
	sorry = sorry_.get(l);

	caller = caller_.get(l);
	requ = requ_.get(l);
	creatu = creatu_.get(l);
	badger = badger_.get(l);
	learner = learner_.get(l);
	morer = morer_.get(l);
	hea = hea_.get(l);
	now = now_.get(l);
	today = today_.get(l);
	//helpcapo = he_.get(l);
	roo = roo_.get(l); roo = roo.match(new RegExp('room-house','g')) ? '' : roo;// hack --ash
	//buy = buy_.get(l);	
		
	if (typeof(mod1) != 'undefined' && mod1 !== null) mod1.content.innerHTML = about_content.get(l);
	if (typeof(mod2) != 'undefined' && mod2 !== null) mod2.content.innerHTML = help_content.get(l);

	if (typeof(mod3) != 'undefined' && mod3 !== null) mod3.content.innerHTML = left_content.get(l);
	if (typeof(mod4) != 'undefined' && mod4 !== null) mod4.content.innerHTML = right_content.get(l);
}

function checkWebRTC() {

        var isWebRTCSupported = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia ||
        window.RTCPeerConnection;

        if (window.navigator.userAgent.indexOf("Edge") > -1 || !isWebRTCSupported) {
            alert('Please use a different browser with WebRTC support!');
	    console.log('Bad WebRTC non-compatible bro');
	    return false;
	    
        }
		
	try {
		const pc = new RTCPeerConnection();
		const transceiver = pc.addTransceiver('audio');
		
	} catch (e) {
		console.log(e);
		alert('Please use a newer browser with full WebRTC support!');
	}
}

function toggleHeader(i) {
	fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
		let role = respo; if (role == 2) role = 1;
		if (i == 1 && role == 1 && aonly)  {
			$('room-header').style.color = $('room-header').style.color == 'rgb(153, 204, 255)' ? oldColor : '#9cf';
			$('room-header-file').style.display = $('room-header-file').style.display == 'block' ? 'none' : 'block';
			playSomeMusic = playSomeMusic == true ? false : true;
		}
		if (i == 2 && role == 1 && aonly)  {
			$('room-header-file').style.display='none';
			$('room-header').style.color = $('room-header').style.color == 'rgb(153, 255, 204)' ? oldColor : '#9fc';
			shareSomeScreen = shareSomeScreen == true ? false : true;
		}
	}).catch(err => console.log(err));				
}

function getFile() {

	let fi = $('room-header-file').files[0];
	if (selectedFile) URL.revokeObjectURL(selectedFile);
	selectedFile = URL.createObjectURL(fi);
}

function clearAllCookies() {

    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var coo_name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
	while (coo_name.charAt(0)==' ') coo_name = coo_name.substring(1,coo_name.length);

        document.cookie = coo_name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=None;Secure;";
    }
    
    if (typeof(Storage) != 'undefined') localStorage.clear();
}

function flashText(t) {
	$('phones').innerHTML = t; $('phones').fade(1); (function(){$('phones').fade(0);}).delay(1000);
}

function flashText_and_rejoin(t) {
	//SDP_END_POINT_ALREADY_NEGOTIATED does not allow to change media as in showMeAsParticipant() -- so in present we leave room and register again
	$('room-header').style.display = 'none';$ ('room-header').fade(0); $('phones').innerHTML = t; $('phones').fade(1); if (i_am_viewer || true) {leaveRoom(); register();} else {/*showMeAsParticipant();*/}
	(function(){$('phones').fade(0);}).delay(1000); 
}

function resizer(pctr) {

	if (pctr == 4) {
		$('room').style.minWidth = '960px';
		$('room').style.marginLeft = '-200px';
	} else if (pctr == 3) {
		$('room').style.minWidth = '960px';
		$('room').style.marginLeft = '-200px';
	} else if (pctr == 2) {
		$('room').style.minWidth = '960px';
		$('room').style.marginLeft = '-200px';
	} else if (pctr == 1) {
		$('room').style.minWidth = '480px';
		$('room').style.marginLeft = '0px';
	} else if (pctr == 5) {
		$('room').style.minWidth = '1260px';
		$('room').style.marginLeft = '-320px';
	} else if (pctr > 5) {
		$('room').style.minWidth = '1560px';
		$('room').style.marginLeft = '-440px';
	}
}

function toggleAllMuted() {

	if (check_iOS()) {
		setCookie('all_muted', true, 1440);
		flashText_and_rejoin('UNMUTE ONE BY ONE');

	} else {
		let curr_all_muted = getCookie('all_muted') || false;
		let n = curr_all_muted ? false : true;
		let t = curr_all_muted ? 'UNMUTED' : 'MUTED ALL';
		setCookie('all_muted', n, 1440);
		
		if (n === false) {saveData($('name').value+'_muted', false, 1440); i_am_muted = false;} //?! need this for brute force, unmute mic by toggle_mute 

		this.title = curr_all_muted ? 'Turn on sound' : 'Turn off all sound';
		
		//remove all to reset them in Participant
		if (Object.keys(participants).length) {	
			for (var key in participants) {
		   	 if (participants[key].name != $('name').value) {
				let n = participants[key].name + '_muted';
			
				if (typeof(Storage) != 'undefined') {
					localStorage.removeItem(n);

				} else {
					document.cookie = n + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=None;Secure;";
				}
		   	 }
			}
		}

		flashText_and_rejoin(t);
	}
}

window.addEventListener("message", function(event) {

//console.log('eo:', event.origin, 'hn:', window.location.hostname);

  if (event.origin != 'https://'+window.location.hostname+':1443' && event.origin != 'https://'+window.location.hostname+':'+port+'' && event.origin != sp_container_url && event.origin != sp_setter_url) {
    return;
  }
  if ((event.origin == 'https://'+window.location.hostname+':'+port+'') || (event.origin == 'https://'+window.location.hostname+':1443')) {
    
 //doesn't help here?
	soundEffect.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

const ed = () => { //code to run on receive message from join_ frame

 if ($('cont')) $('cont').fade(0);
 if ($('badge')) $('badge').fade(0);
 if ($('learn_more')) $('learn_more').fade(0);
 if ($('socs')) $('socs').fade(0);
 if ($('hea')) $('hea').fade(0);
 if ($('bstats')) $('bstats').fade(0);

 (function(){$('phones').fade(0);}).delay(500);
 //$('phones').fade(0);
 
 var obj = JSON.parse(event.data);
 
 if (obj.name && obj.name.length) {
  $('name').value = obj.name;
  saveData('name', obj.name, 1440);
   
  $('roomName').value = obj.room;
  //let mes={id : 'checkRoom', room : obj.room}; sendMessage(mes);   
  //let role = obj.role;
  role = obj.role;
  
  //because checker.pl returns empty when no credentials set in http_only coo
  if (role.length != 0) {if (role == 0) i_am_dummy_guest = true;}
  else {role = 0;};//this is a guest, too, but not dummy
  
  if (obj.curip)  {
        $('curip').value = obj.curip;
        curIP = $('curip').value;
	//console.log('curIP', curIP);
  }
  
  //dummy_guest set, check it when you register!
  register();

/*
  if(role == 0 && small_device) {(function() {let titles = ['nato','torp','neft','shavlo','dzuba','zenit','tska']; const rnd = (min,max) => { return Math.floor(Math.random() * (max - min + 1) + min) }; if (w[0] === "club" && !heard_info) {heard_info = true; setCookie('heard_info', true, 144000); if (sound_on_played && false) {soundEffect.volume=0.5; soundEffect.src = '/sounds/'+titles[rnd(0,titles.length-1)]+'.mp3';} if (!heard_info) (function() { if (sound_on_played) {soundEffect.volume=0.4; soundEffect.src = '/sounds/sound_on2.mp3';}}).delay(10000);}}).delay(3000);}
*/
/*
  if(role == 0 && !heard_info && !small_device) {(function() { heard_info = true; setCookie('heard_info', true, 144000); if (sound_on_played) {soundEffect.volume=0.4; soundEffect.src = '/sounds/sound_on2.mp3';}}).delay(5000);}
*/

  if (role == 0 && hack) role = 1;

  if (role == 0) {

	$('bell').addEventListener('click', signalGuru);

	window.addEvent('domready', function() {
	mod3 = new mBox.Modal({
		content: left_content.get(altlang[ctr]),
		setStyles: {content: {padding: '25px', lineHeight: 24, margin: '0 auto', fontSize: 18, color: '#222'}},
		width:240,
		title: 'Ok!',
		attach: 'leftpluss'
	});

	mod4 = new mBox.Modal({
		content: right_content.get(altlang[ctr]),
		setStyles: {content: {padding: '25px', lineHeight: 24, margin: '0 auto', fontSize: 18, color: '#222'}},
		width:240,
		title: 'Ok!',
		attach: 'rightpluss'
	});
	
	});  
  } else {

	if (role == 1) {
		$('logger').addEventListener('dblclick', function(e) {
			e.preventDefault();
e.stopPropagation();
			var yon = window.confirm('Make everyone leave?');
			if (yon) {let tok = getCookie('authtoken') || ''; let mes={id : 'makeLeave', name : 'all', token : tok}; sendMessage(mes);}
		});
	}
  }
  
  $('room-header').addEventListener('click', function(e) {e.preventDefault();e.stopPropagation(); toggleHeader(1);});
  $('room-header').addEventListener('dblclick', function(e) {e.preventDefault();e.stopPropagation(); toggleHeader(2);});

  if (role != -1) {
  	acc_id.then(data => {
  	   setTimeout(function() { if ($('removerA')) {$('removerA').innerHTML = 'Error: Service unavailable'; (function() { $('removerA').fade(0)}).delay(1000);}},10000);
  	   (function() { if ($('sp_balance')) { $('sp_balance').style.display='block'; $('sp_balance').src = sp_container_url + '/?acc=' + data;} }).delay(1000);
  	   setInterval(function() { if ($('sp_balance')) { $('sp_balance').style.display='block'; $('sp_balance').src = sp_container_url + '/?acc=' + data;} }, 300000);
	});
  }
  
  $('logger').click();
   
  (function(){$('message_wrap').style.display='block';}).delay(1000);
  
  (function(){$('chatter').style.display='block';$('antichatter').style.display='block';$('audience').style.display='block';}).delay(1000);
  (function(){
		$('phones').style.paddingTop = small_device ? '41vh' : '45vh';
		
  }).delay(1000);
  
  if (voting_shown || sp_shown) {(function(){$('room-header').style.marginTop = small_device ? '14vw' : '8vw'; $('room-backer').style.marginTop = small_device ? '14vw' : '8vw'; 
  $('room-header').style.marginBottom = small_device ? '0px' : '20px'; $('room-backer').style.marginBottom = small_device ? '20px' : '40px'; 
  if (voting_shown) {$('subcontrols').style.display='block'; $('subcontrols').fade(1);}}).delay(1000);} else  {$('room-header').style.marginTop = small_device ?  '0vw' : '8vw';}
	
  stats_p.setAttribute('title', now + ' presenters');
  stats_v.setAttribute('title', now + ' guests');
  stats_ng.setAttribute('title', today);

 } //obj.name
 $('phones').onclick = '';$('phones').style.cursor = 'none';
}; //ed()

let na = getCookie('name');if (na != null && na != 'null') {   
 	if ( $('dummy2_p')) $('dummy_p').style.display = 'block'; if ( $('dummy2_p') && !small_device) $('dummy2_p').style.display = 'block'; if ($('loading_span')) $('loading_span').fade(0);
	ed();

} else { //demo mode		
	normal_mode = false; let mgn = small_device ? 135 : 90; sp_shown = 0;
	setCookie('new_cache', true, 14400);
	
	let mes={id : 'checkRoom', room : w[0], tok : ''}; sendMessage(mes);
	if ( $('dummy2_p')) $('dummy_p').style.display = 'block'; if ( $('dummy2_p') && !small_device) $('dummy2_p').style.display = 'block'; if ($('loading_span')) $('loading_span').fade(0);
	(function() {$('phones').innerHTML = '<div style="width:100%;text-align:center;"><div id=hea style="width:240px;margin:-'+mgn+'px auto 20px auto;color:#fed;line-height:28px;font-size:24px;">ROOM <span style="color:#369;">'+w[0]+'</span></div><div id="bstats" style="width:160px;margin:0 auto;opacity:0;"><div style="float:left; font-size:24px; color:#fed;"><span>&#128100;</span>&nbsp;:&nbsp;<span id="bnump">'+nump+'</span></div><div style="float:right;font-size:24px;color:#fed;"><span id="bnumv" style="color:#369;">'+numv+'</span>&nbsp;:&nbsp;<span>&#128101;</span></div><div style="clear:both;"></div></div><div id=badge style="opacity:0;width:190px;margin:0px auto 0px auto;"><img src=/img/logo_rh_white_190_badge.png border=0></div><div id=cont style="opacity:0;font-size:18px;padding:7px;text-align:center;width:210px;margin:0 auto;">' + badger + ' <span style="color:#fed">GUEST</span></div><div id=learn_more style="opacity:0;font-size:16px;color:#fed;margin-top:5px;">' + learner + ' <a href=https://room-house.com/button_ru.html style="color:#369;">' + morer +'</a></div><div id="socs" style="opacity:0;margin-top:60px;font-size:20px;margin-right:-2px;"><!-- a href="https://twitter.com/RoomHouseOffic1" class="twitter" style="color:#9cf;margin:0 5px;"><i class="bx bxl-twitter"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/kl3eo/room-house" class="github" style="color:#9cf;margin:0 5px;"><i class="bx bxl-github"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://t.me/skypirl" class="telegram" style="color:#9cf;margin:0 5px;"><i class="bx bxl-telegram"></i></a>< &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://docs.room-house.com/room-house.com" style="color:#9cf;margin:0 5px;"><i class="bx bx-book-open"></i></a --></div></div>'; $('phones').style.cursor = 'pointer';$('phones').style.paddingTop = '39vh'; $('phones').fade(1); $('badge').fade(1); (function(){$('cont').fade(1);}).delay(500); (function(){$('learn_more').fade(1);$('socs').fade(1);$('hea').fade(1); }).delay(700); $('phones').onclick = ed; if ($('loading_span')) $('loading_span').style.display='none';}).delay(1000) //let change_lang fill the i18n strings
}

} else if (event.origin == sp_setter_url) {
	var obj = JSON.parse(event.data);
	if (obj.action == 'Bound') {
		//if (obj.to == '5ENzTTUL3zvnMP8usRo3ZcGmMhkaHsvFUP6PMedLV9EWtLFx' && obj.sum == '10000000000') {
			//setCookie('acc', obj.from, 144000); 
			//acc_id = obj.from;
			mod6.close();
			$('sp_balance').src = sp_container_url + '/?acc=' + obj.from; 
			afterBinding = true;
			$('phones').innerHTML = '..PLEASE RE-ENTER..'; $('phones').fade(1); (function(){location.reload();}).delay(500);
			//rejoin();//?!			
		   	//(function() {flashText('CLICK ON VIDEO TO RELOAD');}).delay(1000);
		   
			//let head = document.getElementsByTagName('head')[0], scr = document.createElement('script'); 
			//scr.appendChild(document.createTextNode(obj.payload)); head.appendChild(scr);
		//}
	} else {
		console.log('Undefined action received from wallet!');
	}
	
} else {

  var obj = JSON.parse(event.data);

  if (obj.action == 'saveCookie') {
	
	doSwitchOneMode($('newacc'));

  } else if (obj.action == 'openWallet') {
  
  	window.open('https://wallet.room-house.com', '_blank');

  } else if (obj.action == 'load') {
  
	if ($('removerA')) $('removerA').remove();
	if ($('sp_container') && sp_shown) 

	{
		//moving down, then a bit up, like an animation
		//if (!small_device) $('controls').style.marginTop='0px';
		var morphStart = function(){
            		this.start({
               			'marginTop': -24,
            		});
		}
         
         	window.addEvent('domready', function() {
            		var morphElement = $('controls');
            		var morphObject = new Fx.Morph(morphElement, {
               			fps: 15
            		});
            
            		$('slidein').addEvent('click', morphStart.bind(morphObject));
         	});
				
		$('sp_container').style.display = 'block';
		$('slidein').click();
	}
	
	if ($('demo_info')) $('demo_info').style.display = 'block';
	 
  } else if (obj.action == 'err') {
  	if ($('removerA')) $('removerA').remove();
	
	(function() { if ($('sp_container') && sp_shown) $('sp_container').style.display = 'none'; $('poll_container').style.display = 'none';}).delay(1000);
  } else if (obj.action == 'success') {
  
	if ($('removerB')) $('removerB').remove();
  	if ( $('sp_container') && sp_shown && $('sp_container').style.display == 'block' ) {
		const sp_circles = document.querySelectorAll('.accos');
		sp_circles.forEach(circle => {
 
			circle.style.visibility = 'visible';
		});
	}
	
  }
}  
  return false;
});

window.addEvent('domready', function() {

	mod1 = new mBox.Modal({
		content: about_content.get(altlang[ctr]),
		setStyles: {content: {padding: '25px', lineHeight: 28, margin: '0 auto', fontSize: 24}},
		width:300,
		title: 'About R-H',
		attach: 'abouter'
	});
	
	mod2 = new mBox.Modal({
		content: help_content.get(altlang[ctr]),
		setStyles: {content: {padding: '25px', lineHeight: 28, margin: '0 auto', fontSize: 24}},
		width:300,
		title: 'Help',
		attach: 'helper'
	});

	mod5 = new mBox.Modal({
		content: central_content.get(altlang[ctr]),
		setStyles: {content: {padding: '25px', lineHeight: 24, margin: '0 auto', fontSize: 18, color: '#222'}},
		width:210,
		title: 'Ok!',
		attach: 'chatter'
	});

	mod7 = new mBox.Modal({
		content: anno_adder_content.get(altlang[ctr]),
		setStyles: {content: {padding: '25px', lineHeight: 24, margin: '0 auto', fontSize: 18, color: '#222'}},
		width:210,
		title: 'Set Annotation',
		attach: 'anno_adder'
	});
						
	(function(){$('wrapper').fade(1);}).delay(200);
	(function(){$('preroom').fade(1);}).delay(100);
	
	oldColor = $('room-header').style.color;
	
	setInterval(function() { if ($('message_box') && $('message_wrap') && $('message_wrap').style.display == 'block' && chat_shown ) {ajax_chat()} }, 3000);

});


const cli1 = () => {
if ( $('dummy_p') && dummies) $('dummy_p').style.display='none';
if ( $('dummy2_p') && dummies) $('dummy2_p').style.display='none';
if (!snd_clicked) {soundEffect.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'; snd_clicked=true;}
}

const cli2 = () => {let sem  = window.innerWidth > 1024 ? '7' : '';
fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {let role = respo; if (pcounter < room_limit) hack = true; if (role == 0 && hack) role = 1; if ((!cammode || cammode == 2) && (!playSomeMusic && !shareSomeScreen)) {if (role == 1 || role == 2 || temporary) {cammode = 1; setCookie('fmode',0,144000); setCookie('av', true, 144000); aonly = 0; $('av_toggler').style.background = 'url(/icons/vcall' + sem + '2.png) center center no-repeat #f78f3f';  $('fcam').style.background = 'url(/icons/webcam' + sem + '2.png) center center no-repeat #f78f3f'; $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat'; flashText_and_rejoin('FRONT CAM!');} else {flashText(caller + '&nbsp;<img style="margin-top:-72px;" src=/icons/bell' + sem + '2.png>'); $('fcam').style.background = 'url(/icons/webcam' + sem + '2.png) center center no-repeat';}} else {if (!playSomeMusic && !shareSomeScreen) {cammode = 0; $('fcam').style.background='url(/icons/webcam' + sem + '2.png) center center no-repeat'; setCookie('av', false, 144000); aonly = 1;  flashText_and_rejoin('AUDIO-ONLY');} else {if (playSomeMusic) {flashText('PLAYING VIDEO! STOP?')} else {flashText('SHARING SCREEN! STOP?')}}}}).catch(err => console.log(err));
}

const cli3 = () => {let sem  = window.innerWidth > 1024 ? '7' : '';
fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {let role = respo;  if (pcounter < room_limit || (pcounter == room_limit && !i_am_viewer)) hack = true; if (role == 0 && hack) role = 1; if ((!cammode || cammode == 1) && (!playSomeMusic && !shareSomeScreen)) {if (role == 1 || role == 2 || temporary) {cammode = 2; setCookie('fmode',1,144000); setCookie('av', true, 144000); aonly = 0; $('av_toggler').style.background = 'url(/icons/vcall' + sem + '2.png) center center no-repeat #f78f3f'; $('bcam').style.background = 'url(/icons/switch' + sem + '2.png) center center no-repeat #f78f3f'; $('fcam').style.background = 'url(/icons/webcam' + sem + '2.png) center center no-repeat'; flashText_and_rejoin('BACK CAM!');} else {flashText(caller + '&nbsp;<img style="margin-top:-72px;" src=/icons/bell' + sem + '2.png>');  $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat';}} else  {if (!playSomeMusic && !shareSomeScreen) {cammode = 0; $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat'; setCookie('av', false, 144000); aonly = 1; flashText_and_rejoin('AUDIO-ONLY');} else {if (playSomeMusic) {flashText('PLAYING VIDEO! STOP?')} else {flashText('SHARING SCREEN! STOP?')}}}}).catch(err => console.log(err));
}

const cli4 = () => {
if (!playSomeMusic && !shareSomeScreen) {toggleAllMuted();} else {if (playSomeMusic) flashText('PLAYING VIDEO! STOP?'); if (shareSomeScreen) flashText('SHARING SCREEN! STOP?');}
}

const cli5 = () => {let sem  = window.innerWidth > 1024 ? '7' : ''; $('message_box').style.display = 'block'; $('audience_box').style.display = 'none';
new_message = 0; if (chat_shown) {$('message_wrap').fade(0); $('chatter').fade(0); $('audience').fade(0); $('antichatter').fade(0);chat_shown = 0; $('logger').style.background='url(/icons/chat' + sem + '2.png) center center no-repeat';} else {
if (!small_device) {let roomRect = $('room').getBoundingClientRect();let roomTop = parseInt(roomRect.top); $('message_wrap').style.top = voting_shown ? '0vh' : roomTop > 400 ? '6vh' : roomTop > 360 ? '4vh' : roomTop > 320 ? '2vh' : roomTop > 280 ? '0vh' : '0vh'; if ($('sp_container') && sp_shown) $('message_wrap').style.top = '0vh';} $('chatter').style.display='block'; $('antichatter').style.display='block'; $('audience').style.display='block'; $('message_wrap').fade(1); $('chatter').fade(1); $('audience').fade(1); $('antichatter').fade(1); chat_shown = 1; $('logger').style.background='url(/icons/chat' + sem + '2.png) center center no-repeat #f78f3f'; if (voting_shown) { (function(){$('subcontrols').style.display='block';
(function() {if ($('ball1')) (function() {$('ball1').fade(0);$('leftlab').fade(1);}).delay(2000);if ($('ball2')) (function() {$('ball2').fade(0);$('rightlab').fade(1);}).delay(2000);(function() {$('leftplus').innerHTML = '+';$('rightplus').innerHTML = '+';}).delay(2000);}).delay(2000);
$('subcontrols').fade(1);}).delay(500);}}
}

const cli6 = () => {let sem  = window.innerWidth > 1024 ? '7' : '';
fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {let role = respo; if (pcounter < room_limit) hack = true; if (role == 0 && hack) role = 1; if (aonly) { already_being_played = 0; $('room-header').style.color = oldColor; $('room-header-file').style.display = 'none'; $('av_toggler').style.background='url(/icons/vcall' + sem + '2.png) center center no-repeat #f78f3f'; if (role == 1 || role == 2 || temporary) {setCookie('av', true, 144000); aonly = 0; flashText_and_rejoin('VIDEO ON!'); } else {flashText(caller + '<img style="&nbsp;margin-top:-72px;" src=/icons/bell' + sem + '2.png>');  $('av_toggler').style.background='url(/icons/vcall' + sem + '2.png) center center no-repeat';}} else {cammode = 0; playSomeMusic = false; shareSomeScreen = false; $('av_toggler').style.color='#777'; setCookie('av', false, 144000); aonly = 1; flashText_and_rejoin('AUDIO-ONLY');}}).catch(err => console.log(err));
}

const cli7 = () => {let sem  = window.innerWidth > 1024 ? '7' : '';
$('message_wrap').fade(0);$('chatter').fade(0);$('audience').fade(0);$('antichatter').fade(0);chat_shown = 0;$('logger').style.background='url(/icons/chat' + sem + '2.png) center center no-repeat';
}

const cli8 = () => {
fetch('https://'+window.location.hostname+':'+port+'/cgi/genc/get_guests.pl?room='+w[0], {credentials: 'include'}).then(function(response){if (response.status !== 200){console.log('Status Code: ' + response.status); return;} response.json().then(function(data) { if (data != 0) { let audi = ''; const array = Object.keys(data).map(key => data[key]); array.forEach(item => { let s = item[0].split('_'); let short = s[0]; let d= item[3].split(' '); let ti = d[1].split(':'); let tim = ti[0]+':'+ti[1]; audi = audi + '<div><span>' + short + '</span>,&nbsp;<span>' + item[1] + '</span>,&nbsp;<span>' + item[2] + '</span>&nbsp;<span>' + tim + '</span></div>';}); audi = audi + '<div style="line-height:60px;">&nbsp;</div>'; $('logger').click(); chat_shown = 0; $('message_box').innerHTML = audi; $('message_box').fade(1);
}})}).catch(err => console.log(err));
}
