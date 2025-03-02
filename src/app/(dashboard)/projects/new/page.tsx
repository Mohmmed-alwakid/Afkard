import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { CreateProjectForm } from '@/components/projects/create-project-form';

export const metadata: Metadata = {
  title: 'Create New Project - Afkar',
  description: 'Create a new research project on Afkar platform',
};

export default async function CreateProjectPage() {
  // Create a Supabase client for server component
  const supabase = createServerClient();
  
  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    redirect('/login');
  }

  // Get user profile with role information to check if they're a researcher
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  // If user is not a researcher, redirect to home
  if (user?.role !== 'researcher') {
    redirect('/home');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium text-[#14142B] mb-2">
          Create New Project
        </h1>
        <p className="text-[#666675]">
          Projects help you organize related research studies and share access with team members
        </p>
      </div>

      <div className="bg-white rounded-xl p-8">
        <CreateProjectForm userId={session.user.id} />
      </div>
    </div>
  );
} 