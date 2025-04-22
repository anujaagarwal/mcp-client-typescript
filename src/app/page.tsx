import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../lib/auth';


export default async function Home() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions);
  
  // If not authenticated, redirect to login
  if (!session) {
    redirect('/auth/signin');
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Google Workspace Chat Interface</h1>
        <ChatInterface />
      </div>
    </main>
  );
} 