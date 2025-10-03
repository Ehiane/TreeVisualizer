import { BTreeNode } from '../types';

interface BTreeCanvasProps {
  root: BTreeNode | null;
  highlightIds: string[];
  highlightKeys?: { nodeId: string; keyIndex: number }[];
  activeAction?: string | null;
}

interface NodePosition {
  node: BTreeNode;
  x: number;
  y: number;
  width: number;
}

const NODE_HEIGHT = 60;
const KEY_WIDTH = 50;
const KEY_PADDING = 8;
const LEVEL_GAP = 120;
const MIN_SIBLING_GAP = 30;

export function BTreeCanvas({ root, highlightIds, highlightKeys = [], activeAction }: BTreeCanvasProps): {
  content: JSX.Element;
  viewBox: string;
} {
  if (!root) {
    return {
      content: (
        <text x="50%" y="50%" textAnchor="middle" fill="var(--fg-muted)" fontSize="16">
          No tree to display
        </text>
      ),
      viewBox: '0 0 800 400',
    };
  }

  // Type guard - ensure we have a B-Tree node
  if (!('keys' in root) || !('children' in root) || !('isLeaf' in root)) {
    return {
      content: (
        <text x="50%" y="50%" textAnchor="middle" fill="var(--red-9)" fontSize="16">
          Error: Invalid B-Tree structure
        </text>
      ),
      viewBox: '0 0 800 400',
    };
  }

  // Calculate positions for all nodes
  const positions: NodePosition[] = [];
  const nodeWidth = (node: BTreeNode) => node.keys.length * KEY_WIDTH + (node.keys.length - 1) * KEY_PADDING;

  // Calculate subtree width
  function getSubtreeWidth(node: BTreeNode): number {
    if (node.isLeaf) {
      return nodeWidth(node);
    }

    let childrenWidth = 0;
    for (const child of node.children) {
      childrenWidth += getSubtreeWidth(child);
    }
    childrenWidth += (node.children.length - 1) * MIN_SIBLING_GAP;

    return Math.max(nodeWidth(node), childrenWidth);
  }

  // Position nodes recursively
  function positionNodes(node: BTreeNode, x: number, y: number): number {
    const width = nodeWidth(node);
    const subtreeWidth = getSubtreeWidth(node);
    const nodeX = x + (subtreeWidth - width) / 2;

    positions.push({
      node,
      x: nodeX,
      y,
      width,
    });

    if (!node.isLeaf && node.children.length > 0) {
      let currentX = x;
      const childY = y + LEVEL_GAP;

      for (const child of node.children) {
        const childSubtreeWidth = getSubtreeWidth(child);
        positionNodes(child, currentX, childY);
        currentX += childSubtreeWidth + MIN_SIBLING_GAP;
      }
    }

    return subtreeWidth;
  }

  const totalWidth = positionNodes(root, 50, 50);

  // Calculate total height
  function getHeight(node: BTreeNode): number {
    if (node.isLeaf) return 1;
    return 1 + Math.max(...node.children.map(getHeight));
  }

  const treeHeight = getHeight(root);
  const totalHeight = treeHeight * LEVEL_GAP + 100;

  // Draw edges
  const edges: JSX.Element[] = [];
  positions.forEach((pos) => {
    if (!pos.node.isLeaf && pos.node.children.length > 0) {
      const parentCenterY = pos.y + NODE_HEIGHT;

      pos.node.children.forEach((child, childIndex) => {
        const childPos = positions.find((p) => p.node.id === child.id);
        if (childPos) {
          // Calculate connection point based on child position
          const parentX = pos.x + pos.width / 2;
          const childCenterX = childPos.x + childPos.width / 2;

          edges.push(
            <line
              key={`edge-${pos.node.id}-${child.id}`}
              x1={parentX}
              y1={parentCenterY}
              x2={childCenterX}
              y2={childPos.y}
              stroke="var(--border)"
              strokeWidth="2"
            />
          );
        }
      });
    }
  });

  // Draw nodes
  const nodes: JSX.Element[] = [];
  positions.forEach((pos) => {
    const isHighlighted = highlightIds.includes(pos.node.id);

    // Node container
    const nodeGroup: JSX.Element[] = [];

    // Draw each key as a separate box
    pos.node.keys.forEach((key, index) => {
      const keyX = pos.x + index * (KEY_WIDTH + KEY_PADDING);

      // Check if this specific key should be highlighted
      const isKeyHighlighted = highlightKeys.some(
        hk => hk.nodeId === pos.node.id && hk.keyIndex === index
      );

      // Determine border color based on action
      let borderColor = 'var(--border)';
      if (isKeyHighlighted && activeAction) {
        if (activeAction === 'insert') borderColor = 'var(--green-9)';
        else if (activeAction === 'delete') borderColor = 'var(--red-9)';
        else if (activeAction === 'search') borderColor = 'var(--blue-9)';
        else borderColor = 'var(--accent-9)'; // default blue for other actions
      } else if (isHighlighted && activeAction === 'build') {
        // For build action, highlight entire node
        borderColor = 'var(--accent-9)';
      }

      // Only highlight specific keys, not entire nodes (unless it's build action)
      const shouldHighlight = isKeyHighlighted || (isHighlighted && activeAction === 'build');

      nodeGroup.push(
        <rect
          key={`key-${pos.node.id}-${index}`}
          x={keyX}
          y={pos.y}
          width={KEY_WIDTH}
          height={NODE_HEIGHT}
          fill={shouldHighlight ? 'var(--accent-9)' : 'var(--bg)'}
          stroke={shouldHighlight ? borderColor : 'var(--border)'}
          strokeWidth={shouldHighlight ? 3 : 2}
          rx="6"
        />
      );

      nodeGroup.push(
        <text
          key={`text-${pos.node.id}-${index}`}
          x={keyX + KEY_WIDTH / 2}
          y={pos.y + NODE_HEIGHT / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={shouldHighlight ? 'white' : 'var(--gray-12)'}
          fontSize="16"
          fontWeight={shouldHighlight ? '600' : '400'}
        >
          {key}
        </text>
      );
    });

    nodes.push(
      <g key={`node-${pos.node.id}`} className="btree-node">
        {nodeGroup}
      </g>
    );
  });

  return {
    content: (
      <g>
        {edges}
        {nodes}
      </g>
    ),
    viewBox: `0 0 ${totalWidth + 100} ${totalHeight}`,
  };
}
