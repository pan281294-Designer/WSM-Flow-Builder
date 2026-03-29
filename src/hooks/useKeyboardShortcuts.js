import { useEffect, useRef } from 'react';

export function useKeyboardShortcuts(actions) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isMod = isMac ? e.metaKey : e.ctrlKey;
      const tag = document.activeElement?.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (document.activeElement?.contentEditable === 'true');

      if (isMod && e.key.toLowerCase() === 's') { e.preventDefault(); actionsRef.current.saveProject?.(); }
      if (isMod && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); actionsRef.current.undo?.(); }
      if (isMod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); actionsRef.current.redo?.(); }

      // Only fire these when NOT in an editable field
      if (!isEditable) {
        if (isMod && e.key.toLowerCase() === 'c') { e.preventDefault(); actionsRef.current.copy?.(); }
        if (isMod && e.key.toLowerCase() === 'v') { e.preventDefault(); actionsRef.current.paste?.(); }
        if (isMod && e.key.toLowerCase() === 'd') { e.preventDefault(); actionsRef.current.duplicate?.(); }
        if (e.key === 'Delete' || e.key === 'Backspace') { 
          e.preventDefault();
          actionsRef.current.deleteSelected?.(); 
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
