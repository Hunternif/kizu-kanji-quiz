// This import is copied during build
import firebaseConfig from './firebase-config.json';

import { setGlobalOptions } from 'firebase-functions/v2/options';
import { createOnUserPresenceChangeHandler } from './triggers/onUserPresenceChange';

setGlobalOptions({
  region: firebaseConfig.region,
});

/** Monitors user presence. */
export const onUserPresenceChange = createOnUserPresenceChangeHandler();
