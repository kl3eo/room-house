/*
 * (C) Copyright 2014 Kurento (http://kurento.org/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
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

package org.kurento.tutorial.groupcall;

import java.io.*;
import java.net.InetAddress;

import org.kurento.client.IceCandidate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

//import org.springframework.security.web.util.matcher.IpAddressMatcher;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;

import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.City;
import com.maxmind.geoip2.record.Country;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.PreparedStatement;


/**
 * 
 * @author Ivan Gracia (izanmail@gmail.com)
 * @since 4.3.1
 * -- room-house.com 2022
 */

@Component
public class CallHandler extends TextWebSocketHandler {

  private static final Logger log = LoggerFactory.getLogger(CallHandler.class);

  private static final Gson gson = new GsonBuilder().create();

  @Autowired
  private RoomManager roomManager;

  @Autowired
  private UserRegistry registry;

  @Autowired
  private GeoLite geoLite;
  
  @Override
  public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    final JsonObject jsonMessage = gson.fromJson(message.getPayload(), JsonObject.class);

    final UserSession user = registry.getBySession(session);    
    
    final String pgurl = "jdbc:postgresql://localhost:5432/cp";
    final String pguser = "postgres";
    final String pgpass = "x";
    
    int room_limit = 0;

    if (user != null) {
      log.debug("Incoming message from user '{}': {}", user.getName(), jsonMessage);
    } else {
      //if (jsonMessage.get("token").getAsString().equals("")) 
      	//log.info("Incoming message from new user: {}", jsonMessage);
    }
    
