interface ColProps extends React.HTMLAttributes<HTMLElement> {}

/** A vertical column. Imitates Bootstrap's 'col'. */
export function Col({ className, ...props }: ColProps) {
  const classes = ['col'];
  if (className) classes.push(className);
  return <div {...props} className={classes.join(' ')} />;
}
