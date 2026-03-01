# Smart Attendance Admin Dashboard

A modern, production-ready React + Vite admin dashboard for managing the Smart Attendance System with beautiful neomorphism UI design.

## Features

- 🎨 **Beautiful Neomorphism Design** - Modern UI with soft shadows and gradients
- 🔐 **Secure Authentication** - JWT-based login with refresh tokens
- 👥 **User Management** - Create, read, update, delete users with role-based access
- 📚 **Course & Division Management** - Manage academic structure
- 📍 **Location & Geofence Management** - Configure attendance verification points
- 📋 **Timetable Management** - Organize class schedules
- 📊 **Attendance Reports** - View and export attendance records
- 📈 **Analytics Dashboard** - Real-time attendance insights and trends
- ⚡ **Real-time Updates** - Live attendance tracking with WebSockets
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔄 **Auto-refresh** - Automatic token refresh and session management

## Tech Stack

- **Frontend Framework**: React 18+
- **Build Tool**: Vite 4.5+
- **State Management**: Zustand for auth, React Query for server state
- **HTTP Client**: Axios with JWT interceptors
- **Charts & Analytics**: Recharts for data visualization
- **Routing**: React Router v6
- **Maps**: React Leaflet for geolocation visualization
- **Notifications**: React Hot Toast for user feedback
- **Icons**: Lucide React
- **CSS**: CSS-in-JS with neomorphism design system

## Project Structure

```
admin/
├── src/
│   ├── api/
│   │   ├── client.js          # Axios client with interceptors
│   │   ├── endpoints.js       # API endpoint definitions
│   │   └── hooks.js           # React Query hooks for all endpoints
│   │
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── Header.jsx      # Top navigation bar
│   │   │   ├── Sidebar.jsx     # Left navigation menu
│   │   │   └── *.css           # Component styles
│   │   │
│   │   └── Common/
│   │       ├── Button.jsx      # Reusable button component
│   │       ├── Input.jsx       # Form input components
│   │       ├── Card.jsx        # Card container components
│   │       ├── Table.jsx       # Data table component
│   │       ├── Modal.jsx       # Modal dialogs
│   │       ├── Loading.jsx     # Loading indicators
│   │       ├── Alert.jsx       # Alert notifications
│   │       └── *.css           # Component styles
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── Auth.css
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   └── Dashboard.css
│   │   │
│   │   ├── Management/
│   │   │   ├── UsersPage.jsx
│   │   │   ├── DivisionsPage.jsx
│   │   │   ├── TimetablesPage.jsx
│   │   │   ├── LocationsPage.jsx
│   │   │   ├── AccessPointsPage.jsx
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── BranchesPage.jsx
│   │   │   ├── BatchesPage.jsx
│   │   │   ├── EnrollmentsPage.jsx
│   │   │   └── Management.css
│   │   │
│   │   ├── Reports/
│   │   │   ├── AttendanceReportsPage.jsx
│   │   │   ├── StudentReportPage.jsx
│   │   │   ├── ClassReportPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── Reports.css
│   │   │
│   │   ├── Settings/
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── Settings.css
│   │   │
│   │   ├── NotFoundPage.jsx
│   │   └── NotFoundPage.css
│   │
│   ├── stores/
│   │   └── authStore.js        # Zustand auth store
│   │
│   ├── styles/
│   │   └── globals.css         # Global styles & neomorphism theme
│   │
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # React entry point
│   └── ProtectedRoute.jsx       # Route protection wrapper
│
├── public/
│   └── index.html              # HTML entry point
│
├── .env.example                # Environment variables template
├── vite.config.js              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## Installation

### Prerequisites

- Node.js 16+ and npm 7+
- Backend server running at `http://localhost:8000`

### Setup

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment Variables**

```bash
cp .env.example .env
```

Edit `.env` with your backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME='Smart Attendance Admin'
VITE_DEBUG=false
```

3. **Start Development Server**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build & Deployment

### Production Build

```bash
npm run build
```

Creates optimized bundle in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Docker Deployment

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## API Integration

All API endpoints are pre-configured and mapped to the backend:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh-token` - Token refresh

