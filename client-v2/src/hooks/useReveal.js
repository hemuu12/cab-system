import { useEffect } from 'react';

/**
 * Adds the `in` class to `.reveal` elements as they scroll into view, matching
 * the IntersectionObserver in the original design script.
 *
 * `deps` re-runs the scan after async content (vehicles, feedback) renders.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal:not(.in)').forEach(element => observer.observe(element));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
