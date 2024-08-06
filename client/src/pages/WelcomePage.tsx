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
  const [guestApproved, setGuestApproved] = useState(false);
  const loginApproved =
    user != null && (user.isAnonymous === false || guestApproved);
  return (
    <>
      <ErrorModal error={error} setError={setError} />
      <ErrorContext.Provider value={{ error, setError }}>
        {loading ? (
          <LoadingSpinner />
        ) : loginApproved ? (
          <HomeScreen />
        ) : (
          <LoginPanel
            isLoggedInAsGuest={user?.isAnonymous}
            onGuestLogin={() => setGuestApproved(true)}
          />
        )}
      </ErrorContext.Provider>
    </>
  );
}

type LoginPanelProps = {
  isLoggedInAsGuest?: boolean;
  onGuestLogin: () => void;
};
function LoginPanel({ isLoggedInAsGuest, onGuestLogin }: LoginPanelProps) {
  return (
    <CenteredLayout outerClassName="welcome-screen">
      <GameTitle />
      <Panel className="login-card">
        <GoogleLogin />
        <GuestLogin
          onLogin={onGuestLogin}
          text={isLoggedInAsGuest ? 'Continue as guest' : 'Sign in as guest'}
        />
      </Panel>
    </CenteredLayout>
  );
}
