/**
 * ServiceRecommendations
 * UI-Komponente für Cyber-Service-Empfehlungen als Kacheln auf der Kunden-Übersichtsseite.
 * Zeigt je nach Segment passende Marketing-Snippets für Zurich Resilience Solutions an.
 */

import React from 'react';

// Mögliche Zielgruppen-Segmente für Empfehlungen
export type ServiceRecommendationSegment =
  | 'highRisk' // erhöhtes Cyberrisiko
  | 'lowMaturity' // geringe IT-Maturität
  | 'postPolicy' // nach Versicherungsabschluss
  | 'interested' // bereits Interesse gezeigt
  | 'critical' // besonders gefährdet
  | 'generic' // allgemeine Empfehlung
  | 'story'; // Storytelling

interface ServiceRecommendationsProps {
  /**
   * Optional: aktuelles Segment / Kontext des Kunden.
   * Wird genutzt, um passende Empfehlungen zu priorisieren.
   */
  segment?: ServiceRecommendationSegment;
}

interface RecommendationTile {
  id: string;
  title: string;
  description: string;
  segments: ServiceRecommendationSegment[] | 'all';
  href: string;
}

// Zentrale Definition aller Kacheln
const ALL_TILES: RecommendationTile[] = [
  {
    id: 'trigger-protection',
    title: 'Cyberrisiko erkannt? Jetzt Schutz erhöhen.',
    description:
      'Ihr Risikoprofil zeigt Schwachstellen in der Cybersicherheit. Mit unseren Cyber Services bauen Sie gezielt Schutz auf – bevor ein Angriff passiert.',
    segments: 'all',
    href: '/services/cyber/high-risk',
  },
  {
    id: 'high-risk-resilience',
    title: 'Erkennen Sie Ihr Risiko – stärken Sie Ihre Resilienz.',
    description:
      'Cyberangriffe treffen Unternehmen jeder Grösse. Unsere Cyber Services helfen Ihnen, Schwachstellen früh zu erkennen und Ihr Sicherheitsniveau gezielt zu erhöhen.',
    segments: ['highRisk', 'critical', 'generic'],
    href: '/services/cyber/high-risk',
  },
  {
    id: 'low-maturity-simple',
    title: 'Cybersicherheit muss nicht kompliziert sein.',
    description:
      'Sie wissen, dass Sie mehr tun sollten, aber nicht, wo Sie starten? Zurich Resilience Solutions begleitet Sie Schritt für Schritt von der Risikoanalyse bis zu wirksamen Massnahmen.',
    segments: ['lowMaturity', 'generic'],
    href: '/services/cyber/low-maturity',
  },
  {
    id: 'post-policy-services',
    title: 'Ihre Versicherung schützt – unsere Services stärken.',
    description:
      'Finanziell sind Sie abgesichert. Mit unseren Cyber Services erhöhen Sie zusätzlich Ihre Widerstandsfähigkeit und verhindern Vorfälle, bevor sie entstehen.',
    segments: ['postPolicy', 'generic'],
    href: '/services/cyber/post-policy',
  },
  {
    id: 'interested-next-step',
    title: 'Bereit für den nächsten Schritt in der Cybersicherheit?',
    description:
      'Sie haben sich bereits mit Cyberrisiken beschäftigt. Nutzen Sie jetzt unsere Cyber Services für fundierte Risiko-Einschätzungen und passgenaue Schutzmassnahmen.',
    segments: ['interested', 'generic'],
    href: '/services/cyber/interested',
  },
  {
    id: 'critical-act-now',
    title: 'Hohe Cyberexponierung? Handeln Sie jetzt.',
    description:
      'Ihr Risikoprofil ist erhöht. Unsere Cyber Services helfen Ihnen, Schwachstellen zu reduzieren und Angriffe wirksam abzuwehren – bevor sie Schaden anrichten.',
    segments: ['highRisk', 'critical'],
    href: '/services/cyber/critical',
  },
  {
    id: 'generic-resilience',
    title: 'Zukunftssichere Cyberresilienz für jedes Unternehmen.',
    description:
      'Mit unseren Cyber Services erkennen Sie Risiken frühzeitig, verbessern Ihren Schutz und wehren Angriffe proaktiv ab – mit massgeschneiderten Lösungen aus einer Hand.',
    segments: ['generic'],
    href: '/services/cyber/overview',
  },
  {
    id: 'story-preparedness',
    title: 'Ein Angriff kann jeden treffen – Vorbereitung macht den Unterschied.',
    description:
      'Cybervorfälle passieren täglich. Unsere Cyber Services zeigen Ihnen klar, welche Schritte Ihr Unternehmen widerstandsfähiger machen – mit messbarem Effekt.',
    segments: ['story', 'generic'],
    href: '/services/cyber/story',
  },
];

/**
 * Wählt genau EINE Empfehlungskachel basierend auf dem Segment aus.
 */
function selectTile(segment?: ServiceRecommendationSegment): RecommendationTile | null {
  if (!segment) {
    return ALL_TILES.find((t) => t.id === 'generic-resilience') ?? null;
  }

  const preferredIdBySegment: Record<ServiceRecommendationSegment, string> = {
    highRisk: 'high-risk-resilience',
    lowMaturity: 'low-maturity-simple',
    postPolicy: 'post-policy-services',
    interested: 'interested-next-step',
    critical: 'critical-act-now',
    generic: 'generic-resilience',
    story: 'story-preparedness',
  };

  const preferredId = preferredIdBySegment[segment];
  const preferred = ALL_TILES.find((t) => t.id === preferredId);
  if (preferred) return preferred;

  // Fallback: erste Kachel, die zum Segment passt
  const fallback = ALL_TILES.find((tile) => {
    if (tile.segments === 'all') return true;
    return tile.segments.includes(segment);
  });

  return fallback ?? null;
}

export function ServiceRecommendations({ segment }: ServiceRecommendationsProps) {
  const tile = selectTile(segment);

  if (!tile) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-base-content">
            Empfohlene Cyber Services
          </h2>
          <p className="text-xs text-base-content/70">
            Basierend auf Ihrem Risikoprofil: passende Services von Zurich Resilience Solutions.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <article className="card bg-base-100 shadow-sm border border-base-200/80 hover:border-primary/60 transition-colors h-full">
          <div className="card-body p-4 flex flex-col gap-3">
            <h3 className="card-title text-sm leading-snug">
              {tile.title}
            </h3>
            <p className="text-xs text-base-content/70 leading-relaxed">
              {tile.description}
            </p>
            <div className="mt-2">
              <a href={tile.href} className="btn btn-xs btn-outline rounded-full">
                Mehr zu Cyber Services
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
