///////////////////////////////////////////////////////////////////////////////
//
//  This file contains Firestore type definitions shared between client and
//  server functions. When building client & functions, this file will be
//  copied to their source folders.
//
///////////////////////////////////////////////////////////////////////////////

export class GameLobby {
  /** Null only during creation. Should be UTC time. */
  time_created?: Date;

  /* Must be fetched separately from a Firebase subcollection. */
  players: Array<PlayerInLobby> = [];
  /** The last "turn" is the current state of the game board.
   * Must be fetched separately from a Firebase subcollection. */
  turns: Array<GameTurn> = [];
  /** ID of the most recent turn. */
  current_turn_id?: string;

  /** List of test groups selected for this lobby */
  test_groups: Set<TestGroup> = new Set();
  /** Questions remaining in the deck. */
  questions: Array<GameEntry> = [];

  /** ID of the next lobby, created as a copy of this lobby. */
  next_lobby_id?: string;

  constructor(
    public id: string,
    public creator_uid: string,
    public settings: LobbySettings,
    public status: LobbyStatus = 'new',
  ) {}
}

export interface LobbySettings {
  max_players: number;
  question_mode: QuestionMode;
  answer_mode: AnswerMode;
  num_choices: number;
  /** Answers are accepted for this number of seconds. */
  turn_seconds: number;
  /** If true, players can join after the game has started. */
  allow_join_mid_game: boolean;
  /** If true, card statistics will not be updated. */
  freeze_stats: boolean;
  /** Who is allowed to change lobby settings and kick players during the game. */
  lobby_control: LobbyControl;
}

export function defaultLobbySettings(): LobbySettings {
  return {
    max_players: 20,
    question_mode: 'kanji',
    answer_mode: 'choose_romaji',
    num_choices: 4,
    turn_seconds: 5,
    allow_join_mid_game: true,
    freeze_stats: false,
    lobby_control: 'players',
  };
}

/** An entry that can be used as a question: a kanji, kana or word */
export class GameEntry {
  constructor(
    /** Can be the same as writing */
    public id: string,
    /** For hiragana, this is the same as reading_hiragana. */
    public writing: string,
    public reading_hiragana: string,
    public reading_romaji: string,
    /** Maps language to a list of different meanings. */
    public meaning: Map<Language, string[]>,
  ) {}
}

export type QuestionMode = 'kanji' | 'hiragana' | 'romaji' | 'meaning';
export type AnswerMode =
  | 'choose_kanji'
  | 'choose_hiragana'
  | 'choose_romaji'
  | 'choose_meaning'
  | 'type_romaji'
  | 'type_meaning'
  | 'draw_kanji';
/** Meaning is rendered in this language */
export type Language = 'english'; // | 'russian';
// "anyone" includes spectators
export type LobbyControl = 'creator' | 'creator_or_czar' | 'players' | 'anyone';

export type HiraganaGroup = 'hiragana' | 'hiragana_tuples';
export type KatakanaGroup = 'katakana' | 'katakana_tuples';
export type KanjiGrade =
  | 'kanji_grade_1'
  | 'kanji_grade_2'
  | 'kanji_grade_3'
  | 'kanji_grade_4'
  | 'kanji_grade_5'
  | 'kanji_grade_6'
  | 'kanji_grade_s';
export type KanjiJlptLevel =
  | 'kanji_jlpt_1'
  | 'kanji_jlpt_2'
  | 'kanji_jlpt_3'
  | 'kanji_jlpt_4'
  | 'kanji_jlpt_5';
/** Combines all possible groups. */
export type TestGroup =
  | HiraganaGroup
  | KatakanaGroup
  | KanjiGrade
  | KanjiJlptLevel;

/** Instance of a player specific to a single game lobby. */
export class PlayerInLobby {
  /** Should be UTC */
  time_joined: Date = new Date();

  constructor(
    public uid: string,
    public name: string,
    public role: PlayerRole,
    public status: PlayerStatus,
    public wins: number,
  ) {}
}

/** One turn, containing a single question. */
export class GameTurn {
  public phase: TurnPhase = 'new';
  /** Time when the last phase bagan. */
  public phase_start_time: Date = this.time_created;

  /** Maps player UID to what cards they played in this turn.
   * Must be fetched separately from a Firebase subcollection.
   * Making this a separate collection makes it secure for players to submit
   * directly to Firestore, without a function.*/
  player_responses: Map<string, PlayerResponse> = new Map();

  constructor(
    public id: string,
    /** Turn's ordinal number: 1, 2, 3, ... */
    public ordinal: number,
    public time_created: Date,
    /** Time when it should automatically advance to the next phase.
     * In Firebase, running a timer is expensive, so we will rely on users
     * to ping the server after time has elapsed. */
    public next_phase_time: Date | null,
    public question: GameEntry,
    public question_mode: QuestionMode,
    public answer_mode: AnswerMode,
    /** For 'typed' answer mode choices are empty. */
    public choices?: GameEntry[],
  ) {}
}

/** Player's submitted response. */
export class PlayerResponse {
  constructor(
    public player_uid: string,
    public player_name: string, // Copied from 'Players' for convenience.
    /** Answer to a multiple-choice question. */
    public answer_entry_id?: string,
    public answer_typed?: string,
  ) {}
}

export type PlayerRole = 'player' | 'spectator';

export type PlayerStatus = 'online' | 'left' | 'banned';

export type TurnPhase = 'new' | 'answering' | 'reveal' | 'complete';

export type LobbyStatus = 'new' | 'in_progress' | 'ended';

/**
 * User data stored in the database.
 * Users should only be referenced by their UIDs.
 * Multiple users are allowed to have the same name!
 */
export class QuizUser {
  constructor(
    public uid: string,
    public email: string | null | undefined = null,
    public name: string,
    public is_admin: boolean = false,
  ) {}
}

/** User's stats, e.g. how many times they answered each question. */
export class UserStats {
  /** Maps entry ID to its stats for this user. */
  public data: Map<string, EntryStats> = new Map();
  constructor(public uid: string) {}
}

/** Stats for an individual entry, for an individual player. */
export class EntryStats {
  constructor(
    public entry_id: string,
    /** Stat for guessing reading from a kanji / kana / word,
     * given a writing or meaning. */
    public reading_wins?: number,
    public reading_fails?: number,
    /** Stat for guessing meaning from a kanji / word,
     * given a writing or meaning. */
    public meaning_wins?: number,
    public meaning_fails?: number,
    /** Stat for guessing writing of a kanji / kana / word,
     * given a reading or meaning. */
    public writing_wins?: number,
    public writing_fails?: number,
  ) {}
}

/** Used in Firebase RTDB to report user's online status */
export type DBPresence = {
  state: 'online' | 'offline';
  /** Server timestamp in ms */
  last_changed: number;
};
/** Used in Firebase RTDB to report user's online status.
 * This type is used for writing the change, with a placeholder for time. */
export type DBPresenceToWrite = Omit<DBPresence, 'last_changed'> & {
  last_changed: object; // placeholder for server timestamp
};
