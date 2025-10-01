import { useState, forwardRef, useImperativeHandle } from 'react';
import { PlayCircle, Trash2, Zap } from 'lucide-react';
import styles from '../styles/app.module.css';
import { useTreeStore } from '../state/useTreeStore';
import { buildTree, buildTreeWithSteps, validateInput } from '../utils/buildTree';
import { executeTraversal, TraversalType } from '../utils/traversals';
import { NotificationModal } from './NotificationModal';

export interface SidebarRef {
  buildTree: () => void;
  clearTree: () => void;
  runTraversal: (type: TraversalType) => void;
}

export const Sidebar = forwardRef<SidebarRef>((props, ref) => {
  const [arrayInput, setArrayInput] = useState('');
  const [error, setError] = useState('');
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { root, setRoot, setSteps, clear, play, activeAction } = useTreeStore();

  const handleBuildTree = () => {
    setError('');

    const validation = validateInput(arrayInput);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    if (skipAnimation) {
      // Build tree instantly without animation
      const tree = buildTree(arrayInput);
      setRoot(tree);
      setSteps([]);
    } else {
      // Build tree with animation
      const { root: tree, steps } = buildTreeWithSteps(arrayInput);
      setRoot(tree);
      setSteps(steps, 'build');
      // Auto-play the build animation
      setTimeout(() => play(), 100);
    }
  };

  const handleClear = () => {
    setArrayInput('');
    setError('');
    clear();
  };

  const handleTraversal = (type: TraversalType) => {
    if (!root) {
      setIsModalOpen(true);
      return;
    }

    setError('');
    const steps = executeTraversal(root, type);
    setSteps(steps, type);
    setTimeout(() => play(), 100);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    buildTree: handleBuildTree,
    clearTree: handleClear,
    runTraversal: handleTraversal,
  }));

  return (
    <>
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="No Tree Built"
        message="Please build a tree first before using traversal actions. Enter an array in the input field above and click 'Build Tree'."
      />

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Inputs</h3>

        <div className={styles.inputGroup}>
          <label htmlFor="array-input" className={styles.label}>
            Array
          </label>
          <input
            id="array-input"
            type="text"
            className={styles.input}
            placeholder="e.g., [10, 5, 15, 3, 7, 12, 18]"
            aria-label="Array input for tree construction"
            value={arrayInput}
            onChange={(e) => setArrayInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuildTree()}
          />
          {error && (
            <p style={{ color: 'var(--red-9)', fontSize: '12px', marginTop: '4px' }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ marginTop: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="skip-animation"
            checked={skipAnimation}
            onChange={(e) => setSkipAnimation(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <label
            htmlFor="skip-animation"
            style={{ fontSize: '13px', cursor: 'pointer', color: 'var(--gray-11)' }}
          >
            <Zap size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Skip animation
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            aria-label="Build tree from array"
            onClick={handleBuildTree}
          >
            <PlayCircle size={14} />
            Build Tree
          </button>
          <button className={styles.btn} aria-label="Clear tree and inputs" onClick={handleClear}>
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Actions</h3>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.btn} ${activeAction === 'inorder' ? styles.btnPrimary : ''}`}
            aria-label="Execute in-order traversal"
            onClick={() => handleTraversal('inorder')}
            disabled={!root}
          >
            In-order
          </button>
          <button
            className={`${styles.btn} ${activeAction === 'preorder' ? styles.btnPrimary : ''}`}
            aria-label="Execute pre-order traversal"
            onClick={() => handleTraversal('preorder')}
            disabled={!root}
          >
            Pre-order
          </button>
          <button
            className={`${styles.btn} ${activeAction === 'postorder' ? styles.btnPrimary : ''}`}
            aria-label="Execute post-order traversal"
            onClick={() => handleTraversal('postorder')}
            disabled={!root}
          >
            Post-order
          </button>
          <button
            className={`${styles.btn} ${activeAction === 'levelorder' ? styles.btnPrimary : ''}`}
            aria-label="Execute level-order traversal"
            onClick={() => handleTraversal('levelorder')}
            disabled={!root}
          >
            Level-order
          </button>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
