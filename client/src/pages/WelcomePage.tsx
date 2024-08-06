import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { CenteredLayout } from '../components/layout/CenteredLayout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Panel } from '../components/Panel';
import { firebaseAuth } from '../firebase';
import { HomeScreen } from './lobby-screens/HomeScreen';
import { GameTitle } from './lobby-screens/login-components/GameTitle';
import { GoogleLogin } from './lobby-screens/login-components/GoogleLogin';
import { GuestLogin } from './lobby-screens/login-components/GuestLogin';

export function WelcomePage() {
  const [error, setError] = useState(null);
  const [user, loading] = useAuthState(firebaseAuth);
  return (
    <>
      <ErrorModal error={error} setError={setError} />
      <ErrorContext.Provider value={{ error, setError }}>
        {loading ? (
          <LoadingSpinner />
        ) : user?.isAnonymous === false ? (
          <HomeScreen />
        ) : (
          <LoginPanel />
        )}
      </ErrorContext.Provider>
    </>
  );
}

function LoginPanel() {
  return (
    <CenteredLayout outerClassName="welcome-screen">
      <GameTitle />
      <Panel className="login-card">
        <GoogleLogin />
        <GuestLogin />
      </Panel>
    </CenteredLayout>
  );
}
