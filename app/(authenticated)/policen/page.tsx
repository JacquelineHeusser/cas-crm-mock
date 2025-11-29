/**
 * Meine Policen Übersicht
 * Zeigt alle Policen des Users
 */

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function PolicenPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Lade alle Policen des Users aus der Datenbank
  const policies = await prisma.policy.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      company: true,
    },
  });

  // Extrahiere Vornamen
  const firstName = user.name.split(' ')[0];
  
  // Formatiere Prämie
  const formatPremium = (premium: bigint) => {
    const amount = Number(premium) / 100; // Rappen zu CHF
    return `CHF ${amount.toLocaleString('de-CH')}`;
  };
  
  // Status Badge Farben
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Aktiv', class: 'bg-[#CADB2D] text-[#0032A0]' };
      case 'CANCELLED':
        return { label: 'Gekündigt', class: 'bg-red-100 text-red-700' };
      case 'EXPIRED':
        return { label: 'Abgelaufen', class: 'bg-gray-100 text-gray-700' };
      default:
        return { label: status, class: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-light text-[#1A1A1A] mb-2">
          Guten Tag {firstName}
        </h1>
        <p className="text-gray-600 text-sm mb-8">
          Wir sind immer für Sie da.
        </p>

        {/* Meine Policen Section */}
        <div>
          <h2 className="text-2xl font-light text-[#0032A0] mb-6">Meine Policen</h2>

          {/* Policen Cards */}
          <div className="space-y-4">
            {policies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500">Noch keine Policen vorhanden</p>
                <p className="text-sm text-gray-400 mt-2">
                  Schliessen Sie eine Versicherung über "Meine Offerten" ab
                </p>
              </div>
            ) : (
              policies.map((policy) => {
                const statusBadge = getStatusBadge(policy.status);
                const coverageData = policy.coverage as any;
                const companyName = policy.company?.name || coverageData?.companyName || 'Unbekannt';
                const startDate = new Date(policy.startDate).toLocaleDateString('de-CH');
                
                return (
                  <Link 
                    key={policy.id} 
                    href={`/policen/${policy.id}`}
                    className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer block"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-[#008C95] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-[#0032A0] mb-2">
                          {companyName} - Cyberversicherung
                        </h3>
                        <div className="flex gap-8 text-sm text-gray-600">
                          <span>Policennummer {policy.policyNumber}</span>
                          <span>Gültig ab {startDate}</span>
                        </div>
                      </div>
                      <div className="text-right mr-6">
                        <p className="text-sm text-gray-600 mb-1">Jahresprämie</p>
                        <p className="text-lg font-medium text-[#1A1A1A]">
                          {formatPremium(policy.premium)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${statusBadge.class}`}>
                          {statusBadge.label}
                        </span>
                        <ChevronRight className="text-gray-400" size={24} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
