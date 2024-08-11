import { Modal, ModalBody } from './Modal';

interface Props {
  error?: any;
  /** Used for clearing the error */
  setError: (error: any) => void;
}

export function ErrorModal({ error, setError }: Props) {
  let text = 'An error occurred';
  if (typeof(error) === 'string') {
    text = error;
  } else if (error instanceof Error) {
    text = error.message;
  }
  return (
    <Modal
      closeButton
      show={error != undefined}
      onHide={() => setError(null)}
      className="error-modal"
      title="Error"
    >
      <ModalBody>{text}</ModalBody>
    </Modal>
  );
}
