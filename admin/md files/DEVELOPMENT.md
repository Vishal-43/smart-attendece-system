# Smart Attendance Admin - Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the dashboard.

## Folder Structure Explanation

### `/api` - API Integration
- **client.js**: Axios client with JWT interceptors
- **endpoints.js**: All API endpoint functions
- **hooks.js**: React Query hooks for data fetching and mutations

### `/components` - Reusable Components
- **Layout**: Main layout components (Header, Sidebar)
- **Common**: Shared UI components (Button, Input, Table, etc.)
- Each component is self-contained with its own CSS

### `/pages` - Page Components
- **Auth**: Login, register, password recovery
- **Dashboard**: Main dashboard with analytics
- **Management**: CRUD pages for system resources
- **Reports**: Attendance reports and analytics
- **Settings**: System and user settings

### `/stores` - State Management
- Zustand stores for global state
- Auth store with persistence

### `/styles` - Global Styles
- **globals.css**: Neomorphism design system
- CSS variables for colors, spacing, typography

## Component Patterns

### Creating a New Page

```jsx
import { Card, CardHeader, CardBody, Button, Input } from '../../components/Common'
import './NewPage.css'

export default function NewPage() {
  return (
    <div className="new-page">
      <div className="new-page__header">
        <h1>Page Title</h1>
        <p>Page description</p>
      </div>

      <Card>
        <CardHeader>
          <h3>Section Title</h3>
        </CardHeader>
        <CardBody>
          {/* Content here */}
        </CardBody>
      </Card>
    </div>
  )
}
```

### Using API Hooks

```jsx
import { useUsers, useCreateUser, useDeleteUser } from '../../api/hooks'

export default function UsersPage() {
  const { data: users, isLoading } = useUsers({ page: 1 })
  const createMutation = useCreateUser()

  const handleCreate = async (data) => {
    await createMutation.mutateAsync(data)
  }

  if (isLoading) return <Loading />

  return (
    <Table columns={columns} data={users?.data?.items || []} />
  )
}
```

### Creating Reusable Components

All components in `/components/Common` follow these patterns:

1. **Props-based configuration**
2. **Multiple variants** (primary, secondary, success, etc.)
3. **Size options** (xs, sm, md, lg)
4. **State management** (loading, disabled, error)
5. **Consistent styling** with neomorphism design

## Styling Guidelines

### Color Variables

```css
/* Primary brand colors */
--neo-primary: #4f46e5
--neo-secondary: #0ea5e9

/* Status colors */
--neo-success: #10b981
--neo-warning: #f59e0b
--neo-error: #ef4444
--neo-info: #3b82f6

/* Surface colors */
--neo-light-surface: #f5f7fb
--neo-light-bg: #e8eef2

/* Text colors */
--neo-light-text: #2c3e50
--neo-light-text-secondary: #546e7a
--neo-light-text-tertiary: #90a4ae
```

### Spacing Scale

```css
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 3rem      /* 48px */
--spacing-3xl: 4rem      /* 64px */
```

### Shadow System

```css
--neo-shadow-sm: 2px 2px 5px rgba(0,0,0,0.1), -2px -2px 5px rgba(255,255,255,0.8)
--neo-shadow-md: 4px 4px 10px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)
--neo-shadow-lg: 8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.8)
--neo-shadow-xl: 12px 12px 24px rgba(0,0,0,0.12), -12px -12px 24px rgba(255,255,255,0.85)
```

## API Integration

### Add New API Endpoint

1. Add to `/api/endpoints.js`:
```jsx
export const newResourceAPI = {
  list: (params) => apiClient.get('/new-resource', { params }),
  create: (data) => apiClient.post('/new-resource', data),
  update: (id, data) => apiClient.put(`/new-resource/${id}`, data),
  delete: (id) => apiClient.delete(`/new-resource/${id}`),
}
```

2. Add hooks in `/api/hooks.js`:
```jsx
export const useNewResource = (params = {}) => {
  return useQuery({
    queryKey: ['new-resource', params],
    queryFn: () => newResourceAPI.list(params),
  })
}

export const useCreateNewResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => newResourceAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['new-resource'] })
      toast.success('Created successfully')
    },
  })
}
```

3. Use in component:
```jsx
const { data, isLoading } = useNewResource()
const createMutation = useCreateNewResource()
```

## Form Handling

### Basic Form Pattern

```jsx
import { useState } from 'react'
import { Input, Button } from '../../components/Common'

export default function FormPage() {
  const [data, setData] = useState({ name: '', email: '' })
  const mutation = useCreateItem()

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await mutation.mutateAsync(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        name="name"
        value={data.name}
        onChange={handleChange}
        required
      />
      <Button type="submit" disabled={mutation.isPending}>
        Submit
      </Button>
    </form>
  )
}
```

## Authentication Flow

1. User logs in via LoginPage
2. Backend returns JWT tokens
3. Tokens stored in Zustand auth store (localStorage)
4. API client automatically adds JWT to headers
5. On token expiry, automatic refresh via interceptor
6. On refresh failure, redirect to login

## Best Practices

1. **Component Organization**: One component per file
2. **Naming**: Use descriptive names (UserForm not Form)
3. **Props**: Validate with TypeScript or prop-types
4. **State**: Use hooks, keep state minimal
5. **API**: Use React Query for server state
6. **Error Handling**: Show user-friendly error messages
7. **Loading**: Always show loading states
8. **Accessibility**: Use semantic HTML, ARIA labels
9. **Performance**: Memoize expensive operations
10. **Testing**: Write tests for critical paths

## Available Scripts

```bash
# Development
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # Check TypeScript types
```

## Debugging Tips

1. **Check Network Tab**: Verify API requests/responses
2. **Console Logs**: Use for debugging state changes
3. **React DevTools**: Inspect component props and state
4. **Redux DevTools**: (If added) Monitor state changes
5. **Breakpoints**: Use browser dev tools for stepping

## Common Issues & Solutions

### Issue: Blank page after login
- Check if backend is running
- Verify API_BASE_URL in .env
- Check browser console for errors

### Issue: API requests failing
- Check CORS settings in backend
- Verify JWT token is valid
- Check 401/403 errors in network tab

### Issue: Slow performance
- Check React DevTools for unnecessary re-renders
- Use React Query dev tools to inspect cache
- Profile with Chrome DevTools Performance tab

## Deployment Checklist

- [ ] Update .env with production URLs
- [ ] Run `npm run build` and test dist folder
- [ ] Test all pages and API integrations
- [ ] Configure backend CORS for production domain
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable analytics
- [ ] Security headers configured
- [ ] SSL certificate installed
- [ ] CDN configured for static assets

---

**For more help, check the main README.md or contact the development team.**
