import { ReactNode, useState } from 'react';
import { IconArowLeft, IconHamburger } from '../Icons';
import { ModalBackdrop } from '../ModalBackdrop';
import { Col } from './Col';
import { FillLayout } from './FillLayout';
import { RowLayout } from './RowLayout';
import { ScreenSizeSwitch } from './ScreenSizeSwitch';

interface Props extends React.HTMLAttributes<HTMLElement> {
  sidebar: ReactNode;
  /** Things that appear next to the hamburger button, when the sidebar collapses. */
  collapsedHeader?: ReactNode;
  sidebarClassName?: string;
  /** Max screen width when the sidebar collapses. Defaults to 600px. */
  widthBreakpoint?: number;
}

/**
 * A layout with 2 columns: sidebar and main content.
 * When the screen becomes too small (e.g. on mobile),
 * the sidebar collapses and opens in a popup.
 */
export function SidebarLayout({className, ...props}: Props) {
  const { widthBreakpoint } = props;
  const classes = ["layout-with-sidebar"];
  if (className) classes.push(className);
  return (
    <FillLayout className={classes.join(' ')}>
      <ScreenSizeSwitch
        widthBreakpoint={widthBreakpoint ?? 600}
        smallScreen={<SmallScreen {...props} />}
        bigScreen={<BigScreen {...props} />}
      />
    </FillLayout>
  );
}

function BigScreen({ sidebar, sidebarClassName, children }: Props) {
  const sidebarClasses = ['layout-sidebar-column'];
  if (sidebarClassName) sidebarClasses.push(sidebarClassName);
  return (
    <RowLayout>
      <Col className={sidebarClasses.join(' ')}>{sidebar}</Col>
      <Col className="layout-main-column">{children}</Col>
    </RowLayout>
  );
}

function SmallScreen({
  sidebar,
  sidebarClassName,
  collapsedHeader,
  children,
}: Props) {
  const [sidebarShown, setSidebarShown] = useState(false);
  function showSidebar() {
    setSidebarShown(true);
  }
  function hideSidebar() {
    setSidebarShown(false);
  }
  const sidebarClasses = ['layout-sidebar-overlay'];
  if (sidebarClassName) sidebarClasses.push(sidebarClassName);
  return (
    <>
      {sidebarShown ? (
        <>
          <div className={sidebarClasses.join(' ')}>
            <div className="hide-button" onClick={hideSidebar}>
              <IconArowLeft width={20} height={20} />
            </div>
            {sidebar}
          </div>
          <ModalBackdrop onClick={hideSidebar} />
        </>
      ) : (
        <div className="collapsed-header">
          <div className="show-button" onClick={showSidebar}>
            <IconHamburger width={20} height={20} />
          </div>
          {collapsedHeader}
        </div>
      )}
      <Col className="layout-main-column">{children}</Col>
    </>
  );
}
