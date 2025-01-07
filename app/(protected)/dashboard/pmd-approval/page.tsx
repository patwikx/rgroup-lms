'use client'

import React from 'react';
import Head from 'next/head';

const UnderConstructionLeaveHistory: React.FC = () => {
  return (
    <>
      <Head>
        <title>Under Construction | Enterprise Portal</title>
        <meta name="description" content="This page is currently under construction. Please check back later." />
        <meta name="robots" content="noindex" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl p-8 mx-auto" role="alert" aria-live="polite">
          <div className="space-y-6">
            {/* Enterprise Logo Placeholder */}
            <div className="w-16 h-16 bg-blue-600 rounded-lg mx-auto flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Under Construction
              </h1>
              
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                We&apos;re currently enhancing this section to serve you better. Please check back soon.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-700">
                  Expected completion: Q1 2024
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                type="button"
              >
                Go Back
              </button>
              
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Return Home
              </a>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="relative flex">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-ping absolute inline-flex"></div>
                <div className="h-2 w-2 rounded-full bg-green-400 inline-flex"></div>
              </div>
              <span>Systems operational</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UnderConstructionLeaveHistory;