import { useEffect } from 'react';

const SIZES = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-3xl' };

/**
 * Self-contained dialog (no other files needed).
 * Render it only while it is open:
 *   {open && <Dialog title="..." onClose={close}>...</Dialog>}
 * Escape and a click outside close it, unless `busy` is true.
 */
export default function Dialog({ title, description, onClose, busy = false, size = 'md', children }) {
  useEffect(() => {
    const onKeyDown = (event) => event.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, onClose]);

  return (
    <div
      className="dlg-fade fixed inset-0 z-50 flex items-end justify-center bg-[#0F2438]/50 p-4 backdrop-blur-[2px] sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <style>{`
        @keyframes dlg-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dlg-pop  { from { opacity: 0; transform: translateY(16px) scale(.98); } to { opacity: 1; transform: none; } }
        @keyframes dlg-spin { to { transform: rotate(360deg); } }
        .dlg-fade { animation: dlg-fade .15s ease-out; }
        .dlg-pop  { animation: dlg-pop .22s cubic-bezier(.2,.7,.2,1); }
        .dlg-spin { animation: dlg-spin .7s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .dlg-fade, .dlg-pop, .dlg-spin { animation: none; } }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`dlg-pop flex max-h-[92vh] w-full ${SIZES[size] ?? SIZES.md} flex-col overflow-hidden rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="-mr-2 -mt-1 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}