import { CSSProperties, useState } from 'react';
import { loadAllKanjiData } from '../../api/kanji-cache-api';
import { getUserStats } from '../../api/stats-api';
import { useErrorContext } from '../../components/ErrorContext';
import { Modal } from '../../components/Modal';
import { useAsyncData } from '../../hooks/data-hooks';
import { GameEntry, QuizUser, TestGroup } from '../../shared/types';
import { JapText } from '../lobby-screens/game-components/JapText';
import { QuestionCard } from '../lobby-screens/game-components/QuestionCard';

interface Props {
  quizUser: QuizUser;
  selectedGroup?: TestGroup;
}

export function KanjiStatList({ quizUser, selectedGroup }: Props) {
  const { setError } = useErrorContext();
  const [selectedEntry, setSelectedEntry] = useState<GameEntry>();

  async function fetchKanji() {
    try {
      return await loadAllKanjiData();
    } catch (e: any) {
      setError(e);
    }
  }
  async function fetchStats() {
    try {
      return await getUserStats(quizUser.uid);
    } catch (e: any) {
      setError(e);
    }
  }
  const [allEntries] = useAsyncData(fetchKanji());
  const [userStats] = useAsyncData(fetchStats());

  const filteredEntries =
    (allEntries &&
      selectedGroup &&
      filterEntries(allEntries.values(), selectedGroup)) ??
    [];

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
            gameMode="writing_to_meaning"
            questionMode="kanji"
            reveal
            lang="en"
          />
        )}
      </Modal>

      {filteredEntries.map((e) => {
        const stat = userStats?.get(e.id);
        const style: CSSProperties = {};
        if (stat) {
          const wins =
            (stat?.meaning_wins ?? 0) +
            (stat?.reading_wins ?? 0) +
            (stat?.writing_wins ?? 0);
          const fails =
            (stat?.meaning_fails ?? 0) +
            (stat?.reading_fails ?? 0) +
            (stat?.writing_fails ?? 0);
          const attempts = wins + fails;
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
