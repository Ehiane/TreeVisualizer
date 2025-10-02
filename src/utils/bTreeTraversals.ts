import { BTreeNode, Step } from '../types';

export type BTreeTraversalType = 'inorder' | 'levelorder';

/**
 * Performs in-order traversal on B-Tree (visits keys in sorted order)
 * For each node: visit child[0], key[0], child[1], key[1], ..., child[n]
 */
export function inorderBTreeTraversal(root: BTreeNode | null): Step[] {
  const steps: Step[] = [];
  const visitedKeys: number[] = [];

  function traverse(node: BTreeNode | null) {
    if (!node) return;

    // For each key in the node, visit left child, then key, then continue
    for (let i = 0; i < node.keys.length; i++) {
      // Visit child to the left of this key (if not a leaf)
      if (!node.isLeaf && i < node.children.length) {
        traverse(node.children[i]);
      }

      // Visit the key
      visitedKeys.push(node.keys[i]);
      steps.push({
        highlightIds: [node.id],
        message: `Visit key ${node.keys[i]} (In-order sequence: [${visitedKeys.join(', ')}])`,
      });
    }

    // Visit the rightmost child (if not a leaf)
    if (!node.isLeaf && node.children.length > node.keys.length) {
      traverse(node.children[node.children.length - 1]);
    }
  }

  traverse(root);
  return steps;
}

/**
 * Performs level-order traversal on B-Tree (Breadth-First Search)
 */
export function levelorderBTreeTraversal(root: BTreeNode | null): Step[] {
  const steps: Step[] = [];
  if (!root) return steps;

  const queue: { node: BTreeNode; level: number }[] = [{ node: root, level: 0 }];
  let currentLevel = 0;

  while (queue.length > 0) {
    const { node, level } = queue.shift()!;

    // Add level indicator when moving to new level
    if (level > currentLevel) {
      currentLevel = level;
      steps.push({
        highlightIds: [],
        message: `--- Level ${level} ---`,
      });
    }

    // Visit all keys in this node
    steps.push({
      highlightIds: [node.id],
      message: `Visit node [${node.keys.join(', ')}] at level ${level}`,
    });

    // Add all children to queue
    if (!node.isLeaf) {
      for (const child of node.children) {
        queue.push({ node: child, level: level + 1 });
      }
    }
  }

  return steps;
}

/**
 * Main function to execute a B-Tree traversal by type
 */
export function executeBTreeTraversal(
  root: BTreeNode | null,
  type: BTreeTraversalType
): Step[] {
  switch (type) {
    case 'inorder':
      return inorderBTreeTraversal(root);
    case 'levelorder':
      return levelorderBTreeTraversal(root);
    default:
      return [];
  }
}
