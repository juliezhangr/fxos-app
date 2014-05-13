var dbgcnt = 0;
function debug(message) {
  dbgcnt++;
  console.log('DEBUG:(' + dbgcnt + ') ' + message);
}

var apps = window.navigator.getDeviceStorage('apps');

function getAppFile(filename, callback) {
    var req = apps.get(filename);
    req.onsuccess = function() {
        callback(req.result);
    };
    req.onerror = function() {
        console.error('Failed to get app file', filename);
    };
}

function NFCSend() {
    console.log('NFC enabled - sending file via NFC');
    sender = navigator.mozNfc;
    navigator.mozSetMessageHandler('activity', NfcActivityHandler);

    getAppFile('local/webapps/' + thisApp.origin.split('app://')[1] + '/application.zip', function(fileBlob) {
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
}

function BTSendApp(thisApp) {
    var origin = thisApp.origin.split('app://')[1];
    var manifestOrigin = thisApp.manifestURL.split('app://')[1];

    getAppFile('local/webapps/' + manifestOrigin, function(file) {
        var blobs = [file];
        var names = [file.name]
        console.log('File "' + name + '" successfully retrieved from the app storage area');
        getAppFile('local/webapps/' + origin + '/application.zip', function(file2) {
            blobs.push(file2);
            names.push(file2.name);
            console.log('File "' + file2.name + '" successfully retrieved from the app storage area');

            var a = new MozActivity({
                name: 'share',
                data: {
                    number: blobs.length,
                    blobs: blobs,
                    filenames: names,
                    filepaths: names
                }
            });
            a.onsuccess = function() {
                console.log("share activity success")
            };

            a.onerror = function(e) {
                console.warn('share activity error:', a.error.name);
            };
    });

    });

}

function BTSend() {
    
  var request = window.navigator.mozApps.getSelf();
  
  request.onsuccess = function() {
    if (request.result) {
      // Pull the origin of the app out of the App object
      var thisApp = request.result;
      console.log('Name of current app: ' + thisApp.manifest.name);
      console.log('App origin: ' + thisApp.origin);
      console.log(thisApp);
      BTSendApp(thisApp);
    }
  }

  // Couldn't get app data
  request.onerror = function() {
    // Display error name from the DOMError object
    console.warn("Error: " + request.error.name);
  }

}

window.onload = function onload() {
  $('#startbutton').bind('click', function(event, ui) {
    $('#buttontext').text('Sharing App');
    if ('mozNfc' in window.navigator) {
        NFCSend();
    }
    else if ('mozBluetooth' in window.navigator) {
        BTSend();
    }
    else {
        console.warn('Unable to enable NFC or Bluetooth - file send failed.');
        debug('Error: unable to enable NFC or Bluetooth.');
    }  
  });
};