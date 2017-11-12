const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.lastUserLoggedInCounter = functions.database.ref('/lastUserLoggedIn')
  .onWrite(event => {
    var eventSnapshot = event.data;
    var countRef = eventSnapshot.ref.parent.child('lastUserLoggedInCount');
    return countRef.transaction((value) => {
      value = value ? (value + 1) : 1
      return value
    })
  });