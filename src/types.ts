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

export type Step = {
  highlightIds: string[];
  message: string;
  tree?: TreeNode | null; // Tree state at this step (for binary trees)
  btree?: BTreeNode | null; // Tree state at this step (for B-Trees)
  remainingValues?: number[]; // Values not yet inserted
  currentValue?: number; // Value currently being inserted
};
