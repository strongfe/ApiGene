'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  usage: number;
  usage_limit: number;
  created_at: string;
  updated_at: string;
}

// maskApiKey 함수를 컴포넌트 밖으로 이동
const maskApiKey = (key: string) => {
  const prefix = key.substring(0, 3);  // 'sk-' 부분
  const suffix = key.substring(key.length - 4);  // 마지막 4자리
  return `${prefix}${'*'.repeat(20)}${suffix}`;
};

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      if (!response.ok) {
        throw new Error('API 키 목록을 불러는데 실패했습니다.');
      }
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('API 키 목록을 불러오는데 실패했습니다.');
    }
  };

  const createApiKey = async (limit: number) => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newKeyName,
          limit: limit 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('서버 응답:', errorData);
        throw new Error(errorData.message || '알 수 없는 오류');
      }

      const data = await response.json();
      setApiKeys([...apiKeys, data]);
      setNewKeyName('');
      setShowCreateModal(false);
      toast.success('API 키가 생성되었습니다.');
    } catch (error: unknown) {  // any 대신 unknown 사용
      const errorMessage = error instanceof Error 
        ? error.message 
        : '알 수 없는 오류가 발생했습니다';
      toast.error(`API 키 생성 실패: ${errorMessage}`);
    }
  };

  const updateApiKey = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '알 수 없는 오류');
      }

      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, name: newName } : key
      ));
      setShowEditModal(false);
      toast.success('API 키가 수정되었습니다.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '알 수 없는 오류가 발생했습니다';
      toast.error(`API 키 수정 실패: ${errorMessage}`);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!confirm('정말로 이 API 키를 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/keys/${id}`, { 
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '알 수 없는 오류');
      }

      setApiKeys(apiKeys.filter(key => key.id !== id));
      toast.success('API 키가 삭제되었습니다.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '알 수 없는 오류가 발생했습니다';
      toast.error(`API 키 삭제 실패: ${errorMessage}`);
    }
  };

  const copyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast.success('API 키가 클립보드에 복사되었습니다.');
    } catch {
      toast.error('API 키 복사에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const CreateKeyModal = () => {
    const [limit, setLimit] = useState<number>(1000);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[480px]">
          <h3 className="text-xl font-semibold mb-4">새 API 키 생성</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            새 API 키의 이름과 사용량 제한을 입력하세요.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                키 이름 — 이 키를 구분할 수 있는 고유한 이름
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="API 키 이름"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                월간 사용량 제한*
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min="0"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="mt-2 text-sm text-gray-500">
                * 모든 키의 총 사용량이 플랜의 제한을 초과하면 요청이 거부됩니다.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setNewKeyName('');
              }}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded"
            >
              취소
            </button>
            <button
              onClick={() => createApiKey(limit)}
              disabled={!newKeyName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              생성
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EditKeyModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">API 키 수정</h3>
        <input
          type="text"
          value={editingKey?.name || ''}
          onChange={(e) => {
            if (editingKey) {
              setEditingKey(prev => ({
                ...prev!,
                name: e.target.value
              }));
            }
          }}
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            취소
          </button>
          <button
            onClick={() => editingKey && updateApiKey(editingKey.id, editingKey.name)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );

  const ApiKeyRow: React.FC<{ apiKey: ApiKey }> = ({ apiKey }) => {
    const [showKey, setShowKey] = useState(false);

    return (
      <tr className="border-b dark:border-gray-700">
        <td className="px-6 py-4">{apiKey.name}</td>
        <td className="px-6 py-4 flex items-center gap-2">
          <span className="font-mono">
            {showKey ? apiKey.key : maskApiKey(apiKey.key)}
          </span>
          <button 
            onClick={() => setShowKey(!showKey)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {showKey ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        </td>
        <td className="px-6 py-4">
          {apiKey.usage} / {apiKey.usage_limit}
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button 
              onClick={() => copyApiKey(apiKey.key)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <CopyIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setEditingKey(apiKey);
                setShowEditModal(true);
              }}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => deleteApiKey(apiKey.id)}
              className="p-2 text-red-500 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      {showCreateModal && <CreateKeyModal />}
      {showEditModal && <EditKeyModal />}
      
      <div className="max-w-6xl mx-auto">
        {/* Current Plan Card */}
        <div className="bg-gradient-to-r from-purple-600 to-amber-400 p-6 rounded-xl text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm mb-2">CURRENT PLAN</div>
              <h1 className="text-3xl font-bold">Researcher</h1>
              <div className="mt-4">
                <div className="text-sm mb-1">API Limit</div>
                <div className="text-sm">24/1,000 Requests</div>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm">
              Manage Plan
            </button>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">API Keys</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                + Create New Key
              </button>
            </div>
          </div>

          {/* API Keys Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">이름</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">키</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">사용량/제한</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">옵션</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((apiKey) => (
                  <ApiKeyRow key={apiKey.id} apiKey={apiKey} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
// 아이콘 컴포넌트들
const CopyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const EditIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

