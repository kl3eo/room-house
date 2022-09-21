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

import java.io.Closeable;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import javax.annotation.PreDestroy;
import javax.servlet.http.HttpServletRequest;

import org.kurento.client.Continuation;
import org.kurento.client.MediaPipeline;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.WebSocketSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonPrimitive;

import java.time.format.DateTimeFormatter;  
import java.time.LocalDateTime; 

/**
 * @author Ivan Gracia (izanmail@gmail.com)
 * @since 4.3.1
 * -- ZOZZ 2022
 */
public class Room implements Closeable {
  private final Logger log = LoggerFactory.getLogger(Room.class);

  private final ConcurrentMap<String, UserSession> participants = new ConcurrentHashMap<>();
  private final ConcurrentMap<String, UserSession> viewers = new ConcurrentHashMap<>();
  private final MediaPipeline pipeline;
  private final String name;

  public String getName() {
    return name;
  }

  public Room(String roomName, MediaPipeline pipeline) {
    this.name = roomName;
    this.pipeline = pipeline;
    log.info("ROOM {} has been created", roomName);
  }

  @PreDestroy
  private void shutdown() {
    this.close();
  }

  public UserSession join(String userName, String userMode, String userCurip, String userAccId, WebSocketSession session, String roleId, int num_guests, int room_limit) throws IOException {

    final String empty_anno = "";
    final UserSession participant = new UserSession(userName, userMode, userCurip, userAccId, roleId, empty_anno, this.name, session, this.pipeline);
    
    if (roleId.equals("1") || roleId.equals("2") || roleId.equals("3")) {
    	log.info("ROOM {}: adding participant {}", this.name, userName);
    	joinRoom(participant, num_guests, room_limit);
    	participants.put(participant.getName(), participant);
    } else {
    	
	//limit num of viewers hard way
    	
	if(viewers.size() < 100) {
		log.info("ROOM {}: adding viewer {}", this.name, userName);
		viewers.put(participant.getName(), participant);
		viewRoom(participant, num_guests, room_limit);
	} else {
		log.info("ROOM {}: reached limit of viewers {}", this.name, viewers.size());
	}
    }
    
    sendParticipantNamesModesCuripsAccIdsAnnos(participant);
    sendViewerNamesCurips(participant, num_guests, room_limit);
    return participant;
  }
  
  public void leave(UserSession user) throws IOException {
        
    String isViewer = "false";
    
    if (user != null) {
    	log.debug("SOMEONE {}: Leaving room {}", user.getName(), this.name);

    	for (final UserSession viewer : this.getViewers()) {
      	  if (viewer.equals(user)) {
        	isViewer = "true";
      	  }
    	}
		
	if (isViewer.equals("false")) {
		this.removeParticipant(user.getName());
	} else {
		//this.removeViewer(user.getName());
		viewers.remove(user.getName());
		final JsonObject viewerLeftJson = new JsonObject();
		viewerLeftJson.addProperty("id", "viewerLeft");
		viewerLeftJson.addProperty("name", user.getName());
		for (final UserSession participant : participants.values()) {
	  		try {
				participant.sendMessage(viewerLeftJson);
	  		} catch (final IOException e) {
				log.debug("ROOM {}: Participant {} could not be notified on viewer {} leaving room", this.name, participant, user.getName());
	  		}
		}
		for (final UserSession viewer : viewers.values()) {
	  		try {
				viewer.sendMessage(viewerLeftJson);
	  		} catch (final IOException e) {
				log.debug("ROOM {}: Viewer {} could not be notified on viewer {} leaving room", this.name, viewer, user.getName());
	  		}
		}		
	}
	
	user.close();
    }
  }

  public void make_leave_room(UserSession user, String who) throws IOException {
    if (user != null) {
	final List<String> unnotifiedParticipants = new ArrayList<>();
	final JsonObject makeLeaveJson = new JsonObject();	
    	makeLeaveJson.addProperty("id", "clearCoo");

    	for (final UserSession participant : participants.values()) {
	  try {
		if (who.equals("all")) {
			if (user.getName() != participant.getName()) participant.sendMessage(makeLeaveJson);
		} else {
			if (who.equals(participant.getName())) participant.sendMessage(makeLeaveJson);	
		}
	  } catch (final IOException e) {
		unnotifiedParticipants.add(participant.getName());
	  }
	}
// do the same for viewers, separately

    	for (final UserSession viewer : viewers.values()) {
	  try {
		if (user.getName() != viewer.getName()) viewer.sendMessage(makeLeaveJson);
	  } catch (final IOException e) {
		unnotifiedParticipants.add(viewer.getName());
	  }
	}
		
	if (!unnotifiedParticipants.isEmpty()) {
		log.debug("ROOM {}: The users {} could not be made to leave room", this.name, unnotifiedParticipants);
	}

    }
  }

