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

    if (user != null) {
      log.debug("Incoming message from user '{}': {}", user.getName(), jsonMessage);
    } else {
      log.info("Incoming message from new user: {}", jsonMessage);
    }
    
    switch (jsonMessage.get("id").getAsString()) {
      case "joinRoom":
        	final String joinerName = jsonMessage.get("name").getAsString();
        	final UserSession who = registry.getByName(joinerName);

        	if (who != null) {
                	if (user == null) {
                        	leaveRoom(who);
                	}
        	}
		
		String joinerToken = jsonMessage.get("token").getAsString();
		String joinerRoom = jsonMessage.get("room").getAsString();
		String joinerRole = jsonMessage.get("role").getAsString();
	
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
          		} catch (SQLException ex) {log.info("PG join err from {}: ", joinerName);}
		}
// now check if room is closed
		String sta = "0";
	  	try (Connection con = DriverManager.getConnection(pgurl, pguser, pgpass);
                Statement st = con.createStatement();
		ResultSet rs = st.executeQuery("select status from rooms where name='" + joinerRoom + "'")) {
            		if (rs.next()) {if (rs.getString(1).equals("1")) {sta = "1";}} else {noSuchRoom = "1";}
         	} catch (SQLException ex) {log.info("PG join err from {}: ", joinerName);}
	  
        	log.info("JOINER {}: SESSION {}, ROLE TOKEN {}, ROLE RECEIVED {}, ROOM STATUS {}", joinerName, session, role, joinerRole, sta);
// now make temp permissson if required
	
		if (user != null) {_role = user.getRole();}
	
		if (joinerRole.equals("3") && !role.equals("1") && _role.equals("3") && noSuchRoom.equals("0") ) { temporary = "1";}
// now check if we're to let join
	
		if ( (sta.equals("1") && role.equals("0")) || (!joinerRole.equals(role) && temporary.equals("0")) || noSuchRoom.equals("1") ) {
			log.info("ALARM1: joiner {} ", joinerName);
		} else {
        		joinRoom(jsonMessage, session);
		}
        break;
      case "receiveVideoFrom":
        if (user != null) {
        	final String senderName = jsonMessage.get("sender").getAsString();
        	final UserSession sender = registry.getByName(senderName);
        	final String sdpOffer = jsonMessage.get("sdpOffer").getAsString();
		log.info("SENDER {}: RECEIVED by USER {}", senderName, user.getName());
        	if (sender != null) user.receiveVideoFrom(sender, sdpOffer);
	}
        break;
      case "leaveRoom":
        if (user != null) {
        	leaveRoom(user);
	}
        break;
      case "plus":
        	if (user != null) plusVote(user, jsonMessage);
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

  private void joinRoom(JsonObject params, WebSocketSession session) throws IOException, GeoIp2Exception {
    final String roomName = params.get("room").getAsString();
    final String name = params.get("name").getAsString();
    final String mode = params.get("mode").getAsString();
    final String acc_id = params.get("acc_id").getAsString();    
    final String role = params.get("role").getAsString();

    String already = "false";
    
    String curip = params.get("curip").getAsString();

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

        	final String city = response.getCity().getName();
        	final String country = response.getCountry().getIsoCode();
        	curip = city + ", " + country;

    	} catch (final IOException e) {}

    	final UserSession user = room.join(name, mode, curip, acc_id, session, role);

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
    log.info("USER {}: trying to set anno to {}!", user.getName(), s);
    room.set_anno_to_text(user, s);
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
}
