'use client';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: better-auth client call
    alert('Logged out mock successful!');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl p-8 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        
        <div className="p-6 border rounded-lg dark:border-zinc-700">
          <h2 className="text-xl font-semibold mb-4">User Profile</h2>
          <div className="space-y-2 text-zinc-600 dark:text-zinc-400">
            <p><strong>Name:</strong> Mock User</p>
            <p><strong>Email:</strong> user@example.com</p>
            <p><strong>Status:</strong> Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
