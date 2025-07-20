# 🚀 GitHub Actions - Tra Vinh Travel

This directory contains GitHub Actions workflows for the Tra Vinh Travel project.

## 📋 Available Workflows

### 1. 🔄 **CI/CD Pipeline** (`ci-cd.yml`)
**Trigger:** Push to `main`/`develop`, Pull Requests to `main`

**Jobs:**
- 🎨 **Frontend Lint & Test** - Validates HTML, CSS, JavaScript
- 🔧 **Backend Test & Build** - Tests Node.js backend with MySQL
- 🔒 **Security Scan** - Dependency audit and secret detection
- 🚀 **Build & Deploy** - Creates production build
- 📢 **Notification** - Reports deployment status

### 2. 🧪 **Tests** (`test.yml`)
**Trigger:** Push to any branch, Pull Requests

**Jobs:**
- ⚡ **Quick Tests** - File structure and syntax validation
- 🔧 **Backend Tests** - Database connection and API tests
- 🔗 **Integration Tests** - Frontend-backend integration
- 📊 **Test Summary** - Overall test results

### 3. 🚀 **Deployment** (`deploy.yml`)
**Trigger:** Push to `main`, Tags `v*`, Manual dispatch

**Jobs:**
- 🏗️ **Build Application** - Creates optimized production build
- 🧪 **Deploy to Staging** - Staging environment deployment
- 🌟 **Deploy to Production** - Production deployment (tags only)
- 📢 **Notification** - Deployment status and URLs
- 🔄 **Rollback** - Manual rollback capability

### 4. 🔍 **Code Quality** (`code-quality.yml`)
**Trigger:** Push to `main`/`develop`, Pull Requests, Weekly schedule

**Jobs:**
- 🔒 **Security Audit** - Dependency vulnerabilities and secrets
- 📊 **Code Analysis** - Complexity and quality metrics
- ⚡ **Performance Analysis** - File sizes and optimization
- ♿ **Accessibility Check** - HTML accessibility standards
- 📚 **Documentation Check** - README and code comments
- 📊 **Quality Summary** - Overall quality score

## 🔧 Setup Instructions

### 1. **Repository Secrets**
Add these secrets in GitHub repository settings:

```
# Database (for testing)
DB_HOST=your-test-db-host
DB_USER=your-test-db-user
DB_PASSWORD=your-test-db-password
DB_NAME=dulichtravinh_test

# Application
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# Deployment (optional)
DEPLOY_HOST=your-server-host
DEPLOY_USER=your-server-user
DEPLOY_KEY=your-ssh-private-key
```

### 2. **Environment Configuration**
Create environment-specific configurations:

- **Staging Environment:** `staging`
- **Production Environment:** `production`

### 3. **Branch Protection**
Recommended branch protection rules for `main`:

- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require review from code owners
- ✅ Dismiss stale reviews
- ✅ Restrict pushes to matching branches

## 📊 Workflow Status Badges

Add these badges to your main README.md:

```markdown
![CI/CD](https://github.com/your-username/tra-vinh-travel/workflows/🚀%20Tra%20Vinh%20Travel%20-%20CI/CD%20Pipeline/badge.svg)
![Tests](https://github.com/your-username/tra-vinh-travel/workflows/🧪%20Tests%20-%20Tra%20Vinh%20Travel/badge.svg)
![Code Quality](https://github.com/your-username/tra-vinh-travel/workflows/🔍%20Code%20Quality%20-%20Tra%20Vinh%20Travel/badge.svg)
```

## 🎯 Workflow Triggers

| Workflow | Push | PR | Tags | Schedule | Manual |
|----------|------|----|----- |----------|--------|
| CI/CD | ✅ main, develop | ✅ main | ❌ | ❌ | ❌ |
| Tests | ✅ all branches | ✅ main, develop | ❌ | ❌ | ❌ |
| Deploy | ✅ main | ❌ | ✅ v* | ❌ | ✅ |
| Code Quality | ✅ main, develop | ✅ main | ❌ | ✅ Weekly | ❌ |

## 🔄 Deployment Process

### Staging Deployment
1. Push to `main` branch
2. CI/CD pipeline runs automatically
3. Tests pass → Deploy to staging
4. Staging tests run
5. ✅ Staging environment updated

### Production Deployment
1. Create and push a version tag: `git tag v1.0.0 && git push origin v1.0.0`
2. Deploy workflow triggers automatically
3. Build → Staging → Production
4. Health checks run
5. ✅ Production environment updated

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "🚀 Deploy - Tra Vinh Travel"
3. Click "Run workflow"
4. Choose environment (staging/production)
5. ✅ Manual deployment starts

## 🐛 Troubleshooting

### Common Issues

**❌ Tests failing?**
- Check database connection in test environment
- Verify Node.js version compatibility
- Review error logs in Actions tab

**❌ Build failing?**
- Check for syntax errors in JavaScript files
- Verify all dependencies are listed in package.json
- Review build logs for specific errors

**❌ Deployment failing?**
- Verify secrets are configured correctly
- Check server connectivity and permissions
- Review deployment logs

### Debug Mode
Add this to workflow files for debugging:
```yaml
- name: 🐛 Debug
  run: |
    echo "Node version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo "Working directory: $(pwd)"
    ls -la
```

## 📈 Monitoring

### Workflow Metrics
- ⏱️ **Build Time:** ~5-10 minutes
- 🧪 **Test Coverage:** Syntax and integration tests
- 🔒 **Security:** Weekly dependency audits
- 📊 **Quality Score:** Automated quality assessment

### Notifications
- ✅ **Success:** Deployment completed
- ❌ **Failure:** Build/test/deploy failed
- ⚠️ **Warning:** Quality issues detected

## 🤝 Contributing

When contributing to workflows:

1. Test changes in a fork first
2. Use descriptive commit messages
3. Update documentation if needed
4. Follow existing naming conventions
5. Add appropriate emoji prefixes

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Marketplace Actions](https://github.com/marketplace?type=actions)

---

🎉 **Happy Deploying!** 🚀
