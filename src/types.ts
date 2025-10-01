export type TreeNode = {
  id: string; // stable for rendering
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export type Step = {
  highlightIds: string[];
  message: string;
  tree?: TreeNode | null; // Tree state at this step
  remainingValues?: number[]; // Values not yet inserted
  currentValue?: number; // Value currently being inserted
};
