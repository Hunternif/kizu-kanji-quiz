import { User } from 'firebase/auth';
import { updateLobby } from '../../../api/lobby/lobby-repository';
import { useHandler2 } from '../../../hooks/data-hooks';
import {
  kanaGroupInfo,
  kanjiGradeGroupInfo,
  kanjiJlptGroupInfo,
  TestGroupInfo,
  vocabJlptGroupInfo,
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
        groups={kanaGroupInfo}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        big
        title="Kanji: Japanese Language Proficiency Test"
        lobby={lobby}
        groups={kanjiJlptGroupInfo}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        title="Kanji: Primary school"
        lobby={lobby}
        groups={kanjiGradeGroupInfo}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        title="Vocabulary: Japanese Language Proficiency Test"
        lobby={lobby}
        groups={vocabJlptGroupInfo}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  groups: Array<TestGroupInfo<TestGroup>>;
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
        {groups.map((g) => (
          <Group
            key={g.group}
            value={g.group}
            label={g.label}
            big={big}
            sublabel={g.sublabel}
            selected={lobby.test_groups.has(g.group)}
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
