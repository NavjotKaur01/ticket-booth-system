import { useEffect } from 'react';

export function useIOSInputZoomFix(): void {
  useEffect(() => {
    // 1. Check for iOS right away
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (!isIOS) return;

    // 2. Lock the viewport zoom permanently right on mount, before any user touch action
    const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1';
    }

    // 3. Keep your keyboard Enter dismiss handler intact for non-textarea controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') return;

      const isTextField = target.tagName === 'INPUT' || target.getAttribute('role') === 'combobox';
      if (isTextField && (e.key === 'Enter' || e.keyCode === 13)) {
        e.preventDefault();
        target.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
