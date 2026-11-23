import { useState } from 'react';
import Modal from '../common/UserModal';
import { getErrorMessage } from '../../api/licenseApi';

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 ' +
  'placeholder:text-slate-400 outline-none transition duration-150 ' +
  'hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15';

// Random key from the browser's secure random generator (not Math.random).
function generateRandomKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `EDC-${Array.from(bytes, (byte) => chars[byte % chars.length]).join('')}`;
}

/**
 * - onSubmit(payload) must return the API response (a promise).
 * - The modal shows the new key and calls onClose when the admin presses Done.
 */
export default function LicenseFormModal({ onSubmit, onClose }) {
  const [maxUses, setMaxUses] = useState(1);
  const [expiresAt, setExpiresAt] = useState('');
  const [description, setDescription] = useState('');
  const [rawKeyInput, setRawKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  // ពិនិត្យមើលថាតើអ្នកប្រើប្រាស់បានវាយបញ្ចូល Key ឬនៅទំនេរ
  const hasCustomKey = rawKeyInput.trim().length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        raw_key: rawKeyInput.trim() || generateRandomKey(),
        max_uses: Number(maxUses),
        description: description.trim() || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const response = await onSubmit(payload);

      // Prefer the key the server returned; fall back to the one we sent so it is always shown.
      setCreatedKey(response?.raw_key || response?.license_key?.raw_key || payload.raw_key);
      setSaving(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to create license key.'));
      setSaving(false);
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      title={createdKey ? 'License key created' : 'New license key'}
      description={createdKey ? 'Copy it now and give it to your students.' : 'Students need a key like this to sign up.'}
      onClose={onClose}
      busy={saving}
    >
      {createdKey ? (
        <div className="space-y-5">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <code className="min-w-0 flex-1 select-all break-all font-mono text-[15px] font-semibold text-slate-900">{createdKey}</code>
            <button
              type="button"
              onClick={copyKey}
              className="shrink-0 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-slate-500">Keep this key somewhere safe. It may not be shown again after you close this window.</p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="lic-raw-key" className="flex items-baseline justify-between text-sm font-medium text-slate-700">
              <span>Key</span>
              <span className="text-xs font-normal text-slate-400">Leave empty to generate one</span>
            </label>
            <input
              id="lic-raw-key"
              type="text"
              value={rawKeyInput}
              onChange={(event) => setRawKeyInput(event.target.value)}
              placeholder="e.g. EDC-ABC123XYZ789"
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} font-mono tracking-wide`}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="lic-max-uses" className="text-sm font-medium text-slate-700">Max uses</label>
              <input
                id="lic-max-uses"
                type="number"
                min="1"
                step="1"
                required
                value={maxUses}
                onChange={(event) => setMaxUses(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lic-expires" className="flex items-baseline justify-between text-sm font-medium text-slate-700">
                <span>Expires</span>
                <span className="text-xs font-normal text-slate-400">Optional</span>
              </label>
              <input
                id="lic-expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lic-description" className="flex items-baseline justify-between text-sm font-medium text-slate-700">
              <span>Description</span>
              <span className="text-xs font-normal text-slate-400">Optional</span>
            </label>
            <textarea
              id="lic-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. For Spring 2026 student batch"
              rows="3"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300/50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving && <span className="edc-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />}
              {saving
                ? (hasCustomKey ? 'Creating…' : 'Generating…')
                : (hasCustomKey ? 'Create key' : 'Generate key')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}