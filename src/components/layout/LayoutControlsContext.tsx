import { createContext, useContext } from "react";

export type LayoutControlsContextValue = {
  collapsed: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  closeMobileSidebar: () => void;
};

const LayoutControlsContext = createContext<LayoutControlsContextValue | null>(
  null,
);

export const LayoutControlsProvider = LayoutControlsContext.Provider;

export const useLayoutControls = () => useContext(LayoutControlsContext);
