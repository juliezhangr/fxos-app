var dbgcnt = 0;
function debug(message) {
  dbgcnt++;
  console.log('DEBUG:(' + dbgcnt + ') ' + message);
  //shareUI.appendTextAndScroll($('#area'), '(' + dbgcnt + ') ' + message + '\n');
}

var sender;
var fileBlob;
function startSending() {
  // Get app file
  var request = window.navigator.mozApps.getSelf();
  
  request.onsuccess = function() {
    if (request.result) {
      // Pull the name of the app out of the App object
      console.log("Name of current app: " + request.result.manifest.name);
    
      // var apps = window.navigator.getDeviceStorage('apps');
      // request = storage.get();
      // request.onsuccess = function () {
      //   var name = this.result.name;
      //   console.log('File "' + name + '" successfully retrieved from the app storage area');

      //   console.log('Sending file.');
        // fileBlob = new Blob([this.result.slice()], {type:'file'});
        fileBlob = new Blob([], {type:'file'});

      //   var res = sender.sendFile(fileBlob);

      //   res.onsuccess = function() {
      //     navigator.mozSettings.createLock().set({'bluetooth.enabled': false});
      //   }
      //   res.onerror = function() { 
      //     debug('sendFile FAILED.'); 
      //   }
      // }
      // request.onerror = function () {
      //   console.warn('Unable to get the file: ' + this.error);
      //   debug('Error: unable to get file.');
      // }
    }
  }

  // Couldn't get app data
  request.onerror = function() {
    // Display error name from the DOMError object
    console.log("Error: " + request.error.name);
  }
};

window.onload = function onload() {
  shareUI.setMessageArea('#area');
  $('#startbutton').bind('click', function(event, ui) {
    $('#buttontext').text('Sharing App');
    startSending();
  });

  if ('mozNfc' in window.navigator) {
    console.log('NFC enabled - sending file via NFC');
    sender = navigator.mozNfc;
    //navigator.mozSetMessageHandler('activity', NfcActivityHandler);

    // var data = nfcUI.getActivityData();
    // nfcUI.p2p = true;
    
    window.navigator.mozNfc.onpeerready = function(event) {
      debug('In onpeerready handler' + JSON.stringify(event.detail));
      var nfcdom = window.navigator.mozNfc;
      var nfcPeer = nfcdom.getNFCPeer(event.detail);
      
      var req = nfcPeer.sendFile(fileBlob);
      req.onsuccess = (function() {
        console.log('SEND FILE successfully');
      });
      req.onerror = (function() {
        console.log('SEND FILE FAILED');
      });
     };
  }
  // Device is only bluetooth enabled
  else if ('mozBluetooth' in window.navigator) {
    console.log('NFC disabled - sending file via Bluetooth only');
    sender = navigator.mozBluetooth;
    if (!navigator.mozBluetooth.enabled) {
      if (navigator.mozSettings) {
        console.log('Enabling bluetooth.');
        navigator.mozSettings.createLock().set({'bluetooth.enabled': true});
      }
    }

    navigator.mozSetMessageHandler("bluetooth-pairing-request", function (message) {
      // Get the information about the pairing request
      var request = message.detail;

      // Log the name of the remote device that wants to be paired with your device
      console.log(request.name);
    });

    // Send over bluetooth
    // TODO
  }
  else {
    console.warn('Unable to enable NFC or Bluetooth - file send failed.');
    debug('Error: unable to enable NFC or Bluetooth.');
  }  
};