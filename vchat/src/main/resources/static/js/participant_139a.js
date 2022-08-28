var fullscreen = false;

var doSwitchOneMode = function(el) {if (false) console.log(el); let sp_setter = '<iframe id="sp_setter" name="sp_setter" src="https://cube.room-house.com:8449/#/binder/" scrolling="yes" style="border:0;min-height:450px;background:transparent;text-align:center;margin:-20px auto 0 -20px; width:320px;"></iframe>'; let h = small_device ? '66vh' : 420; mod6 = new mBox.Modal({content: sp_setter,setStyles: {content: {padding: '25px', lineHeight: 24, margin: '0 auto', fontSize: 18, color: '#222', height: h}}, width:280, id:'m6', height: h, title: 'SkyPirl account', attach: 'newacc'});
$('newacc').click();};

const PARTICIPANT_MAIN_CLASS = check_iOS() || isAndroid ? 'participant main_i' : 'participant main';
const PARTICIPANT_CLASS = 'participant';
const PARTICIPANT_SOLO = 'participant solo'

function Participant(name, myname, mode, myrole, new_flag) {
	
	this.name = name;
	this.mode = mode;
	
	let this_is_guru = false;
	let i_am_guru = false;	

	var gi = new RegExp('GURU:','g');
	if (name.match(gi)) {guru_is_here = 1; this_is_guru = true;}
	if (myname.match(gi)) i_am_guru = true;
	
	let ct = 0;
	for ( var key in participants) {
		if (key.match(gi)) ct++;
	}
	if (ct > 0) guru_is_here = 1;
		
	if ( $(name) ) {var old_container = $(name); old_container.parentNode.removeChild(old_container);}
	
	var from_changing_slider = false;

	var all_muted = getCookie('all_muted');
	if (all_muted === null || all_muted === 'null') all_muted = false;
 	
	var coo_muted = loadData(name+'_muted');
	
	//no sound from other guests on default, but from gurus ok
	//if (coo_muted === null || coo_muted === 'null') coo_muted = i_am_guru ? all_muted : this_is_guru ? all_muted: true;
	//or all allowed
	//if (coo_muted === null || coo_muted === 'null') coo_muted = all_muted;
	//or only guru can hear others
	if (coo_muted === null || coo_muted === 'null') coo_muted = i_am_guru ? all_muted : true;
				
	var coo_volume = loadData(name+'_volume');

	if (coo_volume === null || coo_volume === 'null') coo_volume = 0.5;

	if (name != myname) {
		saveData(name+'_muted', coo_muted, 1440);
		saveData(name+'_volume', coo_volume, 1440);
	}

	//if (this_is_guru && mode === 'a') coo_muted = false; //let gurus be heard if they are audio-only
	
	var i_am_muted = loadData(myname+'_muted');
	let am = getCookie('all_muted');
	if (i_am_muted === null || i_am_muted === 'null') i_am_muted = (am === true || am === 'true') ? true  : false;
	
	if (name == myname) saveData(myname+'_muted', i_am_muted, 1440);

	var container = document.createElement('div');
	container.className = isPresentMainParticipant() ? PARTICIPANT_CLASS : PARTICIPANT_MAIN_CLASS;
	
	i_am_guest = isPresentMainParticipant() & pcounter === 1 ? 1 : i_am_guest;

	if ( myrole != 1) i_am_guest = 1 ;
	if ( myrole == 1 & pcounter === 0 & guru_is_here ) i_am_guest = 0 ;
	
	(function(){ $('phones').fade(0); (function(){ $('phones').innerHTML = '';}).delay(100);}).delay(500);
	
	if (typeof(mod3) != 'undefined' && mod3 !== null) mod3.content.innerHTML = left_content.get(altlang[ctr]);
	if (typeof(mod4) != 'undefined' && mod4 !== null) mod4.content.innerHTML = right_content.get(altlang[ctr]);
	
	pcounter++; if (name != myname || myrole != 0) real_pcnt++;
	if (pcounter > 1) switchContainerClass();

	(function() {container.className = pcounter === 1 && !role_zero_has_square && !small_device ? PARTICIPANT_SOLO : container.className;}).delay(2000);
	
	//if ($('pcounter')) $('pcounter').innerHTML = real_pcnt;
	if ($('pcounter')) { if (!real_pcnt) {(function(){$('pcounter').innerHTML = real_pcnt;}).delay(1000);} else {$('pcounter').innerHTML = real_pcnt;} }
	
	container.id = name;
	container.style.position='relative';
	var span = document.createElement('span');
	var speaker = document.createElement('div');
	var slider = document.createElement('input');	
	var video = document.createElement('video');
	var loco = document.createElement('div');
	var onemode = document.createElement('div');
	var dropper = document.createElement('div');
	var rtcPeer;

	$('participants').appendChild(container);

	container.appendChild(video);
	container.appendChild(span);
	container.appendChild(speaker);
	container.onclick = switchContainerClass;
	container.ondblclick = rmPtcp;

	var ar = name.split("_");
	var rname = ar.slice(0, ar.length - 1).join("_");
	
	let rrname = rname.length > 11 ? rname.substr(0,11) + '..' : rname;

	span.appendChild(document.createTextNode(rrname));
	span.style.zIndex = '1002';
	span.style.cursor = 'pointer';
	
	span.onclick = back_to_audience;

	speaker.addEventListener('click', function(e) {e.preventDefault(); e.stopPropagation(); if (name != myname) toggleSlider(); else toggleMute();});
	slider.addEventListener('change', function(e) {e.preventDefault(); e.stopPropagation(); changeVolume();});
	
	if (name != myname) video.addEventListener('click', function(e) {e.preventDefault(); e.stopPropagation(); let p = participants[name]; let g = p.getMode(); if (g != 'c') {if (check_iOS() || isAndroid) {toggleBigScreen(e.target)} else { toggleFullScreen(e.target)}} else {switchOneMode(e.target)}});	
	
	onemode.onclick = setCinema;
	dropper.onclick = rmPtcp;

	speaker.className = 'speak';
	
	let onemode_color = mode == 'c' ? '#ff0' : '#369';
	onemode.style.fontWeight = mode == 'c' ? 'bold' : 'normal';
	let onemode_label = mode == 'c' ? 'CINEMA!' : 'CINEMA?';
	
	onemode.className = 'onemode';
	onemode.id = 'one-' + name;
	onemode.style.fontSize = small_device ? '18px' : '14px';
	onemode.style.color = onemode_color;
	onemode.style.width = small_device ? '72px' : onemode.style.width;
	onemode.appendChild(document.createTextNode(onemode_label));

	if (this.mode != 'c' && myrole != 1) onemode.style.display = 'none'; //don't show own cinema or if flag not set
	if (myrole == 1 || this.mode == 'c') onemode.style.display = 'block'; //but gurus should see it anyway, to click it
	
	dropper.className = 'dropper';
	dropper.id = 'drop-' + name;
	dropper.appendChild(document.createTextNode('X'));
	dropper.style.fontSize = '16px';
		
	slider.style.zIndex = '1001';
	
	video.id = 'video-' + name;
	video.autoplay = true;
	video.playsInline = true;
	video.controls = check_iPad() && isSafari ? false : false;
	video.volume = coo_volume;
	if (name != myname) video.style.cursor = 'pointer';

	slider.type = 'range';
	slider.id = 'slider_' + name;
	slider.min = 0;
	slider.max = 1;
	slider.step = 0.1;
	slider.style.display='none';
	slider.style.width='90px';
	
	loco.className = 'locos';
	loco.id = 'loco_' + name;
	
	loco.style.fontSize = '14px';
	loco.style.color = '#9cf';

	var acco = document.createElement('div');
	acco.id = 'acco_' + name;
	acco.className = 'accos';
	container.appendChild(acco);
	
	container.appendChild(slider);
	container.appendChild(loco);
	
	container.appendChild(onemode);
	if (name != myname) {container.appendChild(dropper);}
	
	var anno = document.createElement('div');
	anno.className = 'annos';
	anno.id = 'anno_' + name;
	anno.style.fontSize = '14px';
	container.appendChild(anno);
	
	var adder = document.createElement('div');	
	adder.className = 'adders';
	adder.style.fontSize = '18px';
	adder.style.cursor = 'pointer';
	adder.style.background = name == myname ? '#369' : '#900';
	adder.id = 'adder_' + name;
	adder.appendChild(document.createTextNode('A'));
	adder.onclick = setAnno;
	
	//adder.style.display = name == myname && myrole != 0 ? 'block' : 'none';
	//to be able to write anno to other streams:
	//adder.style.display = myrole != 0 ? 'block' : 'none';
	adder.style.display = myrole == 0 && myname == name ? 'none': 'block';
	//don't add to gurus except myself
	adder.style.display = this_is_guru && name != myname ? 'none' : adder.style.display;
	adder.style.right = name == myname ? '0px' : '24px';
	//then set a var = who_to onclick and pass it with a signal to server
	
	container.appendChild(adder);
		
	$(video.id).style.opacity = (i_am_muted === true || i_am_muted === 'true') && aonly && name == myname? 0 : 1;

	if ((all_muted === true || all_muted === 'true') || (coo_muted === true || coo_muted === 'true') || name == myname) video.muted = true;
	
	if (video.muted !== true){
		speaker.appendChild(document.createTextNode('\uD83D\uDD0A'));
		
	} else {
		if (name != myname) speaker.appendChild(document.createTextNode('\uD83D\uDD07'));
		if (name == myname && (i_am_muted === true || i_am_muted === 'true')) speaker.appendChild(document.createTextNode('X'));
		if (name == myname && (i_am_muted === false || i_am_muted === 'false') && myrole != 0) speaker.appendChild(document.createTextNode('\uD83C\uDFA4'));
	}
	
	speaker.style.fontSize = "42px";

	this.getVideoElement = function() {
		return video;
	}

	function setAnno() {
		fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
			let role = respo;
			//if (role != 0) {
				console.log('set anno');
				who_to = name;
				anno_adder.click();
			//}
	
		}).catch(err => console.log(err));		
	}
	
	function setCinema() {
		fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
			let role = respo;
			if (role == 1) {
				let p = participants[name]; let g = p.getMode();
				let m = g == 'c' ? 'v'  : 'c'; //toggle
				let tok = getCookie('authtoken') || '';
				let message = {
					id : 'setCinema',
					name : name,
					mode : m,
					token: tok
				}		
				sendMessage(message);	
			}
	
		}).catch(err => console.log(err));		
	}
	
	function back_to_audience() {
		fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
			let role = respo;
			if (role == 1) set_guru(0, name);
	
		}).catch(err => console.log(err));		
	}
	
	function switchOneMode(el) {

		if (acc_id) {
			doSwitchOneMode(el);
		} else {
			$('phones').innerHTML = creatu; $('phones').fade(1); (function(){$('phones').fade(0);}).delay(2000);
		}
	}
	
	function switchContainerClass() {

	   if ( from_changing_slider) { 
		if (!isAndroid) toggleMute();
	   } else {

		if (container.className === PARTICIPANT_CLASS) {
			var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_MAIN_CLASS));
			elements.forEach(function(item) {

				item.className = check_iOS() || isAndroid ? PARTICIPANT_MAIN_CLASS : PARTICIPANT_CLASS;
			});
                        elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_SOLO));
                        elements.forEach(function(item) {

				item.className = check_iOS() || isAndroid ? PARTICIPANT_MAIN_CLASS : PARTICIPANT_CLASS;
			});

				container.className = PARTICIPANT_MAIN_CLASS;
			} else {
			container.className = PARTICIPANT_CLASS;
		}		
	   }
	}
	
	function toggleFullScreen(el) {
		
		if (!el.fullscreenElement) {
			el.requestFullscreen();
	
		} else {
			if (el.exitFullscreen) {		
				el.exitFullscreen();
			}
		}

	}

	function toggleBigScreen(el) {

			if (!isAndroid)  switchContainerClass();
			if (isAndroid) {
				if (container.className == PARTICIPANT_MAIN_CLASS) toggleFullScreen(el);
				if (container.className == PARTICIPANT_CLASS) switchContainerClass();
			}
	}
		
	function toggleSlider() {
		if (check_iOS()) {from_changing_slider = false; toggleMute();}
		else {slider.style.display = slider.style.display == 'block' ? 'none' : 'block'; 
			toggleMute();
		}
	}
	
	function changeVolume() {

		coo_volume=slider.value;
		saveData(name+'_volume', coo_volume, 1440);
		coo_muted  = coo_volume > 0 ? false : true;
		saveData(name+'_muted', coo_muted, 1440);
			
		video.volume = coo_volume;
		from_changing_slider = true;
		
		if (isAndroid) {
			toggleMute();
		}

	}

	function check_iPad() {
  		var ua = navigator.userAgent;
  		if (/iPad/.test(ua) ){
    			return true;
  		}
  		return false;
	}
	
	function toggleMute() {
		if ( $('video-' + name) ) {
		
		   var video = $('video-' + name);
	   	   if ( !from_changing_slider || (from_changing_slider && ((video.volume === 0 && !video.muted) || (video.volume > 0 && video.muted))) ) {
			
			if (name != myname) 
			{
				video.muted = !video.muted;
				slider.value =  video.volume;


				from_changing_slider = false;
				
				saveData(name+'_muted', video.muted, 1440);
				saveData(name+'_volume', video.volume, 1440);
			}
			
			speaker.removeChild(speaker.childNodes[0]);
			
			if (video.muted){
				if (name != myname)  {
					speaker.appendChild(document.createTextNode('\uD83D\uDD07'));
				}
				if (name == myname) {
					if (i_am_muted === true || i_am_muted === 'true') {
						saveData(myname+'_muted', false, 1440); i_am_muted=false;
						flashText_and_rejoin('microphone ON!');
					} 
					else {
						saveData(myname+'_muted', true, 1440); i_am_muted=true;
						flashText_and_rejoin('microphone OFF!');
					}
				}
			} else {
				speaker.appendChild(document.createTextNode('\uD83D\uDD0A'));
			}
	   	   }
		}
		//big speaker on attention
		//if ((check_iOS() || isAndroid)&& this_is_guru) {speaker.style.fontSize='42px'; let d = container.getBoundingClientRect(); speaker.style.top = d.height-30; speaker.style.left=d.width-36;}
	}

	
	function rmPtcp() {
	  if (name != myname) {
	  	var yon = window.confirm('Drop '+rname+'?!');
		if (yon) {

	  		fetch('https://'+window.location.hostname+':8453/cgi/genc/checker.pl', {credentials: 'include'}).then(respo => respo.text()).then((respo) => {
				let role = respo;
				if (role == 1) {

					let tok = getCookie('authtoken') || '';
					
					let message = {
						id : 'dropGuest',
						name : name,
						token: tok
					}		
					sendMessage(message);	

				}
				
				// ?! taken care of in room.leave
				//let p = participants[name];
				//p.dispose();
				//delete p;
					
	  		}).catch(err => console.log(err));
			
			

		}	  
	  }
	}

	function isPresentMainParticipant() {
		return ((document.getElementsByClassName(PARTICIPANT_MAIN_CLASS)).length != 0 || (document.getElementsByClassName(PARTICIPANT_SOLO)).length != 0);
	}


	this.offerToReceiveVideo = function(error, offerSdp, wp){
		if (error) return console.error ("sdp offer error")

		var msg =  { id : "receiveVideoFrom",
				sender : name,
				sdpOffer : offerSdp
			};
		sendMessage(msg);
	}


	this.onIceCandidate = function (candidate, wp) {

		  var message = {
		    id: 'onIceCandidate',
		    candidate: candidate,
		    name: name
		  };
		  sendMessage(message);
	}

	Object.defineProperty(this, 'rtcPeer', { writable: true});

	this.dispose = function() {

		var gi = new RegExp('GURU:','g');
		let ct = 0;
		for ( var key in participants) {
			if (key.match(gi)) ct++;
		}
		
		if (name.match(gi) && ct == 1) {
			guru_is_here = 0;
			setTimeout(function() {
				if (!guru_is_here && false) {
					flashText(waiter);
				}
			}, 2000);
		}
		if (this.rtcPeer && typeof(this.rtcPeer != 'undefined') ) this.rtcPeer.dispose();
		if (container && container.parentNode) container.parentNode.removeChild(container);
		pcounter--; 
		if (pcounter === 1) {
                        var elements = Array.prototype.slice.call(document.getElementsByClassName(PARTICIPANT_CLASS));
                        elements.forEach(function(item) {

                                item.className = check_iOS() || isAndroid ? PARTICIPANT_MAIN_CLASS : PARTICIPANT_SOLO;
                        });

		}
		if (name != myname || myrole != 0) real_pcnt--;
		//if ($('pcounter')) $('pcounter').innerHTML = real_pcnt;
		if ($('pcounter')) { if (!real_pcnt) {(function(){$('pcounter').innerHTML = real_pcnt;}).delay(1000);} else {$('pcounter').innerHTML = real_pcnt;} }
		
		if ( guru_is_here == 0 & pcounter) i_am_guest = 1;
		if ( guru_is_here == 1 & pcounter === 1) i_am_guest = 0;
		if ( ct > 1) {i_am_guest = 0 ; guru_is_here = 1;}
		
	}
	
	this.setMode = function(r) {
		this.mode = r;
	}
	
	this.getMode = function() {
		return this.mode;
	}
}
