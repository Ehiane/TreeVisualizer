import { TreeNode, Step } from '../types';

/**
 * Parses array input string and builds a binary search tree
 * Accepts formats like: [10, 5, 15, 3, 7, 12, 18] or 10,5,15,3,7,12,18
 */
export function buildTree(input: string): TreeNode | null {
  // Parse input - handle array notation or comma-separated values
  const cleanInput = input.trim().replace(/^\[|\]$/g, '');
  const values = cleanInput
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '')
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));

  // Remove duplicates (BSTs don't allow duplicates)
  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length === 0) {
    return null;
  }

  // Build BST by inserting values one by one
  let root: TreeNode | null = null;
  let nodeCounter = 0;

  for (const value of uniqueValues) {
    root = insertNode(root, value, nodeCounter++);
  }

  return root;
}

/**
 * Builds a BST and generates animation steps showing the insertion process
 */
export function buildTreeWithSteps(input: string): {
  root: TreeNode | null;
  steps: Step[];
} {
  const cleanInput = input.trim().replace(/^\[|\]$/g, '');
  const values = cleanInput
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '')
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));

  // Remove duplicates (BSTs don't allow duplicates)
  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length === 0) {
    return { root: null, steps: [] };
  }

  let root: TreeNode | null = null;
  let nodeCounter = 0;
  const steps: Step[] = [];

  // Start with empty tree showing all values in list
  steps.push({
    highlightIds: [],
    message: `Starting with values: ${uniqueValues.join(', ')}`,
    tree: null,
    remainingValues: [...uniqueValues],
  });

  for (let i = 0; i < uniqueValues.length; i++) {
    const value = uniqueValues[i];
    const remaining = uniqueValues.slice(i + 1);
    const insertionSteps = insertNodeWithSteps(root, value, nodeCounter++, remaining);
    root = insertionSteps.root;

    // Add tree state to each step
    insertionSteps.steps.forEach((step) => {
      steps.push({
        ...step,
        tree: cloneTree(root),
        remainingValues: remaining,
        currentValue: value, // Track which value is being inserted
      });
    });
  }

  return { root, steps };
}

function insertNodeWithSteps(
  startRoot: TreeNode | null,
  value: number,
  counter: number,
  remaining: number[]
): { root: TreeNode; steps: Step[] } {
  const steps: Step[] = [];
  const path: string[] = [];

  // If tree is empty, just insert at root
  if (startRoot === null) {
    const newNode: TreeNode = {
      id: `node-${counter}`,
      value,
      left: null,
      right: null,
    };
    steps.push({
      highlightIds: [newNode.id],
      message: `Insert ${value} as root node`,
    });
    return { root: newNode, steps };
  }

  // Clone the tree to track state at each step
  const root = cloneTree(startRoot);
  let current: TreeNode | null = root;
  let parent: TreeNode | null = null;
  let isLeft = false;

  // Navigate to insertion point
  while (current !== null) {
    path.push(current.id);

    // Skip duplicates
    if (value === current.value) {
      steps.push({
        highlightIds: [...path],
        message: `Value ${value} already exists, skipping duplicate`,
      });
      return { root, steps };
    }

    steps.push({
      highlightIds: [...path],
      message: `Comparing ${value} with ${current.value}: ${value < current.value ? 'go left' : 'go right'}`,
    });

    parent = current;
    if (value < current.value) {
      current = current.left;
      isLeft = true;
    } else {
      current = current.right;
      isLeft = false;
    }
  }

  // Insert the new node
  const newNode: TreeNode = {
    id: `node-${counter}`,
    value,
    left: null,
    right: null,
  };

  if (parent) {
    if (isLeft) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }
  }

  steps.push({
    highlightIds: [newNode.id],
    message: `Insert ${value} as ${isLeft ? 'left' : 'right'} child of ${parent?.value}`,
  });

  return { root, steps };
}

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

function insertNode(
  node: TreeNode | null,
  value: number,
  counter: number
): TreeNode {
  // Create new node if position is empty
  if (node === null) {
    return {
      id: `node-${counter}`,
      value,
      left: null,
      right: null,
    };
  }

  // Skip duplicates (BSTs don't allow duplicates)
  if (value === node.value) {
    return node;
  }

  // Insert in left or right subtree based on BST property
  if (value < node.value) {
    node.left = insertNode(node.left, value, counter);
  } else {
    node.right = insertNode(node.right, value, counter);
  }

  return node;
}

/**
 * Validates if input string can be parsed into a tree
 */
export function validateInput(input: string): { valid: boolean; error?: string } {
  if (!input.trim()) {
    return { valid: false, error: 'Input cannot be empty' };
  }

  const cleanInput = input.trim().replace(/^\[|\]$/g, '');
  const values = cleanInput
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '');

  if (values.length === 0) {
    return { valid: false, error: 'No valid numbers found' };
  }

  for (const v of values) {
    if (isNaN(parseFloat(v))) {
      return { valid: false, error: `Invalid number: ${v}` };
    }
  }

  return { valid: true };
}
