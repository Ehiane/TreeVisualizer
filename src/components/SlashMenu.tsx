import { useEffect, useRef } from 'react';
import styles from '../styles/app.module.css';

interface SlashMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function SlashMenu({ isOpen, onClose, position }: SlashMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // TODO: wire algorithms here - add slash command execution logic

  const style = position
    ? { top: position.y, left: position.x }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <div ref={menuRef} className={styles.popup} style={style}>
      <div className={styles.popupItem}>Build Tree</div>
      <div className={styles.popupItem}>Clear Tree</div>
      <div className={styles.hairline} />
      <div className={styles.popupItem}>In-order Traversal</div>
      <div className={styles.popupItem}>Pre-order Traversal</div>
      <div className={styles.popupItem}>Post-order Traversal</div>
      <div className={styles.popupItem}>Level-order Traversal</div>
    </div>
  );
}
