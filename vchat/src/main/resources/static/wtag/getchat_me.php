<?php
header("Expires: Sat, 05 Nov 2005 00:00:00 GMT");
header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Content-Type: text/xml; charset=UTF-8");

// Configuration file is required.
require_once("conf.php");

$name = $_POST['name'];
$bigbadskoi = array("Ð","Ð‘","Ð’","Ð“","Ð”","Ð•","Ð","Ð–","Ð—","Ð˜","Ð™","Ðš","Ð›","Ðœ","Ð","Ðž","ÐŸ","Ð ","Ð¡","Ð¢","Ð£","Ð¤","Ð¥","Ð¦","Ð§","Ð¨","Ð©","Ð¬","Ð«","Ðª","Ð­","Ð®","Ð¯");
$bigbadswin = array("ò","ò‘","ò’","ò“","ò”","ò•","ò","ò–","ò—","ò˜","ò™","òš","ò›","òœ","ò","òž","òŸ","ò ","ò¡","ò¢","ò£","ò¤","ò¥","ò¦","ò§","ò¨","ò©","ò¬","ò«","òª","ò­","ò®","ò¯");
$biggoodskoi = array("á","â","÷","ç","ä","å","³","ö","ú","é","ê","ë","ì","í","î","ï","ð","ò","ó","ô","õ","æ","è","ã","þ","û","ý","ø","ù","ÿ","ü","à","ñ");
$biggoodswin = array("á","â","÷","ç","ä","å","³","ö","ú","é","ê","ë","ì","í","î","ï","ð","ò","ó","ô","õ","æ","è","ã","þ","û","ý","ø","ù","ÿ","ü","à","ñ");

$smallbadskoi = array("Ð°","Ð±","Ð²","Ð³","Ð´","Ðµ","Ñ‘","Ð¶","Ð·","Ð¸","Ð¹","Ðº","Ð»","Ð¼","Ð½","Ð¾","Ð¿","Ñ€","Ñ","Ñ‚","Ñƒ","Ñ„","Ñ…","Ñ†","Ñ‡","Ñˆ","Ñ‰","ÑŒ","Ñ‹","ÑŠ","Ñ","ÑŽ","Ñ");
$smallbadswin = array("ò°","ò±","ò²","ò³","ò´","òµ","ó‘","ò¶","ò·","ò£","ò¹","òº","ò»","ò¼","ò½","ò¾","ò¿","ó€","ó","ó‚","óƒ","ó„","ó…","ó†","ó‡","óˆ","ó‰","óŒ","ó‹","óŠ","ó","óŽ","ó");
$smallgoods = array("Á","Â","×","Ç","Ä","Å","£","Ö","Ú","É","Ê","Ë","Ì","Í","Î","Ï","Ð","Ò","Ó","Ô","Õ","Æ","È","Ã","Þ","Û","Ý","Ø","Ù","ß","Ü","À","Ñ");

//$name = str_replace("ÐÙ","ì",$name);
//$name = str_replace("Ñí","Ø",$name);

//$name = str_replace($smallbadskoi,$smallgoods,$name);
//$name = str_replace($smallbadswin,$smallgoods,$name);
//$name = str_replace($bigbadskoi,$biggoodskoi,$name);
//$name = str_replace($bigbadswin,$biggoodswin,$name);

// if ($name != '' && $name != 'ëÏÔ ìÅÏÐÏÌØÄ') {
 if ($name != '') {
$sql->query("insert into wtagonliners (name,p_vremya_z) values ('$name',current_timestamp)");
}

$sql->query("delete from wtagonliners where current_timestamp-p_vremya_z > 0.0001");


// Retrieve last 20 messages from database and order them in descending order 
$sql->query("SELECT date, name, url, message FROM wtagshoutbox ORDER BY messageid DESC LIMIT 20");

include_once("response.php");
?>
