let v = 0; 
if (scanned === null && cam1 === null && cam2 === null) {
   navigator.mediaDevices.enumerateDevices()
     .then(function(devices) {
        var BreakException = {};
        try {
          devices.forEach(function(device) {
        	switch(device.kind){
        	   case "videoinput":
        		v++;
        		if (v == 1) {
        			setCookie('d1',device.deviceId,144000);
        			cam1 = device.deviceId;
        		}
        		if (v == 2) {
        			setCookie('d2',device.deviceId,144000);
        			cam2 = device.deviceId;
        		}
        		break;
        	   case "audioinput":
        		setCookie('s1',1,144000);
        		break;
        	   default:
        		break;
        	}
		if ( v > 1 ) throw BreakException;
          });
      } catch (e) {
          if (e !== BreakException) throw e;
      }
     }).catch(function(err) {
        	console.log(err.name + ": " + err.message);
     });
}

const box = document.getElementById('sp_container');
const buA = document.getElementById('removerA');
const buB = document.getElementById('removerB');
const buC = document.getElementById('cancel_sp')
buC.addEventListener('click', function handleClick(event) {
	buA.style.display = 'none';
	if (buB) buB.remove();
	if (box) box.remove();
	$('controls').style.top = '-12px';
	(function(){$('subcontrols').style.display='block';$('subcontrols').fade(1);}).delay(1000);
});
buB.addEventListener('click', function handleClick(event) {
  	buA.style.display = 'none';
	if (buB) buB.remove();
	if (box) box.remove();
	$('controls').style.top = '-12px';
});
