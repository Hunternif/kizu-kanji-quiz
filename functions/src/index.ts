// This import is copied during build
import firebaseConfig from './firebase-config.json';

import { setGlobalOptions } from 'firebase-functions/v2/options';
import { exportCallable } from './functions/function-utils';
import { changePlayerRoleHandler } from './functions/lobby/changePlayerRole';
import { createLobbyAndJoinHandler } from './functions/lobby/createLobbyAndJoin';
import { createLobbyAsCopyHandler } from './functions/lobby/createLobbyAsCopy';
import { endLobbyHandler } from './functions/lobby/endLobby';
import { joinLobbyHandler } from './functions/lobby/joinLobby';
import { kickPlayerHandler } from './functions/lobby/kickPlayer';
import { startLobbyHandler } from './functions/lobby/startLobby';
import { updateLobbySettingsHandler } from './functions/lobby/updateLobbySettings';
import { createOnLobbyStatusChangeHandler } from './triggers/onLobbyStatusChange';
import { createOnPlayerStatusChangeHandler } from './triggers/onPlayerStatusChange';
import { createResponseChangeHandler } from './triggers/onResponseChange';
import { createOnUserPresenceChangeHandler } from './triggers/onUserPresenceChange';

setGlobalOptions({
  region: firebaseConfig.region,
});

/** Finds an existing active lobby for the user, or creates a new one,
 * and joins as player. */
export const createLobbyAndJoin = exportCallable(createLobbyAndJoinHandler);

/** Creates a new lobby by copying all settings and players from the old lobby. */
export const createLobbyAsCopy = exportCallable(createLobbyAsCopyHandler);

/**
 * Will attempt to join as player. If the lobby is already in progress,
 * will join as spectator.
 */
export const joinLobby = exportCallable(joinLobbyHandler);

/** Completes lobby setup and starts the game. */
export const startLobby = exportCallable(startLobbyHandler);

/**
 * Ends current turn and sets lobby status to "ended".
 * This needs to be a cloud function to perform additional permission checks.
 */
export const endLobby = exportCallable(endLobbyHandler);

/** Updates lobby settings. Allowed for creator and current judge. */
export const updateLobbySettings = exportCallable(updateLobbySettingsHandler);

/** Will attempt to change player role, if allowed. */
export const changePlayerRole = exportCallable(changePlayerRoleHandler);

/** Kicks player from the game. Allowed for creator and current judge. */
export const kickPlayer = exportCallable(kickPlayerHandler);

/** Clean-up logic to run when a player changes their status. */
export const onPlayerStatusChange = createOnPlayerStatusChangeHandler();

/** Logic to run after lobby status changes. */
export const onLobbyStatusChange = createOnLobbyStatusChangeHandler();

/** Monitors user presence. */
export const onUserPresenceChange = createOnUserPresenceChangeHandler();

/**
 * Monitors player responses and runs logic:
 * 1. advance turn phase.
 * 2. Logs player responses into stats (only after the 'answering' phase)
 */
export const onResponseChange = createResponseChangeHandler();
