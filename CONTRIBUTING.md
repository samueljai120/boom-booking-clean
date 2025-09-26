# Contributing to Boom Booking Clean

Thank you for your interest in contributing to Boom Booking Clean! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/boom-booking-clean.git`
3. Switch to development branch: `git checkout development`
4. Install dependencies: `npm install`
5. Set up environment: `cp .env.development .env.local`
6. Start development server: `npm run dev:full`

### Branch Strategy
- **main**: Production-ready code
- **development**: Active development branch
- **feature/***: Feature branches
- **bugfix/***: Bug fix branches

## 📋 Development Workflow

### 1. Create Feature Branch
```bash
git checkout development
git pull origin development
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write clean, documented code
- Follow existing code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run linting
npm run lint

# Run tests
npm test

# Test API endpoints
node test-simple.js
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
# Create pull request to development branch
```

## 🎯 Code Standards

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add PropTypes or TypeScript types

### API Development
- Follow RESTful conventions
- Implement proper error responses
- Add input validation
- Include comprehensive error handling
- Document API endpoints

### Database
- Use parameterized queries
- Implement proper indexing
- Follow multi-tenant patterns
- Add data validation

## 🧪 Testing

### Test Requirements
- Unit tests for new functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for critical flows

### Running Tests
```bash
# All tests
npm test

# Specific test files
npm test -- --testNamePattern="specific test"

# API tests
node test-subdomain-apis.js
```

## 📝 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Include usage examples
- Update README files as needed

### API Documentation
- Document all endpoints
- Include request/response examples
- Add error code documentation
- Update API reference

## 🔍 Pull Request Process

### PR Requirements
1. **Clear Description**: Explain what the PR does
2. **Tests**: Include tests for new functionality
3. **Documentation**: Update relevant documentation
4. **Linting**: Ensure code passes linting
5. **Screenshots**: Include screenshots for UI changes

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Test on latest development branch
3. Verify it's not a configuration issue

### Bug Report Template
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, version, branch
- **Screenshots**: If applicable

## 💡 Feature Requests

### Before Requesting
1. Check existing feature requests
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template
- **Problem**: What problem does this solve?
- **Solution**: Describe your proposed solution
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other relevant information

## 🏷️ Issue Labels

### Bug Labels
- `bug`: Something isn't working
- `critical`: Critical bug affecting production
- `documentation`: Documentation issue

### Feature Labels
- `enhancement`: New feature or request
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

### Process Labels
- `duplicate`: Issue already exists
- `invalid`: Issue not valid
- `wontfix`: Issue won't be fixed

## 🚀 Release Process

### Version Numbering
- **Major**: Breaking changes
- **Minor**: New features
- **Patch**: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Production deployment tested

## 📞 Getting Help

### Resources
- **Documentation**: Check `/docs/` folder
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions for questions

### Contact
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: [Contact information]

## 🎉 Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- Project documentation

Thank you for contributing to Boom Booking Clean! 🚀
