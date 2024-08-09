import {
  FConverter,
  FDocSnapshot,
  fServerTimestamp,
  FTimestamp,
} from '../firestore-adapter';
import {
  defaultLobbySettings,
  EntryStats,
  GameEntry,
  GameLobby,
  GameTurn,
  Language,
  LobbySettings,
  PlayerInLobby,
  PlayerResponse,
  QuizUser,
  TestGroup,
  UserStats,
} from './types';
import { copyFields, copyFields2, mapToObject, removeUndefined } from './utils';

export const lobbyConverter: FConverter<GameLobby> = {
  toFirestore: (lobby: GameLobby) => {
    return copyFields2(
      lobby,
      {
        time_created: lobby.time_created
          ? FTimestamp.fromDate(lobby.time_created)
          : fServerTimestamp(), // set new time when creating a new lobby
        test_groups: Array.from(lobby.test_groups),
        questions: lobby.questions.map(mapFromEntry),
        player_ids: Array.from(lobby.player_ids),
      },
      ['id', 'players', 'turns'],
    );
  },
  fromFirestore: (snapshot: FDocSnapshot) => {
    const data = snapshot.data();
    const settings: LobbySettings = data.settings
      ? mapSettings(data.settings)
      : defaultLobbySettings();
    const ret = new GameLobby(
      snapshot.id,
      data.creator_uid,
      settings,
      data.status,
    );
    ret.current_turn_id = data.current_turn_id;
    ret.time_created = (data.time_created as FTimestamp | null)?.toDate();
    ret.test_groups = new Set<TestGroup>(data.test_groups ?? []);
    ret.questions = (data.questions ?? []).map(mapToEntry);
    ret.used_question_count = data.used_question_count ?? 0;
    ret.player_ids = new Set<string>(data.player_ids ?? []);
    ret.next_lobby_id = data.next_lobby_id;
    return ret;
  },
};

function mapSettings(data: any): LobbySettings {
  return copyFields2(defaultLobbySettings(), removeUndefined(data));
}

function mapToEntry(data: any): GameEntry {
  const meanings = new Map<Language, string[]>();
  // TODO: make this type-safe:
  // See https://stackoverflow.com/questions/36836011/checking-validity-of-string-literal-union-type-at-runtime
  for (const key of Object.keys(data.meaning)) {
    meanings.set(key as Language, data.meaning[key]);
  }
  return new GameEntry(
    data.id,
    data.random_index,
    data.writing,
    data.reading_hiragana,
    data.reading_romaji,
    meanings,
  );
}
function mapFromEntry(entry: GameEntry): any {
  return copyFields2(entry, { meaning: mapToObject(entry.meaning) }, [
    'isKana',
  ]);
}

export const playerConverter: FConverter<PlayerInLobby> = {
  toFirestore: (player: PlayerInLobby) =>
    copyFields2(player, {
      time_joined: FTimestamp.fromDate(player.time_joined),
    }),
  fromFirestore: (snapshot: FDocSnapshot) => {
    const data = snapshot.data();
    const ret = new PlayerInLobby(
      data.uid,
      data.name,
      data.role,
      data.status,
      data.wins ?? 0,
    );
    ret.time_joined =
      (data.time_joined as FTimestamp | null)?.toDate() ?? new Date();
    return ret;
  },
};

export const turnConverter: FConverter<GameTurn> = {
  toFirestore: (turn: GameTurn) =>
    copyFields2(
      turn,
      {
        time_created: FTimestamp.fromDate(turn.time_created),
        phase_start_time: FTimestamp.fromDate(turn.phase_start_time),
        next_phase_time: turn.next_phase_time
          ? FTimestamp.fromDate(turn.next_phase_time)
          : undefined,
        paused_at: turn.paused_at
          ? FTimestamp.fromDate(turn.paused_at)
          : undefined,
        question: mapFromEntry(turn.question),
        choices: turn.choices?.map(mapFromEntry),
      },
      ['id', 'player_responses'],
    ),
  fromFirestore: (snapshot: FDocSnapshot) => {
    const data = snapshot.data();
    const time_created =
      (data.time_created as FTimestamp | null)?.toDate() ?? new Date();
    const ret = new GameTurn(
      snapshot.id,
      data.ordinal,
      time_created,
      data.game_mode,
      data.question_mode,
      data.answer_mode,
      mapToEntry(data.question),
      data.choices?.map(mapToEntry),
    );
    ret.setPhase(
      data.phase || 'new',
      (data.phase_start_time as FTimestamp | null)?.toDate() ?? time_created,
      data.phase_duration_ms,
    );
    ret.next_phase_time = (data.next_phase_time as FTimestamp | null)?.toDate();
    ret.pause = data.pause || 'none';
    ret.paused_at = (data.paused_at as FTimestamp | null)?.toDate();
    return ret;
  },
};

export const playerResponseConverter: FConverter<PlayerResponse> = {
  toFirestore: (pdata: PlayerResponse) =>
    copyFields2(pdata, {
      time_submitted: pdata.time_submitted
        ? FTimestamp.fromDate(pdata.time_submitted)
        : fServerTimestamp(),
      time_updated:
        pdata.time_updated && FTimestamp.fromDate(pdata.time_updated),
    }),
  fromFirestore: (snapshot: FDocSnapshot) => {
    const data = snapshot.data();
    const player_uid = snapshot.id;
    return new PlayerResponse(
      player_uid,
      data.player_name,
      (data.time_submitted as FTimestamp | null)?.toDate() ?? null,
      data.answer_entry_id,
      data.answer_typed,
      (data.time_updated as FTimestamp | undefined)?.toDate(),
      data.pause,
    );
  },
};

export const userConverter: FConverter<QuizUser> = {
  toFirestore: (user: QuizUser) => copyFields(user, ['uid']),
  fromFirestore: (snapshot: FDocSnapshot) => {
    const data = snapshot.data();
    return new QuizUser(
      snapshot.id,
      data.email,
      data.name,
      data.is_admin ?? false,
    );
  },
};

export const userStatsConverter: FConverter<UserStats> = {
  toFirestore: (user: UserStats) =>
    copyFields2(
      user,
      { data: mapToObject(user.data, (val) => copyFields(val, ['entry_id'])) },
      ['uid'],
    ),
  fromFirestore: (snapshot: FDocSnapshot) => {
    const data = snapshot.data();
    const statData = new Map<string, EntryStats>();
    for (const key of Object.keys(data.data)) {
      const val = data.data[key];
      statData.set(
        key,
        new EntryStats(
          key,
          val.reading_wins.val.reading_fails,
          val.meaning_wins,
          val.meaning_fails,
          val.writing_wins,
          val.writing_fails,
        ),
      );
    }
    const ret = new UserStats(snapshot.id);
    ret.data = statData;
    return ret;
  },
};
