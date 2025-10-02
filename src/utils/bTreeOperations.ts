import { BTreeNode, Step } from '../types';
import { setMinDegree } from './bTree';

let nodeIdCounter = 5000; // Start high to avoid conflicts

// This will use the MIN_DEGREE set in bTree.ts
// We need to import or get the current MIN_DEGREE value
// For now, we'll use a default that matches
let MIN_DEGREE = 3;

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
 * Check if a key exists in the B-Tree
 */
function keyExists(node: BTreeNode | null, key: number): boolean {
  if (!node) return false;

  // Check if key is in this node
  let i = 0;
  while (i < node.keys.length && key > node.keys[i]) {
    i++;
  }

  // Found the key
  if (i < node.keys.length && key === node.keys[i]) {
    return true;
  }

  // If this is a leaf, key doesn't exist
  if (node.isLeaf) {
    return false;
  }

  // Recursively check in appropriate child
  return keyExists(node.children[i], key);
}

/**
 * Insert values into B-Tree with animation steps
 */
export function insertBTreeWithSteps(
  startRoot: BTreeNode | null,
  input: string,
  minDegree: number = 3
): { root: BTreeNode | null; steps: Step[] } {
  MIN_DEGREE = minDegree;
  const values = parseValues(input);

  if (values.length === 0) {
    return { root: startRoot, steps: [] };
  }

  let root = cloneBTreeNode(startRoot);
  const allSteps: Step[] = [];

  // If root is null, create initial empty node
  if (!root) {
    root = {
      id: `btree-node-${nodeIdCounter++}`,
      keys: [],
      children: [],
      isLeaf: true,
    };
  }

  for (const value of values) {
    // Check if value already exists
    if (keyExists(root, value)) {
      allSteps.push({
        highlightIds: [],
        message: `Value ${value} already exists in tree, skipping insertion`,
        btree: cloneBTreeNode(root),
      });
      continue;
    }

    const { root: newRoot, steps } = insertSingleValue(root, value);
    root = newRoot;

    steps.forEach((step) => {
      allSteps.push({
        ...step,
        btree: cloneBTreeNode(root),
      });
    });
  }

  return { root, steps: allSteps };
}

function insertSingleValue(
  startRoot: BTreeNode,
  key: number
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
 * Search for values in B-Tree with animation steps
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
      message: `Value ${key} not found in tree (searched to leaf)`,
    });
    return steps;
  }

  // Explain which child to navigate to and why
  let reason = '';
  if (i === 0) {
    reason = `${key} < ${node.keys[0]}, go to leftmost child`;
  } else if (i === node.keys.length) {
    reason = `${key} > ${node.keys[node.keys.length - 1]}, go to rightmost child`;
  } else {
    reason = `${node.keys[i - 1]} < ${key} < ${node.keys[i]}, go to child between them`;
  }

  steps.push({
    highlightIds: [node.id],
    message: reason,
  });

  // Recursively search in appropriate child
  const childSteps = searchSingleValue(node.children[i], key, level + 1);
  return [...steps, ...childSteps];
}

/**
 * Delete values from B-Tree with animation steps
 */
export function deleteBTreeWithSteps(
  startRoot: BTreeNode | null,
  input: string,
  minDegree: number = 3
): { root: BTreeNode | null; steps: Step[] } {
  MIN_DEGREE = minDegree;
  const values = parseValues(input);

  if (values.length === 0 || !startRoot) {
    return { root: startRoot, steps: [] };
  }

  let root = cloneBTreeNode(startRoot);
  const allSteps: Step[] = [];

  for (const value of values) {
    if (root) {
      const { root: newRoot, steps } = deleteSingleValue(root, value);
      root = newRoot;

      steps.forEach((step) => {
        allSteps.push({
          ...step,
          btree: cloneBTreeNode(root),
        });
      });
    }
  }

  return { root, steps: allSteps };
}

