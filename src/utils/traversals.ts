import { TreeNode, Step } from '../types';

export type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

/**
 * Performs in-order traversal (Left -> Root -> Right)
 */
export function inorderTraversal(root: TreeNode | null): Step[] {
  const steps: Step[] = [];

  function traverse(node: TreeNode | null) {
    if (!node) return;

    traverse(node.left);
    steps.push({
      highlightIds: [node.id],
      message: `Visit node ${node.value} (In-order)`,
    });
    traverse(node.right);
  }

  traverse(root);
  return steps;
}

/**
 * Performs pre-order traversal (Root -> Left -> Right)
 */
export function preorderTraversal(root: TreeNode | null): Step[] {
  const steps: Step[] = [];

  function traverse(node: TreeNode | null) {
    if (!node) return;

    steps.push({
      highlightIds: [node.id],
      message: `Visit node ${node.value} (Pre-order)`,
    });
    traverse(node.left);
    traverse(node.right);
  }

  traverse(root);
  return steps;
}

/**
 * Performs post-order traversal (Left -> Right -> Root)
 */
export function postorderTraversal(root: TreeNode | null): Step[] {
  const steps: Step[] = [];

  function traverse(node: TreeNode | null) {
    if (!node) return;

    traverse(node.left);
    traverse(node.right);
    steps.push({
      highlightIds: [node.id],
      message: `Visit node ${node.value} (Post-order)`,
    });
  }

  traverse(root);
  return steps;
}

/**
 * Performs level-order traversal (Breadth-First Search)
 */
export function levelorderTraversal(root: TreeNode | null): Step[] {
  const steps: Step[] = [];
  if (!root) return steps;

  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;

    steps.push({
      highlightIds: [node.id],
      message: `Visit node ${node.value} (Level-order)`,
    });

    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }

  return steps;
}

/**
 * Main function to execute a traversal by type
 */
export function executeTraversal(
  root: TreeNode | null,
  type: TraversalType
): Step[] {
  switch (type) {
    case 'inorder':
      return inorderTraversal(root);
    case 'preorder':
      return preorderTraversal(root);
    case 'postorder':
      return postorderTraversal(root);
    case 'levelorder':
      return levelorderTraversal(root);
    default:
      return [];
  }
}
