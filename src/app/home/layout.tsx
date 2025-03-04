// This is a simple routing redirect to use the dashboard layout
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

// Map this route to the dashboard layout group
export const metadata = {
  title: 'Afkar - Home',
  description: 'Create and manage your research projects',
}; 