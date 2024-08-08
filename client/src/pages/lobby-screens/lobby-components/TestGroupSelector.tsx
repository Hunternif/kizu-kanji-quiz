import { User } from 'firebase/auth';
import {
  GameLobby,
  KanaGroup,
  KanjiGrade,
  KanjiJlptLevel,
  TestGroup,
} from '../../../shared/types';

interface SelectorProps {
  user: User;
  lobby: GameLobby;
  readOnly?: boolean;
}

export function TestGroupSelector({ readOnly }: SelectorProps) {
  const kanaGroups: Array<[KanaGroup, string, string]> = [
    ['hiragana', 'あ', '73 Hiragana'],
    ['hiragana_digraphs', 'きゃ', '33 Hiragana digraphs'],
    ['katakana', 'カ', '74 Katakana'],
    ['katakana_digraphs', 'キャ', '33 Katakana digraphs'],
  ];
  const kanjiJlptGroups: Array<[KanjiJlptLevel, string, string]> = [
    ['kanji_jlpt_5', 'N5', '79 kanji'],
    ['kanji_jlpt_4', 'N4', '166 kanji'],
    ['kanji_jlpt_3', 'N3', '367 kanji'],
    ['kanji_jlpt_2', 'N2', '367 kanji'],
    ['kanji_jlpt_1', 'N1', '990 kanji'],
  ];
  const kanjiGradeGroups: Array<[KanjiGrade, string, string]> = [
    ['kanji_grade_1', 'Grade 1', '80 kanji'],
    ['kanji_grade_2', 'Grade 2', '160 kanji'],
    ['kanji_grade_3', 'Grade 3', '200 kanji'],
    ['kanji_grade_4', 'Grade 4', '202 kanji'],
    ['kanji_grade_5', 'Grade 5', '193 kanji'],
    ['kanji_grade_6', 'Grade 6', '191 kanji'],
    ['kanji_grade_S', 'Secondary school', '1110 kanji'],
  ];
  return (
    <div className="test-group-selector">
      <GroupSection title="Hiragana & Katakana">
        {kanaGroups.map(([val, label, sub]) => (
          <Group
            key={val}
            big
            value={val}
            label={label}
            sublabel={sub}
            readonly={readOnly}
          />
        ))}
      </GroupSection>
      <GroupSection title="Kanji: Japanese Language Proficiency Test">
        {kanjiJlptGroups.map(([val, label, sub]) => (
          <Group
            key={val}
            big
            value={val}
            label={label}
            sublabel={sub}
            readonly={readOnly}
          />
        ))}
      </GroupSection>
      <GroupSection title="Kanji: Primary school">
        {kanjiGradeGroups.map(([val, label, sub]) => (
          <Group
            key={val}
            value={val}
            label={label}
            sublabel={sub}
            readonly={readOnly}
          />
        ))}
      </GroupSection>
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
}
function GroupSection({ title, ...props }: SectionProps) {
  return (
    <div className="group-section">
      <div className="group-section-title">{title}</div>
      <div className="group-container" {...props} />
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
      onClick={() => (onToggle ? onToggle(value, !selected) : null)}
    >
      <span className="group-label">{label}</span>
      {sublabel && <span className="group-sublabel">{sublabel}</span>}
    </div>
  );
}
