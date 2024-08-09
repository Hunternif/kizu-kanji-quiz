import { ReactNode, useEffect, useRef, useState } from 'react';
import { useClick } from '../hooks/ui-hooks';

interface Props extends React.HTMLAttributes<HTMLElement> {
  toggle: ReactNode;
  toggleClassName?: string;
  showArrow?: boolean;
}

export function Dropdown({
  toggle,
  toggleClassName,
  showArrow,
  className,
  children,
  ...props
}: Props) {
  const [show, setShow] = useState(false);

  const rootClasses = ['dropdown'];
  if (className) rootClasses.push(className);

  const toggleClasses = ['dropdown-toggle'];
  if (toggleClassName) toggleClasses.push(toggleClassName);
  if (showArrow) toggleClasses.push('with-arrow');

  function handleClick() {
    if (!show) {
      setShow(true);
    }
    // Closing will be handled by the useClickOutside
  }

  return (
    <div {...props} className={rootClasses.join(' ')}>
      <span className={toggleClasses.join(' ')} onClick={handleClick}>
        {toggle}
      </span>
      {show && (
        <DropdownContent onHide={() => setShow(false)}>
          {children}
        </DropdownContent>
      )}
    </div>
  );
}

interface ContentProps extends React.HTMLAttributes<HTMLElement> {
  onHide: () => void;
}

function DropdownContent({ children, onHide }: ContentProps) {
  // Click anywhere works on the menu itself and on the toggle.
  // Using it prevents auto-reopening when clicking on toggle again.
  // Setting the timeout so that the menu is not removed from DOM
  // before processing the click inside.
  useClick(() => setTimeout(() => onHide(), 100));
  const ref = useRef<HTMLDivElement>(null);

  // If the content is too close to the edge of the screen,
  // its 'inset' property needs to be set.
  const [stuckLeft, setStuckLeft] = useState(false);
  const [stuckRight, setStuckRight] = useState(false);

  useEffect(() => {
    if (ref.current) {
      // Check if it's attached to the left or right side of the screen:
      const rect = ref.current.getBoundingClientRect();
      const left = rect.left;
      const right = window.innerWidth - rect.right;
      if (left < rect.width) {
        setStuckLeft(true);
      }
      if (right < rect.width) {
        setStuckRight(true);
      }
    }
  }, [ref.current]);

  return (
    <div
      ref={ref}
      className="dropdown-content"
      style={{
        inset: stuckLeft
          ? '0px auto auto 0px'
          : stuckRight
          ? '0px 0px auto auto'
          : 'unset',
      }}
    >
      {children}
    </div>
  );
}

interface MenuProps extends React.HTMLAttributes<HTMLElement> {}

export function DropdownMenu({ className, ...props }: MenuProps) {
  const classes = ['dropdown-menu'];
  if (className) classes.push(className);
  return <div {...props} className={classes.join(' ')} />;
}

interface MenuItemProps extends React.HTMLAttributes<HTMLElement> {
  disabled?: boolean;
}

export function DropdownMenuItem({
  disabled,
  className,
  ...props
}: MenuItemProps) {
  const classes = ['dropdown-menu-item'];
  if (disabled) classes.push('disabled');
  if (className) classes.push(className);
  return <div {...props} className={classes.join(' ')} />;
}
