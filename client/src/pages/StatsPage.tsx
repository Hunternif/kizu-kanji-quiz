import { useState } from 'react';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScrollContainer } from '../components/layout/ScrollContainer';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { useQuizUser } from '../hooks/auth-hooks';
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
        sidebar={
          <>
            <header>Test Groups</header>
            <ScrollContainer scrollDark>
              <TestGroupList />
            </ScrollContainer>
          </>
        }
      >
        Kanji go here
      </SidebarLayout>
    </>
  );
}
