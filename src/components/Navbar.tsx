import { useState, useEffect } from 'react';
import { Menu, X, Gauge, Waves, Activity, Sigma, Home } from 'lucide-react';
import { assignment } from '../data/assignment';

const navItems = [
  { href: '#overview', label: 'Overview', icon: Home },
  { href: '#diesel', label: 'Diesel Cycle', icon: Gauge },
  { href: '#rankine', label: 'Rankine Cycle', icon: Waves },
  { href: '#analysis', label: 'Analysis', icon: Activity },
  { href: '#equations', label: 'Equations', icon: Sigma },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}
      aria-label="Primary navigation"
    >
      <div className="navbar-inner">
        <a className="navbar-brand" href="#overview" onClick={close}>
          <span className="navbar-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M3 19 L9 8 L14 14 L21 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M3 19 L21 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="navbar-name">ThermoSim&nbsp;203</span>
        </a>

        <ul className={`navbar-links${open ? ' is-open' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <a className="navbar-link" href={item.href} onClick={close}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="navbar-end">
          <span className="navbar-badge">
            {assignment.assignment} • {assignment.set}
          </span>
          <button
            type="button"
            className="navbar-toggle"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
