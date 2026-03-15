"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type OverlayState = {
  search: boolean;
  cart: boolean;
  menu: boolean;
};

type WhatsAppVisibilityContextValue = {
  overlay: OverlayState;
  setSearchOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  shouldHideButton: (isAdmin: boolean) => boolean;
};

const initialState: OverlayState = { search: false, cart: false, menu: false };

export const WhatsAppVisibilityContext =
  createContext<WhatsAppVisibilityContextValue | null>(null);

export function WhatsAppVisibilityProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState>(initialState);

  const setSearchOpen = useCallback((open: boolean) => {
    setOverlay((prev) => ({ ...prev, search: open }));
  }, []);

  const setCartOpen = useCallback((open: boolean) => {
    setOverlay((prev) => ({ ...prev, cart: open }));
  }, []);

  const setMenuOpen = useCallback((open: boolean) => {
    setOverlay((prev) => ({ ...prev, menu: open }));
  }, []);

  const shouldHideButton = useCallback(
    (isAdmin: boolean) => isAdmin || overlay.search || overlay.cart || overlay.menu,
    [overlay.search, overlay.cart, overlay.menu]
  );

  const value = useMemo(
    () => ({
      overlay,
      setSearchOpen,
      setCartOpen,
      setMenuOpen,
      shouldHideButton,
    }),
    [overlay, setSearchOpen, setCartOpen, setMenuOpen, shouldHideButton]
  );

  return (
    <WhatsAppVisibilityContext.Provider value={value}>
      {children}
    </WhatsAppVisibilityContext.Provider>
  );
}

export function useWhatsAppVisibility() {
  const ctx = useContext(WhatsAppVisibilityContext);
  if (!ctx) {
    throw new Error("useWhatsAppVisibility must be used within WhatsAppVisibilityProvider");
  }
  return ctx;
}
