'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useProjectStore } from '@/store/project-store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  ArrowUp, 
  ArrowDown, 
  Users, 
  BarChart2, 
  FileText, 
  Calendar, 
  ArrowRight, 
  ChevronDown 
} from 'lucide-react';

// Color constants for the charts
const COLORS = ['#3E4C94', '#7A9CFF', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

interface AnalyticsOverviewProps {
  period?: 'day' | 'week' | 'month' | 'year';
  className?: string;
}

interface Metric {
  name: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
}

// Demo data generator functions
const generateRecentActivity = () => {
  const activityTypes = ['Created project', 'Added study', 'Invited participant', 'Received response'];
  const users = ['Ahmed', 'Sarah', 'Mohammed', 'Fatima', 'Khalid'];
  const projects = ['Website Usability', 'Mobile App Feedback', 'Customer Survey', 'Product Research'];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: i,
    type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
    user: users[Math.floor(Math.random() * users.length)],
    project: projects[Math.floor(Math.random() * projects.length)],
    time: `${Math.floor(Math.random() * 24)}h ago`,
  }));
};

const generateStudyTypeData = (): ChartData[] => [
  { name: 'Usability Tests', value: Math.floor(Math.random() * 20) + 5 },
  { name: 'Interviews', value: Math.floor(Math.random() * 15) + 3 },
  { name: 'Surveys', value: Math.floor(Math.random() * 25) + 10 },
];

const generateParticipationData = (): ChartData[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    value: Math.floor(Math.random() * 50) + 10,
  }));
};

export function AnalyticsOverview({ period = 'week', className }: AnalyticsOverviewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [studyTypeData, setStudyTypeData] = useState<ChartData[]>([]);
  const [participationData, setParticipationData] = useState<ChartData[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const { projects } = useProjectStore();
  
  // Calculate total studies
  const totalStudies = projects.reduce((acc, project) => acc + project.studies.length, 0);

  // Load analytics data
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set metrics based on the projects/studies data
      setMetrics([
        {
          name: 'Total Projects',
          value: projects.length,
          change: 12.5,
          icon: <FileText className="h-5 w-5" />,
          color: 'bg-blue-50 text-blue-600',
        },
        {
          name: 'Total Studies',
          value: totalStudies,
          change: 8.2,
          icon: <BarChart2 className="h-5 w-5" />,
          color: 'bg-purple-50 text-purple-600',
        },
        {
          name: 'Participants',
          value: Math.floor(Math.random() * 100) + 50,
          change: -2.3,
          icon: <Users className="h-5 w-5" />,
          color: 'bg-green-50 text-green-600',
        },
        {
          name: 'Response Rate',
          value: Math.floor(Math.random() * 30) + 60,
          change: 5.7,
          icon: <Calendar className="h-5 w-5" />,
          color: 'bg-amber-50 text-amber-600',
        },
      ]);
      
      // Set chart data
      setStudyTypeData(generateStudyTypeData());
      setParticipationData(generateParticipationData());
      setRecentActivity(generateRecentActivity());
      
      setIsLoading(false);
    };
    
    loadData();
  }, [projects, totalStudies]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading analytics data..." />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Overview of your research activities and insights</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="space-x-1">
            <span>This {period}</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>
      
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{metric.name}</p>
                  <h3 className="text-2xl font-bold">
                    {metric.name === 'Response Rate' ? `${metric.value}%` : metric.value}
                  </h3>
                </div>
                <div className={`rounded-full p-2 ${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <div className={`flex items-center space-x-1 text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>{Math.abs(metric.change)}%</span>
                </div>
                <span className="text-sm text-muted-foreground ml-2">vs. last {period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="responses">Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Study Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Study Types Distribution</CardTitle>
                <CardDescription>Breakdown of study types across all projects</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studyTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {studyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Participation Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Participation Trends</CardTitle>
                <CardDescription>Daily participation activity</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participationData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3E4C94" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="rounded-full p-2 bg-gray-100">
                      {activity.type.includes('Created') ? (
                        <FileText className="h-4 w-4 text-primary" />
                      ) : activity.type.includes('Added') ? (
                        <BarChart2 className="h-4 w-4 text-purple-600" />
                      ) : activity.type.includes('Invited') ? (
                        <Users className="h-4 w-4 text-green-600" />
                      ) : (
                        <Calendar className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">{activity.project} • {activity.time}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      View
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Additional tab content would go here */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Detailed metrics for all your research projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed project analytics will be shown here. This feature is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Participant Analytics</CardTitle>
              <CardDescription>Demographics and participation statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed participant analytics will be shown here. This feature is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses">
          <Card>
            <CardHeader>
              <CardTitle>Response Analytics</CardTitle>
              <CardDescription>Completion rates and response quality metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed response analytics will be shown here. This feature is under development.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 