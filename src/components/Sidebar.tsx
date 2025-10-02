import { useState, forwardRef, useImperativeHandle } from 'react';
import { PlayCircle, Trash2, Zap, Search, Plus, Minus } from 'lucide-react';
import styles from '../styles/app.module.css';
import { useTreeStore } from '../state/useTreeStore';
import { buildTree, buildTreeWithSteps, validateInput } from '../utils/buildTree';
import { buildAVLTree, buildAVLTreeWithSteps } from '../utils/avlTree';
import { executeTraversal, TraversalType } from '../utils/traversals';
import { insertWithSteps, searchWithSteps, deleteWithSteps } from '../utils/bstOperations';
import { insertAVLWithSteps, searchAVLWithSteps, deleteAVLWithSteps } from '../utils/avlOperations';
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
  const [insertValue, setInsertValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const { root, setRoot, setSteps, clear, play, activeAction, treeType } = useTreeStore();

  const handleBuildTree = () => {
    setError('');

    const validation = validateInput(arrayInput);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    if (skipAnimation) {
      // Build tree instantly without animation
      const tree = treeType === 'avl' ? buildAVLTree(arrayInput) : buildTree(arrayInput);
      setRoot(tree);
      setSteps([]);
    } else {
      // Build tree with animation
      const { root: tree, steps } = treeType === 'avl'
        ? buildAVLTreeWithSteps(arrayInput)
        : buildTreeWithSteps(arrayInput);
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

  const handleInsert = () => {
    if (!root || !insertValue.trim()) return;

    const { root: newRoot, steps } = treeType === 'avl'
      ? insertAVLWithSteps(root, insertValue)
      : insertWithSteps(root, insertValue);
    setRoot(newRoot);
    setSteps(steps, 'insert');
    setInsertValue('');
    setTimeout(() => play(), 100);
  };

  const handleDelete = () => {
    if (!root || !deleteValue.trim()) return;

    const { root: newRoot, steps } = treeType === 'avl'
      ? deleteAVLWithSteps(root, deleteValue)
      : deleteWithSteps(root, deleteValue);
    setRoot(newRoot);
    setSteps(steps, 'delete');
    setDeleteValue('');
    setTimeout(() => play(), 100);
  };

  const handleSearch = () => {
    if (!root || !searchValue.trim()) return;

    const { steps } = treeType === 'avl'
      ? searchAVLWithSteps(root, searchValue)
      : searchWithSteps(root, searchValue);
    setSteps(steps, 'search');
    setSearchValue('');
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
        <h3 className={styles.cardTitle}>Input</h3>

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

      {(treeType === 'binary' || treeType === 'avl') && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Operations</h3>

          <div className={styles.inputGroup}>
            <label htmlFor="insert-input" className={styles.label}>
              Insert
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="insert-input"
                type="text"
                className={styles.input}
                placeholder="Value"
                value={insertValue}
                onChange={(e) => setInsertValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
              />
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleInsert}
                disabled={!root || !insertValue}
                aria-label="Insert value"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="delete-input" className={styles.label}>
              Delete
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="delete-input"
                type="text"
                className={styles.input}
                placeholder="Value"
                value={deleteValue}
                onChange={(e) => setDeleteValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
              />
              <button
                className={styles.btn}
                onClick={handleDelete}
                disabled={!root || !deleteValue}
                aria-label="Delete value"
              >
                <Minus size={14} />
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="search-input" className={styles.label}>
              Search
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="search-input"
                type="text"
                className={styles.input}
                placeholder="Value"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                className={styles.btn}
                onClick={handleSearch}
                disabled={!root || !searchValue}
                aria-label="Search value"
              >
                <Search size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Traversals</h3>

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
