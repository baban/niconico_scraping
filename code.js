/**
 * Googleスプレッドシートの、投票結果の集計
 */
function caliculate() {
  var sheet = SpreadsheetApp.getActiveSheet();
  
  // 結果の保存
  var result = caliculateRows(sheet, {});
  var arr = hashToTable(result);
  setUrl(arr);
  // 作品名
  arr.sort(function(a,b){
    if(a[1] == b[1]) return 0;
    if(a[1] < b[1]) return -1;
    return 1;
  });
  // 作者名
  arr.sort(function(a,b){
    if(a[0] == b[0]) return 0;
    if(a[0] < b[0]) return -1;
    return 1;
  });
  // 票数
  arr.sort(function(a,b){
    if(a[2] == b[2]) return 0;
    if(a[2] < b[2]) return 1;
    return -1;
  });
  //Browser.msgBox(arr);
  saveSheet(arr,"集計結果");
}

/**
 * 投票結果をtableタグに変換
 */
function outputTableTag(){
  var sheet = SpreadsheetApp.getActiveSheet();
  var lines = '';

  for(var i = 1; true; i++){
    var range = sheet.getRange(i, 1, i, 5);
    var creatorName = range.getCell(1, 1).getValue();
    if(creatorName==""){
      break;
    }
    var line = '<td>' + range.getCell(1, 1).getValue() + '</td>';
    line += '<td>' + range.getCell(1, 3).getValue() + '</td>';
    line += '<td>' + range.getCell(1, 2).getValue() + '</td>';
    line += '<td>' + range.getCell(1, 4).getValue() + '</td>';
    var url = range.getCell(1, 5).getValue();
    var title = 'link';
    if(url.match(/www.nicovideo.jp/)){ title = 'ニコニコ'; }
    if(url.match(/www.youtube.com/)){ title = 'YouTube'; }
    if(url.match(/www.bilibili.com/)){ title = 'bilibili'; }
    line += '<td><a href="' + url + '" target="_blank">' + title + '</a></td>';
    lines += '  <tr>' + line + '</tr>\n';
  }

  var tableTag = '<table>\n' + lines + '\n</table>';
  return saveNewSheet([[tableTag]], '集計HTML');
}

/**
 * 作者別で集計
 */
function aggrigateCreator(){
  var sheet = SpreadsheetApp.getActiveSheet();

  // 結果の保存
  var result = caliculateRows(sheet, {});
  var arr = aggrigateCreatorArray(result);
  arr.sort(function(a,b){
    if(a[1] == b[1]) return 0;
    if(a[1] < b[1]) return 1;
    return -1;
  });  
  saveNewSheet(arr,"作者別ランキング");
}

/**
 * 不要な空白スペースを削除
 */
function chompCellSpace(){
  var sheet=SpreadsheetApp.getActiveSheet();
  for(var i=2; true; i++){
    var vokerName = sheet.getRange(i,2,i,3).getCell(1, 1).getValue();
    if(vokerName==""){
      return;
    }
    chompRow(sheet, i);
  }
}

/**
 * 有効投票数をカウント
 */
function aggrigateVoteSum(){
  var sheet = SpreadsheetApp.getActiveSheet();

  // 結果の保存
  var result = caliculateRows(sheet, {});

  var sum = 0;    
  for(var creatorName in result){
    var creator = result[creatorName];
    for(var workName in creator){
      if(!creator[workName]) continue;
      sum += creator[workName];
    }
  }
  
  Browser.msgBox(sum);
}

function setUrl(arr){
  var workUrl = aggregateWorkUrl();
  for(var i = 0; i < arr.length; i++) {
    var row = arr[i];
    var url = workUrl[row[1]];
    row.push(url);
  }
}

function aggregateWorkUrl() {
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSheet.getSheetByName('作品タイトル、作品URL');
  if( sheet == null ){
    return {};
  }

  var hash = {};
  for(var i = 1; true; i++){
    var workName = sheet.getRange(i, 2, i, 3).getCell(1, 1).getValue();
    var url = sheet.getRange(i, 5, i, 6).getCell(1, 1).getValue();
    if(workName == ""){
      return hash;
    }
    hash[workName] = url;
  }

  return hash;
}

