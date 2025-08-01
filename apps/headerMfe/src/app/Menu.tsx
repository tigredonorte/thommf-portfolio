import { config } from '@thommf-portfolio/config';
import { useState } from 'react';
import { NavLinks } from './NavLinks/NavLinks';
import './Menu.scss';

export function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentPath = window.location.pathname;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="brand">
        <h1>{config.developerName}</h1>
        <p>{config.developerRole}</p>
      </div>

      {/* Desktop Navigation */}
      <nav className="desktop-nav">
        <NavLinks currentPath={currentPath} variant="desktop" />
      </nav>

      {/* Hamburger Menu Button for Mobile */}
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Open menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-menu" onClick={toggleMenu} aria-label="Close menu">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <nav>
          <NavLinks currentPath={currentPath} variant="mobile" onClick={toggleMenu} />
        </nav>
      </div>
    </header>
  );
}

export default Menu;
