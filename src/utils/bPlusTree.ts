import { BPlusTreeNode, Step } from '../types';

let nodeIdCounter = 5000; // Start high to avoid conflicts

// Minimum degree (t): Every node (except root) must have at least t-1 keys
// Every node can have at most 2t-1 keys
let MIN_DEGREE = 3; // Default: 2-5 keys per node (except root)

export function setMinDegree(t: number) {
  MIN_DEGREE = Math.max(2, t); // Ensure minimum degree is at least 2
}

function cloneBPlusTreeNode(node: BPlusTreeNode | null): BPlusTreeNode | null {
  if (!node) return null;
  const cloned: BPlusTreeNode = {
    id: node.id,
    keys: [...node.keys],
    children: node.children.map(child => cloneBPlusTreeNode(child)!),
    isLeaf: node.isLeaf,
    next: null, // We'll handle next pointer separately to avoid infinite loops
  };
  return cloned;
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
 * Build B+ Tree from array input string
 */
export function buildBPlusTree(input: string): BPlusTreeNode | null {
  const values = parseValues(input);

  if (values.length === 0) {
    return null;
  }

  let root: BPlusTreeNode | null = {
    id: `bplustree-node-${nodeIdCounter++}`,
    keys: [],
    children: [],
    isLeaf: true,
    next: null,
  };

  for (const value of values) {
    root = insertBPlusTree(root, value);
  }

  return root;
}

/**
 * Build B+ Tree with animation steps
 */
export function buildBPlusTreeWithSteps(input: string): {
  root: BPlusTreeNode | null;
  steps: Step[];
} {
  const values = parseValues(input);

  if (values.length === 0) {
    return { root: null, steps: [] };
  }

  let root: BPlusTreeNode | null = {
    id: `bplustree-node-${nodeIdCounter++}`,
    keys: [],
    children: [],
    isLeaf: true,
    next: null,
  };
  const steps: Step[] = [];

  steps.push({
    highlightIds: [],
    message: `Starting with values: ${values.join(', ')}`,
    bplustree: null,
    remainingValues: [...values],
  });

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const remaining = values.slice(i + 1);
    const { root: newRoot, steps: insertSteps } = insertBPlusTreeWithSteps(root, value, remaining);
    root = newRoot;

    insertSteps.forEach((step) => {
      steps.push({
        ...step,
        bplustree: cloneBPlusTreeNode(root),
        remainingValues: remaining,
        currentValue: value,
      });
    });
  }

  return { root, steps };
}

function insertBPlusTree(root: BPlusTreeNode, key: number): BPlusTreeNode {
  // If root is full, split it
  if (root.keys.length === 2 * MIN_DEGREE - 1) {
    const newRoot: BPlusTreeNode = {
      id: `bplustree-node-${nodeIdCounter++}`,
      keys: [],
      children: [root],
      isLeaf: false,
      next: null,
    };
    splitChild(newRoot, 0);
    insertNonFull(newRoot, key);
    return newRoot;
  } else {
    insertNonFull(root, key);
    return root;
  }
}

function insertBPlusTreeWithSteps(
  startRoot: BPlusTreeNode,
  key: number,
  remaining: number[]
): { root: BPlusTreeNode; steps: Step[] } {
  const steps: Step[] = [];
  const root = cloneBPlusTreeNode(startRoot)!;

  steps.push({
    highlightIds: [],
    message: `Inserting ${key} into B+ Tree`,
  });

  // If root is full, split it
  if (root.keys.length === 2 * MIN_DEGREE - 1) {
    steps.push({
      highlightIds: [root.id],
      message: `Root is full (${root.keys.join(', ')}), splitting root`,
    });

    const newRoot: BPlusTreeNode = {
      id: `bplustree-node-${nodeIdCounter++}`,
      keys: [],
      children: [root],
      isLeaf: false,
      next: null,
    };
    splitChildWithSteps(newRoot, 0, steps);
    insertNonFullWithSteps(newRoot, key, steps);
    return { root: newRoot, steps };
  } else {
    insertNonFullWithSteps(root, key, steps);
    return { root, steps };
  }
}

function splitChild(parent: BPlusTreeNode, index: number): void {
  const fullChild = parent.children[index];
  const t = MIN_DEGREE;

  const newChild: BPlusTreeNode = {
    id: `bplustree-node-${nodeIdCounter++}`,
    keys: fullChild.keys.splice(t),
    children: fullChild.isLeaf ? [] : fullChild.children.splice(t),
    isLeaf: fullChild.isLeaf,
    next: null,
  };

  let midKey: number;

  if (fullChild.isLeaf) {
    // In B+ Tree, for leaf nodes, we copy the middle key up (don't remove it)
    midKey = newChild.keys[0];
    // Link the leaf nodes
    newChild.next = fullChild.next;
    fullChild.next = newChild;
  } else {
    // For internal nodes, we move the middle key up
    midKey = fullChild.keys.pop()!;
  }

  parent.keys.splice(index, 0, midKey);
  parent.children.splice(index + 1, 0, newChild);
}

