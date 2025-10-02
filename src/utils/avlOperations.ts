import { TreeNode, Step } from '../types';

let nodeIdCounter = 3000; // Start high to avoid conflicts

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

function getHeight(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function getBalance(node: TreeNode | null): number {
  if (!node) return 0;
  return getHeight(node.left) - getHeight(node.right);
}

function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;

  x.right = y;
  y.left = T2;

  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;

  y.left = x;
  x.right = T2;

  return y;
}

/**
 * Insert values into AVL tree with animation steps and rebalancing
 */
export function insertAVLWithSteps(
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
    const { root: newRoot, steps } = insertSingleAVL(root, value);
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

function insertSingleAVL(
  startRoot: TreeNode | null,
  value: number
): { root: TreeNode | null; steps: Step[] } {
  const steps: Step[] = [];

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
  const result = insertAVLRecursive(root, value, steps, []);

  return { root: result, steps };
}

function insertAVLRecursive(
  node: TreeNode | null,
  value: number,
  steps: Step[],
  path: string[]
): TreeNode {
  // Standard BST insert
  if (node === null) {
    const newNode: TreeNode = {
      id: `node-${nodeIdCounter++}`,
      value,
      left: null,
      right: null,
    };
    steps.push({
      highlightIds: [...path, newNode.id],
      message: `Insert ${value}`,
    });
    return newNode;
  }

  path.push(node.id);

  if (value === node.value) {
    steps.push({
      highlightIds: [...path],
      message: `Value ${value} already exists, skipping duplicate`,
    });
    return node;
  }

  if (value < node.value) {
    steps.push({
      highlightIds: [...path],
      message: `Comparing ${value} with ${node.value}: go left`,
    });
    node.left = insertAVLRecursive(node.left, value, steps, [...path]);
  } else {
    steps.push({
      highlightIds: [...path],
      message: `Comparing ${value} with ${node.value}: go right`,
    });
    node.right = insertAVLRecursive(node.right, value, steps, [...path]);
  }

  // Get balance factor
  const balance = getBalance(node);

  // Check if rebalancing is needed
  if (Math.abs(balance) > 1) {
    steps.push({
      highlightIds: [node.id],
      message: `Node ${node.value} is unbalanced (balance factor: ${balance})`,
    });
  }

  // Left Left Case
  if (balance > 1 && node.left && value < node.left.value) {
    steps.push({
      highlightIds: [node.id, node.left.id],
      message: `Left-Left case detected, performing right rotation on ${node.value}`,
    });
    const rotated = rotateRight(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Right rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  // Right Right Case
  if (balance < -1 && node.right && value > node.right.value) {
    steps.push({
      highlightIds: [node.id, node.right.id],
      message: `Right-Right case detected, performing left rotation on ${node.value}`,
    });
    const rotated = rotateLeft(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Left rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  // Left Right Case
  if (balance > 1 && node.left && value > node.left.value) {
    steps.push({
      highlightIds: [node.id, node.left.id],
      message: `Left-Right case detected, first performing left rotation on ${node.left.value}`,
    });
    node.left = rotateLeft(node.left);
    steps.push({
      highlightIds: [node.id, node.left.id],
      message: `Now performing right rotation on ${node.value}`,
    });
    const rotated = rotateRight(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Left-Right rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  // Right Left Case
  if (balance < -1 && node.right && value < node.right.value) {
    steps.push({
      highlightIds: [node.id, node.right.id],
      message: `Right-Left case detected, first performing right rotation on ${node.right.value}`,
    });
    node.right = rotateRight(node.right);
    steps.push({
      highlightIds: [node.id, node.right.id],
      message: `Now performing left rotation on ${node.value}`,
    });
    const rotated = rotateLeft(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Right-Left rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  return node;
}

/**
 * Search for values in the AVL tree with animation steps
 */
export function searchAVLWithSteps(
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
 * Delete values from AVL tree with animation steps and rebalancing
 */
export function deleteAVLWithSteps(
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
    const { root: newRoot, steps } = deleteSingleAVL(root, value);
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

function deleteSingleAVL(
  startRoot: TreeNode | null,
  value: number
): { root: TreeNode | null; steps: Step[] } {
  const steps: Step[] = [];

  if (!startRoot) {
    steps.push({
      highlightIds: [],
      message: `Cannot delete ${value}: tree is empty`,
    });
    return { root: null, steps };
  }

  const root = cloneTree(startRoot);
  const result = deleteAVLRecursive(root, value, steps, []);

  return { root: result, steps };
}

function deleteAVLRecursive(
  node: TreeNode | null,
  value: number,
  steps: Step[],
  path: string[]
): TreeNode | null {
  if (node === null) {
    steps.push({
      highlightIds: [...path],
      message: `Value ${value} not found in tree`,
    });
    return null;
  }

  path.push(node.id);

  if (value < node.value) {
    steps.push({
      highlightIds: [...path],
      message: `Searching for ${value}: go left from ${node.value}`,
    });
    node.left = deleteAVLRecursive(node.left, value, steps, [...path]);
  } else if (value > node.value) {
    steps.push({
      highlightIds: [...path],
      message: `Searching for ${value}: go right from ${node.value}`,
    });
    node.right = deleteAVLRecursive(node.right, value, steps, [...path]);
  } else {
    // Found the node to delete
    steps.push({
      highlightIds: [...path],
      message: `Found ${value}, deleting node...`,
    });

    // Case 1: Node with no children (leaf)
    if (node.left === null && node.right === null) {
      steps.push({
        highlightIds: [node.id],
        message: `${value} is a leaf node, removing it`,
      });
      return null;
    }

    // Case 2: Node with one child
    if (node.left === null) {
      steps.push({
        highlightIds: [node.id, node.right!.id],
        message: `${value} has only right child, replacing with ${node.right!.value}`,
      });
      return node.right;
    }

    if (node.right === null) {
      steps.push({
        highlightIds: [node.id, node.left!.id],
        message: `${value} has only left child, replacing with ${node.left!.value}`,
      });
      return node.left;
    }

    // Case 3: Node with two children
    const successor = findMin(node.right);
    steps.push({
      highlightIds: [node.id, successor.id],
      message: `${value} has two children, replacing with inorder successor ${successor.value}`,
    });

    node.value = successor.value;
    node.right = deleteAVLRecursive(node.right, successor.value, steps, [...path]);
  }

  // Get balance factor after deletion
  const balance = getBalance(node);

  // Check if rebalancing is needed
  if (Math.abs(balance) > 1) {
    steps.push({
      highlightIds: [node.id],
      message: `Node ${node.value} is unbalanced after deletion (balance factor: ${balance})`,
    });
  }

  // Left Left Case
  if (balance > 1 && getBalance(node.left) >= 0) {
    steps.push({
      highlightIds: [node.id, node.left!.id],
      message: `Left-Left case detected, performing right rotation on ${node.value}`,
    });
    const rotated = rotateRight(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Right rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  // Left Right Case
  if (balance > 1 && getBalance(node.left) < 0) {
    steps.push({
      highlightIds: [node.id, node.left!.id],
      message: `Left-Right case detected, first performing left rotation on ${node.left!.value}`,
    });
    node.left = rotateLeft(node.left!);
    steps.push({
      highlightIds: [node.id, node.left.id],
      message: `Now performing right rotation on ${node.value}`,
    });
    const rotated = rotateRight(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Left-Right rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  // Right Right Case
  if (balance < -1 && getBalance(node.right) <= 0) {
    steps.push({
      highlightIds: [node.id, node.right!.id],
      message: `Right-Right case detected, performing left rotation on ${node.value}`,
    });
    const rotated = rotateLeft(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Left rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  // Right Left Case
  if (balance < -1 && getBalance(node.right) > 0) {
    steps.push({
      highlightIds: [node.id, node.right!.id],
      message: `Right-Left case detected, first performing right rotation on ${node.right!.value}`,
    });
    node.right = rotateRight(node.right!);
    steps.push({
      highlightIds: [node.id, node.right.id],
      message: `Now performing left rotation on ${node.value}`,
    });
    const rotated = rotateLeft(node);
    steps.push({
      highlightIds: [rotated.id],
      message: `Right-Left rotation complete, new subtree root is ${rotated.value}`,
    });
    return rotated;
  }

  return node;
}

function findMin(node: TreeNode): TreeNode {
  while (node.left !== null) {
    node = node.left;
  }
  return node;
}
