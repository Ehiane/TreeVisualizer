import { BPlusTreeNode, Step } from '../types';

let nodeIdCounter = 6000; // Start high to avoid conflicts

let MIN_DEGREE = 3;

function cloneBPlusTreeNode(node: BPlusTreeNode | null): BPlusTreeNode | null {
  if (!node) return null;
  const cloned: BPlusTreeNode = {
    id: node.id,
    keys: [...node.keys],
    children: node.children.map(child => cloneBPlusTreeNode(child)!),
    isLeaf: node.isLeaf,
    next: null, // We'll handle next pointer separately
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
 * Check if a key exists in the B+ Tree (search in leaf nodes only)
 */
function keyExists(node: BPlusTreeNode | null, key: number): boolean {
  if (!node) return false;

  if (node.isLeaf) {
    return node.keys.includes(key);
  }

  // Navigate to the appropriate child
  let i = 0;
  while (i < node.keys.length && key >= node.keys[i]) {
    i++;
  }

  return keyExists(node.children[i], key);
}

/**
 * Insert values into B+ Tree with animation steps
 */
export function insertBPlusTreeWithSteps(
  startRoot: BPlusTreeNode | null,
  input: string,
  minDegree: number = 3
): { root: BPlusTreeNode | null; steps: Step[] } {
  MIN_DEGREE = minDegree;
  const values = parseValues(input);

  if (values.length === 0) {
    return { root: startRoot, steps: [] };
  }

  let root = cloneBPlusTreeNode(startRoot);
  const allSteps: Step[] = [];

  // If root is null, create initial empty node
  if (!root) {
    root = {
      id: `bplustree-node-${nodeIdCounter++}`,
      keys: [],
      children: [],
      isLeaf: true,
      next: null,
    };
  }

  for (const value of values) {
    // Check if value already exists
    if (keyExists(root, value)) {
      allSteps.push({
        highlightIds: [],
        message: `Value ${value} already exists in tree, skipping insertion`,
        bplustree: cloneBPlusTreeNode(root),
      });
      continue;
    }

    const { root: newRoot, steps } = insertSingleValue(root, value);
    root = newRoot;

    steps.forEach((step) => {
      allSteps.push({
        ...step,
        bplustree: cloneBPlusTreeNode(root),
      });
    });
  }

  return { root, steps: allSteps };
}

function insertSingleValue(
  startRoot: BPlusTreeNode,
  key: number
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
 * Search for values in B+ Tree with animation steps
 * In B+ Tree, all values are in leaf nodes
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
        message: `Value ${key} not found in tree (searched to leaf)`,
      });
    }
    return steps;
  }

  // Find which child to search
  let i = 0;
  while (i < node.keys.length && key >= node.keys[i]) {
    i++;
  }

  // Explain which child to navigate to and why
  let reason = '';
  if (i === 0) {
    reason = `${key} < ${node.keys[0]}, go to leftmost child`;
  } else if (i === node.keys.length) {
    reason = `${key} >= ${node.keys[node.keys.length - 1]}, go to rightmost child`;
  } else {
    reason = `${node.keys[i - 1]} <= ${key} < ${node.keys[i]}, go to child between them`;
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
 * Delete values from B+ Tree with animation steps
 */
export function deleteBPlusTreeWithSteps(
  startRoot: BPlusTreeNode | null,
  input: string,
  minDegree: number = 3
): { root: BPlusTreeNode | null; steps: Step[] } {
  MIN_DEGREE = minDegree;
  const values = parseValues(input);

  if (values.length === 0 || !startRoot) {
    return { root: startRoot, steps: [] };
  }

  let root = cloneBPlusTreeNode(startRoot);
  const allSteps: Step[] = [];

  for (const value of values) {
    if (root) {
      const { root: newRoot, steps } = deleteSingleValue(root, value);

      // Add steps with intermediate tree states already included
      allSteps.push(...steps);

      root = newRoot;
    }
  }

  return { root, steps: allSteps };
}

function deleteSingleValue(
  startRoot: BPlusTreeNode,
  key: number
): { root: BPlusTreeNode | null; steps: Step[] } {
  const steps: Step[] = [];
  const root = cloneBPlusTreeNode(startRoot)!;

  steps.push({
    highlightIds: [],
    message: `Deleting ${key} from B+ Tree`,
    bplustree: cloneBPlusTreeNode(root),
  });

  // Check if key exists
  if (!keyExists(root, key)) {
    steps.push({
      highlightIds: [],
      message: `Value ${key} not found in tree`,
      bplustree: cloneBPlusTreeNode(root),
    });
    return { root, steps };
  }

  deleteFromNode(root, root, key, steps);

  let finalRoot: BPlusTreeNode | null = root;

  // If root becomes empty, make its only child the new root
  if (root.keys.length === 0) {
    if (!root.isLeaf && root.children.length > 0) {
      finalRoot = root.children[0];
      steps.push({
        highlightIds: [root.id],
        message: `Root is empty, promoting child to new root`,
        bplustree: cloneBPlusTreeNode(finalRoot),
      });
    } else {
      finalRoot = null;
      steps.push({
        highlightIds: [],
        message: `Tree is now empty`,
        bplustree: null,
      });
    }
  }

  return { root: finalRoot, steps };
}

function deleteFromNode(rootRef: BPlusTreeNode, node: BPlusTreeNode, key: number, steps: Step[]): void {
  if (node.isLeaf) {
    // In B+ Tree, all keys are in leaf nodes
    const i = node.keys.indexOf(key);
    if (i !== -1) {
      steps.push({
        highlightIds: [node.id],
        highlightKeys: [{ nodeId: node.id, keyIndex: i }],
        message: `Deleting ${key} from leaf node [${node.keys.join(', ')}]`,
        bplustree: cloneBPlusTreeNode(rootRef),
      });
      node.keys.splice(i, 1);
      steps.push({
        highlightIds: [node.id],
        message: `Deleted ${key}, node is now [${node.keys.join(', ') || 'empty'}]`,
        bplustree: cloneBPlusTreeNode(rootRef),
      });
    }
  } else {
    // Navigate to the appropriate child
    let i = 0;
    while (i < node.keys.length && key >= node.keys[i]) {
      i++;
    }

    steps.push({
      highlightIds: [node.id],
      message: `Navigating to child ${i} to delete ${key}`,
      bplustree: cloneBPlusTreeNode(rootRef),
    });

    // If child has minimum keys, fill it first
    if (node.children[i].keys.length <= MIN_DEGREE - 1) {
      fill(rootRef, node, i, steps);

      // Recalculate child index after fill
      i = 0;
      while (i < node.keys.length && key >= node.keys[i]) {
        i++;
      }
    }

    if (i < node.children.length) {
      deleteFromNode(rootRef, node.children[i], key, steps);

      // Update parent keys if needed (for B+ Tree, internal nodes are indexes)
      updateParentKeys(rootRef, node, steps);
    }
  }
}

function updateParentKeys(rootRef: BPlusTreeNode, node: BPlusTreeNode, steps: Step[]): void {
  // In B+ Tree, internal nodes should reflect the smallest key in their right subtrees
  if (!node.isLeaf) {
    for (let i = 0; i < node.keys.length && i + 1 < node.children.length; i++) {
      const rightChild = node.children[i + 1];
      const smallestKey = getSmallestKey(rightChild);
      if (smallestKey !== null && node.keys[i] !== smallestKey) {
        steps.push({
          highlightIds: [node.id],
          message: `Updating parent key from ${node.keys[i]} to ${smallestKey}`,
          bplustree: cloneBPlusTreeNode(rootRef),
        });
        node.keys[i] = smallestKey;
      }
    }
  }
}

function getSmallestKey(node: BPlusTreeNode): number | null {
  if (!node) return null;

  let current = node;
  while (!current.isLeaf && current.children.length > 0) {
    current = current.children[0];
  }

  return current.keys.length > 0 ? current.keys[0] : null;
}

function fill(rootRef: BPlusTreeNode, node: BPlusTreeNode, i: number, steps: Step[]): void {
  const t = MIN_DEGREE;

  // If previous sibling has more than minimum keys, borrow from it
  if (i !== 0 && node.children[i - 1].keys.length > t - 1) {
    borrowFromPrev(rootRef, node, i, steps);
  }
  // If next sibling has more than minimum keys, borrow from it
  else if (i !== node.children.length - 1 && node.children[i + 1].keys.length > t - 1) {
    borrowFromNext(rootRef, node, i, steps);
  }
  // Merge with sibling
  else {
    if (i !== node.children.length - 1) {
      merge(rootRef, node, i, steps);
    } else {
      merge(rootRef, node, i - 1, steps);
    }
  }
}

function borrowFromPrev(rootRef: BPlusTreeNode, node: BPlusTreeNode, childIndex: number, steps: Step[]): void {
  const child = node.children[childIndex];
  const sibling = node.children[childIndex - 1];

  steps.push({
    highlightIds: [child.id, sibling.id],
    message: `Borrowing key from left sibling to fix underflow`,
    bplustree: cloneBPlusTreeNode(rootRef),
  });

  if (child.isLeaf) {
    // For leaf nodes, copy the last key from sibling
    child.keys.unshift(sibling.keys.pop()!);
    // Update parent key to reflect the first key in child
    node.keys[childIndex - 1] = child.keys[0];
  } else {
    // For internal nodes, rotate through parent
    child.keys.unshift(node.keys[childIndex - 1]);
    node.keys[childIndex - 1] = sibling.keys.pop()!;
    child.children.unshift(sibling.children.pop()!);
  }

  steps.push({
    highlightIds: [node.id, child.id, sibling.id],
    message: `Borrowed key, rebalanced nodes`,
    bplustree: cloneBPlusTreeNode(rootRef),
  });
}

function borrowFromNext(rootRef: BPlusTreeNode, node: BPlusTreeNode, childIndex: number, steps: Step[]): void {
  const child = node.children[childIndex];
  const sibling = node.children[childIndex + 1];

  steps.push({
    highlightIds: [child.id, sibling.id],
    message: `Borrowing key from right sibling to fix underflow`,
    bplustree: cloneBPlusTreeNode(rootRef),
  });

  if (child.isLeaf) {
    // For leaf nodes, copy the first key from sibling
    child.keys.push(sibling.keys.shift()!);
    // Update parent key to reflect the first key in sibling
    node.keys[childIndex] = sibling.keys[0];
  } else {
    // For internal nodes, rotate through parent
    child.keys.push(node.keys[childIndex]);
    node.keys[childIndex] = sibling.keys.shift()!;
    child.children.push(sibling.children.shift()!);
  }

  steps.push({
    highlightIds: [node.id, child.id, sibling.id],
    message: `Borrowed key, rebalanced nodes`,
    bplustree: cloneBPlusTreeNode(rootRef),
  });
}

function merge(rootRef: BPlusTreeNode, node: BPlusTreeNode, i: number, steps: Step[]): void {
  const child = node.children[i];
  const sibling = node.children[i + 1];

  steps.push({
    highlightIds: [child.id, sibling.id],
    message: `Merging nodes [${child.keys.join(', ')}] and [${sibling.keys.join(', ')}]`,
    bplustree: cloneBPlusTreeNode(rootRef),
  });

  if (child.isLeaf) {
    // For leaf nodes, just concatenate keys and update next pointer
    child.keys = child.keys.concat(sibling.keys);
    child.next = sibling.next;
    // Remove the key from parent
    node.keys.splice(i, 1);
  } else {
    // For internal nodes, pull key from parent and merge
    child.keys.push(node.keys[i]);
    child.keys = child.keys.concat(sibling.keys);
    child.children = child.children.concat(sibling.children);
    // Remove the key from parent
    node.keys.splice(i, 1);
  }

  // Remove the sibling
  node.children.splice(i + 1, 1);

  steps.push({
    highlightIds: [node.id, child.id],
    message: `Merged into [${child.keys.join(', ')}]`,
    bplustree: cloneBPlusTreeNode(rootRef),
  });
}
