/**
 * ConfirmModal.jsx
 *
 * A reusable confirmation dialog that renders on top of the existing Modal
 * primitive.
 *
 * Props:
 *   isOpen        boolean   — controls visibility
 *   onClose       fn        — called when user cancels or closes
 *   onConfirm     fn        — called when user confirms (may be async)
 *   title         string    — modal heading
 *   message       string    — body text / description
 *   confirmLabel  string    — confirm button text (default "Confirm")
 *   cancelLabel   string    — cancel button text (default "Cancel")
 *   variant       string    — "danger" | "warning" | "primary" (default "danger")
 *   isLoading     boolean   — shows spinner on confirm button
 */

import React, { useCallback } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, X } from 'lucide-react';
import './ConfirmModal.css';

const VARIANT_META = {
  danger: {
    Icon: Trash2,
    iconClass: 'cm-icon--danger',
    btnClass: 'cm-btn--danger',
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'cm-icon--warning',
    btnClass: 'cm-btn--warning',
  },
  primary: {
    Icon: CheckCircle,
    iconClass: 'cm-icon--primary',
    btnClass: 'cm-btn--primary',
  },
  info: {
    Icon: Info,
    iconClass: 'cm-icon--info',
    btnClass: 'cm-btn--info',
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const meta = VARIANT_META[variant] ?? VARIANT_META.danger;
  const { Icon } = meta;

  const handleConfirm = useCallback(async () => {
    if (isLoading) return;
    await onConfirm?.();
  }, [isLoading, onConfirm]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose?.();
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="cm-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="cm-panel" role="document">
        {/* Close button */}
        <button className="cm-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Icon */}
        <div className={`cm-icon-wrap ${meta.iconClass}`}>
          <Icon size={28} />
        </div>

        {/* Content */}
        <h2 className="cm-title">{title}</h2>
        <p className="cm-message">{message}</p>

        {/* Actions */}
        <div className="cm-actions">
          <button
            className="cm-btn cm-btn--cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            className={`cm-btn ${meta.btnClass}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="cm-spinner" aria-hidden="true" />
            ) : null}
            {isLoading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
