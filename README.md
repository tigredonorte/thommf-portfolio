# ThomMF Portfolio

This project is a personal portfolio website designed to showcase my skills and projects. It is built using a micro-frontend architecture with Module Federation, allowing for a modular and scalable design.

## Table of Contents

- [ThomMF Portfolio](#thommf-portfolio)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Architecture](#architecture)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Development](#development)
  - [Building the Project](#building-the-project)
  - [Testing](#testing)
    - [Unit Tests](#unit-tests)
    - [End-to-End (E2E) Tests](#end-to-end-e2e-tests)
  - [Linting and Formatting](#linting-and-formatting)
  - [Deployment](#deployment)
  - [Security & Monitoring](#security--monitoring)
  - [Technologies Used](#technologies-used)
  - [License](#license)

## Project Overview

This portfolio presents my work as a software developer. It includes:
*   A dynamic header.
*   A section listing various projects I've worked on.

The main goal is to demonstrate proficiency in modern web development practices and technologies.

## Architecture

The portfolio is built using a micro-frontend architecture. This approach breaks down the application into smaller, independent, and deployable units. We are using **Module Federation** (via `@module-federation/enhanced` and Nx's built-in support) to achieve this.

Key benefits of this architecture for this project include:
*   **Independent Development & Deployment:** Different parts of the portfolio (e.g., header, project list) can be developed, tested, and deployed independently.
*   **Scalability:** Easier to add new sections or features as separate micro-frontends.
*   **Technology Agnostic (Potentially):** While currently using React, micro-frontends could theoretically be built with different frameworks if needed.

The `container` application acts as the shell, orchestrating and loading the different micro-frontends like `headerMfe` and `projectListMfe`.

## Project Structure

The workspace is organized as follows:

- `apps/`: Contains the applications (micro-frontends and the main container).
  - `container/`: The main application shell that orchestrates the micro-frontends.
  - `headerMfe/`: Micro-frontend for the header section.
  - `projectListMfe/`: Micro-frontend for displaying a list of projects.
  - `*-e2e/`: End-to-end test projects for each application (e.g., `container-e2e`, `headerMfe-e2e`).
- `libs/`: Contains shared libraries and components.
  - `shared/`: A library for shared utilities, components, or types. (e.g., `libs/shared/config` for shared configurations).
- `tmp/`: Temporary files, including static remotes for module federation during development (`tmp/static-remotes`).
- Configuration files (e.g., `nx.json`, `package.json`, `tsconfig.base.json`, etc.) are at the root level.

## Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc` if present, or compatible with the `packageManager` version in `package.json`)
- pnpm (version specified in `packageManager` field in `package.json` - currently `pnpm@10.6.5`)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd thommf-portfolio
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

## Development

To start the development server with all micro-frontends running:

```bash
pnpm dev
```

This command (`nx serve container --open --dev-remotes=headerMfe,projectListMfe`) will serve the `container` application and automatically detect and serve the `headerMfe` and `projectListMfe` as development remotes. The application will typically be accessible at `http://localhost:4200`.

## Building the Project

To build all applications and libraries for production:

```bash
pnpm build
```
This maps to `nx run-many --target=build --all`. The build artifacts will be located in the `dist/` directory for each project.

## Deployment

This project includes AWS infrastructure for deploying to S3 with CloudFront CDN.

### Quick Deploy

```bash
# Configure deployment (first time only)
cp infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
# Edit infra/terraform/terraform.tfvars with your AWS settings

# Deploy everything
pnpm run deploy
```

### Deployment Commands

- **`pnpm run deploy`** - Full deployment (build + infrastructure + upload)
- **`pnpm run deploy:build`** - Build only
- **`pnpm run deploy:infra`** - Infrastructure only  
- **`pnpm run deploy:upload`** - Upload files only

### Infrastructure

The deployment uses:
- **S3** - Static website hosting
- **CloudFront** - Global CDN with HTTPS
- **Route 53** (optional) - Custom domain management

For detailed deployment instructions, see [`infra/terraform/README.md`](infra/terraform/README.md).

## Security & Monitoring

This deployment includes enterprise-grade security measures:

### 🔒 **Security Features**
- **Least-Privilege IAM Policy** - Deployer user restricted to resources tagged with `Environment=frontend`
- **Tag-Based Access Control** - AWS-native approach using resource tags instead of naming conventions
- **Service Control Policies (SCP)** - Organization-level restrictions (optional)
- **OIDC Integration** - GitHub Actions with temporary credentials (recommended)

### 📊 **Monitoring & Logging**
- **CloudTrail** - Complete API call logging and audit trail
- **CloudWatch Alarms** - Automated alerts for security violations
- **Security Dashboard** - Real-time monitoring of deployment activities
- **Metric Filters** - Detection of unauthorized resource access attempts

###  **Security Documentation**
- [🔒 Security Overview](/docs/SECURITY.md) - **Comprehensive security architecture and procedures**
- [Deployment Security Guide](/docs/DEPLOYMENT.md) - Complete setup instructions
- [Terraform Security](/infra/terraform/README.md) - Infrastructure security details

**Key Security Principle**: The deployer user can **only** manage resources tagged with `Environment=frontend`, providing complete isolation from other AWS resources while allowing flexible naming.

## Testing

### Unit Tests

To run unit tests for all projects:

```bash
pnpm test
```
This maps to `nx run-many --target=test --all`. Tests are primarily written with Jest.

### End-to-End (E2E) Tests

To run E2E tests for all applications:

```bash
pnpm e2e
```
This maps to `nx run-many --target=e2e --all`. E2E tests are written using Playwright.

## Linting and Formatting

To lint all projects:

```bash
pnpm lint
```
This maps to `nx run-many --target=lint --all`.

To automatically format the code using Prettier:

```bash
pnpm format
```
This maps to `nx format:write`.

To check for formatting issues:

```bash
pnpm format:check
```
This maps to `nx format:check`.

## Deployment

(Details about the deployment process will be added here once finalized. This section should cover how the container and micro-frontends are deployed and hosted.)

## Technologies Used

- **Framework/Libraries:**
  - React 19
  - React Router DOM 6.29.0
- **Build & Monorepo Management:**
  - Nx 21.1.3
  - Webpack with Module Federation (`@module-federation/enhanced` ^0.9.0)
  - Vite (used for `libs/shared/config`)
- **Language:**
  - TypeScript (~5.7.2)
- **Testing:**
  - Jest (^29.7.0) (Unit Tests)
  - Playwright (^1.36.0) (E2E Tests)
  - Testing Library (React) (16.1.0)
- **Linting & Formatting:**
  - ESLint (^9.8.0)
  - Prettier (^2.6.2)
- **Styling:**
  - SCSS (Sass 1.62.1)
- **Package Manager:**
  - pnpm 10.6.5

## License

This project is licensed under the MIT License. (You may want to create a `LICENSE` file with the MIT license text).
