interface Props extends React.HTMLAttributes<HTMLElement> {}

/** A centered horizontal group with aligned buttons. */
export function HorizontalGroup({ className, ...props }: Props) {
  const classes = ['layout-horizontal-group'];
  if (className) classes.push(className);
  return <div {...props} className={classes.join(' ')} />;
}
