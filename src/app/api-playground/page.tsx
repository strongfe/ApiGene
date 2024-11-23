'use client';

import { useState } from 'react';

export default function ApiPlayground() {
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/protected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: apiKey })
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API 키 테스트</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">API 키</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="API 키를 입력하세요"
          />
        </div>

        <button
          onClick={testApiKey}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '테인 중...' : 'API 키 확인'}
        </button>

        {result && (
          <div className="mt-4 p-4 rounded border">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 