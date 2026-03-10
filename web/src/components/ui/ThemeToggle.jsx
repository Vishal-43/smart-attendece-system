import { useTheme } from '../../contexts/ThemeContext';
import clsx from 'clsx';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle({ compact = false, showLabel = false, className }) {
  const { theme, toggleTheme } = useTheme();

  const SunIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );

  const MoonIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  if (showLabel) {
    return (
      <button
        type="button"
        className={clsx(styles['theme-toggle-labeled'], className)}
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <span className={styles['theme-toggle__icon']}>
          {theme === 'light' ? <SunIcon /> : <MoonIcon />}
        </span>
        <span className={styles['theme-toggle-labeled__label']}>
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={clsx(
        styles['theme-toggle'],
        { [styles['theme-toggle--compact']]: compact },
        className
      )}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className={clsx(styles['theme-toggle__icon'], styles['theme-toggle__icon--sun'])}>
        <SunIcon />
      </span>
      <span className={clsx(styles['theme-toggle__icon'], styles['theme-toggle__icon--moon'])}>
        <MoonIcon />
      </span>
    </button>
  );
}
