///////////////////////////////////////////////////////////////////////////////
//
//  This file contains Firestore type definitions shared between client and
//  server functions. When building client & functions, this file will be
//  copied to their source folders.
//
///////////////////////////////////////////////////////////////////////////////

import { isKanaGroup } from './kanji-data-api';

export class GameLobby {
  /** Null only during creation. Should be UTC time. */
  public time_created?: Date;

  /** Set of players' uids, to enable lobby search. */
  public player_ids: Set<string> = new Set();
  /* Must be fetched separately from a Firebase subcollection. */
  players: Array<PlayerInLobby> = [];
  /** The last "turn" is the current state of the game board.
   * Must be fetched separately from a Firebase subcollection. */
  turns: Array<GameTurn> = [];
  /** ID of the most recent turn. */
  public current_turn_id?: string;

  /** List of test groups selected for this lobby */
  public test_groups: Set<TestGroup> = new Set();
  /** Questions remaining in the deck.
   * Should not be modified! Current question is tracked via index. */
  // TODO: move this to a separate document.
  public questions: Array<GameEntry> = [];
  /** Number of the current question. */
  public used_question_count: number = 0;

  /** ID of the next lobby, created as a copy of this lobby. */
  public next_lobby_id?: string;

  constructor(
    public id: string,
    public creator_uid: string,
    public settings: LobbySettings,
    public status: LobbyStatus = 'new',
  ) {}
}

export interface LobbySettings {
  max_players: number;
  max_questions: number;
  question_mode: QuestionMode;
  answer_mode: AnswerMode;
  num_choices: number;
  /** Answers are accepted for this number of seconds. */
  question_timer_sec: number;
  /** Answer is revealed for this number of seconds. */
  reveal_timer_sec: number;
  /** Countdown timer before the start of the first round. */
  start_countdown_sec: number;
  /** If true, players can join after the game has started. */
  allow_join_mid_game: boolean;
  /** If true, card statistics will not be updated. */
  freeze_stats: boolean;
  /** Who is allowed to change lobby settings and kick players during the game. */
  lobby_control: LobbyControl;
  /** If true, the 'reveal' phase is skipped. */
  skip_reveal: boolean;
}

export function defaultLobbySettings(): LobbySettings {
  return {
    max_players: 20,
    max_questions: 50,
    question_mode: 'kanji',
    answer_mode: 'choose_meaning',
    num_choices: 4,
    question_timer_sec: 5,
    reveal_timer_sec: 3,
    start_countdown_sec: 3,
    allow_join_mid_game: true,
    freeze_stats: false,
    lobby_control: 'players',
    skip_reveal: false,
  };
}

/** An entry that can be used as a question: a kanji, kana or word */
export class GameEntry {
  /** True for Hiragana-only and Katakana-only syllables. */
  public isKana: boolean;

  constructor(
    /** Can be the same as writing */
    public id: string,
    public random_index: number,
    /** For hiragana, this is the same as readings_hiragana[0]. */
    public writing: string,
    // TODO: multiple readings: onyomi, kunyomi, variants
    public readings_hiragana: string[],
    public readings_romaji: string[],
    /** Maps language to a list of different meanings. */
    public meanings: Map<Language, string[]>,
    /** Groups where this entry appears. */
    public groups: TestGroup[],
  ) {
    this.isKana = groups.every(isKanaGroup);
  }
}

/** What is shown on the question */
export type QuestionMode = 'kanji' | 'hiragana' | 'romaji' | 'meaning';
/** What is shown on the answers */
export type AnswerMode =
  | 'choose_kanji'
  | 'choose_hiragana'
  | 'choose_romaji'
  | 'choose_meaning'
  | 'type_romaji'
  | 'type_meaning'
  | 'draw_hiragana'
  | 'draw_kanji';
/** Meaning is rendered in this language */
export type Language = 'en'; // | 'ru';
// "anyone" includes spectators
export type LobbyControl = 'creator' | 'players' | 'anyone';

export type HiraganaGroup = 'hiragana' | 'hiragana_digraphs';
export type KatakanaGroup = 'katakana' | 'katakana_digraphs';
export type KanaGroup = HiraganaGroup | KatakanaGroup;
export type KanjiGrade =
  | 'kanji_grade_1'
  | 'kanji_grade_2'
  | 'kanji_grade_3'
  | 'kanji_grade_4'
  | 'kanji_grade_5'
  | 'kanji_grade_6'
  | 'kanji_grade_S';
export type KanjiJlptLevel =
  | 'kanji_jlpt_1'
  | 'kanji_jlpt_2'
  | 'kanji_jlpt_3'
  | 'kanji_jlpt_4'
  | 'kanji_jlpt_5';
export type KanjiGroup = KanjiGrade | KanjiJlptLevel;
export type VocabJlptGroup =
  | 'vocab_n5'
  | 'vocab_n4'
  | 'vocab_n3'
  | 'vocab_n2'
  | 'vocab_n1';

