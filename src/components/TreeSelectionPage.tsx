import { useNavigate } from 'react-router-dom';
import { Moon, Sun, GitBranch, Network, Database, TreePine, Binary, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from '../styles/app.module.css';

export type TreeType = 'binary' | 'avl' | 'b-tree' | 'b-plus-tree' | 'red-black' | 'trie';

interface TreeOption {
  type: TreeType;
  name: string;
  description: string;
  status: 'available' | 'coming-soon';
  route: string;
  icon: React.ReactNode;
  color: string;
}

const treeOptions: TreeOption[] = [
  {
    type: 'binary',
    name: 'Binary Search Tree',
    description: 'A basic binary tree where left child < parent < right child',
    status: 'available',
    route: '/binary',
    icon: <GitBranch size={24} />,
    color: '#3b82f6',
  },
  {
    type: 'avl',
    name: 'AVL Tree',
    description: 'Self-balancing binary search tree with height-balanced property',
    status: 'available',
    route: '/avl',
    icon: <Network size={24} />,
    color: '#8b5cf6',
  },
  {
    type: 'b-tree',
    name: 'B-Tree',
    description: 'Multi-way search tree optimized for disk access',
    status: 'available',
    route: '/b-tree',
    icon: <Database size={24} />,
    color: '#10b981',
  },
  {
    type: 'b-plus-tree',
    name: 'B+ Tree',
    description: 'Optimized variant of B-tree with data in leaf nodes',
    status: 'available',
    route: '/b-plus-tree',
    icon: <TreePine size={24} />,
    color: '#14b8a6',
  },
  {
    type: 'red-black',
    name: 'Red-Black Tree',
    description: 'Self-balancing binary search tree with color properties',
    status: 'coming-soon',
    route: '/red-black',
    icon: <Binary size={24} />,
    color: '#ef4444',
  },
  {
    type: 'trie',
    name: 'Trie Tree',
    description: 'Prefix tree for efficient string operations',
    status: 'coming-soon',
    route: '/trie',
    icon: <BookOpen size={24} />,
    color: '#f59e0b',
  },
];

export function TreeSelectionPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<string>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('btv-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('btv-theme', newTheme);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      position: 'relative',
    }}>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className={styles.btnIcon}
        style={{
          position: 'absolute',
          top: 'var(--space-4)',
          right: 'var(--space-4)',
        }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{
        maxWidth: '1200px',
        width: '100%',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'var(--fg)',
            margin: '0 0 var(--space-3) 0',
          }}>
            Tree Visualizer
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--fg-muted)',
            margin: 0,
          }}>
            Choose a tree data structure to visualize
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {treeOptions.map((option) => (
            <button
              key={option.type}
              className={styles.treeCard}
              onClick={() => option.status === 'available' && navigate(option.route)}
              disabled={option.status === 'coming-soon'}
              style={{
                opacity: option.status === 'coming-soon' ? 0.6 : 1,
                cursor: option.status === 'coming-soon' ? 'not-allowed' : 'pointer',
                ['--card-color' as any]: option.color,
              }}
            >
              {/* Icon Circle */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: `${option.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-4)',
                color: option.color,
              }}>
                {option.icon}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-2)',
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'var(--fg)',
                  margin: 0,
                }}>
                  {option.name}
                </h3>
                {option.status === 'coming-soon' && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: 'var(--accent-11)',
                    backgroundColor: 'var(--accent-3)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}>
                    Soon
                  </span>
                )}
              </div>
              <p style={{
                fontSize: '14px',
                color: 'var(--fg-muted)',
                margin: 0,
                lineHeight: '1.6',
              }}>
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
