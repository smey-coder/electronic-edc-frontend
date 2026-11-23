import { useState, useEffect } from "react";
import Modal from "../common/UserModal";
import { getErrorMessage } from "../../api/permissionApi";

const controlClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/15";

export default function PermissionFormModal({ mode = "create", permission, onSubmit, onClose }) {
  const [name, setName] = useState(permission?.name || "");
  const [description, setDescription] = useState(permission?.description || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (permission) {
      setName(permission.name || "");
      setDescription(permission.description || "");
    }
  }, [permission]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({ name, description });
    } catch (err) {
      setError(getErrorMessage(err, "Failed to save permission."));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={mode === "create" ? "Create permission" : "Edit permission"}
      description={mode === "create" ? "Add a new system permission." : `Update details for ${permission?.name}.`}
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
          <label className="block text-sm font-medium text-slate-700 mb-1">Permission Code</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. user.create"
            className={`${controlClass} w-full`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this permission allows..."
            rows="3"
            className={`${controlClass} w-full`}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : mode === "create" ? "Create permission" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}