import { ReactNode, useState } from 'react';
import { useDelay } from '../../../components/Delay';
import {
  NumberInput,
  SelectInput,
  ToggleInput,
} from '../../../components/FormControls';
import {
  IconChevronDownInline,
  IconQuestionInline,
} from '../../../components/Icons';
import { Modal, ModalBody } from '../../../components/Modal';
import { Warning } from '../../../components/Warning';
import {
  getValidAnswerModes,
  getValidQuestionModes,
} from '../../../shared/mode-utils';
import { AnswerMode, LobbySettings, QuestionMode } from '../../../shared/types';
import { AnswerModeHelp, QuestionModeHelp } from './Help';

interface Props {
  settings: LobbySettings;
  readOnly?: boolean;
  /** During a game some settings no longer take effect, and are disabled. */
  inGame?: boolean;
  /** Called after any setting is changed */
  onChange?: (settings: LobbySettings) => Promise<void>;
}

export function LobbySettingsPanel(props: Props) {
  // Delay header class to prevent background flickering bug in Chrome :(
  const headerClass = useDelay('lobby-settings', 1000) ?? '';
  const isInvalidMode =
    getValidQuestionModes(props.settings.answer_mode).indexOf(
      props.settings.question_mode,
    ) === -1;
  return (
    <div className="lobby-settings-container">
      <header className={headerClass}>
        <h3>Game Settings</h3>
      </header>
      <div className="lobby-settings-form">
        {isInvalidMode && <Warning>Question and Answer are the same</Warning>}
        <FormItem
          label="Question mode"
          modalHint
          hint={<QuestionModeHelp />}
          control={<QuestionModeControl {...props} />}
        />
        <FormItem
          label="Answer mode"
          modalHint
          hint={<AnswerModeHelp />}
          control={<AnswerModeControl {...props} />}
        />
        <FormItem
          label="Max questions"
          hint="Game will end after this many questions. 0 to disable."
          control={<MaxQuestionsControl {...props} />}
        />
        <FormItem
          label="Choices"
          hint="Number of answers for a multiple-choice question."
          control={<ChoicesControl {...props} />}
        />
        <FormItem
          label="Question timer [sec]"
          hint="Next question starts after this amount of time (in seconds). 0 to disable."
          control={<QuestionTimerControl {...props} />}
        />
        <FormItem
          label="Reveal timer [sec]"
          hint="Answer is revealed for this amount of time (in seconds). 0 to disable."
          control={<RevealTimerControl {...props} />}
        />
        <FormItem
          label="Skip reveal"
          hint="Will jump straight to the next question without showing the correct answer."
          control={<SkipRevealControl {...props} />}
        />
        <FormItem
          label="Countdown [sec]"
          hint="Countdown before the first turn (in seconds). 0 to disable."
          control={<StartCountdownTimerControl {...props} />}
        />
        <FormItem
          label="Allow join mid-game"
          hint="If a new person joins after the game has started, they will automatically become a player."
          control={<AllowJoinMidGameControl {...props} />}
        />
        <FormItem
          label="Who controls lobby"
          hint="Players with this power can change game settings, kick players, and end the game."
          control={<LobbyControlControl {...props} />}
        />
        <FormItem
          label="Freeze stats"
          hint="Statistics will not be updated during this game. Use this for test games."
          control={<FreezeStatsControl {...props} />}
        />
        <FormItem
          label="Maximum players"
          hint="When this number is reached, other players can only spectate."
          control={<MaxPlayersControl {...props} />}
        />
      </div>
    </div>
  );
}