/**
 * 投票人数のカウント
 */
function countVokers(){
  var sheet = SpreadsheetApp.getActiveSheet();
  var vokers = [];
  for(var i=2; true; i++){
    var vokerName = sheet.getRange(i,2,i,3).getCell(1, 1).getValue();
    if(vokerName==""){
      break;
    }
    vokers.push(vokerName);
  }
  //Browser.msgBox(vokers);
  Browser.msgBox(uniq(vokers).length);
}

function uniq(array) {
  const knownElements = {};
  const uniquedArray = [];
  for (var i = 0, maxi = array.length; i < maxi; i++) {
    if (array[i] in knownElements)
      continue;
    uniquedArray.push(array[i]);
    knownElements[array[i]] = true;
  }
  return uniquedArray;
};

function tableToString(arr){
  var s = "";
  for(var i=0; i<arr.length; i++){
    var row = arr[i];
    s += row[0] + "," + row[1] + "," + row[2] + "\n";
  }
  return s;
}

function hashToTable(result){
  var arr = [];
  for(var creatorName in result){
    var creator = result[creatorName];    
    for(var workName in creator){
      if(!creator[workName]) continue;
      
      arr.push([creatorName,workName,creator[workName]]);
    }
  }
  
  return arr;
}

function caliculateRows(sheet, result){
  for(var i=2; true; i++){
    var vokerName = sheet.getRange(i,2,i,3).getCell(1, 1).getValue();
    if(vokerName==""){
      return result;
    }
    result = caliculateRow(sheet, i, result);
  }
  return result;
}

function caliculateRow(sheet, rowNum, result){
  var cells = sheet.getRange(rowNum,2,rowNum,22);
  for(var i=0; i < 10; i+=1){
    var workName = cells.getCell(1, i*2 + 1).getValue();
    var creatorName = cells.getCell(1, i*2 + 2).getValue();
    if( workName=="" ) break;

    //Browser.msgBox(workName);
    
    if(!result[creatorName]){
      result[creatorName] = {};
    }
    if(!result[creatorName][workName]){
      result[creatorName][workName] = 0;
    }
    result[creatorName][workName] += 1;
  }

  return result;
}

function chompRow(sheet, rowNum){
  var cells = sheet.getRange(rowNum, 2, rowNum, 22);
  for(var i=0; i < 10; i+=1){
    var workName = cells.getCell(1, i*2 + 1).getValue();
    var creatorName = cells.getCell(1, i*2 + 2).getValue();
    if( workName=="" ) break;

    cells.getCell(1, i*2 + 1).setValue(workName.replace(/^(\s*)(.+?)(\s*)$/, '$2'));
    cells.getCell(1, i*2 + 2).setValue(creatorName.replace(/^(\s*)(.+?)(\s*)$/, '$2'));
    //Browser.msgBox(workName);
  }
}

function aggrigateCreatorArray(result){
  var arr = [];
  for(var creatorName in result){
    var creator = result[creatorName];
    var sum = 0;    
    for(var workName in creator){
      if(!creator[workName]) continue;
      sum += creator[workName];
    }
    arr.push([creatorName, sum]);
  }
  
  return arr;
}

function saveNewSheet(arr,sheetName){
  var spreadSeet = SpreadsheetApp.create(sheetName);
  var sheet = spreadSeet.getSheets()[0];  
  var range = sheet.getRange(1, 1, arr.length, arr[0].length);  

  for( var i=0; i < arr.length; i++ ){
    for(var j=0; j < arr[i].length; j++){
      range.getCell(i+1, j+1).setValue(arr[i][j]);
    }
  }
  //Browser.msgBox("完了");
}


function saveSheet(arr,sheetName){
  var activeSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSheet.getSheetByName(sheetName);
  
  var range = sheet.getRange(1, 1, arr.length, arr[0].length);  

  for( var i=0; i < arr.length; i++ ){
    for(var j=0; j < arr[i].length; j++){
      range.getCell(i+1, j+1).setValue(arr[i][j]);
    }
  }
  //Browser.msgBox("完了");
}
