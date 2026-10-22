import { useState, useEffect, useCallback } from 'react';

// Lightweight, zero-dependency browser pathname router
export interface RouterState {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  isAdminRoute: boolean;
}

// Global event name for programmatic navigation inside SPA
const NAVIGATE_EVENT = 'applet_navigate';

export function getCleanPath(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname || '/';
  // Normalize trailing slash (except root '/')
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function navigateTo(to: string, options?: { replace?: boolean }): void {
  if (typeof window === 'undefined') return;

  const target = to.startsWith('/') ? to : `/${to}`;
  if (options?.replace) {
    window.history.replaceState({}, '', target);
  } else {
    window.history.pushState({}, '', target);
  }

  // Dispatch custom event to notify all listeners
  window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: { path: target } }));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function useRouter(): RouterState {
  const [path, setPath] = useState<string>(getCleanPath());

  useEffect(() => {
    const handlePopState = () => {
      setPath(getCleanPath());
    };

    const handleCustomNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ path: string }>;
      if (customEvent.detail?.path) {
        setPath(customEvent.detail.path);
      } else {
        setPath(getCleanPath());
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener(NAVIGATE_EVENT, handleCustomNavigate);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener(NAVIGATE_EVENT, handleCustomNavigate);
    };
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    navigateTo(to, options);
  }, []);

  const isAdminRoute = path === '/admin' || path.startsWith('/admin/');

  return {
    path,
    navigate,
    isAdminRoute,
  };
}