/** Combines all possible groups. */
export type TestGroup =
  | HiraganaGroup
  | KatakanaGroup
  | KanjiGrade
  | KanjiJlptLevel
  | VocabJlptGroup;

export const allQuestionModes: Array<QuestionMode> = [
  'kanji',
  'hiragana',
  'romaji',
  'meaning',
];
export const allAnswerModes: Array<AnswerMode> = [
  'choose_kanji',
  'choose_hiragana',
  'choose_romaji',
  'choose_meaning',
  'type_romaji',
  'type_meaning',
  'draw_hiragana',
  'draw_kanji',
];

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
  /** Time when it should automatically advance to the next phase.
   * In Firebase, running a timer is expensive, so we will rely on users
   * to ping the server after time has elapsed - by submitting an empty response. */
  public next_phase_time?: Date;
  /** Store the total phase duration, in case of pauses. */
  public phase_duration_ms?: number;

  public pause: PauseStatus = 'none';
  /** Time when pause was activated. Used to update remaining time. */
  public paused_at?: Date;

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
    public question_mode: QuestionMode,
    public answer_mode: AnswerMode,
    public question: GameEntry,
    /** For 'typed' answer mode choices are empty. */
    public choices?: GameEntry[],
  ) {}

  /** Sets phase, duration and calculates end time. */
  setPhase(phase: TurnPhase, startTime: Date, durationMs?: number) {
    this.phase = phase;
    this.phase_start_time = startTime;
    this.phase_duration_ms = durationMs;
    this.next_phase_time =
      durationMs !== undefined
        ? new Date(startTime.getTime() + durationMs)
        : undefined;
  }

  /** Calculates phase start time from end time and duration.
   * Useful when there are pauses in the middle. */
  getStartTime(): Date {
    if (this.next_phase_time && this.phase_duration_ms) {
      return new Date(this.next_phase_time.getTime() - this.phase_duration_ms);
    } else {
      return this.phase_start_time;
    }
  }
}

/** Player's submitted response. */
export class PlayerResponse {
  constructor(
    public player_uid: string,
    public player_name: string, // Copied from 'Players' for convenience.
    /** Current turn ID, to prevent stale requests. */
    public current_turn_id: string,
    /** Current turn phase, to prevent stale requests. */
    public current_phase: TurnPhase,
    /** Should be populated by the server! */
    public time_submitted: Date | null,
    /** Which language the player saw. */
    public language?: Language,
    /** Answer to a multiple-choice question. */
    public answer_entry_id?: string,
    public answer_typed?: string,
    /** Used to ping the server after the turn ends. */
    public time_updated?: Date,
    /** Players request certain actions via their response. */
    // TODO: maybe separate PlayerResponse and PlayerRequst into 2 docs?
    public request?: PlayerRequest,
    /** True if the player decided to skip this turn. */
    public skip?: boolean,
  ) {}
  isEmpty(): boolean {
    return this.answer_entry_id == null && this.answer_typed == null;
  }
}

export type PlayerRole = 'player' | 'spectator';

export type PlayerStatus = 'online' | 'left' | 'banned';

export type TurnPhase = 'new' | 'answering' | 'reveal' | 'complete';

export type LobbyStatus =
  | 'new'
  | 'starting'
  | 'starting_countdown' // countdown before the first turn
  | 'in_progress'
  | 'ended';
/** Could contain extra statuses for timed resume. */
export type PauseStatus = 'none' | 'paused';
export type PlayerRequest =
  | 'request_pause'
  | 'request_resume'
  | 'skip_answer'
  | 'next_turn';

/** "kick" is re-joinable, "ban" is forever. */
export type KickAction = 'kick' | 'ban';

/**
 * User data stored in the database.
 * Users should only be referenced by their UIDs.
 * Multiple users are allowed to have the same name!
 */
export class QuizUser {
  /**
   * Maps entry ID to its stats for this user.
   * Must be fetched separately from a Firebase subcollection.
   */
  stats: Map<string, EntryStats> = new Map();
  constructor(
    public uid: string,
    public email: string | null | undefined = null,
    public name: string,
    public is_admin: boolean = false,
  ) {}
}

/** Stats for an individual entry, for an individual player. */
export type EntryStats = {
  entry_id: string;
  groups: TestGroup[];
  /** Stat for guessing reading from a kanji / kana / word,
   * given a writing or meaning. */
  reading_wins?: number;
  reading_fails?: number;
  /** Stat for guessing meaning from a kanji / word,
   * given a writing or meaning. */
  meaning_wins?: number;
  meaning_fails?: number;
  /** Stat for guessing writing of a kanji / kana / word,
   * given a reading or meaning. */
  writing_wins?: number;
  writing_fails?: number;
};

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
