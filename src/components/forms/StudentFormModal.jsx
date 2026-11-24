import { useState } from 'react';
import Dialog from '../common/Dialog';
import { getErrorMessage } from '../../api/studentApi';

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 outline-none transition ' +
  'placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15 disabled:bg-slate-50 disabled:text-slate-500';

const GENDERS = ['Male', 'Female', 'Other'];

const FIELD_KEYS = [
  'student_id', 'full_name', 'gender', 'date_of_birth', 'phone', 'address',
  'department', 'major', 'academic_year', 'class_name',
];

function Field({ id, label, optional, help, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-slate-400">Optional</span>}
      </label>
      {children}
      {help && <p className="mt-1.5 text-xs text-slate-500">{help}</p>}
    </div>
  );
}

/**
 * student      – when editing
 * suggestions  – { department: [], major: [], academic_year: [], class_name: [] } for autocomplete
 * nextId       – a free student ID to offer ("Use next ID")
 * onSubmit     – async (payload); throw to show an error here. The dialog closes after it succeeds.
 */
export default function StudentFormModal({ student, accounts = null, suggestions = {}, nextId, onSubmit, onClose }) {
  const isEdit = Boolean(student);

  const [form, setForm] = useState(() =>
    Object.fromEntries(FIELD_KEYS.map((key) => [key, String(student?.[key] ?? '').slice(0, key === 'date_of_birth' ? 10 : 255)])),
  );
  const [isActive, setIsActive] = useState(student?.is_active ?? true);
  const [userId, setUserId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const hasActiveFlag = isEdit && student.is_active !== undefined;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEdit && (userId === '' || Number.isNaN(Number(userId)))) {
      setError('Choose the student account first. A profile must belong to an existing user.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const trimmed = Object.fromEntries(FIELD_KEYS.map((key) => [key, form[key].trim()]));
      let payload;
      if (isEdit) {
        // student_id is not changed when editing. Emptied optional fields are sent as null so they can be cleared.
        const { student_id, ...rest } = trimmed;
        payload = Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, key === 'full_name' ? value : value || null]));
        if (hasActiveFlag) payload.is_active = isActive;
      } else {
        payload = Object.fromEntries(Object.entries(trimmed).filter(([, value]) => value !== ''));
        payload.user_id = Number(userId);
      }
      await onSubmit(payload);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to save the student.'));
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={isEdit ? 'Edit student' : 'Add student'}
      description={isEdit ? `Change the profile of ${student.full_name}.` : 'Give the student an ID and fill in the profile.'}
      size="lg"
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          {/* identity */}
          <fieldset className="min-w-0 border-0 p-0">
            <legend className="mb-3 w-full border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">Identity</legend>
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              {!isEdit && (
                <Field
                  id="st-user"
                  label="Student account"
                  className="sm:col-span-2"
                  help="A profile belongs to an existing user account, and each account can have only one profile."
                >
                  {accounts === null ? (
                    <input id="st-user" type="number" min="1" step="1" required value={userId} onChange={(event) => setUserId(event.target.value)}
                      placeholder="User ID of the account, e.g. 12" className={`${inputClass} font-mono`} />
                  ) : accounts.length === 0 ? (
                    <p className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Every student account already has a profile. Create the account first (the student signs up, or an admin adds the user), then come back.
                    </p>
                  ) : (
                    <select id="st-user" value={userId} onChange={(event) => setUserId(event.target.value)} required className={inputClass}>
                      <option value="">Select an account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>{account.username} · {account.email}</option>
                      ))}
                    </select>
                  )}
                </Field>
              )}
              <Field id="st-id" label="Student ID" help={isEdit ? 'The ID cannot be changed.' : 'Any number or code. The student uses it to sign up.'}>
                <div className="flex gap-2">
                  <input id="st-id" name="student_id" value={form.student_id} onChange={update} required disabled={isEdit}
                    autoComplete="off" spellCheck={false} placeholder="e.g. 1001" className={`${inputClass} font-mono`} />
                  {!isEdit && nextId && (
                    <button type="button" onClick={() => setForm((current) => ({ ...current, student_id: String(nextId) }))}
                      className="mt-1.5 shrink-0 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50">
                      Use {nextId}
                    </button>
                  )}
                </div>
              </Field>
              <Field id="st-name" label="Full name">
                <input id="st-name" name="full_name" value={form.full_name} onChange={update} required autoComplete="off" className={inputClass} />
              </Field>
            </div>
          </fieldset>

          {/* personal */}
          <fieldset className="min-w-0 border-0 p-0">
            <legend className="mb-3 w-full border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">Personal</legend>
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <Field id="st-gender" label="Gender" optional>
                <select id="st-gender" name="gender" value={form.gender} onChange={update} className={inputClass}>
                  <option value="">Select</option>
                  {GENDERS.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                </select>
              </Field>
              <Field id="st-dob" label="Date of birth" optional>
                <input id="st-dob" name="date_of_birth" type="date" value={form.date_of_birth} onChange={update} className={inputClass} />
              </Field>
              <Field id="st-phone" label="Phone" optional>
                <input id="st-phone" name="phone" type="tel" value={form.phone} onChange={update} autoComplete="off" className={inputClass} />
              </Field>
              <Field id="st-address" label="Address" optional>
                <input id="st-address" name="address" value={form.address} onChange={update} autoComplete="off" className={inputClass} />
              </Field>
            </div>
          </fieldset>

          {/* academic */}
          <fieldset className="min-w-0 border-0 p-0">
            <legend className="mb-3 w-full border-b border-slate-100 pb-2 text-sm font-bold text-slate-900">Academic</legend>
            <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              {[
                ['department', 'Department', 'st-dept'],
                ['major', 'Major', 'st-major'],
                ['academic_year', 'Academic year', 'st-year'],
                ['class_name', 'Class', 'st-class'],
              ].map(([key, label, id]) => (
                <Field key={key} id={id} label={label} optional>
                  <input id={id} name={key} value={form[key]} onChange={update} list={`${id}-list`} autoComplete="off" className={inputClass} />
                  <datalist id={`${id}-list`}>
                    {(suggestions[key] ?? []).map((option) => <option key={option} value={option} />)}
                  </datalist>
                </Field>
              ))}
            </div>
          </fieldset>

          {hasActiveFlag && (
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-slate-900">Account enabled</span>
                <span className="block text-xs text-slate-500">Turn off to block this student without deleting the profile.</span>
              </span>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="peer sr-only" />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-emerald-500 peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-500/30" aria-hidden="true" />
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
          <button type="button" onClick={onClose} disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60">
            Cancel
          </button>
          <button type="submit" disabled={saving || (!isEdit && accounts !== null && accounts.length === 0)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70">
            {saving && <span className="dlg-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add student'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}