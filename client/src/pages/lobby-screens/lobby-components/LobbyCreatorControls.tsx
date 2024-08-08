import { User } from 'firebase/auth';
import { useContext, useState } from 'react';
import { startLobby } from '../../../api/lobby/lobby-control-api';
import { updateLobby } from '../../../api/lobby/lobby-repository';
import { GameButton } from '../../../components/Buttons';
import { Timed } from '../../../components/Delay';
import { ErrorContext } from '../../../components/ErrorContext';
import { IconLink, IconPlay } from '../../../components/Icons';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { Panel } from '../../../components/Panel';
import { ScrollContainer } from '../../../components/layout/ScrollContainer';
import { useHandler } from '../../../hooks/data-hooks';
import { GameLobby } from '../../../shared/types';
import { LobbySettingsPanel } from './LobbySettingsPanel';
import { TestGroupSelector } from './TestGroupSelector';

interface Props {
  user: User;
  lobby: GameLobby;
}

export function LobbyCreatorControls(props: Props) {
  const { lobby } = props;
  const [showLink, setShowLink] = useState(false);
  const { setError } = useContext(ErrorContext);
  const [handleStart, starting] = useHandler(() => startLobby(lobby));

  async function handleInvite() {
    // Copies link
    navigator.clipboard.writeText(document.URL);
    setShowLink(true);
  }

  async function handleSettingsChange() {
    // Creator can change settings directly.
    await updateLobby(lobby).catch((e) => setError(e));
  }

  if (starting || lobby.status === 'starting') {
    return <LoadingSpinner text="Starting..." />;
  }
  return (
    <>
      <ScrollContainer scrollDark className="content">
        <Panel>
          <header>
            <h3>Select questions</h3>
          </header>
          <TestGroupSelector {...props} />
        </Panel>
        <Panel>
          <LobbySettingsPanel
            settings={lobby.settings}
            onChange={handleSettingsChange}
          />
        </Panel>
      </ScrollContainer>
      <footer>
        <GameButton
          light
          className="start-button"
          onClick={handleInvite}
          iconLeft={<IconLink />}
        >
          Invite
          {showLink && (
            <Timed onClear={() => setShowLink(false)}>
              <span className="light link-copied-popup">Link copied</span>
            </Timed>
          )}
        </GameButton>
        <GameButton
          accent
          className="start-button"
          onClick={handleStart}
          disabled={lobby.test_groups.size == 0}
          iconLeft={<IconPlay />}
        >
          Start
        </GameButton>
      </footer>
    </>
  );
}
