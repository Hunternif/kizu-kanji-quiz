import * as logger from 'firebase-functions/logger';

import { assertLobbyControl, assertLoggedIn } from '../../api/auth-api';
import { getLobby, updateLobby } from '../../api/lobby-server-repository';
import { LobbySettings } from '../../shared/types';
import { CallableHandler } from '../function-utils';
import { validateGameSettings } from '../../api/lobby-server-api';
import { updateCurrentTurnSettings } from '../../api/turn-server-api';

/** Updates lobby settings. Allowed for creator. */
export const updateLobbySettingsHandler: CallableHandler<
  { lobby_id: string; settings: LobbySettings },
  void
> = async (event) => {
  assertLoggedIn(event);
  const lobby = await getLobby(event.data.lobby_id);
  await assertLobbyControl(event, lobby);
  lobby.settings = event.data.settings;
  validateGameSettings(lobby);
  await updateLobby(lobby);
  // Also apply game mode and timers to the current turn:
  await updateCurrentTurnSettings(lobby);
  logger.info(`Updated settings for lobby ${lobby.id}`);
};
