import { CSSProperties, useEffect, useState } from 'react';
import { getEntryProgress } from '../../api/stats/stats-api';
import {
  kanaGroupInfo,
  kanjiGradeGroupInfo,
  kanjiJlptGroupInfo,
  testGroupInfo,
  TestGroupInfo,
  vocabJlptGroupInfo,
} from '../../shared/kanji-data-api';
import { EntryStats, TestGroup } from '../../shared/types';

interface ListProps {
  selectedGroup?: TestGroup;
  stats?: Map<string, EntryStats>;
  onSelect?: (group: TestGroup) => void;
}

export function TestGroupList({ selectedGroup, stats, onSelect }: ListProps) {
  /** Maps test group to the number of entries "completed" in this group. */
  const [groupProgress, setGroupProgress] = useState<Map<TestGroup, number>>();

  useEffect(() => {
    if (stats) {
      // Calculate completion for all groups:
      const rates = new Map<TestGroup, number>();
      for (const entry of [...stats.values()]) {
        const { passed } = getEntryProgress(entry);
        if (passed) {
          for (const group of entry.groups) {
            rates.set(group, (rates.get(group) ?? 0) + 1);
          }
        }
      }
      setGroupProgress(rates);
    }
  }, [stats]);

  return (
    <div className="test-group-list">
      <GroupSection
        title="Hiragana & Katakana"
        groups={kanaGroupInfo}
        groupProgress={groupProgress}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelect}
      />
      <GroupSection
        title="Kanji: Japanese Language Proficiency Test"
        groups={kanjiJlptGroupInfo}
        groupProgress={groupProgress}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelect}
      />
      <GroupSection
        title="Kanji: Primary school"
        groups={kanjiGradeGroupInfo}
        groupProgress={groupProgress}
        selectedGroup={selectedGroup}
        onSelectGroup={onSelect}
      />
      <GroupSection
        title="Vocabulary: Japanese Language Proficiency Test"
        groups={vocabJlptGroupInfo}
        groupProgress={groupProgress}
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
  groupProgress?: Map<TestGroup, number>;
  selectedGroup?: TestGroup;
  onSelectGroup?: (value: TestGroup) => void;
}
function GroupSection({
  title,
  groups,
  big,
  groupProgress,
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
            groupProgress={groupProgress?.get(g.group)}
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
  groupProgress?: number;
  sublabel?: string;
  selected?: boolean;
  onClick?: () => void;
}
function Group({
  value,
  label,
  big,
  groupProgress,
  sublabel,
  selected,
  onClick,
}: GroupProps) {
  const classes = ['group-button'];
  if (big) classes.push('big');
  if (selected) classes.push('selected');

  // Calculate progress bar length:
  let progressRate = 0;
  const progressClasses = ['progress-bar'];
  if (groupProgress !== undefined) {
    const total = testGroupInfo.get(value)?.count ?? 1;
    progressRate = 100 * Math.max(0, Math.min(1, groupProgress / total));
    if (progressRate < 30) progressClasses.push('red');
    else if (progressRate < 60) progressClasses.push('yellow');
    else progressClasses.push('green');
  }
  const progressStyle: CSSProperties = { width: `${progressRate}%` };

  return (
    <div className={classes.join(' ')} onClick={onClick}>
      <span className="group-label">{label}</span>
      {sublabel && <span className="group-sublabel">{sublabel}</span>}
      <div className={progressClasses.join(' ')} style={progressStyle}></div>
    </div>
  );
}
