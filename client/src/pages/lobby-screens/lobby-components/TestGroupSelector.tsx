import { User } from 'firebase/auth';
import { updateLobby } from '../../../api/lobby/lobby-repository';
import { useHandler2 } from '../../../hooks/data-hooks';
import {
  GameLobby,
  KanaGroup,
  KanjiGrade,
  KanjiJlptLevel,
  TestGroup,
} from '../../../shared/types';

const kanaGroups: Array<[KanaGroup, string, string]> = [
  ['hiragana', 'あ', '73 Hiragana'],
  ['hiragana_digraphs', 'きゃ', '33 Hiragana digraphs'],
  ['katakana', 'カ', '74 Katakana'],
  ['katakana_digraphs', 'キャ', '33 Katakana digraphs'],
];
const kanjiJlptGroups: Array<[KanjiJlptLevel, string, string]> = [
  ['kanji_jlpt_5', 'N5', '79 Kanji'],
  ['kanji_jlpt_4', 'N4', '166 Kanji'],
  ['kanji_jlpt_3', 'N3', '367 Kanji'],
  ['kanji_jlpt_2', 'N2', '367 Kanji'],
  ['kanji_jlpt_1', 'N1', '990 Kanji'],
];
const kanjiGradeGroups: Array<[KanjiGrade, string, string]> = [
  ['kanji_grade_1', 'Grade 1', '80 Kanji'],
  ['kanji_grade_2', 'Grade 2', '160 Kanji'],
  ['kanji_grade_3', 'Grade 3', '200 Kanji'],
  ['kanji_grade_4', 'Grade 4', '202 Kanji'],
  ['kanji_grade_5', 'Grade 5', '193 Kanji'],
  ['kanji_grade_6', 'Grade 6', '191 Kanji'],
  ['kanji_grade_S', 'Secondary school', '1110 kanji'],
];

const enabledGroups = new Set<TestGroup>([
  'hiragana',
  'hiragana_digraphs',
  'katakana',
  'katakana_digraphs',
]);

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
        groups={kanaGroups}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        big
        title="Kanji: Japanese Language Proficiency Test"
        lobby={lobby}
        groups={kanjiJlptGroups}
        readOnly={readOnly}
        onToggle={toggleHandler}
      />
      <GroupSection
        title="Kanji: Primary school"
        lobby={lobby}
        groups={kanjiGradeGroups}
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
            disabled={!enabledGroups.has(value)}
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
