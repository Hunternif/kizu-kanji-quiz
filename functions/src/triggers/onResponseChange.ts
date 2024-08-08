import {
  Change,
  FirestoreEvent,
  onDocumentCreated,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';

import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { tryAdvanceTurn } from '../api/turn-server-api';
import { getTurn } from '../api/turn-server-repository';
import { assertExhaustive } from '../shared/utils';

async function handleResponseUpdateOrCreate(
  event: FirestoreEvent<
    Change<QueryDocumentSnapshot> | QueryDocumentSnapshot | undefined,
    {
      lobbyID: string;
      turnID: string;
      userID: string;
    }
  >,
) {
  if (!event.data) return;
  const lobbyID = event.params.lobbyID;
  const turnID = event.params.turnID;
  const turn = await getTurn(lobbyID, turnID);
  switch (turn.phase) {
    case 'new':
      break;
    case 'answering':
    case 'reveal':
      await tryAdvanceTurn(lobbyID, turn);
      break;
    case 'complete':
      break;
    default:
      assertExhaustive(turn.phase);
  }
}

/**
 * Clean-up logic to run when a player changes their status.
 * This a function so it doesn't get called during import.
 */
export const createResponseChangeHandler = () =>
  onDocumentUpdated(
    'lobbies/{lobbyID}/turns/{turnID}/player_responses/{userID}',
    handleResponseUpdateOrCreate,
  );

/** Same as createResponseChangeHandler */
export const createResponseCreateHandler = () =>
  onDocumentCreated(
    'lobbies/{lobbyID}/turns/{turnID}/player_responses/{userID}',
    handleResponseUpdateOrCreate,
  );
