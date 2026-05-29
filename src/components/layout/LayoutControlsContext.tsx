import { createContext, useContext } from "react";

type LayoutControlsContextValue = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const LayoutControlsContext = createContext<LayoutControlsContextValue | null>(null);

export const LayoutControlsProvider = LayoutControlsContext.Provider;

export const useLayoutControls = () => useContext(LayoutControlsContext);
