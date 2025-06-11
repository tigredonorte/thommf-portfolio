interface Project {
  title: string;
  description: string;
  tech: string[];
  images: string[];
  url?: string;
}

export interface IExperience {
  company: string;
  url?: string;
  role: string;
  projects: Project[];
}

export interface PortfolioConfig {
  developerName: string;
  developerRole: string;
  socials: {
    linkedin: string;
    github: string;
  };
  experience: IExperience[];
}

export const config: PortfolioConfig = {
  developerName: 'Thompson Filgueiras',
  developerRole: 'Software Engineer',
  socials: {
    linkedin: 'https://linkedin.com/in/thomfilg',
    github: 'https://github.com/tigredonorte',
  },
  experience: [
    {
      company: 'Clickpart',
      url: 'https://clickpart.co',
      role: 'Full Stack Engineer | Nov 2022 - Present',
      projects: [
        {
          title: 'Product Research Automation Tool',
          description: 'Spearheaded a tool that reduced research time for online suppliers by 95% using Search APIs, custom parsers, and ChatGPT for data normalization. ',
          tech: ['React', 'Node.js', 'ChatGPT API', 'SerpAPI'],
          images: [
            'https://picsum.photos/seed/clickpart1/800/600',
            'https://picsum.photos/seed/clickpart2/800/600',
          ],
        },
        {
          title: 'Event-Driven Backend Services',
          description: 'Built scalable backend services with Node.js and MongoDB, including an event-driven system for asynchronous tasks like sending order confirmation emails, improving API responsiveness. ',
          tech: ['Node.js', 'MongoDB', 'Event-Driven'],
          images: ['https://picsum.photos/seed/clickpart3/800/600'],
        },
        {
          title: 'CI/CD Pipeline Overhaul',
          description: 'Revamped CI/CD pipelines, reducing execution time by ~67% (from 30 to 10 minutes) by implementing parallel processing for integration tests via a custom bash script. ',
          tech: ['CI/CD', 'Bitbucket Pipelines', 'Bash'],
          images: ['https://picsum.photos/seed/clickpart4/800/600'],
        },
      ],
    },
    {
      company: 'Levity',
      url: 'https://levity.ai',
      role: 'Frontend Engineer | May 2022 - Sep 2022',
      projects: [
        {
          title: 'AI Training Interface',
          description: 'Contributed to a React application by integrating with GraphQL APIs and implementing features for AI training interfaces, including robust pagination to efficiently display thousands of images per dataset. ',
          tech: ['React', 'GraphQL', 'Figma', 'Pagination'],
          images: [
            'https://picsum.photos/seed/levity1/800/600',
            'https://picsum.photos/seed/levity2/800/600',
          ],
        },
        {
          title: 'Component Refactoring & UX Enhancements',
          description: 'Refactored critical components and resolved key bugs, notably improving the UX usability of components used for editing labels by making interactions more intuitive. ',
          tech: ['React', 'UX/UI', 'Bug Fixing'],
          images: ['https://picsum.photos/seed/levity3/800/600'],
        },
      ],
    },
    {
      company: 'Gorila',
      url: 'https://gorila.com.br',
      role: 'Tech Lead & Full Stack Engineer | Oct 2016 - Feb 2022',
      projects: [
         {
          title: 'Custom Push Notification System',
          description: 'As Tech Lead, guided a team in implementing a scalable push notification system using AWS (Lambda, SQS, SNS, DynamoDB) to engage ~100,000 active users. ',
          tech: ['AWS Lambda', 'SQS', 'SNS', 'DynamoDB'],
          images: [
            'https://picsum.photos/seed/gorila1/800/600',
            'https://picsum.photos/seed/gorila2/800/600',
            'https://picsum.photos/seed/gorila3/800/600',
          ],
        },
        {
          title: 'Advanced CI/CD Strategy for SPAs',
          description: 'Architected a CI/CD strategy using Bitbucket Pipelines that allowed multiple squads to independently deploy versioned Single Page Applications and shared libraries to a private NPM registry. ',
          tech: ['CI/CD', 'Bitbucket Pipelines', 'NPM', 'SPAs'],
          images: ['https://picsum.photos/seed/gorila4/800/600'],
        },
        {
          title: 'Core System MVP from Scratch',
          description: 'As a founding engineer, built the company\'s core system from the ground up, launching the MVP in 6 weeks using Angular and Node.js, which supported acquiring the first 1,000 users. ',
          tech: ['Angular', 'Node.js', 'MVP', 'MongoDB'],
          images: ['https://picsum.photos/seed/gorila5/800/600'],
        },
      ],
    },
    {
      company: 'Start Investimentos',
      url: 'https://web.archive.org/web/20151202014638/http://startinvestimentos.com:80/',
      role: 'Founder and CTO | Sep 2015 - Jul 2016',
      projects: [
        {
          title: 'Fintech Investment Platform',
          description: 'Led the design and development of the system\'s architecture, PHP/MySQL API, and Angular.js front-end, featuring automated web scraping and a user-logged area displaying key asset insights. ',
          tech: ['PHP', 'MySQL', 'Angular.js', 'Web Scraping', 'AWS'],
          images: [
            'https://picsum.photos/seed/start1/800/600',
            'https://picsum.photos/seed/start2/800/600',
          ],
        },
        {
          title: 'Automated Data Import Service',
          description: 'Developed a critical web service for importing data from CVM (Brazilian SEC equivalent), enabling the automated collection of information from 11,000+ investment funds and 500+ stocks. ',
          tech: ['PHP', 'Web Service', 'Data Processing'],
          images: ['https://picsum.photos/seed/start3/800/600'],
        },
      ],
    },
    {
      company: 'finance-e.com',
      url:'https://web.archive.org/web/20141217050919/http://finance-e.com/',
      role: 'Founder and CTO | Dec 2013 - Sep 2015',
      projects: [
        {
          title: 'Financial Data & Analytics Platform',
          description: 'Designed the complete system architecture and led full-stack development using Angular.js, PHP, and MySQL for a platform centered around web scraping financial data sources to provide users with comprehensive asset information. ',
          tech: ['Angular.js', 'PHP', 'MySQL', 'AWS', 'Web Scraping'],
          images: [
            'https://picsum.photos/seed/financee1/800/600',
            'https://picsum.photos/seed/financee2/800/600',
          ],
        },
        {
          title: 'High-Availability AWS Infrastructure',
          description: 'Architected and managed the company\'s AWS infrastructure from the ground up, utilizing EC2 with Auto Scaling, ELB, S3, and a highly available Multi-AZ RDS setup to achieve 99.5% uptime. ',
          tech: ['AWS EC2', 'Auto Scaling', 'ELB', 'RDS', 'CloudWatch'],
          images: ['https://picsum.photos/seed/financee3/800/600'],
        },
      ],
    },
    {
        company: 'Freelancer',
        role: 'Full Stack Engineer | Dec 2010 - Dec 2014',
        projects: [
          {
            title: 'Construction Progress Tracking System (for Tenap)',
            description: 'Developed a web application using PHP and JavaScript that allowed engineers to monitor building progress, centralizing communication and making progress monitoring easier for the client. ',
            tech: ['PHP', 'MySQL', 'JavaScript'],
            images: ['https://picsum.photos/seed/freela1/800/600'],
            url: 'https://tenap.com.br',
          },
          {
            title: 'Kindergarten Management System',
            description: 'Gathered client requirements and delivered a student and communications management system for a kindergarten. ',
            tech: ['PHP', 'JavaScript', 'Requirement Analysis'],
            images: ['https://picsum.photos/seed/freela2/800/600'],
            url: 'https://tenap.com.br',
          },
        ]
    }
  ],
};