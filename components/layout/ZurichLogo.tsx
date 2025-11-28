/**
 * Zurich Logo Component
 * Verwendet das originale Zurich Logo Bild 1:1
 */

import Image from 'next/image';

interface ZurichLogoProps {
  height?: number;
  className?: string;
}

export default function ZurichLogo({ height = 32, className = '' }: ZurichLogoProps) {
  return (
    <Image
      src="/zurich-logo.png"
      alt="Zurich"
      width={height * 5.2}
      height={height}
      className={className}
      priority
    />
  );
}
