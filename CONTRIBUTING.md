# Contributing to LOON Format

Thank you for your interest in contributing to LOON Format! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/loon.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Building

```bash
# Build the project
npm run build
```

## Coding Standards

- Write TypeScript with strict mode enabled
- Follow the existing code style (enforced by ESLint and Prettier)
- Add JSDoc comments for public APIs
- Write tests for new features
- Ensure all tests pass before submitting

## Testing Guidelines

- Write unit tests for specific behaviors and edge cases
- Write property-based tests for universal properties
- Aim for high test coverage (>90%)
- Tests should be clear and well-documented

## Submitting Changes

1. Ensure all tests pass: `npm test`
2. Ensure code is formatted: `npm run format`
3. Ensure no linting errors: `npm run lint`
4. Commit your changes with a clear message
5. Push to your fork
6. Open a Pull Request with a description of your changes

## Pull Request Guidelines

- Provide a clear description of the problem and solution
- Reference any related issues
- Include tests for new functionality
- Update documentation as needed
- Keep PRs focused on a single feature or fix

## Reporting Issues

- Use the GitHub issue tracker
- Provide a clear description of the issue
- Include steps to reproduce
- Include relevant code samples or error messages
- Specify your environment (Node version, OS, etc.)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

## Questions?

Feel free to open an issue for questions or discussions about the project.

Thank you for contributing!
