import { TreeNode } from '../types';

interface TreeCanvasProps {
  root: TreeNode | null;
  highlightIds: string[];
}

interface NodePosition {
  x: number;
  y: number;
  node: TreeNode;
}

export function TreeCanvas({ root, highlightIds }: TreeCanvasProps) {
  const positions: NodePosition[] = [];
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

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
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.3"
        />
      ))}

      {/* Draw nodes */}
      {positions.map(({ x, y, node }) => {
        const isHighlighted = highlightIds.includes(node.id);

        return (
          <g key={node.id}>
            {/* Circle background */}
            <circle
              cx={x}
              cy={y}
              r="24"
              fill={isHighlighted ? 'var(--accent-9)' : 'var(--gray-3)'}
              stroke={isHighlighted ? 'var(--accent-11)' : 'var(--gray-6)'}
              strokeWidth="2"
              style={{
                transition: 'all 0.3s ease',
              }}
            />

            {/* Node value text */}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHighlighted ? 'white' : 'currentColor'}
              fontSize="14"
              fontWeight="500"
              style={{
                transition: 'fill 0.3s ease',
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
