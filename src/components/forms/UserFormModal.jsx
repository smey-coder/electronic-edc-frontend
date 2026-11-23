import { useState } from 'react';
import Modal from '../common/UserModal';
import { ACCOUNT_STATUSES, getErrorMessage } from '../../api/userApi';

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 ' +
  'placeholder:text-slate-400 outline-none transition duration-150 ' +
  'hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15';

/**
 * mode: 'create' | 'edit'
 * onSubmit(payload) must return a promise. Throw to show an error in the modal;
 * the parent closes the modal on success.
 */
export default function UserFormModal({ mode, user, roles, onSubmit, onClose }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    username: user?.username ?? '',
    email: user?.email ?? '',
    password: '',
    role_id: user?.role_id ?? user?.role?.id ?? '',
    account_status: user?.account_status ?? ACCOUNT_STATUSES[0],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const statusOptions = ACCOUNT_STATUSES.includes(form.account_status)
    ? ACCOUNT_STATUSES
    : [form.account_status, ...ACCOUNT_STATUSES];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const username = form.username.trim();
      const email = form.email.trim();
      const payload = isEdit
        ? { username, email, account_status: form.account_status }
        : {
            username,
            email,
            password: form.password,
            ...(form.role_id !== '' && { role_id: Number(form.role_id) }),
          };
      await onSubmit(payload);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit user' : 'Add user'}
      description={isEdit ? `Update the details for ${user?.username}.` : 'Create an account and give it a role.'}
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="um-username" className="text-sm font-medium text-slate-700">Username</label>
          <input id="um-username" name="username" value={form.username} onChange={update} required minLength={3}
            autoComplete="off" spellCheck={false} className={inputClass} />
        </div>

        <div>
          <label htmlFor="um-email" className="text-sm font-medium text-slate-700">Email</label>
          <input id="um-email" name="email" type="email" value={form.email} onChange={update} required
            autoComplete="off" className={inputClass} />
        </div>

        {!isEdit && (
          <>
            <div>
              <label htmlFor="um-password" className="text-sm font-medium text-slate-700">Password</label>
              <input id="um-password" name="password" type="password" value={form.password} onChange={update}
                required minLength={6} autoComplete="new-password" className={inputClass} />
              <p className="mt-1.5 text-xs text-slate-500">At least 6 characters.</p>
            </div>

            <div>
              <label htmlFor="um-role" className="text-sm font-medium text-slate-700">Role</label>
              <select id="um-role" name="role_id" value={form.role_id} onChange={update} required={roles.length > 0}
                disabled={roles.length === 0} className={inputClass}>
                <option value="">{roles.length === 0 ? 'No roles available' : 'Select a role'}</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {isEdit && (
          <div>
            <label htmlFor="um-status" className="text-sm font-medium text-slate-700">Account status</label>
            <select id="um-status" name="account_status" value={form.account_status} onChange={update} className={inputClass}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-slate-500">Set a student to inactive to block their access.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70">
            {saving && <span className="edc-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}