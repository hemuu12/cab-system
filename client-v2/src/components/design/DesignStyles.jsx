/**
 * Mounts a design stylesheet for as long as the page is on screen.
 *
 * The handed-over designs style bare element selectors (`nav`, `footer`, `*`),
 * so their CSS cannot live in the global bundle without leaking into the rest
 * of the app. Mounting and unmounting it with the page reproduces the exact
 * cascade of the original static file.
 */
export default function DesignStyles({ css, page }) {
  return <style data-wondertravel-design={page}>{css}</style>;
}
