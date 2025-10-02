# Contributing to Financial Dashboard

First off, thank you for considering contributing to Financial Dashboard! It's people like you that make this project better.

## Code of Conduct

By participating in this project, you are expected to uphold our commitment to providing a welcoming and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the problem has already been reported. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what you expected to see**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

- Fill in the required template
- Follow the coding style used throughout the project
- Include appropriate test cases (if applicable)
- Update documentation as needed
- End all files with a newline

## Development Process

### Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and test them:
   ```bash
   npm start
   npm run lint
   npm run build
   ```
5. **Commit your changes**:
   ```bash
   git commit -m "Add: brief description of your changes"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request** from your fork to our main branch

### Coding Standards

#### JavaScript/React

- Use ES6+ features
- Follow the existing code style (enforced by ESLint and Prettier)
- Use functional components with hooks (no class components)
- Add PropTypes for all component props
- Add JSDoc comments for functions and complex logic
- Keep functions focused and under 150 lines when possible

#### Git Commits

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Prefix with type:
  - `Add:` for new features
  - `Fix:` for bug fixes
  - `Update:` for changes to existing features
  - `Remove:` for removing code or files
  - `Docs:` for documentation changes
  - `Style:` for formatting changes
  - `Refactor:` for code refactoring
  - `Test:` for adding or updating tests

#### Code Style

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Double quotes for JSX, single quotes for JS
- **Semicolons**: Yes, always
- **Line length**: Maximum 80-100 characters
- **File naming**: PascalCase for components, camelCase for utilities

### Project Structure

```
src/
├── components/       # React components
│   ├── Charts/      # Chart visualization components
│   ├── UI/          # UI components (buttons, cards, tables)
│   └── ErrorBoundary.js
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
│   ├── chartUtils.js
│   ├── dataUtils.js
│   ├── csvUtils.js
│   ├── localStorage.js
│   └── logger.js
└── App.js          # Main application component
```

### Testing

While we currently have minimal test coverage, we encourage adding tests for new features:

```bash
npm test
```

### Building

To create a production build:

```bash
npm run build
```

### Linting

To check for code style issues:

```bash
npm run lint
```

To auto-fix linting issues:

```bash
npm run lint:fix
```

## Financial Contributions

We don't currently accept financial contributions. The best way to support the project is by contributing code, documentation, or spreading the word!

## Questions?

Feel free to open an issue with the "question" label if you have any questions about contributing.

---

Thank you for your contributions! 🎉
