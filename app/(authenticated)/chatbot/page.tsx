'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type SyncStatus = 'pending' | 'loading' | 'success' | 'error';

interface SyncState {
  policies: SyncStatus;
  web: SyncStatus;
  laws: SyncStatus;
}

export default function ChatbotPage() {
  const [syncState, setSyncState] = useState<SyncState>({
    policies: 'pending',
    web: 'pending',
    laws: 'pending',
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    syncPolicies();
  }, []);

  const syncPolicies = async () => {
    // Nur Policen synchronisieren beim Start
    setSyncState(prev => ({ ...prev, policies: 'loading' }));
    try {
      const res = await fetch('/api/embeddings/policies', { method: 'POST' });
      if (res.ok) {
        setSyncState(prev => ({ ...prev, policies: 'success' }));
      } else {
        setSyncState(prev => ({ ...prev, policies: 'error' }));
      }
    } catch (error) {
      setSyncState(prev => ({ ...prev, policies: 'error' }));
    }

    // Chatbot ist bereit (Web und Laws werden bei Bedarf live gesucht)
    setIsReady(true);
  };

  const allLoaded = syncState.policies !== 'loading';

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-light text-[#1A1A1A]">
          Versicherungs-Assistent
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Fragen zu Policen, Versicherungen und rechtlichen Grundlagen
        </p>
      </div>

      {/* Loading Overlay */}
      {!allLoaded && (
        <div className="bg-[#D9E8FC] rounded-lg p-6 mb-6">
          <h3 className="text-[#0032A0] font-medium mb-4">Policen werden geladen...</h3>
          <div className="space-y-3">
            <SyncStatusItem 
              label="Policen" 
              status={syncState.policies} 
            />
          </div>
          <p className="text-xs text-[#0032A0] mt-3">
            Weitere Informationen werden bei Bedarf live aus dem Internet abgerufen.
          </p>
        </div>
      )}

      {/* Chat Container */}
      <div 
        className={`bg-white rounded-lg shadow-sm overflow-hidden transition-opacity ${
          allLoaded ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`} 
        style={{ height: 'calc(100vh - 320px)' }}
      >
        <ChatInterface />
      </div>

      {/* Info Text */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>
          Dieser Chatbot nutzt RAG (Retrieval-Augmented Generation) mit Daten aus Policen. 
          Bei allgemeinen Fragen werden zusätzliche Informationen live aus dem Internet abgerufen.
        </p>
      </div>
    </div>
  );
}

function SyncStatusItem({ label, status }: { label: string; status: SyncStatus }) {
  return (
    <div className="flex items-center gap-3">
      {status === 'loading' && (
        <Loader2 className="w-5 h-5 text-[#008C95] animate-spin" />
      )}
      {status === 'success' && (
        <CheckCircle className="w-5 h-5 text-green-600" />
      )}
      {status === 'error' && (
        <XCircle className="w-5 h-5 text-red-600" />
      )}
      {status === 'pending' && (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
      <span className={`text-sm ${
        status === 'success' ? 'text-green-700' : 
        status === 'error' ? 'text-red-700' : 
        status === 'loading' ? 'text-[#0032A0] font-medium' : 
        'text-gray-600'
      }`}>
        {label}
        {status === 'loading' && '...'}
        {status === 'success' && ' ✓'}
        {status === 'error' && ' ✗'}
      </span>
    </div>
  );
}

