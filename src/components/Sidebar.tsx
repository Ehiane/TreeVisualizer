import { useState, forwardRef, useImperativeHandle } from 'react';
import { PlayCircle, Trash2, Zap, Search, Plus, Minus, Info } from 'lucide-react';
import styles from '../styles/app.module.css';
import { useTreeStore } from '../state/useTreeStore';
import { buildTree, buildTreeWithSteps, validateInput } from '../utils/buildTree';
import { buildAVLTree, buildAVLTreeWithSteps } from '../utils/avlTree';
import { buildBTree, buildBTreeWithSteps, setMinDegree } from '../utils/bTree';
import { executeTraversal, TraversalType } from '../utils/traversals';
import { executeBTreeTraversal, BTreeTraversalType } from '../utils/bTreeTraversals';
import { insertWithSteps, searchWithSteps, deleteWithSteps } from '../utils/bstOperations';
import { insertAVLWithSteps, searchAVLWithSteps, deleteAVLWithSteps } from '../utils/avlOperations';
import { insertBTreeWithSteps, searchBTreeWithSteps as searchBTree, deleteBTreeWithSteps } from '../utils/bTreeOperations';
import { NotificationModal } from './NotificationModal';

export interface SidebarRef {
  buildTree: () => void;
  clearTree: () => void;
  runTraversal: (type: TraversalType | BTreeTraversalType) => void;
}

