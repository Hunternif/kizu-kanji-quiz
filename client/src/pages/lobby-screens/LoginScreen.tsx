import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { VerticalGroup } from '../../components/layout/VerticalGroup';
import { Panel } from '../../components/Panel';
import { GameTitle } from './login-components/GameTitle';
import { GoogleLogin } from './login-components/GoogleLogin';
import { GuestLogin } from './login-components/GuestLogin';

type LoginPanelProps = {
  isLoggedInAsGuest?: boolean;
  onLogin?: (mode: LoginMode) => void;
};

export type LoginMode = 'google' | 'guest';

/**
 * Shown before creating or joining lobby.
 */
export function LoginScreen({ isLoggedInAsGuest, onLogin }: LoginPanelProps) {
  function handleLogin(mode: LoginMode) {
    if (onLogin) onLogin(mode);
  }
  return (
    <CenteredLayout outerClassName="welcome-screen">
      <GameTitle />
      <Panel flex className="login-card">
        <VerticalGroup>
          <GoogleLogin onLogin={() => handleLogin('google')} />
          <GuestLogin
            onLogin={() => handleLogin('guest')}
            text={isLoggedInAsGuest ? 'Continue as guest' : 'Sign in as guest'}
          />
        </VerticalGroup>
      </Panel>
    </CenteredLayout>
  );
}
