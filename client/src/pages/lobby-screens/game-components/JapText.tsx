import { detectJapanese } from '../../../shared/text-utils';

interface Props extends React.HTMLAttributes<HTMLElement> {
  text: string;
}

export function JapText({ className, text, ...props }: Props) {
  const classes = ['jap-text'];
  if (className) classes.push(className);
  if (detectJapanese(text)) classes.push('jp');
  return (
    <span {...props} className={classes.join(' ')}>
      {text}
    </span>
  );
}
