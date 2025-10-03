import { TreeNode, Step } from '../types';
import { RBTreeNode, buildRedBlackTree } from './redBlackTree_v2';

let nodeIdCounter = 4000;

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

function convertToRBTree(node: TreeNode | null, parent: RBTreeNode | null = null): RBTreeNode | null {
  if (!node) return null;

  const rbNode: RBTreeNode = {
    id: node.id,
    value: node.value,
    color: (node as any).color || 'red',
    left: null,
    right: null,
    parent: parent,
  };

  rbNode.left = convertToRBTree(node.left, rbNode) as TreeNode | null;
  rbNode.right = convertToRBTree(node.right, rbNode) as TreeNode | null;

  return rbNode;
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

function fixViolations(root: RBTreeNode, node: RBTreeNode): RBTreeNode {
  let current = node;

  while (current.parent && (current.parent as RBTreeNode).color === 'red') {
    const parent = current.parent as RBTreeNode;
    const grandParent = parent.parent as RBTreeNode;

    if (!grandParent) break;

    if (parent === grandParent.left) {
      const uncle = grandParent.right as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        parent.color = 'black';
        uncle.color = 'black';
        grandParent.color = 'red';
        current = grandParent;
      } else {
        if (current === parent.right) {
          current = parent;
          root = rotateLeft(root, current);
        }
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        root = rotateRight(root, grandParent);
      }
    } else {
      const uncle = grandParent.left as RBTreeNode | null;

      if (uncle && uncle.color === 'red') {
        parent.color = 'black';
        uncle.color = 'black';
        grandParent.color = 'red';
        current = grandParent;
      } else {
        if (current === parent.left) {
          current = parent;
          root = rotateRight(root, current);
        }
        (current.parent as RBTreeNode).color = 'black';
        grandParent.color = 'red';
        root = rotateLeft(root, grandParent);
      }
    }
  }

  root.color = 'black';
  return root;
}

