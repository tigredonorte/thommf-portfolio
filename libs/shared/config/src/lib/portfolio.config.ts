export interface IProject {
  title: string;
  description: string;
  tech: string[];
  images: string[];
  url?: string;
  isOnline: boolean;
  industry: string;
}

export interface IExperience {
  company: string;
  url?: string;
  role: string;
  startDate: string; // New field
  endDate: string; // New field
  projects: IProject[];
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
      role: 'Full Stack Engineer',
      startDate: 'Nov 2022',
      endDate: 'Present',
      projects: [
        {
          title: 'Product Research Automation Tool',
          description: 'Drastically reduced online supplier research time from 40 minutes to just 2 (a 95% improvement)  by spearheading a tool that automated data retrieval and normalization using Search APIs, custom parsers, and the ChatGPT API. ',
          tech: ['React', 'Node.js', 'ChatGPT API', 'SerpAPI'],
          images: [
            '/assets/images/clickpart/quote-1.png',
            '/assets/images/clickpart/quote-2.png',
            '/assets/images/clickpart/quote-3.png',
          ],
          isOnline: true,
          industry: 'E-commerce & Supply Chain',
        },
        {
          title: 'Event-Driven Backend Services',
          description: 'Enhanced API responsiveness and system resilience by implementing a MongoDB-based event-driven system to handle asynchronous tasks like sending order confirmation emails in the background. ',
          tech: ['Node.js', 'MongoDB', 'Event-Driven'],
          images: [
            '/assets/images/clickpart/event-driven-1.png',
          ],
          isOnline: true,
          industry: 'E-commerce & Supply Chain',
        },
        {
          title: 'CI/CD Pipeline Overhaul',
          description: 'Boosted developer productivity and enabled faster feedback cycles by overhauling CI/CD pipelines, reducing execution time by ~67% (from 30 to 10 minutes)  through the implementation of parallel processing for integration tests. ',
          tech: ['CI/CD', 'Bitbucket Pipelines', 'Bash'],
          images: [],
          isOnline: true,
          industry: 'DevOps & Software Tooling',
        },
        {
          title: 'Spreadsheet-Based SERP Data Automation',
          description: 'Initiated the product research automation process by integrating Google Spreadsheets with company APIs via Google AppScript to retrieve SERP data. This first phase reduced initial research time from 50 to 30 minutes and included a migration script for seamless updates.',
          tech: ['Google Sheets', 'Google AppScript', 'Automation'],
          images: [],
          isOnline: true,
          industry: 'MarTech & Automation',
        },
        {
          title: 'Clickpart Store Feature',
          description: 'Developed and maintained a user-friendly store feature with responsive interfaces using React and Material Design. The system included full CRUD functionality for product management and a dynamic ordering process with custom forms tailored to various product categories.',
          tech: ['React', 'Redux', 'Material Design', 'CRUD', 'Rest API', 'Node.js', 'MongoDB'],
          images: [
            '/assets/images/clickpart/store-1.png',
            '/assets/images/clickpart/store-2.png',
            '/assets/images/clickpart/store-3.png',
            '/assets/images/clickpart/store-4.png',
            '/assets/images/clickpart/store-5.png',
          ],
          isOnline: true,
          industry: 'B2B E-commerce',
        },
      ],
    },
    {
      company: 'Levity',
      url: 'https://levity.ai',
      role: 'Frontend Engineer',
      startDate: 'May 2022',
      endDate: 'Sep 2022',
      projects: [
        {
          title: 'AI Training Interface',
          description: 'Contributed to a React application by integrating with GraphQL APIs and implementing features for AI training interfaces, including robust pagination to efficiently display thousands of images per dataset. ',
          tech: ['React', 'GraphQL', 'Figma', 'Pagination'],
          images: [
            '/assets/images/levity/levity-1.png',
          ],
          isOnline: true,
          industry: 'AI / No-Code Platform',
        },
        {
          title: 'Component Refactoring & UX Enhancements',
          description: 'Refactored critical components and resolved key bugs, notably improving the UX usability of components used for editing labels by making interactions more intuitive. ',
          tech: ['React', 'UX/UI', 'Bug Fixing'],
          images: [
            '/assets/images/levity/levity-2.png',
          ],
          isOnline: true,
          industry: 'AI / No-Code Platform',
        },
      ],
    },
    {
      company: 'Gorila',
      url: 'https://gorila.com.br',
      role: 'Tech Lead & Full Stack Engineer',
      startDate: 'Oct 2016',
      endDate: 'Feb 2022',
      projects: [
         {
          title: 'Custom Push Notification System',
          description: 'As Tech Lead, guided a team in implementing a scalable push notification system using AWS (Lambda, SQS, SNS, DynamoDB) to engage ~100,000 active users. ',
          tech: ['AWS Lambda', 'SQS', 'SNS', 'DynamoDB'],
          images: [],
          isOnline: true,
          industry: 'Fintech',
        },
        {
          title: 'Advanced CI/CD Strategy for SPAs',
          description: 'Architected a CI/CD strategy using Bitbucket Pipelines that allowed multiple squads to independently deploy versioned Single Page Applications and shared libraries to a private NPM registry. ',
          tech: ['CI/CD', 'Bitbucket Pipelines', 'NPM', 'SPAs'],
          images: [],
          isOnline: true,
          industry: 'Fintech',
        },
        {
          title: 'Core System MVP from Scratch',
          description: 'As a founding engineer, built the company\'s core system from the ground up, launching the MVP in 6 weeks using Angular and Node.js, which supported acquiring the first 1,000 users. ',
          tech: ['Angular', 'Node.js', 'MVP', 'MongoDB'],
          images: [],
          isOnline: true,
          industry: 'Fintech',
        },
      ],
    },
    {
      company: 'Start Investimentos (became monetus)',
      url: 'https://web.archive.org/web/20151202014638/http://startinvestimentos.com:80/',
      role: 'Founder and CTO',
      startDate: 'Sep 2015',
      endDate: 'Jul 2016',
      projects: [
        {
          title: 'Fintech Investment Platform',
          description: 'Led the design and development of the system\'s architecture, PHP/MySQL API, and Angular.js front-end, featuring automated web scraping and a user-logged area displaying key asset insights. ',
          tech: ['PHP', 'MySQL', 'Angular.js', 'Web Scraping', 'AWS'],
          images: [],
          isOnline: false,
          industry: 'Fintech',
        },
        {
          title: 'Automated Data Import Service',
          description: 'Developed a critical web service for importing data from CVM (Brazilian SEC equivalent), enabling the automated collection of information from 11,000+ investment funds and 500+ stocks. ',
          tech: ['PHP', 'Web Service', 'Data Processing'],
          images: [],
          isOnline: false,
          industry: 'Fintech',
        },
      ],
    },
    {
      company: 'finance-e.com',
      url:'https://web.archive.org/web/20141217050919/http://finance-e.com/',
      role: 'Founder and CTO',
      startDate: 'Dec 2013',
      endDate: 'Sep 2015',
      projects: [
        {
          title: 'Financial Data & Analytics Platform',
          description: 'Designed the complete system architecture and led full-stack development using Angular.js, PHP, and MySQL for a platform centered around web scraping financial data sources to provide users with comprehensive asset information. ',
          tech: ['Angular.js', 'PHP', 'MySQL', 'AWS', 'Web Scraping'],
          images: [],
          isOnline: false,
          industry: 'Fintech',
        },
        {
          title: 'High-Availability AWS Infrastructure',
          description: 'Architected and managed the company\'s AWS infrastructure from the ground up, utilizing EC2 with Auto Scaling, ELB, S3, and a highly available Multi-AZ RDS setup to achieve 99.5% uptime. ',
          tech: ['AWS EC2', 'Auto Scaling', 'ELB', 'RDS', 'CloudWatch'],
          images: [],
          isOnline: false,
          industry: 'Fintech',
        },
      ],
    },
    {
        company: 'Freelancer',
        role: 'Full Stack Engineer',
        startDate: 'Dec 2010',
        endDate: 'Dec 2014',
        projects: [
          {
            title: 'Corporate Website & Client Portal Gateway (for Tenap)',
            description: 'Developed the public-facing corporate website for TENAP Engenharia, an engineering and construction firm. The site was designed to attract new clients by showcasing an extensive, categorized portfolio of past projects. This public website also served as the gateway for engineers and clients to access a separate, private web application used for monitoring building progress and centralizing project communication.',
            tech: ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS'],
            images: [
              '/assets/images/tenap/tenap-1.png',
              '/assets/images/tenap/tenap-2.png'
            ],
            url: 'https://web.archive.org/web/20160205044912/http://tenap.com.br/',
            isOnline: false,
            industry: 'Construction & Engineering',
          },
          {
            title: 'Construction Progress Tracking System (for Tenap)',
            description: 'Developed a web application using PHP and JavaScript that allowed engineers to monitor building progress, centralizing communication and making progress monitoring easier for the client. ',
            tech: ['PHP', 'MySQL', 'JavaScript'],
            images: [],
            url: 'https://web.archive.org/web/20160606100559/http://tele.tenap.com.br/?url=ocorrencia/info&refer=b2NvcnJlbmNpYS9pbmRleC9pbmRleA==',
            isOnline: false,
            industry: 'Construction & Engineering',
          },
          {
            title: 'Kindergarten Management System',
            description: 'Translated client needs into a custom management system for a kindergarten, designed to streamline daily operations and enhance parent-teacher communication. The platform featured modules for student enrollment, attendance tracking, and a secure portal for sharing updates and messages with parents. The implementation centralized student information, replacing inefficient paper-based processes and significantly reducing daily administrative overhead. This led to improved data accuracy and increased parent engagement and satisfaction due to more reliable, real-time communication.',
            tech: ['PHP', 'JavaScript', 'Requirement Analysis', 'JQuery'],
            images: [],
            url: 'http://bellobambino.net',
            isOnline: false,
            industry: 'Education',
          },
          {
            title: "Consignment & Inventory Management System",
            description: "Architected and developed a comprehensive management system to streamline the complex operations of a costume jewelry business. The platform provides robust inventory control, leveraging MySQL transactions to ensure data integrity for both internal and consigned stock. Key features include a detailed sales and commission reporting dashboard, seller performance tracking, and a point-of-sale interface for order entry.",
            tech: [
              "PHP",
              "Angular.js",
              "MySQL",
              "Inventory Management",
              "Transactions",
              'JQuery'
            ],
            images: [
              '/assets/images/magie/magie-1.png',
              '/assets/images/magie/magie-2.png',
              '/assets/images/magie/magie-3.png',
              '/assets/images/magie/magie-4.png',
            ],
            url: 'https://magie.magieacessorios.com.br/',
            isOnline: true,
            industry: 'Retail & E-commerce',
          },
          {
            title: 'Event Registration & Sales Tracking System (for heternal)',
            description: 'Developed a custom event management application that served as both a registration portal and a sales tracking tool for event promoters. The system empowered sellers to register participants for in-person events, attributing each registration to the respective seller. It also included a secure admin interface for on-site staff to manage a real-time check-in process. This solution replaced manual, spreadsheet-based methods, eliminating data entry errors and providing the company with instant, reliable data on event attendance and sales performance per promoter. The on-site check-in tool also significantly reduced attendee wait times, improving the overall event experience.',
            tech: ['PHP', 'MySQL', 'JavaScript', 'Event Management', 'Sales Tracking'],
            images: [],
            isOnline: false,
            industry: 'Event Management & Sales',
          },
        ]
    }
  ],
};
