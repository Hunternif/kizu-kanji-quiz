import { detectJapanese } from '../../../shared/text-utils';

interface Props extends React.HTMLAttributes<HTMLElement> {
  text: string;
  /** Threshold for what is considered short */
  short?: number;
  /** Threshold for what is considered medium */
  medium?: number;
}

export function JapText({ className, text, short, medium, ...props }: Props) {
  if (short === undefined) short = 3;
  if (medium === undefined) medium = 20;
  const classes = ['jap-text'];
  if (className) classes.push(className);
  if (detectJapanese(text)) classes.push('jp');
  classes.push(
    text.length > medium
      ? 'long'
      : text.length > short
      ? 'medium'
      : text.length > 1
      ? 'short'
      : 'one',
  );
  return (
    <span {...props} className={classes.join(' ')}>
      {text}
    </span>
  );
}
