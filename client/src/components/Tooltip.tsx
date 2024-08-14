import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  tooltip: ReactNode;
}

export function Tooltip({ children, tooltip }: Props) {
  return (
    <div className="tooltip-container">
      {children}
      <TooltipPanel>{tooltip}</TooltipPanel>
    </div>
  );
}

interface PanelProps extends React.HTMLAttributes<HTMLElement> {}

export function TooltipPanel({ className, ...props }: PanelProps) {
  return <div {...props} className={`tooltip-panel ${className}`} />;
}
