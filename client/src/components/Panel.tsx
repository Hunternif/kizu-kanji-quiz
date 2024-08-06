interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Panel({ className, ...props }: PanelProps) {
  const classes = ['panel'];
  if (className) classes.push(className);
  return <div className={classes.join(' ')} {...props} />;
}
