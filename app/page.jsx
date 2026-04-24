import Dashboard from '@/components/Dashboard';

// Next.js App Router: disable static pre-rendering so API data is always fresh
export const dynamic = 'force-dynamic';

export default function Home() {
  return <Dashboard />;
}
