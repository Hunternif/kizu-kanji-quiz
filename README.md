This project relies on the backend features of Firebase that work out of the box:
- user authentication;
- data storage with real-time updates ("Firestore");
- hosting for client files.

This repo contains 3 web projects:
- `client` - client app written in TypeScript using React.js;
- `functions` - additional server logic written in TypeScript.
- `shared` - is not really a project, just a collection of files that are re-used between `client` and `functions`.

The file `package.json` in the root directory contains NPM scripts to manage all these projects.

# Project Setup

First, make sure you have installed `node.js` and `npm` (check the [offical guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)).
Also to run emulators locally, you will need to install Java 11+ (check the [oracle site](https://www.oracle.com/java/technologies/java-se-glance.html)).
Then, to set up this project, from command line, run the install script:
```sh
npm install
```

During install, files from the `shared` directory and `firebase-config.json` will be copied to `client` and `functions`, and the new copies will be ignored by Git. As the last step it will trigger Firebase setup.

### Firebase setup

Firebase requires a Firebase project, even when developing locally. To create a project, go to https://console.firebase.google.com/. The base plan is free. Add a "Web app" to your project and copy the Firebase SDK parameters to the file `firebase-config.json`, replacing example values. Then go back to command line to continue Firebase setup, and follow the prompts.

#### 1. Firebase features
To develop locally with emulators, you only need the feature `Emulators`. Otherwise, to deploy to production, you will need all these:
```
 (*) Firestore
 (*) Realtime database
 (*) Functions
 (*) Hosting (Firebase hosting)
 (*) Emulators
```

#### 2. Firebase project
The Firebase CLI tool will log in to your Google account and display your existing projects. Choose the project you created earlier.

#### 3. Firebase emulators
The following emulators must be enabled:
```
 (*) Authentication Emulator
 (*) Functions Emulator
 (*) Firestore Emulator
 (*) Database Emulator
 (*) Hosting Emulator
```

After completing the above, rebuild your projects:
```
npm run build
```

# Run locally

To run the client:
```sh
npm run dev-client
```

To run Firebase emulators:
```sh
npm run dev-server
```

Client code will hot-reload automatically as you change it. But Firebase functions must be rebuilt manually each time you change them:
```sh
npm --prefix functions run build
```

### Run Unit Tests

```sh
npm run test
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# Deploy to Production

```sh
firebase deploy
```
During deployment, `firebase-config.json` will be auto-updated to disable emulator, by setting `"useEmulator": false`.

Also note these additional values in `firebase-config.json`:

```js
{
  // Firebase SDK parameters:
  "apiKey": ...

  // "webUrl" is used to populate html headers with .../banner.jpg:
  "webUrl": "https://my-app.web.app"
  // Needed to correctly deploy Cloud Function triggers for Realtime Database:
  "databaseName": "my-app-default-rtdb",
  // "region" controls where the Firebase Cloud Functions are hosted:
  "region": "europe-west1",
  // "useEmulator" controls whether the client should connect to the local emulator or to prod:
  "useEmulator": true,
  // How many active game lobbies are allowed at the same time:
  "maxActiveLobbies": 3
}
```
