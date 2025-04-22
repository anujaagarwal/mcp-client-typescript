"use client";

import React, { useEffect, useState } from 'react';
import { getProviders, signIn } from 'next-auth/react';

// Define the provider type
type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  
  useEffect(() => {
    const loadProviders = async () => {
      const providersData = await getProviders();
      setProviders(providersData);
    };
    
    loadProviders();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            To use the MCP Chat Interface
          </p>
        </div>
        <div className="mt-8 space-y-6">
          {providers && Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <button
                onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {/* You can add provider icons here */}
                </span>
                Sign in with {provider.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 