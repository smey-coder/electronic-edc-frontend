import { useState } from 'react';
import { X } from 'lucide-react';
import { getErrorMessage } from '../../api/roleApi';

const getPermissionIds = (role) => {
  const permissions = role?.permission_ids ?? role?.permissions ?? [];
  if (!Array.isArray(permissions)) return [];

  return permissions
    .map((permission) =>
      typeof permission === 'object' ? permission?.id : permission,
    )
    .filter((id) => id != null)
    .map(Number);
};

export default function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allPermissions = [],
  permissionError = '',
}) {
  const [name, setName] = useState(() => initialData?.name ?? '');
  const [description, setDescription] = useState(
    () => initialData?.description ?? '',
  );
  const [selectedPermissions, setSelectedPermissions] = useState(() =>
    getPermissionIds(initialData),
  );
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleCheckboxChange = (permId) => {
    setSelectedPermissions((current) =>
      current.includes(permId)
        ? current.filter((id) => id !== permId)
        : [...current, permId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      await onSubmit({
        name,
        description,
        permission_ids: selectedPermissions,
      });
      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Failed to save role.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2438]/50 p-4 backdrop-blur-[2px]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? 'Edit Role' : 'Create New Role'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {submitError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Teacher, Admin"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe role responsibilities..."
              rows="2"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Permissions Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Permissions</label>
            {permissionError && (
              <p role="alert" className="mb-2 text-sm text-red-700">
                {permissionError}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 border p-3 rounded-lg max-h-48 overflow-y-auto bg-gray-50">
              {allPermissions.length > 0 ? (
                allPermissions.map((perm) => (
                  <label key={perm.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handleCheckboxChange(perm.id)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{perm.name || perm.codename}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-gray-500 col-span-2">No permissions available or loaded.</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}