  public void set_asking_mode(UserSession user) throws IOException {
    if (user != null) {
	final List<String> unnotifiedParticipants = new ArrayList<>();
	final JsonObject askGuruJson = new JsonObject();	
    	askGuruJson.addProperty("id", "askGuru");
	askGuruJson.addProperty("name", user.getName());

    	for (final UserSession participant : participants.values()) {
	  try {
		if (user.getName() != participant.getName()) participant.sendMessage(askGuruJson);
	  } catch (final IOException e) {
		unnotifiedParticipants.add(participant.getName());
	  }
	}
// do the same for viewers, separately

    	for (final UserSession viewer : viewers.values()) {
	  try {
		//if (user.getName() != viewer.getName()) 
			viewer.sendMessage(askGuruJson);
	  } catch (final IOException e) {
		unnotifiedParticipants.add(viewer.getName());
	  }
	}
		
	if (!unnotifiedParticipants.isEmpty()) {
		log.debug("ROOM {}: The users {} could not be informed on asking guru", this.name, unnotifiedParticipants);
	}

    }
  }

  public void check_conn(UserSession user) throws IOException {
  
    if (user != null) {

	final JsonObject checkConnJson = new JsonObject();	
    	checkConnJson.addProperty("id", "goodConnection");
	
	try {
		user.sendMessage(checkConnJson);
	} catch (final IOException e) {
		log.debug("ROOM {}: user {} could not be notified on good connection", this.name, user.getName());
	}
    }
  }
      
  public void notify_tableau_change(UserSession user, String side, String num) throws IOException {
    if (user != null) {
    	final List<String> unnotifiedParticipants = new ArrayList<>();
    	final JsonObject tableauChangeJson = new JsonObject();	
    	tableauChangeJson.addProperty("id", "changeTab");
	tableauChangeJson.addProperty("side", side);
    	tableauChangeJson.addProperty("num", num);
    	for (final UserSession participant : participants.values()) {
	  try {
		if (user.getName() != participant.getName()) participant.sendMessage(tableauChangeJson);
	  } catch (final IOException e) {
		unnotifiedParticipants.add(participant.getName());
	  }
	}
// do the same for viewers, separately

    	for (final UserSession viewer : viewers.values()) {
	  try {
		if (user.getName() != viewer.getName()) viewer.sendMessage(tableauChangeJson);
	  } catch (final IOException e) {
		unnotifiedParticipants.add(viewer.getName());
	  }
	}
		
	if (!unnotifiedParticipants.isEmpty()) {
		log.debug("ROOM {}: The users {} could not be notified on tableau change", this.name, unnotifiedParticipants);
	}
	
	String w = (side.equals("l")) ? "leftnum" : (side.equals("r")) ? "rightnum" : "wrongnum";
	String p = (side.equals("l")) ? "MESSI" : (side.equals("r")) ? "RONALDO" : "NONE";
	
	String[] cmdline1 = { "sh", "-c", "sed -E -i 's/(id="+w+">)..*(<\\/span>)/\\1"+num+"\\2/g' /home/nobody/vchat/target/classes/static/index.html"};
	
	Process pr1 = Runtime.getRuntime().exec(cmdline1);

	String[] cmdline2 = { "sh", "-c", "sed -E -i 's/(id="+w+">)..*(<\\/span>)/\\1"+num+"\\2/g' /home/nobody/vchat/src/main/resources/static/index.html"};
	
	Process pr2 = Runtime.getRuntime().exec(cmdline2);

	DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");  
	LocalDateTime now = LocalDateTime.now();
	
	String[] parts = user.getName().split("_");
	
	String[] copy = new String[parts.length - 1];

	for (int i = 0; i < parts.length-1; i++) {
		copy[i] = parts[i];
	}
	
	String str = String.join("_", copy);
	
	String loco = user.getCurip();

	String[] cmdline4 = { "sh", "-c", "sed -i '1s/^/"+str+" from "+loco+" voted for "+p+" at "+dtf.format(now)+"<br><br>\\n/' /var/www/html/cp/public_html/log.html"};
	
	Process pr4 = Runtime.getRuntime().exec(cmdline4);		

//	log.info("ROOM {}: running shell command {}", name, cmdline4);

    }
  }

