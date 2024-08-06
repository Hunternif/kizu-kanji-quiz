import { setGlobalOptions } from 'firebase-functions/v2/options';


// This import is copied during build
import firebaseConfig from './firebase-config.json';

setGlobalOptions({
  region: firebaseConfig.region,
});

// Function exports go here