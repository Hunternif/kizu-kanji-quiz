import {
  kanaGroupNames,
  kanjiGradeGroupNames,
  kanjiJlptGroupNames,
} from '../../shared/kanji-data-api';
import { TestGroup } from '../../shared/types';

export function TestGroupList() {
  function selectHandler(group: TestGroup) {}

  return (
    <div className="test-group-list">
      <GroupSection
        big
        title="Hiragana & Katakana"
        groups={kanaGroupNames}
        onSelectGroup={selectHandler}
      />
      <GroupSection
        big
        title="Kanji: Japanese Language Proficiency Test"
        groups={kanjiJlptGroupNames}
        onSelectGroup={selectHandler}
      />
      <GroupSection
        title="Kanji: Primary school"
        groups={kanjiGradeGroupNames}
        onSelectGroup={selectHandler}
      />
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  groups: Array<[value: TestGroup, label: string, sublabel: string]>;
  big?: boolean; // Makes the label big
  selected?: boolean;
  onSelectGroup?: (value: TestGroup) => void;
}
function GroupSection({
  title,
  groups,
  big,
  selected,
  onSelectGroup,
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
            selected={selected}
            onClick={() => onSelectGroup && onSelectGroup(value)}
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
  onClick?: () => void;
}
function Group({ value, label, big, sublabel, selected, onClick }: GroupProps) {
  const classes = ['group-button'];
  if (big) classes.push('big');
  return (
    <div className={classes.join(' ')} onClick={onClick}>
      <span className="group-label">{label}</span>
      {sublabel && <span className="group-sublabel">{sublabel}</span>}
    </div>
  );
}
