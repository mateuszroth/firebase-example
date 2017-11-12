# firebase-example

[Presentation](https://docs.google.com/presentation/d/1dWTA7zekaZtwP-RxNb85IuH4cjVKFtUdp599xAhFuAI/edit?usp=sharing)

Project simply demonstrating basic Firebase features like auth, realtime database and cloud functions.

Our project is called `vd-firebase` - if you want to follow steps, replace that name to your project name.

Project overview: https://console.firebase.google.com/project/vd-firebase/overview

## step 0 - empty project
* run command `firebase init` to init Firebase project locally (choose functions and hosting)
* folders `functions` and `public` should be created
* go to https://console.firebase.google.com/u/0/ and add a new project
* run `firebase use --add` command and choose newly created project
* run `firebase serve` to serve `public` folder
* go to http://localhost:5000
* run `firebase deploy --only hosting` to deploy web app
* app is available on https://vd-firebase.firebaseapp.com

## step1 - already configured Firebase
* turn on Google accounts for authhentication here: https://console.firebase.google.com/u/0/project/vd-firebase/authentication/providers
* change `div` with id `message` to:
```
<div id="message">
  <h2 id="loginHeader">Login</h2>
  <button id="login" onclick="window.openAuthPopup()">Login with Google</button>
  <button id="logout" onclick="window.logout()" style="display: none;">Logout</button>
</div>
```
* read about Google sign in: https://firebase.google.com/docs/auth/web/google-signin
* add proper functions:
```js
function openAuthPopup() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    document.getElementById('loginHeader').innerHTML = `Logged in as ${user.displayName}`
    document.getElementById('login').setAttribute('style', 'display: none;')
    document.getElementById('logout').setAttribute('style', 'display: block;')
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
  });
}
window.openAuthPopup = openAuthPopup

function logout() {
  firebase.auth().signOut().then(function() {
    document.getElementById('loginHeader').innerHTML = `Login`
    document.getElementById('login').setAttribute('style', 'display: block;')
    document.getElementById('logout').setAttribute('style', 'display: none;')
  }).catch(function(error) {
    // An error happened.
  });
}
window.logout = logout
```
* after you log in, a new user should appear here on the list: https://console.firebase.google.com/u/0/project/vd-firebase/authentication/users

## step2 - already configured auth process
* save name of last user logged in:
```
firebase.database().ref('/lastUserLoggedIn').set(user.displayName)
```
* look at the change of database tree: https://console.firebase.google.com/u/0/project/vd-firebase/database/data
* add code which subscribes changes on `lastUserLoggedIn` location:
```js
firebase.database().ref('/lastUserLoggedIn').on('value', snapshot => {
  const value = snapshot.val()
  console.log('user logged in', value)
  document.getElementById('load').innerHTML = `Last user logged in ${value}`;
});
```
* read about REST API: https://firebase.google.com/docs/database/rest/retrieve-data
* access this value by REST API `curl 'https://vd-firebase.firebaseio.com/lastUserLoggedIn.json'`
* set database rules: https://console.firebase.google.com/u/0/project/vd-firebase/database/vd-firebase/rules
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "lastUserLoggedIn": {
      ".read": "true",
      ".write": "true"
    }
  }
}
```

## step3 - already added listening function for name of last user logged in
* check different types of cloud functions: database, https, auth, etc. https://firebase.google.com/docs/functions/auth-events
* write a function to count number of logins:
```
exports.lastUserLoggedInCounter = functions.database.ref('/lastUserLoggedIn')
  .onWrite(event => {
    var eventSnapshot = event.data;
    var countRef = eventSnapshot.ref.parent.child('lastUserLoggedInCount');
    return countRef.transaction((value) => {
      value = value ? (value + 1) : 1
      return value
    })
  });
```
* deploy function by running command `firebase deploy --only functions`
* log in as a user in the web app
* go to Firebase logs to check them: https://console.firebase.google.com/u/0/project/vd-firebase/functions/logs?search=&severity=DEBUG
* look how data in database tree changes: https://console.firebase.google.com/u/0/project/vd-firebase/database/vd-firebase/data

## step 4 - project is completed