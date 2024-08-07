import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { cleanUpEndedLobby } from '../api/lobby-server-api';
import { lobbyConverter } from '../shared/firestore-converters';

/**
 * Logic to run after lobby status changes.
 * This a function so it doesn't get called during import.
 */
export const createOnLobbyStatusChangeHandler = () =>
  onDocumentUpdated('lobbies/{lobbyID}', async (event) => {
    if (!event.data) return;
    const lobbyBefore = lobbyConverter.fromFirestore(event.data.before);
    const lobbyAfter = lobbyConverter.fromFirestore(event.data.after);
    if (lobbyBefore.status !== lobbyAfter.status) {
      if (lobbyAfter.status === 'ended') {
        // Cleanup after a lobby ends:
        await cleanUpEndedLobby(lobbyAfter.id);
      }
    }
  });
