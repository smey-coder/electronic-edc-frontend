import { useState } from 'react';
import { settingsService } from '../../../api/settingsApi';
import useSave from '../../../hooks/useSave';
import { Field, SaveBar, inputClass } from './SettingsFields';

const EMPTY = { current_password: '', new_password: '', confirm: '' };

export default function PasswordForm() {
  const [form, setForm] = useState(EMPTY);
  const [mismatch, setMismatch] = useState(false);
  const [state, save] = useSave((d) => settingsService.changePassword(d));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) return setMismatch(true);
    setMismatch(false);
    const result = await save({
      current_password: form.current_password,
      new_password: form.new_password,
    });
    if (result) setForm(EMPTY);
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <Field label="Current password">
        <input type="password" autoComplete="current-password" className={inputClass} value={form.current_password} onChange={set('current_password')} required />
      </Field>
      <Field label="New password" hint="At least 8 characters, with letters and numbers">
        <input type="password" autoComplete="new-password" className={inputClass} value={form.new_password} onChange={set('new_password')} required minLength={8} />
      </Field>
      <Field label="Confirm new password">
        <input type="password" autoComplete="new-password" className={inputClass} value={form.confirm} onChange={set('confirm')} required />
      </Field>
      {mismatch && <p role="alert" className="text-sm text-red-600">Passwords do not match.</p>}
      <SaveBar state={state} label="Change password" />
    </form>
  );
}