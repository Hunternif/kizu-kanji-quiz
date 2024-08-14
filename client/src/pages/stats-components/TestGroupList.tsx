import {
  kanaGroupInfo,
  kanjiGradeGroupInfo,
  kanjiJlptGroupInfo,
  TestGroupInfo,
  vocabJlptGroupInfo,
} from '../../shared/kanji-data-api';
import { TestGroup } from '../../shared/types';

interface ListProps {
  selectedGroup?: TestGroup;
  onSelect?: (group: TestGroup) => void;
}

export function TestGroupList({ selectedGroup, onSelect }: ListProps) {
  return (
    <div className="test-group-list">
      <GroupSection
        title="Hiragana & Katakana"
        groups={kanaGroupInfo}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelect}
      />
      <GroupSection
        title="Kanji: Japanese Language Proficiency Test"
        groups={kanjiJlptGroupInfo}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelect}
      />
      <GroupSection
        title="Kanji: Primary school"
        groups={kanjiGradeGroupInfo}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelect}
      />
      <GroupSection
        title="Vocabulary: Japanese Language Proficiency Test"
        groups={vocabJlptGroupInfo}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelect}
      />
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  groups: Array<TestGroupInfo<TestGroup>>;
  big?: boolean; // Makes the label big
  selectedGroup?: TestGroup;
  onSelectGroup?: (value: TestGroup) => void;
}
function GroupSection({
  title,
  groups,
  big,
  selectedGroup,
  onSelectGroup,
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
            selected={selectedGroup === g.group}
            onClick={() => onSelectGroup && onSelectGroup(g.group)}
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
  if (selected) classes.push('selected');
  return (
    <div className={classes.join(' ')} onClick={onClick}>
      <span className="group-label">{label}</span>
      {sublabel && <span className="group-sublabel">{sublabel}</span>}
    </div>
  );
}
