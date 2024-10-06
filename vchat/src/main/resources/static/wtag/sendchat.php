<?php
session_start();
header("Expires: Sat, 05 Nov 2005 00:00:00 GMT");
header("Last-Modified: ".gmdate("D, d M Y H:i:s")." GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("Content-Type: text/xml; charset=UTF-8");

/*
Copyright &copy; 2008 Pippa http://www.spacegirlpippa.co.uk
Contact: sthlm.pippa@gmail.com

This file is part of wTag mini chat - shoutbox.

wTag is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

wTag is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with wTag.  If not, see <http://www.gnu.org/licenses/>.
*/

// Configuration file is required.
require_once("conf.php");

$name = "hei";

if (((isset($_POST['name']))
    && (trim($_POST['name'] !== "" ))
    && (trim($_POST['name'] !== "name" ))
    && (trim($_POST['name'] !== "visitatore" ))
    && (strlen($_POST['name']) < 42))
    && ((isset($_POST['url']))
    && (strlen($_POST['url']) < 100))
    && ((isset($_POST['message']))
    && (trim($_POST['message']) !== "" )
    && (trim($_POST['message']) !== "message" )
    && (strlen($_POST['message']) < 800))
    ) {
	$name = $_POST['name'];
	$old_name = $name;
	
    $url = trim($_POST['url']);
    if ((strstr($url, 'http://') && strlen($url) == 7) || $url == "") {
    
    unset($url);
   
    }
    $msg=$_POST['message'];
    $room=strlen($_POST['room']) > 0 ? $_POST['room'] : '';

    // Get a sender IP (it will be in use in the next wTag version)
    $remote = $_SERVER["REMOTE_ADDR"];
    // Store it converted
    $converted_address=ip2long($remote);
    

$tok = md5($name."trafalgarzanzibar");
//error_log("hi!");
//error_log(print_r($tok, TRUE)); 
if ($_POST['token'] == $tok) {
    // Insert a new message into database
$st = "INSERT INTO wtagshoutbox (name, url, message, ip, room, date) select '$name', '$url', '$msg', 123, '$room', current_timestamp where exists (select * from members where a_nkname = '$old_name')";    
    //$sql->query("INSERT INTO wtagshoutbox (name,url,message,ip,date) values ('$name','$url','$msg',123,current_timestamp)");
error_log("lo!");
error_log(print_r($st, TRUE));

$sql->query($st);

    // Get the id for the last inserted message
    $lastid = $sql->get_id();
   
    // Delete oldest messages
    if ($lastid > 300) {
	
    $sql->query("DELETE FROM wtagshoutbox WHERE messageid <($lastid-300) and room = '$room'");
    
    }

    // Retrieve last 20 messages
    $sql->query("SELECT date, name, url, message FROM wtagshoutbox WHERE messageid <= $lastid and room = '$room' ORDER BY messageid DESC LIMIT 20");
} else {
    // Just retrieve last 20 messages
    $sql->query("SELECT date, name, url, message FROM wtagshoutbox WHERE room = '$room' ORDER BY messageid DESC LIMIT 20");
}
    }

    else

    {
    // Just retrieve last 20 messages
    $sql->query("SELECT date, name, url, message FROM wtagshoutbox WHERE room = '$room' ORDER BY messageid DESC LIMIT 20");
       
    }


include_once("response.php");
?>
