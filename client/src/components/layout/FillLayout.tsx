interface LayoutProps extends React.HTMLAttributes<HTMLElement> {}

/** Fills all available space */
export function FillLayout({ className, ...props }: LayoutProps) {
  const classes = ['layout-fill'];
  if (className) classes.push(className);
  return <div {...props} className={classes.join(' ')} />;
}
