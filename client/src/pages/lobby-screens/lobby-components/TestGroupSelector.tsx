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

export function TestGroupSelector(props: SelectorProps) {
  const kanaGroups: Array<[KanaGroup, string, string]> = [
    ['hiragana', 'あ', 'Hiragana'],
    ['hiragana_digraphs', 'きゃ', 'Hiragana digraphs'],
    ['katakana', 'カ', 'Katakana'],
    ['katakana_digraphs', 'キャ', 'Katakana digraphs'],
  ];
  const kanjiJlptGroups: Array<[KanjiJlptLevel, string]> = [
    ['kanji_jlpt_5', 'N5'],
    ['kanji_jlpt_4', 'N4'],
    ['kanji_jlpt_3', 'N3'],
    ['kanji_jlpt_2', 'N2'],
    ['kanji_jlpt_1', 'N1'],
  ];
  const kanjiGradeGroups: Array<[KanjiGrade, string]> = [
    ['kanji_grade_1', 'Grade 1'],
    ['kanji_grade_2', 'Grade 2'],
    ['kanji_grade_3', 'Grade 3'],
    ['kanji_grade_4', 'Grade 4'],
    ['kanji_grade_5', 'Grade 5'],
    ['kanji_grade_6', 'Grade 6'],
    ['kanji_grade_S', 'Secondary school'],
  ];
  return (
    <div className="test-group-selector">
      <GroupSection title="Hiragana & Katakana">
        {kanaGroups.map(([val, label, sub]) => (
          <Group key={val} big value={val} label={label} sublabel={sub} />
        ))}
      </GroupSection>
      <GroupSection title="Kanji: Japanese Language Proficiency Test">
        {kanjiJlptGroups.map(([val, label]) => (
          <Group key={val} big value={val} label={label} />
        ))}
      </GroupSection>
      <GroupSection title="Kanji: Primary school">
        {kanjiGradeGroups.map(([val, label]) => (
          <Group key={val} value={val} label={label} />
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
  onToggle?: (value: TestGroup, selected: boolean) => void;
}
function Group({
  value,
  label,
  big,
  sublabel,
  selected,
  onToggle,
}: GroupProps) {
  const classes = ['group-button'];
  classes.push(selected ? 'selected' : 'unselected');
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
