import { useEffect } from 'react';

/**
 * Simple accessible modal. Render it only while it is open:
 *   {open && <Modal title="..." onClose={...}>...</Modal>}
 */
export default function UserModal({ title, description, onClose, busy = false, children }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, busy]);

  return (
    <div
      className="edc-modal-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#0F2438]/50 p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <style>{`
        @keyframes edc-modal-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes edc-modal-pop  { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes edc-spin { to { transform: rotate(360deg); } }
        .edc-modal-backdrop { animation: edc-modal-fade .15s ease-out; }
        .edc-modal-panel { animation: edc-modal-pop .22s cubic-bezier(.2,.7,.2,1); }
        .edc-spin { animation: edc-spin .7s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .edc-modal-backdrop, .edc-modal-panel, .edc-spin { animation: none; }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="edc-modal-panel max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="-mr-2 -mt-2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
