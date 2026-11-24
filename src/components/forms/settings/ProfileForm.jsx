import { useState } from 'react';
import { settingsService } from '../../../api/settingsApi';
import useSave from '../../../hooks/useSave';
import { Field, SaveBar, inputClass } from './SettingsFields';

export default function ProfileForm({ initial, onSaved }) {
  const [form, setForm] = useState({
    full_name: initial.full_name ?? '',
    email: initial.email ?? '',
    gender: initial.gender ?? '',
    date_of_birth: initial.date_of_birth ?? '',
    phone: initial.phone ?? '',
    address: initial.address ?? '',
  });
  const [state, save] = useSave((d) => settingsService.updateProfile(d));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    // string ទទេ → null ដើម្បីលុបវាលស្រេចចិត្តបាន (full_name និង email មិនត្រូវទទេ)
    const payload = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]),
    );
    const result = await save(payload);
    if (result) onSaved?.(result);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><input className={inputClass} value={form.full_name} onChange={set('full_name')} required /></Field>
        <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={set('email')} required /></Field>
        <Field label="Gender">
          <select className={inputClass} value={form.gender} onChange={set('gender')}>
            <option value="">Not set</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Date of birth"><input type="date" className={inputClass} value={form.date_of_birth} onChange={set('date_of_birth')} /></Field>
        <Field label="Phone"><input className={inputClass} value={form.phone} onChange={set('phone')} maxLength={30} /></Field>
        <Field label="Student ID" hint="Managed by the school"><input className={inputClass} value={initial.student_id ?? ''} disabled /></Field>
        <Field label="Department" hint="Managed by the school"><input className={inputClass} value={initial.department ?? ''} disabled /></Field>
        <Field label="Class" hint="Managed by the school"><input className={inputClass} value={initial.class_name ?? ''} disabled /></Field>
      </div>
      <Field label="Address"><textarea rows={2} className={inputClass} value={form.address} onChange={set('address')} /></Field>
      <SaveBar state={state} />
    </form>
  );
}