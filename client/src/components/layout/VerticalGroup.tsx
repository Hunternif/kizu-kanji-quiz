interface Props extends React.HTMLAttributes<HTMLElement> {}

/** A centered vertical group with aligned buttons. */
export function VerticalGroup({ className, ...props }: Props) {
  const classes = ['layout-vertical-group'];
  if (className) classes.push(className);
  return <div {...props} className={classes.join(' ')} />;
}
