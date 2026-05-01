import { useState } from "react";
import { Link } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/admin", label: "Admin" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 hidden md:block">
      <div className="bg-[rgba(5,9,20,0.8)] backdrop-blur-xl">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2">
            <svg width="18" height="22" viewBox="0 0 24 28" fill="none">
              <path
                d="M12 1L22 4.5V12.4C22 19 17.9 24.7 12 27C6.1 24.7 2 19 2 12.4V4.5L12 1Z"
                fill="#dc2626"
              />
            </svg>
            <span className="font-['Syne'] text-xl font-extrabold text-white">Road</span>
            <span className="font-['Syne'] text-xl font-extrabold text-red-500">SoS</span>
          </Link>

          <ul className="flex items-center gap-6 text-sm font-medium text-slate-200">
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="group relative py-1">
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-red-500 to-transparent transition-all duration-200 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
      </div>

      {open ? (
        <div className="border-t border-red-200 bg-[#dc2626] md:hidden">
          <ul className="flex flex-col px-4 py-2 text-sm font-semibold">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="block py-2"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