  public void write_message_to_log(UserSession user, String mes) throws IOException {
    if (user != null) {

	DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");  
	LocalDateTime now = LocalDateTime.now();
	
	String[] parts = user.getName().split("_");
	
	String[] copy = new String[parts.length - 1];

	for (int i = 0; i < parts.length-1; i++) {
		copy[i] = parts[i];
	}
	
	String str = String.join("_", copy);
	
	String loco = user.getCurip();	

	String[] cmdline4 = { "sh", "-c", "sed -i '1s/^/"+str+" from "+loco+" wrote: <<<span class=mes>"+mes+"<\\/span>>> at "+dtf.format(now)+"<br><br>\\n/' /var/www/html/cp/public_html/log.html"};
	
	Process pr4 = Runtime.getRuntime().exec(cmdline4);		

	log.info("ROOM write_message_to_log {}: running shell command {}", name, cmdline4);
	
	final JsonObject newChatMessage = new JsonObject();	
    	newChatMessage.addProperty("id", "newChatMessage");
	
    	for (final UserSession participant : participants.values()) {
    	    	try {
            	    	if (user.getName() != participant.getName()) participant.sendMessage(newChatMessage);
          	} catch (final IOException e) {
            		log.debug("ROOM {}: participant {} could not be notified", name, participant.getName());
          	}
    	}

// do the same for viewers, separately

    	for (final UserSession viewer : viewers.values()) {
    	    	try {
    	    	    	if (user.getName() != viewer.getName()) viewer.sendMessage(newChatMessage);
    	    	    } catch (final IOException e) {
    	    	    	log.debug("ROOM {}: viewer {} could not be notified", name, viewer.getName());
    	    	}
    	}
    }
  }  

  public void set_anno_to_text(UserSession user, String anno, String who_to) throws IOException {

    if (user != null) {
    	final JsonObject setAnno = new JsonObject();
	
	final String who_from = user.getName();
	
	String[] parts = user.getName().split("_");
	String[] copy = new String[parts.length - 1];

	for (int i = 0; i < parts.length-1; i++) {
		copy[i] = parts[i];
	}
	
	final String who_f = String.join("_", copy);

	//final String who_from = user.getName();
	String userName = who_to;
	String full_anno = anno;
	
	//check to defend gurus against console attacks
	if (who_to.substring(0,Math.min(5, who_to.length())).equals("GURU:")) {userName = who_from;}
	
	if (who_from.equals(who_to) || who_from.substring(0,Math.min(5, who_to.length())).equals("GURU:") ) {} else {full_anno = who_f + ": " + anno;}
	
    	setAnno.addProperty("id", "setAnno");
	setAnno.addProperty("participant", userName);
	setAnno.addProperty("anno", full_anno);
		
   	for (final UserSession participant : participants.values()) {
	  	try {
			participant.sendMessage(setAnno);
			if (userName.equals(participant.getName())) {participant.setAnno(anno);}
	  	} catch (final IOException e) {
			log.debug("ROOM {}: could not set anno for {}", name, userName);
		}				
   	}	
// do the same for viewers, separately

    	for (final UserSession viewer : viewers.values()) {
	  	try {
			viewer.sendMessage(setAnno);
	  	} catch (final IOException e) {
			log.debug("ROOM {}: could not push new anno of {} to {}", name, userName, viewer.getName());
		}
    	}
    }
  }
  
  public void set_guru_in_mode(UserSession user, String userName, String userMode) throws IOException {
    if (user != null) {
    	final JsonObject setGuru = new JsonObject();	
    	setGuru.addProperty("id", "setGuru");
	setGuru.addProperty("mode", userMode);
		
    	if (userMode.equals("1")) {
    		for (final UserSession viewer : viewers.values()) {
	  		try {
				if (userName.equals(viewer.getName())) {viewer.sendMessage(setGuru); viewer.setRole("3");}
	  		} catch (final IOException e) {
				log.debug("ROOM {}: could not set as GURU viewer {}", name, viewer.getName());
			}				
	  	}	
	} else if (userMode.equals("0")) {
    		for (final UserSession participant : participants.values()) {
	  		try {
				if (userName.equals(participant.getName())) {participant.sendMessage(setGuru); participant.setRole("0");}
	  		} catch (final IOException e) {
				log.debug("ROOM {}: could not unset as GURU viewer {}", name, participant.getName());
			}				
	  	}	
	}
    }
  }

