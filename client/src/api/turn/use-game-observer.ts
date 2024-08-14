import { collection, onSnapshot, QuerySnapshot } from 'firebase/firestore';
import { useEffect } from 'react';
import { useErrorContext } from '../../components/ErrorContext';
import { playerResponseConverter } from '../../shared/firestore-converters';
import {
  GameLobby,
  GameTurn,
  PlayerResponse,
  QuizUser,
} from '../../shared/types';
import { assertExhaustive } from '../../shared/utils';
import { lobbiesRef } from '../lobby/lobby-repository';
import { pauseTurn, resumeTurn, tryAdvanceTurn } from './turn-control-api';
import { getTurn } from './turn-repository';

/**
 * Monitors player responses and runs logic:
 * 1. advance turn phase.
 * 2. Logs player responses into stats (only after the 'answering' phase)
 *
 * (Previously this was done via Cloud function trigger)
 */
export function useGameObserver(
  lobby: GameLobby,
  turn: GameTurn,
  quizUser: QuizUser,
) {
  const { setError } = useErrorContext();
  useEffect(() => {
    // Only do this for lobby creator:
    if (lobby.creator_uid !== quizUser.uid) return;

    return onSnapshot(
      collection(
        lobbiesRef,
        lobby.id,
        'turns',
        turn.id,
        'player_responses',
      ).withConverter(playerResponseConverter),
      onResponsesChange,
    );

    async function onResponsesChange(snap: QuerySnapshot<PlayerResponse>) {
      // The first time this gets called, the snapshot will contain
      // all the current data. There is no way to skip this :(
      // https://stackoverflow.com/a/69031778/1093712

      let shouldPause = false;
      let shouldResume = false;
      let shouldSkip = false;
      for (const change of snap.docChanges()) {
        if (change.type === 'added' || change.type === 'modified') {
          // Check if pause was requested:
          const response = change.doc.data();
          switch (response.request) {
            case 'request_pause':
              shouldPause = true;
              break;
            case 'request_resume':
              shouldResume = true;
              break;
            case 'skip_answer':
            case 'next_turn':
              shouldSkip = true;
              break;
            case undefined:
              break;
            default:
              assertExhaustive(response.request);
          }
        }
      }
      try {
        const updatedTurn = await getTurn(lobby.id, turn.id);

        // Ensure the responses are not stale:
        const responses = snap.docs.map((d) => d.data());
        const isStale = responses.every(
          (r) =>
            r.current_phase !== updatedTurn.phase ||
            r.current_turn_id !== updatedTurn.id,
        );

        if (shouldPause) {
          await pauseTurn(lobby.id, updatedTurn);
        } else if (shouldResume) {
          await resumeTurn(lobby.id, updatedTurn);
        } else if (!isStale) {
          // Check if it's time to advance turn as per timer:
          // Pass in updated responses, because they may not
          // have been written to the database.
          await tryAdvanceTurn(lobby, updatedTurn, responses);
        }
      } catch (e: any) {
        setError(e);
      }
    }
  }, [lobby, turn.id, quizUser.uid]);
}
