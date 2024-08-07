import { useContext, useState } from 'react';
import { kickPlayer } from '../../../api/lobby/lobby-player-api';
import { GameButton } from '../../../components/Buttons';
import { ErrorContext } from '../../../components/ErrorContext';
import { Modal, ModalBody, ModalFooter } from '../../../components/Modal';
import { Twemoji } from '../../../components/Twemoji';
import { GameLobby, KickAction, PlayerInLobby } from '../../../shared/types';

interface PlayerProps {
  lobby: GameLobby;
  player: PlayerInLobby;
  isMe?: boolean;
  isCreator?: boolean;
  isJudge?: boolean;
  canKick?: boolean;
}

/**
 * Renders a pill with player name and some controls.
 * Should be used inside player list, either in lobby or in game.
 */
export function PlayerCard({
  lobby,
  player,
  isMe,
  isCreator,
  isJudge,
  canKick,
}: PlayerProps) {
  const { setError } = useContext(ErrorContext);
  const [showKickModal, setShowKickModal] = useState(false);
  const [kicking, setKicking] = useState(false);

  const classes = ['player-card'];
  if (isMe) classes.push('me-card');
  if (isJudge) classes.push('judge-card');
  if (isCreator) classes.push('creator-card');

  async function executeKick(action: KickAction) {
    setKicking(true);
    try {
      await kickPlayer(lobby, player, action);
      setShowKickModal(false);
    } catch (e: any) {
      setError(e);
    } finally {
      setKicking(false);
    }
  }

  async function handleBan() {
    await executeKick('ban');
  }

  async function handleKick() {
    await executeKick('kick');
  }

  return (
    <>
      <Modal show={showKickModal} onHide={() => setShowKickModal(false)}>
        <ModalBody loading={kicking}>Kick {player.name} out?</ModalBody>
        <ModalFooter>
          <GameButton onClick={handleBan} accent disabled={kicking}>
            Ban
          </GameButton>
          <GameButton onClick={handleKick} disabled={kicking}>
            Kick
          </GameButton>
          <GameButton
            onClick={() => setShowKickModal(false)}
            disabled={kicking}
          >
            Cancel
          </GameButton>
        </ModalFooter>
      </Modal>

      <div className={classes.join(' ')}>
        {/* Avator goes here */}
        <span className="player-name">{player.name}</span>
        <span className="right-group">
          {isJudge && <Twemoji className="right-icon">👑</Twemoji>}
          {player.status === 'banned' ? (
            <Twemoji className="right-icon">💀</Twemoji>
          ) : (
            canKick &&
            !isMe && (
              <span
                className="right-icon kick-button"
                title="Kick player"
                onClick={() => setShowKickModal(true)}
              />
            )
          )}
        </span>
      </div>
    </>
  );
}

export function EmptyPlayerCard() {
  return (
    <div className="player-card empty">
      <div className="avatar inline-avatar empty-avatar" />
      <span>Empty</span>
    </div>
  );
}
