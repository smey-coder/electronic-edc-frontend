export default function AccessDenied({ required }) {
  const permissions = [].concat(required ?? []).filter(Boolean);

  return (
    <main className="flex min-h-[50vh] items-center justify-center px-4 py-12">
      <section className="max-w-md text-center" role="alert">
        <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-2 text-slate-600">
          You do not have permission to access this page.
        </p>
        {permissions.length > 0 && (
          <p className="mt-3 text-sm text-slate-500">
            Required permission{permissions.length === 1 ? '' : 's'}:{' '}
            {permissions.join(', ')}
          </p>
        )}
      </section>
    </main>
  );
}
