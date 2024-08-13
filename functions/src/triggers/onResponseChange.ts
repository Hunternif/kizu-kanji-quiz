import * as logger from 'firebase-functions/logger';
import {
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';

import { pauseTurn, resumeTurn, tryAdvanceTurn } from '../api/turn-server-api';
import { getTurn } from '../api/turn-server-repository';
import { playerResponseConverter } from '../shared/firestore-converters';
import { PlayerResponse } from '../shared/types';
import { assertExhaustive } from '../shared/utils';

async function handleResponseUpdateOrCreate(
  lobbyID: string,
  turnID: string,
  userID: string,
  response: PlayerResponse,
) {
  const turn = await getTurn(lobbyID, turnID);
  // Check if pause was requested:
  switch (response.pause) {
    case 'request_pause':
      await pauseTurn(lobbyID, turn);
      break;
    case 'request_resume':
      await resumeTurn(lobbyID, turn);
      break;
    case undefined:
      break;
    default:
      assertExhaustive(response.pause);
  }
  // Check if it's time to advance turn as per timer:
  // (Pause request could have changed next phase time!)
  // Also ensure that the request is not stale:
  if (turn.phase === response.current_phase) {
    await tryAdvanceTurn(lobbyID, turn);
  } else {
    logger.info(
      `Stale request! Requested during phase ${response.current_phase}, turn phase is ${turn.phase}. Lobby ${lobbyID}`,
    );
  }
}

/**
 * Clean-up logic to run when a player changes their status.
 * This a function so it doesn't get called during import.
 */
export const createResponseChangeHandler = () =>
  onDocumentUpdated(
    'lobbies/{lobbyID}/turns/{turnID}/player_responses/{userID}',
    async (event) => {
      if (!event.data) return;
      const lobbyID = event.params.lobbyID;
      const turnID = event.params.turnID;
      const userID = event.params.userID;
      const response = playerResponseConverter.fromFirestore(event.data.after);
      await handleResponseUpdateOrCreate(lobbyID, turnID, userID, response);
    },
  );

/** Same as createResponseChangeHandler */
export const createResponseCreateHandler = () =>
  onDocumentCreated(
    'lobbies/{lobbyID}/turns/{turnID}/player_responses/{userID}',
    async (event) => {
      if (!event.data) return;
      const lobbyID = event.params.lobbyID;
      const turnID = event.params.turnID;
      const userID = event.params.userID;
      const response = playerResponseConverter.fromFirestore(event.data);
      await handleResponseUpdateOrCreate(lobbyID, turnID, userID, response);
    },
  );
