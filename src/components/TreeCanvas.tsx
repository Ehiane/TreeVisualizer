import { TreeNode } from '../types';

interface TreeCanvasProps {
  root: TreeNode | null;
  highlightIds: string[];
  activeAction?: string | null;
}

interface NodePosition {
  x: number;
  y: number;
  node: TreeNode;
}

export function TreeCanvas({ root, highlightIds, activeAction }: TreeCanvasProps) {
  const positions: NodePosition[] = [];
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  // Track all node IDs we've seen before to determine if a node is "new"
  const allNodeIds = new Set<string>();

  function collectNodeIds(node: TreeNode | null) {
    if (!node) return;
    allNodeIds.add(node.id);
    collectNodeIds(node.left);
    collectNodeIds(node.right);
  }

  if (root) {
    collectNodeIds(root);
  }

  if (!root) {
    return { viewBox: '0 0 800 400', content: (
      <text
        x="400"
        y="200"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        opacity="0.3"
        fontSize="14"
      >
        Build a tree to visualize it
      </text>
    )};
  }

  // Calculate positions for all nodes using a simple layout algorithm
  function calculatePositions(
    node: TreeNode | null,
    x: number,
    y: number,
    horizontalSpacing: number,
    depth: number
  ) {
    if (!node) return;

    const verticalSpacing = 80;
    positions.push({ x, y, node });

    const childY = y + verticalSpacing;
    const childSpacing = horizontalSpacing / 2;

    if (node.left) {
      const leftX = x - horizontalSpacing;
      edges.push({ x1: x, y1: y, x2: leftX, y2: childY });
      calculatePositions(node.left, leftX, childY, childSpacing, depth + 1);
    }

    if (node.right) {
      const rightX = x + horizontalSpacing;
      edges.push({ x1: x, y1: y, x2: rightX, y2: childY });
      calculatePositions(node.right, rightX, childY, childSpacing, depth + 1);
    }
  }

  // Start layout from the center top
  const rootX = 400;
  const rootY = 50;
  const initialSpacing = 150;

  calculatePositions(root, rootX, rootY, initialSpacing, 0);

  // Calculate viewBox based on positions with padding
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs) - 50;
  const maxX = Math.max(...xs) + 50;
  const minY = Math.min(...ys) - 50;
  const maxY = Math.max(...ys) + 50;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  const content = (
    <g>
      {/* Draw edges first (so they appear behind nodes) */}
      {edges.map((edge, i) => (
        <line
          key={`edge-${i}`}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke="var(--border)"
          strokeWidth="2"
          opacity="0.8"
        />
      ))}

      {/* Draw nodes */}
      {positions.map(({ x, y, node }) => {
        const isHighlighted = highlightIds.includes(node.id);

        // Check if this is a Red-Black tree node
        const rbNode = node as any;
        const isRedBlackNode = rbNode.color !== undefined;
        const nodeColor = isRedBlackNode ? rbNode.color : null;

        // Determine border color based on action
        let borderColor = 'var(--border)';
        if (isHighlighted && activeAction) {
          if (activeAction === 'insert') borderColor = 'var(--green-9)';
          else if (activeAction === 'delete') borderColor = 'var(--red-9)';
          else if (activeAction === 'search') borderColor = 'var(--blue-9)';
          else borderColor = 'var(--accent-9)'; // default blue for other actions
        }

        // Determine fill color - Red-Black tree uses node colors when not highlighted
        let fillColor = isHighlighted ? 'var(--accent-9)' : 'var(--bg)';
        if (!isHighlighted && isRedBlackNode) {
          fillColor = nodeColor === 'red' ? '#dc2626' : '#171717'; // red-600 or neutral-900
        }

        // Text color for Red-Black nodes
        let textColor = isHighlighted ? 'white' : 'var(--gray-12)';
        if (!isHighlighted && isRedBlackNode) {
          textColor = 'white'; // Always white text on red or black nodes
        }

        return (
          <g key={node.id}>
            {/* Circle background */}
            <circle
              cx={x}
              cy={y}
              r="24"
              fill={fillColor}
              stroke={isHighlighted ? borderColor : 'var(--border)'}
              strokeWidth={isHighlighted ? 3 : 2}
              style={{
                transition: 'all 0.3s ease',
                animation: 'nodeAppear 0.4s ease-out',
              }}
            />

            {/* Node value text */}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={textColor}
              fontSize="14"
              fontWeight={isHighlighted ? '600' : '500'}
              style={{
                transition: 'fill 0.3s ease',
                animation: 'nodeAppear 0.4s ease-out',
              }}
            >
              {node.value}
            </text>
          </g>
        );
      })}
    </g>
  );

  return { viewBox, content };
}
