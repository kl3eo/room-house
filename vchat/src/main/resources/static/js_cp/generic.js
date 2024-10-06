var source_ind = '/icon/grey_line.png';
function Get_Cookie( check_name ) {
	var a_all_cookies = document.cookie.split( ';' );
	var a_temp_cookie = '';
	var cookie_name = '';
	var cookie_value = '';
	var b_cookie_found = false; // set boolean t/f default f

	for ( i = 0; i < a_all_cookies.length; i++ )
	{
		a_temp_cookie = a_all_cookies[i].split( '=' );
		cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
		if ( cookie_name == check_name )
		{
			b_cookie_found = true;
			if ( a_temp_cookie.length > 1 )
			{
				cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
			}
			return cookie_value;
			break;
		}
		a_temp_cookie = null;
		cookie_name = '';
	}
	if ( !b_cookie_found )
	{
		return null;
	}
}

function check_response(response) {

	var r = new RegExp('DOCTYPE HTML PUBLIC','ig');
	if (typeof(response) != 'undefined' && response != null && response.match(r)) {
		document.body.style.opacity='0.05';
		alert('Authorization Required');
			return;
	}
}

function check_my_auth() {

	var k = Get_Cookie('cdAuth'); if ( typeof(k) == 'undefined' || k == null || k == 'x') {location.reload();return false;}
	k = Get_Cookie('wtUser'); if ( typeof(k) == 'undefined' || k == null) {location.reload();return false;}
}

function Is_Mobile() {
        var myHTTP_USER_AGENT = navigator.userAgent.toString();
        var i;
        var mobile_browser = new Array(
             '2.0 MMP',
             '240x320',
             'AvantGo',
             'BlackBerry',
             'Blazer',
             'Cellphone',
             'Danger',
             'DoCoMo',
             'Elaine/3.0',
             'EudoraWeb',
             'hiptop',
             'IEMobile',
             'KYOCERA/WX310K',
             'LG/U990',
             'MIDP-2.0',
             'MMEF20',
             'MOT-V',
             'NetFront',
             'Newt',
             'Nintendo Wii',
             'Nitro',
             'Nokia',
             'Opera Mini',
             'Palm',
             'Playstation Portable',
             'portalmmm',
             'Proxinet',
             'ProxiNet',
             'SHARP-TQ-GX10',
             'Small',
             'SonyEricsson',
             'Symbian OS',
             'SymbianOS',
             'TS21i-10',
             'UP.Browser',
             'UP.Link',
             'Windows CE',
             'WinWAP');

     

        for (i=0;i<=37;i++){
          if (myHTTP_USER_AGENT.indexOf(mobile_browser[i])!=-1) {
            return 1;
          }
        }
        return 0;
}

var showMode = 'table-cell';
if (document.all) showMode='block';
function toggleControl(btn,k){
	btn   = document.forms['t'+btn+'s'].elements[btn];
	acells = document.getElementsByName('t'+btn.name);
	mode  = btn.checked ? showMode : 'none';
	for(j = 0; j < acells.length; j++) acells[j].style.display=mode;
	if (k > 0) {
		document.getElementById('extra_goo').style.display = mode;
	}
}

function writeCookie(cname,value) {
var curCookie = escape(cname) + "=" + escape(value) +"; expires=Sat, 01-Jan-2033 00:00:01 GMT;"
document.cookie = curCookie
}

function runOld(par) {
writeCookie('MOBILE', par);
}

function relocate (url,banner) {
window.location="tclub?mode=relocate&url='"+url+"'&banner='"+banner+"'";
}
var win1, win2, win3;

