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

export type Step = {
  highlightIds: string[];
  message: string;
  tree?: TreeNode | null; // Tree state at this step (for binary trees)
  btree?: BTreeNode | null; // Tree state at this step (for B-Trees)
  bplustree?: BPlusTreeNode | null; // Tree state at this step (for B+ Trees)
  remainingValues?: number[]; // Values not yet inserted
  currentValue?: number; // Value currently being inserted
  highlightKeys?: { nodeId: string; keyIndex: number }[]; // Highlight specific keys within nodes
};
