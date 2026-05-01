import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import OfflineBanner from "./components/OfflineBanner";
import Home from "./pages/Home";
import Emergency from "./pages/Emergency";
import Services from "./pages/Services";
import Admin from "./pages/Admin";

function MobileBottomNav() {
  const links = [
    { to: "/", label: "Home", icon: "🏠" },
    { to: "/emergency", label: "SOS", icon: "🚨" },
    { to: "/services", label: "Services", icon: "🔍" },
    { to: "/admin", label: "Admin", icon: "⚙️" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[rgba(5,9,20,0.92)] backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-4">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-xs font-semibold ${
                  isActive ? "text-red-500" : "text-[var(--text-secondary)]"
                }`
              }
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Navbar />
        <OfflineBanner />
        <main className="pb-20 pt-6 md:pb-0 md:pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/services" element={<Services />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
