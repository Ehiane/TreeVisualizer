import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/app.module.css';

interface Command {
  id: string;
  label: string;
  description?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export function CommandPalette({ isOpen, onClose, commands }: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={16} style={{ color: 'var(--fg-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Search commands..."
              style={{ border: 'none', padding: 0, background: 'transparent' }}
              aria-label="Command search input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className={styles.btnIcon}
              onClick={onClose}
              aria-label="Close command palette"
              style={{ marginLeft: 'auto' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--gray-11)' }}>
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={styles.popupItem}
                style={{
                  backgroundColor: idx === selectedIndex ? 'var(--accent-3)' : undefined,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  cmd.action();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div>{cmd.label}</div>
                {cmd.description && (
                  <div style={{ fontSize: '12px', color: 'var(--gray-11)', marginTop: '2px' }}>
                    {cmd.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
