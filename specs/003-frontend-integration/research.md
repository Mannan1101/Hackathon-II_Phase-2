# Research & Technology Decisions: Frontend & Integration

**Feature**: Frontend & Integration (Spec-3)
**Date**: 2026-01-09
**Phase**: Phase 0 - Research

## Overview

This document captures research findings and technology decisions for the Frontend & Integration feature. All decisions are based on the requirements in [spec.md](./spec.md) and align with the project constitution principles.

## Research Questions & Resolutions

### 1. Next.js App Router vs Pages Router

**Question**: Should we use Next.js App Router or Pages Router for the frontend?

**Research Findings**:
- App Router is the modern Next.js pattern (introduced in Next.js 13+)
- Better performance with React Server Components
- Built-in layouts and nested routing
- File-based routing with intuitive structure
- Pages Router is now in maintenance mode

**Decision**: Use Next.js 16+ App Router

**Rationale**:
- Modern pattern with better performance
- Built-in layout support reduces boilerplate
- File-based routing is intuitive and maintainable
- Aligns with Next.js 16.1.1 already in package.json
- Better developer experience

**Alternatives Considered**:
- Pages Router: Deprecated, less performant
- Custom routing: Unnecessary complexity, reinventing the wheel

### 2. State Management Strategy

**Question**: What state management approach should we use for the frontend?

**Research Findings**:
- Application has simple state requirements (user session, task list)
- No complex shared state across many components
- React hooks (useState, useEffect) are sufficient for local state
- Global state libraries add complexity and bundle size

**Decision**: React hooks for local state, no global state library

**Rationale**:
- Avoid over-engineering for simple requirements
- Reduce bundle size and complexity
- React hooks are native and well-understood
- No need for Redux, Zustand, or Context API for this scope

**Alternatives Considered**:
- Redux: Overkill for simple application, adds boilerplate
- Zustand: Unnecessary for local state management
- Context API: Not needed when state is component-local

### 3. Authentication Integration Pattern

**Question**: How should the frontend integrate with Better Auth?

**Research Findings**:
- Better Auth is already implemented in Spec-2
- JWT tokens stored in httpOnly cookies (XSS protection)
- Better Auth provides client SDK for Next.js
- Token extraction and attachment to API requests needed

**Decision**: Use Better Auth with JWT provider and custom API client

**Rationale**:
- Leverages existing Spec-2 infrastructure
- httpOnly cookies provide XSS protection
- Custom API client gives full control over authentication flow
- Handles 401 errors with automatic redirect to login

**Alternatives Considered**:
- NextAuth.js: Different library, would require backend changes
- Custom auth: Reinventing the wheel, security risks

### 4. API Communication Pattern

**Question**: How should the frontend communicate with the backend API?

**Research Findings**:
- Backend API is RESTful (Spec-1)
- JWT tokens must be attached to Authorization header
- Need to handle 401 errors (token expiration)
- Need to extract JWT from httpOnly cookie

**Decision**: Custom API client using Fetch API with JWT token handling

**Rationale**:
- Full control over authentication flow
- Type-safe with TypeScript
- Handles 401 redirects automatically
- No extra dependencies (Fetch API is native)

**Alternatives Considered**:
- Axios: Extra dependency, not needed for simple use case
- Manual fetch calls: Less DRY, error-prone

### 5. Form Validation Approach

**Question**: Should we use client-side, server-side, or both for form validation?

**Research Findings**:
- Client-side validation provides immediate feedback (better UX)
- Server-side validation is security-critical (backend already has it)
- HTML5 validation is built-in and accessible
- Custom JavaScript validation for complex rules

**Decision**: Client-side validation with HTML5 + custom JavaScript

**Rationale**:
- Immediate feedback improves UX
- Reduces server load (fewer invalid requests)
- Backend already validates (defense in depth)
- No validation library needed for simple forms

