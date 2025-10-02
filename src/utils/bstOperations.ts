import { TreeNode, Step } from '../types';

let nodeIdCounter = 1000; // Start high to avoid conflicts with initial build

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
}

function parseValues(input: string): number[] {
  const cleanInput = input.trim().replace(/^\[|\]$/g, '');
  const values = cleanInput
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '')
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));
  return Array.from(new Set(values)); // Remove duplicates
}

/**
 * Insert values into the BST with animation steps
 */
export function insertWithSteps(
  startRoot: TreeNode | null,
  input: string
): { root: TreeNode | null; steps: Step[] } {
  const values = parseValues(input);

  if (values.length === 0) {
    return { root: startRoot, steps: [] };
  }

  let root = cloneTree(startRoot);
  const allSteps: Step[] = [];

  for (const value of values) {
    const { root: newRoot, steps } = insertSingleValue(root, value);
    root = newRoot;

    steps.forEach((step) => {
      allSteps.push({
        ...step,
        tree: cloneTree(root),
      });
    });
  }

  return { root, steps: allSteps };
}

function insertSingleValue(
  startRoot: TreeNode | null,
  value: number
): { root: TreeNode | null; steps: Step[] } {
  const steps: Step[] = [];

  // Empty tree case
  if (startRoot === null) {
    const newNode: TreeNode = {
      id: `node-${nodeIdCounter++}`,
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

  const root = cloneTree(startRoot);
  let current: TreeNode | null = root;
  let parent: TreeNode | null = null;
  let isLeft = false;
  const path: string[] = [];

  // Navigate to insertion point
  while (current !== null) {
    path.push(current.id);

    // Duplicate check
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

  // Insert new node
  const newNode: TreeNode = {
    id: `node-${nodeIdCounter++}`,
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

/**
 * Search for values in the BST with animation steps
 */
export function searchWithSteps(
  startRoot: TreeNode | null,
  input: string
): { steps: Step[] } {
  const values = parseValues(input);

  if (values.length === 0 || !startRoot) {
    return { steps: [] };
  }

  const allSteps: Step[] = [];

  for (const value of values) {
    const steps = searchSingleValue(startRoot, value);
    allSteps.push(...steps);
  }

  return { steps: allSteps };
}

function searchSingleValue(root: TreeNode | null, value: number): Step[] {
  const steps: Step[] = [];
  let current = root;
  const path: string[] = [];
  let level = 0;

  steps.push({
    highlightIds: [],
    message: `Searching for ${value}...`,
  });

  while (current !== null) {
    path.push(current.id);

    if (value === current.value) {
      steps.push({
        highlightIds: [...path],
        message: `Found ${value} at level ${level}!`,
      });
      return steps;
    }

    steps.push({
      highlightIds: [...path],
      message: `Comparing ${value} with ${current.value}: ${value < current.value ? 'go left' : 'go right'}`,
    });

    if (value < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }

    level++;
  }

  steps.push({
    highlightIds: [...path],
    message: `Value ${value} not found in tree`,
  });

  return steps;
}

/**
 * Delete values from the BST with animation steps
 */
export function deleteWithSteps(
  startRoot: TreeNode | null,
  input: string
): { root: TreeNode | null; steps: Step[] } {
  const values = parseValues(input);

  if (values.length === 0 || !startRoot) {
    return { root: startRoot, steps: [] };
  }

  let root = cloneTree(startRoot);
  const allSteps: Step[] = [];

  for (const value of values) {
    const { root: newRoot, steps } = deleteSingleValue(root, value);

    // Add steps with intermediate tree states already included
    allSteps.push(...steps);

    root = newRoot;
  }

  return { root, steps: allSteps };
}

function deleteSingleValue(
  startRoot: TreeNode | null,
  value: number
): { root: TreeNode | null; steps: Step[] } {
  const steps: Step[] = [];

  if (!startRoot) {
    steps.push({
      highlightIds: [],
      message: `Cannot delete ${value}: tree is empty`,
      tree: null,
    });
    return { root: null, steps };
  }

  const root = cloneTree(startRoot);
  const result = deleteNodeRecursive(root, root, value, steps, []);

  return { root: result, steps };
}

function deleteNodeRecursive(
  rootRef: TreeNode,
  node: TreeNode | null,
  value: number,
  steps: Step[],
  path: string[]
): TreeNode | null {
  if (node === null) {
    steps.push({
      highlightIds: [...path],
      message: `Value ${value} not found in tree`,
      tree: cloneTree(rootRef),
    });
    return null;
  }

  path.push(node.id);

  if (value < node.value) {
    steps.push({
      highlightIds: [...path],
      message: `Searching for ${value}: go left from ${node.value}`,
      tree: cloneTree(rootRef),
    });
    node.left = deleteNodeRecursive(rootRef, node.left, value, steps, [...path]);
    return node;
  } else if (value > node.value) {
    steps.push({
      highlightIds: [...path],
      message: `Searching for ${value}: go right from ${node.value}`,
      tree: cloneTree(rootRef),
    });
    node.right = deleteNodeRecursive(rootRef, node.right, value, steps, [...path]);
    return node;
  }

  // Found the node to delete
  steps.push({
    highlightIds: [...path],
    message: `Found ${value}, deleting node...`,
    tree: cloneTree(rootRef),
  });

  // Case 1: Node with no children (leaf)
  if (node.left === null && node.right === null) {
    steps.push({
      highlightIds: [node.id],
      message: `${value} is a leaf node, removing it`,
      tree: cloneTree(rootRef),
    });
    return null;
  }

  // Case 2: Node with one child
  if (node.left === null) {
    steps.push({
      highlightIds: [node.id, node.right!.id],
      message: `${value} has only right child, replacing with ${node.right!.value}`,
      tree: cloneTree(rootRef),
    });
    return node.right;
  }

  if (node.right === null) {
    steps.push({
      highlightIds: [node.id, node.left!.id],
      message: `${value} has only left child, replacing with ${node.left!.value}`,
      tree: cloneTree(rootRef),
    });
    return node.left;
  }

  // Case 3: Node with two children
  // Find inorder successor (smallest in right subtree)
  const successor = findMin(node.right);
  steps.push({
    highlightIds: [node.id, successor.id],
    message: `${value} has two children, replacing with inorder successor ${successor.value}`,
    tree: cloneTree(rootRef),
  });

  node.value = successor.value;
  node.right = deleteNodeRecursive(rootRef, node.right, successor.value, steps, [...path]);

  return node;
}

function findMin(node: TreeNode): TreeNode {
  while (node.left !== null) {
    node = node.left;
  }
  return node;
}
