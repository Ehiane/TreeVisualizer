import { X } from 'lucide-react';
import styles from '../styles/app.module.css';
import { TreeType } from '../state/useTreeStore';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  treeType: TreeType | null;
}

const treeInfo: Record<string, {
  title: string;
  description: string;
  howItWorks: string[];
  realWorldUses: string[];
  references: { name: string; url: string }[];
}> = {
  binary: {
    title: 'Binary Search Tree (BST)',
    description: 'A Binary Search Tree is a node-based binary tree data structure where each node has at most two children. It maintains the property that the left subtree contains only nodes with values less than the parent node, and the right subtree contains only nodes with values greater than the parent node.',
    howItWorks: [
      'Each node contains a value and pointers to left and right children',
      'Left child value < Parent value < Right child value',
      'Search, insert, and delete operations follow the BST property',
      'Average time complexity: O(log n) for balanced trees',
      'Worst case: O(n) when tree becomes skewed (like a linked list)',
    ],
    realWorldUses: [
      'Database indexing for quick lookups',
      'File system organization',
      'Expression parsing in compilers',
      'Autocomplete features in search engines',
      'Implementing sets and maps in programming languages',
    ],
    references: [
      { name: 'Wikipedia - Binary Search Tree', url: 'https://en.wikipedia.org/wiki/Binary_search_tree' },
      { name: 'GeeksforGeeks - BST', url: 'https://www.geeksforgeeks.org/binary-search-tree-data-structure/' },
      { name: 'Visualgo - BST Visualization', url: 'https://visualgo.net/en/bst' },
      { name: 'MIT OpenCourseWare - BST', url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-5-binary-search-trees-bst-sort/' },
    ],
  },
  avl: {
    title: 'AVL Tree',
    description: 'An AVL tree is a self-balancing Binary Search Tree where the heights of the two child subtrees of any node differ by at most one. Named after inventors Adelson-Velsky and Landis, it automatically maintains balance through rotations during insertions and deletions.',
    howItWorks: [
      'Maintains BST property plus height-balance property',
      'Balance Factor = Height(Left Subtree) - Height(Right Subtree)',
      'Balance factor must be -1, 0, or +1 for every node',
      'Uses 4 types of rotations: Left-Left, Right-Right, Left-Right, Right-Left',
      'Guarantees O(log n) time for search, insert, and delete operations',
    ],
    realWorldUses: [
      'In-memory databases requiring guaranteed query performance',
      'File systems needing balanced directory structures',
      'Network routing algorithms',
      'Game development for spatial partitioning',
      'Priority queues with frequent updates',
    ],
    references: [
      { name: 'Wikipedia - AVL Tree', url: 'https://en.wikipedia.org/wiki/AVL_tree' },
      { name: 'GeeksforGeeks - AVL Tree', url: 'https://www.geeksforgeeks.org/avl-tree-set-1-insertion/' },
      { name: 'Visualgo - AVL Visualization', url: 'https://visualgo.net/en/bst' },
      { name: 'CMU - AVL Trees', url: 'https://www.cs.cmu.edu/~adamchik/15-121/lectures/Trees/trees.html' },
    ],
  },
  'b-tree': {
    title: 'B-Tree',
    description: 'A B-Tree is a self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time. Unlike binary trees, B-Tree nodes can have multiple keys and multiple children, making them ideal for storage systems that read/write large blocks of data.',
    howItWorks: [
      'Minimum Degree (t): Defines the structure of the tree',
      'Each node has at most 2t-1 keys and 2t children',
      'Each node (except root) has at least t-1 keys and t children',
      'Example: t=3 means nodes can have 2-5 keys and 3-6 children',
      'All leaves are at the same level (perfectly balanced)',
      'Keys within a node are sorted in ascending order',
      'When a node is full (2t-1 keys), it splits into two nodes',
      'The middle key moves up to the parent during split',
      'Guarantees O(log n) search, insert, and delete operations',
    ],
    realWorldUses: [
      'Database indexing (MySQL InnoDB, PostgreSQL)',
      'File systems (NTFS, ext4, HFS+, ReFS)',
      'Large-scale storage systems and SSDs',
      'Index structures for big data applications',
      'Any system optimizing for disk I/O operations',
    ],
    references: [
      { name: 'Wikipedia - B-Tree', url: 'https://en.wikipedia.org/wiki/B-tree' },
      { name: 'GeeksforGeeks - B-Tree', url: 'https://www.geeksforgeeks.org/introduction-of-b-tree-2/' },
      { name: 'Visualgo - B-Tree Visualization', url: 'https://visualgo.net/en/bst' },
      { name: 'CMU Database Systems - B-Trees', url: 'https://15445.courses.cs.cmu.edu/fall2022/notes/07-trees.pdf' },
    ],
  },
  'b-plus-tree': {
    title: 'B+ Tree',
    description: 'A B+ Tree is a variant of B-Tree where all data is stored in leaf nodes, and internal nodes only store keys for navigation. Leaf nodes are linked together, enabling efficient range queries.',
    howItWorks: [
      'Internal nodes contain only keys (no data)',
      'All data records are stored in leaf nodes',
      'Leaf nodes are linked as a linked list',
      'Better for range queries than B-Trees',
      'More space-efficient for certain operations',
    ],
    realWorldUses: [
      'Database indexing (most RDBMS)',
      'File system metadata storage',
      'Multi-level indexing',
      'Storage engines (InnoDB in MySQL)',
    ],
    references: [
      { name: 'Wikipedia - B+ Tree', url: 'https://en.wikipedia.org/wiki/B%2B_tree' },
      { name: 'GeeksforGeeks - B+ Tree', url: 'https://www.geeksforgeeks.org/introduction-of-b-tree/' },
    ],
  },
  'red-black': {
    title: 'Red-Black Tree',
    description: 'A Red-Black Tree is a self-balancing BST where each node has an extra bit for color (red or black). These colors ensure the tree remains approximately balanced through specific rules enforced during insertions and deletions.',
    howItWorks: [
      'Each node is colored red or black',
      'Root is always black',
      'Red nodes cannot have red children',
      'Every path from root to leaf has same number of black nodes',
      'Guarantees O(log n) operations with simpler balancing than AVL',
    ],
    realWorldUses: [
      'Java TreeMap and TreeSet implementations',
      'C++ STL map and set',
      'Linux kernel scheduler',
      'Memory allocators',
    ],
    references: [
      { name: 'Wikipedia - Red-Black Tree', url: 'https://en.wikipedia.org/wiki/Red%E2%80%93black_tree' },
      { name: 'GeeksforGeeks - Red-Black Tree', url: 'https://www.geeksforgeeks.org/red-black-tree-set-1-introduction-2/' },
    ],
  },
  trie: {
    title: 'Trie Tree (Prefix Tree)',
    description: 'A Trie is a tree-like data structure used to store and retrieve strings efficiently. Each node represents a character, and paths from root to nodes represent prefixes of stored strings.',
    howItWorks: [
      'Each node represents a single character',
      'Root represents empty string',
      'Paths from root to nodes form prefixes',
      'Common prefixes share the same path',
      'Space-time tradeoff: faster lookups but more memory',
    ],
    realWorldUses: [
      'Autocomplete and search suggestions',
      'Spell checkers',
      'IP routing tables',
      'Dictionary implementations',
      'DNA sequence analysis',
    ],
    references: [
      { name: 'Wikipedia - Trie', url: 'https://en.wikipedia.org/wiki/Trie' },
      { name: 'GeeksforGeeks - Trie', url: 'https://www.geeksforgeeks.org/trie-insert-and-search/' },
    ],
  },
};

export function InfoModal({ isOpen, onClose, treeType }: InfoModalProps) {
  if (!isOpen || !treeType) return null;

  const info = treeInfo[treeType];
  if (!info) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--fg)' }}>
              {info.title}
            </h2>
            <button
              className={`${styles.btn} ${styles.btnIcon}`}
              onClick={onClose}
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <p style={{ margin: 0, color: 'var(--fg)', lineHeight: '1.6' }}>
              {info.description}
            </p>
          </section>

          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--fg)', marginTop: 0, marginBottom: 'var(--space-3)' }}>
              How It Works
            </h3>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-6)', color: 'var(--fg)', listStyleType: 'none' }}>
              {info.howItWorks.map((point, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: 'var(--space-2)',
                    lineHeight: '1.6',
                    position: 'relative',
                    paddingLeft: '1em'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: 'var(--accent)',
                    fontWeight: 'bold'
                  }}>
                    *
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--fg)', marginTop: 0, marginBottom: 'var(--space-3)' }}>
              Real-World Applications
            </h3>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-6)', color: 'var(--fg)', listStyleType: 'none' }}>
              {info.realWorldUses.map((use, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: 'var(--space-2)',
                    lineHeight: '1.6',
                    position: 'relative',
                    paddingLeft: '1em'
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: 'var(--accent)',
                    fontWeight: 'bold'
                  }}>
                    *
                  </span>
                  {use}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--fg)', marginTop: 0, marginBottom: 'var(--space-3)' }}>
              Learn More
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {info.references.map((ref, index) => (
                <a
                  key={index}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  <span>→</span>
                  {ref.name}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