### Users
- `GET /users/me` - Get current user
- `GET /users` - List users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Management
- **Divisions**: `GET, POST, PUT, DELETE /divisions`
- **Locations**: `GET, POST, PUT, DELETE /locations`
- **Timetables**: `GET, POST, PUT, DELETE /timetables`
- **Courses**: `GET, POST, PUT, DELETE /courses`
- **Branches**: `GET, POST, PUT, DELETE /branches`
- **Batches**: `GET, POST, PUT, DELETE /batches`
- **Enrollments**: `GET, POST, PUT, DELETE /enrollments`
- **Access Points**: `GET, POST, DELETE /access-points`

### Reports & Analytics
- `GET /attendance/records` - Get attendance records
- `GET /attendance/analytics` - Get analytics data
- `GET /reports/attendance` - Attendance reports
- `GET /reports/export/csv` - Export as CSV
- `GET /reports/export/pdf` - Export as PDF

## Neomorphism Design System

The dashboard uses a soft neomorphism design with:

- **Light background**: `#e8eef2`
- **Surface colors**: `#f5f7fb` and `#f0f2f8`
- **Primary color**: `#4f46e5` (Indigo)
- **Secondary color**: `#0ea5e9` (Cyan)
- **Soft shadows**: Multiple layers for depth
- **Inset shadows**: For pressed button states
- **Smooth transitions**: 150-300ms animations

All components follow the neomorphism pattern with consistent spacing, typography, and interactive states.

## Usage

### Login
1. Navigate to the login page
2. Enter your credentials
3. Dashboard will load with your permissions

### User Management
1. Go to Management → Users
2. Click "Add User" to create new user
3. Fill in the form and submit
4. Edit or delete existing users from the table

### View Reports
1. Go to Reports → Attendance
2. Select filters (division, date range)
3. Generate report
4. Export as CSV or PDF

### View Analytics
1. Go to Reports → Analytics
2. View attendance trends and division comparisons
3. Charts update in real-time

## Features in Detail

### Authentication
- Secure JWT-based authentication
- Automatic token refresh
- Token blacklisting on logout
- Password recovery flow

### State Management
- Zustand for auth state with persistence
- React Query for server state and caching
- Automatic error handling and retry logic

### API Client
- Axios with request/response interceptors
- Automatic JWT header injection
- Token refresh on 401 responses
- Centralized error handling

### UI Components
- **Button**: Primary, secondary, success, danger, warning variants
- **Input**: Text, email, password, number inputs with validation
- **Select**: Dropdown selections with options
- **Card**: Container with header, body, footer sections
- **Table**: Data grid with pagination
- **Modal**: Dialog for forms and confirmations
- **Alert**: Info, success, warning, error notifications
- **Loading**: Spinner and loading states

## Performance Optimizations

- **Code Splitting**: Automatic chunk splitting for vendor libraries
- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Compressed assets
- **Caching**: React Query with 5-minute stale time
- **Minification**: Gzip compression in production
- **Tree Shaking**: Unused code removal

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Android Chrome)

## Development

### Code Style
- ESLint configuration included
- Prettier for code formatting
- Follow established patterns in existing components

### Testing (Future)
```bash
npm run test      # Run unit tests
npm run test:e2e  # Run E2E tests
```

### Debugging
- Redux DevTools for state inspection
- Network tab for API calls
- React DevTools browser extension recommended

## Environment Variables

```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:8000

# App metadata
VITE_APP_NAME='Smart Attendance Admin'
VITE_APP_DESCRIPTION='Admin Dashboard for Smart Attendance System'

# Debug mode
VITE_DEBUG=false
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running
   - Check VITE_API_BASE_URL in .env
   - Verify backend has CORS enabled

2. **Login Failures**
   - Check backend authentication endpoints
   - Verify credentials in database
   - Clear browser localStorage and retry

3. **Token Expiry**
   - Automatic refresh is handled by interceptors
   - Manual re-login if refresh fails

4. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear cache: `npm run build -- --reset-cache`

## Contributing

1. Create a feature branch
2. Make changes following the project structure
3. Test thoroughly
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with reproduction steps
3. Contact the development team

---

**Last Updated**: February 14, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
