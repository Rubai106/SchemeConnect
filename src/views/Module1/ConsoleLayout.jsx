// Tokens pulled from the Figma console screens:
//   header      #7FA08F  (sage green top bar)
//   accentBtn   #6E9686  (buttons, active nav)
//   sidebarBg   #E7E7E4  (light gray sidebar)
//   badgeGreen  #DCEBE2  (verified status)
//   ink         #24282C
//   muted       #6B7280
//
// NOTE: I don't know if this project uses React Router, so this takes a plain
// `active` string + `onNavigate` callback instead of <NavLink>/routes. If you
// do have React Router set up, swap the <button> below for <NavLink to={item.key}>
// and drop the onNavigate prop.

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'beneficiaries', label: 'Beneficiary Records' },
  { key: 'analytics', label: 'Performance Intelligence' },
  { key: 'audit-log', label: 'Audit Log' },
  { key: 'circulars', label: 'Circulars' },
  { key: 'settings', label: 'Settings' }
];

export default function ConsoleLayout({ active, onNavigate, children }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#7FA08F] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="bg-[#E7E7E4] text-[#24282C] text-xs font-semibold tracking-wide px-3 py-1 rounded-full">
            CONSOLE
          </span>
          <h1 className="text-white text-lg font-medium">SchemeConnect Management</h1>
        </div>
        <span className="text-white text-lg font-semibold">SchemeConnect</span>
      </header>

      <div className="flex">
        <nav className="w-64 bg-[#E7E7E4] min-h-[calc(100vh-73px)]">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate && onNavigate(item.key)}
              className={`block w-full text-left px-6 py-4 text-sm border-b border-black/5 transition-colors ${
                active === item.key ? 'bg-white text-[#24282C] font-medium' : 'text-[#3A3F44] hover:bg-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 bg-white">{children}</main>
      </div>
    </div>
  );
}
