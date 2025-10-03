import { TrieNode, Step } from '../types';

let nodeIdCounter = 5000;

function cloneTrie(node: TrieNode | null): TrieNode | null {
  if (!node) return null;

  const cloned: TrieNode = {
    id: node.id,
    char: node.char,
    children: new Map(),
    isEndOfWord: node.isEndOfWord,
  };

  node.children.forEach((child, char) => {
    const clonedChild = cloneTrie(child);
    if (clonedChild) {
      cloned.children.set(char, clonedChild);
    }
  });

  return cloned;
}

/**
 * Build Trie from words
 */
export function buildTrie(input: string): TrieNode | null {
  const words = parseInput(input);
  if (words.length === 0) return null;

  const root: TrieNode = {
    id: `node-${nodeIdCounter++}`,
    char: '',
    children: new Map(),
    isEndOfWord: false,
  };

  for (const word of words) {
    insertWord(root, word);
  }

  return root;
}

/**
 * Build Trie with animation steps
 */
export function buildTrieWithSteps(input: string): {
  root: TrieNode | null;
  steps: Step[];
} {
  const words = parseInput(input);
  if (words.length === 0) {
    return { root: null, steps: [] };
  }

  const root: TrieNode = {
    id: `node-${nodeIdCounter++}`,
    char: '',
    children: new Map(),
    isEndOfWord: false,
  };

  const steps: Step[] = [];

  steps.push({
    highlightIds: [root.id],
    message: `Starting with words: ${words.join(', ')}`,
    trie: cloneTrie(root),
    remainingWords: [...words],
  });

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const remaining = words.slice(i + 1);

    const insertSteps = insertWordWithSteps(root, word);
    insertSteps.forEach((step) => {
      steps.push({
        ...step,
        trie: cloneTrie(root),
        remainingWords: remaining,
        currentWord: word,
      });
    });
  }

  steps.push({
    highlightIds: [],
    message: `Build complete`,
    trie: cloneTrie(root),
    remainingWords: [],
  });

  return { root, steps };
}

function parseInput(input: string): string[] {
  const cleaned = input.trim().replace(/^\[|\]$/g, '');
  return cleaned
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0 && /^[a-z]+$/.test(w)); // Only lowercase letters
}

function insertWord(root: TrieNode, word: string): void {
  let current = root;

  for (const char of word) {
    if (!current.children.has(char)) {
      const newNode: TrieNode = {
        id: `node-${nodeIdCounter++}`,
        char,
        children: new Map(),
        isEndOfWord: false,
      };
      current.children.set(char, newNode);
    }
    current = current.children.get(char)!;
  }

  current.isEndOfWord = true;
}

function insertWordWithSteps(root: TrieNode, word: string): Step[] {
  const steps: Step[] = [];
  let current = root;
  const path: string[] = [root.id];

  steps.push({
    highlightIds: [root.id],
    message: `Inserting word: "${word}"`,
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];

    if (!current.children.has(char)) {
      const newNode: TrieNode = {
        id: `node-${nodeIdCounter++}`,
        char,
        children: new Map(),
        isEndOfWord: false,
      };
      current.children.set(char, newNode);

      path.push(newNode.id);
      steps.push({
        highlightIds: [...path],
        message: `Created new node for '${char}' (${word.substring(0, i + 1)})`,
      });
      current = newNode;
    } else {
      current = current.children.get(char)!;
      path.push(current.id);
      steps.push({
        highlightIds: [...path],
        message: `Traversed existing node '${char}' (${word.substring(0, i + 1)})`,
      });
    }
  }

  current.isEndOfWord = true;
  steps.push({
    highlightIds: [current.id],
    message: `Marked end of word "${word}"`,
  });

  return steps;
}

export function insertTrieWithSteps(
  root: TrieNode | null,
  input: string
): { root: TrieNode | null; steps: Step[] } {
  const words = parseInput(input);
  if (words.length === 0) {
    return { root, steps: [] };
  }

  if (!root) {
    root = {
      id: `node-${nodeIdCounter++}`,
      char: '',
      children: new Map(),
      isEndOfWord: false,
    };
  }

  const steps: Step[] = [];

  for (const word of words) {
    const insertSteps = insertWordWithSteps(root, word);
    insertSteps.forEach((step) => {
      steps.push({
        ...step,
        trie: cloneTrie(root),
      });
    });
  }

  steps.push({
    highlightIds: [],
    message: `Insertion complete`,
    trie: cloneTrie(root),
  });

  return { root, steps };
}

