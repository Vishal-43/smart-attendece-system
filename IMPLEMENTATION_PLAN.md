# Smart Attendance System — Implementation Plan

**Date**: March 10, 2026
**Scope**: Complete remaining features, modernize UI for LMS-grade experience, implement dark/light mode, comprehensive testing
**Priority Levels**: P0 (Blocker), P1 (Critical), P2 (Important), P3 (Nice-to-have)

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Phase 1 — Backend Hardening & Missing APIs](#2-phase-1--backend-hardening--missing-apis)
3. [Phase 2 — Web UI Modernization (Dark/Light LMS Design)](#3-phase-2--web-ui-modernization-darklight-lms-design)
4. [Phase 3 — Mobile UI Overhaul (Dark/Light LMS Design)](#4-phase-3--mobile-ui-overhaul-darklight-lms-design)
5. [Phase 4 — Feature Completion](#5-phase-4--feature-completion)
6. [Phase 5 — Comprehensive Testing](#6-phase-5--comprehensive-testing)
7. [Phase 6 — DevOps & Deployment](#7-phase-6--devops--deployment)
8. [Design System Specification](#8-design-system-specification)
9. [File-by-File Change Map](#9-file-by-file-change-map)
10. [Dependency Additions](#10-dependency-additions)
11. [Risk Assessment](#11-risk-assessment)

---

## 1. Current State Summary

### What's Working

| Layer | Completion | Notes |
|-------|-----------|-------|
| **Backend (FastAPI)** | ~95% | All CRUD, auth, attendance, QR/OTP, reports fully working. 52 tests passing. |
| **Web (React/Vite)** | ~85% | All pages exist. Dashboard + management + reports using real APIs. Glass UI components built but **not integrated** into pages. ThemeContext + ThemeToggle exist but pages use old CSS variables. |
| **Mobile (Flutter)** | ~90% | Login, dashboard, QR/OTP, attendance marking, history working. Dark theme defined in `AppTheme.dark()` but many screens use hardcoded colors. |

### Critical Gaps Identified

| # | Gap | Layer | Impact |
|---|-----|-------|--------|
| 1 | Glass UI components exist (`web/src/components/ui/`) but **zero pages use them** — all pages still use old `Common/` components | Web | Full UI migration needed |
| 2 | ThemeContext exists and toggles `data-theme` but page CSS doesn't respond to theme variables | Web | Dark mode broken |
| 3 | Mobile has `AppTheme.dark()` but screens hardcode `Colors.white`, `Color(0xFF...)` instead of using `Theme.of(context)` | Mobile | Dark mode inconsistent |
| 4 | No web test framework configured (vitest not in devDependencies, 3 test stubs exist) | Web | Zero test coverage |
| 5 | Settings/Profile pages are functional but minimal — no notification prefs, enrollment display, theme selector | Web + Mobile | Incomplete user experience |
| 6 | Mobile missing: course management, analytics, reports, notifications | Mobile | Feature parity gap |
| 7 | No WebSocket/real-time attendance updates | All | Teachers can't see live marks |
| 8 | No offline support on mobile | Mobile | Field reliability |

---

## 2. Phase 1 — Backend Hardening & Missing APIs

**Priority**: P0-P1
**Estimated Scope**: 12 endpoint changes, 3 new middleware, 1 migration

### 2.1 Environment & Security Fixes (P0)

| Task | File(s) | Details |
|------|---------|---------|
| Move DATABASE_URL to .env only | `app/database/database.py` | Already reads from env via `os.getenv("DATABASE_URL")` — verify `.env.example` exists with template values. Remove any inline fallback URL. |
| Add `.env.example` template | Root | Create template with all required env vars (DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS, etc.) without real values |
| Add rate limiting middleware | `app/main.py` | Add `slowapi` rate limiter: 60 req/min for auth, 120 req/min for general, 30 req/min for QR/OTP generation |
| Add request logging middleware | `app/main.py` | Structured JSON logging with request ID correlation, duration, status code. Use `structlog` or `python-json-logger` |
| CORS — tighten for production | `app/main.py` | Current: reads `ALLOWED_ORIGINS` env var — good. Add validation that origins are proper URLs. |

### 2.2 Missing API Endpoints (P1)

| Endpoint | File | Details |
|----------|------|---------|
| `PUT /api/v1/users/{id}/password` | `app/routers/users.py` | Accept `{old_password, new_password}`. Verify old password, hash new. Web already calls this. |
| `GET /api/v1/auth/me` | `app/routers/auth.py` | Return current user profile from JWT. Web `endpoints.js` calls `authAPI.getMe()`. |
| `POST /api/v1/auth/register` | `app/routers/auth.py` | Verify this exists. Web `endpoints.js` calls `authAPI.register()`. |
| `POST /api/v1/auth/logout` | `app/routers/auth.py` | Token blacklisting or no-op. Web calls `authAPI.logout()`. |
| `POST /api/v1/auth/forgot-password` | `app/routers/auth.py` | Email-based reset token generation (can be stub with console output for dev). |
| `POST /api/v1/auth/reset-password` | `app/routers/auth.py` | Accept `{token, new_password}`. Validate token, set new password. |
| `GET /api/v1/timetables/today` | `app/routers/timetable.py` | Return today's timetable entries for current user. Mobile needs this. |
| `GET /api/v1/timetables/my-schedule` | `app/routers/timetable.py` | Return full schedule for current user based on enrollments. |
| `GET /api/v1/dashboard/stats` | `app/routers/dashboard.py` | Already exists ✅. Verify it returns `total_students`, `active_sessions` for admin view. |
| `GET /api/v1/reports/division-attendance` | `app/routers/reports.py` | Already exists ✅. Verify response shape matches web expectations. |
| `GET /api/v1/notifications/` | New: `app/routers/notifications.py` | In-app notification list for user. Returns paginated list. |
| `PUT /api/v1/notifications/{id}/read` | New: `app/routers/notifications.py` | Mark notification as read. |

### 2.3 Database Changes (P1)

| Change | Details |
|--------|---------|
| Add `notifications` table | Columns: `id`, `user_id`, `title`, `message`, `type` (info/warning/success), `is_read`, `created_at`. Alembic migration. |
| Add `password_reset_tokens` table | Columns: `id`, `user_id`, `token` (hashed), `expires_at`, `used_at`. For forgot/reset password flow. |
| Add `user_preferences` table | Columns: `id`, `user_id`, `theme` (light/dark/system), `notification_email` (bool), `language` (en/hi). |

### 2.4 WebSocket Support (P2)

| Task | Details |
|------|---------|
| Add `/ws/attendance/{timetable_id}` | WebSocket endpoint using `fastapi.WebSocket`. Broadcasts new attendance marks to connected teachers for real-time session view. |
| Dependencies | `websockets` already in requirements.txt — just need to implement the endpoint. |

---

## 3. Phase 2 — Web UI Modernization (Dark/Light LMS Design)

**Priority**: P0
**Scope**: Migrate ALL pages from old `Common/` components to `ui/Glass*` components. Rebuild layout. Add full dark/light theme support.

### 3.1 Design Philosophy

The target is a **modern LMS (Learning Management System)** interface:
- Clean, spacious layouts with generous whitespace
- Glassmorphism cards with subtle backdrop blur
- Smooth transitions between dark and light modes
- Professional color palette (indigo/violet primary, cool grays)
- Data-dense tables with good readability
- Responsive down to tablet (1024px) minimum
- Consistent iconography using Lucide React

### 3.2 Design System Migration — Component Map

**Current** → **Target** replacement map:

| Old Component (`Common/`) | New Component (`ui/`) | Status |
|---------------------------|----------------------|--------|
| `Card`, `CardHeader`, `CardBody` | `GlassCard` (with `title`, `subtitle`, `header`, `footer` props) | Glass component exists ✅, needs integration |
| `Button` | `GlassButton` | Glass component exists ✅, needs integration |
| `Input` | `GlassInput`, `GlassSelect`, `GlassTextarea` | Glass component exists ✅, needs integration |
| `Modal` | `GlassModal` | Glass component exists ✅, needs integration |
| `ConfirmModal` | `ConfirmModal` (from `GlassModal`) | Glass component exists ✅, needs integration |
| `DataTable` | `GlassTable` | Glass component exists ✅, needs integration |
| `Alert` | New: `GlassAlert` | **Needs creation** |
| `Loading` | New: `GlassLoading` / skeleton loader | **Needs creation** |
| `Table` | `GlassTable` | Glass component exists ✅ |
| `Sidebar` (Layout) | `GlassSidebar` or rebuilt Sidebar using glass variables | Glass component exists ✅, needs Layout integration |
| `Header` (Layout) | `GlassNavbar` or rebuilt Header using glass variables | Glass component exists ✅, needs Layout integration |

### 3.3 New Components to Create

| Component | File | Description |
|-----------|------|-------------|
| `GlassAlert` | `web/src/components/ui/GlassAlert.jsx` | Status alert banners (info, success, warning, error) with glass styling |
| `GlassLoading` | `web/src/components/ui/GlassLoading.jsx` | Skeleton loaders + spinner with glass backdrop |
| `GlassBreadcrumb` | `web/src/components/ui/GlassBreadcrumb.jsx` | Page navigation breadcrumbs |
| `GlassAvatar` | `web/src/components/ui/GlassAvatar.jsx` | User avatar with initials fallback |
| `GlassDropdown` | `web/src/components/ui/GlassDropdown.jsx` | Dropdown menu (for header user menu, filter selects) |
| `GlassStats` | `web/src/components/ui/GlassStats.jsx` | Dashboard stat cards (refactored from `StatCard`) |
| `GlassEmptyState` | `web/src/components/ui/GlassEmptyState.jsx` | Empty state illustrations for tables/lists with CTA |
| `GlassTooltip` | `web/src/components/ui/GlassTooltip.jsx` | Info tooltips for data fields |
| `GlassTabs` | `web/src/components/ui/GlassTabs.jsx` | Tab navigation component for multi-section pages |
| `GlassDatePicker` | `web/src/components/ui/GlassDatePicker.jsx` | Date/range picker with glass styling |
| `GlassChip` | `web/src/components/ui/GlassChip.jsx` | Status chips/badges (present, absent, late, active, inactive) |

### 3.4 Layout Rebuild

#### Current Layout Structure
```
Layout.jsx → Sidebar + Header + Outlet
```

#### Target Layout Structure
```
GlassLayout.jsx
├── GlassSidebar (collapsible, glass background, smooth animations)
│   ├── Logo + App name
│   ├── Navigation items with icons
│   ├── Collapsible submenu groups
│   └── User info / logout at bottom
├── Main area
│   ├── GlassHeader (breadcrumb, search, theme toggle, notifications, user menu)
│   └── Content area (Outlet with padding)
```

**Files to modify/create**:

| File | Action | Details |
|------|--------|---------|
| `components/Layout/Layout.jsx` | **Rewrite** | Use glass CSS variables everywhere. Add `data-theme` aware styling. |
| `components/Layout/Layout.css` | **Rewrite** | Replace all hardcoded colors with `var(--glass-*)` tokens. Add dark mode selectors. |
| `components/Layout/Sidebar.jsx` | **Rewrite** | Collapsible glass sidebar. Icons + labels. Animated expand/collapse. Active state indicators. Role-based menu items. |
| `components/Layout/Sidebar.css` | **Rewrite** | Glass background, blur, border. Dark/light via CSS variables. |
| `components/Layout/Header.jsx` | **Rewrite** | Glass header bar. Breadcrumb + search + theme toggle + notification bell + user dropdown. |
| `components/Layout/Header.css` | **Rewrite** | Glass styling. Responsive. |

### 3.5 Page-by-Page Migration Plan

Each page migration follows this pattern:
1. Replace `import { Card, CardHeader, ... } from '../../components/Common'` → `import { GlassCard, GlassButton, ... } from '../../components/ui'`
2. Replace JSX elements with Glass equivalents
3. Replace page CSS to use `var(--glass-*)` variables
4. Add responsive breakpoints
5. Test in both light and dark mode

#### Auth Pages

| Page | File | Migration Tasks |
|------|------|----------------|
| Login | `pages/Auth/LoginPage.jsx` | Replace form inputs → `GlassInput`. Replace buttons → `GlassButton`. Split page: left panel (branding/illustration), right panel (form). Glass card for form container. Add "Remember me" checkbox. |
| Register | `pages/Auth/RegisterPage.jsx` | Same as Login. Multi-step form: step 1 (name, email), step 2 (role, password). Progress indicator. |
| Forgot Password | `pages/Auth/ForgotPasswordPage.jsx` | Glass card centered. GlassInput for email. Success state message. |
| Reset Password | `pages/Auth/ResetPasswordPage.jsx` | Glass card centered. Password + confirm fields. Validation feedback. |
| `Auth.css` | `pages/Auth/Auth.css` | Full rewrite with glass variables. Split layout for desktop. Centered for mobile. Gradient background. |

#### Dashboard

| Page | File | Migration Tasks |
|------|------|----------------|
| Dashboard | `pages/Dashboard/DashboardPage.jsx` | Replace stat cards → `StatCard` from Glass UI (already has change%, icon). Replace chart containers → `GlassCard`. Add quick actions section. Add recent activity feed. Add "Today's Schedule" section. Role-based dashboard content (admin sees users/sessions, teacher sees their classes, student sees their attendance). |
| `Dashboard.css` | `pages/Dashboard/Dashboard.css` | Glass variable migration. Grid layout responsive. Stat card grid. |

#### Management Pages (10 pages)

**Common pattern for all CRUD pages:**
1. Page header with title + description + "Create New" button (`GlassButton`)
2. Filter bar with `GlassInput` search + `GlassSelect` filters
3. `GlassTable` with sortable columns, pagination, row actions
4. Create/Edit modal using `GlassModal` + `GlassInput` form fields
5. Delete confirmation using `ConfirmModal`
6. Empty state using `GlassEmptyState`
7. Loading state using skeleton loaders

| Page | File | Extra Migration Notes |
|------|------|-----------------------|
| Users | `UsersPage.jsx` | Add role badge (GlassChip). Add avatar column. Filter by role dropdown. |
| Divisions | `DivisionsPage.jsx` | Show student count. Link to timetable. |
| Courses | `CoursesPage.jsx` | Show enrollment count. Course code badge. |
| Branches | `BranchesPage.jsx` | Show division count. Tree hierarchy view. |
| Batches | `BatchesPage.jsx` | Year range display. Active/archived filter. |
| Timetables | `TimetablesPage.jsx` | Calendar view option. Color-coded by course. Time slot display. |
| Locations | `LocationsPage.jsx` | Show lat/lng with map preview (Leaflet). Radius visualization. |
| Enrollments | `EnrollmentsPage.jsx` | Student picker with search. Bulk enroll option. Status chips. |
| Access Points | `AccessPointsPage.jsx` | WiFi SSID/BSSID display. Connection status indicator. |
| QR/OTP | `QrOtpManagement.jsx` | Timetable selector → GlassSelect. QR display in GlassCard with timer ring. OTP display with large font + copy button. Countdown progress bar. Tabs for QR vs OTP. |
| `Management.css` | `Management.css` | Full rewrite with glass variables. Common CRUD layout styles. |

#### Report Pages

| Page | File | Migration Tasks |
|------|------|-----------------------|
| Attendance Reports | `AttendanceReportsPage.jsx` | Glass filter bar (date range, division, course). GlassTable for records. Export CSV GlassButton. Summary cards at top. |
| Student Report | `StudentReportPage.jsx` | Student profile header. Per-course attendance cards. Trend chart in GlassCard. |
| Class Report | `ClassReportPage.jsx` | Session header. Student list with status chips. Summary pie chart. |
| Analytics | `AnalyticsPage.jsx` | Replace inline styles with Glass cards. Charts in GlassCard containers. KPI stat cards at top. Remove `Math.random()` — use real division data (already fixed to use API). |
| `Reports.css` | `Reports.css` | Glass variable migration. Chart container sizing. Responsive grid. |

#### Settings & Profile

| Page | File | Migration Tasks |
|------|------|-----------------------|
| Settings | `SettingsPage.jsx` | Already has password change — wrap in GlassCard. Add sections: Appearance (theme selector), Notifications (email toggle), Account (password change). Use GlassTabs for sections. |
| Profile | `ProfilePage.jsx` | Already has profile edit — wrap in GlassCard. Add avatar upload area. Show role, joined date, enrollment info. Read-only fields for role/id. |
| `Settings.css` | `Settings.css` | Glass variable migration. Tab layout. Section spacing. |

### 3.6 CSS Architecture Changes

#### Current State
- `styles/variables.css` — Old CSS custom properties (hardcoded light-only colors)
- `styles/theme.css` — Glass theme with `[data-theme="light"]` and `[data-theme="dark"]` selectors (exists but underutilized)
- `styles/globals.css` — Base reset
- Per-component CSS files use old `var(--color-*)` variables

#### Target State
- **Keep** `styles/theme.css` as the single source of truth for all color tokens
- **Deprecate** `styles/variables.css` — migrate all `var(--color-*)` references to `var(--glass-*)` tokens
- **Keep** `styles/globals.css` — update base colors to use `var(--glass-*)` tokens
- **All page/component CSS** must use only `var(--glass-*)` tokens — never hardcoded colors
- **Add** CSS transition on `background-color`, `color`, `border-color` for smooth theme switching

#### Migration Checklist for Every CSS File
```
1. Replace var(--color-primary) → var(--glass-accent)
2. Replace var(--color-bg) → var(--glass-bg-primary)
3. Replace var(--color-surface) → var(--glass-bg-secondary) or var(--glass-panel-bg)
4. Replace var(--color-text) → var(--glass-text-primary)
5. Replace var(--color-text-secondary) → var(--glass-text-secondary)
6. Replace var(--color-border) → var(--glass-panel-border)
7. Replace var(--color-success/warning/error/info) → var(--glass-success/warning/error/info)
8. Replace any hardcoded hex colors → appropriate var(--glass-*) token
9. Add backdrop-filter: var(--glass-blur) to card/panel backgrounds
10. Add transition: var(--glass-transition) to themed elements
```

---

## 4. Phase 3 — Mobile UI Overhaul (Dark/Light LMS Design)

**Priority**: P0-P1
**Scope**: Full theme-aware redesign of all mobile screens

### 4.1 Theme System Enhancement

The mobile app already has `AppTheme.light()` and `AppTheme.dark()` with `themeMode: ThemeMode.system`. The issue is that **individual screens hardcode colors** instead of reading from `Theme.of(context)`.

#### Task: Systematic Color Fix

**Rule**: Every screen must use ONLY these patterns:
```dart
// DO:
Theme.of(context).colorScheme.primary
Theme.of(context).colorScheme.surface
Theme.of(context).colorScheme.onSurface
Theme.of(context).scaffoldBackgroundColor
Theme.of(context).cardTheme.color

// DON'T:
Colors.white
Color(0xFF2D3243)
AppColors.background  // Only acceptable in theme definitions
```

| Screen | File | Color Hardcodings to Fix |
|--------|------|--------------------------|
| Login | `screens/login/login.dart` | Replace all `Color(0xFF...)` with `Theme.of(context).colorScheme.*` |
| Dashboard | `screens/dashboard/dashboard_screen.dart` | Replace `TextStyle(fontSize: 20, ...)` with `Theme.of(context).textTheme.*`. Replace `Colors.white` references. |
| QR/OTP Management | `screens/qr_otp/teacher_qr_otp_management_screen.dart` | Use theme colors for countdown timer, buttons |
| Student Session Select | `screens/attendance/student_select_session_screen.dart` | Use theme for list tiles, cards |
| Mark Attendance | `screens/attendance/student_mark_attendance_screen.dart` | Use theme for tab bar, scanner overlay |
| Attendance History | `features/attendance/attendance_history_screen.dart` | Use theme for list items, status colors |
| User Management | `screens/admin/user_management_screen.dart` | Use theme throughout |
| User Edit | `screens/admin/user_edit_screen.dart` | Use theme throughout |

### 4.2 New Screens to Build

| Screen | File | Description |
|--------|------|-------------|
| **Attendance Analytics** | `screens/analytics/analytics_screen.dart` | Charts showing personal/class attendance trends. Calls `/reports/attendance-summary` and `/reports/student/{id}`. |
| **Course List** | `screens/courses/course_list_screen.dart` | View enrolled courses (students) or taught courses (teachers). Calls `/courses/`. |
| **Notifications** | `screens/notifications/notification_screen.dart` | In-app notification list. Calls `/notifications/`. Badge on dashboard. |
| **Profile** | `screens/profile/profile_screen.dart` | View/edit profile. Avatar, email, role display. Theme preference toggle. |
| **Settings** | `screens/settings/settings_screen.dart` | Theme toggle (light/dark/system), notification prefs, backend URL config, about/version info. |
| **Today's Schedule** | `screens/schedule/schedule_screen.dart` | Today's timetable entries. Quick action to mark attendance. |

### 4.3 Navigation Overhaul

**Current**: Simple `Navigator.push` from dashboard buttons
**Target**: Bottom navigation bar with role-based tabs

#### Student Navigation (Bottom Nav Bar)
```
[Home] [Schedule] [Attendance] [History] [Profile]
```

#### Teacher Navigation (Bottom Nav Bar)
```
[Home] [Schedule] [QR/OTP] [Reports] [Profile]
```

#### Admin Navigation (Bottom Nav Bar)
```
[Home] [Users] [Schedule] [Reports] [Settings]
```

**Implementation**:
| File | Action |
|------|--------|
| `lib/main.dart` | Add route for bottom nav shell |
| `lib/screens/shell/app_shell.dart` | **New**: Scaffold with `BottomNavigationBar` that switches content based on role |
| `lib/widgets/bottom_nav.dart` | **New**: Custom bottom nav bar widget with icon + label, glass-styled |
| Update all screen navigations to work within shell tab structure |

### 4.4 Mobile Design Components to Create

| Widget | File | Description |
|--------|------|-------------|
| `AttendanceCard` | `lib/widgets/attendance_card.dart` | Reusable card showing date, course, status chip, time |
| `StatCard` | `lib/widgets/stat_card.dart` | Dashboard stat cards with icon, value, label, trend |
| `StatusChip` | `lib/widgets/status_chip.dart` | Present (green), Absent (red), Late (amber) chips |
| `GlassCard` | `lib/widgets/glass_card.dart` | Glassmorphism-style card using `BackdropFilter` + `ClipRRect` |
| `EmptyState` | `lib/widgets/empty_state.dart` | Icon + message + CTA button for empty lists |
| `SectionHeader` | `lib/widgets/section_header.dart` | Section title with optional "See All" action |
| `LoadingSkeleton` | `lib/widgets/loading_skeleton.dart` | Shimmer loading placeholders |
| `NotificationBadge` | `lib/widgets/notification_badge.dart` | Red dot badge for unread notifications |

### 4.5 Add `provider` Package for State Management

**Current**: Each screen manages its own state via `StatefulWidget` + direct service calls
**Target**: Use `provider` (or existing Flutter patterns) for:
- Current user/role (avoid re-fetching on every screen)
- Theme preference
- Notification count
- Cached timetable data

Add to `pubspec.yaml`:
```yaml
dependencies:
  provider: ^6.1.2
```

---

## 5. Phase 4 — Feature Completion

**Priority**: P1-P2

### 5.1 Real-Time Attendance Updates (P2)

| Layer | Implementation |
|-------|---------------|
| **Backend** | WebSocket endpoint at `/ws/attendance/{timetable_id}`. On each `POST /attendance/mark`, broadcast to all connected clients on that timetable's channel. |
| **Web** | In `ClassReportPage.jsx` and `QrOtpManagement.jsx`: connect to WebSocket, append new attendance marks to the list in real-time. Show toast on new mark. |
| **Mobile** | In `teacher_qr_otp_management_screen.dart`: WebSocket listener showing live count of students marked. Sound/vibration on new entry. |

### 5.2 Offline Attendance (Mobile) (P3)

| Task | Details |
|------|---------|
| Add local SQLite | Use `sqflite` package. Create `pending_attendance` table. |
| Queue mechanism | When no connectivity, store attendance mark locally. |
| Sync on reconnect | Background sync via `connectivity_plus` listener. |
| UI indicator | Show "pending sync" badge on attendance marks not yet synced. |

### 5.3 Notification System (P2)

| Task | Layer | Details |
|------|-------|---------|
| Notification model | Backend | `notifications` table + Pydantic schema + CRUD router |
| Trigger notifications | Backend | On attendance mark → notify teacher. On QR/OTP expire → notify teacher. On enrollment → notify student. |
| Notification API | Backend | `GET /notifications/`, `PUT /notifications/{id}/read`, `GET /notifications/unread-count` |
| Notification bell | Web | Badge count in header. Dropdown list. Mark as read. |
| Notification screen | Mobile | Full screen list. Pull to refresh. Tap to navigate. |

### 5.4 Role-Based Dashboard Enhancement (P1)

| Role | Web Dashboard | Mobile Dashboard |
|------|---------------|-----------------|
| **Admin** | Total users, active sessions, today's attendance rate, 7-day trend, recent activity log, quick links (manage users, generate reports) | Same data simplified. Quick action buttons. |
| **Teacher** | My classes today, current QR/OTP status, students marked per session, attendance rates for my courses | Today's classes. Generate QR/OTP button. Live count. |
| **Student** | My attendance rate, upcoming classes, recent attendance records, course-wise breakdown | Today's schedule. Mark attendance button. History preview. |

Implementation:
- Backend: Enhance `GET /api/v1/dashboard/stats` to return role-appropriate data (already partially done)
- Web: Conditional rendering in `DashboardPage.jsx` based on `user.role`
- Mobile: Conditional rendering in `DashboardScreen` based on `_role`

### 5.5 Profile & Settings Completion (P1)

| Feature | Web File | Mobile File | Backend |
|---------|----------|-------------|---------|
| View/edit profile | `ProfilePage.jsx` (exists) | `profile_screen.dart` (new) | `GET /auth/me`, `PUT /users/{id}` (exists) |
| Change password | `SettingsPage.jsx` (exists) | `settings_screen.dart` (new) | `PUT /users/{id}/password` (needs creation) |
| Theme preference | `SettingsPage.jsx` (add section) | `settings_screen.dart` (new) | `PUT /users/{id}/preferences` (new) |
| Notification prefs | `SettingsPage.jsx` (add section) | `settings_screen.dart` (new) | `PUT /users/{id}/preferences` (new) |

---

## 6. Phase 5 — Comprehensive Testing

**Priority**: P1

### 6.1 Backend Tests (Extend Existing)

**Current**: 52 tests in 4 files. All passing.

| Test File | New Tests to Add | Count |
|-----------|-----------------|-------|
| `test_auth.py` | Register, forgot-password, reset-password, logout, get-me | +8 |
| `test_attendance.py` | WebSocket broadcast, concurrent marking, edge cases | +5 |
| `test_dashboard.py` | **New file**: Dashboard stats for each role, empty data, date range | +6 |
| `test_notifications.py` | **New file**: CRUD, mark read, unread count, auto-creation triggers | +8 |
| `test_users.py` | **New file**: Password change, profile update, preferences | +6 |
| `test_timetable.py` | **New file**: Today's schedule, my-schedule, filtering | +5 |

**Total new**: ~38 tests → Goal: **90+ total backend tests**

### 6.2 Web Tests (New Test Suite)

**Setup Required**:
1. Add to `package.json` devDependencies:
   ```json
   "vitest": "^1.6.0",
   "@testing-library/react": "^14.2.0",
   "@testing-library/jest-dom": "^6.4.0",
   "@testing-library/user-event": "^14.5.0",
   "jsdom": "^24.0.0",
   "msw": "^2.2.0"
   ```
2. Add `vitest.config.js` with jsdom environment
3. Add to `package.json` scripts: `"test": "vitest", "test:coverage": "vitest --coverage"`
4. Existing test stubs in `src/tests/` can be expanded

| Test Category | Files | Tests | Description |
|---------------|-------|-------|-------------|
| **Auth flows** | `tests/auth.test.jsx` (expand) | 8 | Login success/failure, register, forgot password, logout, token refresh |
| **Dashboard** | `tests/dashboard.test.jsx` (expand) | 6 | Stats rendering, chart data, role-based content, loading state, error state |
| **CRUD Pages** | `tests/management/*.test.jsx` | 30 | For each of 10 pages: renders, create modal, edit, delete confirm, search/filter, pagination, empty state |
| **Reports** | `tests/reports/*.test.jsx` | 10 | Filter application, chart rendering, CSV export, empty data handling |
| **Settings** | `tests/settings.test.jsx` | 5 | Password change validation, profile edit, theme toggle |
| **Components** | `tests/components/*.test.jsx` | 15 | GlassCard, GlassButton, GlassInput, GlassModal, GlassTable, ThemeToggle |
| **Hooks** | `tests/hooks/*.test.jsx` | 10 | useLogin, useUsers, useAttendanceSummary, etc. with MSW mocking |
| **Integration** | `tests/integration/*.test.jsx` | 5 | Full login → dashboard → management flow |

**Total**: ~89 web tests → Goal: **80%+ code coverage**

### 6.3 Mobile Tests (Extend Existing)

**Current**: 5 test files with ~40 test cases

| Test File | New Tests | Description |
|-----------|-----------|-------------|
| `services/auth_service_test.dart` | **New**: 6 tests | Login, token storage, refresh, logout |
| `services/admin_service_test.dart` | **New**: 5 tests | Fetch users, delete user, update user |
| `screens/login_test.dart` | **New**: 4 tests | Form validation, API call, error handling, navigation |
| `screens/analytics_screen_test.dart` | **New**: 4 tests | Chart rendering, data loading, empty state |
| `screens/profile_screen_test.dart` | **New**: 3 tests | Profile display, edit mode, save |
| `screens/settings_screen_test.dart` | **New**: 4 tests | Theme toggle, notification prefs, password change |
| `widgets/glass_card_test.dart` | **New**: 3 tests | Renders, theme-aware, tap handling |
| `widgets/stat_card_test.dart` | **New**: 3 tests | Value display, trend arrow, color |

**Total new**: ~32 tests → Goal: **72+ total mobile tests**

### 6.4 End-to-End Tests (P3)

| Tool | Scope |
|------|-------|
| **Playwright** (web) | Login → Dashboard → Create user → Generate QR → Export CSV |
| **Integration test** (Flutter) | Login → Dashboard → Select session → Mark attendance |

---

## 7. Phase 6 — DevOps & Deployment

**Priority**: P2

### 7.1 Docker Compose Fixes

| File | Changes |
|------|---------|
| `docker-compose.yml` | Already has db + backend + web ✅. Add healthchecks for backend and web. Add `restart: unless-stopped` for web. |
| `docker-compose.dev.yml` | Already has all services. Remove `version: '3.9'` (deprecated). Ensure proper hot-reload for all services. |
| `docker-compose.prod.yml` | Add nginx reverse proxy service. Backend without hot-reload. Web as static build served by nginx. |
| `.env.example` | Create with all required variables and example/default values. |

### 7.2 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/ci.yml`:
```yaml
Steps:
1. Backend: pip install → pytest → type check (mypy)
2. Web: npm install → lint → type-check → vitest → build
3. Mobile: flutter pub get → flutter analyze → flutter test
4. Docker: docker compose build (verify images build)
```

### 7.3 Production Nginx Config

Update `infra/nginx.prod.conf`:
- Serve web frontend static files
- Proxy `/api/v1/*` to backend
- WebSocket upgrade for `/ws/*`
- Gzip compression
- Security headers (CSP, HSTS, X-Frame-Options)

---

## 8. Design System Specification

### 8.1 Color Palette

#### Light Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--glass-bg-primary` | `#f8fafc` | Page background |
| `--glass-bg-secondary` | `#ffffff` | Card/panel fill |
| `--glass-panel-bg` | `rgba(255,255,255,0.6)` | Glass card background |
| `--glass-panel-border` | `rgba(203,213,225,0.3)` | Card borders |
| `--glass-text-primary` | `#0f172a` | Headings, body text |
| `--glass-text-secondary` | `#475569` | Descriptions, muted text |
| `--glass-accent` | `#4f46e5` | Primary buttons, links, active states |
| `--glass-accent-hover` | `#6366f1` | Hover state for primary |
| `--glass-success` | `#10b981` | Present status, success actions |
| `--glass-warning` | `#f59e0b` | Late status, warnings |
| `--glass-error` | `#ef4444` | Absent status, errors |
| `--glass-info` | `#3b82f6` | Info badges, links |

#### Dark Mode
| Token | Value | Usage |
|-------|-------|-------|
| `--glass-bg-primary` | `#0f172a` | Page background |
| `--glass-bg-secondary` | `#1e293b` | Card/panel fill |
| `--glass-panel-bg` | `rgba(255,255,255,0.05)` | Glass card background |
| `--glass-panel-border` | `rgba(255,255,255,0.15)` | Card borders |
| `--glass-text-primary` | `#f1f5f9` | Headings, body text |
| `--glass-text-secondary` | `#cbd5e1` | Descriptions |
| `--glass-accent` | `#6366f1` | Primary (slightly brighter for contrast) |
| `--glass-accent-hover` | `#818cf8` | Hover state |

### 8.2 Typography Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 36px / 2.25rem | 800 | 1.2 | Page titles |
| Heading 1 | 28px / 1.75rem | 700 | 1.3 | Section headers |
| Heading 2 | 22px / 1.375rem | 600 | 1.4 | Card titles |
| Heading 3 | 18px / 1.125rem | 600 | 1.5 | Subsections |
| Body | 15px / 0.9375rem | 400 | 1.6 | Paragraph text |
| Body Small | 13px / 0.8125rem | 400 | 1.5 | Table cells, descriptions |
| Caption | 12px / 0.75rem | 500 | 1.4 | Labels, badges |
| Stat Value | 32px / 2rem | 700 | 1.1 | Dashboard stat numbers |

**Font Stack**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### 8.3 Spacing Scale

```
4px (0.25rem)  — xs  — Icon gaps, tight padding
8px (0.5rem)   — sm  — Input padding, small gaps
12px (0.75rem) — md  — Card padding (mobile), list item padding
16px (1rem)    — lg  — Section gaps, card padding (desktop)
24px (1.5rem)  — xl  — Section margins
32px (2rem)    — 2xl — Page top margins
48px (3rem)    — 3xl — Page section separators
```

### 8.4 Effects

| Effect | CSS | Usage |
|--------|-----|-------|
| Glass blur | `backdrop-filter: blur(16px)` | Cards, modals, sidebar |
| Elevated shadow | `0 8px 32px rgba(15,23,42,0.08)` (light) / `0 8px 32px rgba(0,0,0,0.3)` (dark) | Elevated cards, modals |
| Hover lift | `transform: translateY(-2px)` + shadow increase | Interactive cards |
| Focus ring | `box-shadow: 0 0 0 3px rgba(79,70,229,0.3)` | Inputs, buttons on focus |
| Transition | `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)` | Theme switch, hover states |

### 8.5 Mobile Design Tokens

Map to Flutter's Material 3 `ColorScheme`:

| Material 3 Token | Light Value | Dark Value |
|-------------------|-------------|------------|
| `primary` | `#4C2D8E` (deep purple) | `#7B52C1` |
| `onPrimary` | `#FFFFFF` | `#FFFFFF` |
| `surface` | `#FFFFFF` | `#121826` |
| `onSurface` | `#2D3243` | `#E6EDF3` |
| `scaffoldBackground` | `#F4F5F7` | `#0B1020` |
| `error` | `#EF4444` | `#F87171` |
| `tertiary` (success) | `#10B981` | `#34D399` |

---

## 9. File-by-File Change Map

### Backend — Files to Modify

| File | Type | Changes |
|------|------|---------|
| `app/routers/auth.py` | Modify | Add `/register`, `/me`, `/logout`, `/forgot-password`, `/reset-password` endpoints (verify which already exist) |
| `app/routers/users.py` | Modify | Add `PUT /{id}/password` endpoint |
| `app/routers/timetable.py` | Modify | Add `/today`, `/my-schedule` endpoints |
| `app/routers/notifications.py` | **New** | Full CRUD for notifications |
| `app/database/notifications.py` | **New** | Notification model |
| `app/database/password_reset.py` | **New** | PasswordResetToken model |
| `app/database/user_preferences.py` | **New** | UserPreferences model |
| `app/schemas/notifications.py` | **New** | Pydantic schemas for notifications |
| `app/schemas/user_preferences.py` | **New** | Pydantic schemas for preferences |
| `app/main.py` | Modify | Add rate limiting, request logging, notification router |
| `alembic/versions/xxx_add_notifications.py` | **New** | Migration for notifications table |
| `alembic/versions/xxx_add_preferences.py` | **New** | Migration for preferences table |
| `alembic/versions/xxx_add_password_reset.py` | **New** | Migration for password reset tokens |
| `requirements.txt` | Modify | Add `slowapi`, `python-json-logger` or `structlog` |
| `.env.example` | **New** | Template env file |
| `tests/test_dashboard.py` | **New** | Dashboard stat tests |
| `tests/test_notifications.py` | **New** | Notification CRUD tests |
| `tests/test_users_extended.py` | **New** | Password change, preferences tests |

### Web — Files to Modify

| File | Type | Changes |
|------|------|---------|
| `src/styles/variables.css` | Modify | Deprecation comments, redirect all to `theme.css` |
| `src/styles/globals.css` | Modify | Base styles use `var(--glass-*)` tokens |
| `src/styles/theme.css` | Modify | Verify completeness, add any missing tokens |
| `src/components/Layout/Layout.jsx` | Rewrite | Glass-aware layout structure |
| `src/components/Layout/Layout.css` | Rewrite | Glass variable styling |
| `src/components/Layout/Sidebar.jsx` | Rewrite | Glass sidebar, role-based menu, collapse animation |
| `src/components/Layout/Sidebar.css` | Rewrite | Glass styling |
| `src/components/Layout/Header.jsx` | Rewrite | Glass header, breadcrumb, notifications |
| `src/components/Layout/Header.css` | Rewrite | Glass styling |
| `src/pages/Auth/LoginPage.jsx` | Rewrite | Glass UI components, split layout |
| `src/pages/Auth/RegisterPage.jsx` | Rewrite | Glass UI, multi-step |
| `src/pages/Auth/ForgotPasswordPage.jsx` | Rewrite | Glass UI |
| `src/pages/Auth/ResetPasswordPage.jsx` | Rewrite | Glass UI |
| `src/pages/Auth/Auth.css` | Rewrite | Glass variables |
| `src/pages/Dashboard/DashboardPage.jsx` | Rewrite | Role-based, StatCards, Glass cards |
| `src/pages/Dashboard/Dashboard.css` | Rewrite | Glass variables |
| `src/pages/Management/UsersPage.jsx` | Rewrite | GlassTable, GlassModal, GlassInput |
| `src/pages/Management/DivisionsPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/CoursesPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/BranchesPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/BatchesPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/TimetablesPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/LocationsPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/EnrollmentsPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/AccessPointsPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Management/QrOtpManagement.jsx` | Rewrite | Glass UI migration, tabs |
| `src/pages/Management/Management.css` | Rewrite | Glass variables |
| `src/pages/Reports/AttendanceReportsPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Reports/StudentReportPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Reports/ClassReportPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Reports/AnalyticsPage.jsx` | Rewrite | Glass UI migration |
| `src/pages/Reports/Reports.css` | Rewrite | Glass variables |
| `src/pages/Settings/SettingsPage.jsx` | Rewrite | Tabbed settings with Glass UI |
| `src/pages/Settings/ProfilePage.jsx` | Rewrite | Glass card profile |
| `src/pages/Settings/Settings.css` | Rewrite | Glass variables |
| `src/pages/NotFoundPage.jsx` | Modify | Glass theme |
| `src/pages/NotFoundPage.css` | Modify | Glass variables |
| **New**: `src/components/ui/GlassAlert.jsx` | New | Alert component |
| **New**: `src/components/ui/GlassAlert.module.css` | New | Alert styles |
| **New**: `src/components/ui/GlassLoading.jsx` | New | Loading/skeleton |
| **New**: `src/components/ui/GlassLoading.module.css` | New | Loading styles |
| **New**: `src/components/ui/GlassBreadcrumb.jsx` | New | Breadcrumb nav |
| **New**: `src/components/ui/GlassBreadcrumb.module.css` | New | Breadcrumb styles |
| **New**: `src/components/ui/GlassAvatar.jsx` | New | Avatar |
| **New**: `src/components/ui/GlassAvatar.module.css` | New | Avatar styles |
| **New**: `src/components/ui/GlassDropdown.jsx` | New | Dropdown menu |
| **New**: `src/components/ui/GlassDropdown.module.css` | New | Dropdown styles |
| **New**: `src/components/ui/GlassTabs.jsx` | New | Tab navigation |
| **New**: `src/components/ui/GlassTabs.module.css` | New | Tab styles |
| **New**: `src/components/ui/GlassChip.jsx` | New | Status chips |
| **New**: `src/components/ui/GlassChip.module.css` | New | Chip styles |
| **New**: `src/components/ui/GlassEmptyState.jsx` | New | Empty state |
| **New**: `src/components/ui/GlassEmptyState.module.css` | New | Empty state styles |
| `src/components/ui/index.js` | Modify | Export all new components |
| `package.json` | Modify | Add vitest, testing-library, msw |
| **New**: `vitest.config.js` | New | Test configuration |
| **New**: `src/tests/management/usersPage.test.jsx` | New | Tests |
| **New**: `src/tests/components/*.test.jsx` | New | Component tests |
| **New**: `src/tests/hooks/*.test.jsx` | New | Hook tests |

### Mobile — Files to Modify

| File | Type | Changes |
|------|------|---------|
| `lib/main.dart` | Modify | Add routes for new screens, restructure with shell navigation |
| `lib/core/theme/app_colors.dart` | Modify | Add dark-mode specific colors as `static const` |
| `lib/core/theme/app_theme.dart` | Modify | Complete dark theme with all widget themes |
| `lib/screens/login/login.dart` | Modify | Replace hardcoded colors with `Theme.of(context)` |
| `lib/screens/dashboard/dashboard_screen.dart` | Rewrite | Bottom nav shell, role-based content, stat cards, today's schedule |
| `lib/screens/qr_otp/teacher_qr_otp_management_screen.dart` | Modify | Theme-aware colors |
| `lib/screens/attendance/student_select_session_screen.dart` | Modify | Theme-aware, better card layout |
| `lib/screens/attendance/student_mark_attendance_screen.dart` | Modify | Theme-aware, QR scanner overlay colors |
| `lib/screens/admin/user_management_screen.dart` | Modify | Theme-aware, better list layout |
| `lib/features/attendance/attendance_history_screen.dart` | Modify | Theme-aware, better card layout |
| `lib/features/attendance/attendance_history_card.dart` | Modify | Theme-aware |
| **New**: `lib/screens/shell/app_shell.dart` | New | Bottom navigation shell |
| **New**: `lib/screens/analytics/analytics_screen.dart` | New | Charts (use `fl_chart` package) |
| **New**: `lib/screens/profile/profile_screen.dart` | New | User profile |
| **New**: `lib/screens/settings/settings_screen.dart` | New | App settings |
| **New**: `lib/screens/notifications/notification_screen.dart` | New | Notification list |
| **New**: `lib/screens/schedule/schedule_screen.dart` | New | Today's timetable |
| **New**: `lib/widgets/glass_card.dart` | New | Glassmorphism card widget |
| **New**: `lib/widgets/stat_card.dart` | New | Dashboard stat card |
| **New**: `lib/widgets/status_chip.dart` | New | Status badge |
| **New**: `lib/widgets/empty_state.dart` | New | Empty state widget |
| **New**: `lib/widgets/loading_skeleton.dart` | New | Shimmer loading |
| **New**: `lib/widgets/bottom_nav.dart` | New | Bottom nav bar |
| **New**: `lib/services/notification_service.dart` | New | Notification API service |
| **New**: `lib/services/schedule_service.dart` | New | Schedule API service |
| `pubspec.yaml` | Modify | Add `provider`, `fl_chart`, `connectivity_plus` |
| **New**: `test/services/auth_service_test.dart` | New | Auth service tests |
| **New**: `test/screens/analytics_screen_test.dart` | New | Analytics tests |
| **New**: `test/widgets/glass_card_test.dart` | New | Widget tests |

---

## 10. Dependency Additions

### Backend (`requirements.txt`)

| Package | Version | Purpose |
|---------|---------|---------|
| `slowapi` | `0.1.9` | Rate limiting middleware |
| `structlog` | `24.1.0` | Structured logging |

### Web (`package.json`)

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `vitest` | `^1.6.0` | dev | Test runner |
| `@testing-library/react` | `^14.2.0` | dev | Component testing |
| `@testing-library/jest-dom` | `^6.4.0` | dev | DOM matchers |
| `@testing-library/user-event` | `^14.5.0` | dev | User interaction simulation |
| `jsdom` | `^24.0.0` | dev | DOM environment for tests |
| `msw` | `^2.2.0` | dev | Mock Service Worker for API mocking |
| `@vitest/coverage-v8` | `^1.6.0` | dev | Code coverage |

### Mobile (`pubspec.yaml`)

| Package | Version | Purpose |
|---------|---------|---------|
| `provider` | `^6.1.2` | State management |
| `fl_chart` | `^0.70.0` | Charts for analytics screen |
| `connectivity_plus` | `^6.1.0` | Network connectivity detection |
| `shimmer` | `^3.0.0` | Loading skeleton animation |

---

## 11. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Glass UI migration breaks existing pages | Medium | High | Migrate one page at a time. Keep old `Common/` components until fully migrated. Test each page after migration. |
| Dark mode color contrast issues | High | Medium | Test all pages with accessibility tools (Chrome DevTools contrast checker). Ensure WCAG AA compliance (4.5:1 for text). |
| Mobile hardcoded colors missed during migration | Medium | Medium | Run grep for `Color(0x`, `Colors.`, `AppColors.` in all screen files. Create a lint rule or test that flags hardcoded colors. |
| WebSocket introduces complexity | Low | Medium | Keep WebSocket as optional enhancement. Fall back to polling if WebSocket fails. Implement after all other features are stable. |
| Test framework setup issues | Low | Low | Use exact vitest versions known to work with React 18. Follow official testing-library guides. |
| Too many changes at once destabilize the app | Medium | High | Phase the work strictly. Complete Phase 1 (backend) before Phase 2 (web UI). Complete Phase 2 before Phase 3 (mobile). Test after each phase. |

---

## Execution Order (Recommended)

```
Phase 1: Backend Hardening ──────────→ (P0 items: env, .env.example, missing endpoints)
    │
    ├── 1a. Add missing auth endpoints (register/me/logout/forgot/reset)
    ├── 1b. Add password change endpoint
    ├── 1c. Add timetable today/my-schedule endpoints
    ├── 1d. Add notification model + CRUD
    ├── 1e. Add rate limiting + request logging
    └── 1f. Write new backend tests
    │
Phase 2: Web UI Modernization ──────→ (P0: complete dark/light LMS redesign)
    │
    ├── 2a. Create new Glass components (Alert, Loading, Breadcrumb, Tabs, etc.)
    ├── 2b. Migrate Layout (Sidebar + Header)
    ├── 2c. Migrate Auth pages
    ├── 2d. Migrate Dashboard
    ├── 2e. Migrate Management pages (one at a time)
    ├── 2f. Migrate Report pages
    ├── 2g. Migrate Settings/Profile pages
    ├── 2h. CSS cleanup — remove old variables.css dependencies
    └── 2i. Set up vitest + write web tests
    │
Phase 3: Mobile UI Overhaul ────────→ (P1: theme-aware, new screens, bottom nav)
    │
    ├── 3a. Fix all hardcoded colors in existing screens
    ├── 3b. Create shared widgets (GlassCard, StatCard, StatusChip, etc.)
    ├── 3c. Build bottom navigation shell
    ├── 3d. Build new screens (analytics, profile, settings, notifications, schedule)
    ├── 3e. Add provider for state management
    └── 3f. Write new mobile tests
    │
Phase 4: Feature Completion ────────→ (P2: real-time, notifications, role dashboards)
    │
    ├── 4a. WebSocket endpoint + web/mobile integration
    ├── 4b. Notification triggers and bell UI
    └── 4c. Role-specific dashboard content
    │
Phase 5: DevOps ────────────────────→ (P2: docker, CI/CD, nginx)
    │
    ├── 5a. Fix docker-compose files
    ├── 5b. Create GitHub Actions CI
    └── 5c. Production nginx config
```

---

*End of Implementation Plan*
