import { useState } from 'react';
import { settingsService } from '../../../api/settingsApi';
import useSave from '../../../hooks/useSave';
import { Field, SaveBar, inputClass } from './SettingsFields';

export default function AccountForm({ initial, onSaved }) {
  const [form, setForm] = useState({ username: initial.username ?? '', email: initial.email ?? '' });
  const [state, save] = useSave((d) => settingsService.updateProfile(d));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const result = await save(form);
    if (result) onSaved?.(result);
  };

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Admin and teacher accounts can edit their account details only. Student profiles are managed from Student management.
      </p>
      <Field label="Username"><input className={inputClass} value={form.username} onChange={set('username')} required minLength={3} /></Field>
      <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={set('email')} required /></Field>
      <Field label="Role"><input className={inputClass} value={(initial.roles || []).join(', ')} disabled /></Field>
      <SaveBar state={state} />
    </form>
  );
}