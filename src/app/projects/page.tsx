"use client"

import * as React from "react"
import Link from "next/link"
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
import { Plus, Trash2, Pencil, Bell, FolderPlus } from "lucide-react"
import { ProfileHeader } from "@/components/profile-header"
import { StudyTypeModal } from "@/components/study-type-modal"
import { NewProjectModal } from "@/components/new-project-modal"
import { useProjectStore } from "@/store/project-store"
import { useTranslations } from "@/hooks/use-translations"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  SearchIcon, 
  FilterIcon, 
  MoreHorizontal,
  Eye,
  ArrowUpDown
} from 'lucide-react';

export default function ProjectsPage() {
  const { t, isRTL } = useTranslations()
  const [showStudyTypeModal, setShowStudyTypeModal] = React.useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = React.useState(false)
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)
  const { projects, addStudy } = useProjectStore()
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddStudy = (projectId: string, type: "test" | "interview") => {
    addStudy(projectId, {
      type,
      title: type === "test" ? "New Test" : "New Interview",
      status: "draft",
    })
  }

  // Handler for deleting a project
  const handleDeleteProject = (id: string) => {
    // Implement the logic to delete the project from the projects state
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-8 flex-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-afkar-purple-light to-afkar-purple rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="font-bold text-xl">Afkar</span>
            </Link>
            <nav className="flex gap-6">
              <Link href="/home" className="text-sm text-muted-foreground hover:text-foreground">Home</Link>
              <Link href="/projects" className="text-sm font-semibold">Projects</Link>
              <Link href="/participant" className="text-sm text-muted-foreground hover:text-foreground">Participant</Link>
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">Help&Support</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <ProfileHeader 
              name="Ahmed Darwish"
              initials="AD"
              avatarUrl="/avatars/01.png"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container px-4">
          {/* Welcome Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Welcome to Afkar Platform, ahmed 👋</h1>
              <p className="text-muted-foreground">Let&apos;s add some data create new project</p>
            </div>
            <Button 
              className="gap-2"
              onClick={() => setShowNewProjectModal(true)}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Projects Section */}
          {projects.length === 0 ? (
            // Empty state
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
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
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
          {/* Projects Table */}
          <div className="rounded-lg border bg-card">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Projects <Badge variant="secondary" className="ml-2">{projects.length} Projects</Badge></h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Studies</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{project.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{project.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {project.studies.slice(0, 3).map((study) => (
                            <Avatar key={study.id} className="border-2 border-background">
                              <AvatarFallback>
                                {study.type === "test" ? "T" : "I"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        {project.studies.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{project.studies.length - 3}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProjectId(project.id)
                            setShowStudyTypeModal(true)
                          }}
                        >
                          <FolderPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Study Type Modal */}
      <StudyTypeModal
        open={showStudyTypeModal}
        onOpenChange={setShowStudyTypeModal}
        onSelect={(type) => {
          if (selectedProjectId) {
            handleAddStudy(selectedProjectId, type)
          }
        }}
      />

      {/* New Project Modal */}
      <NewProjectModal
        open={showNewProjectModal}
        onOpenChange={setShowNewProjectModal}
      />
    </div>
  )
} 