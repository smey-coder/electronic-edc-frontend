import { useCallback, useEffect, useMemo, useState } from 'react';
import usePermission from '../../hooks/usePermission';
import studentService, { getErrorMessage } from '../../api/studentApi';
import { userService } from '../../api/userApi';
import Dialog from '../../components/common/Dialog';
import StudentFormModal from '../../components/forms/StudentFormModal';
import StudentImportModal from '../../components/forms/StudentImportModal';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const PAGE_SIZES = [10, 25, 50];

const AVATARS = [
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

const initials = (student) =>
  (student.full_name || String(student.student_id) || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const photoOf = (student) => student.photo_url ?? student.avatar_url ?? student.image_url ?? null;

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// null when the API does not send an account status
const getStatus = (student) => {
  if (typeof student.is_active === 'boolean') return student.is_active ? 'Active' : 'Disabled';
  if (typeof student.status === 'string') return student.status.toLowerCase() === 'active' ? 'Active' : 'Disabled';
  return null;
};

const unique = (list, key) =>
  [...new Set(list.map((item) => item[key]).filter(Boolean).map(String))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const SORTS = {
  newest: { label: 'Newest first', compare: (a, b) => (b.id ?? 0) - (a.id ?? 0) },
  name: { label: 'Name A–Z', compare: (a, b) => String(a.full_name).localeCompare(String(b.full_name)) },
  id: { label: 'Student ID', compare: (a, b) => String(a.student_id).localeCompare(String(b.student_id), undefined, { numeric: true }) },
};

const ICONS = {
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4',
  plus: 'M12 5v14M5 12h14',
  upload: 'M12 16V4M7 9l5-5 5 5M4 20h16',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  eye: 'M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  alert: 'M12 8v5M12 16.5v.1M12 3l10 18H2L12 3Z',
  close: 'M6 6l12 12M18 6L6 18',
  download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
};

// Export Data 
const EXPORT_COLUMNS = [
  ['Student ID', (s) => s.student_id],
  ['Full name', (s) => s.full_name],
  ['Gender', (s) => s.gender],
  ['Date of birth', (s) => s.date_of_birth],
  ['Phone', (s) => s.phone],
  ['Department', (s) => s.department],
  ['Major', (s) => s.major],
  ['Academic year', (s) => s.academic_year],
  ['Class', (s) => s.class_name],
  ['Address', (s) => s.address],
  ['Status', (s) => getStatus(s)],
];

const csvCell = (value) => {
  let text = value == null ? '' : String(value);
  // stop spreadsheet apps from running cells that start with = or @ as formulas
  if (/^[=@]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildCsv = (rows) =>
  [EXPORT_COLUMNS.map(([label]) => label), ...rows.map((s) => EXPORT_COLUMNS.map(([, get]) => get(s)))]
    .map((line) => line.map(csvCell).join(','))
    .join('\r\n');

const downloadFile = (content, filename, type) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function Icon({ name, className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Avatar({ student, className = 'h-10 w-10 text-sm' }) {
  const [broken, setBroken] = useState(false);
  const photo = photoOf(student);
  if (photo && !broken) {
    return <img src={photo} alt="" onError={() => setBroken(true)} className={`${className} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full font-semibold ${AVATARS[(student.id ?? 0) % AVATARS.length]}`}>
      {initials(student)}
    </span>
  );
}

/* A graduation cap that floats gently, with a swinging tassel. */
function CapArt() {
  return (
    <svg viewBox="0 0 220 150" className="pointer-events-none absolute -right-2 bottom-0 hidden h-44 w-auto sm:block" aria-hidden="true">
      <g className="stu-float">
        <path d="M110 22L206 62 110 102 14 62Z" fill="#1C3858" stroke="#3A5F8C" strokeWidth="2" strokeLinejoin="round" />
        <path d="M54 84v30c0 10 24 20 56 20s56-10 56-20V84l-56 24-56-24Z" fill="#162F4B" stroke="#3A5F8C" strokeWidth="2" strokeLinejoin="round" />
        <path d="M110 62l80 0" stroke="#3A5F8C" strokeWidth="2" strokeLinecap="round" />
        <g className="stu-tassel">
          <path d="M190 62v44" stroke="#FFB629" strokeWidth="3" strokeLinecap="round" />
          <circle cx="190" cy="110" r="5.5" fill="#FFB629" />
        </g>
      </g>
      <g fill="#FFB629">
        <circle className="stu-twinkle" cx="30" cy="30" r="2.5" />
        <circle className="stu-twinkle stu-twinkle-late" cx="204" cy="28" r="2" />
        <circle className="stu-twinkle" cx="16" cy="108" r="1.8" />
      </g>
    </svg>
  );
}

function EmptyArt() {
  return (
    <svg viewBox="0 0 160 110" className="mx-auto h-28 w-40" aria-hidden="true">
      <rect x="10" y="10" width="140" height="90" rx="14" fill="#F1F5F9" />
      <circle cx="46" cy="42" r="12" fill="#CBD5E1" />
      <path d="M26 74c2-12 12-18 20-18s18 6 20 18" fill="#CBD5E1" />
      <rect x="82" y="32" width="56" height="7" rx="3.5" fill="#CBD5E1" />
      <rect x="82" y="48" width="42" height="7" rx="3.5" fill="#E2E8F0" />
      <rect x="82" y="64" width="50" height="7" rx="3.5" fill="#E2E8F0" />
      <circle className="stu-twinkle" cx="136" cy="22" r="5" fill="#FFB629" />
    </svg>
  );
}

const controlClass =
  'rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10';

const ghostButton =
  'rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60';

/* ------------------------------------------------------------------ */
/* Small dialogs                                                       */
/* ------------------------------------------------------------------ */
function ProfileDialog({ student, canUpdate, canDelete, onEdit, onDelete, onClose }) {
  const status = getStatus(student);
  const rows = [
    ['Gender', student.gender],
    ['Date of birth', formatDate(student.date_of_birth)],
    ['Phone', student.phone],
    ['Department', student.department],
    ['Major', student.major],
    ['Academic year', student.academic_year],
    ['Class', student.class_name],
    ['Address', student.address],
  ];

  return (
    <Dialog title="Student profile" onClose={onClose}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-4 bg-[#0F2438] px-6 py-5 text-white">
          <Avatar student={student} className="h-16 w-16 text-xl ring-4 ring-white/10" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{student.full_name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[#FFB629]">{student.student_id}</span>
              {status && (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status === 'Active' ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/10 text-slate-300'}`}>{status}</span>
              )}
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className={label === 'Address' ? 'sm:col-span-2' : ''}>
              <dt className="text-xs font-medium text-slate-500">{label}</dt>
              <dd className="mt-0.5 break-words text-[15px] text-slate-900">{value || <span className="text-slate-400">Not set</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
        {canDelete ? (
          <button type="button" onClick={onDelete}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
            <Icon name="trash" /> Delete
          </button>
        ) : <span />}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className={ghostButton}>Close</button>
          {canUpdate && (
            <button type="button" onClick={onEdit}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30">
              <Icon name="edit" /> Edit
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

function DeleteDialog({ student, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    setDeleting(true);
    try {
      await onConfirm();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to delete the student.'));
      setDeleting(false);
    }
  };

  return (
    <Dialog title="Delete student" onClose={onClose} busy={deleting}>
      <div className="space-y-5 px-6 py-5">
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0" />
          <p>
            <span className="font-semibold">{student.full_name}</span> (ID {student.student_id}) will be removed from the system. This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={deleting} className={ghostButton}>Cancel</button>
          <button type="button" onClick={handleConfirm} disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600/30 disabled:cursor-not-allowed disabled:opacity-70">
            {deleting && <span className="dlg-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {deleting ? 'Deleting…' : 'Delete student'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function StudentManagementPage() {
  const { can } = usePermission();
  const canCreate = can('student.create');
  const canImport = can('student.import');
  const canExport = can('student.export') || canImport;
  const canUpdate = can('student.update');
  const canDelete = can('student.delete');
  const canChange = canCreate || canImport || canUpdate || canDelete || canExport;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('newest');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'import' | 'profile' | 'delete', student? }
  const [accounts, setAccounts] = useState(null); // user accounts; null = the list cannot be loaded (for example no permission)
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3500);
  }, []);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      setStudents(await studentService.listAll());
    } catch (requestError) {
      setLoadError(getErrorMessage(requestError, 'Unable to load students.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Accounts that can still get a profile (needs the user.read permission; otherwise the form asks for a User ID).
  const loadAccounts = useCallback(async () => {
    try {
      const data = await userService.list({ limit: 500 });
      setAccounts(Array.isArray(data) ? data : null);
    } catch {
      setAccounts(null);
    }
  }, []);

  useEffect(() => {
    if (canCreate) loadAccounts();
  }, [canCreate, loadAccounts]);

  const departments = useMemo(() => unique(students, 'department'), [students]);
  const genders = useMemo(() => unique(students, 'gender'), [students]);
  const years = useMemo(() => unique(students, 'academic_year'), [students]);

  const suggestions = useMemo(
    () => ({ department: departments, major: unique(students, 'major'), academic_year: years, class_name: unique(students, 'class_name') }),
    [students, departments, years],
  );

  // a free ID to offer: the biggest numeric ID + 1
  const nextId = useMemo(() => {
    const numbers = students.map((student) => Number(student.student_id)).filter((value) => Number.isInteger(value) && value >= 0);
    return numbers.length ? Math.max(...numbers) + 1 : 1;
  }, [students]);

  const availableAccounts = useMemo(() => {
    if (accounts === null) return null;
    const used = new Set(students.map((student) => student.user_id).filter((value) => value != null));
    const roleOf = (account) => String(typeof account.role === 'string' ? account.role : account.role?.name ?? '').toLowerCase();
    return accounts.filter((account) => !used.has(account.id) && roleOf(account) !== 'admin' && roleOf(account) !== 'teacher');
  }, [accounts, students]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return students
      .filter((student) => {
        if (department && student.department !== department) return false;
        if (gender && student.gender !== gender) return false;
        if (year && String(student.academic_year) !== year) return false;
        if (!needle) return true;
        return [student.full_name, student.student_id, student.phone, student.class_name, student.department, student.major]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle);
      })
      .sort(SORTS[sort].compare);
  }, [students, query, department, gender, year, sort]);

  useEffect(() => setPage(1), [query, department, gender, year, sort, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(pageStart, pageStart + pageSize);
  const hasFilters = Boolean(query || department || gender || year);
  const showStatus = students.some((student) => getStatus(student));

  const clearFilters = () => {
    setQuery('');
    setDepartment('');
    setGender('');
    setYear('');
  };

  const closeModal = useCallback(() => setModal(null), []);

  /* Dialogs throw on failure so they can show the error themselves. */
  const handleCreate = async (payload) => {
    await studentService.create(payload);
    notify('Student added.');
    await load();
    loadAccounts();
  };

  const handleUpdate = async (payload) => {
    await studentService.update(modal.student.id, payload);
    notify('Student updated.');
    await load();
  };

  const handleImport = async (file, onProgress) => {
    const result = await studentService.importExcel(file, onProgress);
    await load();
    loadAccounts();
    return result;
  };
  const handleExport = () => {
    if (filtered.length === 0) {
        notify('There are no students to export.');
        return;
    }
    const stamp = new Date().toISOString().slice(0, 10);
    // '\uFEFF' (BOM) makes Excel read the file as UTF-8, so Khmer names display correctly
    downloadFile('\uFEFF' + buildCsv(filtered), `students-${stamp}.csv`, 'text/csv;charset=utf-8');
    notify(`Exported ${filtered.length} ${filtered.length === 1 ? 'student' : 'students'}.`);
  };
  const handleDelete = async () => {
    await studentService.remove(modal.student.id);
    closeModal();
    notify('Student deleted.');
    await load();
  };

  return (
    <div className="mx-auto max-w-6xl pb-8 text-slate-800">
      <style>{`
        @keyframes stu-rise   { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes stu-toast  { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
        @keyframes stu-float  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes stu-sway   { 0%,100% { transform: rotate(7deg); } 50% { transform: rotate(-7deg); } }
        @keyframes stu-twinkle { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
        .stu-rise    { opacity: 0; animation: stu-rise .45s cubic-bezier(.2,.7,.2,1) forwards; }
        .stu-toast   { animation: stu-toast .25s cubic-bezier(.2,.7,.2,1); }
        .stu-float   { animation: stu-float 4s ease-in-out infinite; }
        .stu-tassel  { transform-box: fill-box; transform-origin: top center; animation: stu-sway 2.6s ease-in-out infinite; }
        .stu-twinkle { animation: stu-twinkle 2.4s ease-in-out infinite; }
        .stu-twinkle-late { animation-delay: -1.2s; }
        @media (prefers-reduced-motion: reduce) {
          .stu-rise, .stu-toast, .stu-float, .stu-tassel, .stu-twinkle { animation: none; opacity: 1; }
        }
      `}</style>

      {/* ---------- Banner ---------- */}
      <section className="stu-rise relative overflow-hidden rounded-2xl bg-[#0F2438] p-6 text-white shadow-[0_18px_40px_-20px_rgba(15,36,56,.6)] sm:p-8">
        <CapArt />
        <div className="relative max-w-xl">
          <p className="flex items-center gap-2 text-xs font-semibold text-[#FFB629]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FFB629]" /> People
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Student management</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#B9CBE3]">
            Give students their IDs, keep their profiles up to date and import whole classes from Excel.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[#D7E3F3]">
              <span className="font-semibold text-white">{loading ? '…' : students.length}</span> {students.length === 1 ? 'student' : 'students'}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[#D7E3F3]">
              <span className="font-semibold text-white">{departments.length}</span> {departments.length === 1 ? 'department' : 'departments'}
            </span>
            {!loading && !canChange && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#FFB629]/15 px-3 py-1 font-medium text-[#FFD27A]" title="Your account can view students but not change them.">
                <Icon name="lock" className="h-3.5 w-3.5" /> View only
              </span>
            )}
          </div>

          {(canCreate || canImport) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {canCreate && (
                <button type="button" onClick={() => setModal({ type: 'create' })}
                  className="flex items-center gap-2 rounded-xl bg-[#FFB629] px-4 py-2.5 text-sm font-semibold text-[#0F2438] shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFB629]/40 active:scale-[.98]">
                  <Icon name="plus" /> Add student
                </button>
              )}
              {canImport && (
                <button type="button" onClick={() => setModal({ type: 'import' })}
                  className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20">
                  <Icon name="upload" /> Import Excel
                </button>
              )}

              {canExport && (
                <button type="button" onClick={handleExport} disabled={loading || filtered.length === 0}
                    className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50">
                    <Icon name="download" /> Export Excel
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Search and filters ---------- */}
      <div className="stu-rise mt-6 flex flex-wrap gap-3" style={{ animationDelay: '80ms' }}>
        <div className="relative min-w-[240px] flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, ID, phone or class" aria-label="Search students" className={`${controlClass} w-full pl-10`} />
        </div>
        {departments.length > 0 && (
          <select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filter by department" className={controlClass}>
            <option value="">All departments</option>
            {departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        )}
        {years.length > 0 && (
          <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by academic year" className={controlClass}>
            <option value="">All years</option>
            {years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        )}
        {genders.length > 0 && (
          <select value={gender} onChange={(event) => setGender(event.target.value)} aria-label="Filter by gender" className={controlClass}>
            <option value="">All genders</option>
            {genders.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        )}
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort students" className={controlClass}>
          {Object.entries(SORTS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
        </select>
      </div>

      {hasFilters && !loading && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {filtered.length} of {students.length} students match.
          <button type="button" onClick={clearFilters} className="flex items-center gap-1 font-semibold text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
            <Icon name="close" className="h-3 w-3" /> Clear filters
          </button>
        </p>
      )}

      {loadError && (
        <div role="alert" className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span>{loadError}</span>
          <button type="button" onClick={load} className="font-semibold underline-offset-4 hover:underline">Try again</button>
        </div>
      )}

      {/* ---------- Table ---------- */}
      <div className="stu-rise mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ animationDelay: '140ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Department / major</th>
                <th className="px-5 py-3 font-medium">Class / year</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                {showStatus && <th className="px-5 py-3 font-medium">Status</th>}
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-full bg-slate-100" /><div className="space-y-2"><div className="h-3 w-32 rounded bg-slate-100" /><div className="h-3 w-20 rounded bg-slate-100" /></div></div></td>
                    <td className="px-5 py-4"><div className="h-3 w-28 rounded bg-slate-100" /></td>
                    <td className="px-5 py-4"><div className="h-3 w-20 rounded bg-slate-100" /></td>
                    <td className="px-5 py-4"><div className="h-3 w-24 rounded bg-slate-100" /></td>
                    {showStatus && <td className="px-5 py-4"><div className="h-5 w-16 rounded-full bg-slate-100" /></td>}
                    <td className="px-5 py-4"><div className="ml-auto h-8 w-24 rounded bg-slate-100" /></td>
                  </tr>
                ))}

              {!loading &&
                pageRows.map((student, index) => {
                  const status = getStatus(student);
                  return (
                    <tr key={student.id ?? student.student_id} className="stu-rise transition-colors hover:bg-blue-50/30" style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}>
                      <td className="px-5 py-3">
                        <button type="button" onClick={() => setModal({ type: 'profile', student })}
                          className="flex w-full items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                          <Avatar student={student} />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-slate-900">{student.full_name}</span>
                            <span className="block font-mono text-xs text-slate-500">ID {student.student_id}</span>
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-slate-800">{student.department || <span className="text-slate-400">—</span>}</p>
                        {student.major && <p className="text-xs text-slate-500">{student.major}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-slate-800">{student.class_name || <span className="text-slate-400">—</span>}</p>
                        {student.academic_year && <p className="text-xs text-slate-500">Year {student.academic_year}</p>}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{student.phone || <span className="text-slate-400">—</span>}</td>
                      {showStatus && (
                        <td className="px-5 py-3">
                          {status && (
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {status}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setModal({ type: 'profile', student })} aria-label={`View ${student.full_name}`} title="View"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                            <Icon name="eye" />
                          </button>
                          {canUpdate && (
                            <button type="button" onClick={() => setModal({ type: 'edit', student })} aria-label={`Edit ${student.full_name}`} title="Edit"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                              <Icon name="edit" />
                            </button>
                          )}
                          {canDelete && (
                            <button type="button" onClick={() => setModal({ type: 'delete', student })} aria-label={`Delete ${student.full_name}`} title="Delete"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
                              <Icon name="trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!loading && !loadError && pageRows.length === 0 && (
          <div className="px-6 py-14 text-center">
            <EmptyArt />
            <p className="mt-4 font-semibold text-slate-900">{hasFilters ? 'No students match your filters' : 'No students yet'}</p>
            <p className="mt-1 text-sm text-slate-500">
              {hasFilters ? 'Try another search or clear the filters.' : canCreate || canImport ? 'Add the first student, or import a whole class from Excel.' : 'Students will appear here when they are added.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {hasFilters ? (
                <button type="button" onClick={clearFilters} className={ghostButton}>Clear filters</button>
              ) : (
                <>
                  {canCreate && (
                    <button type="button" onClick={() => setModal({ type: 'create' })}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30">
                      <Icon name="plus" /> Add student
                    </button>
                  )}
                  {canImport && (
                    <button type="button" onClick={() => setModal({ type: 'import' })} className={`${ghostButton} flex items-center gap-2`}>
                      <Icon name="upload" /> Import Excel
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <span>Showing {pageStart + 1}–{Math.min(pageStart + pageSize, filtered.length)} of {filtered.length}</span>
              <label className="flex items-center gap-1.5 text-slate-500">
                Rows
                <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} aria-label="Rows per page"
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                  {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <span className="px-1 text-slate-500">Page {currentPage} of {totalPages}</span>
              <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* ---------- Dialogs ---------- */}
      {modal?.type === 'create' && (
        <StudentFormModal accounts={availableAccounts} suggestions={suggestions} nextId={nextId} onSubmit={handleCreate} onClose={closeModal} />
      )}
      {modal?.type === 'edit' && (
        <StudentFormModal student={modal.student} suggestions={suggestions} onSubmit={handleUpdate} onClose={closeModal} />
      )}
      {modal?.type === 'import' && <StudentImportModal onImport={handleImport} onClose={closeModal} />}
      {modal?.type === 'profile' && (
        <ProfileDialog
          student={modal.student}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onEdit={() => setModal({ type: 'edit', student: modal.student })}
          onDelete={() => setModal({ type: 'delete', student: modal.student })}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'delete' && <DeleteDialog student={modal.student} onConfirm={handleDelete} onClose={closeModal} />}

      {/* ---------- Toasts ---------- */}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} role="status" className="stu-toast pointer-events-auto flex items-center gap-2.5 rounded-lg bg-[#0F2438] px-4 py-3 text-sm font-medium text-white shadow-lg">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500"><Icon name="check" className="h-3 w-3" /></span>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}