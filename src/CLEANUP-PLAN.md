# Code Cleanup Plan

This document outlines the technical debt and code cleanup tasks identified in the codebase.

## Authentication System Cleanup

### Issues Identified:

1. **Multiple Auth Implementations**:
   - Main implementation: `src/components/auth/auth-provider.tsx` (used by the app)
   - Deprecated context version: `src/contexts/auth-context.tsx`
   - Unused provider: `src/components/providers/auth-provider.tsx`
   - Zustand store: `src/store/auth-store.ts`

2. **URL/Routing Issues**:
   - Confusion with Next.js route groups (folders with parentheses like `(dashboard)`)
   - Incorrect path references causing redirection loops
   - Inconsistent dashboard path handling

3. **Redirection Loops**:
   - Server-side redirects to the same URL causing infinite loops
   - Inconsistent handling of route group prefixes in URLs
   - Missing client-side logic for handling route transitions

4. **Duplicate Code**:
   - Multiple implementations of authentication logic
   - Redundant provider components

### Action Plan:

1. **Immediate Fixes (DONE)**:
   - Fixed URL routing to use correct paths without route group prefixes
   - Created proper client-side redirector pages with loading indicators
   - Updated middleware to prevent redirection loops
   - Added loop detection by checking the referrer path
   - Fixed login redirection to properly handle route groups

2. **Short-term Tasks (Next Sprint)**:
   - Remove deprecated auth context (`src/contexts/auth-context.tsx`)
   - Remove unused auth provider (`src/components/providers/auth-provider.tsx`)
   - Consolidate any unique functionality into the main auth provider
   - Update documentation to reflect the correct auth architecture
   - Improve error handling for failed redirections

3. **Long-term Improvements**:
   - Refactor auth provider to be more modular
   - Improve error handling and logging
   - Add comprehensive testing for auth flows
   - Enhance session management with better refresh strategies
   - Create a unified routing system that handles route groups consistently

## General Code Quality Improvements

### Issues Identified:

1. **Empty or Placeholder Directories**:
   - Some route directories exist but contain no actual implementation

2. **Inconsistent Path Handling**:
   - Different approaches to route handling across the codebase
   - Confusion between URL paths and file system paths

3. **Potential Type Safety Issues**:
   - Some components may use `any` types

### Action Plan:

1. **Directory Structure**:
   - Audit and clean up empty directories
   - Ensure all route groups have proper implementations
   - Document the routing structure for future reference

2. **Type Safety**:
   - Add stricter TypeScript typing throughout the codebase
   - Replace any `any` types with proper interfaces
   - Use Zod for runtime type validation

3. **Testing**:
   - Add unit tests for critical components
   - Implement E2E tests for authentication flows
   - Create test utilities for common auth scenarios

## Next Steps

1. Complete the immediate fixes for auth redirection
2. Create tasks for the short-term cleanup items
3. Document the proper authentication flow for future developers
4. Schedule regular code quality reviews 