    switch (jsonMessage.get("id").getAsString()) {
      case "joinRoom":
      
      		if (user == null) {log.info("Incoming message from new user: {}", jsonMessage);}
		
        	final String joinerName = jsonMessage.get("name").getAsString();
        	final UserSession who = registry.getByName(joinerName);

        	if (who != null) {
                	if (user == null) {
				//if you do correct, they would re-connect; hack and let them stay idle in goodConnection
				//WebSocketSession sess = who.getSession();
    				//UserSession us = registry.removeBySession(sess);
                        	//leaveRoom(us);
				leaveRoom(who);
                	}
        	}

		String joinerToken = jsonMessage.get("token").getAsString();
		String joinerRoom = jsonMessage.get("room").getAsString(); 
		String joinerRole = jsonMessage.get("role").getAsString();
		
		joinerRoom = joinerRoom.replaceAll("[;'\"]*", ""); //protect against sql injection
		joinerRole = joinerRole.replaceAll("[;'\"]*", "");

		BufferedReader br = new BufferedReader(new FileReader("/home/nobody/"+joinerRoom+"_room_limit"));
		try {
			StringBuilder sb = new StringBuilder();
			String line = br.readLine();

			while (line != null) {
				sb.append(line);
				sb.append(System.lineSeparator());
				line = br.readLine();
			}
			
			room_limit = Integer.parseInt(sb.toString().replaceAll("\r", "").replaceAll("\n", ""));
		} catch (FileNotFoundException fnfe) {
			fnfe.printStackTrace();
      		} finally {
			br.close();
		}
			
		String role = "0"; String _role = "0"; String noSuchRoom = "0"; String temporary = "0";

// check if guru
		String cmd = "/home/nobody/a.sh";
		Runtime run = Runtime.getRuntime();
		Process pr = run.exec(cmd);
		pr.waitFor();
		BufferedReader buf = new BufferedReader(new InputStreamReader(pr.getInputStream()));
		String line = "";
		while ((line=buf.readLine())!=null) {
			if (line.equals(joinerToken) && joinerToken.length() == 32) {role = "1";}
		}
// then check if auth user

        	if (role.equals("0")) {
	  		try (Connection con = DriverManager.getConnection(pgurl, pguser, pgpass);
                	Statement st = con.createStatement();
			ResultSet rs = st.executeQuery("select md5(concat(proj_code, pass)) from members where proj_code != 'admin' and room = '" + joinerRoom + "'")) {
            			while(rs.next()) {if (rs.getString(1).equals(joinerToken)) {role = "2"; break;}}
          		} catch (SQLException ex) {log.debug("PG join err from {}: ", joinerName);}
		}
// now check if room is closed
		String sta = "0";
	  	try (Connection con = DriverManager.getConnection(pgurl, pguser, pgpass);
                Statement st = con.createStatement();
		ResultSet rs = st.executeQuery("select status from rooms where name='" + joinerRoom + "' and (current_timestamp < valid_till or valid_till is null)")) {
            		if (rs.next()) {if (rs.getString(1).equals("1")) {sta = "1";}} else {noSuchRoom = "1";}
         	} catch (SQLException ex) {log.debug("PG join err from {}: ", joinerName);}
	  
        	log.info("JOINER {}: SESSION {}, ROLE TOKEN {}, ROLE RECEIVED {}, ROOM STATUS {}, ROOM LIMIT {}", joinerName, session, role, joinerRole, sta, room_limit);
// now make temp permissson if required
	
		if (user != null) {_role = user.getRole();}
	
		if (joinerRole.equals("3") && !role.equals("1") && _role.equals("3") && noSuchRoom.equals("0") ) { temporary = "1";}
// now check if we're to let join
// count number of participants
                Room roo = roomManager.getRoom(joinerRoom);
                int cou = 0;
                for (final UserSession participant : roo.getParticipants()) {
                        cou++;
                }
// we allow room_limit joins in many-to-many
                if (role.equals("0") && cou < room_limit) { role = "1"; }
		if (room_limit == 2 && cou >= room_limit) { noSuchRoom = "1"; }
	
		if ( (sta.equals("1") && role.equals("0")) || (!joinerRole.equals(role) && role.equals("0") && temporary.equals("0")) || noSuchRoom.equals("1") ) {
			log.info("ALARM1: joiner {} ", joinerName);
		} else {
        		joinRoom(jsonMessage, session, room_limit);
		}
        break;
      case "receiveVideoFrom":
        if (user != null) {
        	final String senderName = jsonMessage.get("sender").getAsString();
        	final UserSession sender = registry.getByName(senderName);
        	final String sdpOffer = jsonMessage.get("sdpOffer").getAsString();
		log.info("SENDER {}: RECEIVED by USER {}", senderName, user.getName());
		boolean cinema_ticket = true;
		if (sender != null && user.getAccId().length() == 0 && sender.getMode().equals("c")) cinema_ticket = false;
        	if (sender != null && cinema_ticket) user.receiveVideoFrom(sender, sdpOffer);
	}
        break;
      case "leaveRoom":
        if (user != null) {
        	leaveRoom(user);
	}
        break;
      case "plus":
        	if (user != null) plusVote(user, jsonMessage);
      case "keyDown":
        	if (user != null) keyDown(user, jsonMessage);
        break;
      case "makeLeave":
		String jTokenMakeLeave = jsonMessage.get("token").getAsString();
		String roleMakeLeave = "0";

// check if guru
		String cmdMakeLeave = "/home/nobody/a.sh";
		Runtime runMakeLeave = Runtime.getRuntime();
		Process prMakeLeave = runMakeLeave.exec(cmdMakeLeave);
		prMakeLeave.waitFor();
		BufferedReader bufMakeLeave = new BufferedReader(new InputStreamReader(prMakeLeave.getInputStream()));
		String lineMakeLeave = "";
		while ((lineMakeLeave=bufMakeLeave.readLine())!=null) {
			if (lineMakeLeave.equals(jTokenMakeLeave) && jTokenMakeLeave.length() == 32) {roleMakeLeave = "1";}
		}      
        	if (user != null && roleMakeLeave.equals("1")) makeLeave(user, jsonMessage);
        break;
      case "writeToLog":
        	if (user != null) writeToLog(user, jsonMessage);
        break;
      case "setAnno":
        	if (user != null) setAnno(user, jsonMessage);
        break;
      case "setGuru":
		String jTokenSetGuru = jsonMessage.get("token").getAsString();
		String roleSetGuru = "0";
// check if guru
		String cmdSetGuru = "/home/nobody/a.sh";
		Runtime runSetGuru = Runtime.getRuntime();
		Process prSetGuru = runSetGuru.exec(cmdSetGuru);
		prSetGuru.waitFor();
		BufferedReader bufSetGuru = new BufferedReader(new InputStreamReader(prSetGuru.getInputStream()));
		String lineSetGuru = "";
		while ((lineSetGuru=bufSetGuru.readLine())!=null) {
			if (lineSetGuru.equals(jTokenSetGuru) && jTokenSetGuru.length() == 32) {roleSetGuru = "1";}
		}      
        	if (user != null && roleSetGuru.equals("1")) setGuru(user, jsonMessage);
        break;
      case "dropGuest":
		String jTokenDropGuest = jsonMessage.get("token").getAsString();
		String roleDropGuest = "0";
// check if guru
		String cmdDropGuest = "/home/nobody/a.sh";
		Runtime runDropGuest = Runtime.getRuntime();
		Process prDropGuest = runDropGuest.exec(cmdDropGuest);
		prDropGuest.waitFor();
		BufferedReader bufDropGuest = new BufferedReader(new InputStreamReader(prDropGuest.getInputStream()));
		String lineDropGuest = "";
		while ((lineDropGuest=bufDropGuest.readLine())!=null) {
			if (lineDropGuest.equals(jTokenDropGuest) && jTokenDropGuest.length() == 32) {roleDropGuest = "1";}
		}      
        	if (user != null && roleDropGuest.equals("1")) dropGuest(user, jsonMessage);
        break;
      case "setCinema":
		String jTokenSetCinema = jsonMessage.get("token").getAsString();
		String roleSetCinema = "0";
// check if guru
		String cmdSetCinema = "/home/nobody/a.sh";
		Runtime runSetCinema = Runtime.getRuntime();
		Process prSetCinema = runSetCinema.exec(cmdSetCinema);
		prSetCinema.waitFor();
		BufferedReader bufSetCinema = new BufferedReader(new InputStreamReader(prSetCinema.getInputStream()));
		String lineSetCinema = "";
		while ((lineSetCinema=bufSetCinema.readLine())!=null) {
			if (lineSetCinema.equals(jTokenSetCinema) && jTokenSetCinema.length() == 32) {roleSetCinema = "1";}
		}      
        	if (user != null && roleSetCinema.equals("1")) setCinema(user, jsonMessage);
        break;
      case "signalGuru":
        	if (user != null) askGuru(user);
        break;
      case "checkConnection":
        	if (user != null) checkConn(user);
        break;
      case "checkRoom":
		if (user == null) {
        		final String jRoom = jsonMessage.get("room").getAsString();
			final Room ro = roomManager.getRoom(jRoom);
			
                	int co = 0; int vi = 0; String an = ""; String cu = "";
                	for (final UserSession participant : ro.getParticipants()) {
                        	an = participant.getAnno();
				cu = participant.getCurip();
				co++;
                	}
                	for (final UserSession viewer : ro.getViewers()) {
                        	vi++;
                	}
			if ( co != 1) {an = ""; cu = "";} else {an = "\".."+an+"\"";}
			
			//log.info("ROOM {}: got {} participants, {} viewers", jRoom, co, vi);
			synchronized (session) {
				final JsonObject checkRoomJson = new JsonObject();	
    				checkRoomJson.addProperty("id", "roomConnection");
				checkRoomJson.addProperty("nump", co);
				checkRoomJson.addProperty("numv", vi);
				checkRoomJson.addProperty("anno", an);
				checkRoomJson.addProperty("curip", cu);			
				session.sendMessage(new TextMessage(checkRoomJson.toString()));
			}
			
			final String jTok = jsonMessage.get("tok").getAsString();
			
			if (jTok.equals("enebeneraba")) {
				try (Connection con = DriverManager.getConnection(pgurl, pguser, pgpass);
                		Statement st = con.createStatement();
				ResultSet rs = st.executeQuery("UPDATE rooms SET nump=" + co + ", numv=" + vi + ", dtm=current_timestamp WHERE name='" + jRoom + "'")) {
         	} catch (SQLException ex) {log.debug("PG update err for room {}", jRoom);}
					
			}					
		}
        break;
      case "onIceCandidate":
        if (user != null) {
	  	JsonObject candidate = jsonMessage.get("candidate").getAsJsonObject();
          	IceCandidate cand = new IceCandidate(candidate.get("candidate").getAsString(),
              	candidate.get("sdpMid").getAsString(), candidate.get("sdpMLineIndex").getAsInt());
          	user.addCandidate(cand, jsonMessage.get("name").getAsString());
        }
        break;
      default:
        break;
    }
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    UserSession user = registry.removeBySession(session);
    if (user != null) roomManager.getRoom(user.getRoomName()).leave(user);
  }

  private void joinRoom(JsonObject params, WebSocketSession session, int room_limit) throws IOException, GeoIp2Exception {
    String roomName = params.get("room").getAsString();
    String name = params.get("name").getAsString();
    String mode = params.get("mode").getAsString();
    String acc_id = params.get("acc_id").getAsString();    
    String role = params.get("role").getAsString();
    
    final String pgurl = "jdbc:postgresql://localhost:5432/cp";
    final String pguser = "postgres";
    final String pgpass = "x";

    String already = "false";
    
    String curip = params.get("curip").getAsString();
    
    String country = "country";
    String city = "city";
    int num_guests = 0;
	
    //need this hack to avoid DB errors
    curip = curip.replaceAll("[;'\"]*", "");
    //if (curip.equals("127.0.0.1") || curip.equals("") || curip.equals("192.168.88.99")) {curip = "164.68.105.131";}
    //if (matches(curip, "192.168.0.0/16") || matches(curip, "10.0.0.0/8") || matches(curip, "172.16.0.0/8") )
    if (curip.equals("127.0.0.1") || curip.equals("") || isPrivateIP(curip)) {curip = "164.68.105.131";}
    final InetAddress ipAddress = InetAddress.getByName(curip);

    Room room = roomManager.getRoom(roomName);
    
    //check if the room has already listed this user, then return
    for (final UserSession participant : room.getParticipants()) {
      if (participant.getName().equals(name)) {
        already = "true";
      }
    }

    for (final UserSession viewer : room.getViewers()) {
      if (viewer.getName().equals(name)) {
        already = "true";
      }
    }
        
    if(already.equals("false")) {
	log.info("SOMEONE {}: trying to join room {}", name, roomName);

    	try {
        	final DatabaseReader reader = geoLite.getReader();

        	final CityResponse response = reader.city(ipAddress);

        	city = response.getCity().getName();
        	country = response.getCountry().getIsoCode();
        	curip = city + ", " + country;

    	} catch (final IOException e) {}
        
	//DB
	// this piece of j*va displays a ton of compiler error - I don't know why, and I don't want to know. Life is too short, my friend.
	/*
	try (Connection con = DriverManager.getConnection(pgurl, pguser, pgpass);
		PreparedStatement st = con.prepareStatement("INSERT INTO JOINS (IPADDR, COUNTRY, CITY, NAME, ROOM, MODE, ROLE, DTM) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
		st.setString(1, ipAddress);
		st.setString(2, country);
		st.setString(3, city);
		st.setString(4, name);
		st.setString(5, roomName);
		st.setString(6, mode);
		st.setString(7, role);
		
		st.executeUpdate();
		st.close();
		) {} catch (SQLException ex) {log.debug("PG insert err from {}: ", name);}
	*/
	  	
		//protect against sql injection
		name = name.replaceAll("[;'\"]*", ""); 
		roomName = roomName.replaceAll("[;'\"]*", "");
		mode = mode.replaceAll("[;'\"]*", "");
		role = role.replaceAll("[;'\"]*", "");
		city = city.replaceAll("[;'\"]*", "");
		country = country.replaceAll("[;'\"]*", "");
		acc_id = acc_id.replaceAll("[;'\"]*", "");

//create table joins (id serial, ipaddr text, country text, city text, name text, room text, mode text, role text, dtm timestamp, accid text);
//insert		
		try (Connection con = DriverManager.getConnection(pgurl, pguser, pgpass);
                Statement st = con.createStatement();
		ResultSet rs = st.executeQuery("INSERT INTO JOINS (IPADDR, COUNTRY, CITY, NAME, ROOM, MODE, ROLE, DTM, ACCID) VALUES ('" + ipAddress.getHostAddress() + "','" + country + "','" + city + "','" + name + "','" + roomName + "','" + mode + "','" + role + "', current_timestamp, '" + acc_id + "')")) {
         	} catch (SQLException ex) {log.info("PG join err from {}: ", name);}

//get daily stats

	  	try (Connection con = DriverManager.getConnection(pgurl, pguser, pgpass);
                Statement st = con.createStatement();
		ResultSet rs = st.executeQuery("select count(distinct ipaddr) from joins where room = '" + roomName + "' and dtm > current_date")) {
            		if (rs.next()) {num_guests  = rs.getInt(1);}
         	} catch (SQLException ex) {log.debug("PG sel stats1 err for room {}: ", roomName);}
			
    	final UserSession user = room.join(name, mode, curip, acc_id, session, role, num_guests, room_limit);

    	registry.register(user);
    }
  }

  private void leaveRoom(UserSession user) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    room.leave(user);
    if (room.getParticipants().isEmpty() && room.getViewers().isEmpty()) {
      roomManager.removeRoom(room);
    }
  }
  
  private void plusVote(UserSession user, JsonObject params) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    final String s = params.get("s").getAsString();
    final String num = params.get("num").getAsString();
    log.info("GURU {}: trying to plus {} for {}", user.getName(), num, s);
    room.notify_tableau_change(user,s,num);
  }

  private void keyDown(UserSession user, JsonObject params) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    final String num = params.get("num").getAsString();
    final String namee = params.get("name").getAsString();
    room.notify_key_down(user,num,namee);
  }
  
  private void makeLeave(UserSession user, JsonObject params) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    final String n = params.get("name").getAsString();
    log.info("GURU {}: making {} leave the room {} and clean all their cookies", user.getName(), n, room);
    room.make_leave_room(user, n);
  }
    
  private void writeToLog(UserSession user, JsonObject params) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    final String s = params.get("text").getAsString();
    log.info("USER {}: trying to write {} to log!", user.getName(), s);
    room.write_message_to_log(user, s);
  } 

  private void setAnno(UserSession user, JsonObject params) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    final String s = params.get("anno").getAsString();
    final String a = params.get("addr").getAsString();
    log.info("USER {}: trying to set anno for {} to {}!", user.getName(), a, s);
    room.set_anno_to_text(user, s, a);
  }
  
  private void setGuru(UserSession user, JsonObject params) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    final String n = params.get("name").getAsString();
    final String m = params.get("mode").getAsString();
    log.info("GURU {}: trying to set {} in guru mode {} !", user.getName(), n, m);
    room.set_guru_in_mode(user, n, m);
  }

  private void dropGuest(UserSession user, JsonObject params) throws IOException {
    final String n = params.get("name").getAsString();
    final UserSession who = registry.getByName(n);
    if (who != null) {
		who.setRole("0");
		//if you do correct, they would re-connect; hack and let them stay idle in goodConnection
		//WebSocketSession sess = who.getSession();
    		//UserSession us = registry.removeBySession(sess);
		//leaveRoom(us);
		leaveRoom(who);
	    }    
    log.info("GURU {}: trying to drop {} viewer!", user.getName(), n);
  }
  
  private void setCinema(UserSession user, JsonObject params) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    final String n = params.get("name").getAsString();
    final String m = params.get("mode").getAsString();
    log.info("GURU {}: trying to set {} in cinema mode {} !", user.getName(), n, m);
    room.set_cinema_in_mode(user, n, m);
  }
  
  private void askGuru(UserSession user) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    log.info("VIEWER {}: trying ask Guru!", user.getName());
    room.set_asking_mode(user);
  }

  private void checkConn(UserSession user) throws IOException {
    final Room room = roomManager.getRoom(user.getRoomName());
    //log.info("SOMEONE {}: checking connection", user.getName());
    room.check_conn(user);
  }
/*  
  private boolean matches(String ip, String subnet) {
    IpAddressMatcher ipAddressMatcher = new IpAddressMatcher(subnet);
    return ipAddressMatcher.matches(ip);
  }
*/
  public boolean isPrivateIP(String ipAddress) {
        boolean isValid = false;

        if (ipAddress != null && !ipAddress.isEmpty()) {
            String[] ip = ipAddress.split("\\.");
            short[] ipNumber = new short[] { 
                    Short.parseShort(ip[0]), 
                    Short.parseShort(ip[1]), 
                    Short.parseShort(ip[2]),
                    Short.parseShort(ip[3])
                };

            if (ipNumber[0] == 10) { // Class A
                isValid = true;
            } else if (ipNumber[0] == 172 && (ipNumber[1] >= 16 && ipNumber[1] <= 31)) { // Class B
                isValid = true;
            } else if (ipNumber[0] == 192 && ipNumber[1] == 168) { // Class C
                isValid = true;
            }
        }

        return isValid;
  }
}