function deleteSingleValue(
  startRoot: BTreeNode,
  key: number
): { root: BTreeNode | null; steps: Step[] } {
  const steps: Step[] = [];
  const root = cloneBTreeNode(startRoot)!;

  steps.push({
    highlightIds: [],
    message: `Deleting ${key} from B-Tree`,
  });

  deleteFromNode(root, key, steps);

  // If root becomes empty, make its only child the new root
  if (root.keys.length === 0) {
    if (!root.isLeaf && root.children.length > 0) {
      steps.push({
        highlightIds: [root.id],
        message: `Root is empty, promoting child to new root`,
      });
      return { root: root.children[0], steps };
    } else {
      steps.push({
        highlightIds: [],
        message: `Tree is now empty`,
      });
      return { root: null, steps };
    }
  }

  return { root, steps };
}

function deleteFromNode(node: BTreeNode, key: number, steps: Step[]): void {
  let i = 0;
  while (i < node.keys.length && key > node.keys[i]) {
    i++;
  }

  if (i < node.keys.length && key === node.keys[i]) {
    // Key found in this node
    steps.push({
      highlightIds: [node.id],
      message: `Found ${key} in node [${node.keys.join(', ')}]`,
    });

    if (node.isLeaf) {
      // Case 1: Key is in a leaf node - simply remove it
      steps.push({
        highlightIds: [node.id],
        message: `Deleting ${key} from leaf node`,
      });
      node.keys.splice(i, 1);
      steps.push({
        highlightIds: [node.id],
        message: `Deleted ${key}, node is now [${node.keys.join(', ') || 'empty'}]`,
      });
    } else {
      // Case 2: Key is in an internal node
      deleteFromInternalNode(node, key, i, steps);
    }
  } else {
    // Key is not in this node
    if (node.isLeaf) {
      steps.push({
        highlightIds: [node.id],
        message: `${key} not found in tree`,
      });
      return;
    }

    // Key might be in subtree
    const isInLastChild = (i === node.keys.length);

    steps.push({
      highlightIds: [node.id],
      message: `${key} not in this node, searching in child ${i}`,
    });

    // If child has minimum keys, fill it first
    if (node.children[i].keys.length < MIN_DEGREE - 1) {
      const wasLastChild = (i === node.children.length - 1);
      fill(node, i, steps);

      // After filling, the key position might have changed
      // Also, if we merged and the child was the last child, it got merged with i-1
      if (wasLastChild && i > 0 && i >= node.children.length) {
        i--;
      }

      // Recalculate child index based on key
      let newI = 0;
      while (newI < node.keys.length && key > node.keys[newI]) {
        newI++;
      }

      if (newI < node.keys.length && key === node.keys[newI]) {
        deleteFromInternalNode(node, key, newI, steps);
        return;
      }

      i = newI;
    }

    if (i < node.children.length) {
      deleteFromNode(node.children[i], key, steps);

      // After deletion, check if child has underflow and fix it
      if (i < node.children.length && node.children[i].keys.length < MIN_DEGREE - 1) {
        steps.push({
          highlightIds: [node.children[i].id],
          message: `Child node has underflow (${node.children[i].keys.length} keys < ${MIN_DEGREE - 1}), rebalancing`,
        });
        fill(node, i, steps);
      }
    }
  }
}

function deleteFromInternalNode(node: BTreeNode, key: number, i: number, steps: Step[]): void {
  const t = MIN_DEGREE;

  if (node.children[i].keys.length >= t) {
    // Case 2a: Left child has at least t keys
    const predecessor = getPredecessor(node, i);
    steps.push({
      highlightIds: [node.id, node.children[i].id],
      message: `Replacing ${key} with predecessor ${predecessor}`,
    });
    node.keys[i] = predecessor;
    deleteFromNode(node.children[i], predecessor, steps);

    // Check for underflow after deletion
    if (node.children[i].keys.length < t - 1) {
      steps.push({
        highlightIds: [node.children[i].id],
        message: `Child has underflow after deleting predecessor, rebalancing`,
      });
      fill(node, i, steps);
    }
  } else if (node.children[i + 1].keys.length >= t) {
    // Case 2b: Right child has at least t keys
    const successor = getSuccessor(node, i);
    steps.push({
      highlightIds: [node.id, node.children[i + 1].id],
      message: `Replacing ${key} with successor ${successor}`,
    });
    node.keys[i] = successor;
    deleteFromNode(node.children[i + 1], successor, steps);

    // Check for underflow after deletion
    if (node.children[i + 1].keys.length < t - 1) {
      steps.push({
        highlightIds: [node.children[i + 1].id],
        message: `Child has underflow after deleting successor, rebalancing`,
      });
      fill(node, i + 1, steps);
    }
  } else {
    // Case 2c: Both children have t-1 keys, merge
    steps.push({
      highlightIds: [node.children[i].id, node.children[i + 1].id],
      message: `Both children have minimum keys, merging with key ${key}`,
    });
    merge(node, i, steps);
    deleteFromNode(node.children[i], key, steps);

    // Check for underflow after deletion from merged node
    if (i < node.children.length && node.children[i].keys.length < t - 1) {
      steps.push({
        highlightIds: [node.children[i].id],
        message: `Merged child has underflow, rebalancing`,
      });
      fill(node, i, steps);
    }
  }
}

