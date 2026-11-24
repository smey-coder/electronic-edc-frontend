import { useState } from 'react';
import useLocalSettings from '../../../hooks/useLocalSettings';
import { Field, Toggle, SaveBar, inputClass } from './SettingsFields';

// hook រួម សម្រាប់ form ដែលរក្សាទុកក្នុង browser
function useLocalForm(userId, section) {
  const [saved, persist] = useLocalSettings(userId, section);
  const [form, setForm] = useState(saved);
  const [state, setState] = useState({ saving: false, error: '', ok: false });

  const submit = (e) => {
    e.preventDefault();
    const ok = persist(form);
    setState({ saving: false, ok, error: ok ? '' : 'Could not save to this browser.' });
  };
  return { form, setForm, state, submit };
}

export function GeneralForm({ userId }) {
  const { form, setForm, state, submit } = useLocalForm(userId, 'general');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <Field label="Language">
        <select className={inputClass} value={form.language} onChange={set('language')}>
          <option value="en">English</option>
          <option value="km">ខ្មែរ (Khmer)</option>
        </select>
      </Field>
      <Field label="Time zone">
        <select className={inputClass} value={form.timezone} onChange={set('timezone')}>
          <option value="Asia/Phnom_Penh">Asia/Phnom Penh (UTC+7)</option>
          <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
          <option value="UTC">UTC</option>
        </select>
      </Field>
      <Field label="Date format">
        <select className={inputClass} value={form.date_format} onChange={set('date_format')}>
          <option>DD/MM/YYYY</option>
          <option>MM/DD/YYYY</option>
          <option>YYYY-MM-DD</option>
        </select>
      </Field>
      <SaveBar state={state} />
    </form>
  );
}

export function SystemForm({ userId }) {
  const { form, setForm, state, submit } = useLocalForm(userId, 'system');
  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <Field label="Theme">
        <select className={inputClass} value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">Follow system</option>
        </select>
      </Field>
      <Field label="Rows per page">
        <select className={inputClass} value={form.rows_per_page} onChange={(e) => setForm({ ...form, rows_per_page: Number(e.target.value) })}>
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </Field>
      <Toggle label="Compact mode" description="Use tighter spacing in tables and lists" checked={form.compact_mode} onChange={(v) => setForm({ ...form, compact_mode: v })} />
      <SaveBar state={state} />
    </form>
  );
}

export function NotificationForm({ userId }) {
  const { form, setForm, state, submit } = useLocalForm(userId, 'notifications');
  const toggle = (k) => (v) => setForm({ ...form, [k]: v });
  return (
    <form onSubmit={submit} className="max-w-md">
      <p className="mb-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        These preferences are saved in this browser only.
      </p>
      <div className="divide-y divide-slate-100">
        <Toggle label="Email notifications" description="Master switch for all emails" checked={form.email_enabled} onChange={toggle('email_enabled')} />
        <Toggle label="Announcements" description="News from your school or department" checked={form.announcements} onChange={toggle('announcements')} />
        <Toggle label="Grades and results" description="When new results are published" checked={form.grades} onChange={toggle('grades')} />
        <Toggle label="Security alerts" description="Sign-ins and password changes" checked={form.security_alerts} onChange={toggle('security_alerts')} />
      </div>
      <SaveBar state={state} />
    </form>
  );
}