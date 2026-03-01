/**
 * useToast.js
 *
 * Thin wrapper around react-hot-toast that provides a consistent, typed API.
 * The <Toaster /> component is already mounted in main.jsx — just import and call.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.promise(fetchFn(), { loading: '…', success: 'Done!', error: 'Failed' });
 */

import { toast as _toast } from 'react-hot-toast';

const DEFAULT_DURATION = 3500;

const baseStyle = {
  borderRadius: 'var(--radius-lg)',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  maxWidth: '400px',
};

export function useToast() {
  return {
    /** Green success notification */
    success(message, options = {}) {
      return _toast.success(message, {
        duration: DEFAULT_DURATION,
        style: {
          ...baseStyle,
          background: 'var(--color-success)',
          color: '#fff',
        },
        iconTheme: { primary: '#fff', secondary: 'var(--color-success)' },
        ...options,
      });
    },

    /** Red error notification */
    error(message, options = {}) {
      return _toast.error(message, {
        duration: DEFAULT_DURATION + 1000,
        style: {
          ...baseStyle,
          background: 'var(--color-error)',
          color: '#fff',
        },
        iconTheme: { primary: '#fff', secondary: 'var(--color-error)' },
        ...options,
      });
    },

    /** Amber warning notification */
    warning(message, options = {}) {
      return _toast(message, {
        duration: DEFAULT_DURATION,
        icon: '⚠️',
        style: {
          ...baseStyle,
          background: 'var(--color-warning-bg)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-warning-border)',
        },
        ...options,
      });
    },

    /** Blue info notification */
    info(message, options = {}) {
      return _toast(message, {
        duration: DEFAULT_DURATION,
        icon: 'ℹ️',
        style: {
          ...baseStyle,
          background: 'var(--color-info-bg)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-info-border)',
        },
        ...options,
      });
    },

    /**
     * Loading → success / error promise toaster.
     *
     * @param {Promise} promise
     * @param {{ loading: string, success: string|fn, error: string|fn }} messages
     */
    promise(promise, messages, options = {}) {
      return _toast.promise(
        promise,
        {
          loading: messages.loading ?? 'Loading…',
          success: messages.success ?? 'Done!',
          error: messages.error ?? 'An error occurred',
        },
        {
          style: baseStyle,
          success: {
            style: {
              ...baseStyle,
              background: 'var(--color-success)',
              color: '#fff',
            },
          },
          error: {
            style: {
              ...baseStyle,
              background: 'var(--color-error)',
              color: '#fff',
            },
          },
          ...options,
        }
      );
    },

    /** Dismiss a specific toast or all toasts */
    dismiss(id) {
      _toast.dismiss(id);
    },

    /** Raw access to react-hot-toast if needed */
    raw: _toast,
  };
}

export default useToast;
