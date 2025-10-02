import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TreeSelectionPage } from './components/TreeSelectionPage';
import { BinaryTreePage } from './pages/BinaryTreePage';
import { AVLTreePage } from './pages/AVLTreePage';
import { BTreePage } from './pages/BTreePage';
import { BPlusTreePage } from './pages/BPlusTreePage';
import './styles/tokens.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TreeSelectionPage />} />
        <Route path="/binary" element={<BinaryTreePage />} />
        <Route path="/avl" element={<AVLTreePage />} />
        <Route path="/b-tree" element={<BTreePage />} />
        <Route path="/b-plus-tree" element={<BPlusTreePage />} />
        <Route path="/red-black" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Red-Black Tree - Coming Soon</div>} />
        <Route path="/trie" element={<div style={{ padding: '2rem', textAlign: 'center' }}>Trie Tree - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
