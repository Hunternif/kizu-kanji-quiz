import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { CenteredLayout } from '../components/layout/CenteredLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { firebaseAuth } from '../firebase';
import { GoogleLogin } from './lobby-screens/login-components/GoogleLogin';
import { Panel } from '../components/Panel';

export function WelcomePage() {
  const [error, setError] = useState(null);
  const [user, loading] = useAuthState(firebaseAuth);
  return (
    <CenteredLayout outerClassName="welcome-screen">
      <h1>Kizu Kanji Quiz!</h1>
      <ErrorModal error={error} setError={setError} />
      <ErrorContext.Provider value={{ error, setError }}>
        <Panel>
          {loading ? (
            <LoadingSpinner />
          ) : user?.isAnonymous === false ? null : ( // <HomeScreen />
            <GoogleLogin />
          )}
        </Panel>
      </ErrorContext.Provider>
    </CenteredLayout>
  );
}