**Alternatives Considered**:
- Server-side only: Poor UX, slow feedback
- Validation library (Zod, Yup): Overkill for simple forms

### 6. Styling Strategy

**Question**: What CSS approach should we use for styling?

**Research Findings**:
- Tailwind CSS is already in package.json
- Utility-first approach enables rapid development
- Built-in responsive design utilities
- No custom CSS needed for simple UI

**Decision**: Tailwind CSS utility classes

**Rationale**:
- Already configured in project
- Rapid development with utility classes
- Responsive design utilities built-in
- No runtime overhead (unlike CSS-in-JS)

**Alternatives Considered**:
- CSS Modules: More boilerplate, less rapid
- styled-components: Runtime overhead, unnecessary

### 7. Error Handling Pattern

**Question**: How should we handle errors in the frontend?

**Research Findings**:
- Need to handle network errors, API errors, validation errors
- Users need clear, actionable error messages
- 401 errors require redirect to login
- Other errors should show user-friendly messages

**Decision**: Try-catch with user-friendly error messages

**Rationale**:
- Graceful degradation
- Clear user feedback
- Consistent error UX across application
- Handles all error types (network, API, validation)

**Alternatives Considered**:
- Error boundaries only: Insufficient for async operations
- Silent failures: Poor UX, users left confused

### 8. Loading State Management

**Question**: How should we indicate loading states during async operations?

**Research Findings**:
- Users need feedback during API requests
- Loading states prevent confusion and duplicate submissions
- Local loading state per component is sufficient

**Decision**: Local loading state per component with visual indicators

**Rationale**:
- Clear feedback during async operations
- Prevents user confusion
- Prevents duplicate submissions
- Simple implementation with useState

**Alternatives Considered**:
- Global loading: Less granular, poor UX
- No loading states: Users confused, duplicate submissions

## Technology Stack Summary

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Frontend Framework | Next.js | 16.1.1 | App Router, SSR/CSR, file-based routing, modern pattern |
| UI Library | React | 19 | Component-based, hooks, virtual DOM, industry standard |
| Language | TypeScript | 5.0+ | Type safety, better DX, fewer runtime errors |
| Styling | Tailwind CSS | Latest | Utility-first, responsive, rapid development, already configured |
| Authentication | Better Auth | Latest | JWT provider, httpOnly cookies, Spec-2 integration |
| HTTP Client | Fetch API | Native | No extra dependencies, modern browsers support |
| State Management | React Hooks | Native | useState, useEffect - sufficient for app complexity |
| Backend API | FastAPI | Existing | RESTful endpoints from Spec-1 |
| Database | Neon PostgreSQL | Existing | Shared with backend, users and tasks tables |

## Integration Architecture

### Frontend → Better Auth Flow

```
User Action (Register/Login)
  ↓
Form Submission
  ↓
Better Auth API (/api/auth/register or /api/auth/login)
  ↓
Validate Credentials
  ↓
Generate JWT Token (HS256, 24h expiration)
  ↓
Set httpOnly Cookie (better-auth.session_token)
  ↓
Redirect to /tasks
```

### Frontend → Backend API Flow

```
User Action (CRUD Task)
  ↓
Extract JWT from httpOnly Cookie
  ↓
Attach to Authorization Header (Bearer <token>)
  ↓
Make API Request (GET/POST/PUT/DELETE /tasks)
  ↓
Backend Validates JWT
  ↓
Backend Enforces User Isolation (filter by user_id)
  ↓
Return Response
  ↓
Update UI
```

### Error Handling Flow

```
API Request
  ↓
Response Status Check
  ↓
401 Unauthorized?
  ├─ Yes → Redirect to /login with message
  └─ No → Other Error?
      ├─ Yes → Show user-friendly error message
      └─ No → Success → Update UI
```

## Security Considerations

### Token Storage
- **Decision**: httpOnly cookies only
- **Rationale**: XSS protection, tokens not accessible to JavaScript
- **Risk Mitigation**: HTTPS required in production