function getPredecessor(node: BTreeNode, i: number): number {
  let current = node.children[i];
  while (!current.isLeaf) {
    current = current.children[current.children.length - 1];
  }
  return current.keys[current.keys.length - 1];
}

function getSuccessor(node: BTreeNode, i: number): number {
  let current = node.children[i + 1];
  while (!current.isLeaf) {
    current = current.children[0];
  }
  return current.keys[0];
}

function fill(node: BTreeNode, i: number, steps: Step[]): void {
  const t = MIN_DEGREE;

  // If previous sibling has at least t keys, borrow from it
  if (i !== 0 && node.children[i - 1].keys.length >= t) {
    borrowFromPrev(node, i, steps);
  }
  // If next sibling has at least t keys, borrow from it
  else if (i !== node.children.length - 1 && node.children[i + 1].keys.length >= t) {
    borrowFromNext(node, i, steps);
  }
  // Merge with sibling
  else {
    if (i !== node.children.length - 1) {
      merge(node, i, steps);
    } else {
      merge(node, i - 1, steps);
    }
  }
}

function borrowFromPrev(node: BTreeNode, childIndex: number, steps: Step[]): void {
  const child = node.children[childIndex];
  const sibling = node.children[childIndex - 1];

  steps.push({
    highlightIds: [child.id, sibling.id],
    message: `Borrowing key from left sibling to fix underflow`,
  });

  // Move a key from parent to child
  child.keys.unshift(node.keys[childIndex - 1]);

  // Move a key from sibling to parent
  node.keys[childIndex - 1] = sibling.keys.pop()!;

  // Move child pointer if not leaf
  if (!child.isLeaf) {
    child.children.unshift(sibling.children.pop()!);
  }

  steps.push({
    highlightIds: [node.id, child.id, sibling.id],
    message: `Borrowed key ${node.keys[childIndex - 1]}, rebalanced nodes`,
  });
}

function borrowFromNext(node: BTreeNode, childIndex: number, steps: Step[]): void {
  const child = node.children[childIndex];
  const sibling = node.children[childIndex + 1];

  steps.push({
    highlightIds: [child.id, sibling.id],
    message: `Borrowing key from right sibling to fix underflow`,
  });

  // Move a key from parent to child
  child.keys.push(node.keys[childIndex]);

  // Move a key from sibling to parent
  node.keys[childIndex] = sibling.keys.shift()!;

  // Move child pointer if not leaf
  if (!child.isLeaf) {
    child.children.push(sibling.children.shift()!);
  }

  steps.push({
    highlightIds: [node.id, child.id, sibling.id],
    message: `Borrowed key ${node.keys[childIndex]}, rebalanced nodes`,
  });
}

function merge(node: BTreeNode, i: number, steps: Step[]): void {
  const child = node.children[i];
  const sibling = node.children[i + 1];

  steps.push({
    highlightIds: [child.id, sibling.id],
    message: `Merging nodes [${child.keys.join(', ')}] and [${sibling.keys.join(', ')}]`,
  });

  // Pull key from current node and merge with right sibling
  child.keys.push(node.keys[i]);

  // Copy keys from sibling to child
  child.keys = child.keys.concat(sibling.keys);

  // Copy child pointers from sibling to child
  if (!child.isLeaf) {
    child.children = child.children.concat(sibling.children);
  }

  // Remove the key from current node
  node.keys.splice(i, 1);

  // Remove the sibling
  node.children.splice(i + 1, 1);

  steps.push({
    highlightIds: [node.id, child.id],
    message: `Merged into [${child.keys.join(', ')}]`,
  });
}
