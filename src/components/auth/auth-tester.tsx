'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { authTestHelper } from '@/lib/test-utils';
import { logger } from '@/lib/logger';
import { AUTH_CONFIG } from '@/config/auth.config';

interface TestResult {
  name: string;
  success: boolean;
  logs: string[];
}

export function AuthTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Run all tests
  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    authTestHelper.clearTestData();

    try {
      // Test 1: Unauthenticated Homepage Access
      authTestHelper.startTest('Unauthenticated Homepage Access');
      const homeAccess = await authTestHelper.testRouteAccess(['/']);
      authTestHelper.endTest(homeAccess);

      // Test 2: Unauthenticated Dashboard Redirect
      authTestHelper.startTest('Unauthenticated Dashboard Redirect');
      const response = await fetch('/dashboard');
      const dashboardRedirect = response.redirected && response.url.includes('/login');
      authTestHelper.endTest(dashboardRedirect);

      // Test 3: Cookie Persistence
      authTestHelper.startTest('Cookie Persistence');
      const testSession = authTestHelper.createTestSession('participant');
      const cookiePersistence = await authTestHelper.testCookiePersistence(testSession);
      authTestHelper.endTest(cookiePersistence);

      // Test 4: Session Expiry
      authTestHelper.startTest('Session Expiry');
      const sessionExpiry = await authTestHelper.testSessionExpiry(testSession);
      authTestHelper.endTest(sessionExpiry);

      // Test 5: Cross-Port Cookie Access
      authTestHelper.startTest('Cross-Port Cookie Access');
      const port3000Cookie = document.cookie.includes('localhost:3000');
      const port3001Cookie = document.cookie.includes('localhost:3001');
      authTestHelper.endTest(port3000Cookie && port3001Cookie);

      // Update results
      setResults(authTestHelper.getTestResults());
    } catch (error) {
      logger.error('Test', 'Test suite failed', error as Error);
    } finally {
      setIsRunning(false);
    }
  };

  // Clear test results
  const clearResults = () => {
    setResults([]);
    authTestHelper.clearTestData();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Auth System Test Suite</span>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={clearResults}
              disabled={isRunning || results.length === 0}
            >
              Clear Results
            </Button>
            <Button
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{result.name}</h3>
                    <Badge variant={result.success ? 'success' : 'destructive'}>
                      {result.success ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {result.logs.map((log, logIndex) => (
                      <div key={logIndex} className="font-mono">{log}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No test results yet. Click "Run Tests" to start testing.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 