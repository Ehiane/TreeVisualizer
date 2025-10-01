import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from '../styles/app.module.css';

interface TopbarProps {
  onSearchClick: () => void;
  onLeftMenuClick: () => void;
  onRightMenuClick: () => void;
  isLeftDrawerOpen: boolean;
  isRightDrawerOpen: boolean;
}

export function Topbar({
  onSearchClick,
  onLeftMenuClick,
  onRightMenuClick,
  isLeftDrawerOpen,
  isRightDrawerOpen,
}: TopbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('btv-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('btv-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <button
          className={`${styles.btn} ${styles.btnIcon} ${styles.mobileMenuBtn}`}
          onClick={onLeftMenuClick}
          aria-label="Toggle sidebar"
        >
          {isLeftDrawerOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <div className={styles.badge}>Binary Tree Visualizer</div>
      </div>

      <div className={styles.toolbarCenter}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Ctrl/⌘ K"
          readOnly
          onClick={onSearchClick}
          aria-label="Search (Ctrl/Command+K)"
        />
      </div>

      <div className={styles.toolbarRight}>
        <button
          className={`${styles.btn} ${styles.btnIcon}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button
          className={`${styles.btn} ${styles.btnIcon} ${styles.mobileMenuBtn}`}
          onClick={onRightMenuClick}
          aria-label="Toggle step log"
        >
          {isRightDrawerOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
    </div>
  );
}
