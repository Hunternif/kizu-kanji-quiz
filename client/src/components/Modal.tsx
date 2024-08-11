import { ReactNode } from 'react';
import { useKeyDown } from '../hooks/ui-hooks';
import { LoadingSpinner } from './LoadingSpinner';
import { ModalBackdrop } from './ModalBackdrop';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  show: boolean;
  title?: string;
  noFade?: boolean;
  /** If true, will not render the background */
  transparent?: boolean;
  onHide?: () => void;
  closeButton?: boolean;
}

/** Modal card centered over the screen. */
export function Modal(props: ModalProps) {
  if (!props.show) return null;
  return <ShownModal {...props} />;
}

function ShownModal({
  show,
  title,
  noFade,
  transparent,
  onHide,
  children,
  closeButton,
  className,
  ...props
}: ModalProps) {
  useKeyDown(() => show && onHide && onHide(), ['Escape']);
  const cardClasses = ['modal-card'];
  if (className) cardClasses.push(className);
  if (transparent) cardClasses.push('transparent');
  return (
    <>
      {!noFade && <ModalBackdrop style={{ zIndex: '19' }} />}
      <div className="modal-container" onMouseDown={onHide}>
        <div
          {...props}
          className={cardClasses.join(' ')}
          // Prevent clicking on the card from closing the modal:
          onMouseDown={(e) => e.stopPropagation()}
        >
          {(title || closeButton) && (
            <header>
              {title && <span className="modal-title">{title}</span>}
              {closeButton && (
                <button
                  className="modal-close-button"
                  onClick={onHide}
                ></button>
              )}
            </header>
          )}
          {children}
        </div>
      </div>
    </>
  );
}

interface BodyProps {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  /**
   * The default "short format" is used for small pop-up messages
   * with little text. Short text is styled: e.g. made bigger and centered.
   * "Long format" doesn't apply extra styling to text.
   */
  longFormat?: boolean;
  /** If true, content will have a vertical scroller */
  scroll?: boolean;
}

export function ModalBody({
  children,
  loadingText,
  loading,
  longFormat,
  scroll,
}: BodyProps) {
  const classes = ['modal-body'];
  if (longFormat) classes.push('long-format');
  if (scroll) classes.push('scroll');
  return (
    <div className={classes.join(' ')}>
      {loading ? <LoadingSpinner text={loadingText} /> : children}
    </div>
  );
}

interface FooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: FooterProps) {
  return <footer className="modal-footer">{children}</footer>;
}