function fixViolationsWithSteps(root: RBTreeNode, node: RBTreeNode, steps: Step[]): RBTreeNode {
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

export function insertRBWithSteps(
  root: TreeNode | null,
  input: string
): { root: TreeNode | null; steps: Step[] } {
  const steps: Step[] = [];

  // Convert TreeNode to RBTreeNode
  let rbRoot = convertToRBTree(root);

  // Parse input values
  const cleanInput = input.trim().replace(/^\[|\]$/g, '');
  const values = cleanInput
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '')
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v));

  const uniqueValues = Array.from(new Set(values));

  if (uniqueValues.length === 0) {
    return { root, steps };
  }

  for (const value of uniqueValues) {
    // Find position
    let current: RBTreeNode | null = rbRoot;
    let parent: RBTreeNode | null = null;
    const path: string[] = [];

    if (!rbRoot) {
      // Empty tree
      const newNode: RBTreeNode = {
        id: `node-${nodeIdCounter++}`,
        value,
        color: 'black',
        left: null,
        right: null,
        parent: null,
      };
      rbRoot = newNode;
      steps.push({
        highlightIds: [newNode.id],
        message: `Insert ${value} as root (black)`,
      });
      continue;
    }

    while (current !== null) {
      path.push(current.id);
      parent = current;
      if (value === current.value) {
        steps.push({
          highlightIds: path,
          message: `Value ${value} already exists, skipping`,
        });
        break;
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

    if (value === parent!.value) {
      continue; // Skip duplicate
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
    rbRoot = fixViolationsWithSteps(rbRoot, newNode, steps);
  }

  // Add final step to show completed tree
  steps.push({
    highlightIds: [],
    message: `Insertion complete`,
  });

  return { root: cloneForVisualization(rbRoot), steps };
}

export function searchRBWithSteps(
  root: TreeNode | null,
  input: string
): { steps: Step[] } {
  const steps: Step[] = [];

  if (!root) {
    steps.push({
      highlightIds: [],
      message: 'Tree is empty',
    });
    return { steps };
  }

  const value = parseFloat(input.trim());
  if (isNaN(value)) {
    steps.push({
      highlightIds: [],
      message: 'Invalid search value',
    });
    return { steps };
  }

  let current = root;
  const path: string[] = [];

  while (current) {
    path.push(current.id);
    steps.push({
      highlightIds: [...path],
      message: `Comparing ${value} with ${current.value}`,
    });

    if (value === current.value) {
      steps.push({
        highlightIds: [current.id],
        message: `Found ${value}!`,
      });
      return { steps };
    } else if (value < current.value) {
      current = current.left;
    } else {
      current = current.right;
    }
  }

  steps.push({
    highlightIds: path,
    message: `Value ${value} not found`,
  });

  return { steps };
}

function getMinValueNode(node: RBTreeNode): RBTreeNode {
  let current = node;
  while (current.left !== null) {
    current = current.left as RBTreeNode;
  }
  return current;
}

function fixDoubleBlack(root: RBTreeNode | null, node: RBTreeNode | null, parent: RBTreeNode | null, steps: Step[]): RBTreeNode {
  if (!root) return root as RBTreeNode;
  if (node === root) {
    return root;
  }

  if (!parent) {
    return root;
  }

  const sibling = (node === parent.left)
    ? (parent.right as RBTreeNode | null)
    : (parent.left as RBTreeNode | null);

  if (!sibling) {
    // No sibling, push double black up
    steps.push({
      highlightIds: parent.id ? [parent.id] : [],
      message: `No sibling, push double black up to parent ${parent.value}`,
      tree: cloneForVisualization(root),
    });
    return fixDoubleBlack(root, parent, parent.parent as RBTreeNode | null, steps);
  }

  if (sibling.color === 'red') {
    // Case 1: Sibling is red
    steps.push({
      highlightIds: [parent.id, sibling.id],
      message: `Sibling ${sibling.value} is red: rotate and recolor`,
      tree: cloneForVisualization(root),
    });
    parent.color = 'red';
    sibling.color = 'black';

    if (sibling === parent.left) {
      root = rotateRight(root, parent);
    } else {
      root = rotateLeft(root, parent);
    }

    steps.push({
      highlightIds: [sibling.id],
      message: `Rotation complete`,
      tree: cloneForVisualization(root),
    });

    return fixDoubleBlack(root, node, parent, steps);
  }

  // Sibling is black
  const leftNephew = sibling.left as RBTreeNode | null;
  const rightNephew = sibling.right as RBTreeNode | null;
  const hasRedChild = (leftNephew?.color === 'red') || (rightNephew?.color === 'red');

  if (hasRedChild) {
    // Case 2: At least one red nephew
    if (sibling === parent.left) {
      if (leftNephew?.color === 'red') {
        // Left-left case
        steps.push({
          highlightIds: [parent.id, sibling.id, leftNephew.id],
          message: `Left-left case: rotate right at ${parent.value}`,
          tree: cloneForVisualization(root),
        });
        leftNephew.color = sibling.color;
        sibling.color = parent.color;
        parent.color = 'black';
        root = rotateRight(root, parent);
        steps.push({
          highlightIds: [sibling.id],
          message: `Rotation and recolor complete`,
          tree: cloneForVisualization(root),
        });
      } else {
        // Left-right case
        steps.push({
          highlightIds: [parent.id, sibling.id, rightNephew!.id],
          message: `Left-right case: rotate left at ${sibling.value}, then right at ${parent.value}`,
          tree: cloneForVisualization(root),
        });
        rightNephew!.color = parent.color;
        parent.color = 'black';
        root = rotateLeft(root, sibling);
        root = rotateRight(root, parent);
        steps.push({
          highlightIds: [rightNephew!.id],
          message: `Double rotation complete`,
          tree: cloneForVisualization(root),
        });
      }
    } else {
      if (rightNephew?.color === 'red') {
        // Right-right case
        steps.push({
          highlightIds: [parent.id, sibling.id, rightNephew.id],
          message: `Right-right case: rotate left at ${parent.value}`,
          tree: cloneForVisualization(root),
        });
        rightNephew.color = sibling.color;
        sibling.color = parent.color;
        parent.color = 'black';
        root = rotateLeft(root, parent);
        steps.push({
          highlightIds: [sibling.id],
          message: `Rotation and recolor complete`,
          tree: cloneForVisualization(root),
        });
      } else {
        // Right-left case
        steps.push({
          highlightIds: [parent.id, sibling.id, leftNephew!.id],
          message: `Right-left case: rotate right at ${sibling.value}, then left at ${parent.value}`,
          tree: cloneForVisualization(root),
        });
        leftNephew!.color = parent.color;
        parent.color = 'black';
        root = rotateRight(root, sibling);
        root = rotateLeft(root, parent);
        steps.push({
          highlightIds: [leftNephew!.id],
          message: `Double rotation complete`,
          tree: cloneForVisualization(root),
        });
      }
    }
  } else {
    // Case 3: Both nephews are black
    steps.push({
      highlightIds: [parent.id, sibling.id],
      message: `Both nephews black: recolor sibling ${sibling.value} to red`,
      tree: cloneForVisualization(root),
    });
    sibling.color = 'red';

    steps.push({
      highlightIds: [sibling.id],
      message: `Recolored sibling to red`,
      tree: cloneForVisualization(root),
    });

    if (parent.color === 'black') {
      return fixDoubleBlack(root, parent, parent.parent as RBTreeNode | null, steps);
    } else {
      parent.color = 'black';
      steps.push({
        highlightIds: [parent.id],
        message: `Recolored parent ${parent.value} to black`,
        tree: cloneForVisualization(root),
      });
    }
  }

  return root;
}

export function deleteRBWithSteps(
  root: TreeNode | null,
  input: string
): { root: TreeNode | null; steps: Step[] } {
  const steps: Step[] = [];

  if (!root) {
    steps.push({
      highlightIds: [],
      message: 'Tree is empty',
    });
    return { root, steps };
  }

  const value = parseFloat(input.trim());
  if (isNaN(value)) {
    steps.push({
      highlightIds: [],
      message: 'Invalid delete value',
    });
    return { root, steps };
  }

  // Convert to RBTreeNode
  let rbRoot = convertToRBTree(root);

  // Find node to delete
  let current: RBTreeNode | null = rbRoot;
  const path: string[] = [];

  while (current) {
    path.push(current.id);
    steps.push({
      highlightIds: [...path],
      message: `Searching for ${value}, comparing with ${current.value}`,
    });

    if (value === current.value) {
      break;
    } else if (value < current.value) {
      current = current.left as RBTreeNode;
    } else {
      current = current.right as RBTreeNode;
    }
  }

  if (!current) {
    steps.push({
      highlightIds: path,
      message: `Value ${value} not found`,
    });
    return { root, steps };
  }

  steps.push({
    highlightIds: [current.id],
    message: `Found ${value}, preparing to delete`,
  });

  let nodeToDelete = current;
  let replacement: RBTreeNode | null = null;
  let nodeColor = nodeToDelete.color;

  // Case 1: Node has at most one child
  if (!nodeToDelete.left) {
    replacement = nodeToDelete.right as RBTreeNode | null;
    steps.push({
      highlightIds: [nodeToDelete.id],
      message: `Node ${nodeToDelete.value} has no left child, replace with right child`,
      tree: cloneForVisualization(rbRoot),
    });

    if (!nodeToDelete.parent) {
      rbRoot = replacement as RBTreeNode;
      if (rbRoot) rbRoot.parent = null;
    } else if (nodeToDelete === nodeToDelete.parent.left) {
      (nodeToDelete.parent as RBTreeNode).left = replacement as TreeNode;
    } else {
      (nodeToDelete.parent as RBTreeNode).right = replacement as TreeNode;
    }

    if (replacement) {
      replacement.parent = nodeToDelete.parent;
    }

    steps.push({
      highlightIds: replacement ? [replacement.id] : [],
      message: `Removed ${value}, ${replacement ? `replaced with ${replacement.value}` : 'no replacement'}`,
      tree: cloneForVisualization(rbRoot),
    });
  } else if (!nodeToDelete.right) {
    replacement = nodeToDelete.left as RBTreeNode | null;
    steps.push({
      highlightIds: [nodeToDelete.id],
      message: `Node ${nodeToDelete.value} has no right child, replace with left child`,
      tree: cloneForVisualization(rbRoot),
    });

    if (!nodeToDelete.parent) {
      rbRoot = replacement as RBTreeNode;
      if (rbRoot) rbRoot.parent = null;
    } else if (nodeToDelete === nodeToDelete.parent.left) {
      (nodeToDelete.parent as RBTreeNode).left = replacement as TreeNode;
    } else {
      (nodeToDelete.parent as RBTreeNode).right = replacement as TreeNode;
    }

    if (replacement) {
      replacement.parent = nodeToDelete.parent;
    }

    steps.push({
      highlightIds: replacement ? [replacement.id] : [],
      message: `Removed ${value}, ${replacement ? `replaced with ${replacement.value}` : 'no replacement'}`,
      tree: cloneForVisualization(rbRoot),
    });
  } else {
    // Case 2: Node has two children - find successor
    const successor = getMinValueNode(nodeToDelete.right as RBTreeNode);
    steps.push({
      highlightIds: [nodeToDelete.id, successor.id],
      message: `Node ${nodeToDelete.value} has two children, replace with successor ${successor.value}`,
      tree: cloneForVisualization(rbRoot),
    });

    nodeColor = successor.color;
    replacement = successor.right as RBTreeNode | null;

    // Copy successor value to nodeToDelete
    nodeToDelete.value = successor.value;

    steps.push({
      highlightIds: [nodeToDelete.id],
      message: `Copied successor value ${successor.value} to node`,
      tree: cloneForVisualization(rbRoot),
    });

    // Remove successor
    if (successor.parent === nodeToDelete) {
      (nodeToDelete as RBTreeNode).right = replacement as TreeNode;
      if (replacement) {
        replacement.parent = nodeToDelete;
      }
    } else {
      (successor.parent as RBTreeNode).left = replacement as TreeNode;
      if (replacement) {
        replacement.parent = successor.parent;
      }
    }

    steps.push({
      highlightIds: [nodeToDelete.id],
      message: `Removed successor node`,
      tree: cloneForVisualization(rbRoot),
    });
  }

  // Fix violations if deleted node was black
  if (nodeColor === 'black') {
    if (replacement && replacement.color === 'red') {
      steps.push({
        highlightIds: [replacement.id],
        message: `Replacement ${replacement.value} is red: recolor to black`,
        tree: cloneForVisualization(rbRoot),
      });
      replacement.color = 'black';
      steps.push({
        highlightIds: [replacement.id],
        message: `Recolored ${replacement.value} to black`,
        tree: cloneForVisualization(rbRoot),
      });
    } else {
      steps.push({
        highlightIds: [],
        message: `Deleted black node: fixing double black`,
        tree: cloneForVisualization(rbRoot),
      });
      rbRoot = fixDoubleBlack(rbRoot, replacement, replacement?.parent as RBTreeNode | null, steps);
    }
  }

  if (rbRoot) {
    rbRoot.color = 'black';
    steps.push({
      highlightIds: [rbRoot.id],
      message: `Ensure root ${rbRoot.value} is black`,
      tree: cloneForVisualization(rbRoot),
    });
  }

  steps.push({
    highlightIds: [],
    message: `Deletion complete`,
    tree: cloneForVisualization(rbRoot),
  });

  return { root: cloneForVisualization(rbRoot), steps };
}