### Token Transmission
- **Decision**: Authorization header with Bearer scheme
- **Rationale**: Standard pattern, backend expects this format
- **Risk Mitigation**: HTTPS encrypts transmission

### User Isolation
- **Decision**: Backend enforces user_id filtering
- **Rationale**: Frontend trusts backend, defense in depth
- **Risk Mitigation**: Backend middleware validates on every request

### Input Validation
- **Decision**: Client-side + server-side validation
- **Rationale**: UX (client) + security (server)
- **Risk Mitigation**: Never trust client-side validation alone

### CORS Configuration
- **Decision**: Backend configured to allow frontend origin
- **Rationale**: Required for cross-origin API requests
- **Risk Mitigation**: Whitelist specific origins, not wildcard

## Performance Considerations

### Initial Load Time
- **Target**: <2 seconds on standard broadband
- **Strategy**: Next.js automatic code splitting, minimal dependencies
- **Measurement**: Lighthouse performance score

### Task Operations
- **Target**: <3 seconds from action to UI update
- **Strategy**: Optimistic UI updates, loading states
- **Measurement**: Manual testing with network throttling

### Authentication Flow
- **Target**: <10 seconds from login to tasks page
- **Strategy**: Efficient JWT generation, minimal redirects
- **Measurement**: Manual testing with stopwatch

## Browser Compatibility

### Target Browsers
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Compatibility Strategy
- Use standard web APIs (Fetch, localStorage, cookies)
- Avoid experimental features
- Test on all target browsers

## Responsive Design Strategy

### Viewport Categories
1. **Mobile**: 320px - 767px (single column, touch-friendly)
2. **Tablet**: 768px - 1023px (optimized layout, touch-friendly)
3. **Desktop**: 1024px - 1920px (multi-column, mouse-optimized)

### Tailwind Breakpoints
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### Touch Target Size
- Minimum 44x44 pixels for accessibility (WCAG 2.1)
- Implemented via Tailwind padding utilities

## Dependencies Analysis

### Frontend Dependencies (package.json)
- **next**: 16.1.1 (framework)
- **react**: 19.0.0 (UI library)
- **react-dom**: 19.0.0 (React renderer)
- **better-auth**: Latest (authentication)
- **typescript**: 5.0+ (type safety)
- **tailwindcss**: Latest (styling)
- **eslint**: 9.0+ (linting)

### Backend Dependencies (requirements.txt)
- **fastapi**: Existing (API framework)
- **sqlmodel**: Existing (ORM)
- **pyjwt**: 2.10.1 (JWT validation)
- **psycopg2-binary**: 2.9.10 (PostgreSQL driver)

### Shared Dependencies
- **Neon PostgreSQL**: Database for users and tasks
- **JWT Secret**: Synchronized between frontend and backend

## Risk Mitigation

### JWT Secret Mismatch
- **Risk**: Authentication fails if secrets don't match
- **Mitigation**: Document synchronization requirement, validate during setup
- **Detection**: 401 errors on all API requests

### CORS Misconfiguration
- **Risk**: API requests blocked by browser
- **Mitigation**: Configure backend CORS to allow frontend origin
- **Detection**: CORS errors in browser console

### Token Expiration During Use
- **Risk**: User interrupted mid-session
- **Mitigation**: Handle 401 gracefully with redirect and message
- **Detection**: 401 errors after 24 hours

### Port Conflicts
- **Risk**: Cannot start development servers
- **Mitigation**: Document port configuration, provide alternatives
- **Detection**: Port already in use errors

## Conclusion

All research questions have been resolved with clear decisions and rationale. The technology stack is well-defined and aligns with project requirements and constitution principles. No additional research is needed before proceeding to Phase 1 (Design & Contracts).

**Next Phase**: Phase 1 - Create data-model.md, API contracts, and quickstart.md