export const Sidebar = forwardRef<SidebarRef>((props, ref) => {
  const [arrayInput, setArrayInput] = useState('');
  const [error, setError] = useState('');
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insertValue, setInsertValue] = useState('');
  const [deleteValue, setDeleteValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [minDegree, setMinDegree] = useState('3');
  const [showMinDegreeInfo, setShowMinDegreeInfo] = useState(false);
  const [minDegreeError, setMinDegreeError] = useState('');
  const [insertError, setInsertError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [searchError, setSearchError] = useState('');

  const { root, setRoot, setSteps, clear, play, activeAction, treeType } = useTreeStore();

  const handleBuildTree = () => {
    setError('');
    setMinDegreeError('');

    const validation = validateInput(arrayInput);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return;
    }

    // Set minimum degree for B-Trees
    if (treeType === 'b-tree') {
      const degree = parseInt(minDegree);

      if (isNaN(degree)) {
        setMinDegreeError('Minimum degree must be a number');
        return;
      }

      if (degree < 2) {
        setMinDegreeError('Minimum degree must be at least 2');
        return;
      }

      if (degree > 100) {
        setMinDegreeError('Minimum degree too large (max: 100)');
        return;
      }

      if (!Number.isInteger(degree)) {
        setMinDegreeError('Minimum degree must be a whole number');
        return;
      }

      setMinDegree(degree);
    }

    if (skipAnimation) {
      // Build tree instantly without animation
      const tree = treeType === 'avl'
        ? buildAVLTree(arrayInput)
        : treeType === 'b-tree'
        ? buildBTree(arrayInput)
        : buildTree(arrayInput);
      setRoot(tree);
      setSteps([]);
    } else {
      // Build tree with animation
      const { root: tree, steps } = treeType === 'avl'
        ? buildAVLTreeWithSteps(arrayInput)
        : treeType === 'b-tree'
        ? buildBTreeWithSteps(arrayInput)
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
    setMinDegreeError('');
    setInsertError('');
    setDeleteError('');
    setSearchError('');
    clear();
  };

  const handleTraversal = (type: TraversalType | BTreeTraversalType) => {
    if (!root) {
      setIsModalOpen(true);
      return;
    }

    setError('');

    // Use B-Tree traversals for B-Trees
    const steps = treeType === 'b-tree'
      ? executeBTreeTraversal(root, type as BTreeTraversalType)
      : executeTraversal(root, type as TraversalType);

    setSteps(steps, type);
    setTimeout(() => play(), 100);
  };

  const validateOperationInput = (input: string, operationName: string): { valid: boolean; error?: string } => {
    if (!input.trim()) {
      return { valid: false, error: `Please enter value(s) to ${operationName}` };
    }

    // Parse input - handle array notation or comma-separated values
    const cleanInput = input.trim().replace(/^\[|\]$/g, '');
    const values = cleanInput
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v !== '');

    if (values.length === 0) {
      return { valid: false, error: 'No valid values found' };
    }

    for (const v of values) {
      if (isNaN(parseFloat(v))) {
        return { valid: false, error: `Invalid number: "${v}"` };
      }
    }

    return { valid: true };
  };

  const handleInsert = () => {
    setInsertError('');

    if (!root) {
      setInsertError('Please build a tree first');
      return;
    }

    const validation = validateOperationInput(insertValue, 'insert');
    if (!validation.valid) {
      setInsertError(validation.error || 'Invalid input');
      return;
    }

    const { root: newRoot, steps } = treeType === 'avl'
      ? insertAVLWithSteps(root, insertValue)
      : treeType === 'b-tree'
      ? insertBTreeWithSteps(root, insertValue, parseInt(minDegree) || 3)
      : insertWithSteps(root, insertValue);
    setRoot(newRoot);
    setSteps(steps, 'insert');
    setInsertValue('');
    setTimeout(() => play(), 100);
  };

  const handleDelete = () => {
    setDeleteError('');

    if (!root) {
      setDeleteError('Please build a tree first');
      return;
    }

    const validation = validateOperationInput(deleteValue, 'delete');
    if (!validation.valid) {
      setDeleteError(validation.error || 'Invalid input');
      return;
    }

    const { root: newRoot, steps } = treeType === 'avl'
      ? deleteAVLWithSteps(root, deleteValue)
      : treeType === 'b-tree'
      ? deleteBTreeWithSteps(root, deleteValue, parseInt(minDegree) || 3)
      : deleteWithSteps(root, deleteValue);
    setRoot(newRoot);
    setSteps(steps, 'delete');
    setDeleteValue('');
    setTimeout(() => play(), 100);
  };

  const handleSearch = () => {
    setSearchError('');

    if (!root) {
      setSearchError('Please build a tree first');
      return;
    }

    const validation = validateOperationInput(searchValue, 'search for');
    if (!validation.valid) {
      setSearchError(validation.error || 'Invalid input');
      return;
    }

    const { steps } = treeType === 'avl'
      ? searchAVLWithSteps(root, searchValue)
      : treeType === 'b-tree'
      ? searchBTree(root, searchValue)
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

        {treeType === 'b-tree' && (
          <div className={styles.inputGroup}>
            <label htmlFor="min-degree-input" className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              Minimum Degree (t)
              <button
                type="button"
                className={`${styles.btn} ${styles.btnIcon}`}
                onClick={() => setShowMinDegreeInfo(!showMinDegreeInfo)}
                aria-label="Info about minimum degree"
                style={{ padding: '2px', width: '20px', height: '20px' }}
              >
                <Info size={12} />
              </button>
            </label>
            <input
              id="min-degree-input"
              type="number"
              min="2"
              max="100"
              step="1"
              className={styles.input}
              placeholder="e.g., 3"
              value={minDegree}
              onChange={(e) => {
                setMinDegree(e.target.value);
                setMinDegreeError('');
              }}
            />
            {minDegreeError && (
              <p style={{ color: 'var(--red-9)', fontSize: '12px', marginTop: '4px' }}>
                {minDegreeError}
              </p>
            )}
            {showMinDegreeInfo && (
              <div style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--accent-3)',
                border: '1px solid var(--accent-9)',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
                marginTop: 'var(--space-2)',
                lineHeight: '1.5',
                color: 'var(--fg)',
              }}>
                <strong>Minimum Degree (t):</strong>
                <br />
                • Must be an integer ≥ 2
                <br />
                • Each node has at most <strong>2t-1 keys</strong>
                <br />
                • Each node (except root) has at least <strong>t-1 keys</strong>
                <br />
                • Example: t=3 means 2-5 keys per node
                <br />
                • Higher t = wider, shorter trees
              </div>
            )}
          </div>
        )}

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

      {(treeType === 'binary' || treeType === 'avl' || treeType === 'b-tree') && (
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
                placeholder="Value or [10, 20, 30]"
                value={insertValue}
                onChange={(e) => {
                  setInsertValue(e.target.value);
                  setInsertError('');
                }}
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
            {insertError && (
              <p style={{ color: 'var(--red-9)', fontSize: '12px', marginTop: '4px' }}>
                {insertError}
              </p>
            )}
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
                placeholder="Value or [10, 20, 30]"
                value={deleteValue}
                onChange={(e) => {
                  setDeleteValue(e.target.value);
                  setDeleteError('');
                }}
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
            {deleteError && (
              <p style={{ color: 'var(--red-9)', fontSize: '12px', marginTop: '4px' }}>
                {deleteError}
              </p>
            )}
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
                placeholder="Value or [10, 20, 30]"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSearchError('');
                }}
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
            {searchError && (
              <p style={{ color: 'var(--red-9)', fontSize: '12px', marginTop: '4px' }}>
                {searchError}
              </p>
            )}
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
          {treeType !== 'b-tree' && (
            <>
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
            </>
          )}
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
