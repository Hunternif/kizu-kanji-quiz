import { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { ErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { firebaseAuth } from '../firebase';
import { HomeScreen } from './lobby-screens/HomeScreen';
import { LoginMode, LoginScreen } from './lobby-screens/LoginScreen';
import { assertExhaustive } from '../shared/utils';

/** The initial landing page */
export function WelcomePage() {
  const [error, setError] = useState(null);
  const [user, loading] = useAuthState(firebaseAuth);
  const [guestApproved, setGuestApproved] = useState(false);
  const loginApproved =
    user != null && (user.isAnonymous === false || guestApproved);

  function handleLogin(mode: LoginMode) {
    switch (mode) {
      case 'google':
        break;
      case 'guest':
        setGuestApproved(true);
        break;
      default:
        assertExhaustive(mode);
    }
  }

  return (
    <>
      <ErrorModal error={error} setError={setError} />
      <ErrorContext.Provider value={{ error, setError }}>
        {loading ? (
          <LoadingSpinner />
        ) : loginApproved ? (
          <HomeScreen />
        ) : (
          <LoginScreen
            isLoggedInAsGuest={user?.isAnonymous}
            onLogin={handleLogin}
          />
        )}
      </ErrorContext.Provider>
    </>
  );
}
