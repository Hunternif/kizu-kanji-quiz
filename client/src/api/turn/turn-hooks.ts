import { collection, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  useCollectionData,
  useCollectionDataOnce,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import { useCollectionDataNonNull } from '../../hooks/data-hooks';
import {
  playerResponseConverter,
  turnConverter,
} from '../../shared/firestore-converters';
import { GameLobby, GameTurn } from '../../shared/types';
import { lobbiesRef } from '../lobby/lobby-repository';
import { getTurnsRef } from './turn-repository';

type LastTurnHook = [
  lastTurn: GameTurn | undefined,
  loading: boolean,
  error: any,
];

///////////////////////////////////////////////////////////////////////////////
//
//  React hooks for game Turns, when the game is in progress.
//
///////////////////////////////////////////////////////////////////////////////

/** Returns and subscribes to the current turn in the lobby. */
export function useLastTurn(lobby: GameLobby): LastTurnHook {
  // While the new turn is loading, return the previous turn:
  const [prevTurn, setPrevTurn] = useState<GameTurn | undefined>(undefined);
  const [lastTurn, loading, error] = useDocumentData(
    doc(getTurnsRef(lobby.id), lobby.current_turn_id),
  );
  if (lastTurn && prevTurn != lastTurn) {
    setPrevTurn(lastTurn);
  }
  return [lastTurn || prevTurn, loading, error];
}

/** Returns and subscribes to all turns in the lobby. */
export function useAllTurns(lobby: GameLobby) {
  return useCollectionData(
    collection(lobbiesRef, lobby.id, 'turns').withConverter(turnConverter),
  );
}

/** Returns to all turns in the lobby. */
export function useAllTurnsOnce(lobby: GameLobby) {
  return useCollectionDataOnce(
    collection(lobbiesRef, lobby.id, 'turns').withConverter(turnConverter),
  );
}

/** Returns and subscribes to current user's player response that they played
 * in the current turn in the lobby. */
export function usePlayerResponse(
  lobby: GameLobby,
  turn: GameTurn,
  userID: string,
) {
  return useDocumentData(
    doc(
      lobbiesRef,
      lobby.id,
      'turns',
      turn.id,
      'player_responses',
      userID,
    ).withConverter(playerResponseConverter),
  );
}

/** Returns and subscribes to all players responses that they played
 * in the current turn in the lobby. */
export function useAllPlayerResponses(lobby: GameLobby, turn: GameTurn) {
  return useCollectionDataNonNull(
    collection(
      lobbiesRef,
      lobby.id,
      'turns',
      turn.id,
      'player_responses',
    ).withConverter(playerResponseConverter),
  );
}

/** Returns to all players responses that they played
 * in the current turn in the lobby. */
export function useAllPlayerResponsesOnce(lobby: GameLobby, turn: GameTurn) {
  return useCollectionDataOnce(
    collection(
      lobbiesRef,
      lobby.id,
      'turns',
      turn.id,
      'player_responses',
    ).withConverter(playerResponseConverter),
  );
}

/** Runs the callback when the turn changes. */
export function useOnNewTurn(callback: () => void, turn: GameTurn) {
  const [lastTurnID, setLastTurnID] = useState(turn.id);
  useEffect(() => {
    if (lastTurnID !== turn.id) {
      setLastTurnID(turn.id);
      callback();
    }
  }, [turn.id, lastTurnID]);
}

/** Runs the callback when the turn phase changes. */
export function useOnNewTurnPhase(callback: () => void, turn: GameTurn) {
  const [lastTurnID, setLastTurnID] = useState(turn.id);
  const [lastPhase, setLastPhase] = useState(turn.phase);
  useEffect(() => {
    if (lastTurnID !== turn.id || lastPhase != turn.phase) {
      setLastTurnID(turn.id);
      setLastPhase(turn.phase);
      callback();
    }
  }, [turn.id, turn.phase, lastTurnID]);
}
