import { useState } from 'react';
import { loadAllKanjiData } from '../api/kanji-cache-api';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScrollContainer } from '../components/layout/ScrollContainer';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { useQuizUser } from '../hooks/auth-hooks';
import { useAsyncData } from '../hooks/data-hooks';
import { GameEntry, TestGroup } from '../shared/types';
import { TestGroupList } from './stats-components/TestGroupList';

/** Page with your user's statistics */
export function StatsPage() {
  const [error, setError] = useState(null);
  return (
    <>
      <ErrorModal error={error} setError={setError} />
      <ErrorContext.Provider value={{ error, setError }}>
        <StatsPageThrows />
      </ErrorContext.Provider>
    </>
  );
}

function StatsPageThrows() {
  const [quizUser, loadingQuizUser] = useQuizUser();
  const { setError } = useErrorContext();
  const [allEntries] = useAsyncData(loadAllKanjiData());
  const [selectedGroup, setSelectedGroup] = useState<TestGroup>();

  if (loadingQuizUser) {
    return <LoadingSpinner delay text="Loading user..." />;
  }
  if (!quizUser) {
    setError("Couldn't load user.");
    return <></>;
  }

  const filteredEntries =
    (allEntries &&
      selectedGroup &&
      filterEntries(allEntries.values(), selectedGroup)) ??
    [];

  return (
    <>
      <SidebarLayout
        sidebarClassName="stats-side-column"
        mainClassName="stats-main-column"
        sidebar={
          <>
            <header>Test Groups</header>
            <ScrollContainer scrollDark>
              <TestGroupList
                selectedGroup={selectedGroup}
                onSelect={setSelectedGroup}
              />
            </ScrollContainer>
          </>
        }
      >
        <ScrollContainer scrollDark>
          <div>
            {filteredEntries.map((e) => (
              <span key={e.writing} className="e">
                {e.writing}
              </span>
            ))}
          </div>
        </ScrollContainer>
      </SidebarLayout>
    </>
  );
}

function filterEntries(
  entries: Iterable<GameEntry>,
  group: TestGroup,
): GameEntry[] {
  return [...entries].filter((k) => k.groups.find((g) => group === g));
}
