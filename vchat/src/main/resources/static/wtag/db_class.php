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
declare(ticks=1);

class Sql {
          
var $conn; 
var $host;
var $user;
var $pass;
var $db;
var $result;
var $lastid;
        
        
	
// Constructor
function Sql($host, $user, $pass, $db, $port) {

    $this->host=$host;
    $this->user=$user;
    $this->pass=$pass;
    $this->db=$db;
    $this->port=$port;
    
    	$conn_string = "host=".$this->host." port=".$this->port." dbname=".$this->db." user=".$this->user." password=".$this->pass;
	
	#pcntl_signal(SIGALRM, "signal_handler");
	#pcntl_alarm(3);
        
	$this->conn = pg_connect($conn_string) or die;

	#pcntl_alarm(0);
}
	
function signal_handler($signal) {
		switch($signal) {
			case SIGALRM:
				die;
		}
}
function logToFile($filename, $msg)
{ 
	// open file
	$fd = fopen($filename, "a");
	
	// write string
	fwrite($fd, $msg . "\n");
	
	// close file
	fclose($fd);
}

// Perform query
function query($query) {

       //pcntl_signal(SIGALRM, "signal_handler");
        //pcntl_alarm(3);
$this->result = @pg_query($this->conn,$query);
        //pcntl_alarm(0);
    return true;
	
}


// Count rows
function count_rows($result) {
		
    return @pg_num_rows($this->result);
	
}


// Fetch row
function fetch_row() {
		
    return @pg_fetch_array($this->result, NULL, PGSQL_ASSOC);
	
}
	
	
// Get the id for the last inserted row
function get_id() {
   
    $this->lastid = @pg_last_oid($this->result);
    $r = @pg_query($this->conn,"select messageid from wtagshoutbox where oid='$this->lastid'");
    $rw=@pg_fetch_array($r,NULL, PGSQL_ASSOC);
    return  $rw['messageid'];
	
}

function get_distinct_names($room) {

$lim = 10;
$n = ''; 
$r = @pg_query($this->conn,"select distinct name as n from wtagonliners where room = '$room'");
$counter = 0;

while ($rw=@pg_fetch_array($r,NULL, PGSQL_ASSOC)) {
	if ($counter < $lim) {$n .= $rw['n'] . ', ';}
	$counter++;
}

$r =  rtrim($n,", ");

$other = $counter - $lim;

if ($other > 0) {$r = $r.".. and ".$other." more";}	
return $r;
}

//End of the class
}
?>
