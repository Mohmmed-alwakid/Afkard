"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Bell, 
  Settings, 
  Search,
  Filter,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Copy,
  LineChart,
  Users,
  Briefcase,
  ClipboardList,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight as ChevronRightIcon
} from "lucide-react"
import { ProfileHeader } from "@/components/profile-header"
import { StudyTypeModal } from "@/components/study-type-modal"
import { NewProjectModal } from "@/components/new-project-modal"
import { useProjectStore } from "@/store/project-store"
import { cn } from "@/lib/utils"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Custom hook for detecting clicks outside of an element
function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default function ProjectsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const [showStudyTypeModal, setShowStudyTypeModal] = React.useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = React.useState(false)
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)
  const { projects, addStudy, deleteProject } = useProjectStore()
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'createdAt'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Handle clicks outside of the profile dropdown
  useClickOutside(profileDropdownRef, () => {
    if (profileDropdownOpen) setProfileDropdownOpen(false);
  });

  // Filter projects based on search query and status filter
  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!statusFilter || project.status === statusFilter)
    )
    .sort((a, b) => {
      // Handle sorting
      const factor = sortDirection === 'asc' ? 1 : -1;
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name) * factor;
      } else {
        // For date-based sorting
        return ((new Date(a[sortBy])).getTime() - (new Date(b[sortBy])).getTime()) * factor;
      }
    });

  // Calculate pagination with filtered projects
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage, 
    currentPage * projectsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, sortDirection]);

  // Toggle sort direction or change sort field
  const handleSort = (field: 'name' | 'updatedAt' | 'createdAt') => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc'); // Default to descending for new sort field
    }
  };

  const handleAddStudy = (projectId: string, type: StudyType) => {
    // Close the study type modal
    setShowStudyTypeModal(false);
    
    // Let the StudyTypeModal handle the creation logic by passing the projectId
    setSelectedProjectId(projectId);
  }

  // Handler for selecting/deselecting projects
  const toggleProjectSelection = (id: string) => {
    setSelectedProjects(prev => 
      prev.includes(id) 
        ? prev.filter(projectId => projectId !== id) 
        : [...prev, id]
    );
  };

  // Handler for selecting/deselecting all projects
  const toggleAllSelection = () => {
    if (selectedProjects.length === currentProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(currentProjects.map(project => project.id));
    }
  };

  // Handler for deleting a project
  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
    setIsDeleteAlertOpen(true);
  };
  
  // Confirm project deletion
  const confirmDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete);
      setProjectToDelete(null);
      setIsDeleteAlertOpen(false);
      
      // Remove the project from selected projects if it was selected
      setSelectedProjects(prev => prev.filter(id => id !== projectToDelete));
    }
  };
  
  // Delete multiple projects
  const deleteSelectedProjects = () => {
    selectedProjects.forEach(id => deleteProject(id));
    setSelectedProjects([]);
  };

  // Handler for editing a project
  const handleEditProject = (id: string) => {
    // Implement navigation to edit project page
    router.push(`/projects/${id}/edit`);
  };

  // Calculate project stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalStudies = projects.reduce((sum, project) => sum + (project.studies?.length || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F6FA]">
      {/* Header */}
      <header className="bg-[#14142B] w-full">
        <div className="container mx-auto px-4 h-[107px] flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-10">
              <div className="w-[142px] h-[52px] relative">
                {/* Afkar Logo */}
                <div className="w-[123.72px] h-[44px] absolute">
                  <Image 
                    src="/logo-white.svg" 
                    alt="Afkar" 
                    width={123.72} 
                    height={44} 
                    className="object-contain" 
                  />
                </div>
              </div>
            </Link>
            <div className="h-[35px] w-[1px] bg-[#37374B] mx-6"></div>
            {/* Navigation */}
            <nav className="flex gap-2">
              <Link 
                href="/home" 
                className={`h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold ${pathname === '/home' ? 'bg-[#303044]' : ''}`}
              >
                Home
              </Link>
              <Link 
                href="/projects" 
                className={`h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold ${pathname === '/projects' ? 'bg-[#303044]' : ''}`}
              >
                Projects
              </Link>
              <Link 
                href="/participants" 
                className={`h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold ${pathname === '/participants' ? 'bg-[#303044]' : ''}`}
              >
                Participants
              </Link>
              <Link 
                href="/templates" 
                className={`h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold ${pathname === '/templates' ? 'bg-[#303044]' : ''}`}
              >
                Templates
              </Link>
              <Link 
                href="/help" 
                className={`h-10 px-3 py-2 flex items-center text-[#F4EBFF] rounded-md text-sm font-semibold ${pathname === '/help' ? 'bg-[#303044]' : ''}`}
              >
                Help&Support
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <Button 
              variant="outline" 
              className="bg-[#303044] border-[#303044] text-white rounded-lg"
            >
              <span className="mr-2">Upgrade Plan</span>
            </Button>
            
            {/* Action Icons */}
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10">
                <Settings className="h-5 w-5 text-white" />
              </Button>
              <Button variant="ghost" size="icon" className="bg-transparent rounded-md w-10 h-10">
                <Bell className="h-5 w-5 text-white" />
              </Button>
            </div>
            
            {/* User Avatar with Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                className="w-11 h-11 rounded-full bg-[#212280] flex items-center justify-center text-white font-semibold focus:outline-none"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="Open user menu"
              >
                AD
              </button>
              
              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 top-14 w-[359px] bg-white rounded-[24px] shadow-[0px_12px_24px_rgba(12,22,61,0.05)] p-6 z-50"
                >
                  <div className="flex flex-col items-center w-full gap-6">
                    {/* Profile Header */}
                    <div className="flex items-start gap-3 w-full">
                      {/* Avatar */}
                      <div className="w-16 h-16 relative rounded-full bg-[#212280] flex items-center justify-center text-white font-semibold text-base">
                        <span>AD</span>
                      </div>
                      
                      {/* Name and View Profile Link */}
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[18px] font-semibold leading-8 text-[#37374B] tracking-[0.75px]">
                          Ahmed Darwish
                        </h3>
                        <button className="flex items-center text-[#212280] font-semibold text-[13px] leading-[22px] tracking-[0.25px]">
                          <span>View Profile</span>
                          <ChevronRightIcon className="w-4 h-4 ml-2" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Menu Links */}
                    <div className="flex flex-col w-full gap-4">
                      {/* Billing */}
                      <button className="flex items-center p-4 w-full rounded-xl hover:bg-gray-50 transition-colors">
                        <ClipboardList className="w-6 h-6 text-[#37374B]" />
                        <span className="ml-4 text-[13px] font-medium text-[#37374B] flex-grow text-left">Billing</span>
                        <ChevronRightIcon className="w-3 h-3 text-[#37374B]" />
                      </button>
                      
                      {/* Change Language */}
                      <button className="flex items-center p-4 w-full rounded-xl hover:bg-gray-50 transition-colors">
                        <Globe className="w-6 h-6 text-[#37374B]" />
                        <span className="ml-4 text-[13px] font-medium text-[#37374B] flex-grow text-left">Change language</span>
                        <ChevronRightIcon className="w-3 h-3 text-[#37374B]" />
                      </button>
                      
                      {/* Help */}
                      <button className="flex items-center p-4 w-full rounded-xl hover:bg-gray-50 transition-colors">
                        <HelpCircle className="w-6 h-6 text-[#37374B]" />
                        <span className="ml-4 text-[13px] font-medium text-[#37374B] flex-grow text-left">Help</span>
                        <ChevronRightIcon className="w-3 h-3 text-[#37374B]" />
                      </button>
                      
                      {/* Logout */}
                      <button className="flex items-center p-4 w-full rounded-xl bg-[#DEDEEC] transition-colors">
                        <LogOut className="w-6 h-6 text-[#5C5C5C]" />
                        <span className="ml-4 text-[13px] font-medium text-[#67686A] flex-grow text-left">Log out</span>
                        <ChevronRightIcon className="w-3 h-3 text-[#67686A]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Enhanced Welcome Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Main welcome card - takes up 3 columns on md+ screens */}
            <Card className="md:col-span-3 bg-white rounded-[24px] shadow-sm border-none">
              <CardContent className="p-6 flex justify-between items-center">
                <div className="flex flex-col gap-2 max-w-xl">
                  <h2 className="text-lg font-medium text-[#14142B]">
                    Welcome to Afkar Platform, ahmed 🎉
                  </h2>
                  <p className="text-sm text-[#666675]">
                    Create research projects, run user tests, conduct interviews, and gather valuable insights.
                    Start by creating a new project or explore sample templates to get going quickly.
                  </p>
                  
                  {projects.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Choose first project
                          setSelectedProjectId(projects[0].id);
                          setShowStudyTypeModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Study
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push('/templates')}
                      >
                        Explore Templates
                      </Button>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="bg-[#BFE9FF] hover:bg-[#A9E0FF] text-[#14142B] flex items-center gap-3 rounded-full px-7 py-4 h-14 shrink-0 ml-4"
                  onClick={() => setShowNewProjectModal(true)}
                >
                  <Plus className="h-6 w-6" />
                  <span className="font-semibold">New Project</span>
                </Button>
              </CardContent>
            </Card>
            
            {/* Stats card - only show when there are projects */}
            {projects.length > 0 && (
              <Card className="bg-white rounded-[24px] shadow-sm border-none flex flex-col justify-center p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">Project Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F9F5FF] flex items-center justify-center mr-3">
                      <Briefcase className="h-4 w-4 text-[#7F56D9]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Projects</p>
                      <p className="text-xl font-semibold">{totalProjects}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#ECFDF3] flex items-center justify-center mr-3">
                      <LineChart className="h-4 w-4 text-[#12B76A]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Projects</p>
                      <p className="text-xl font-semibold">{activeProjects}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#F0F9FF] flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-[#0BA5EC]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Studies</p>
                      <p className="text-xl font-semibold">{totalStudies}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Projects Table */}
          <Card className="w-full bg-white rounded-xl shadow-sm border-none">
            <CardHeader className="px-6 py-5 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold flex items-center">
                  Projects
                  <Badge variant="secondary" className="ml-2 bg-[#F9F5FF] text-[#6941C6]">
                    {filteredProjects.length} Projects
                  </Badge>
                </h3>
                
                {/* Bulk actions dropdown - show only when projects are selected */}
                {selectedProjects.length > 0 && (
                  <div className="ml-4 flex items-center">
                    <Badge variant="outline" className="bg-[#F9F5FF] text-[#6941C6] mr-2">
                      {selectedProjects.length} selected
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setProjectToDelete('multiple');
                            setIsDeleteAlertOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Selected
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedProjects([])}>
                          Deselect All
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {projects.length > 0 && (
                  <>
                    {/* Search Box */}
                    <div className="relative max-w-[180px]">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-9 text-sm w-full"
                      />
                    </div>
                    
                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                          <Filter className="h-4 w-4" />
                          Filter
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setStatusFilter(null)}
                          className={!statusFilter ? 'bg-gray-100' : ''}
                        >
                          All Projects
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setStatusFilter('active')}
                          className={statusFilter === 'active' ? 'bg-gray-100' : ''}
                        >
                          Active
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setStatusFilter('archived')}
                          className={statusFilter === 'archived' ? 'bg-gray-100' : ''}
                        >
                          Archived
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setStatusFilter('draft')}
                          className={statusFilter === 'draft' ? 'bg-gray-100' : ''}
                        >
                          Draft
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                          <ArrowDown className="h-4 w-4" />
                          Sort
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleSort('name')}
                          className={sortBy === 'name' ? 'bg-gray-100' : ''}
                        >
                          Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSort('updatedAt')}
                          className={sortBy === 'updatedAt' ? 'bg-gray-100' : ''}
                        >
                          Last Updated {sortBy === 'updatedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleSort('createdAt')}
                          className={sortBy === 'createdAt' ? 'bg-gray-100' : ''}
                        >
                          Date Created {sortBy === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                
                {projects.length > 0 && (
                  <Button 
                    className="bg-[#BFE9FF] hover:bg-[#A9E0FF] text-[#14142B] flex items-center gap-2 rounded-full"
                    onClick={() => {
                      // Choose first project by default or use selected project if any
                      const projectId = selectedProjects.length > 0 ? selectedProjects[0] : projects[0].id;
                      setSelectedProjectId(projectId);
                      setShowStudyTypeModal(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">New Study</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredProjects.length === 0 ? (
                // If there are projects but none match the filter
                searchQuery || statusFilter ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <Image 
                        src="/illustrations/empty-projects.svg" 
                        alt="No matching projects" 
                        width={180} 
                        height={120} 
                        className="mx-auto mb-6"
                      />
                      <h2 className="text-xl font-semibold mb-4">No matching projects</h2>
                      <p className="text-gray-500 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
                      <Button 
                        variant="outline"
                        onClick={() => { setSearchQuery(''); setStatusFilter(null); }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Original empty state
                  <div className="bg-white rounded-xl p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="mb-6">
                        <Image 
                          src="/illustrations/empty-projects.svg" 
                          alt="No projects" 
                          width={260} 
                          height={180} 
                          className="mx-auto"
                        />
                      </div>
                      <h2 className="text-xl font-semibold mb-4">No projects yet</h2>
                      <p className="text-gray-500 mb-6">Start by creating your first research project, or explore templates for quick setup.</p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button 
                          className="bg-primary hover:bg-primary/90 text-white"
                          onClick={() => setShowNewProjectModal(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Project
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <Table>
                    <TableHeader className="bg-[#F9FAFB]">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox 
                            checked={selectedProjects.length === currentProjects.length && currentProjects.length > 0}
                            onCheckedChange={toggleAllSelection}
                            aria-label="Select all projects"
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            Status
                            <ArrowDown className="h-4 w-4 text-gray-500" />
                          </div>
                        </TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="hidden lg:table-cell">Participants</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProjects.map((project) => (
                        <TableRow key={project.id} className="h-[72px]">
                          <TableCell>
                            <Checkbox 
                              checked={selectedProjects.includes(project.id)}
                              onCheckedChange={() => toggleProjectSelection(project.id)}
                              aria-label={`Select ${project.name}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="bg-[#C7B9DA]">
                                <AvatarFallback>{project.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-gray-900 block">{project.name}</span>
                                <span className="text-sm text-gray-500 md:hidden block">
                                  {new Date(project.updatedAt).toLocaleDateString()} • 
                                  <Badge variant="outline" className="ml-1 bg-[#ECFDF3] text-[#027A48] border-none inline-flex items-center gap-1 px-1.5 py-0 text-xs">
                                    <div className="w-1 h-1 rounded-full bg-[#12B76A]"></div>
                                    <span>Active</span>
                                  </Badge>
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="bg-[#ECFDF3] text-[#027A48] border-none flex items-center gap-1 px-2 py-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#12B76A]"></div>
                              <span>Active</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-gray-600 text-sm">
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex">
                              <div className="flex -space-x-2">
                                {[...Array(Math.min(5, project.studies.length || 0))].map((_, i) => (
                                  <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                    <AvatarFallback className="text-xs bg-[#C7B9DA]">
                                      {String.fromCharCode(65 + i)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {(project.studies?.length || 0) > 5 && (
                                  <Avatar className="w-6 h-6 border-2 border-white">
                                    <AvatarFallback className="text-xs bg-[#F2F4F7] text-gray-600">
                                      +{(project.studies?.length || 0) - 5}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => router.push(`/projects/${project.id}`)}
                                aria-label={`View ${project.name}`}
                              >
                                <Eye className="h-5 w-5 text-gray-600" />
                              </Button>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-5 w-5 text-gray-600" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedProjectId(project.id);
                                      setShowStudyTypeModal(true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Study
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEditProject(project.id)}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Project
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Create a new project with the same details
                                      const newProject = {
                                        ...project,
                                        id: undefined, // Will be generated by the store
                                        name: `${project.name} (Copy)`,
                                        studies: [], // Don't copy studies
                                        createdAt: new Date(),
                                        updatedAt: new Date()
                                      };
                                      // Assuming there's a method to add a project
                                      useProjectStore.getState().addProject(newProject);
                                    }}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteProject(project.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {filteredProjects.length > projectsPerPage && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="flex gap-0.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === currentPage ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setCurrentPage(pageNumber)}
                            className={cn(
                              "w-10 h-10 rounded-lg",
                              pageNumber === currentPage ? "bg-[#F9FAFB]" : ""
                            )}
                          >
                            {pageNumber}
                          </Button>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Explore Afkar Section */}
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-2 text-[#27273C]">Explore Afkar</h2>
            <p className="text-[#535364] mb-6">
              Elevate your research by learning the basics, and access advanced tips and resources
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resource Card 1 */}
              <Card className="bg-white rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                      <Image
                        src="/icons/help.svg"
                        alt="Help"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-800">Getting Started with Afkar</h3>
                      <p className="text-gray-600 text-sm">Learn the basics of creating research projects and studies</p>
                      <Link 
                        href="/help/getting-started" 
                        className="text-sm font-semibold inline-block mt-6 underline text-[#14142B]"
                      >
                        View Getting Started
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Resource Card 2 */}
              <Card className="bg-white rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                      <Image
                        src="/icons/layout.svg"
                        alt="Layout"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-800">Advanced Research Techniques</h3>
                      <p className="text-gray-600 text-sm">Master professional UX research methods and analysis techniques</p>
                      <Link 
                        href="/help/advanced-techniques" 
                        className="text-sm font-semibold inline-block mt-6 underline text-[#14142B]"
                      >
                        Explore Techniques
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {/* Study Type Modal */}
      <StudyTypeModal
        open={showStudyTypeModal}
        onOpenChange={setShowStudyTypeModal}
        onSelect={(type) => handleAddStudy(selectedProjectId || '', type)}
        projectId={selectedProjectId || undefined}
      />

      {/* New Project Modal */}
      <NewProjectModal
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
      />

      {/* Delete Project Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {projectToDelete === 'multiple' 
                ? `Delete ${selectedProjects.length} Projects`
                : 'Delete Project'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {projectToDelete === 'multiple' 
                ? `Are you sure you want to delete the selected ${selectedProjects.length} projects? This action cannot be undone and all associated studies will be permanently removed.`
                : 'Are you sure you want to delete this project? This action cannot be undone and all associated studies will be permanently removed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (projectToDelete === 'multiple') {
                  deleteSelectedProjects();
                } else {
                  confirmDeleteProject();
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {projectToDelete === 'multiple' ? 'Delete Projects' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 