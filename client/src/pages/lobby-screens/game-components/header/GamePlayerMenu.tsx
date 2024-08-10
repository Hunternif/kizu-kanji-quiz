import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  endLobby,
  updateLobbySettings,
} from '../../../../api/lobby/lobby-control-api';
import { leaveLobby } from '../../../../api/lobby/lobby-join-api';
import { setMyPlayerRole } from '../../../../api/lobby/lobby-player-api';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import {
  Dropdown,
  DropdownMenu,
  DropdownMenuItem,
} from '../../../../components/Dropdown';
import { ErrorContext } from '../../../../components/ErrorContext';
import { IconHamburger } from '../../../../components/Icons';
import { Twemoji } from '../../../../components/Twemoji';
import { LobbySettings } from '../../../../shared/types';
import { copyFields } from '../../../../shared/utils';
import { LobbyPlayerList } from '../../lobby-components/LobbyPlayerList';
import { LobbySettingsPanel } from '../../lobby-components/LobbySettingsPanel';
import { ProfileModal } from '../../login-components/ProfileModal';
import { useGameContext } from '../GameContext';

/** Dropdown menu showing player */
export function GamePlayerMenu() {
  const navigate = useNavigate();
  const {
    user,
    quizUser,
    lobby,
    player,
    spectators,
    activePlayers,
    isSpectator,
    canControlLobby,
  } = useGameContext();
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlayersModal, setShowPlayersModal] = useState(false);
  const [ending, setEnding] = useState(false);
  const { setError } = useContext(ErrorContext);

  const canJoinAsPlayer = activePlayers.length < lobby.settings.max_players;

  // Make a local copy of settings to make changes:
  const [settings, setSettings] = useState(lobby.settings);
  const [savingSettings, setSavingSettings] = useState(false);

  async function handleLeave() {
    try {
      await leaveLobby(lobby, player.uid);
      navigate('/');
    } catch (e: any) {
      setError(e);
    }
  }

  async function handleEnd() {
    try {
      setEnding(true);
      await endLobby(lobby);
    } catch (e: any) {
      setError(e);
    } finally {
      setEnding(false);
    }
  }

  function openSettings() {
    // Make a local copy of settings to make changes:
    setSettings(copyFields(lobby.settings));
    setShowSettingsModal(true);
  }

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      await updateLobbySettings(lobby.id, settings);
      setShowSettingsModal(false);
    } catch (e) {
      setError(e);
    } finally {
      setSavingSettings(false);
    }
  }
  /** Causes the settings panel to rerender. */
  async function refreshSettings(newSettings: LobbySettings) {
    setSettings(copyFields(newSettings));
  }

  async function handleSpectate() {
    try {
      await setMyPlayerRole(lobby.id, 'spectator');
    } catch (e: any) {
      setError(e);
    }
  }

  async function handleJoinAsPlayer() {
    try {
      await setMyPlayerRole(lobby.id, 'player');
    } catch (e: any) {
      setError(e);
    }
  }

  return (
    <>
      <ConfirmModal
        show={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleLeave}
      >
        Leave the game?
      </ConfirmModal>
      <ConfirmModal
        show={showEndModal}
        onCancel={() => setShowEndModal(false)}
        onConfirm={handleEnd}
        loading={ending}
        loadingText="Ending game..."
      >
        End the game for everyone?
      </ConfirmModal>
      <ConfirmModal
        longFormat
        scroll
        className="game-settings-modal"
        show={showSettingsModal}
        onCancel={() => setShowSettingsModal(false)}
        onConfirm={handleSaveSettings}
        okText="Save"
        loadingText="Saving..."
        loading={savingSettings}
      >
        <LobbySettingsPanel
          inGame
          settings={settings}
          onChange={refreshSettings}
        />
      </ConfirmModal>
      <ProfileModal
        quizUser={quizUser}
        lobby={lobby}
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
      />
      <ConfirmModal
        show={showPlayersModal}
        okText="Ok"
        scroll
        hideCancel
        onConfirm={() => setShowPlayersModal(false)}
        onCancel={() => setShowPlayersModal(false)}
      >
        <span>Players</span>
        <LobbyPlayerList lobby={lobby} user={user} players={activePlayers} />
        {spectators.length > 0 && (
          <>
            <span>Spectators</span>
            <LobbyPlayerList lobby={lobby} user={user} players={spectators} />
          </>
        )}
      </ConfirmModal>

      <Dropdown toggle={<IconHamburger />} toggleClassName="game-menu-icon">
        <DropdownMenu>
          {!isSpectator && (
            <MenuItem label="Spectate" onClick={handleSpectate} />
          )}
          {isSpectator && (
            <MenuItem
              label="Join as player"
              onClick={handleJoinAsPlayer}
              locked={!canJoinAsPlayer}
            />
          )}
          <MenuItem label="Profile" onClick={() => setShowProfileModal(true)} />
          <MenuItem
            label="Settings"
            onClick={openSettings}
            locked={!canControlLobby}
          />
          <MenuItem
            label="Players..."
            onClick={() => setShowPlayersModal(true)}
            locked={!canControlLobby}
          />
          <MenuItem label="Leave" onClick={() => setShowLeaveModal(true)} />
          <MenuItem
            label="End game"
            onClick={() => setShowEndModal(true)}
            locked={!canControlLobby}
          />
        </DropdownMenu>
      </Dropdown>
    </>
  );
}

interface MenuItemProps {
  label: string;
  disabled?: boolean;
  locked?: boolean;
  onClick?: () => void;
}

function MenuItem({ label, onClick, locked, disabled }: MenuItemProps) {
  return (
    <DropdownMenuItem onClick={onClick} disabled={disabled || locked}>
      {locked ? (
        // Only current judge can click this. Show an icon on the right.
        <span className="menu-item-locked">
          {label}
          <Twemoji className="lock-icon">👑</Twemoji>
        </span>
      ) : (
        label
      )}
    </DropdownMenuItem>
  );
}
