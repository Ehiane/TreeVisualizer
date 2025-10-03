import { TreeNode, Step } from '../types';

export type RBTreeNode = TreeNode & {
  color: 'red' | 'black';
  parent?: RBTreeNode | null;
};

let nodeIdCounter = 3000;

/**
 * Simple clone for visualization (no parent pointers in clone)
 */
function cloneForVisualization(node: RBTreeNode | null): TreeNode | null {
  if (!node) return null;

  const cloned: any = {
    id: node.id,
    value: node.value,
    color: node.color,
    left: cloneForVisualization(node.left as RBTreeNode | null),
    right: cloneForVisualization(node.right as RBTreeNode | null),
  };

  return cloned;
}

/**
 * Build Red-Black tree from array input string
 */
export function buildRedBlackTree(input: string): TreeNode | null {
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

  let root: RBTreeNode | null = null;

  for (const value of uniqueValues) {
    root = insertNode(root, value);
  }

  return cloneForVisualization(root);
}

/**
 * Build Red-Black tree with animation steps
 */
export function buildRedBlackTreeWithSteps(input: string): {
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

  let root: RBTreeNode | null = null;
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

    const insertSteps: Step[] = [];
    root = insertNodeWithSteps(root, value, insertSteps);

    insertSteps.forEach((step) => {
      steps.push({
        ...step,
        tree: cloneForVisualization(root),
        remainingValues: remaining,
        currentValue: value,
      });
    });
  }

  // Add final step with no highlights
  steps.push({
    highlightIds: [],
    message: `Build complete`,
    tree: cloneForVisualization(root),
    remainingValues: [],
  });

  return { root: cloneForVisualization(root), steps };
}

function insertNode(root: RBTreeNode | null, value: number): RBTreeNode {
  // Standard BST insert
  if (root === null) {
    return {
      id: `node-${nodeIdCounter++}`,
      value,
      color: 'black',
      left: null,
      right: null,
      parent: null,
    };
  }

  // Find position and insert
  let current = root;
  let parent: RBTreeNode | null = null;

  while (current !== null) {
    parent = current;
    if (value === current.value) {
      return root; // Duplicate
    } else if (value < current.value) {
      current = current.left as RBTreeNode;
    } else {
      current = current.right as RBTreeNode;
    }
  }

  const newNode: RBTreeNode = {
    id: `node-${nodeIdCounter++}`,
    value,
    color: 'red',
    left: null,
    right: null,
    parent,
  };

  if (value < parent!.value) {
    parent!.left = newNode as TreeNode;
  } else {
    parent!.right = newNode as TreeNode;
  }

  // Fix violations and get new root
  return fixViolations(root, newNode);
}

function insertNodeWithSteps(
  root: RBTreeNode | null,
  value: number,
  steps: Step[]
): RBTreeNode {
  // Empty tree case
  if (root === null) {
    const newNode: RBTreeNode = {
      id: `node-${nodeIdCounter++}`,
      value,
      color: 'black',
      left: null,
      right: null,
      parent: null,
    };
    steps.push({
      highlightIds: [newNode.id],
      message: `Insert ${value} as root node (black)`,
    });
    return newNode;
  }

  // Find position
  let current: RBTreeNode | null = root;
  let parent: RBTreeNode | null = null;
  const path: string[] = [];

  while (current !== null) {
    path.push(current.id);
    parent = current;
    if (value === current.value) {
      steps.push({
        highlightIds: path,
        message: `Value ${value} already exists, skipping`,
      });
      return root;
    } else if (value < current.value) {
      steps.push({
        highlightIds: path,
        message: `${value} < ${current.value}, go left`,
      });
      current = current.left as RBTreeNode;
    } else {
      steps.push({
        highlightIds: path,
        message: `${value} > ${current.value}, go right`,
      });
      current = current.right as RBTreeNode;
    }
  }

  // Insert new red node
  const newNode: RBTreeNode = {
    id: `node-${nodeIdCounter++}`,
    value,
    color: 'red',
    left: null,
    right: null,
    parent,
  };

  if (value < parent!.value) {
    parent!.left = newNode as TreeNode;
    steps.push({
      highlightIds: [...path, newNode.id],
      message: `Insert ${value} as left child of ${parent!.value} (red)`,
    });
  } else {
    parent!.right = newNode as TreeNode;
    steps.push({
      highlightIds: [...path, newNode.id],
      message: `Insert ${value} as right child of ${parent!.value} (red)`,
    });
  }

  // Fix violations and return new root
  return fixViolationsWithSteps(root, newNode, steps);
}