export function searchTrieWithSteps(
  root: TrieNode | null,
  input: string
): { steps: Step[] } {
  const steps: Step[] = [];

  if (!root) {
    steps.push({
      highlightIds: [],
      message: 'Trie is empty',
    });
    return { steps };
  }

  const word = input.trim().toLowerCase();
  if (!word || !/^[a-z]+$/.test(word)) {
    steps.push({
      highlightIds: [],
      message: 'Invalid word (only lowercase letters allowed)',
    });
    return { steps };
  }

  let current: TrieNode | null = root;
  const path: string[] = [root.id];

  steps.push({
    highlightIds: [root.id],
    message: `Searching for word: "${word}"`,
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];

    if (!current || !current.children.has(char)) {
      steps.push({
        highlightIds: path,
        message: `Character '${char}' not found. "${word}" does not exist in trie`,
      });
      return { steps };
    }

    current = current.children.get(char)!;
    path.push(current.id);

    steps.push({
      highlightIds: [...path],
      message: `Found '${char}' (${word.substring(0, i + 1)})`,
    });
  }

  if (current.isEndOfWord) {
    steps.push({
      highlightIds: [current.id],
      message: `Word "${word}" found!`,
    });
  } else {
    steps.push({
      highlightIds: path,
      message: `"${word}" is a prefix but not a complete word`,
    });
  }

  return { steps };
}

function deleteWord(root: TrieNode, word: string): boolean {
  function deleteHelper(node: TrieNode, word: string, index: number): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) {
        return false; // Word doesn't exist
      }
      node.isEndOfWord = false;
      return node.children.size === 0; // Return true if node can be deleted
    }

    const char = word[index];
    const childNode = node.children.get(char);

    if (!childNode) {
      return false; // Word doesn't exist
    }

    const shouldDeleteChild = deleteHelper(childNode, word, index + 1);

    if (shouldDeleteChild) {
      node.children.delete(char);
      return node.children.size === 0 && !node.isEndOfWord;
    }

    return false;
  }

  return deleteHelper(root, word, 0);
}

export function deleteTrieWithSteps(
  root: TrieNode | null,
  input: string
): { root: TrieNode | null; steps: Step[] } {
  const steps: Step[] = [];

  if (!root) {
    steps.push({
      highlightIds: [],
      message: 'Trie is empty',
    });
    return { root, steps };
  }

  const word = input.trim().toLowerCase();
  if (!word || !/^[a-z]+$/.test(word)) {
    steps.push({
      highlightIds: [],
      message: 'Invalid word (only lowercase letters allowed)',
    });
    return { root, steps };
  }

  // First, search for the word
  let current: TrieNode | null = root;
  const path: string[] = [root.id];

  steps.push({
    highlightIds: [root.id],
    message: `Searching for word to delete: "${word}"`,
    trie: cloneTrie(root),
  });

  for (let i = 0; i < word.length; i++) {
    const char = word[i];

    if (!current || !current.children.has(char)) {
      steps.push({
        highlightIds: path,
        message: `Word "${word}" not found in trie`,
        trie: cloneTrie(root),
      });
      return { root, steps };
    }

    current = current.children.get(char)!;
    path.push(current.id);

    steps.push({
      highlightIds: [...path],
      message: `Traversing '${char}'`,
      trie: cloneTrie(root),
    });
  }

  if (!current.isEndOfWord) {
    steps.push({
      highlightIds: path,
      message: `"${word}" is a prefix but not a complete word`,
      trie: cloneTrie(root),
    });
    return { root, steps };
  }

  steps.push({
    highlightIds: [current.id],
    message: `Found word "${word}", preparing to delete`,
    trie: cloneTrie(root),
  });

  // Delete the word
  deleteWord(root, word);

  steps.push({
    highlightIds: [],
    message: `Deleted word "${word}"`,
    trie: cloneTrie(root),
  });

  return { root, steps };
}
