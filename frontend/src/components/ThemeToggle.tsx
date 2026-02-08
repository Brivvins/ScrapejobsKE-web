import { Button } from './ui/button';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="gap-2 rounded-full"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm6.36 3.64a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 1 1-1.41-1.42l1.41-1.41a1 1 0 0 1 1.42 0zM21 11a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2zM7.05 7.05a1 1 0 0 1 0 1.41L5.64 9.87a1 1 0 1 1-1.41-1.41l1.41-1.41a1 1 0 0 1 1.41 0zM12 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm6.36-1.64a1 1 0 0 1 0 1.41 1 1 0 0 1-1.42 0l-1.41-1.41a1 1 0 0 1 1.41-1.41l1.42 1.41zM5 11a1 1 0 0 1 1 1 1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h2zm1.64 6.36a1 1 0 0 1-1.41 0 1 1 0 0 1 0-1.42l1.41-1.41a1 1 0 1 1 1.41 1.41l-1.41 1.42zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M20.4 13.1a1 1 0 0 0-1.08-.24 7 7 0 0 1-9.18-9.18 1 1 0 0 0-1.32-1.32 9 9 0 1 0 11.82 11.82 1 1 0 0 0-.24-1.08z"
          />
        </svg>
      )}
      <span className="text-xs font-semibold">{isDark ? 'Dark' : 'Light'}</span>
    </Button>
  );
}
