import { create } from 'zustand';
import { Task, TaskStatus, TaskPriority, TaskCreate, TaskUpdate } from '@/types/task';
import { apiService } from '@/lib/api-services';

interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  selectedTask: Task | null;
  filterStatus: TaskStatus | null;
  filterPriority: TaskPriority | null;
  filterAssignee: string | null;
  searchQuery: string;
  
  // Actions
  fetchUserTasks: (userId: string) => Promise<void>;
  fetchProjectTasks: (projectId: string) => Promise<void>;
  fetchStudyTasks: (studyId: string) => Promise<void>;
  createTask: (task: TaskCreate) => Promise<Task | null>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  setSelectedTask: (task: Task | null) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<Task | null>;
  assignTask: (id: string, userId: string) => Promise<Task | null>;
  setFilterStatus: (status: TaskStatus | null) => void;
  setFilterPriority: (priority: TaskPriority | null) => void;
  setFilterAssignee: (assigneeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  hasError: false,
  errorMessage: null,
  selectedTask: null,
  filterStatus: null,
  filterPriority: null,
  filterAssignee: null,
  searchQuery: '',
  
  fetchUserTasks: async (userId: string) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.getUserTasks(userId);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return;
      }
      set({ tasks: result.data || [], isLoading: false });
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
  
  fetchProjectTasks: async (projectId: string) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.getProjectTasks(projectId);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return;
      }
      set({ tasks: result.data || [], isLoading: false });
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
  
  fetchStudyTasks: async (studyId: string) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.getStudyTasks(studyId);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return;
      }
      set({ tasks: result.data || [], isLoading: false });
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
    }
  },
  
  createTask: async (task: TaskCreate) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.createTask(task);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return null;
      }
      
      // Add new task to the state
      const newTask = result.data as Task;
      set(state => ({ 
        tasks: [...state.tasks, newTask],
        isLoading: false 
      }));
      
      return newTask;
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
      return null;
    }
  },
  
  updateTask: async (id: string, updates: TaskUpdate) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.updateTask(id, updates);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return null;
      }
      
      // Update task in state
      const updatedTask = result.data as Task;
      set(state => ({
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false
      }));
      
      return updatedTask;
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
      return null;
    }
  },
  
  deleteTask: async (id: string) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.deleteTask(id);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return false;
      }
      
      // Remove task from state
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
      return false;
    }
  },
  
  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task });
  },
  
  updateTaskStatus: async (id: string, status: TaskStatus) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.updateTaskStatus(id, status);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return null;
      }
      
      // Update task in state
      const updatedTask = result.data as Task;
      set(state => ({
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false
      }));
      
      return updatedTask;
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
      return null;
    }
  },
  
  assignTask: async (id: string, userId: string) => {
    set({ isLoading: true, hasError: false, errorMessage: null });
    try {
      const result = await apiService.assignTask(id, userId);
      if (result.error) {
        set({ hasError: true, errorMessage: result.error, isLoading: false });
        return null;
      }
      
      // Update task in state
      const updatedTask = result.data as Task;
      set(state => ({
        tasks: state.tasks.map(task => task.id === id ? updatedTask : task),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false
      }));
      
      return updatedTask;
    } catch (error) {
      set({ 
        hasError: true, 
        errorMessage: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      });
      return null;
    }
  },
  
  setFilterStatus: (status: TaskStatus | null) => {
    set({ filterStatus: status });
  },
  
  setFilterPriority: (priority: TaskPriority | null) => {
    set({ filterPriority: priority });
  },
  
  setFilterAssignee: (assigneeId: string | null) => {
    set({ filterAssignee: assigneeId });
  },
  
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },
  
  clearFilters: () => {
    set({
      filterStatus: null,
      filterPriority: null,
      filterAssignee: null,
      searchQuery: ''
    });
  }
}));

// Selector to get filtered tasks
export const useFilteredTasks = () => {
  return useTasksStore(state => {
    let filteredTasks = [...state.tasks];
    
    // Apply status filter
    if (state.filterStatus) {
      filteredTasks = filteredTasks.filter(task => task.status === state.filterStatus);
    }
    
    // Apply priority filter
    if (state.filterPriority) {
      filteredTasks = filteredTasks.filter(task => task.priority === state.filterPriority);
    }
    
    // Apply assignee filter
    if (state.filterAssignee) {
      filteredTasks = filteredTasks.filter(task => task.assigned_to === state.filterAssignee);
    }
    
    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(query) || 
        task.description?.toLowerCase().includes(query)
      );
    }
    
    return filteredTasks;
  });
}; 