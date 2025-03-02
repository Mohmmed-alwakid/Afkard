'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Progress } from '@/components/ui/progress';

export function PostLoginHelp() {
  const { user, isAuthenticated } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const router = useRouter();

  const isFirstLogin = user?.login_count === 1;
  const isResearcher = user?.role === 'researcher';

  // Define onboarding steps based on user role
  const researcherSteps = [
    { id: 1, title: 'Complete your profile', route: '/profile' },
    { id: 2, title: 'Create your first project', route: '/projects/new' },
    { id: 3, title: 'Set up a study', route: '/studies/create' },
    { id: 4, title: 'Invite participants', route: '/participants/invite' }
  ];

  const participantSteps = [
    { id: 1, title: 'Complete your profile', route: '/profile' },
    { id: 2, title: 'Browse available studies', route: '/studies' },
    { id: 3, title: 'Update your preferences', route: '/preferences' },
    { id: 4, title: 'Check rewards program', route: '/rewards' }
  ];

  const steps = isResearcher ? researcherSteps : participantSteps;
  const progressPercentage = (completedSteps.length / steps.length) * 100;

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId) 
        : [...prev, stepId]
    );
  };

  useEffect(() => {
    // Show help only when user is authenticated
    if (isAuthenticated && user) {
      setVisible(true);
      
      // Start countdown for auto-redirect only if not first login
      if (!isFirstLogin) {
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setTimeout(() => {
                router.push('/home');
              }, 500);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, [isAuthenticated, user, router, isFirstLogin]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="text-green-500 h-6 w-6" />
            <span>Login Successful!</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Welcome{isFirstLogin ? '' : ' back'}, <span className="font-medium">{user?.first_name || 'User'}</span>! 
            {isFirstLogin 
              ? " Let's get your account set up properly." 
              : " You've been successfully authenticated."}
          </p>
          
          {isFirstLogin ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Onboarding Progress</h3>
                <span className="text-sm text-muted-foreground">{completedSteps.length}/{steps.length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              
              <div className="space-y-3 mt-4">
                {steps.map(step => (
                  <div 
                    key={step.id} 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => toggleStep(step.id)}
                  >
                    {completedSteps.includes(step.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className={completedSteps.includes(step.id) ? "line-through text-muted-foreground" : ""}>
                      {step.title}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(step.route);
                      }}
                    >
                      Go
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm space-y-2 bg-muted/50 p-3 rounded-md">
              <p className="font-medium">What&apos;s next:</p>
              
              {isResearcher ? (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Create research projects</li>
                  <li>Set up studies</li>
                  <li>Invite participants</li>
                  <li>Analyze results</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>Browse available studies</li>
                  <li>Participate in research</li>
                  <li>Earn rewards</li>
                  <li>Track your participation history</li>
                </ul>
              )}
            </div>
          )}
          <p className="text-[#666675] text-base">
            Can&apos;t access your account? We&apos;re here to help.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isFirstLogin && (
            <p className="text-sm text-muted-foreground">
              Redirecting in {countdown} seconds...
            </p>
          )}
          <Button 
            onClick={() => router.push(isFirstLogin ? '/profile' : '/home')} 
            className="flex items-center gap-1 ml-auto"
          >
            {isFirstLogin ? 'Start Setup' : 'Go to Home'} <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 