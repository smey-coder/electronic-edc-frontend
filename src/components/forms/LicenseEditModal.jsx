import { useState, useEffect } from "react";
import Modal from "../common/UserModal";

const controlClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

export default function LicenseEditModal({ license, onSubmit, onClose }) {
  const [maxUses, setMaxUses] = useState(license?.max_uses || 1);
  const [status, setStatus] = useState(license?.status || "active");
  const [expiresAt, setExpiresAt] = useState(
    license?.expires_at ? new Date(license.expires_at).toISOString().slice(0, 16) : ""
  );
  const [description, setDescription] = useState(license?.description || "");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (license) {
      setMaxUses(license.max_uses || 1);
      setStatus(license.status || "active");
      setExpiresAt(
        license.expires_at ? new Date(license.expires_at).toISOString().slice(0, 16) : ""
      );
      setDescription(license.description || "");
    }
  }, [license]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        max_uses: Number(maxUses),
        status: status,
        description: description || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      await onSubmit(license.id, payload);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to update license key.");
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Edit License Key #${license?.id}`}
      description="Update license key details, usage limits, or status."
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${controlClass} w-full`}
          >
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses</label>
          <input
            type="number"
            min={license?.used_count || 1}
            required
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            className={`${controlClass} w-full`}
          />
          <p className="mt-1 text-xs text-slate-500">Currently used: {license?.used_count ?? 0} times.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date (Optional)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={`${controlClass} w-full`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. For Spring 2026 Student Batch"
            rows="3"
            className={`${controlClass} w-full`}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}