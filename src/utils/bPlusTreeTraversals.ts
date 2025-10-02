import { BPlusTreeNode, Step } from '../types';

export type BPlusTreeTraversalType = 'inorder' | 'levelorder' | 'leaforder';

/**
 * Performs in-order traversal on B+ Tree (visits keys in sorted order)
 * For each node: visit child[0], key[0], child[1], key[1], ..., child[n]
 */
export function inorderBPlusTreeTraversal(root: BPlusTreeNode | null): Step[] {
  const steps: Step[] = [];
  const visitedKeys: number[] = [];

  function traverse(node: BPlusTreeNode | null) {
    if (!node) return;

    // For each key in the node, visit left child, then key, then continue
    for (let i = 0; i < node.keys.length; i++) {
      // Visit child to the left of this key (if not a leaf)
      if (!node.isLeaf && i < node.children.length) {
        traverse(node.children[i]);
      }

      // Visit the key - highlight individual key
      visitedKeys.push(node.keys[i]);
      const keyType = node.isLeaf ? 'leaf key' : 'index key';
      steps.push({
        highlightIds: [],
        highlightKeys: [{ nodeId: node.id, keyIndex: i }],
        message: `Visit ${keyType} ${node.keys[i]} (sequence: [${visitedKeys.join(', ')}])`,
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
 * Performs level-order traversal on B+ Tree (Breadth-First Search)
 */
export function levelorderBPlusTreeTraversal(root: BPlusTreeNode | null): Step[] {
  const steps: Step[] = [];
  if (!root) return steps;

  const queue: { node: BPlusTreeNode; level: number }[] = [{ node: root, level: 0 }];
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
    const nodeType = node.isLeaf ? 'leaf' : 'internal';
    steps.push({
      highlightIds: [node.id],
      message: `Visit ${nodeType} node [${node.keys.join(', ')}] at level ${level}`,
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
 * Performs leaf-order traversal (sequential scan of leaf nodes)
 * This is unique to B+ Trees due to the linked list of leaf nodes
 */
export function leaforderBPlusTreeTraversal(root: BPlusTreeNode | null): Step[] {
  const steps: Step[] = [];
  if (!root) return steps;

  // Collect all leaf nodes by traversing the tree
  const leafNodes: BPlusTreeNode[] = [];

  function collectLeaves(node: BPlusTreeNode | null) {
    if (!node) return;

    if (node.isLeaf) {
      leafNodes.push(node);
    } else {
      for (const child of node.children) {
        collectLeaves(child);
      }
    }
  }

  collectLeaves(root);

  if (leafNodes.length === 0) return steps;

  steps.push({
    highlightIds: [],
    message: `Starting leaf-order traversal from leftmost leaf`,
  });

  // Traverse through all leaf nodes left to right
  const allLeafKeys: number[] = [];

  for (let i = 0; i < leafNodes.length; i++) {
    const currentLeaf = leafNodes[i];

    steps.push({
      highlightIds: [currentLeaf.id],
      message: `Visit leaf node [${currentLeaf.keys.join(', ')}]`,
    });

    // Visit each key in the leaf individually
    for (let keyIdx = 0; keyIdx < currentLeaf.keys.length; keyIdx++) {
      allLeafKeys.push(currentLeaf.keys[keyIdx]);
      steps.push({
        highlightIds: [],
        highlightKeys: [{ nodeId: currentLeaf.id, keyIndex: keyIdx }],
        message: `Visit key ${currentLeaf.keys[keyIdx]} (sequence: [${allLeafKeys.join(', ')}])`,
      });
    }

    if (i < leafNodes.length - 1) {
      steps.push({
        highlightIds: [],
        message: `Following next pointer to next leaf →`,
      });
    }
  }

  steps.push({
    highlightIds: [],
    message: `Leaf-order traversal complete. All keys: [${allLeafKeys.join(', ')}]`,
  });

  return steps;
}

/**
 * Main function to execute a B+ Tree traversal by type
 */
export function executeBPlusTreeTraversal(
  root: BPlusTreeNode | null,
  type: BPlusTreeTraversalType
): Step[] {
  switch (type) {
    case 'inorder':
      return inorderBPlusTreeTraversal(root);
    case 'levelorder':
      return levelorderBPlusTreeTraversal(root);
    case 'leaforder':
      return leaforderBPlusTreeTraversal(root);
    default:
      return [];
  }
}
