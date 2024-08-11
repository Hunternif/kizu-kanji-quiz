import { detectJapanese } from '../../../shared/text-utils';

interface Props extends React.HTMLAttributes<HTMLElement> {
  text: string;
  /** Threshold for what is considered short */
  short?: number;
  /** Threshold for what is considered medium */
  medium?: number;
  /** If true, Japanese words will be split with comma '、' and made non-breaking */
  splitJapWords?: boolean;
}

export function JapText({
  className,
  text,
  short,
  medium,
  splitJapWords,
  ...props
}: Props) {
  if (short === undefined) short = 3;
  if (medium === undefined) medium = 20;

  const classes = ['jap-text'];
  const japWords = new Array<string>();

  if (className) classes.push(className);
  if (detectJapanese(text)) {
    classes.push('jp');
    if (splitJapWords) {
      japWords.push(...text.split(', '));
    }
  }

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
      {japWords.length > 0
        ? japWords.map((w) => (
            <span key={w} className="jap-word">
              {w}
            </span>
          ))
        : text}
    </span>
  );
}
