import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import styles from './GlassModal.module.css';

export default function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm | md | lg | xl | full
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}) {
  const overlayRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={styles['glass-modal-overlay']}
      onClick={handleOverlayClick}
    >
      <div className={clsx(styles['glass-modal'], styles[`glass-modal--${size}`], className)}>
        {/* Header */}
        {title && (
          <div className={styles['glass-modal__header']}>
            <h2 className={styles['glass-modal__title']}>{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                className={styles['glass-modal__close']}
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M5 5l10 10M15 5l-10 10" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={styles['glass-modal__body']}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles['glass-modal__footer']}>{footer}</div>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Confirmation Modal helper
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // primary | danger
}) {
  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className={`glass-button glass-button--ghost`}
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`glass-button glass-button--${variant}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--glass-text-secondary)', lineHeight: '1.6' }}>{message}</p>
    </GlassModal>
  );
}
