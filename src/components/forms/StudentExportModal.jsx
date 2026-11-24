import { useMemo, useState } from 'react';
import Dialog from '../common/Dialog';
import { MIME, downloadFile, printTable, safeFileName, toCsv, toXlsx, todayStamp } from '../../utils/exportFile';

const get = (key) => (student) => student[key] ?? '';

const BASE_COLUMNS = [
  { key: 'student_id', label: 'Student ID', value: get('student_id'), on: true },
  { key: 'full_name', label: 'Full name', value: get('full_name'), on: true },
  { key: 'gender', label: 'Gender', value: get('gender'), on: true },
  { key: 'date_of_birth', label: 'Date of birth', value: (student) => String(student.date_of_birth ?? '').slice(0, 10), on: true },
  { key: 'department', label: 'Department', value: get('department'), on: true },
  { key: 'major', label: 'Major', value: get('major'), on: true },
  { key: 'academic_year', label: 'Academic year', value: get('academic_year'), on: true },
  { key: 'class_name', label: 'Class', value: get('class_name'), on: true },
  { key: 'phone', label: 'Phone', value: get('phone'), on: true },
  { key: 'address', label: 'Address', value: get('address'), on: true },
  { key: 'user_id', label: 'User ID', value: get('user_id'), on: false },
];

const FORMATS = [
  { id: 'xlsx', title: 'Excel', hint: '.xlsx', path: 'M7 3h7l5 5v13H7zM14 3v5h5M9.5 12.5l5 5M14.5 12.5l-5 5' },
  { id: 'csv', title: 'CSV', hint: '.csv, for any program', path: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h5M10 17h5' },
  { id: 'pdf', title: 'PDF', hint: 'print, then Save as PDF', path: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z' },
];

const radioCard =
  'flex h-full cursor-pointer flex-col gap-0.5 rounded-xl border border-slate-200 bg-white p-3.5 transition ' +
  'hover:border-slate-300 peer-checked:border-blue-600 peer-checked:bg-blue-50/60 peer-checked:shadow-sm ' +
  'peer-focus-visible:ring-4 peer-focus-visible:ring-blue-600/20';

/**
 * students   – every student
 * filtered   – the students that match the current search and filters
 * pageRows   – the students on the current page
 * statusOf   – (student) => 'Active' | 'Disabled' | null, or null when the API has no status
 * onExported – (message) => void, called after the file is created
 */
export default function StudentExportModal({ students, filtered, pageRows, hasFilters, statusOf, initialScope, onExported, onClose }) {
  const columns = useMemo(
    () => (statusOf ? [...BASE_COLUMNS, { key: 'status', label: 'Status', value: (student) => statusOf(student) ?? '', on: true }] : BASE_COLUMNS),
    [statusOf],
  );

  const [scope, setScope] = useState(initialScope ?? (hasFilters ? 'filtered' : 'all'));
  const [format, setFormat] = useState('xlsx');
  const [selected, setSelected] = useState(() => new Set(columns.filter((column) => column.on).map((column) => column.key)));
  const [fileName, setFileName] = useState(`students-${todayStamp()}`);
  const [error, setError] = useState('');

  const scopes = [
    { id: 'all', title: 'All students', count: students.length },
    ...(hasFilters ? [{ id: 'filtered', title: 'Current results', count: filtered.length, hint: 'Matches your search and filters' }] : []),
    { id: 'page', title: 'This page only', count: pageRows.length },
  ];

  const rows = scope === 'all' ? students : scope === 'filtered' ? filtered : pageRows;
  const chosen = columns.filter((column) => selected.has(column.key));
  const canExport = rows.length > 0 && chosen.length > 0;

  const toggle = (key) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const handleExport = () => {
    setError('');
    try {
      const base = safeFileName(fileName, 'students');
      if (format === 'xlsx') downloadFile(toXlsx(rows, chosen, 'Students'), `${base}.xlsx`, MIME.xlsx);
      else if (format === 'csv') downloadFile(toCsv(rows, chosen), `${base}.csv`, MIME.csv);
      else {
        printTable({
          title: 'Student list',
          subtitle: `${rows.length} ${rows.length === 1 ? 'student' : 'students'} · ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`,
          rows,
          columns: chosen,
        });
      }
      onExported(
        format === 'pdf'
          ? 'The print window is open. Choose "Save as PDF" as the printer.'
          : `Exported ${rows.length} ${rows.length === 1 ? 'student' : 'students'} to ${base}.${format}`,
      );
      onClose();
    } catch {
      setError('The file could not be created. Please try again.');
    }
  };

  return (
    <Dialog title="Export students" description="Save the student list as a file." size="lg" onClose={onClose}>
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

        {/* which students */}
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-2.5 text-sm font-bold text-slate-900">Which students</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {scopes.map((item) => (
              <label key={item.id} className="relative block">
                <input type="radio" name="export-scope" value={item.id} checked={scope === item.id} onChange={() => setScope(item.id)} className="peer sr-only" />
                <span className={radioCard}>
                  <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                  <span className="text-xs text-slate-500">{item.count} {item.count === 1 ? 'student' : 'students'}</span>
                  {item.hint && <span className="text-xs text-slate-400">{item.hint}</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* file type */}
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-2.5 text-sm font-bold text-slate-900">File type</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FORMATS.map((item) => (
              <label key={item.id} className="relative block">
                <input type="radio" name="export-format" value={item.id} checked={format === item.id} onChange={() => setFormat(item.id)} className="peer sr-only" />
                <span className={`${radioCard} flex-row items-center gap-3`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${format === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={item.path} /></svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                    <span className="block truncate text-xs text-slate-500">{item.hint}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* columns */}
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-2.5 flex w-full items-center justify-between text-sm font-bold text-slate-900">
            <span>Columns <span className="font-normal text-slate-400">({chosen.length} of {columns.length})</span></span>
            <span className="flex gap-3 text-xs font-semibold">
              <button type="button" onClick={() => setSelected(new Set(columns.map((column) => column.key)))} className="text-blue-600 underline-offset-4 hover:underline">All</button>
              <button type="button" onClick={() => setSelected(new Set())} className="text-slate-500 underline-offset-4 hover:underline">None</button>
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {columns.map((column) => (
              <label key={column.key} className="relative">
                <input type="checkbox" checked={selected.has(column.key)} onChange={() => toggle(column.key)} className="peer sr-only" />
                <span className="flex cursor-pointer select-none items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 peer-checked:border-[#0F2438] peer-checked:bg-[#0F2438] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-blue-600/20">
                  {selected.has(column.key) && (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[#FFB629]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  )}
                  {column.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* file name */}
        {format !== 'pdf' && (
          <div>
            <label htmlFor="export-name" className="text-sm font-bold text-slate-900">File name</label>
            <div className="mt-2 flex items-center gap-2">
              <input id="export-name" value={fileName} onChange={(event) => setFileName(event.target.value)} autoComplete="off" spellCheck={false}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15" />
              <span className="shrink-0 font-mono text-sm text-slate-500">.{format}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
        <p className="text-sm text-slate-500" aria-live="polite">
          {canExport
            ? `${rows.length} ${rows.length === 1 ? 'student' : 'students'} · ${chosen.length} ${chosen.length === 1 ? 'column' : 'columns'}`
            : rows.length === 0 ? 'There are no students to export.' : 'Choose at least one column.'}
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50">
            Cancel
          </button>
          <button type="button" onClick={handleExport} disabled={!canExport}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></svg>
            {format === 'pdf' ? 'Open print window' : 'Export'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}