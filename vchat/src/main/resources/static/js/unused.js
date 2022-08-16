//Room.java
  private void viewRoom_old() throws IOException {
    
    final JsonArray viewersArray = new JsonArray();
    for (final UserSession viewer : this.getViewers()) {

        final JsonElement viewerNameCurip = new JsonPrimitive(viewer.getName() + "_|_" + viewer.getCurip());
        viewersArray.add(viewerNameCurip);

    }
    
    log.debug("ROOM {}: notifying all users that viewer {} is viewing the room", this.name, name);

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
      log.debug("ROOM {}: The users {} could not be notified that {} is viewing the room", this.name,
          unnotifiedParticipants, name);
    }

  }
