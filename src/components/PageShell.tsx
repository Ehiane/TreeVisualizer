import { ReactNode } from 'react';
import styles from '../styles/app.module.css';

interface PageShellProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  isLeftDrawerOpen?: boolean;
  isRightDrawerOpen?: boolean;
  onCloseLeftDrawer?: () => void;
  onCloseRightDrawer?: () => void;
}

export function PageShell({
  left,
  center,
  right,
  isLeftDrawerOpen = false,
  isRightDrawerOpen = false,
  onCloseLeftDrawer,
  onCloseRightDrawer,
}: PageShellProps) {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.column}>{left}</div>
        <div className={styles.column}>{center}</div>
        <div className={styles.column}>{right}</div>
      </div>

      {isLeftDrawerOpen && (
        <>
          <div className={styles.drawerBackdrop} onClick={onCloseLeftDrawer} />
          <div className={`${styles.drawer} ${styles.drawerOpen}`}>{left}</div>
        </>
      )}

      {isRightDrawerOpen && (
        <>
          <div className={styles.drawerBackdrop} onClick={onCloseRightDrawer} />
          <div className={`${styles.drawer} ${styles.drawerRight} ${styles.drawerOpen}`}>
            {right}
          </div>
        </>
      )}
    </>
  );
}
