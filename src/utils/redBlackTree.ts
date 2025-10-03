import { TreeNode, Step } from '../types';

// Extended TreeNode type for Red-Black Tree (includes color)
export type RBTreeNode = TreeNode & {
  color: 'red' | 'black';
  parent?: RBTreeNode | null;
};

let nodeIdCounter = 3000; // Start high to avoid conflicts

function cloneTree(node: RBTreeNode | null, parent: RBTreeNode | null = null): RBTreeNode | null {
  if (!node) return null;

  const cloned: RBTreeNode = {
    id: node.id,
    value: node.value,
    color: node.color,
    left: null,
    right: null,
    parent: parent,
  };

  cloned.left = cloneTree(node.left as RBTreeNode | null, cloned) as TreeNode | null;
  cloned.right = cloneTree(node.right as RBTreeNode | null, cloned) as TreeNode | null;

  return cloned;
}

function getColor(node: RBTreeNode | null): 'red' | 'black' {
  return node === null ? 'black' : node.color;
}

function rotateLeft(node: RBTreeNode): RBTreeNode {
  const rightChild = node.right as RBTreeNode;
  node.right = rightChild.left;
  if (rightChild.left) {
    (rightChild.left as RBTreeNode).parent = node;
  }
  rightChild.parent = node.parent;
  rightChild.left = node as TreeNode;
  node.parent = rightChild;
  return rightChild;
}

function rotateRight(node: RBTreeNode): RBTreeNode {
  const leftChild = node.left as RBTreeNode;
  node.left = leftChild.right;
  if (leftChild.right) {
    (leftChild.right as RBTreeNode).parent = node;
  }
  leftChild.parent = node.parent;
  leftChild.right = node as TreeNode;
  node.parent = leftChild;
  return leftChild;
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
    root = insertRBNode(root, value);
  }

  return root;
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
    const { root: newRoot, steps: insertSteps } = insertRBNodeWithSteps(root, value, remaining);
    root = newRoot;

    insertSteps.forEach((step) => {
      steps.push({
        ...step,
        tree: cloneTree(root as RBTreeNode) as TreeNode | null,
        remainingValues: remaining,
        currentValue: value,
      });
    });
  }

  return { root: root as TreeNode | null, steps };
}

function insertRBNode(root: RBTreeNode | null, value: number): RBTreeNode {
  // Standard BST insert
  if (root === null) {
    return {
      id: `node-${nodeIdCounter++}`,
      value,
      color: 'black', // Root is always black
      left: null,
      right: null,
      parent: null,
    };
  }

  const newNode: RBTreeNode = {
    id: `node-${nodeIdCounter++}`,
    value,
    color: 'red', // New nodes are red
    left: null,
    right: null,
    parent: null,
  };

  let current = root;
  let parent: RBTreeNode | null = null;

  while (current !== null) {
    parent = current;
    if (value === current.value) {
      return root; // Skip duplicates
    } else if (value < current.value) {
      current = current.left as RBTreeNode;
    } else {
      current = current.right as RBTreeNode;
    }
  }

  newNode.parent = parent;
  if (value < parent!.value) {
    parent!.left = newNode as TreeNode;
  } else {
    parent!.right = newNode as TreeNode;
  }

  return fixViolation(root, newNode);
}

function fixViolation(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  let current = node;
  let parent: RBTreeNode | null = null;
  let grandParent: RBTreeNode | null = null;

  while (current !== root && current.color === 'red' && current.parent && (current.parent as RBTreeNode).color === 'red') {
    parent = current.parent as RBTreeNode;
    grandParent = parent.parent as RBTreeNode;

    // Case A: Parent is left child of grandparent
    if (parent === grandParent.left) {
      const uncle = grandParent.right as RBTreeNode | null;

      // Case 1: Uncle is red - only recoloring
      if (uncle && uncle.color === 'red') {
        grandParent.color = 'red';
        parent.color = 'black';
        uncle.color = 'black';
        current = grandParent;
      } else {
        // Case 2: Node is right child - left rotation
        if (current === parent.right) {
          current = parent;
          const newParent = rotateLeft(current);
          if (current === root) {
            root = newParent;
          } else if (current.parent && (current.parent as RBTreeNode).left === current) {
            (current.parent as RBTreeNode).left = newParent as TreeNode;
          } else if (current.parent) {
            (current.parent as RBTreeNode).right = newParent as TreeNode;
          }
          parent = current.parent as RBTreeNode;
        }

        // Case 3: Node is left child - right rotation
        parent!.color = 'black';
        grandParent!.color = 'red';
        const newGrandParent = rotateRight(grandParent);
        if (grandParent === root) {
          root = newGrandParent;
        } else if (grandParent.parent && (grandParent.parent as RBTreeNode).left === grandParent) {
          (grandParent.parent as RBTreeNode).left = newGrandParent as TreeNode;
        } else if (grandParent.parent) {
          (grandParent.parent as RBTreeNode).right = newGrandParent as TreeNode;
        }
      }
    }
    // Case B: Parent is right child of grandparent
    else {
      const uncle = grandParent.left as RBTreeNode | null;

      // Case 1: Uncle is red - only recoloring
      if (uncle && uncle.color === 'red') {
        grandParent.color = 'red';
        parent.color = 'black';
        uncle.color = 'black';
        current = grandParent;
      } else {
        // Case 2: Node is left child - right rotation
        if (current === parent.left) {
          current = parent;
          const newParent = rotateRight(current);
          if (current === root) {
            root = newParent;
          } else if (current.parent && (current.parent as RBTreeNode).left === current) {
            (current.parent as RBTreeNode).left = newParent as TreeNode;
          } else if (current.parent) {
            (current.parent as RBTreeNode).right = newParent as TreeNode;
          }
          parent = current.parent as RBTreeNode;
        }

        // Case 3: Node is right child - left rotation
        parent!.color = 'black';
        grandParent!.color = 'red';
        const newGrandParent = rotateLeft(grandParent);
        if (grandParent === root) {
          root = newGrandParent;
        } else if (grandParent.parent && (grandParent.parent as RBTreeNode).left === grandParent) {
          (grandParent.parent as RBTreeNode).left = newGrandParent as TreeNode;
        } else if (grandParent.parent) {
          (grandParent.parent as RBTreeNode).right = newGrandParent as TreeNode;
        }
      }
    }
  }

  root.color = 'black'; // Root must be black
  return root;
}

