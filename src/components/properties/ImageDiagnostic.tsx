'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export function ImageDiagnostic() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    const diagnosticResults: any = {}

    try {
      // 1. Check if storage bucket exists and is accessible
      console.log('🔍 Checking storage bucket...')
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      diagnosticResults.buckets = { data: buckets, error: bucketsError }
      
      // 1b. Try direct bucket access
      console.log('🔍 Testing direct bucket access...')
      const { data: bucketInfo, error: bucketError } = await supabase.storage
        .from('property-images')
        .list('', { limit: 1 })
      diagnosticResults.bucketAccess = { data: bucketInfo, error: bucketError }
      
      // 2. Try to list files in property-images bucket
      console.log('🔍 Checking property-images bucket contents...')
      const { data: files, error: filesError } = await supabase.storage
        .from('property-images')
        .list()
      diagnosticResults.files = { data: files, error: filesError }

      // 3. Check property_images table
      console.log('🔍 Checking property_images table...')
      const { data: dbImages, error: dbError } = await supabase
        .from('property_images')
        .select('*')
        .limit(5)
      diagnosticResults.dbImages = { data: dbImages, error: dbError }

      // 4. Test generating a public URL and actual image accessibility
      if (dbImages && dbImages.length > 0) {
        const testImage = dbImages[0]
        console.log('🔍 Testing public URL generation...')
        
        // Extract filename from stored URL
        const urlParts = testImage.image_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        const { data: publicUrlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)
        
        // Test if the actual URL is accessible
        console.log('🔍 Testing image URL accessibility...')
        let urlAccessible = false
        try {
          const response = await fetch(testImage.image_url, { method: 'HEAD' })
          urlAccessible = response.ok
        } catch (error) {
          console.error('URL fetch failed:', error)
        }
        
        diagnosticResults.publicUrlTest = {
          storedUrl: testImage.image_url,
          generatedUrl: publicUrlData.publicUrl,
          fileName: fileName,
          urlAccessible: urlAccessible
        }
      }

      // 5. Check authentication
      console.log('🔍 Checking authentication...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      diagnosticResults.auth = { user: user?.id, error: authError }

      setResults(diagnosticResults)
      console.log('📊 Diagnostic Results:', diagnosticResults)

    } catch (error) {
      console.error('❌ Diagnostic failed:', error)
      diagnosticResults.error = error
      setResults(diagnosticResults)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">🔧 Image Storage Diagnostic</h3>
      
      <button
        onClick={runDiagnostic}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Diagnostic...' : 'Run Diagnostic'}
      </button>

      {results && (
        <div className="mt-4 space-y-4">
          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium">Storage Buckets:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(results.buckets, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium">Direct Bucket Access:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(results.bucketAccess, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium">Bucket Files:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(results.files, null, 2)}
            </pre>
          </div>

          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium">Database Images:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(results.dbImages, null, 2)}
            </pre>
          </div>

          {results.publicUrlTest && (
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium">Public URL Test:</h4>
              <div className="text-sm space-y-2">
                <p><strong>Stored URL:</strong> 
                  <a href={results.publicUrlTest.storedUrl} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline ml-1">
                    {results.publicUrlTest.storedUrl}
                  </a>
                </p>
                <p><strong>Generated URL:</strong> 
                  <a href={results.publicUrlTest.generatedUrl} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:underline ml-1">
                    {results.publicUrlTest.generatedUrl}
                  </a>
                </p>
                <p><strong>File Name:</strong> {results.publicUrlTest.fileName}</p>
                <p><strong>URL Accessible:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    results.publicUrlTest.urlAccessible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {results.publicUrlTest.urlAccessible ? 'YES' : 'NO'}
                  </span>
                </p>
                
                {/* Test image display */}
                <div className="mt-3">
                  <p><strong>Test Image Display:</strong></p>
                  <div className="mt-2 p-2 border rounded">
                    <img 
                      src={results.publicUrlTest.storedUrl} 
                      alt="Test image"
                      className="max-w-xs max-h-32 object-contain"
                      onLoad={() => console.log('✅ Test image loaded successfully')}
                      onError={(e) => {
                        console.error('❌ Test image failed to load');
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTE1IDEySDlNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDcuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSIjOUI5QkEwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-3 rounded border">
            <h4 className="font-medium">Authentication:</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(results.auth, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
