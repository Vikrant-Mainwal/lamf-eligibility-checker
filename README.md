# LAMF Eligibility Checker

A web application built with **Next.js** and **TypeScript** that helps users determine their eligibility for LAMF (Loan/Aid/Membership/Fund — update as applicable) programs through a guided, interactive interface.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)

---

## Overview

The **LAMF Eligibility Checker** provides a streamlined way for users to check whether they qualify for LAMF-related programs or benefits. Users answer a series of questions and receive an instant eligibility result — no manual paperwork or guesswork required.

Key features include:

- Interactive eligibility questionnaire
- Instant eligibility result based on user inputs
- Clean, responsive UI built with modern web technologies
- Type-safe codebase using TypeScript

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js](https://nextjs.org/) | React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [ESLint](https://eslint.org/) | Code linting |
| [PostCSS](https://postcss.org/) | CSS processing |

---

## Project Structure

```
lamf-eligibility-checker/
├── app/                  # Next.js App Router pages and layouts
├── public/               # Static assets (images, icons, etc.)
├── .gitignore
├── AGENTS.md             # Notes for AI coding agents
├── CLAUDE.md             # Claude-specific agent instructions
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── postcss.config.mjs    # PostCSS configuration
└── tsconfig.json         # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Vikrant-Mainwal/lamf-eligibility-checker.git
cd lamf-eligibility-checker
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with hot-reload |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint to check for code issues |

## Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request.

Please ensure your code passes linting (`npm run lint`) before submitting.

---

## License

This project is open source.

---

> Built by [Vikrant Mainwal](https://github.com/Vikrant-Mainwal)
