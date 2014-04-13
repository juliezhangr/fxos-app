navigator.mozSetMessageHandler('bluetooth-opp-recieving-file-confirmation', function(message) {
      var request = message.detail;
      console.log(request);
      console.log(request.name);
});