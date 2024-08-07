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
import { LobbySettings } from '../../../shared/types';

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
  return (
    <div className="lobby-settings-container">
      <header className={headerClass}>
        <h3>Game Settings</h3>
      </header>
      <div className="lobby-settings-form">
        <FormItem
          label="Maximum players"
          hint="When this number is reached, other players can only spectate."
          control={<MaxPlayersControl {...props} />}
        />
        <FormItem
          label="Choices"
          hint="Number of answers for a multiple-choice question."
          control={<ChoicesControl {...props} />}
        />
        <FormItem
          label="Next question after [sec]"
          hint="Next question starts after this amount of time (in seconds). 0 to disable."
          control={<QuestionTimerControl {...props} />}
        />
        <FormItem
          label="Allow join mid-game"
          hint="If a new person joins after the game has started, they will automatically become a player and will receive cards."
          control={<AllowJoinMidGameControl {...props} />}
        />
        <FormItem
          label="Who controls lobby"
          hint="Players with this power can change game settings, kick players, and end the game."
          control={<LobbyControlControl {...props} />}
        />
        <FormItem
          label="Freeze card stats"
          hint="Card statistics will not be updated during this game. Use this for test games."
          control={<FreezeStatsControl {...props} />}
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
}

function FormItem({ label, hint, control, disabled }: ItemProps) {
  const disabledClass = disabled ? 'disabled' : '';
  const [showHint, setShowHint] = useState(false);
  return (
    <div className={`lobby-settings-form-item ${disabledClass}`}>
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
        {showHint && <div className="hint">{hint}</div>}
      </div>
      {control}
    </div>
  );
}