  public void set_cinema_in_mode(UserSession user, String userName, String userMode) throws IOException {
    if (user != null) {
    	final JsonObject setCinema = new JsonObject();

    	setCinema.addProperty("id", "setCinema");
	setCinema.addProperty("name", userName);
	setCinema.addProperty("mode", userMode);
			
    	for (final UserSession participant : participants.values()) {
	  	try {
			if (userName.equals(participant.getName())) { participant.setMode(userMode);}
			 participant.sendMessage(setCinema); 
	  	} catch (final IOException e) {
			log.debug("ROOM {}: could not inform of Cinema {}", name, participant.getName());
		}				
	}	
    	
	for (final UserSession viewer : viewers.values()) {
	  	try {
        	  	viewer.sendMessage(setCinema);
	  	} catch (final IOException e) {
        	  	log.debug("ROOM {}: viewer {} could not be informed of Cinema", name, viewer.getName());
	  	}
    	}

    }
  }
  
  private Collection<String> joinRoom(UserSession newParticipant, int ng, int rl) throws IOException {
    final JsonObject newParticipantMsg = new JsonObject();
    newParticipantMsg.addProperty("id", "newParticipantArrived");
    newParticipantMsg.addProperty("name", newParticipant.getName());
    newParticipantMsg.addProperty("mode", newParticipant.getMode());
    newParticipantMsg.addProperty("curip", newParticipant.getCurip());
    newParticipantMsg.addProperty("acc_id", newParticipant.getAccId());
    newParticipantMsg.addProperty("ng", ng);
    newParticipantMsg.addProperty("rl", rl);
//    newParticipantMsg.addProperty("role", newParticipant.getRole());
    final List<String> participantsList = new ArrayList<>(participants.values().size());
    log.debug("ROOM {}: notifying other participants of new participant {}", name,
        newParticipant.getName());

    for (final UserSession participant : participants.values()) {
      try {
        participant.sendMessage(newParticipantMsg);
      } catch (final IOException e) {
        log.debug("ROOM {}: participant {} could not be notified", name, participant.getName());
      }
      participantsList.add(participant.getName());
    }

// do the same for viewers, separately

    for (final UserSession viewer : viewers.values()) {
      try {
        viewer.sendMessage(newParticipantMsg);
      } catch (final IOException e) {
        log.debug("ROOM {}: viewer {} could not be notified", name, viewer.getName());
      }
      participantsList.add(viewer.getName());
    }
    
    return participantsList;
  }

  private void viewRoom(UserSession newViewer, int ng, int rl) throws IOException {
    final JsonObject newViewerMsg = new JsonObject();
    newViewerMsg.addProperty("id", "newViewerArrived");
    newViewerMsg.addProperty("name", newViewer.getName());
    newViewerMsg.addProperty("curip", newViewer.getCurip());
    newViewerMsg.addProperty("ng", ng);
    newViewerMsg.addProperty("rl", rl); 

    for (final UserSession participant : participants.values()) {
      try {
        participant.sendMessage(newViewerMsg);
      } catch (final IOException e) {
        log.debug("ROOM {}: participant {} could not be notified", name, participant.getName());
      }
    }

// do the same for viewers, separately

    for (final UserSession viewer : viewers.values()) {
      try {
        viewer.sendMessage(newViewerMsg);
      } catch (final IOException e) {
        log.debug("ROOM {}: viewer {} could not be notified", name, viewer.getName());
      }
    }

  }
  
  private void removeParticipant(String name) throws IOException {
    participants.remove(name);

    log.debug("ROOM {}: notifying all users that {} is leaving the room", this.name, name);

    final List<String> unnotifiedParticipants = new ArrayList<>();
    final JsonObject participantLeftJson = new JsonObject();
    participantLeftJson.addProperty("id", "participantLeft");
    participantLeftJson.addProperty("name", name);
    
    for (final UserSession participant : participants.values()) {
      try {
        participant.cancelVideoFrom(name);
        participant.sendMessage(participantLeftJson);
      } catch (final IOException e) {
        unnotifiedParticipants.add(participant.getName());
      }
    }

    for (final UserSession viewer : viewers.values()) {
      try {
        viewer.cancelVideoFrom(name);
        viewer.sendMessage(participantLeftJson);
      } catch (final IOException e) {
        unnotifiedParticipants.add(viewer.getName());
      }
    }
    
    if (!unnotifiedParticipants.isEmpty()) {
      log.debug("ROOM {}: The users {} could not be notified that {} left the room", this.name,
          unnotifiedParticipants, name);
    }

  }

