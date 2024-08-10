import { useState } from 'react';
import { updateUserData } from '../../../api/users-api';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { TextInput } from '../../../components/FormControls';
import { useHandler } from '../../../hooks/data-hooks';
import { GameLobby, QuizUser } from '../../../shared/types';
import {
  getPlayerInLobby,
  updatePlayer,
} from '../../../api/lobby/lobby-player-api';

type Props = {
  quizUser: QuizUser;
  /** The current lobby, if the user is in game. */
  lobby?: GameLobby;
  show: boolean;
  onHide: () => void;
};

export function ProfileModal({ quizUser, lobby, show, onHide }: Props) {
  const [name, setName] = useState<string>(quizUser.name);

  const [handleSave, saving] = useHandler(async () => {
    await updateUserData(quizUser.uid, name);
    if (lobby) {
      // Update user name in the lobby
      const player = await getPlayerInLobby(lobby.id, quizUser.uid);
      if (player) {
        player.name = name;
        updatePlayer(lobby.id, player);
      }
    }
    onHide();
  }, [quizUser.uid, lobby, name]);

  function handleCancel() {
    setName(quizUser.name);
    onHide();
  }

  return (
    <ConfirmModal
      className="profile-modal"
      show={show}
      onConfirm={handleSave}
      onCancel={handleCancel}
      okText="Save"
      loading={saving}
      loadingText="Saving..."
      title="Profile"
    >
      <label>Display name:</label>
      <TextInput onChange={async (val) => setName(val)} value={name} />
    </ConfirmModal>
  );
}
