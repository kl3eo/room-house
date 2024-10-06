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
require_once("db_class.php");

#------ Database connection details -------------------------------------------#
// Replace the variables with your MySQL connection info.

$dbhost = "localhost"; // Most likely 'localhost', so you don't need to change this in most of cases
$dbuser = "postgres"; // Your username
$dbpass = "x"; // Your password
$dbname = "cp"; // Your database name
$dbport = "5432";

#------ Create an instance of Sql class ---------------------------------------#
// Connect

$sql = new Sql($dbhost, $dbuser, $dbpass, $dbname, $dbport);

?>
