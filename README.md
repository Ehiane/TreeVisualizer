# Binary Tree Visualizer

An interactive web application for visualizing binary tree data structures and their traversal algorithms. Built with React, TypeScript, and modern web technologies to provide an intuitive learning experience for understanding tree operations.

![Binary Tree Visualizer](https://img.shields.io/badge/status-active-success.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)

## Features

### Tree Visualization
- **Interactive Canvas**: Visual representation of binary trees with automatic layout
- **Real-time Updates**: Watch your tree structure change as you modify it
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Traversal Algorithms
Animate and visualize the following tree traversal methods:
- **In-order Traversal** (Left → Root → Right)
- **Pre-order Traversal** (Root → Left → Right)
- **Post-order Traversal** (Left → Right → Root)
- **Level-order Traversal** (Breadth-First Search)

### User Interface
- **Command Palette** (`Ctrl/Cmd + K`): Quick access to all actions
- **Slash Menu** (`/`): Context-aware command shortcuts
- **Step-by-Step Animation**: Control playback speed and navigate through traversal steps
- **Step Log Panel**: Track each step of the traversal with detailed information
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Collapsible Sidebars**: Maximize workspace by hiding panels

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + CSS Modules
- **State Management**: Zustand
- **Icons**: Lucide React
- **Backend**: Supabase (optional integration)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BinaryTreeVisualizer.git
cd BinaryTreeVisualizer
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

1. **Build a Tree**: Use the sidebar to input tree values (comma-separated or array format)
2. **Select Traversal**: Choose a traversal algorithm from the command palette or sidebar
3. **Play Animation**: Watch the traversal execute step-by-step with node highlighting
4. **Control Playback**: Use play/pause/reset controls to manage animation
5. **View Steps**: Check the step log panel for detailed traversal information

### Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open command palette
- `/` - Open slash menu
- Theme and navigation shortcuts available in command palette

## Roadmap

### Coming Soon
Support for advanced tree data structures:
- **AVL Trees** (Self-balancing binary search trees)
- **B-Trees** (Multi-way search trees)
- **B+ Trees** (Optimized variant of B-trees)
- **Red-Black Trees** (Self-balancing with color properties)
- **Trie Trees** (Prefix trees for string operations)

Additional features planned:
- Tree insertion/deletion animations
- Search operations visualization
- Tree balancing demonstrations
- Export tree structures
- Share trees via URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