function splitChildWithSteps(parent: BPlusTreeNode, index: number, steps: Step[]): void {
  const fullChild = parent.children[index];
  const t = MIN_DEGREE;

  steps.push({
    highlightIds: [fullChild.id],
    message: `Splitting node [${fullChild.keys.join(', ')}]`,
  });

  const newChild: BPlusTreeNode = {
    id: `bplustree-node-${nodeIdCounter++}`,
    keys: fullChild.keys.splice(t),
    children: fullChild.isLeaf ? [] : fullChild.children.splice(t),
    isLeaf: fullChild.isLeaf,
    next: null,
  };

  let midKey: number;

  if (fullChild.isLeaf) {
    // In B+ Tree, for leaf nodes, we copy the middle key up (don't remove it)
    midKey = newChild.keys[0];
    // Link the leaf nodes
    newChild.next = fullChild.next;
    fullChild.next = newChild;
    steps.push({
      highlightIds: [parent.id, fullChild.id, newChild.id],
      message: `Split complete: copied key ${midKey} to parent, leaf nodes linked`,
    });
  } else {
    // For internal nodes, we move the middle key up
    midKey = fullChild.keys.pop()!;
    steps.push({
      highlightIds: [parent.id, fullChild.id, newChild.id],
      message: `Split complete: moved key ${midKey} to parent`,
    });
  }

  parent.keys.splice(index, 0, midKey);
  parent.children.splice(index + 1, 0, newChild);
}

function insertNonFull(node: BPlusTreeNode, key: number): void {
  let i = node.keys.length - 1;

  if (node.isLeaf) {
    // Insert into sorted position
    node.keys.push(key);
    while (i >= 0 && node.keys[i] > key) {
      node.keys[i + 1] = node.keys[i];
      i--;
    }
    node.keys[i + 1] = key;
  } else {
    // Find child to insert into
    while (i >= 0 && key < node.keys[i]) {
      i--;
    }
    i++;

    // If child is full, split it
    if (node.children[i].keys.length === 2 * MIN_DEGREE - 1) {
      splitChild(node, i);
      if (key > node.keys[i]) {
        i++;
      }
    }
    insertNonFull(node.children[i], key);
  }
}

function insertNonFullWithSteps(node: BPlusTreeNode, key: number, steps: Step[]): void {
  let i = node.keys.length - 1;

  if (node.isLeaf) {
    steps.push({
      highlightIds: [node.id],
      message: `Inserting ${key} into leaf node [${node.keys.join(', ')}]`,
    });

    // Insert into sorted position
    node.keys.push(key);
    while (i >= 0 && node.keys[i] > key) {
      node.keys[i + 1] = node.keys[i];
      i--;
    }
    node.keys[i + 1] = key;

    steps.push({
      highlightIds: [node.id],
      message: `Inserted ${key}, node is now [${node.keys.join(', ')}]`,
    });
  } else {
    // Find child to insert into
    while (i >= 0 && key < node.keys[i]) {
      i--;
    }
    i++;

    steps.push({
      highlightIds: [node.id],
      message: `Navigating to child ${i} (keys: [${node.children[i].keys.join(', ')}])`,
    });

    // If child is full, split it
    if (node.children[i].keys.length === 2 * MIN_DEGREE - 1) {
      splitChildWithSteps(node, i, steps);
      if (key > node.keys[i]) {
        i++;
      }
    }
    insertNonFullWithSteps(node.children[i], key, steps);
  }
}

/**
 * Search for a value in B+ Tree with animation steps
 * In B+ Tree, all values are stored in leaf nodes
 */
export function searchBPlusTreeWithSteps(
  root: BPlusTreeNode | null,
  input: string
): { steps: Step[] } {
  const values = parseValues(input);

  if (values.length === 0 || !root) {
    return { steps: [] };
  }

  const allSteps: Step[] = [];

  for (const value of values) {
    const steps = searchSingleValue(root, value, 0);
    allSteps.push(...steps);
  }

  return { steps: allSteps };
}

function searchSingleValue(node: BPlusTreeNode | null, key: number, level: number): Step[] {
  const steps: Step[] = [];

  if (!node) {
    steps.push({
      highlightIds: [],
      message: `Value ${key} not found in tree`,
    });
    return steps;
  }

  steps.push({
    highlightIds: [node.id],
    message: `Searching in node [${node.keys.join(', ')}] at level ${level}`,
  });

  // In B+ Tree, we always search down to leaf nodes
  if (node.isLeaf) {
    // Check if key is in this leaf node
    const found = node.keys.includes(key);
    if (found) {
      steps.push({
        highlightIds: [node.id],
        message: `Found ${key} in leaf node at level ${level}!`,
      });
    } else {
      steps.push({
        highlightIds: [node.id],
        message: `Value ${key} not found in tree`,
      });
    }
    return steps;
  }

  // Find which child to search
  let i = 0;
  while (i < node.keys.length && key >= node.keys[i]) {
    i++;
  }

  // Recursively search in appropriate child
  const childSteps = searchSingleValue(node.children[i], key, level + 1);
  return [...steps, ...childSteps];
}
