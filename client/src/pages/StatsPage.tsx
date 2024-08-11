import { useState } from 'react';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScrollContainer } from '../components/layout/ScrollContainer';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { useQuizUser } from '../hooks/auth-hooks';
import { TestGroup } from '../shared/types';
import { KanjiStatList } from './stats-components/KanjiStatList';
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
  const [selectedGroup, setSelectedGroup] = useState<TestGroup>();

  if (loadingQuizUser) {
    return <LoadingSpinner delay text="Loading user..." />;
  }
  if (!quizUser) {
    setError("Couldn't load user.");
    return <></>;
  }

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
          <KanjiStatList quizUser={quizUser} selectedGroup={selectedGroup} />
        </ScrollContainer>
      </SidebarLayout>
    </>
  );
}
