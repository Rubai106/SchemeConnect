import { useState } from 'react';
import DashboardConsole from '../src/views/Module1/DashboardConsole';
import BeneficiaryRecordsConsole from '../src/views/Module1/BeneficiaryRecordsConsole';
import SchemeAnalyticsConsole from '../src/views/Module1/SchemeAnalyticsConsole';
import AuditLogCenter from '../src/views/Module1/AuditLogCenter';
import CircularSyncCenter from '../src/views/Module1/CircularSyncCenter';
import SettingsPlaceholder from '../src/views/Module1/SettingsPlaceholder';

// Maps each sidebar nav key (defined in ConsoleLayout.jsx) to the screen
// component that should render for it.
const SCREENS = {
  dashboard: DashboardConsole,
  beneficiaries: BeneficiaryRecordsConsole,
  analytics: SchemeAnalyticsConsole,
  'audit-log': AuditLogCenter,
  circulars: CircularSyncCenter,
  settings: SettingsPlaceholder
};

export default function App() {
  const [screen, setScreen] = useState('dashboard');
  const Screen = SCREENS[screen] || DashboardConsole;
  return <Screen onNavigate={setScreen} />;
}
