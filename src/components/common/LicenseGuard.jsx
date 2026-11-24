import { useEffect, useState } from 'react';
import { licenseService } from '../../api/licenseApi';
import { getErrorMessage } from '../../api/studentApi';

const TITLES = {
  LICENSE_EXPIRED: 'License key expired',
  LICENSE_REVOKED: 'License key revoked',
  LICENSE_REQUIRED: 'License key required',
};

export default function LicenseGuard({ children }) {
  const [license, setLicense] = useState(null);
  const [key, setKey] = useState('');
  const [state, setState] = useState({ saving: false, error: '' });

  useEffect(() => {
    licenseService.me().then((d) => setLicense(d.license)).catch(() => setLicense({ allowed: false, code: 'LICENSE_REQUIRED' }));
  }, []);

  if (!license) return <p className="text-sm text-slate-500">Loading…</p>;
  if (license.allowed) return children;

  const revoked = license.code === 'LICENSE_REVOKED';

  const submit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '' });
    try {
      const next = await licenseService.redeem(key.trim());
      setLicense(next);                     // allowed=true → បង្ហាញ Calculator ភ្លាម
    } catch (err) {
      setState({ saving: false, error: getErrorMessage(err, 'Could not activate the key.') });
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
        </svg>
      </span>
      <h2 className="mt-5 text-xl font-bold text-slate-900">{TITLES[license.code] ?? 'Calculator unavailable'}</h2>
      <p className="mt-2 text-sm text-slate-600">{license.message}</p>

      {/* Key ត្រូវ Revoke → ទាក់ទង Admin ប៉ុណ្ណោះ ; ក្រៅពីនេះអាចបញ្ចូល Key ថ្មី */}
      {!revoked && (
        <form onSubmit={submit} className="mt-6 space-y-3 text-left">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter a new license key"
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
          {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={state.saving}
            className="w-full rounded-lg bg-[#0F2438] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {state.saving ? 'Activating…' : 'Activate key'}
          </button>
        </form>
      )}
    </div>
  );
}