import { useEffect } from "react";

/** Scroll admin content to top when opening a detail view (main + window). */
export const scrollPageToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.querySelector("main")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
};

export const useScrollToTop = (...deps: unknown[]) => {
  useEffect(() => {
    scrollPageToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
