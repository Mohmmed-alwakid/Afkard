import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { CreateStudyForm } from '@/components/studies/create-study-form';

export const metadata: Metadata = {
  title: 'Create New Study - Afkar',
  description: 'Create a new research study on Afkar platform',
};

export default async function CreateStudyPage() {
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

  // Get user's projects for the dropdown
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('owner_id', session.user.id)
    .order('name');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-medium text-[#14142B] mb-2">
          Create New Study
        </h1>
        <p className="text-[#666675]">
          Set up your research study by filling out the details below
        </p>
      </div>

      <div className="bg-white rounded-xl p-8">
        <CreateStudyForm 
          userId={session.user.id} 
          projects={projects || []} 
        />
      </div>
    </div>
  );
} 