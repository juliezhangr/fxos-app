var dbgcnt = 0;
function debug(message) {
  dbgcnt++;
  console.log('DEBUG:(' + dbgcnt + ') ' + message);
}

var sender;
var fileBlob;
function startSending() {
  // Get app file
  var request = window.navigator.mozApps.getSelf();
  
  request.onsuccess = function() {
    if (request.result) {
      // Pull the origin of the app out of the App object
      var thisApp = request.result;
      console.log('Name of current app: ' + thisApp.manifest.name);
      console.log('App origin: ' + thisApp.origin);
      
      var origin = thisApp.origin.split('app://')[1];
      var manifestOrigin = thisApp.manifestURL.split('app://')[1];
      
      // 'apps' storage is the /data/ folder
      var apps = window.navigator.getDeviceStorage('apps');
      var manifestReq = apps.get('local/webapps/' + manifestOrigin);
      
      manifestReq.onsuccess = function () {
        if (this.result) {
          var file = this.result;
          alert('Retrieved manifest!');

          var name = file.name;
          console.log('File "' + name + '" successfully retrieved from the app storage area');

          console.log('Sending file.');
          fileBlob = new Blob([file.slice()], {type:''});

          startDiscovery();

          // fileBlob = new Blob([], {type:''});
      
          // var sending = sender.sendFile(fileBlob);

      //   sending.onsuccess = function() {
      //     navigator.mozSettings.createLock().set({'bluetooth.enabled': false});
      //   }
      //   sending.onerror = function() { 
      //     debug('sendFile FAILED.'); 
      //   }
        }
      }
      manifestReq.onerror = function () {
        console.warn('Unable to get the file: ' + this.error);
        debug('Error: unable to get file.');
      }

      var zipReq = apps.get('local/webapps/' + origin + '/application.zip');
      zipReq.onsuccess = function () {
        if (this.result) {
          var file = this.result;
          var name = file.name;
          console.log('File "' + name + '" successfully retrieved from the app storage area');
        
        }
      }

      zipReq.onerror = function () {
        console.warn('Unable to get the file: ' + this.error);
        debug('Error: unable to get file.');
      }
    }
  }

  // Couldn't get app data
  request.onerror = function() {
    // Display error name from the DOMError object
    console.warn("Error: " + request.error.name);
  }
};

function startDiscovery () {
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
    var bluetooth = window.navigator.mozBluetooth;
    var settings = window.navigator.mozSettings;
    if (!settings || !bluetooth) {
      console.warn('BT Setup failed.');
      return;
    }

    if (!bluetooth.enabled) {
      console.log('Enabling bluetooth.');
      settings.createLock().set({'bluetooth.enabled': true});
    }

    navigator.mozSetMessageHandler('bluetooth-opp-recieving-file-confirmation', function(message) {
      var request = message.detail;
      console.log(request);
      console.log(request.name);
    })

    var adapter;
    var btreq = bluetooth.getDefaultAdapter();
    btreq.onsuccess = function() {
      adapter = this.result;
      var pairedreq = adapter.getPairedDevices();
      pairedreq.onsuccess = function () {
        var btpeers = this.result;
        console.log(btpeers);
        // TODO: figure out how to pull up list of paired peers, hardcoded for now yay
        var sendreq = adapter.sendFile(btpeers[0].address, fileBlob);
        sendreq.onsuccess = function() {
          alert('sucessss!');
        }
        sendreq.onerror = function() {
          console.warn(this.error.name);
        }
      }
    }

    btreq.onerror = function() {
      console.warn(btreq.error.name);
      console.warn('Getting adapter failed.');
    }
    
  }
  else {
    console.warn('Unable to enable NFC or Bluetooth - file send failed.');
    debug('Error: unable to enable NFC or Bluetooth.');
  }  
};


window.onload = function onload() {
  //shareUI.setMessageArea('#area');
  $('#startbutton').bind('click', function(event, ui) {
    $('#buttontext').text('Sharing App');
    startSending();
  });

  $('#devicelistbutton').bind('click', function(event, ui) {
    startDiscovery();
  });
};
