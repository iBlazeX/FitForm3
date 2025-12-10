# Contributing to FitForm

Thank you for your interest in contributing to FitForm! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, etc.)

### Suggesting Features

1. Check if the feature has been suggested
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approaches

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/FitForm.git
cd FitForm

# Start services with Docker
docker-compose up -d

# Or run individually
cd cv-service && pip install -r requirements.txt && python src/app.py
cd backend && npm install && npm start
cd web-app && npm install && npm start
```

### Code Style

**Python:**
- Follow PEP 8
- Use type hints
- Add docstrings to functions

**JavaScript:**
- Use ESLint configuration
- Prefer functional components
- Use meaningful variable names

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for >80% code coverage

### Commit Messages

Use conventional commits:
- `feat: add new exercise detector`
- `fix: correct rep counting logic`
- `docs: update API documentation`
- `test: add tests for workout service`

## Project Structure

- `cv-service/` - Python CV/AI service
- `backend/` - Node.js backend API
- `web-app/` - React web application
- `mobile-app/` - React Native mobile app

## Questions?

Open an issue or reach out to maintainers.

Thank you for contributing! 🎉
