import { useEffect, useRef } from 'react';

const PLAN_CREDITS = {
  pro: 100,
  studio: 500,
  enterprise: 2000,
};

export default function UpgradeSuccessModal({ plan, credits, onClose }) {
  const overlayRef = useRef(null);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1)
    : 'Pro';

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8 max-w-md w-full mx-4 text-center shadow-none">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg leading-none"
        >
          &#x2715;
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5 text-green-600 dark:text-green-400 text-3xl">
          &#10003;
        </div>

        {/* Heading */}
        <p className="text-xs font-medium tracking-widest text-green-700 dark:text-green-400 uppercase mb-1">
          Plan upgraded
        </p>
        <h2 className="text-2xl font-medium text-neutral-900 dark:text-white mb-2">
          Welcome to {planLabel}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6">
          Your account has been upgraded. You now have access to all {planLabel} features
          and your credits have been refreshed.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Credits available</p>
            <p className="text-2xl font-medium text-neutral-900 dark:text-white">{credits}</p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Plan</p>
            <p className="text-2xl font-medium text-neutral-900 dark:text-white">{planLabel}</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Start generating
        </button>

      </div>
    </div>
  );
}
