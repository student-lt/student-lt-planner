function myFunction(e){
  //初期設定
  var itemResponses = e.response.getItemResponses();
  var message = '';
  
  //入力項目の解析
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var answer = itemResponse.getResponse();
   
    if(question=="勉強会名"){
      var cTitle=answer;
    }else if(question=="概要"){
      message=answer;
    }else if(question=="日程"){
      var cDate=answer.replace(/-/g,'/');
      var cEDate=cDate;
    }else if(question=="開始時刻"){
      var cDate=cDate + " " + answer;
    }else if(question=="終了時刻"){
      var cEDate=cEDate + " " + answer;
    }else if(question=="主催者TwitterID"){
      message += "\n\n主催者Twitter: " + answer
    }else if(question=="場所 (clsuter.の場合はルームURLも)"){
      message += "\n\n場所: " + answer
    }
  }
  
  //スプレッドシート生成
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var spreadsheetId = spreadsheet.getId();
  var file = DriveApp.getFileById(spreadsheetId);
  var copyFile = file.makeCopy("「" + cTitle + "」に出席する " + new Date().getTime());
  
  // スプレッドシートにpublic権限付与
  copyFile.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT)
  var url = copyFile.getUrl();
  
  // スプレッドシートのURLをカレンダーの詳細に追加
  message += "\n\n出席する: " + url
  
  //Googleカレンダーへの投稿
  var calenderId = PropertiesService.getScriptProperties().getProperty('CALENDER_ID');
  var objCalendar = CalendarApp.getCalendarById(calenderId);
  var objEvent = objCalendar.createEvent(cTitle,new Date(cDate),new Date(cEDate),{description:message}).setGuestsCanSeeGuests(false);
  
  // Discordへ通知
  var webHookURL = PropertiesService.getScriptProperties().getProperty('DISCORD_URL');
  var payload = {
    "content": cDate + " 開催の「" + cTitle + "」が企画されました！！\n\n" + message
  }
  var options = {
    "muteHttpExceptions" : true,
    "method" : "POST",
    "payload": payload
  }
  
  var response = UrlFetchApp.fetch(webHookURL, options);
  var responseCode = response.getResponseCode();
  var responseBody = response.getContentText();

  if (responseCode === 200) {
    var responseJson = JSON.parse(responseBody);
  } else {
    Logger.log(Utilities.formatString("Request failed. Expected 200, got %d: %s", responseCode, responseBody));
  }  
}

