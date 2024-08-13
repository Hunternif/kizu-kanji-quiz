import { User } from 'firebase/auth';
import { updateLobby } from '../../../api/lobby/lobby-repository';
import { useHandler2 } from '../../../hooks/data-hooks';
import {
  kanaGroupNames,
  kanjiGradeGroupNames,
  kanjiJlptGroupNames,
  vocabJlptGroupNames,
} from '../../../shared/kanji-data-api';
import { GameLobby, TestGroup } from '../../../shared/types';

interface SelectorProps {
  user: User;
  lobby: GameLobby;
  readOnly?: boolean;
}

export function TestGroupSelector({ lobby, readOnly }: SelectorProps) {
  const [toggleHandler] = useHandler2(
    async (value: TestGroup, selected: boolean) => {
      if (selected) lobby.test_groups.add(value);
      else lobby.test_groups.delete(value);
      await updateLobby(lobby);
    },
    [lobby],
  );
  return (
    <div className="test-group-selector">
      <GroupSection
        big
        title="Hiragana & Katakana"
        lobby={lobby}
        groups={kanaGroupNames}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        big
        title="Kanji: Japanese Language Proficiency Test"
        lobby={lobby}
        groups={kanjiJlptGroupNames}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        title="Kanji: Primary school"
        lobby={lobby}
        groups={kanjiGradeGroupNames}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        title="Vocabulary: Japanese Langyage Proficiency Test"
        lobby={lobby}
        groups={vocabJlptGroupNames}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  groups: Array<[value: TestGroup, label: string, sublabel: string]>;
  lobby: GameLobby;
  big?: boolean; // Makes the label big
  readOnly?: boolean;
  onToggle?: (value: TestGroup, selected: boolean) => void;
}
function GroupSection({
  title,
  groups,
  lobby,
  big,
  readOnly,
  onToggle,
  ...props
}: SectionProps) {
  return (
    <div className="group-section">
      <div className="group-section-title">{title}</div>
      <div className="group-container" {...props}>
        {groups.map(([value, label, sub]) => (
          <Group
            key={value}
            value={value}
            label={label}
            big={big}
            sublabel={sub}
            selected={lobby.test_groups.has(value)}
            onToggle={onToggle}
            readonly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

interface GroupProps {
  value: TestGroup;
  label: string;
  big?: boolean;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  onToggle?: (value: TestGroup, selected: boolean) => void;
}
function Group({
  value,
  label,
  big,
  sublabel,
  selected,
  disabled,
  readonly,
  onToggle,
}: GroupProps) {
  const classes = ['group-button'];
  if (selected) classes.push('selected');
  if (disabled) classes.push('disabled');
  if (readonly) classes.push('readonly');
  if (big) classes.push('big');
  return (
    <div
      className={classes.join(' ')}
      onClick={() => {
        if (onToggle && !readonly && !disabled) {
          onToggle(value, !selected);
        }
      }}
    >
      <span className="group-label">{label}</span>
      {sublabel && <span className="group-sublabel">{sublabel}</span>}
    </div>
  );
}
