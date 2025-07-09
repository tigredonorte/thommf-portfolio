import { render, screen, fireEvent } from '@testing-library/react';
import { Menu } from './Menu';

jest.mock('@thommf-portfolio/config', () => ({
  config: {
    developerName: 'Thompson Filgueiras',
    developerRole: 'Software Engineer',
    socials: {
      linkedin: 'https://linkedin.com/in/thomfilg',
      github: 'https://github.com/tigredonorte',
    },
  },
}));

const setLocation = (pathname: string) => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname,
    },
    writable: true,
  });
}

describe('Menu Component', () => {
  beforeEach(() => {
    setLocation('/');
  });

  describe('Rendering', () => {
    it('should render successfully', () => {
      const { baseElement } = render(<Menu />);
      expect(baseElement).toBeTruthy();
    });

    it('should display the developer name', () => {
      render(<Menu />);
      expect(screen.getByText('Thompson Filgueiras')).toBeTruthy();
    });

    it('should display the developer role', () => {
      render(<Menu />);
      expect(screen.getByText('Software Engineer')).toBeTruthy();
    });

    it('should render the header with correct class', () => {
      render(<Menu />);
      const header = screen.getByRole('banner');
      expect(header.classList.contains('header')).toBe(true);
    });
  });

  describe('Desktop Navigation', () => {
    it('should render desktop navigation', () => {
      render(<Menu />);
      const desktopNav = document.querySelector('.desktop-nav');
      expect(desktopNav).toBeTruthy();
    });

    it('should have Projects link', () => {
      render(<Menu />);
      const projectsLinks = screen.getAllByText('Projects');
      // Should have Projects link in both desktop and mobile nav
      expect(projectsLinks.length).toBeGreaterThan(0);
    });

    it('should have LinkedIn link with correct href', () => {
      render(<Menu />);
      const linkedinLinks = screen.getAllByText('LinkedIn');
      expect(linkedinLinks.length).toBeGreaterThan(0);
      
      // Check that at least one LinkedIn link has the correct href
      const linkedinLink = screen.getAllByRole('link', { name: /linkedin/i })[0];
      expect(linkedinLink.getAttribute('href')).toBe('https://linkedin.com/in/thomfilg');
      expect(linkedinLink.getAttribute('target')).toBe('_blank');
      expect(linkedinLink.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should have GitHub link with correct href', () => {
      render(<Menu />);
      const githubLinks = screen.getAllByText('GitHub');
      expect(githubLinks.length).toBeGreaterThan(0);
      
      // Check that at least one GitHub link has the correct href
      const githubLink = screen.getAllByRole('link', { name: /github/i })[0];
      expect(githubLink.getAttribute('href')).toBe('https://github.com/tigredonorte');
      expect(githubLink.getAttribute('target')).toBe('_blank');
      expect(githubLink.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('should mark Projects link as active when on home page', () => {
      render(<Menu />);
      const desktopProjectsLink = document.querySelector('.desktop-nav a[href="#"]');
      expect(desktopProjectsLink?.classList.contains('active')).toBe(true);
    });

    it('should not mark Projects link as active when on other page', () => {
      setLocation('/other'); // Simulate being on another page
      render(<Menu />);
      const desktopProjectsLink = document.querySelector('.desktop-nav a[href="/"]');
      expect(desktopProjectsLink?.classList.contains('active')).toBe(false);
    });
  });

  describe('Mobile Navigation', () => {
    it('should render hamburger menu button', () => {
      render(<Menu />);
      const menuToggle = screen.getByLabelText('Open menu');
      expect(menuToggle).toBeTruthy();
      expect(menuToggle.classList.contains('menu-toggle')).toBe(true);
    });

    it('should render mobile navigation overlay', () => {
      render(<Menu />);
      const mobileNav = document.querySelector('.mobile-nav');
      expect(mobileNav).toBeTruthy();
    });

    it('should initially hide mobile navigation', () => {
      render(<Menu />);
      const mobileNav = document.querySelector('.mobile-nav');
      expect(mobileNav?.classList.contains('open')).toBe(false);
    });

    it('should open mobile navigation when hamburger is clicked', () => {
      render(<Menu />);
      const menuToggle = screen.getByLabelText('Open menu');
      const mobileNav = document.querySelector('.mobile-nav');
      
      fireEvent.click(menuToggle);
      expect(mobileNav?.classList.contains('open')).toBe(true);
    });

    it('should close mobile navigation when close button is clicked', () => {
      render(<Menu />);
      const menuToggle = screen.getByLabelText('Open menu');
      const closeButton = screen.getByLabelText('Close menu');
      const mobileNav = document.querySelector('.mobile-nav');
      
      // Open menu first
      fireEvent.click(menuToggle);
      expect(mobileNav?.classList.contains('open')).toBe(true);
      
      // Close menu
      fireEvent.click(closeButton);
      expect(mobileNav?.classList.contains('open')).toBe(false);
    });

    it('should toggle mobile navigation state', () => {
      render(<Menu />);
      const menuToggle = screen.getByLabelText('Open menu');
      const mobileNav = document.querySelector('.mobile-nav');
      
      // Initially closed
      expect(mobileNav?.classList.contains('open')).toBe(false);
      
      // First click - open
      fireEvent.click(menuToggle);
      expect(mobileNav?.classList.contains('open')).toBe(true);
      
      // Second click - close
      fireEvent.click(menuToggle);
      expect(mobileNav?.classList.contains('open')).toBe(false);
    });

    it('should close mobile navigation when a link is clicked', () => {
      render(<Menu />);
      const menuToggle = screen.getByLabelText('Open menu');
      const mobileNav = document.querySelector('.mobile-nav');
      
      // Open menu
      fireEvent.click(menuToggle);
      expect(mobileNav?.classList.contains('open')).toBe(true);
      
      // Click on a mobile nav link (get the LinkedIn link in mobile nav)
      const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
      const linkedinMobileLink = Array.from(mobileNavLinks).find(link => 
        link.getAttribute('href') === 'https://linkedin.com/in/thomfilg'
      );
      
      if (linkedinMobileLink) {
        fireEvent.click(linkedinMobileLink);
        expect(mobileNav?.classList.contains('open')).toBe(false);
      }
    });
  });

  describe('SVG Icons', () => {
    it('should render SVG icons for navigation links', () => {
      render(<Menu />);
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });

    it('should have hamburger menu icon', () => {
      render(<Menu />);
      const menuButton = screen.getByLabelText('Open menu');
      const svg = menuButton.querySelector('svg');
      expect(svg).toBeTruthy();
    });

    it('should have close menu icon', () => {
      render(<Menu />);
      const closeButton = screen.getByLabelText('Close menu');
      const svg = closeButton.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for menu buttons', () => {
      render(<Menu />);
      expect(screen.getByLabelText('Open menu')).toBeTruthy();
      expect(screen.getByLabelText('Close menu')).toBeTruthy();
    });

    it('should have external links with proper rel attributes', () => {
      render(<Menu />);
      const externalLinks = document.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      });
    });
  });

  describe('URL Navigation', () => {
    it('should link to home page with hash when already on home', () => {
      setLocation('/');
      render(<Menu />);
      const projectsLink = document.querySelector('.desktop-nav a[href="#"]');
      expect(projectsLink).toBeTruthy();
    });

    it('should link to home page with / when on other pages', () => {
      setLocation('/other');
      render(<Menu />);
      const projectsLink = document.querySelector('.desktop-nav a[href="/"]');
      expect(projectsLink).toBeTruthy();
    });
  });

  describe('Configuration Integration', () => {
    it('should use developer name from config', () => {
      render(<Menu />);
      const nameElement = screen.getByText('Thompson Filgueiras');
      expect(nameElement).toBeTruthy();
    });

    it('should use developer role from config', () => {
      render(<Menu />);
      const roleElement = screen.getByText('Software Engineer');
      expect(roleElement).toBeTruthy();
    });

    it('should use LinkedIn URL from config', () => {
      render(<Menu />);
      const linkedinLink = screen.getAllByRole('link', { name: /linkedin/i })[0];
      expect(linkedinLink.getAttribute('href')).toBe('https://linkedin.com/in/thomfilg');
    });

    it('should use GitHub URL from config', () => {
      render(<Menu />);
      const githubLink = screen.getAllByRole('link', { name: /github/i })[0];
      expect(githubLink.getAttribute('href')).toBe('https://github.com/tigredonorte');
    });
  });
});
