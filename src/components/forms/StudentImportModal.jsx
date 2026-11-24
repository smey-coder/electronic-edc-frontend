import { useRef, useState } from 'react';
import Dialog from '../common/Dialog';
import { getErrorMessage } from '../../api/studentApi';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = '.xlsx,.xls';
const REQUIRED_COLUMNS = ['user_id', 'student_id', 'full_name'];
const OPTIONAL_COLUMNS = ['gender', 'department', 'major', 'academic_year', 'class_name', 'phone'];

const formatSize = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

/** The import response is not fixed, so read whatever numbers, errors and message it has. */
function summarize(result) {
  if (result == null || result === '') return { numbers: [], errors: [], message: null };
  if (typeof result === 'string') return { numbers: [], errors: [], message: result };
  const flat = result.data && typeof result.data === 'object' ? { ...result, ...result.data } : result;
  const numbers = Object.entries(flat)
    .filter(([, value]) => typeof value === 'number')
    .map(([key, value]) => ({ label: key.replace(/_/g, ' '), value }));
  const errors = [flat.errors, flat.failed_rows, flat.error_rows, flat.skipped_rows].find(Array.isArray) ?? [];
  const message = typeof flat.message === 'string' ? flat.message : typeof flat.detail === 'string' ? flat.detail : null;
  // "Successfully imported 12 student profiles" → show 12 as a number
  if (numbers.length === 0 && message) {
    const match = /imported\s+(\d+)/i.exec(message);
    if (match) numbers.push({ label: 'imported', value: Number(match[1]) });
  }
  return { numbers, errors: errors.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))), message };
}

/**
 * onImport(file, onProgress) must return the API response (a promise). The page reloads the list inside it.
 */
export default function StudentImportModal({ onImport, onClose }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const choose = (selected) => {
    setError('');
    if (!selected) return;
    if (!/\.(xlsx|xls)$/i.test(selected.name)) {
      setError('Please choose an Excel file (.xlsx or .xls).');
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError('The file is larger than 10 MB.');
      return;
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    setError('');
    setUploading(true);
    setProgress(0);
    try {
      const response = await onImport(file, setProgress);
      setResult(summarize(response));
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'The import failed.'));
    } finally {
      setUploading(false);
    }
  };

  const summary = result;

  return (
    <Dialog
      title="Import students from Excel"
      description="Add many students at once."
      size="lg"
      onClose={onClose}
      busy={uploading}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {summary ? (
          /* ---------- result ---------- */
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              <div>
                <p className="font-semibold text-emerald-900">Import finished</p>
                <p className="text-sm text-emerald-800">{summary.message ?? `${file.name} was uploaded and the student list was refreshed.`}</p>
              </div>
            </div>

            {summary.numbers.length > 0 && (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {summary.numbers.map((item) => (
                  <li key={item.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-2xl font-bold tracking-tight text-slate-900">{item.value}</p>
                    <p className="text-xs capitalize text-slate-500">{item.label}</p>
                  </li>
                ))}
              </ul>
            )}

            {summary.errors.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Some rows were not imported ({summary.errors.length})</p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto font-mono text-xs text-amber-900">
                  {summary.errors.map((line, index) => <li key={index} className="break-words">{line}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* ---------- choose a file ---------- */
          <>
            <div
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files?.[0]); }}
              className={`rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragging ? 'border-blue-500 bg-blue-50' : file ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
              }`}
            >
              <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${file ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500 shadow-sm'}`}>
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={file ? 'M7 3h7l5 5v13H7zM14 3v5h5M10 14h5M10 17h5' : 'M12 16V4M7 9l5-5 5 5M4 20h16'} />
                </svg>
              </span>

              {file ? (
                <>
                  <p className="mt-3 break-all font-semibold text-slate-900">{file.name}</p>
                  <p className="text-sm text-slate-500">{formatSize(file.size)}</p>
                  <button type="button" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ''; }} disabled={uploading}
                    className="mt-3 text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline disabled:opacity-50">
                    Choose another file
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-3 font-semibold text-slate-900">Drop an Excel file here</p>
                  <p className="text-sm text-slate-500">or</p>
                  <button type="button" onClick={() => inputRef.current?.click()}
                    className="mt-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50">
                    Browse files
                  </button>
                  <p className="mt-3 text-xs text-slate-400">.xlsx or .xls, up to 10 MB</p>
                </>
              )}
              <input ref={inputRef} type="file" accept={ACCEPT} className="sr-only" aria-label="Excel file" onChange={(event) => choose(event.target.files?.[0])} />
            </div>

            {uploading && (
              <div aria-live="polite">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-600">
                  <span>{progress < 100 ? 'Uploading…' : 'Importing students…'}</span><span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-500 transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Columns in the first row</p>
              <p className="mt-1 text-xs text-slate-500">
                Every row needs the first three. <span className="font-medium text-slate-700">user_id</span> is the ID of an existing account, and an account can have only one profile.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {REQUIRED_COLUMNS.map((column) => (
                  <code key={column} className="rounded-md bg-[#0F2438] px-2 py-0.5 font-mono text-xs text-[#FFB629]">{column}</code>
                ))}
                {OPTIONAL_COLUMNS.map((column) => (
                  <code key={column} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-[#0F2438]">{column}</code>
                ))}
              </div>
              <p className="mt-2.5 text-xs text-slate-500">Students whose student_id already exists are skipped. Date of birth and address are not imported.</p>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
        {summary ? (
          <button type="button" onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30">
            Done
          </button>
        ) : (
          <>
            <button type="button" onClick={onClose} disabled={uploading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60">
              Cancel
            </button>
            <button type="button" onClick={handleUpload} disabled={!file || uploading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60">
              {uploading && <span className="dlg-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
              {uploading ? 'Importing…' : 'Import students'}
            </button>
          </>
        )}
      </div>
    </Dialog>
  );
}