import { useEffect } from "react";

export const scrollPageToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.querySelector("main")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
};

export const useScrollToTop = (...deps: unknown[]) => {
  useEffect(() => {
    scrollPageToTop();
  }, deps);
};
