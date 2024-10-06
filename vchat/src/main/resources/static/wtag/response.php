<?php
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
$xml = '<?xml version="1.0" ?>';
$xml .= '<root>';

$myname = $name;
	
$name = $sql->get_distinct_names($room);

if ($name == $myname) {$name = '';}
date_default_timezone_set('America/Los_Angeles');
$date= date("Y-m-d  H:i:s", time()); 

$message = '&nbsp;';

$name = htmlspecialchars($name);
$message = htmlspecialchars($message);

if ($name == '') {$name = htmlentities(htmlspecialchars('..none else'),ENT_COMPAT,'UTF-8'); }

$xml .= '<msg>';
$xml .= '<date>' . $date . '</date>';
$xml .= '<message>' . $message. '</message>';
$xml .= '<name>' . $name . '</name>';

$xml .= '</msg>';

while ($row=$sql->fetch_row()) {

$date = $row['date'];
$name = $row['name'];
$url = $row['url'];
$message = $row['message'];

$name = htmlspecialchars($name);
$url = htmlspecialchars($url);
$message = htmlspecialchars($message);

$xml .= '<msg>';
$xml .= '<date>' . $date . '</date>';
$xml .= '<name>' . $name . '</name>';
$xml .= '<url>' . $url . '</url>';
$xml .= '<message>' . $message. '</message>';

$xml .= '</msg>';
  
}

$xml .= '</root>';

echo $xml;
?>
