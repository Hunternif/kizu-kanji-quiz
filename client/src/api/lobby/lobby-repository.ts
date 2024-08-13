import {
  Query,
  Transaction,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { firestore } from '../../firebase';
import {
  lobbyConverter,
  playerConverter,
} from '../../shared/firestore-converters';
import {
  GameLobby,
  PlayerInLobby,
  PlayerRole,
  PlayerStatus,
} from '../../shared/types';

///////////////////////////////////////////////////////////////////////////////
//
//  This module containts methods to read and write lobby data in Firestore.
//  For now it's too inconvenient to make it a "real" Repository class...
//
///////////////////////////////////////////////////////////////////////////////

export const lobbiesRef = collection(firestore, 'lobbies').withConverter(
  lobbyConverter,
);

/** Firestore ref to lobby. */
export function getLobbyRef(lobbyID: string) {
  return doc(lobbiesRef, lobbyID);
}

/** Firestore ref to the list of players. */
export function getPlayersRef(lobbyID: string) {
  return collection(firestore, `lobbies/${lobbyID}/players`).withConverter(
    playerConverter,
  );
}

/** Firestore ref to the list of players. */
export function getPlayerRef(lobbyID: string, userID: string) {
  return doc(getPlayersRef(lobbyID), userID);
}

export async function getLobby(
  lobbyID: string,
  transaction?: Transaction,
): Promise<GameLobby> {
  const ref = getLobbyRef(lobbyID);
  let lobby: GameLobby | undefined;
  if (transaction) {
    lobby = (await transaction.get(ref)).data();
  } else {
    lobby = (await getDoc(ref)).data();
  }
  if (!lobby) throw new Error(`Lobby not found: ${lobbyID}`);
  return lobby;
}

export async function updateLobby(
  lobby: GameLobby,
  transaction?: Transaction,
): Promise<void> {
  const ref = getLobbyRef(lobby.id);
  const data = lobbyConverter.toFirestore(lobby);
  if (transaction) {
    transaction.update(ref, data);
  } else {
    await updateDoc(ref, data);
  }
}

/** Updates player data in lobby in Firestore. */
export async function updatePlayer(
  lobbyID: string,
  player: PlayerInLobby,
  transaction?: Transaction,
) {
  const ref = doc(getPlayersRef(lobbyID), player.uid);
  const data = playerConverter.toFirestore(player);
  if (transaction) {
    transaction.update(ref, data);
  } else {
    await updateDoc(ref, data);
  }
}

/** Find player in this lobby. */
export async function getPlayer(
  lobbyID: string,
  userID: string,
): Promise<PlayerInLobby | null> {
  return (await getDoc(doc(getPlayersRef(lobbyID), userID))).data() ?? null;
}

/** Find player in this lobby or throws. */
export async function getPlayerThrows(
  lobbyID: string,
  userID: string,
): Promise<PlayerInLobby> {
  const player = await getPlayer(lobbyID, userID);
  if (!player) {
    throw new Error(`Player data not found for user ${userID}`);
  }
  return player;
}

/** Returns all players in this lobby, by role. */
export async function getPlayers(
  lobbyID: string,
  role?: PlayerRole,
): Promise<Array<PlayerInLobby>> {
  if (!role) {
    // Fetch all players
    return (await getDocs(getPlayersRef(lobbyID))).docs.map((p) => p.data());
  } else {
    return (
      await getDocs(query(getPlayersRef(lobbyID), where('role', '==', role)))
    ).docs.map((p) => p.data());
  }
}

/** Counts players in this lobby with this role. */
export async function countPlayers(
  lobbyID: string,
  role?: PlayerRole,
  status?: PlayerStatus,
): Promise<number> {
  let fsQuery: Query = query(getPlayersRef(lobbyID));
  if (role) {
    fsQuery = query(fsQuery, where('role', '==', role));
  }
  if (status) {
    fsQuery = query(fsQuery, where('status', '==', status));
  }
  return (await getCountFromServer(fsQuery)).data().count;
}

/** Get active "online" players, usable for game functions. */
export async function getOnlinePlayers(
  lobbyID: string,
): Promise<Array<PlayerInLobby>> {
  return (await getPlayers(lobbyID)).filter(
    (p) => p.role === 'player' && p.status === 'online',
  );
}

/** Returns a list of lobby IDs where this user is a player. */
export async function findPlayerLobbies(userID: string): Promise<string[]> {
  return (
    await getDocs(
      query(
        lobbiesRef,
        where('status', '!=', 'ended'),
        where('player_ids', 'array-contains', userID),
      ),
    )
  ).docs.map((d) => d.id);
}
