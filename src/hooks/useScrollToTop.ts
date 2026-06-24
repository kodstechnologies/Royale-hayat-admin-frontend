import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const scrollPageToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.querySelector("main")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
};

export const useScrollToTop = (...deps: unknown[]) => {
  useEffect(() => {
    scrollPageToTop();
  }, deps);
};

/** Scroll main content to top on every route change (sidebar navigation). */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollPageToTop();
  }, [pathname]);

  return null;
};
