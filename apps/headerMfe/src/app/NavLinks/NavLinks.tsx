import { config } from '@thommf-portfolio/config';

interface NavLinksProps {
  currentPath: string;
  variant: 'desktop' | 'mobile';
  onClick?: () => void;
}

export function NavLinks({ currentPath, variant, onClick }: NavLinksProps) {
  const iconSize = variant === 'mobile' ? '28' : '20';

  return (
    <>
      <a 
        href="/" 
        className={currentPath === '/' ? 'active' : ''} 
        onClick={onClick}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Classic View
      </a>
      
      <a 
        href="/portfolio" 
        className={currentPath === '/portfolio' ? 'active' : ''} 
        onClick={onClick}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7V17C2 17.55 2.45 18 3 18H9V12H15V18H21C21.55 18 22 17.55 22 17V7L12 2Z"></path>
          <polygon points="12,2 22,7 22,17 12,12 2,17 2,7"></polygon>
        </svg>
        Creative Portfolio
      </a>
      
      <a 
        href={config.socials.github} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={onClick}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
        </svg>
        GitHub
      </a>
      
      <a 
        href={config.socials.linkedin} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={onClick}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
        LinkedIn
      </a>
    </>
  );
}
