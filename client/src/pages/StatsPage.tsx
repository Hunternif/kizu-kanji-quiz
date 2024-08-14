import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { getUserStats } from '../api/stats/stats-repository';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScrollContainer } from '../components/layout/ScrollContainer';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { useQuizUser } from '../hooks/auth-hooks';
import { EntryStats, TestGroup } from '../shared/types';
import { KanjiStatList } from './stats-components/KanjiStatList';
import { TestGroupList } from './stats-components/TestGroupList';

interface LoaderParams {
  params: any;
}

export function statsLoader({ params }: LoaderParams): TestGroup {
  return params['group'] as TestGroup;
}

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
  const { setError } = useErrorContext();
  const navigate = useNavigate();
  const selectedGroup = useLoaderData() as TestGroup;
  const [quizUser, loadingQuizUser] = useQuizUser();
  const [userStats, setUserStats] = useState<Map<string, EntryStats>>();

  async function fetchStats(userID: string) {
    try {
      setUserStats(await getUserStats(userID));
    } catch (e: any) {
      setError(e);
    }
  }

  useEffect(() => {
    if (quizUser) {
      fetchStats(quizUser.uid);
    }
  }, [quizUser?.uid]);

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
                stats={userStats}
                onSelect={(group) => navigate(`/stats/${group}`)}
              />
            </ScrollContainer>
          </>
        }
      >
        <header>Statistics</header>
        <ScrollContainer scrollDark>
          <KanjiStatList
            quizUser={quizUser}
            selectedGroup={selectedGroup}
            stats={userStats}
          />
        </ScrollContainer>
      </SidebarLayout>
    </>
  );
}