function reg_tournir(t_oid){
theString="tclub?mode=reg_tournir&coid="+t_oid
win2=window.open(theString,"",'width=400,height=480, toolbar=1,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}

function show_matches(member,par){
theString="tclub?mode=show_matches&member="+member+"&par="+par
win3=window.open(theString,"",'width=640,height=480, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win3.moveTo(320,240)
}
function show_player_photos(member){
theString="tclub?mode=list_gallery&name_filter="+member
win3=window.open(theString,"",'width=512,height=420, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win3.moveTo(120,180)
}
function show_player_karr(member,par){
theString="tclub?mode=show_karr&name_filter="+member+"&par="+par
win3=window.open(theString,"",'width=180,height=240, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win3.moveTo(180,240)
}
function show_tournir(id, num, d){
theString="tclub?mode=show_tournir&tournir="+id+"&num_rounds="+num+"&if_doubles="+d
win2=window.open(theString,"",'width=900,height=600, toolbar=1,scrollbars=1,titlebar=0,resizable=1,menubar=1,status=1,location=0')
win2.moveTo(220,120)
}
function add_tournir(){
theString="tclub?mode=add_tournir"
win2=window.open(theString,"",'width=640,height=540, toolbar=1,scrollbars=1,titlebar=0,resizable=1,menubar=1,status=1,location=0')
win2.moveTo(220,120)
}
function zhr(t_id){
theString="tclub?mode=zhr&coid="+t_id
win2=window.open(theString,"",'width=560,height=480, toolbar=1,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
function ladder(){
theString="tclub?mode=ladder&show_matches_mode=0"
win1=window.open(theString,"",'fullscreen=yes,toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
}
function reg_ladder(id){
theString="tclub?mode=reg_ladder"
win2=window.open(theString,"",'width=300,height=150, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(320,120)
}
function show_box_npeop(k){
theString="tclub?mode=show_peop&showmode="+k
win3=window.open(theString,"",'width=40,height=200, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win3.moveTo(100,180)
}
function edit_profile(){
theString="tclub?mode=edit_profile"
win1=window.open(theString,"",'width=640,height=800, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win1.moveTo(0,0)
}
function list_club(){
theString="tclub?mode=list_club"
win1=window.open(theString,"",'fullscreen=yes,toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.resizeTo(screen.width,screen.height);
}
function list_tournirs(){
theString="tclub?mode=list_tournirs"
win1=window.open(theString,"",'width=640,height=480, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win1.moveTo(0,0)
}
function forum(r){
theString="tclub?mode=forum&forum_renum="+r
win1=window.open(theString,"",'fullscreen=yes,width=640,height=480, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.resizeTo(screen.width,screen.height);
}
function vote(){
theString="tclub?mode=vote"
win2=window.open(theString,"",'width=560,height=480, toolbar=1,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
function toss(){
theString="tclub?mode=toss"
win2=window.open(theString,"",'width=560,height=480, toolbar=1,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
function courts(){
theString="tclub?mode=courts_new"
win1=window.open(theString,"",'width=360,height=720, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.moveTo(60,120)
}
function shops(){
theString="tclub?mode=shops"
win1=window.open(theString,"",'width=400,height=600, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.moveTo(360,120)
}
function stringers(){
theString="tclub?mode=stringers"
win1=window.open(theString,"",'width=400,height=600, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.moveTo(360,120)
}
function trainers(){
theString="tclub?mode=trainers"
win1=window.open(theString,"",'width=400,height=600, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.moveTo(360,120)
}
function hitters(){
theString="tclub?mode=hitters"
win1=window.open(theString,"",'width=400,height=600, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.moveTo(360,120)
}
function clubs(){
theString="tclub?mode=clubs"
win1=window.open(theString,"",'width=400,height=600, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.moveTo(360,120)
}
function add_photo () {
theString="tclub?mode=add_photo"
win2=window.open(theString,"",'width=480,height=450, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
function add_sale () {
theString="tclub?mode=add_sale"
win2=window.open(theString,"",'width=480,height=450, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
function editsales (par) {
theString="tclub?mode=editsales&sale_mode="+par
win2=window.open(theString,"",'width=480,height=450, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
function confirm_man (challenge_oid, member_code) {
theString="tclub?mode=confirm_yourself&coid="+challenge_oid+"&member="+member_code
win2=window.open(theString,"",'width=300,height=150, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(320,120)
}
function reject (challenge_oid, member_code) {
theString="tclub?mode=remove_yourself&coid="+challenge_oid+"&member="+member_code
win2=window.open(theString,"",'width=300,height=150, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(320,120)
}
function show_recent_matches(){
theString="tclub?mode=show_recent_matches&matchtype=singles"
win1=window.open(theString,"",'width=640,height=480, toolbar=1,scrollbars=1,titlebar=1,resizable=1,menubar=1,status=1,location=0')
win1.resizeTo(screen.width,screen.height-120);
}
function show_kafe(){
theString="http://pgrocks.com/cgi/ru/tclub?mode=show_kafe"
win1=window.open(theString,"",'width=640,height=480, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win1.moveTo(320,320)
}
function show_docs(){
theString="tclub?mode=show_docs"
win1=window.open(theString,"",'width=320,height=200, toolbar=1,scrollbars=1,titlebar=0,resizable=1,menubar=1,status=1,location=0')
win1.moveTo(320,320)
}
function send_result(par){
theString="tclub?mode=send_email&send_param="+par
win1=window.open(theString,"",'width=450,height=320, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win1.moveTo(220,120)
}
function edit_challenge (challenge_oid) {
theString="tclub?mode=edit_challenge&coid="+challenge_oid
win2=window.open(theString,"",'width=400,height=450, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
function select_candidate (challenge_oid,par) {
theString="tclub?mode=select_candidate&coid="+challenge_oid+"&show_box_cand="+par
win2=window.open(theString,"",'width=400,height=450, toolbar=0,scrollbars=1,titlebar=0,resizable=1,menubar=0,status=0,location=0')
win2.moveTo(220,120)
}
