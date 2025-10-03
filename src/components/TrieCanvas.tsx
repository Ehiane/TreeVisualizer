import { TrieNode } from '../types';

interface TrieCanvasProps {
  root: TrieNode | null;
  highlightIds: string[];
  activeAction?: string | null;
}

interface NodePosition {
  x: number;
  y: number;
  node: TrieNode;
}

const NODE_RADIUS = 24;
const LEVEL_GAP = 100;
const MIN_SIBLING_GAP = 60;

export function TrieCanvas({ root, highlightIds, activeAction }: TrieCanvasProps) {
  if (!root) {
    return {
      viewBox: '0 0 800 400',
      content: (
        <text
          x="400"
          y="200"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          opacity="0.3"
          fontSize="14"
        >
          Build a trie to visualize it
        </text>
      ),
    };
  }

  const positions: NodePosition[] = [];
  const edges: Array<{ x1: number; y1: number; x2: number; y2: number; char: string }> = [];

  // Calculate subtree width
  function getSubtreeWidth(node: TrieNode): number {
    if (node.children.size === 0) {
      return MIN_SIBLING_GAP;
    }

    let childrenWidth = 0;
    node.children.forEach((child) => {
      childrenWidth += getSubtreeWidth(child);
    });

    return Math.max(MIN_SIBLING_GAP, childrenWidth);
  }

  // Position nodes recursively
  function positionNodes(node: TrieNode, x: number, y: number): number {
    const subtreeWidth = getSubtreeWidth(node);

    positions.push({
      x: x + subtreeWidth / 2,
      y,
      node,
    });

    if (node.children.size > 0) {
      let currentX = x;
      const childY = y + LEVEL_GAP;

      const childEntries = Array.from(node.children.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      childEntries.forEach(([char, child]) => {
        const childSubtreeWidth = getSubtreeWidth(child);
        const childCenterX = currentX + childSubtreeWidth / 2;

        edges.push({
          x1: x + subtreeWidth / 2,
          y1: y,
          x2: childCenterX,
          y2: childY,
          char,
        });

        positionNodes(child, currentX, childY);
        currentX += childSubtreeWidth;
      });
    }

    return subtreeWidth;
  }

  const totalWidth = positionNodes(root, 50, 50);

  // Calculate total height
  function getHeight(node: TrieNode): number {
    if (node.children.size === 0) return 1;
    let maxChildHeight = 0;
    node.children.forEach((child) => {
      maxChildHeight = Math.max(maxChildHeight, getHeight(child));
    });
    return 1 + maxChildHeight;
  }

  const treeHeight = getHeight(root);
  const totalHeight = treeHeight * LEVEL_GAP + 100;

  // Calculate viewBox
  const xs = positions.map((p) => p.x);
  const ys = positions.map((p) => p.y);
  const minX = Math.min(...xs) - 50;
  const maxX = Math.max(...xs) + 50;
  const minY = Math.min(...ys) - 50;
  const maxY = Math.max(...ys) + 50;

  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;

  const content = (
    <g>
      {/* Draw edges with character labels */}
      {edges.map((edge, i) => {
        const midX = (edge.x1 + edge.x2) / 2;
        const midY = (edge.y1 + edge.y2) / 2;

        return (
          <g key={`edge-${i}`}>
            <line
              x1={edge.x1}
              y1={edge.y1 + NODE_RADIUS}
              x2={edge.x2}
              y2={edge.y2 - NODE_RADIUS}
              stroke="var(--border)"
              strokeWidth="2"
              opacity="0.8"
            />
            {/* Character label on edge */}
            <text
              x={midX}
              y={midY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--accent-11)"
              fontSize="12"
              fontWeight="600"
              style={{
                backgroundColor: 'var(--bg)',
                padding: '2px 4px',
              }}
            >
              {edge.char}
            </text>
          </g>
        );
      })}

      {/* Draw nodes */}
      {positions.map(({ x, y, node }) => {
        const isHighlighted = highlightIds.includes(node.id);
        const isRoot = node.char === '';
        const isEndOfWord = node.isEndOfWord;

        // Determine colors
        let borderColor = 'var(--border)';
        let fillColor = 'var(--bg)';

        if (isHighlighted && activeAction) {
          if (activeAction === 'insert') borderColor = 'var(--green-9)';
          else if (activeAction === 'delete') borderColor = 'var(--red-9)';
          else if (activeAction === 'search') borderColor = 'var(--blue-9)';
          else borderColor = 'var(--accent-9)';
          fillColor = 'var(--accent-9)';
        } else if (isEndOfWord) {
          // End of word nodes have a different color
          fillColor = 'var(--green-3)';
          borderColor = 'var(--green-9)';
        }

        return (
          <g key={node.id}>
            {/* Circle */}
            <circle
              cx={x}
              cy={y}
              r={NODE_RADIUS}
              fill={fillColor}
              stroke={borderColor}
              strokeWidth={isHighlighted ? 3 : isEndOfWord ? 2 : 2}
              style={{
                transition: 'all 0.3s ease',
              }}
            />

            {/* Character text (or "ROOT" for root node) */}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHighlighted ? 'white' : 'var(--gray-12)'}
              fontSize={isRoot ? '10' : '16'}
              fontWeight={isHighlighted ? '600' : '500'}
            >
              {isRoot ? 'ROOT' : node.char}
            </text>

            {/* Double circle for end-of-word nodes */}
            {isEndOfWord && !isHighlighted && (
              <circle
                cx={x}
                cy={y}
                r={NODE_RADIUS - 4}
                fill="none"
                stroke={borderColor}
                strokeWidth="1.5"
              />
            )}
          </g>
        );
      })}
    </g>
  );

  return { viewBox, content };
}
