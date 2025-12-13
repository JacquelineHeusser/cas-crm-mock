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
    title: 'Cyberrisiko erkannt? Jetzt gezielt Schutz erhöhen.',
    description:
      'Ihr Risikoprofil zeigt, dass Angriffe realistisch sind – oft reichen wenige technische oder organisatorische Lücken. Unsere Cyber Services kombinieren Analyse, Empfehlungen und Umsetzungshilfe, damit Sie priorisiert dort investieren, wo es den grössten Effekt auf Ihr Risiko hat.',
    segments: 'all',
    href: '/services/cyber/high-risk',
  },
  {
    id: 'high-risk-resilience',
    title: 'Erhöhtes Risiko? Fokus auf Resilienz statt nur auf Reaktion.',
    description:
      'Bei einem hohen Risk Score steigt die Wahrscheinlichkeit schwerer Vorfälle deutlich. Mit unseren Cyber Services erhalten Sie eine strukturierte Schwachstellenanalyse, konkrete Massnahmenpläne und – falls gewünscht – Begleitung bei der Umsetzung, um Ihr Restrisiko messbar zu senken.',
    segments: ['highRisk', 'critical', 'generic'],
    href: '/services/cyber/high-risk',
  },
  {
    id: 'low-maturity-simple',
    title: 'Cybersicherheit pragmatisch aufbauen – Schritt für Schritt.',
    description:
      'Viele KMU haben keine eigene Security-Abteilung. Wir starten mit einem einfachen Check Ihres heutigen Setups, leiten daraus priorisierte To-dos ab und unterstützen Sie dabei, mit wenigen, gut verständlichen Massnahmen ein deutlich stabileres Sicherheitsniveau zu erreichen.',
    segments: ['lowMaturity', 'generic'],
    href: '/services/cyber/low-maturity',
  },
  {
    id: 'post-policy-services',
    title: 'Ihre Versicherung schützt – unsere Services stärken.',
    description:
      'Die Police hilft im Schadenfall – ideal ist es, wenn es gar nicht erst so weit kommt. Mit unseren Cyber Services senken Sie die Eintrittswahrscheinlichkeit von Vorfällen, verkürzen Ausfallzeiten und erhöhen gleichzeitig die Sicherheit Ihrer Mitarbeitenden im Umgang mit Cyberrisiken.',
    segments: ['postPolicy', 'generic'],
    href: '/services/cyber/post-policy',
  },
  {
    id: 'interested-next-step',
    title: 'Von Awareness zu konkreten Verbesserungen.',
    description:
      'Sie beschäftigen sich bereits mit Cyber – der nächste Schritt ist, die richtigen Prioritäten zu setzen. Unsere Expert:innen unterstützen Sie dabei, Ihre bestehenden Massnahmen einzuordnen, Lücken zu identifizieren und ein Roadmap-ähnliches Vorgehen für die nächsten 12–24 Monate zu definieren.',
    segments: ['interested', 'generic'],
    href: '/services/cyber/interested',
  },
  {
    id: 'critical-act-now',
    title: 'Hohe Cyberexponierung? Sofortmassnahmen und Priorisierung.',
    description:
      'Bei sehr hoher Exponierung (z. B. Score D/E) empfehlen wir gezielte Sofortmassnahmen: Absicherung kritischer Systeme, Härtung von Zugängen und Schulung besonders exponierter Mitarbeitender. Unsere Cyber Services helfen Ihnen, zwischen „jetzt sofort“ und „im nächsten Schritt“ klar zu unterscheiden.',
    segments: ['highRisk', 'critical'],
    href: '/services/cyber/critical',
  },
  {
    id: 'generic-resilience',
    title: 'Cyberresilienz für den Alltag – nicht nur für Ausnahmesituationen.',
    description:
      'Unsere Cyber Services verbinden technische Checks, organisatorische Massnahmen und Sensibilisierung Ihrer Mitarbeitenden. So schaffen Sie eine Sicherheitskultur, die im Alltag funktioniert und im Ernstfall dafür sorgt, dass Ihr Unternehmen arbeitsfähig bleibt.',
    segments: ['generic'],
    href: '/services/cyber/overview',
  },
  {
    id: 'story-preparedness',
    title: 'Wenn der Ernstfall eintritt – wie gut ist Ihr Unternehmen vorbereitet?',
    description:
      'Aus realen Schadenfällen wissen wir: Tempo und Klarheit in den ersten Stunden entscheiden über die Höhe des Schadens. Mit unseren Cyber Services üben Sie Abläufe, definieren Verantwortlichkeiten und stellen sicher, dass im Vorfall alle wissen, was zu tun ist.',
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
