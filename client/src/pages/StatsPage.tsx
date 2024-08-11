import { useState } from 'react';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Col } from '../components/layout/Col';
import { RowLayout } from '../components/layout/RowLayout';
import { useQuizUser } from '../hooks/auth-hooks';
import { TestGroupList } from './stats-components/TestGroupList';
import { ScrollContainer } from '../components/layout/ScrollContainer';

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
      <RowLayout>
        <Col className="stats-side-column">
          <header>Test Groups</header>
          <ScrollContainer scrollDark>
            <TestGroupList />
          </ScrollContainer>
        </Col>
        <Col className="main-content-column">Kanji go here</Col>
      </RowLayout>
    </>
  );
}
