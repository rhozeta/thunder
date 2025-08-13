'use client'
import { useEffect, useState } from 'react'

export default function TestEnv() {
  const [envVars, setEnvVars] = useState({
    url: '',
    key: '',
    nodeEnv: ''
  })

  useEffect(() => {
    // Check if environment variables are available
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      nodeEnv: process.env.NODE_ENV || 'development'
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {envVars.url}</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {envVars.key}</p>
        <p><strong>Node Environment:</strong> {envVars.nodeEnv}</p>
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Debug Info:</h3>
          <p>Window location: {typeof window !== 'undefined' ? window.location.origin : 'server'}</p>
        </div>
      </div>
    </div>
  )
}
