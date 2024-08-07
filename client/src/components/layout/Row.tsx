interface RowProps extends React.HTMLAttributes<HTMLElement> {}

/** A horizontal row. Imitates Bootstrap's 'row'. */
export function Row({ className, ...props }: RowProps) {
  const classes = ['row'];
  if (className) classes.push(className);
  return <div {...props} className={classes.join(' ')} />;
}
