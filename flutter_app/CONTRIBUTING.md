# Contributing to FitForm Flutter App

Thank you for your interest in contributing to the FitForm Flutter mobile application!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/FitForm3.git`
3. Navigate to the Flutter app: `cd FitForm3/flutter_app`
4. Follow the setup instructions in [SETUP.md](SETUP.md)

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run tests
flutter test

# Analyze code
flutter analyze

# Format code
flutter format .
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commit messages:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for test additions or modifications
- `chore:` for maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

- Follow Dart style guidelines
- Use `flutter format` to format code
- Run `flutter analyze` before committing
- Use meaningful variable and function names
- Keep functions small and focused
- Add documentation comments for public APIs

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Add widget tests for UI components
- Add unit tests for business logic

## Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what changes you made and why
3. **Testing**: Describe how you tested your changes
4. **Screenshots**: Add screenshots for UI changes
5. **Breaking Changes**: Note any breaking changes

## Code Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Help with setup

Thank you for contributing! 🎉
