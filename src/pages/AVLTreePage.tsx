import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CommandPalette } from '../components/CommandPalette';
import { PageShell } from '../components/PageShell';
import { Sidebar } from '../components/Sidebar';
import { SlashMenu } from '../components/SlashMenu';
import { StepLog } from '../components/StepLog';
import { Topbar } from '../components/Topbar';
import { TreeCanvasFrame } from '../components/TreeCanvasFrame';
import { useTreeStore } from '../state/useTreeStore';
import styles from '../styles/app.module.css';

export function AVLTreePage() {
  const navigate = useNavigate();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSlashMenuOpen, setIsSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState<{ x: number; y: number }>();
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);

  // Refs to trigger actions from Sidebar
  const sidebarRef = useRef<{
    buildTree: () => void;
    clearTree: () => void;
    runTraversal: (type: 'inorder' | 'preorder' | 'postorder' | 'levelorder') => void;
  } | null>(null);

  const { clear, play, reset, setTreeType } = useTreeStore();

  const goBack = () => {
    navigate('/');
  };

  // Set tree type when component mounts
  useEffect(() => {
    setTreeType('avl');
  }, [setTreeType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }

      // Slash key for Slash Menu (only in the center pane)
      if (e.key === '/' && !isCommandPaletteOpen) {
        const target = e.target as HTMLElement;
        // Only trigger if not in an input field
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          // Position near cursor or center of viewport
          setSlashMenuPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          });
          setIsSlashMenuOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  const toggleLeftDrawer = () => {
    setIsLeftDrawerOpen((prev) => !prev);
    if (isRightDrawerOpen) setIsRightDrawerOpen(false);
  };

  const toggleRightDrawer = () => {
    setIsRightDrawerOpen((prev) => !prev);
    if (isLeftDrawerOpen) setIsLeftDrawerOpen(false);
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('btv-theme', newTheme);
  };

  // Define commands for the command palette
  const commands = [
    {
      id: 'back',
      label: 'Back to Home',
      description: 'Return to tree selection page',
      action: goBack,
    },
    {
      id: 'in-order',
      label: 'In-order Traversal',
      description: 'Execute in-order tree traversal (Left → Root → Right)',
      action: () => sidebarRef.current?.runTraversal('inorder'),
    },
    {
      id: 'pre-order',
      label: 'Pre-order Traversal',
      description: 'Execute pre-order tree traversal (Root → Left → Right)',
      action: () => sidebarRef.current?.runTraversal('preorder'),
    },
    {
      id: 'post-order',
      label: 'Post-order Traversal',
      description: 'Execute post-order tree traversal (Left → Right → Root)',
      action: () => sidebarRef.current?.runTraversal('postorder'),
    },
    {
      id: 'level-order',
      label: 'Level-order Traversal',
      description: 'Execute level-order tree traversal (Breadth-first)',
      action: () => sidebarRef.current?.runTraversal('levelorder'),
    },
    {
      id: 'clear',
      label: 'Clear Tree',
      description: 'Clear the current tree and reset all animations',
      action: () => clear(),
    },
    {
      id: 'play',
      label: 'Play Animation',
      description: 'Start playing the current animation',
      action: () => play(),
    },
    {
      id: 'reset',
      label: 'Reset Animation',
      description: 'Reset animation to the beginning',
      action: () => reset(),
    },
    {
      id: 'toggle-theme',
      label: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      action: toggleTheme,
    },
    {
      id: 'toggle-sidebar',
      label: 'Toggle Sidebar',
      description: 'Show or hide the left sidebar',
      action: toggleLeftDrawer,
    },
    {
      id: 'toggle-step-log',
      label: 'Toggle Step Log',
      description: 'Show or hide the step log panel',
      action: toggleRightDrawer,
    },
  ];

  return (
    <>
      <Topbar
        onSearchClick={() => setIsCommandPaletteOpen(true)}
        onLeftMenuClick={toggleLeftDrawer}
        onRightMenuClick={toggleRightDrawer}
        isLeftDrawerOpen={isLeftDrawerOpen}
        isRightDrawerOpen={isRightDrawerOpen}
      />

      <PageShell
        left={<Sidebar ref={sidebarRef} />}
        center={<TreeCanvasFrame />}
        right={<StepLog />}
        isLeftDrawerOpen={isLeftDrawerOpen}
        isRightDrawerOpen={isRightDrawerOpen}
        onCloseLeftDrawer={() => setIsLeftDrawerOpen(false)}
        onCloseRightDrawer={() => setIsRightDrawerOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      <SlashMenu
        isOpen={isSlashMenuOpen}
        onClose={() => setIsSlashMenuOpen(false)}
        position={slashMenuPosition}
      />
    </>
  );
}
