import { useEffect, useRef } from 'react';

export function useKeyboardShortcuts(actions) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrl = isMac ? e.metaKey : e.ctrlKey;
      const tag = document.activeElement?.tagName;

      // Don't fire shortcuts when user is typing in an input
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        actionsRef.current.undo();
      }
      if (isCtrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        actionsRef.current.redo();
      }
      if (isCtrl && e.key === 'c') {
        e.preventDefault();
        actionsRef.current.copy();
      }
      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        actionsRef.current.paste();
      }
      if (isCtrl && e.key === 'd') {
        e.preventDefault();
        actionsRef.current.duplicate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
