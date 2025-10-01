import { AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';
import styles from '../styles/app.module.css';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function NotificationModal({ isOpen, onClose, title, message }: NotificationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '400px' }}
      >
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} style={{ color: 'var(--accent-9)' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{title}</h3>
            <button
              className={styles.btnIcon}
              onClick={onClose}
              aria-label="Close notification"
              style={{ marginLeft: 'auto' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--fg)', lineHeight: '1.6' }}>
            {message}
          </p>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onClose}>
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
