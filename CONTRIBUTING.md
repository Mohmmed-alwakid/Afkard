# Contributing to Afkar

First off, thank you for considering contributing to Afkar! It's people like you that make Afkar such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Follow the TypeScript styleguide
* Include screenshots in your pull request whenever possible
* End all files with a newline
* Avoid platform-dependent code

## Development Process

1. Fork the repo
2. Create a new branch (git checkout -b feature/amazing-feature)
3. Make your changes
4. Run the tests
5. Commit your changes (git commit -m 'Add some amazing feature')
6. Push to the branch (git push origin feature/amazing-feature)
7. Create a Pull Request

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### TypeScript Styleguide

* Use strict typing - no any or implicit unknown
* Use boolean prefixes for boolean variables (isLoading, hasError)
* Use functional components over class components
* Use React hooks for state and side effects
* Follow the project's existing patterns for components and file structure

### Documentation Styleguide

* Use [Markdown](https://guides.github.com/features/mastering-markdown/)
* Reference methods and classes in markdown with backticks: \`methodName()\`
* Include code examples when possible
* Keep documentation up to date with code changes

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/            # React components
├── contexts/             # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── styles/             # Global styles
└── types/              # TypeScript types
```

## Testing

* Write tests for new features
* Update tests when modifying existing features
* Run the entire test suite before submitting a pull request
* Include both unit tests and integration tests where appropriate

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed

## Questions?

Feel free to contact the project maintainers if you have any questions. 