  private void removeViewer(String name) throws IOException {
    
    viewers.remove(name);

    final JsonArray viewersArray = new JsonArray();
    for (final UserSession viewer : this.getViewers()) {

        final JsonElement viewerNameCurip = new JsonPrimitive(viewer.getName() + "_|_" + viewer.getCurip());
        viewersArray.add(viewerNameCurip);

    }
    
    log.debug("ROOM {}: notifying all users that viewer {} is leaving the room", this.name, name);

    final List<String> unnotifiedParticipants = new ArrayList<>();
    
    final JsonObject existingViewersMsg = new JsonObject();
    existingViewersMsg.addProperty("id", "existingViewers");
    existingViewersMsg.add("data", viewersArray);
        
    for (final UserSession participant : participants.values()) {
      try {
        participant.sendMessage(existingViewersMsg);
      } catch (final IOException e) {
        unnotifiedParticipants.add(participant.getName());
      }
    }

    for (final UserSession viewer : viewers.values()) {
      try {
        viewer.sendMessage(existingViewersMsg);
      } catch (final IOException e) {
        unnotifiedParticipants.add(viewer.getName());
      }
    }
    
    if (!unnotifiedParticipants.isEmpty()) {
      log.debug("ROOM {}: The users {} could not be notified that {} left the room", this.name,
          unnotifiedParticipants, name);
    }

  }
  
  private static String getClientIp(HttpServletRequest request) {

        String remoteAddr = "";

        if (request != null) {
            remoteAddr = request.getHeader("X-FORWARDED-FOR");
            if (remoteAddr == null || "".equals(remoteAddr)) {
                remoteAddr = request.getRemoteAddr();
            }
        }

        return remoteAddr;
  }

  public void sendParticipantNamesModesCuripsAccIdsAnnos(UserSession user) throws IOException {

    final JsonArray participantsArray = new JsonArray();
    for (final UserSession participant : this.getParticipants()) {

        final JsonElement participantNameModeCuripAccIdAnno = new JsonPrimitive(participant.getName() + "_|_" + participant.getMode() + "_|_" + participant.getCurip() + "_|_" + participant.getAccId() + "_|_" + participant.getAnno());
        participantsArray.add(participantNameModeCuripAccIdAnno);

    }

    final JsonObject existingParticipantsMsg = new JsonObject();
    existingParticipantsMsg.addProperty("id", "existingParticipants");
    existingParticipantsMsg.add("data", participantsArray);
    
    log.debug("SOMEONE {}: sending him a list of {} participants", user.getName(),
        participantsArray.size());
    user.sendMessage(existingParticipantsMsg);
  }

  public void sendViewerNamesCurips(UserSession user, int ng, int rl) throws IOException {

    final JsonArray viewersArray = new JsonArray();
    for (final UserSession viewer : this.getViewers()) {

        final JsonElement viewerNameCurip = new JsonPrimitive(viewer.getName() + "_|_" + viewer.getCurip());
        viewersArray.add(viewerNameCurip);

    }

    final JsonObject existingViewersMsg = new JsonObject();
    existingViewersMsg.addProperty("id", "existingViewers");
    existingViewersMsg.addProperty("ng", ng);
    existingViewersMsg.addProperty("rl", rl);
    existingViewersMsg.add("data", viewersArray);
    log.debug("SOMEONE {}: sending him a list of {} viewers", user.getName(),
        viewersArray.size());
    user.sendMessage(existingViewersMsg);
  }
  
  public Collection<UserSession> getParticipants() {
    return participants.values();
  }

  public Collection<UserSession> getViewers() {
    return viewers.values();
  }
  
  public UserSession getParticipant(String name) {
    return participants.get(name);
  }

  @Override
  public void close() {
    for (final UserSession user : participants.values()) {
      try {
        user.close();
      } catch (IOException e) {
        log.debug("ROOM {}: Could not invoke close on participant {}", this.name, user.getName(),
            e);
      }
    }

    participants.clear();

    pipeline.release(new Continuation<Void>() {

      @Override
      public void onSuccess(Void result) throws Exception {
        log.trace("ROOM {}: Released Pipeline", Room.this.name);
      }

      @Override
      public void onError(Throwable cause) throws Exception {
        log.warn("PARTICIPANT {}: Could not release Pipeline", Room.this.name);
      }
    });

    log.debug("Room {} closed", this.name);
  }

}
