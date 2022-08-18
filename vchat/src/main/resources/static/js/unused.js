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

// i18n.js

var phones = new Map([
   ['en', '..more ROOMS! <a href="https://room-house.com" target=new>here</a>'],
   ['ru', '..больше КОМНАТ! <a href="https://room-house.com" target=new>тут</a>'],
   ['es', '..más HABITACIONES! <a href="https://room-house.com" target=new>aquí</a>'],
   ['fr', '..plus de CHAMBRES! <a href="https://room-house.com" target=new>ici</a>'],
   ['cn', '..更多房间! <a href="https://room-house.com" target=new>這裡</a>'],
   ['pt', '..mais QUARTOS! <a href="https://room-house.com" target=new>aqui</a>'],
]);

var for_por = new Map([
   ['en', 'for'],
   ['ru','за'],   
   ['es', 'por'],
   ['fr', 'pour'],
   ['cn', 'for'],
   ['pt', 'por'],
]);

var hola_ = new Map([
   ['en', 'Hello, guys!'],
   ['ru','Привет, ребята!'],   
   ['es', '¡Hola chicos!'],
   ['fr', 'Bonjour gars!'],
   ['cn', 'Hello, guys!'],
   ['pt', 'Ola pessoal!'],
]);

var new_account = new Map([
   ['en', 'Your account ID (copy/paste and hit Enter) <input type=text id=rsender style="width:210px;" value="" onkeydown="var Ucode=event.keyCode? event.keyCode : event.charCode; if (Ucode == 13) {if (this.value.length == 48 && this.value.substring(0,1) == \'5\') {setCookie(\'acc\',this.value,144000);mod6.close();$(\'sp_balance\').src=\'https://cube.room-house.com:8444/?acc=\'+this.value;leaveRoom();register();} else {this.value=\'\';this.placeholder = \'Please enter valid address\';}}"><br>Create <a href=\'https://wallet.room-house.com/#/accounts/0\' target=\'new\'>a new account</a>.'],
      ['es', 'Your account ID (copy/paste and hit Enter) <input type=text id=rsender style="width:210px;" value="" onkeydown="var Ucode=event.keyCode? event.keyCode : event.charCode; if (Ucode == 13) {if (this.value.length == 48 && this.value.substring(0,1) == \'5\') {setCookie(\'acc\',this.value,144000);mod6.close();$(\'sp_balance\').src=\'https://cube.room-house.com:8444/?acc=\'+this.value;leaveRoom();register();} else {this.value=\'\';this.placeholder = \'Please enter valid address\';}}"><br>Create <a href=\'https://wallet.room-house.com/#/accounts/0\' target=\'new\'>a new account</a>.'],
         ['pt', 'Your account ID (copy/paste and hit Enter) <input type=text id=rsender style="width:210px;" value="" onkeydown="var Ucode=event.keyCode? event.keyCode : event.charCode; if (Ucode == 13) {if (this.value.length == 48 && this.value.substring(0,1) == \'5\') {setCookie(\'acc\',this.value,144000);mod6.close();$(\'sp_balance\').src=\'https://cube.room-house.com:8444/?acc=\'+this.value;leaveRoom();register();} else {this.value=\'\';this.placeholder = \'Please enter valid address\';}}"><br>Create <a href=\'https://wallet.room-house.com/#/accounts/0\' target=\'new\'>a new account</a>.'],
	    ['fr', 'Your account ID (copy/paste and hit Enter) <input type=text id=rsender style="width:210px;" value="" onkeydown="var Ucode=event.keyCode? event.keyCode : event.charCode; if (Ucode == 13) {if (this.value.length == 48 && this.value.substring(0,1) == \'5\') {setCookie(\'acc\',this.value,144000);mod6.close();$(\'sp_balance\').src=\'https://cube.room-house.com:8444/?acc=\'+this.value;leaveRoom();register();} else {this.value=\'\';this.placeholder = \'Please enter valid address\';}}"><br>Create <a href=\'https://wallet.room-house.com/#/accounts/0\' target=\'new\'>a new account</a>.'],
	       ['cn', 'Your account ID (copy/paste and hit Enter) <input type=text id=rsender style="width:210px;" value="" onkeydown="var Ucode=event.keyCode? event.keyCode : event.charCode; if (Ucode == 13) {if (this.value.length == 48 && this.value.substring(0,1) == \'5\') {setCookie(\'acc\',this.value,144000);mod6.close();$(\'sp_balance\').src=\'https://cube.room-house.com:8444/?acc=\'+this.value;leaveRoom();register();} else {this.value=\'\';this.placeholder = \'Please enter valid address\';}}"><br>Create <a href=\'https://wallet.room-house.com/#/accounts/0\' target=\'new\'>a new account</a>.'],
	          ['ru', 'Your account ID (copy/paste and hit Enter) <input type=text id=rsender style="width:210px;" value="" onkeydown="var Ucode=event.keyCode? event.keyCode : event.charCode; if (Ucode == 13) {if (this.value.length == 48 && this.value.substring(0,1) == \'5\') {setCookie(\'acc\',this.value,144000);mod6.close();$(\'sp_balance\').src=\'https://cube.room-house.com:8444/?acc=\'+this.value;leaveRoom();register();} else {this.value=\'\';this.placeholder = \'Please enter valid address\';}}"><br>Create <a href=\'https://wallet.room-house.com/#/accounts/0\' target=\'new\'>a new account</a>.']
]);
