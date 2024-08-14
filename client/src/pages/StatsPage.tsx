import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { addTestGroup } from '../api/lobby/lobby-control-api';
import { createLobbyAndJoin } from '../api/lobby/lobby-join-api';
import { getLobby } from '../api/lobby/lobby-repository';
import { getUserStats } from '../api/stats/stats-repository';
import { GameButton } from '../components/Buttons';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { IconPlay } from '../components/Icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ScrollContainer } from '../components/layout/ScrollContainer';
import { SidebarLayout } from '../components/layout/SidebarLayout';
import { useQuizUser } from '../hooks/auth-hooks';
import { useHandler } from '../hooks/data-hooks';
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
  const [handleTest, startingTest] = useHandler(async () => {
    if (selectedGroup) {
      const lobbyID = await createLobbyAndJoin();
      const lobby = await getLobby(lobbyID);
      await addTestGroup(lobby, selectedGroup);
      navigate(`/${lobbyID}`);
    }
  }, [selectedGroup]);

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
        <footer>
          {selectedGroup && (
            <GameButton
              iconLeft={!startingTest ? <IconPlay /> : undefined}
              className="start-button"
              onClick={handleTest}
              loading={startingTest}
            >
              Test
            </GameButton>
          )}
        </footer>
      </SidebarLayout>
    </>
  );
}