function insertRBNodeWithSteps(
  startRoot: RBTreeNode | null,
  value: number,
  remaining: number[]
): { root: TreeNode; steps: Step[] } {
  const steps: Step[] = [];

  // Empty tree case
  if (startRoot === null) {
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
    return { root: newNode, steps };
  }

  const root = cloneTree(startRoot)!;

  // Find insertion point
  let current: RBTreeNode | null = root;
  let parent: RBTreeNode | null = null;
  const path: string[] = [];

  while (current !== null) {
    path.push(current.id);
    parent = current;
    if (value === current.value) {
      steps.push({
        highlightIds: path,
        message: `Value ${value} already exists, skipping duplicate`,
      });
      return { root, steps };
    } else if (value < current.value) {
      steps.push({
        highlightIds: path,
        message: `Comparing ${value} with ${current.value}: go left`,
      });
      current = current.left as RBTreeNode | null;
    } else {
      steps.push({
        highlightIds: path,
        message: `Comparing ${value} with ${current.value}: go right`,
      });
      current = current.right as RBTreeNode | null;
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

  // Fix violations
  const fixedRoot = fixViolationWithSteps(root, newNode, steps);

  return { root: fixedRoot, steps };
}

function fixViolationWithSteps(root: RBTreeNode, node: RBTreeNode, steps: Step[]): TreeNode {
  let current = node;
  let actualRoot: RBTreeNode = root;

  while (current.color === 'red' && current.parent && (current.parent as RBTreeNode).color === 'red') {
    const parent = current.parent as RBTreeNode;
    const grandParent = parent.parent as RBTreeNode;

    if (!grandParent) {
      break;
    }

    steps.push({
      highlightIds: [current.id, parent.id, grandParent.id],
      message: `Red-Red violation detected: ${current.value} and ${parent.value}`,
    });

    const isGrandParentRoot = grandParent.parent === null;

    if (parent === grandParent.left) {
      const uncle = grandParent.right as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        steps.push({
          highlightIds: [parent.id, uncle.id, grandParent.id],
          message: `Uncle ${uncle.value} is red: recolor parent, uncle to black and grandparent to red`,
        });
        grandParent.color = 'red';
        parent.color = 'black';
        uncle.color = 'black';
        current = grandParent;
      } else {
        if (current === parent.right) {
          steps.push({
            highlightIds: [current.id, parent.id],
            message: `Left-Right case: left rotate parent ${parent.value}`,
          });
          current = parent;
          const newParent = rotateLeft(current);
          if (grandParent.left === current) {
            grandParent.left = newParent as TreeNode;
          }
          current = newParent.left as RBTreeNode;
        }

        steps.push({
          highlightIds: [grandParent.id],
          message: `Right rotate grandparent ${grandParent.value} and recolor`,
        });
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        const newGrandParent = rotateRight(grandParent);

        if (isGrandParentRoot) {
          actualRoot = newGrandParent;
        } else if (grandParent.parent) {
          if ((grandParent.parent as RBTreeNode).left === grandParent) {
            (grandParent.parent as RBTreeNode).left = newGrandParent as TreeNode;
          } else {
            (grandParent.parent as RBTreeNode).right = newGrandParent as TreeNode;
          }
        }
      }
    } else {
      const uncle = grandParent.left as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        steps.push({
          highlightIds: [parent.id, uncle.id, grandParent.id],
          message: `Uncle ${uncle.value} is red: recolor parent, uncle to black and grandparent to red`,
        });
        grandParent.color = 'red';
        parent.color = 'black';
        uncle.color = 'black';
        current = grandParent;
      } else {
        if (current === parent.left) {
          steps.push({
            highlightIds: [current.id, parent.id],
            message: `Right-Left case: right rotate parent ${parent.value}`,
          });
          current = parent;
          const newParent = rotateRight(current);
          if (grandParent.right === current) {
            grandParent.right = newParent as TreeNode;
          }
          current = newParent.right as RBTreeNode;
        }

        steps.push({
          highlightIds: [grandParent.id],
          message: `Left rotate grandparent ${grandParent.value} and recolor`,
        });
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        const newGrandParent = rotateLeft(grandParent);

        if (isGrandParentRoot) {
          actualRoot = newGrandParent;
        } else if (grandParent.parent) {
          if ((grandParent.parent as RBTreeNode).left === grandParent) {
            (grandParent.parent as RBTreeNode).left = newGrandParent as TreeNode;
          } else {
            (grandParent.parent as RBTreeNode).right = newGrandParent as TreeNode;
          }
        }
      }
    }
  }

  // Find the actual root (node with no parent)
  let trueRoot: RBTreeNode = actualRoot;
  while (trueRoot.parent !== null && trueRoot.parent !== undefined) {
    trueRoot = trueRoot.parent as RBTreeNode;
  }

  trueRoot.color = 'black';
  steps.push({
    highlightIds: [trueRoot.id],
    message: `Ensure root ${trueRoot.value} is black`,
  });

  return trueRoot;
}
