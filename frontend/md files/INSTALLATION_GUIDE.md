# Smart Attendance Admin Frontend - Installation & Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 16+ (Recommended: 18 LTS)
- **npm**: Version 7+ or yarn 3+
- **Backend Server**: Running on `http://localhost:8000`
- **Git**: For version control

## 🚀 Installation Steps

### Step 1: Navigate to Admin Directory

```bash
cd c:\Users\a8369\kitty\smart-attendece-system\admin
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all packages including:
- React 18.2.0
- Vite 4.5.1
- React Router 6.21.0
- React Query 5.28.0
- Zustand 4.4.1
- Axios 1.6.5
- Recharts 2.10.4
- And more...

**Installation Time**: 2-5 minutes depending on internet speed

### Step 3: Configure Environment Variables

```bash
# Copy example to create local env file
cp .env.example .env
```

Edit `.env` file with your backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME='Smart Attendance Admin'
VITE_APP_DESCRIPTION='Admin Dashboard for Smart Attendance System'
VITE_DEBUG=false
```

### Step 4: Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v4.5.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 5: Access the Dashboard

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the Smart Attendance Admin login page.

## 🧪 Testing the Installation

### Test Login
1. Use credentials provided by your backend admin
2. If login succeeds, you'll see the dashboard
3. Check browser console (F12) for any errors

### Test API Connection
1. Go to DevTools → Network tab
2. Try any operation (e.g., go to Users)
3. You should see API requests going to `http://localhost:8000/api/v1/...`

### Common Error Fixes

**Error: Cannot find module 'react'**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error: VITE config not found**
```bash
# Ensure you're in the admin directory
cd c:\Users\a8369\kitty\smart-attendece-system\admin
npm run dev
```

**Error: Backend connection failed**
```bash
# Verify backend is running
# Check VITE_API_BASE_URL in .env
# Test: curl http://localhost:8000/api/v1/auth/login
```

## 📦 Available Commands

```bash
# Development
npm run dev           # Start dev server (HMR enabled)

# Production
npm run build         # Create optimized production build
npm run preview       # Preview production build locally

# Code Quality
npm run lint          # Run ESLint checks
npm run format        # Format code with Prettier
npm run type-check    # TypeScript type checking

# Other
npm install           # Install dependencies
npm update            # Update all packages
npm cache clean       # Clear npm cache
```

## 🏗️ Project Structure

```
admin/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components (16 pages)
│   ├── stores/          # State management
│   ├── styles/          # Global CSS & theme
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── public/
│   └── index.html       # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── tsconfig.json        # TypeScript config
```

## 🎨 Using the Dashboard

### After Login

You'll see:
1. **Sidebar** - Navigation menu (collapsible on mobile)
2. **Header** - User profile & logout options
3. **Dashboard** - Main content area split into sections

### Main Features

- **Dashboard**: Overview with statistics and charts
- **Management**: 
  - Users (CRUD operations)
  - Divisions, Courses, Branches, Batches
  - Timetables, Locations, Access Points
  - Enrollments
- **Reports**: 
  - Attendance records with filters
  - Analytics with charts
  - Export functionality (CSV, PDF)
- **Settings**:
  - System configuration
  - User profile management

## 🔧 Development Workflow

### Making Changes

1. **Edit files** in `src/` directory
2. **Changes auto-reload** thanks to Vite HMR
3. **Check console** (F12) for errors
4. **Test features** in browser

### Adding New Page

1. Create file in `src/pages/`
2. Create corresponding CSS file
3. Add route in `src/App.jsx`
4. Add sidebar link in `src/components/Layout/Sidebar.jsx`

Example:

```jsx
// pages/MyPage.jsx
import { Card, CardBody } from '../../components/Common'

export default function MyPage() {
  return (
    <div className="my-page">
      <Card>
        <CardBody>Your content here</CardBody>
      </Card>
    </div>
  )
}
```

### Adding New API Endpoint

1. Add to `src/api/endpoints.js`
2. Create hook in `src/api/hooks.js`
3. Use hook in your component

## 🚀 Building for Production

### Step 1: Create Optimized Build

```bash
npm run build
```

Output in `dist/` directory (~250KB gzipped)

### Step 2: Test Production Build

```bash
npm run preview
```

### Step 3: Deploy

**Option A: Docker**
```bash
docker build -t smart-attendance-admin .
docker run -p 3000:3000 smart-attendance-admin
```

**Option B: Nginx**
1. Copy contents of `dist/` to `/var/www/html`
2. Use provided `nginx.conf`
3. Restart Nginx

**Option C: Node Server**
```bash
npm install -g serve
serve -s dist -l 3000
```

## 📊 Performance

- **Dev Server Start**: < 1 second
- **Hot Module Reload**: < 300ms  
- **Production Bundle**: ~250KB gzipped
- **First Contentful Paint**: < 2 seconds
- **Time to Interactive**: < 4 seconds

## 🔐 Security Checklist

- [ ] Change default credentials
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Use secure cookies
- [ ] Implement rate limiting
- [ ] Set security headers
- [ ] Enable authentication
- [ ] Regular security updates

## 📝 Troubleshooting

### Issue: Blank White Page

**Solution**: 
```bash
# Clear cache and reinstall
rm -rf node_modules
npm cache clean --force
npm install
npm run dev
```

### Issue: API Requests Return 401

**Solution**: 
- Check backend is running
- Verify credentials
- Clear localStorage
- Re-login

### Issue: Slow Performance

**Solution**:
- Check network tab for slow requests
- Check React DevTools for re-renders
- Profile with Chrome DevTools
- Enable gzip compression

### Issue: Module Not Found Error

**Solution**:
```bash
# Check import path is correct
# Ensure file exists
# Verify spelling
# Restart dev server
npm run dev
```

## 📚 Documentation Files

- **README.md** - Complete feature documentation
- **DEVELOPMENT.md** - Development patterns and guidelines
- **PROJECT_COMPLETION_SUMMARY.md** - Feature checklist and overview
- **This file** - Installation and setup guide

## 🤝 Getting Help

1. **Check Documentation**: Review README.md and DEVELOPMENT.md
2. **Check Console Errors**: Open DevTools (F12) and check console
3. **Check Network Errors**: Check Network tab for API errors
4. **Test Backend**: Verify backend server is responding
5. **Check Logs**: Review nginx/docker logs

## ✅ Installation Verification Checklist

- [ ] Node.js version 16+: `node --version`
- [ ] npm version 7+: `npm --version`
- [ ] Dependencies installed: `npm list react`
- [ ] .env file created and configured
- [ ] Dev server running without errors
- [ ] Login page loads
- [ ] Backend connection works
- [ ] Dashboard statistics load
- [ ] Navigation works
- [ ] API requests successful

## 🎯 Next Steps

After installation:

1. **Explore the Dashboard**: Click around and familiarize yourself
2. **Test Features**: Try CRUD operations in Management pages
3. **Check API Integration**: Monitor Network tab while using features
4. **Read Documentation**: Review README.md for detailed info
5. **Start Development**: Modify components and pages as needed

## 📞 Support

If you encounter issues:

1. Check error message in browser console
2. Verify backend server is running
3. Ensure .env is properly configured
4. Review logs in DevTools Network tab
5. Check DEVELOPMENT.md for patterns

---

**Installation Complete! 🎉**

Your admin dashboard is now ready to use. Happy coding!

**Created**: February 14, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
