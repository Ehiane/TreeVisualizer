import { useNavigate } from 'react-router-dom';
import { Moon, Sun, GitBranch, Network, Database, TreePine, Binary, BookOpen, Github } from 'lucide-react';
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
    status: 'available',
    route: '/red-black',
    icon: <Binary size={24} />,
    color: '#ef4444',
  },
  {
    type: 'trie',
    name: 'Trie Tree',
    description: 'Prefix tree for efficient string operations',
    status: 'available',
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
            Tree Inspect
          </h1>
          <p style={{
            fontSize: '20px',
            fontWeight: '500',
            color: 'var(--fg-muted)',
            margin: '0 0 var(--space-2) 0',
          }}>
            The Ultimate Tree Visualizer for any
            <span
              style={{
                animation: 'rainbow-glow 3s linear infinite',
                cursor: 'help',
                fontWeight: '700',
              }}
              title="Request new tree types via feedback (button at the bottom-right)!"
            >
              *
            </span>
            {' '}Tree type
          </p>
          <p style={{
            fontSize: '16px',
            color: 'var(--fg-muted)',
            margin: 0,
          }}>
            Choose a tree data structure to visualize
          </p>
          <style>{`
            @keyframes rainbow-glow {
              0% { color: #ef4444; text-shadow: 0 0 10px #ef4444; }
              16.67% { color: #f97316; text-shadow: 0 0 10px #f97316; }
              33.33% { color: #f59e0b; text-shadow: 0 0 10px #f59e0b; }
              50% { color: #22c55e; text-shadow: 0 0 10px #22c55e; }
              66.67% { color: #3b82f6; text-shadow: 0 0 10px #3b82f6; }
              83.33% { color: #8b5cf6; text-shadow: 0 0 10px #8b5cf6; }
              100% { color: #ef4444; text-shadow: 0 0 10px #ef4444; }
            }
          `}</style>
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

        {/* Footer */}
        <footer style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--fg-muted)',
            margin: '0 0 12px 0',
          }}>
            Built by <a
              href="https://github.com/Ehiane"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent-9)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Ehiane
            </a>
          </p>
          <a
            href="https://github.com/Ehiane/TreeVisualizer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: 'var(--fg-muted)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-9)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fg-muted)'}
          >
            <Github size={16} />
            View on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
