# Tree Inspect

An interactive web application for visualizing multiple tree data structures, their operations, and traversal algorithms. Built with React, TypeScript, and modern web technologies to provide an intuitive learning experience for understanding tree data structures.

![Tree Visualizer](https://img.shields.io/badge/status-active-success.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF.svg)

## 🎯 Highlights

- 🌳 **6 Tree Types**: BST, AVL, B-Tree, B+ Tree, Red-Black, and Trie
- ⚡ **Full CRUD Operations**: Build, Insert, Delete, and Search with animations
- 🎨 **Interactive Visualization**: Pan, zoom, and explore tree structures
- 🎬 **Step-by-Step Playback**: Control animation speed and navigate through steps
- 🌓 **Dark/Light Theme**: Comfortable viewing in any environment
- ⌨️ **Keyboard Shortcuts**: Command palette and slash menu for power users

## 📋 Table of Contents

- [Features](#features)
- [Tree Types Explained](#tree-types-explained)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Examples](#examples)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## Features

### Supported Tree Types
- **Binary Search Tree (BST)** - Basic binary tree with sorted properties
- **AVL Tree** - Self-balancing binary search tree with height balancing
- **B-Tree** - Multi-way search tree optimized for disk access
- **B+ Tree** - Variant of B-tree with all values in leaf nodes and linked leaves
- **Red-Black Tree** - Self-balancing binary search tree with color properties
- **Trie (Prefix Tree)** - Tree for efficient string storage and prefix operations

### Tree Operations
- **Build**: Construct trees from array input (or words for Trie) with step-by-step animation
- **Insert**: Add new values/words with animated rebalancing (for AVL and Red-Black trees)
- **Delete**: Remove values/words with animated tree restructuring
- **Search**: Visualize the search process through the tree
- **Skip Animation**: Toggle to perform operations instantly

### Traversal Algorithms
Animate and visualize the following traversal methods:
- **In-order Traversal** (Left → Root → Right) - Available for binary trees
- **Pre-order Traversal** (Root → Left → Right) - Available for binary trees
- **Post-order Traversal** (Left → Right → Root) - Available for binary trees
- **Level-order Traversal** (Breadth-First Search) - Available for all trees
- **Leaf-order Traversal** - Sequential traversal of leaf nodes (B+ Trees only)

### Interactive Canvas
- **Pan & Zoom**: Navigate large trees with mouse drag and zoom controls
- **Auto-Layout**: Automatic positioning of nodes for optimal visualization
- **Real-time Updates**: Watch tree structure change as you modify it
- **Highlight System**: Color-coded highlighting for different operations
  - Green for insertions
  - Red for deletions
  - Blue for searches
- **Operation Indicators**: Visual display of current value being processed and remaining values

### User Interface
- **Command Palette** (`Ctrl/Cmd + K`): Quick access to all actions
- **Slash Menu** (`/`): Context-aware command shortcuts
- **Step-by-Step Animation**: Control playback speed and navigate through traversal steps
- **Step Log Panel**: Track each step of the traversal with detailed information
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Collapsible Sidebars**: Maximize workspace by hiding panels

## Tree Types Explained

### Binary Search Tree (BST)
Basic binary tree where left children are smaller and right children are larger than their parent. Good for learning fundamental tree concepts.

### AVL Tree
Self-balancing BST that maintains height balance through rotations. Guarantees O(log n) operations by keeping the height difference between subtrees ≤ 1.

### B-Tree
Multi-way search tree optimized for systems that read/write large blocks of data. Each node can have multiple keys and children. Configurable minimum degree (t) determines node capacity.

### B+ Tree
Variant of B-Tree where all values are stored in leaf nodes, and internal nodes only store keys for navigation. Leaf nodes are linked for efficient range queries.

### Red-Black Tree
Self-balancing BST where nodes are colored red or black. Maintains balance through color-flipping and rotations, ensuring O(log n) operations with less strict balancing than AVL trees.

### Trie (Prefix Tree)
Tree structure for storing strings where each path from root to leaf represents a word. Efficient for prefix-based operations like autocomplete.

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules with CSS Variables
- **State Management**: Zustand
- **Icons**: Lucide React
- **Routing**: React Router

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/TreeVisualizer.git
cd TreeVisualizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage

### Getting Started
1. **Select a Tree Type**: Choose from the home page (BST, AVL, B-Tree, B+ Tree, Red-Black, or Trie)
2. **Build a Tree**:
   - For numeric trees: Enter values in array format `[10, 5, 15, 3, 7]` or comma-separated `10, 5, 15, 3, 7`
   - For Trie: Enter words comma-separated `cat, dog, car, cart`
   - For B-Trees/B+ Trees: Set minimum degree (t) before building
3. **Perform Operations**:
   - Insert: Add new values/words to the existing tree
   - Delete: Remove values/words from the tree
   - Search: Find values/words in the tree
4. **Run Traversals**: Choose a traversal algorithm and watch the animation
5. **Control Playback**: Use play/pause/reset controls and adjust playback speed
6. **View Details**: Check the step log panel for detailed operation information

### Advanced Features
- **Skip Animation**: Use the checkbox to perform operations instantly
- **Pan & Zoom**: Drag to pan, use zoom controls to navigate large trees
- **Info Modal**: Click the info button (i) to learn about each tree type
- **Dark/Light Theme**: Toggle theme from command palette

### Keyboard Shortcuts
- `Ctrl/Cmd + K` - Open command palette
- `/` - Open slash menu
- Additional shortcuts available in command palette

## Examples

### Binary Search Tree
```
Build: [50, 30, 70, 20, 40, 60, 80]
Insert: 25, 35
Delete: 30
Search: 60
```

### AVL Tree
```
Build: [10, 20, 30, 40, 50]  (Watch automatic rotations!)
Insert: 25
Delete: 10
```

### B-Tree (t=3)
```
Minimum Degree: 3
Build: [1, 3, 7, 10, 11, 13, 14, 15, 18, 16, 19, 24, 25, 26, 21, 4, 5, 20, 22, 2, 17, 12, 6]
Insert: 8, 9
Delete: 6
```

### B+ Tree (t=3)
```
Minimum Degree: 3
Build: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]
Leaf-order Traversal: See sequential leaf access
```

### Red-Black Tree
```
Build: [7, 3, 18, 10, 22, 8, 11, 26]  (Watch color changes and rotations!)
Insert: 15
Delete: 18
```

### Trie
```
Build: cat, dog, car, cart, door, dogs
Insert: card, dodge
Search: cat, car, ca  (ca is a prefix but not a complete word)
Delete: dog
```

## Roadmap

### ✅ Completed (MVP)
- ✅ Binary Search Trees with full operations
- ✅ AVL Trees with rotation animations
- ✅ B-Trees with configurable minimum degree
- ✅ B+ Trees with leaf-order traversal
- ✅ Red-Black Trees with color properties and rebalancing
- ✅ Trie Trees for prefix/word operations
- ✅ Insert/Delete/Search operations with animations
- ✅ Multiple traversal algorithms
- ✅ Pan & Zoom canvas controls
- ✅ Step-by-step playback controls
- ✅ Dark/Light theme support

### 🚀 Future Enhancements
- Export tree structures as images or JSON
- Share trees via URL
- Comparison mode (view two trees side-by-side)
- Performance metrics (time/space complexity display)
- More tree types (Splay Trees, Segment Trees, Fenwick Trees)
- Code generation (show implementation code for operations)
- Custom color schemes
- Animation speed presets
- Undo/Redo functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

Built with modern web technologies:
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide React](https://lucide.dev/) - Icons
- [React Router](https://reactrouter.com/) - Routing

## 📧 Contact

For questions, suggestions, or feedback, please open an issue on GitHub.
