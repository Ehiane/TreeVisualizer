export type TreeNode = {
  id: string; // stable for rendering
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export type BTreeNode = {
  id: string; // stable for rendering
  keys: number[]; // Array of keys (sorted)
  children: BTreeNode[]; // Array of children (n+1 children for n keys)
  isLeaf: boolean;
};

export type BPlusTreeNode = {
  id: string; // stable for rendering
  keys: number[]; // Array of keys (sorted)
  children: BPlusTreeNode[]; // Array of children (n+1 children for n keys)
  isLeaf: boolean;
  next: BPlusTreeNode | null; // Linked list pointer for leaf nodes
};

export type TrieNode = {
  id: string; // stable for rendering
  char: string; // Character at this node (empty string for root)
  children: Map<string, TrieNode>; // Map of character -> child node
  isEndOfWord: boolean; // True if this node marks the end of a word
};

export type Step = {
  highlightIds: string[];
  message: string;
  tree?: TreeNode | null; // Tree state at this step (for binary trees)
  btree?: BTreeNode | null; // Tree state at this step (for B-Trees)
  bplustree?: BPlusTreeNode | null; // Tree state at this step (for B+ Trees)
  trie?: TrieNode | null; // Tree state at this step (for Trie)
  remainingValues?: number[]; // Values not yet inserted
  remainingWords?: string[]; // Words not yet inserted (for Trie)
  currentValue?: number; // Value currently being inserted
  currentWord?: string; // Word currently being inserted (for Trie)
  highlightKeys?: { nodeId: string; keyIndex: number }[]; // Highlight specific keys within nodes
};
