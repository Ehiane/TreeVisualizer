import { BTreeNode, Step } from '../types';

let nodeIdCounter = 4000; // Start high to avoid conflicts

// Minimum degree (t): Every node (except root) must have at least t-1 keys
// Every node can have at most 2t-1 keys
let MIN_DEGREE = 3; // Default: 2-5 keys per node (except root)

export function setMinDegree(t: number) {
  MIN_DEGREE = Math.max(2, t); // Ensure minimum degree is at least 2
}

function cloneBTreeNode(node: BTreeNode | null): BTreeNode | null {
  if (!node) return null;
  return {
    id: node.id,
    keys: [...node.keys],
    children: node.children.map(child => cloneBTreeNode(child)!),
    isLeaf: node.isLeaf,
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
 * Build B-Tree from array input string
 */
export function buildBTree(input: string): BTreeNode | null {
  const values = parseValues(input);

  if (values.length === 0) {
    return null;
  }

  let root: BTreeNode | null = {
    id: `btree-node-${nodeIdCounter++}`,
    keys: [],
    children: [],
    isLeaf: true,
  };

  for (const value of values) {
    root = insertBTree(root, value);
  }

  return root;
}

/**
 * Build B-Tree with animation steps
 */
export function buildBTreeWithSteps(input: string): {
  root: BTreeNode | null;
  steps: Step[];
} {
  const values = parseValues(input);

  if (values.length === 0) {
    return { root: null, steps: [] };
  }

  let root: BTreeNode | null = {
    id: `btree-node-${nodeIdCounter++}`,
    keys: [],
    children: [],
    isLeaf: true,
  };
  const steps: Step[] = [];

  steps.push({
    highlightIds: [],
    message: `Starting with values: ${values.join(', ')}`,
    btree: null,
    remainingValues: [...values],
  });

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    const remaining = values.slice(i + 1);
    const { root: newRoot, steps: insertSteps } = insertBTreeWithSteps(root, value, remaining);
    root = newRoot;

    insertSteps.forEach((step) => {
      steps.push({
        ...step,
        btree: cloneBTreeNode(root),
        remainingValues: remaining,
        currentValue: value,
      });
    });
  }

  return { root, steps };
}

function insertBTree(root: BTreeNode, key: number): BTreeNode {
  // If root is full, split it
  if (root.keys.length === 2 * MIN_DEGREE - 1) {
    const newRoot: BTreeNode = {
      id: `btree-node-${nodeIdCounter++}`,
      keys: [],
      children: [root],
      isLeaf: false,
    };
    splitChild(newRoot, 0);
    insertNonFull(newRoot, key);
    return newRoot;
  } else {
    insertNonFull(root, key);
    return root;
  }
}

function insertBTreeWithSteps(
  startRoot: BTreeNode,
  key: number,
  remaining: number[]
): { root: BTreeNode; steps: Step[] } {
  const steps: Step[] = [];
  const root = cloneBTreeNode(startRoot)!;

  steps.push({
    highlightIds: [],
    message: `Inserting ${key} into B-Tree`,
  });

  // If root is full, split it
  if (root.keys.length === 2 * MIN_DEGREE - 1) {
    steps.push({
      highlightIds: [root.id],
      message: `Root is full (${root.keys.join(', ')}), splitting root`,
    });

    const newRoot: BTreeNode = {
      id: `btree-node-${nodeIdCounter++}`,
      keys: [],
      children: [root],
      isLeaf: false,
    };
    splitChildWithSteps(newRoot, 0, steps);
    insertNonFullWithSteps(newRoot, key, steps);
    return { root: newRoot, steps };
  } else {
    insertNonFullWithSteps(root, key, steps);
    return { root, steps };
  }
}

function splitChild(parent: BTreeNode, index: number): void {
  const fullChild = parent.children[index];
  const t = MIN_DEGREE;

  const newChild: BTreeNode = {
    id: `btree-node-${nodeIdCounter++}`,
    keys: fullChild.keys.splice(t),
    children: fullChild.isLeaf ? [] : fullChild.children.splice(t),
    isLeaf: fullChild.isLeaf,
  };

  const midKey = fullChild.keys.pop()!;

  parent.keys.splice(index, 0, midKey);
  parent.children.splice(index + 1, 0, newChild);
}

function splitChildWithSteps(parent: BTreeNode, index: number, steps: Step[]): void {
  const fullChild = parent.children[index];
  const t = MIN_DEGREE;

  steps.push({
    highlightIds: [fullChild.id],
    message: `Splitting node [${fullChild.keys.join(', ')}]`,
  });

  const newChild: BTreeNode = {
    id: `btree-node-${nodeIdCounter++}`,
    keys: fullChild.keys.splice(t),
    children: fullChild.isLeaf ? [] : fullChild.children.splice(t),
    isLeaf: fullChild.isLeaf,
  };

  const midKey = fullChild.keys.pop()!;

  parent.keys.splice(index, 0, midKey);
  parent.children.splice(index + 1, 0, newChild);

  steps.push({
    highlightIds: [parent.id, fullChild.id, newChild.id],
    message: `Split complete: middle key ${midKey} moved to parent`,
  });
}

function insertNonFull(node: BTreeNode, key: number): void {
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

function insertNonFullWithSteps(node: BTreeNode, key: number, steps: Step[]): void {
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
 * Search for a value in B-Tree with animation steps
 */
export function searchBTreeWithSteps(
  root: BTreeNode | null,
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

function searchSingleValue(node: BTreeNode | null, key: number, level: number): Step[] {
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

  // Check if key is in this node
  let i = 0;
  while (i < node.keys.length && key > node.keys[i]) {
    i++;
  }

  // Found the key
  if (i < node.keys.length && key === node.keys[i]) {
    steps.push({
      highlightIds: [node.id],
      message: `Found ${key} at level ${level}!`,
    });
    return steps;
  }

  // If this is a leaf, key doesn't exist
  if (node.isLeaf) {
    steps.push({
      highlightIds: [node.id],
      message: `Value ${key} not found in tree`,
    });
    return steps;
  }

  // Recursively search in appropriate child
  const childSteps = searchSingleValue(node.children[i], key, level + 1);
  return [...steps, ...childSteps];
}
