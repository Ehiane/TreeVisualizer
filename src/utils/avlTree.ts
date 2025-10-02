import { TreeNode, Step } from '../types';

let nodeIdCounter = 2000; // Start high to avoid conflicts

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
  };
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

  // Perform rotation
  x.right = y;
  y.left = T2;

  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;

  // Perform rotation
  y.left = x;
  x.right = T2;

  return y;
}

/**
 * Build AVL tree from array input string
 */
export function buildAVLTree(input: string): TreeNode | null {
  const cleanInput = input.trim().replace(/^\[|\]$/g, '');
  const values = cleanInput
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '')
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));

  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length === 0) {
    return null;
  }

  let root: TreeNode | null = null;

  for (const value of uniqueValues) {
    root = insertAVLNode(root, value);
  }

  return root;
}

/**
 * Build AVL tree with animation steps
 */
export function buildAVLTreeWithSteps(input: string): {
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

  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length === 0) {
    return { root: null, steps: [] };
  }

  let root: TreeNode | null = null;
  const steps: Step[] = [];

  steps.push({
    highlightIds: [],
    message: `Starting with values: ${uniqueValues.join(', ')}`,
    tree: null,
    remainingValues: [...uniqueValues],
  });

  for (let i = 0; i < uniqueValues.length; i++) {
    const value = uniqueValues[i];
    const remaining = uniqueValues.slice(i + 1);
    const { root: newRoot, steps: insertSteps } = insertAVLNodeWithSteps(root, value, remaining);
    root = newRoot;

    insertSteps.forEach((step) => {
      steps.push({
        ...step,
        tree: cloneTree(root),
        remainingValues: remaining,
        currentValue: value,
      });
    });
  }

  return { root, steps };
}

function insertAVLNode(node: TreeNode | null, value: number): TreeNode {
  // Standard BST insert
  if (node === null) {
    return {
      id: `node-${nodeIdCounter++}`,
      value,
      left: null,
      right: null,
    };
  }

  if (value === node.value) {
    return node; // Skip duplicates
  }

  if (value < node.value) {
    node.left = insertAVLNode(node.left, value);
  } else {
    node.right = insertAVLNode(node.right, value);
  }

  // Get balance factor
  const balance = getBalance(node);

  // Left Left Case
  if (balance > 1 && node.left && value < node.left.value) {
    return rotateRight(node);
  }

  // Right Right Case
  if (balance < -1 && node.right && value > node.right.value) {
    return rotateLeft(node);
  }

  // Left Right Case
  if (balance > 1 && node.left && value > node.left.value) {
    node.left = rotateLeft(node.left);
    return rotateRight(node);
  }

  // Right Left Case
  if (balance < -1 && node.right && value < node.right.value) {
    node.right = rotateRight(node.right);
    return rotateLeft(node);
  }

  return node;
}

function insertAVLNodeWithSteps(
  startRoot: TreeNode | null,
  value: number,
  remaining: number[]
): { root: TreeNode; steps: Step[] } {
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
  const path: string[] = [];

  // Navigate and insert
  const { node: insertedRoot, path: insertPath } = insertAndTrack(root, value, path, steps);

  // Check for rotations after insertion
  const balance = getBalance(insertedRoot);
  let finalRoot = insertedRoot;

  // Left Left Case
  if (balance > 1 && insertedRoot.left && value < insertedRoot.left.value) {
    steps.push({
      highlightIds: [insertedRoot.id, insertedRoot.left.id],
      message: `Tree unbalanced (Left-Left case), performing right rotation on ${insertedRoot.value}`,
    });
    finalRoot = rotateRight(insertedRoot);
    steps.push({
      highlightIds: [finalRoot.id],
      message: `Right rotation complete, new root is ${finalRoot.value}`,
    });
  }
  // Right Right Case
  else if (balance < -1 && insertedRoot.right && value > insertedRoot.right.value) {
    steps.push({
      highlightIds: [insertedRoot.id, insertedRoot.right.id],
      message: `Tree unbalanced (Right-Right case), performing left rotation on ${insertedRoot.value}`,
    });
    finalRoot = rotateLeft(insertedRoot);
    steps.push({
      highlightIds: [finalRoot.id],
      message: `Left rotation complete, new root is ${finalRoot.value}`,
    });
  }
  // Left Right Case
  else if (balance > 1 && insertedRoot.left && value > insertedRoot.left.value) {
    steps.push({
      highlightIds: [insertedRoot.id, insertedRoot.left.id],
      message: `Tree unbalanced (Left-Right case), performing left rotation on ${insertedRoot.left.value}`,
    });
    insertedRoot.left = rotateLeft(insertedRoot.left);
    steps.push({
      highlightIds: [insertedRoot.id, insertedRoot.left.id],
      message: `Now performing right rotation on ${insertedRoot.value}`,
    });
    finalRoot = rotateRight(insertedRoot);
    steps.push({
      highlightIds: [finalRoot.id],
      message: `Left-Right rotation complete, new root is ${finalRoot.value}`,
    });
  }
  // Right Left Case
  else if (balance < -1 && insertedRoot.right && value < insertedRoot.right.value) {
    steps.push({
      highlightIds: [insertedRoot.id, insertedRoot.right.id],
      message: `Tree unbalanced (Right-Left case), performing right rotation on ${insertedRoot.right.value}`,
    });
    insertedRoot.right = rotateRight(insertedRoot.right);
    steps.push({
      highlightIds: [insertedRoot.id, insertedRoot.right.id],
      message: `Now performing left rotation on ${insertedRoot.value}`,
    });
    finalRoot = rotateLeft(insertedRoot);
    steps.push({
      highlightIds: [finalRoot.id],
      message: `Right-Left rotation complete, new root is ${finalRoot.value}`,
    });
  } else {
    steps.push({
      highlightIds: [insertedRoot.id],
      message: `Tree remains balanced after inserting ${value}`,
    });
  }

  return { root: finalRoot, steps };
}

function insertAndTrack(
  node: TreeNode,
  value: number,
  path: string[],
  steps: Step[]
): { node: TreeNode; path: string[] } {
  path.push(node.id);

  if (value === node.value) {
    steps.push({
      highlightIds: [...path],
      message: `Value ${value} already exists, skipping duplicate`,
    });
    return { node, path };
  }

  if (value < node.value) {
    if (node.left === null) {
      const newNode: TreeNode = {
        id: `node-${nodeIdCounter++}`,
        value,
        left: null,
        right: null,
      };
      node.left = newNode;
      steps.push({
        highlightIds: [...path, newNode.id],
        message: `Insert ${value} as left child of ${node.value}`,
      });
    } else {
      steps.push({
        highlightIds: [...path],
        message: `Comparing ${value} with ${node.value}: go left`,
      });
      const result = insertAndTrack(node.left, value, [...path], steps);
      node.left = result.node;
    }
  } else {
    if (node.right === null) {
      const newNode: TreeNode = {
        id: `node-${nodeIdCounter++}`,
        value,
        left: null,
        right: null,
      };
      node.right = newNode;
      steps.push({
        highlightIds: [...path, newNode.id],
        message: `Insert ${value} as right child of ${node.value}`,
      });
    } else {
      steps.push({
        highlightIds: [...path],
        message: `Comparing ${value} with ${node.value}: go right`,
      });
      const result = insertAndTrack(node.right, value, [...path], steps);
      node.right = result.node;
    }
  }

  return { node, path };
}