function fixViolations(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  let current = node;

  while (current.parent && (current.parent as RBTreeNode).color === 'red') {
    const parent = current.parent as RBTreeNode;
    const grandParent = parent.parent as RBTreeNode;

    if (!grandParent) break;

    if (parent === grandParent.left) {
      const uncle = grandParent.right as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        // Case 1: Uncle is red - recolor
        parent.color = 'black';
        uncle.color = 'black';
        grandParent.color = 'red';
        current = grandParent;
      } else {
        if (current === parent.right) {
          // Case 2: Triangle - rotate parent
          current = parent;
          root = rotateLeft(root, current);
          // After rotation, current's parent is the former right child
        }
        // Case 3: Line - rotate grandparent
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        root = rotateRight(root, grandParent);
      }
    } else {
      const uncle = grandParent.left as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        // Case 1: Uncle is red - recolor
        parent.color = 'black';
        uncle.color = 'black';
        grandParent.color = 'red';
        current = grandParent;
      } else {
        if (current === parent.left) {
          // Case 2: Triangle - rotate parent
          current = parent;
          root = rotateRight(root, current);
          // After rotation, current's parent is the former left child
        }
        // Case 3: Line - rotate grandparent
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        root = rotateLeft(root, grandParent);
      }
    }
  }

  root.color = 'black';
  return root;
}

function fixViolationsWithSteps(
  root: RBTreeNode,
  node: RBTreeNode,
  steps: Step[]
): RBTreeNode {
  let current = node;

  while (current.parent && (current.parent as RBTreeNode).color === 'red') {
    const parent = current.parent as RBTreeNode;
    const grandParent = parent.parent as RBTreeNode;

    if (!grandParent) break;

    steps.push({
      highlightIds: [current.id, parent.id, grandParent.id],
      message: `Red-red violation: ${current.value} and parent ${parent.value}`,
    });

    if (parent === grandParent.left) {
      const uncle = grandParent.right as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        steps.push({
          highlightIds: [parent.id, uncle.id, grandParent.id],
          message: `Uncle ${uncle.value} is red: recolor and move up`,
        });
        parent.color = 'black';
        uncle.color = 'black';
        grandParent.color = 'red';
        current = grandParent;
      } else {
        if (current === parent.right) {
          steps.push({
            highlightIds: [current.id, parent.id],
            message: `Triangle case: rotate parent ${parent.value} left`,
          });
          current = parent;
          root = rotateLeft(root, current);
        }
        steps.push({
          highlightIds: [grandParent.id],
          message: `Line case: rotate grandparent ${grandParent.value} right and recolor`,
        });
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        root = rotateRight(root, grandParent);
      }
    } else {
      const uncle = grandParent.left as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        steps.push({
          highlightIds: [parent.id, uncle.id, grandParent.id],
          message: `Uncle ${uncle.value} is red: recolor and move up`,
        });
        parent.color = 'black';
        uncle.color = 'black';
        grandParent.color = 'red';
        current = grandParent;
      } else {
        if (current === parent.left) {
          steps.push({
            highlightIds: [current.id, parent.id],
            message: `Triangle case: rotate parent ${parent.value} right`,
          });
          current = parent;
          root = rotateRight(root, current);
        }
        steps.push({
          highlightIds: [grandParent.id],
          message: `Line case: rotate grandparent ${grandParent.value} left and recolor`,
        });
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        root = rotateLeft(root, grandParent);
      }
    }
  }

  root.color = 'black';
  steps.push({
    highlightIds: [root.id],
    message: `Ensure root ${root.value} is black`,
  });

  return root;
}

function rotateLeft(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  const rightChild = node.right as RBTreeNode;

  node.right = rightChild.left;
  if (rightChild.left) {
    (rightChild.left as RBTreeNode).parent = node;
  }

  rightChild.parent = node.parent;
  if (!node.parent) {
    root = rightChild;
  } else if (node === (node.parent as RBTreeNode).left) {
    (node.parent as RBTreeNode).left = rightChild as TreeNode;
  } else {
    (node.parent as RBTreeNode).right = rightChild as TreeNode;
  }

  rightChild.left = node as TreeNode;
  node.parent = rightChild;

  return root;
}

function rotateRight(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  const leftChild = node.left as RBTreeNode;

  node.left = leftChild.right;
  if (leftChild.right) {
    (leftChild.right as RBTreeNode).parent = node;
  }

  leftChild.parent = node.parent;
  if (!node.parent) {
    root = leftChild;
  } else if (node === (node.parent as RBTreeNode).right) {
    (node.parent as RBTreeNode).right = leftChild as TreeNode;
  } else {
    (node.parent as RBTreeNode).left = leftChild as TreeNode;
  }

  leftChild.right = node as TreeNode;
  node.parent = leftChild;

  return root;
}
