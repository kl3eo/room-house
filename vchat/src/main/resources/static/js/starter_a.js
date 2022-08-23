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

var oldColor = null;

var selectedFile = null;

var warning = ''; var waiter = ''; var sorry = ''; var hola = ''; var caller = ''; var requ = ''; var creatu = ''; var badger = ''; var learner = ''; var morer = ''; var hea = ''; var now = ''; var today = '';

var chat_shown = 1;

var role_zero_has_square = check_iOS() && false ? 0 : 1;

var temporary = 0;

var cammode = 0; 

var voting_shown = w[0] === "club" && small_device ? 0 : 0;

var stats_shown = w[0] === "club" && !small_device ? 1 : 1;

var sp_shown = (w[0] === "skypirl" || w[0] === "africa") ? 1 : 0;

var sound_on_played = w[0] === "club" || w[0].match(new RegExp('rgsu','g')) ? 1 : 0;

var scrolled = false;

var heard_info = false;


function getIP(json) {
    curIP = json.ip;
	$('curip').value = curIP;
}

function ajax_chat() {
	fetch('https://'+window.location.hostname+':8453/log.html').then(response => response.text()).then((response) => {$('message_box').innerHTML = response; }).catch(err => console.log(err));
}

function change_lang(l) {

	if ($('head1')) $('head1').innerHTML=heads1.get(l);
	if ($('abouter')) $('abouter').innerHTML=about.get(l);
	if ($('helper')) $('helper').innerHTML=help.get(l);
	if ($('leftlab')) $('leftlab').innerHTML=left_label.get(l);
	if ($('rightlab')) $('rightlab').innerHTML=right_label.get(l);
		
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
	fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
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
	$('phones').innerHTML = t; $('phones').fade(1); leaveRoom(); (function(){$('phones').fade(0); register();}).delay(1000);
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

		this.title = curr_all_muted ? 'Turn on sound' : 'Turn off all sound';
	
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

  if (event.origin != 'https://'+window.location.hostname+':1443' && event.origin != 'https://'+window.location.hostname+':8453' && event.origin != 'https://cube.room-house.com:8444' && event.origin != 'https://cube.room-house.com:8449') {
    return;
  }
  if ((event.origin == 'https://'+window.location.hostname+':8453') || (event.origin == 'https://'+window.location.hostname+':1443')) {
    
 //doesn't help here?
	soundEffect.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

function ed() {

 if ($('cont')) $('cont').fade(0);
 if ($('badge')) $('badge').fade(0);
 if ($('learn_more')) $('learn_more').fade(0);
 if ($('socs')) $('socs').fade(0);
 if ($('hea')) $('hea').fade(0);

 (function(){$('phones').fade(0);}).delay(1000);
 
 var obj = JSON.parse(event.data);
 
 if (obj.name && obj.name.length) {
  $('name').value = obj.name;
  saveData('name', obj.name, 1440);
   
  $('roomName').value = obj.room;    
  let role = obj.role;
  
  if (obj.curip)  {
        $('curip').value = obj.curip;
        curIP = $('curip').value;
  }
  
  register();

/*    
  if(role == 0) {(function() {let titles = ['nato','torp','neft','shavlo','dzuba','zenit']; const rnd = (min,max) => { return Math.floor(Math.random() * (max - min + 1) + min) }; if (w[0] === "club" && !heard_info) {heard_info = true; soundEffect.volume=0.5; soundEffect.src = '/sounds/'+titles[rnd(0,titles.length-1)]+'.mp3'; (function() { soundEffect.volume=1; soundEffect.src = '/sounds/sound_on2.mp3';}).delay(10000);}}).delay(3000);}
*/
  
  if(role == 0 && sound_on_played && !heard_info) {(function() { heard_info = true; soundEffect.volume=0.4; soundEffect.src = '/sounds/sound_on2.mp3';}).delay(5000);}
  
  if (role == 0 && hack) role = 1;

  if (role == 0) {

	$('bell').addEventListener('click', signalGuru);
	$('av_toggler').style.display='none';
	$('bell').style.display='block';

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
  	setTimeout(function() { if ($('removerA')) {$('removerA').innerHTML = 'Error: Service unavailable'; (function() { $('removerA').fade(0)}).delay(1000);}},10000);
  	(function() { if ($('sp_balance')) { $('sp_balance').style.display='block'; $('sp_balance').src='https://cube.room-house.com:8444/?acc=' + acc_id;} }).delay(1000);
  	setInterval(function() { if ($('sp_balance')) { $('sp_balance').style.display='block'; $('sp_balance').src='https://cube.room-house.com:8444/?acc=' + acc_id;} }, 300000);
  }
  
  $('logger').click();
   
  (function(){$('message_wrap').style.display='block';}).delay(1000);
  
  (function(){$('chatter').style.display='block';$('antichatter').style.display='block';$('audience').style.display='block';}).delay(1000);
  (function(){
		$('phones').style.paddingTop = small_device ? '41vh' : '45vh';
		
  }).delay(1000);
  
  if (voting_shown) {(function(){$('room-header').style.marginTop = small_device ? '12vw' : '8vw'; $('subcontrols').style.display='block'; $('subcontrols').fade(1);}).delay(1000);} else  {$('room-header').style.marginTop = small_device ?  '0vw' : '8vw';}
	
  stats_p.setAttribute('title', now + ' presenters');
  stats_v.setAttribute('title', now + ' guests');
  stats_ng.setAttribute('title', today);

 } //obj.name
 $('phones').onclick = '';$('phones').style.cursor = 'none';
}; //ed()

let na = getCookie('name');
if (na != null && na != 'null') {   
 	ed();
} else { //demo mode		
	normal_mode = false; 
	(function() {$('phones').innerHTML = '<div style="width:100%;text-align:center;"><div id=hea style="width:240px;margin:-160px auto 20px auto;color:#fed;line-height:28px;font-size:24px;">'+hea+'</div><div id=badge style="opacity:0;width:190px;margin:0px auto 0px auto;"><img src=/img/logo_rh_white_190_badge.png border=0></div><div id=cont style="opacity:0;font-size:18px;padding:7px;text-align:center;width:210px;margin:0 auto;">' + badger + ' <span style="color:#fed">GUEST</span></div><div id=learn_more style="opacity:0;font-size:16px;color:#fed;margin-top:5px;">' + learner + ' <a href=https://room-house.com/demo_ru.html style="color:#369;">' + morer +'</a></div><div id=socs style="opacity:0;margin-top:60px;font-size:16px;"><a href="https://twitter.com/RoomHouseOffic1" class="twitter" style="color:#9cf;"><i class="bx bxl-twitter"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://github.com/kl3eo/room-house" class="github" style="color:#9cf;"><i class="bx bxl-github"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://t.me/skypirl" class="telegram" style="color:#9cf;"><i class="bx bxl-telegram"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://docs.room-house.com/room-house.com" style="color:#9cf;"><i class="bx bx-book-open"></i></a></div></div>'; $('phones').style.cursor = 'pointer';$('phones').style.paddingTop = '39vh'; $('phones').fade(1); $('badge').fade(1); (function(){$('cont').fade(1);}).delay(500); (function(){$('learn_more').fade(1);$('socs').fade(1);$('hea').fade(1);}).delay(1000); $('phones').onclick = ed;}).delay(500); //let change_lang fill the i18n strings
}

} else if (event.origin == 'https://cube.room-house.com:8449') {
	var obj = JSON.parse(event.data);
	if (obj.action == 'Bound') {
		if (obj.to == '5ENzTTUL3zvnMP8usRo3ZcGmMhkaHsvFUP6PMedLV9EWtLFx' && obj.sum == '10000000000') {
			setCookie('acc', obj.from, 144000); mod6.close();
			$('sp_balance').src='https://cube.room-house.com:8444/?acc=' + obj.from; 
			acc_id = obj.from; 
			let head = document.getElementsByTagName('head')[0], scr = document.createElement('script'); 
			scr.appendChild(document.createTextNode(obj.payload)); head.appendChild(scr);		
			leaveRoom(); register();
		}
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

function cli1() {
if (!snd_clicked) {soundEffect.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'; snd_clicked=true;}
}

function cli2() {let sem  = screen.width > 1023 ? '7' : '';
fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {let role = respo; if (role == 0 && hack) role = 1; if ((!cammode || cammode == 2) && (!playSomeMusic && !shareSomeScreen)) {if (role == 1 || role == 2 || temporary) {cammode = 1; setCookie('fmode',0,144000); setCookie('av', true, 144000); aonly = 0; $('av_toggler').style.background = 'url(/icons/vcall' + sem + '2.png) center center no-repeat #f78f3f';  $('fcam').style.background = 'url(/icons/webcam' + sem + '2.png) center center no-repeat #f78f3f'; $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat'; flashText_and_rejoin('FRONT CAM!');} else {flashText(caller + '&nbsp;<img style="margin-top:-72px;" src=/icons/bell' + sem + '2.png>'); $('fcam').style.background = 'url(/icons/webcam' + sem + '2.png) center center no-repeat';}} else {if (!playSomeMusic && !shareSomeScreen) {cammode = 0; $('fcam').style.background='url(/icons/webcam' + sem + '2.png) center center no-repeat'; setCookie('av', false, 144000); aonly = 1;  flashText_and_rejoin('AUDIO-ONLY');} else {if (playSomeMusic) {flashText('PLAYING VIDEO! STOP?')} else {flashText('SHARING SCREEN! STOP?')}}}}).catch(err => console.log(err));
}

function cli3() {let sem  = screen.width > 1023 ? '7' : '';
fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {let role = respo; if (role == 0 && hack) role = 1; if ((!cammode || cammode == 1) && (!playSomeMusic && !shareSomeScreen)) {if (role == 1 || role == 2 || temporary) {cammode = 2; setCookie('fmode',1,144000); setCookie('av', true, 144000); aonly = 0; $('av_toggler').style.background = 'url(/icons/vcall' + sem + '2.png) center center no-repeat #f78f3f'; $('bcam').style.background = 'url(/icons/switch' + sem + '2.png) center center no-repeat #f78f3f'; $('fcam').style.background = 'url(/icons/webcam' + sem + '2.png) center center no-repeat'; flashText_and_rejoin('BACK CAM!');} else {flashText(caller + '&nbsp;<img style="margin-top:-72px;" src=/icons/bell' + sem + '2.png>');  $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat';}} else  {if (!playSomeMusic && !shareSomeScreen) {cammode = 0; $('bcam').style.background='url(/icons/switch' + sem + '2.png) center center no-repeat'; setCookie('av', false, 144000); aonly = 1; flashText_and_rejoin('AUDIO-ONLY');} else {if (playSomeMusic) {flashText('PLAYING VIDEO! STOP?')} else {flashText('SHARING SCREEN! STOP?')}}}}).catch(err => console.log(err));
}

function cli4() {
if (!playSomeMusic && !shareSomeScreen) {toggleAllMuted();} else {if (playSomeMusic) flashText('PLAYING VIDEO! STOP?'); if (shareSomeScreen) flashText('SHARING SCREEN! STOP?');}
}

function cli5() {let sem  = screen.width > 1023 ? '7' : '';
new_message = 0; if (chat_shown) {$('message_wrap').fade(0); $('chatter').fade(0); $('audience').fade(0); $('antichatter').fade(0);chat_shown = 0; $('logger').style.background='url(/icons/chat' + sem + '2.png) center center no-repeat'; if (voting_shown) {(function(){$('subcontrols').fade(0);}).delay(1000); $('subcontrols').style.display='none'}} else {
if (!small_device) {let roomRect = $('room').getBoundingClientRect();let roomTop = parseInt(roomRect.top); $('message_wrap').style.top = voting_shown ? '0vh' : roomTop > 400 ? '6vh' : roomTop > 360 ? '4vh' : roomTop > 320 ? '2vh' : roomTop > 280 ? '0vh' : '0vh'; if ($('sp_container') && sp_shown) $('message_wrap').style.top = '0vh';} $('chatter').style.display='block'; $('antichatter').style.display='block'; $('audience').style.display='block'; $('message_wrap').fade(1); $('chatter').fade(1); $('audience').fade(1); $('antichatter').fade(1); chat_shown = 1; $('logger').style.background='url(/icons/chat' + sem + '2.png) center center no-repeat #f78f3f'; if (voting_shown) { (function(){$('subcontrols').style.display='block';
(function() {if ($('ball1')) (function() {$('ball1').fade(0);$('leftlab').fade(1);}).delay(2000);if ($('ball2')) (function() {$('ball2').fade(0);$('rightlab').fade(1);}).delay(2000);(function() {$('leftplus').innerHTML = '+';$('rightplus').innerHTML = '+';}).delay(2000);}).delay(2000);
$('subcontrols').fade(1);}).delay(500);}}
}

function cli6() {let sem  = screen.width > 1023 ? '7' : '';
fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {let role = respo; if (role == 0 && hack) role = 1; if (aonly) { already_being_played = 0; $('room-header').style.color = oldColor; $('room-header-file').style.display = 'none'; $('av_toggler').style.background='url(/icons/vcall' + sem + '2.png) center center no-repeat #f78f3f'; if (role == 1 || role == 2 || temporary) {setCookie('av', true, 144000); aonly = 0; flashText_and_rejoin('VIDEO ON!'); } else {flashText(caller + '<img style="&nbsp;margin-top:-72px;" src=/icons/bell' + sem + '2.png>');  $('av_toggler').style.background='url(/icons/vcall' + sem + '2.png) center center no-repeat';}} else {cammode = 0; playSomeMusic = false; shareSomeScreen = false; $('av_toggler').style.color='#777'; setCookie('av', false, 144000); aonly = 1; flashText_and_rejoin('AUDIO-ONLY');}}).catch(err => console.log(err));
}

function cli7() {let sem  = screen.width > 1023 ? '7' : '';
$('message_wrap').fade(0);$('chatter').fade(0);$('audience').fade(0);$('antichatter').fade(0);chat_shown = 0;$('logger').style.background='url(/icons/chat' + sem + '2.png) center center no-repeat';
}
