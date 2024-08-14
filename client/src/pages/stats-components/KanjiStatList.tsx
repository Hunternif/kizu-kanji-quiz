import { CSSProperties, useEffect, useState } from 'react';
import { loadAllKanjiData, loadVocabData } from '../../api/kanji-cache-api';
import { getEntryProgress } from '../../api/stats/stats-api';
import { useErrorContext } from '../../components/ErrorContext';
import { Modal } from '../../components/Modal';
import { isVocabGroup } from '../../shared/kanji-data-api';
import { EntryStats, GameEntry, QuizUser, TestGroup } from '../../shared/types';
import { JapText } from '../lobby-screens/game-components/JapText';
import { QuestionCard } from '../lobby-screens/game-components/QuestionCard';

interface Props {
  quizUser: QuizUser;
  selectedGroup?: TestGroup;
  stats?: Map<string, EntryStats>;
}

export function KanjiStatList({ selectedGroup, stats }: Props) {
  const { setError } = useErrorContext();
  const [selectedEntry, setSelectedEntry] = useState<GameEntry>();
  const [entries, setEntries] = useState<Array<GameEntry>>([]);

  async function updateEntries() {
    try {
      if (selectedGroup) {
        // Load vocab groups separately, because they are extra large:
        if (isVocabGroup(selectedGroup)) {
          const vocabEntries = await loadVocabData(selectedGroup);
          setEntries([...vocabEntries.values()]);
        } else {
          const kanjiEntries = await loadAllKanjiData();
          setEntries(filterEntries(kanjiEntries.values(), selectedGroup));
        }
      }
    } catch (e: any) {
      setError(e);
    }
  }

  useEffect(() => {
    updateEntries();
  }, [selectedGroup]);

  return (
    <div className="kanji-stat-list">
      <Modal
        transparent
        closeButton
        show={selectedEntry != null}
        onHide={() => setSelectedEntry(undefined)}
        className="entry-details-modal"
      >
        {/* TODO: use current language */}
        {selectedEntry && (
          <QuestionCard
            entry={selectedEntry}
            questionMode="kanji"
            answerMode="type_meaning"
            reveal
            lang="en"
          />
        )}
      </Modal>

      {entries.map((e) => {
        const stat = stats?.get(e.id);
        const style: CSSProperties = {};
        if (stat) {
          const { attempts, wins, fails } = getEntryProgress(stat);
          if (attempts > 0) {
            if (wins > fails) {
              style.backgroundColor = `color-mix(in srgb, green ${
                (wins / attempts) * 40
              }%, white)`;
            } else {
              style.backgroundColor = `color-mix(in srgb, red ${
                (fails / attempts) * 40
              }%, white)`;
            }
          }
        }
        return (
          <JapText
            key={e.writing}
            className="e"
            style={style}
            text={e.writing}
            onClick={() => setSelectedEntry(e)}
          />
        );
      })}
    </div>
  );
}

function filterEntries(
  entries: Iterable<GameEntry>,
  group: TestGroup,
): GameEntry[] {
  return [...entries].filter((k) => k.groups.find((g) => group === g));
}
