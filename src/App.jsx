import AppRoutes from './routes/AppRoutes';
import { PublicSettingsProvider } from './context/PublicSettingsContext';

export default function App() {
  return (
    // The language settings are available to every page below.
    <PublicSettingsProvider>
      <AppRoutes />
    </PublicSettingsProvider>
  );
}