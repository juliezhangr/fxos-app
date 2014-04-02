if ('mozNfc' in window.navigator) {
  var data = nfcUI.getActivityData();
  var nfcPeer = window.navigator.mozNfc.getNFCPeer(data.sessionToken);
  if (nfcPeer) {
    var storage = window.navigator.getDeviceStorage();
    var request = storage.get("test.txt");

    request.onsuccess =  function () {
      var name = this.result.name;
      console.log('File "' + name + '" successfully retrieved from the app storage area');
      
      var domreq = nfcPeer.sendFile(result);
      //return domreq;
    }

    request.onerror = function () {
      console.warn('Unable to get the file: ' + this.error);
      debug('Error: unable to get file.');
      //return null;
    }
  }

  //debug('Error: did not write, no connection.');
  //return null;
}
else if ('mozBluetooth' in window.navigator) {
  if (navigator.mozSettings) {
    
  }
}
else {

}

/**
 * NDEF well known types:
 */

// Text Example:
textFormToNdefRecord: function(elementRef) {
  //var text = $(elementRef + ' > .text').val();
  var text = $(elementRef).find('.text').val();
  record = nfcText.createTextNdefRecord_Utf8(text, 'en');
  return record;
}

// NFC Message Posting:
postTextFormtoNdef: function(elementRef) {
  var records = new Array();
  var record = this.textFormToNdefRecord(elementRef);
  records.push(record);
  nfcUI.postPendingMessage(records);
}


makeReadOnlyNDEF: function() {
  if (nfcUI.getConnectedState() && nfcUI.nfcTag) {
    nfcUI.appendTextAndScroll($('#area'), 'Making Tag read only.\n');
    return nfcUI.nfcTag.makeReadOnlyNDEF();
  } else {
    return null;
  }
}
