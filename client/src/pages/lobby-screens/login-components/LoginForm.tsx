import { CSSProperties } from 'react';
import { GameButton } from '../../../components/Buttons';
import { TextInput } from '../../../components/FormControls';

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const buttonContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.5rem',
};

const buttonStyle: CSSProperties = {
  width: 'calc(50% - 0.5rem)',
};

export function LoginForm() {
  return (
    <form style={formStyle}>
      <TextInput onChange={async () => {}} placeholder="Login"></TextInput>
      <TextInput
        password
        onChange={async () => {}}
        placeholder="Password"
      ></TextInput>
      <div style={buttonContainerStyle}>
        <GameButton style={buttonStyle} inline>
          Sign in
        </GameButton>
        <GameButton style={buttonStyle} secondary>
          Register
        </GameButton>
      </div>
    </form>
  );
}
