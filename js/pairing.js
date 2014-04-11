var adapter;

// Retreving the local device adapter is asynchronous, handle this carefully.
navigator.mozBluetooth.getDefaultAdapter().success = function(evt) {
  adapter = evt.target.result;
}

function onPairing(message) {
  var reponse,
      request = message.detail,
      passkey = request.passkey;

  console.log(request);

  switch (request.method) {
    case 'confirmation':
      // Make sure the passkey is a string
      passkey = String(passkey);
      // Make sure the string is 6 characters long (pad with 0 if necessary)
      passkey = (new Array((6 - passkey.length) + 1)).join('0') + passkey;
      // Let's prompt the user
      response = confirm('Is that same number visible on the remote device screen: ' + passkey)
      // Let's send the confirmation
      adapter.setPairingConfirmation(request.address, response);
      break;

    case 'pincode':
    case 'passkey':
      break;
  }
}

adapter.onpairedstatuschanged = function (evt) {
  if (evt.status) {
    alert("The pairing operation has been successfully completed");
  } else {
    alert("The pairing operation has failed. Please, try again");
  }
}
