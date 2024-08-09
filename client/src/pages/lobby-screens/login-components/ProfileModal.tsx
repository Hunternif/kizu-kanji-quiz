import { useState } from 'react';
import { updateUserData } from '../../../api/users-api';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { TextInput } from '../../../components/FormControls';
import { useHandler } from '../../../hooks/data-hooks';
import { QuizUser } from '../../../shared/types';

type Props = {
  quizUser: QuizUser;
  show: boolean;
  onHide: () => void;
};

export function ProfileModal({ show, quizUser, onHide }: Props) {
  const [name, setName] = useState<string>(quizUser.name);

  const [handleSave, saving] = useHandler(async () => {
    await updateUserData(quizUser.uid, name);
    onHide();
  }, [quizUser.uid, name]);

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