function MaxPlayersControl({ settings, readOnly, onChange }: Props) {
  return (
    <NumberInput
      debounce
      min={2}
      max={99}
      disabled={readOnly}
      value={settings.max_players}
      onChange={async (newValue) => {
        settings.max_players = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function MaxQuestionsControl({ settings, readOnly, onChange }: Props) {
  return (
    <NumberInput
      debounce
      min={0}
      max={9999}
      disabled={readOnly}
      value={settings.max_questions}
      onChange={async (newValue) => {
        settings.max_questions = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function QuestionModeControl({ settings, readOnly, onChange }: Props) {
  const options: Array<[QuestionMode, string]> = [
    ['kanji', '漢字'],
    ['meaning', 'Meaning'],
    ['hiragana', 'ひらがな'],
    ['romaji', 'Romaji'],
  ];
  const validModes = getValidQuestionModes(settings.answer_mode);
  return (
    <SelectInput
      disabled={readOnly}
      invalid={validModes.indexOf(settings.question_mode) == -1}
      value={settings.question_mode}
      onChange={async (newValue) => {
        settings.question_mode = newValue;
        if (onChange) await onChange(settings);
      }}
      options={options}
    />
  );
}

function AnswerModeControl({ settings, readOnly, onChange }: Props) {
  const options: Array<[AnswerMode, string]> = [
    ['choose_kanji', 'Choose kanji'],
    ['choose_meaning', 'Choose meaning'],
    ['type_meaning', 'Type meaning'],
    // ['draw_kanji', 'Draw kanji'], // not supported yet
    ['choose_hiragana', 'Choose hiragana'],
    // ['draw_hiragana', 'Draw hiragana'], // not supported yet
    ['choose_romaji', 'Choose romaji'],
    ['type_romaji', 'Type romaji'],
  ];
  const validModes = getValidAnswerModes(settings.question_mode);
  return (
    <SelectInput
      disabled={readOnly}
      invalid={validModes.indexOf(settings.answer_mode) == -1}
      value={settings.answer_mode}
      onChange={async (newValue) => {
        settings.answer_mode = newValue;
        if (onChange) await onChange(settings);
      }}
      options={options}
    />
  );
}

function ChoicesControl({ settings, readOnly, onChange }: Props) {
  return (
    <NumberInput
      debounce
      min={2}
      max={2000}
      disabled={readOnly}
      value={settings.num_choices}
      onChange={async (newValue) => {
        settings.num_choices = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function QuestionTimerControl({ settings, readOnly, onChange }: Props) {
  return (
    <NumberInput
      debounce
      min={0.0}
      max={99.0}
      step={0.5}
      disabled={readOnly}
      value={settings.question_timer_sec}
      onChange={async (newValue) => {
        settings.question_timer_sec = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function RevealTimerControl({ settings, readOnly, onChange }: Props) {
  return (
    <NumberInput
      debounce
      min={0.0}
      max={99.0}
      step={0.5}
      disabled={readOnly}
      value={settings.reveal_timer_sec}
      onChange={async (newValue) => {
        settings.reveal_timer_sec = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function StartCountdownTimerControl({ settings, readOnly, onChange }: Props) {
  return (
    <NumberInput
      debounce
      min={0.0}
      max={99.0}
      step={1}
      disabled={readOnly}
      value={settings.start_countdown_sec}
      onChange={async (newValue) => {
        settings.start_countdown_sec = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function AllowJoinMidGameControl({ settings, readOnly, onChange }: Props) {
  return (
    <ToggleInput
      disabled={readOnly}
      value={settings.allow_join_mid_game}
      onChange={async (newValue) => {
        settings.allow_join_mid_game = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function LobbyControlControl({ settings, readOnly, onChange }: Props) {
  return (
    <SelectInput
      disabled={readOnly}
      value={settings.lobby_control}
      onChange={async (newValue) => {
        settings.lobby_control = newValue;
        if (onChange) await onChange(settings);
      }}
      options={[
        ['creator', 'Only creator'],
        ['players', 'Players'],
        ['anyone', 'Anyone (spectators)'],
      ]}
    />
  );
}

function SkipRevealControl({ settings, readOnly, onChange }: Props) {
  return (
    <ToggleInput
      disabled={readOnly}
      value={settings.skip_reveal}
      onChange={async (newValue) => {
        settings.skip_reveal = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

function FreezeStatsControl({ settings, readOnly, onChange }: Props) {
  return (
    <ToggleInput
      disabled={readOnly}
      value={settings.freeze_stats}
      onChange={async (newValue) => {
        settings.freeze_stats = newValue;
        if (onChange) await onChange(settings);
      }}
    />
  );
}

interface ItemProps {
  label: string;
  hint?: ReactNode;
  control: ReactNode;
  disabled?: boolean;
  /** If true, will use a popup instead. */
  modalHint?: boolean;
}

function FormItem({
  label,
  hint,
  control,
  disabled,
  modalHint: modal,
}: ItemProps) {
  const disabledClass = disabled ? 'disabled' : '';
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`lobby-settings-form-item ${disabledClass}`}>
      <Modal
        show={showHint && modal === true}
        onHide={() => setShowHint(false)}
      >
        <ModalBody scroll longFormat>
          {hint}
        </ModalBody>
      </Modal>
      <div className="label-container">
        <div className="label">
          {label}
          {hint && (
            <span
              className="hint-icon"
              title={showHint ? 'Hide help' : 'Show help'}
              onClick={() => setShowHint(!showHint)}
            >
              {showHint ? <IconChevronDownInline /> : <IconQuestionInline />}
            </span>
          )}
        </div>
        {showHint && !modal && <div className="hint">{hint}</div>}
      </div>
      {control}
    </div>
  );
}
