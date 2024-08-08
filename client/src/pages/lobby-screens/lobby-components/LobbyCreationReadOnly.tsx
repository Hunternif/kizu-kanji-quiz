import { User } from 'firebase/auth';
import { useState } from 'react';
import { GameButton } from '../../../components/Buttons';
import { Timed } from '../../../components/Delay';
import { IconLink } from '../../../components/Icons';
import { ScrollContainer } from '../../../components/layout/ScrollContainer';
import { GameLobby } from '../../../shared/types';
import { LobbySettingsPanel } from './LobbySettingsPanel';
import { TestGroupSelector } from './TestGroupSelector';
import { Panel } from '../../../components/Panel';
import { LoadingSpinner } from '../../../components/LoadingSpinner';

interface Props {
  user: User;
  lobby: GameLobby;
}

/** Read-only view of the current lobby settings, for non-creator players */
export function LobbyCreationReadOnly(props: Props) {
  const { lobby } = props;
  const [showLink, setShowLink] = useState(false);
  async function handleInvite() {
    // Copies link
    navigator.clipboard.writeText(document.URL);
    setShowLink(true);
  }

  if (lobby.status === 'starting') {
    return <LoadingSpinner text="Starting..." />;
  }
  return (
    <>
      <ScrollContainer scrollDark className="content">
        <Panel>
          <header>
            <h3>Questions</h3>
          </header>
          <TestGroupSelector readOnly {...props} />
        </Panel>
        <Panel>
          <LobbySettingsPanel settings={lobby.settings} readOnly />
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
        <span>Please wait for the game to start</span>
      </footer>
    </>
  );
}
