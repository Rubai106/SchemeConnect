import ConsoleLayout from './ConsoleLayout';

export default function SettingsPlaceholder({ onNavigate }) {
  return (
    <ConsoleLayout active="settings" onNavigate={onNavigate}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-[#6E9686] flex-shrink-0" />
          <h1 className="text-base font-medium text-[#24282C]">Settings</h1>
        </div>
        <p className="text-sm text-[#6B7280]">
          Not part of module 1 — this is a placeholder so the sidebar nav doesn't dead-end.
        </p>
      </div>
    </ConsoleLayout>
  );
}
