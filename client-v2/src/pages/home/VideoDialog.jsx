import { useEffect, useRef } from 'react';

/**
 * Intro video in a native <dialog>, matching the design. The video is reset on
 * close so reopening always starts from the beginning.
 */
export default function VideoDialog({ open, onClose, onPlanJourney }) {
  const dialogRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      const video = videoRef.current;
      if (video) {
        video.muted = false;
        video.volume = 1;
        video.play().catch(() => {});
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const stopVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return <dialog
    className="modal video-dialog"
    ref={dialogRef}
    onClose={() => { stopVideo(); onClose(); }}
    onClick={event => { if (event.target === dialogRef.current) onClose(); }}
  >
    <div className="modal-in">
      <button className="modal-close" type="button" aria-label="Close video" onClick={onClose}>×</button>
      <span className="eyebrow">The WonderTravel experience</span>
      <h2>India, beautifully driven.</h2>
      <video className="video-frame" ref={videoRef} controls playsInline preload="metadata" poster="/videos/wondertravel-intro-v2-poster.jpg">
        <source src="/videos/wondertravel-intro-v3.mp4" type="video/mp4" />
        Your browser does not support embedded video.
      </video>
      <div className="video-actions">
        <p>Professional drivers · Clear fares · Pan-India travel</p>
        <button className="btn btn-ember" type="button" onClick={() => { onClose(); onPlanJourney(); }}>Plan my journey</button>
      </div>
    </div>
  </dialog>;
}
