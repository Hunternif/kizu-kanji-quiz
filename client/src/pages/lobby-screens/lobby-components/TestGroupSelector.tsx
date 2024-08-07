import { User } from 'firebase/auth';
import { GameLobby } from '../../../shared/types';

interface SelectorProps {
  user: User;
  lobby: GameLobby;
  readOnly?: boolean;
}

export function TestGroupSelector(props: SelectorProps) {
  return <div className="test-group-selector"></div>;
}
