interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  flex?: boolean;
}

export function Panel({ className, flex, ...props }: PanelProps) {
  const classes = ['panel'];
  if (className) classes.push(className);
  if (flex) classes.push('panel-flex');
  return <div className={classes.join(' ')} {...props} />;
}
