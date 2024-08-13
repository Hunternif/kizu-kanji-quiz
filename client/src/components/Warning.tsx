import { IconWarningInline } from './Icons';

interface WarningProps extends React.HTMLAttributes<HTMLElement> {}

export function Warning({ className, children, ...props }: WarningProps) {
  const classes = ['warning'];
  if (className) classes.push(className);
  return (
    <div {...props} className={classes.join(' ')}>
      <IconWarningInline /> {children}
    </div>
  );
}
