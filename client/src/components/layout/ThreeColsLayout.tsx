import { ReactNode } from 'react';

interface RowLayoutProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

/** Layout with 3 columns: left, center, right. */
export function ThreeColsLayout({ left, center, right }: RowLayoutProps) {
  return (
    <div className="layout-3-cols">
      <div className="layout-side-column layout-column-left">{left}</div>
      <div className="layout-side-column layout-column-mid">
        <span className="light status-text">{center}</span>
      </div>
      <div className="layout-side-column layout-column-right">{right}</div>
    </div>
  );
}
