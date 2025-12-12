import { PrismaClient, UserRole, QuoteStatus, RiskScore, UnderwritingStatus, UnderwritingDecision } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Test-Unternehmen erstellen
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Swiss Tech GmbH',
        address: 'Technikstrasse 12',
        zip: '8005',
        city: 'Zürich',
        country: 'CH',
        url: 'https://swisstech.ch',
        industry: 'IT-Dienstleistungen',
        revenue: 5000000n, // 50'000 CHF in Rappen
        employees: 25,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Bau AG Basel',
        address: 'Bauplatz 1',
        zip: '4051',
        city: 'Basel',
        country: 'CH',
        url: 'https://bauag.ch',
        industry: 'Baugewerbe',
        revenue: 10000000n, // 100'000 CHF in Rappen
        employees: 50,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Legal Partners',
        address: 'Rechtsweg 5',
        zip: '3000',
        city: 'Bern',
        country: 'CH',
        url: 'https://legalpartners.ch',
        industry: 'Rechtsberatung',
        revenue: 3000000n, // 30'000 CHF in Rappen
        employees: 15,
      },
    }),
  ]);

  // Test-Vermittler erstellen
  const brokers = await Promise.all([
    prisma.broker.create({
      data: {
        name: 'Maria Schneider',
        company: 'SwissQuality Versicherungsmakler AG',
        location: 'Zürich',
        email: 'maria.schneider@swissquality.ch',
        phone: '+41 44 123 45 67',
      },
    }),
    prisma.broker.create({
      data: {
        name: 'Thomas Weber',
        company: 'Alpen Versicherungen GmbH',
        location: 'Bern',
        email: 'thomas.weber@alpen-vers.ch',
        phone: '+41 31 987 65 43',
      },
    }),
    prisma.broker.create({
      data: {
        name: 'Sandra Keller',
        company: 'Basel Insurance Brokers',
        location: 'Basel',
        email: 'sandra.keller@basel-insurance.ch',
        phone: '+41 61 555 12 34',
      },
    }),
    prisma.broker.create({
      data: {
        name: 'Marc Lindemann',
        company: 'Romandie Assurances SA',
        location: 'Genf',
        email: 'marc.lindemann@romandie-assur.ch',
        phone: '+41 22 789 01 23',
      },
    }),
    prisma.broker.create({
      data: {
        name: 'Julia Meier',
        company: 'Zürich Versicherungsberatung',
        location: 'Winterthur',
        email: 'julia.meier@zh-versicherung.ch',
        phone: '+41 52 345 67 89',
      },
    }),
  ]);

  console.log(`Created ${brokers.length} test brokers`);

  // Test-Benutzer erstellen
  const users = await Promise.all([
    // Firmenkunden
    prisma.user.create({
      data: {
        email: 'kontakt@swisstech.ch',
        name: 'Hans Meier',
        role: UserRole.CUSTOMER,
        companyId: companies[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'info@bauag.ch',
        name: 'Anna Bauer',
        role: UserRole.CUSTOMER,
        companyId: companies[1].id,
      },
    }),
    // Vermittler
    prisma.user.create({
      data: {
        email: 'broker@swissquality.ch',
        name: 'Peter Broker',
        role: UserRole.BROKER,
        companyId: companies[2].id,
      },
    }),
    // Underwriter
    prisma.user.create({
      data: {
        email: 'underwriter@zurich.ch',
        name: 'Sabine Underwriter',
        role: UserRole.UNDERWRITER,
      },
    }),
    // MFU Teamleiter (kann Risk Score C freigeben)
    prisma.user.create({
      data: {
        email: 'mfu.teamleiter@zurich.ch',
        name: 'Thomas Müller',
        role: UserRole.MFU_TEAMLEITER,
      },
    }),
    // Head Cyber Underwriting (kann Risk Score D freigeben)
    prisma.user.create({
      data: {
        email: 'head.cyber@zurich.ch',
        name: 'Dr. Sarah Schmidt',
        role: UserRole.HEAD_CYBER_UNDERWRITING,
      },
    }),
  ]);

  // Test-Offerten erstellen
  const quotes = await Promise.all([
    // Offerte mit Score A (direkter Abschluss)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-001',
        companyId: companies[0].id,
        userId: users[0].id,
        status: QuoteStatus.APPROVED,
        companyData: {
          companyName: companies[0].name,
          address: companies[0].address,
          zip: companies[0].zip,
          city: companies[0].city,
          country: companies[0].country,
          url: companies[0].url,
        },
        cyberRiskProfile: {
          industry: 'Information',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft zu',
          employees: companies[0].employees,
          revenue: 5000000,
          eCommercePercentage: '1 - 25%',
          foreignRevenuePercentage: '0%',
        },
        cyberSecurity: {
          hadCyberIncidents: 'Nein',
          personalDataCount: 'Bis 10\'000',
          medicalDataCount: 'Keine',
          creditCardDataCount: 'Keine oder durch einen externen Dienstleister verarbeitet',
          hasEndOfLifeSystems: 'Nein',
        },
        coverage: {
          package: 'OPTIMUM',
          sumInsuredProperty: 'CHF 1\'000\'000',
          sumInsuredLiability: 'CHF 1\'000\'000',
          sumInsuredCyberCrime: 'CHF 100\'000',
          deductible: 'CHF 1\'000',
          waitingPeriod: '24h',
        },
        riskScore: RiskScore.A,
        riskScoreReason: 'Sehr gute IT-Sicherheit, keine Vorfälle, moderne Systeme',
        premium: 250000n, // 2'500 CHF
      },
    }),
    // Offerte mit Score B (direkter Abschluss)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-002',
        companyId: companies[1].id,
        userId: users[1].id,
        status: QuoteStatus.APPROVED,
        companyData: {
          companyName: companies[1].name,
          address: companies[1].address,
          zip: companies[1].zip,
          city: companies[1].city,
          country: companies[1].country,
          url: companies[1].url,
        },
        cyberRiskProfile: {
          industry: 'Bauwesen',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft zu',
          employees: companies[1].employees,
          revenue: 10000000,
          eCommercePercentage: '0%',
          foreignRevenuePercentage: '0%',
        },
        cyberSecurity: {
          hadCyberIncidents: 'Nein',
          personalDataCount: 'Bis 10\'000',
          medicalDataCount: 'Keine',
          creditCardDataCount: 'Keine oder durch einen externen Dienstleister verarbeitet',
          hasEndOfLifeSystems: 'Nein',
        },
        coverage: {
          package: 'OPTIMUM',
          sumInsuredProperty: 'CHF 1\'000\'000',
          sumInsuredLiability: 'CHF 1\'000\'000',
          sumInsuredCyberCrime: 'CHF 100\'000',
          deductible: 'CHF 1\'000',
          waitingPeriod: '24h',
        },
        riskScore: RiskScore.B,
        riskScoreReason: 'Gute IT-Sicherheit, solide Prozesse',
        premium: 300000n, // 3'000 CHF
      },
    }),
    // Offerte mit Score C (braucht MFU Teamleiter)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-003',
        companyId: companies[0].id,
        userId: users[0].id,
        status: QuoteStatus.PENDING_UNDERWRITING,
        companyData: {
          companyName: companies[1].name,
          address: companies[1].address,
          zip: companies[1].zip,
          city: companies[1].city,
          country: companies[1].country,
          url: companies[1].url,
        },
        cyberRiskProfile: {
          industry: 'Bauwesen',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft zu',
          employees: companies[1].employees,
          revenue: 10000000,
          eCommercePercentage: '0%',
          foreignRevenuePercentage: '0%',
        },
        cyberSecurity: {
          hadCyberIncidents: 'Ja',
          personalDataCount: 'Bis 1\'000',
          medicalDataCount: 'Keine',
          creditCardDataCount: 'Keine oder durch einen externen Dienstleister verarbeitet',
          hasEndOfLifeSystems: 'Ja',
        },
        coverage: {
          package: 'BASIC',
          sumInsuredProperty: 'CHF 500\'000',
          sumInsuredLiability: 'CHF 500\'000',
          sumInsuredCyberCrime: 'CHF 50\'000',
          deductible: 'CHF 2\'500',
          waitingPeriod: '48h',
        },
        riskScore: RiskScore.C,
        riskScoreReason: 'Einige Schwachstellen, aber behebbar',
        premium: 400000n, // 4'000 CHF
      },
    }),
    // Offerte mit Score D (braucht Head Cyber Underwriting)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-004',
        companyId: companies[2].id,
        userId: users[0].id,
        status: QuoteStatus.PENDING_UNDERWRITING,
        companyData: {
          companyName: companies[2].name,
          address: companies[2].address,
          zip: companies[2].zip,
          city: companies[2].city,
          country: companies[2].country,
          url: companies[2].url,
        },
        cyberRiskProfile: {
          industry: 'Beratungs-, Wissenschafts- und technische Dienstleistungen',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft zu',
          employees: companies[2].employees,
          revenue: 3000000,
          eCommercePercentage: '0%',
          foreignRevenuePercentage: '1 - 25%',
        },
        cyberSecurity: {
          hadCyberIncidents: 'Ja',
          personalDataCount: 'Bis 100\'000',
          medicalDataCount: 'Keine',
          creditCardDataCount: 'Nur von Mitarbeitenden',
          hasEndOfLifeSystems: 'Ja',
        },
        coverage: {
          package: 'BASIC',
          sumInsuredProperty: 'CHF 250\'000',
          sumInsuredLiability: 'CHF 500\'000',
          sumInsuredCyberCrime: 'CHF 50\'000',
          deductible: 'CHF 5\'000',
          waitingPeriod: '48h',
        },
        riskScore: RiskScore.D,
        riskScoreReason: 'Erhebliche Sicherheitsmängel, mehrere Risikofaktoren',
        premium: 600000n, // 6'000 CHF
      },
    }),
    // Offerte mit Score E (nicht versicherbar)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-005',
        companyId: companies[2].id,
        userId: users[2].id,
        status: QuoteStatus.REJECTED,
        companyData: {
          companyName: companies[2].name,
          address: companies[2].address,
          zip: companies[2].zip,
          city: companies[2].city,
          country: companies[2].country,
          url: companies[2].url,
        },
        cyberRiskProfile: {
          industry: 'Beratungs-, Wissenschafts- und technische Dienstleistungen',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft nicht zu',
          employees: companies[2].employees,
          revenue: 3000000,
          eCommercePercentage: '0%',
          foreignRevenuePercentage: '1 - 25%',
        },
        cyberSecurity: {
          hadCyberIncidents: 'Ja',
          personalDataCount: 'Bis 100\'000',
          medicalDataCount: 'Keine',
          creditCardDataCount: 'Nur von Mitarbeitenden',
          hasEndOfLifeSystems: 'Ja',
        },
        coverage: {
          package: 'BASIC',
          sumInsuredProperty: 'CHF 250\'000',
          sumInsuredLiability: 'CHF 500\'000',
          sumInsuredCyberCrime: 'CHF 50\'000',
          deductible: 'CHF 5\'000',
          waitingPeriod: '48h',
        },
        riskScore: RiskScore.E,
        riskScoreReason: 'Veraltete Systeme, keine Sicherheitsmassnahmen, mehrere Vorfälle',
        premium: 800000n, // 8'000 CHF
      },
    }),
    // Broker-Offerte für Swiss Tech (Score B - vom Broker erstellt)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-006',
        companyId: companies[0].id,
        userId: users[2].id,        // Broker hat erstellt
        customerId: users[0].id,    // Für SwissTech-Kunde (Hans Meier)
        brokerId: brokers[0].id,    // Maria Schneider
        status: QuoteStatus.APPROVED,
        companyData: {
          companyName: companies[0].name,
          address: companies[0].address,
          zip: companies[0].zip,
          city: companies[0].city,
          country: companies[0].country,
          url: companies[0].url,
        },
        cyberRiskProfile: {
          industry: 'Information',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft zu',
          employees: companies[0].employees,
          revenue: 5000000,
          eCommercePercentage: '1 - 25%',
          foreignRevenuePercentage: '0%',
        },
        cyberSecurity: {
          hadCyberIncidents: 'Nein',
          personalDataCount: 'Bis 10\'000',
          medicalDataCount: 'Keine',
          creditCardDataCount: 'Keine oder durch einen externen Dienstleister verarbeitet',
          hasEndOfLifeSystems: 'Nein',
        },
        coverage: {
          package: 'PREMIUM',
          sumInsuredProperty: 'CHF 2\'000\'000',
          sumInsuredLiability: 'CHF 2\'000\'000',
          sumInsuredCyberCrime: 'CHF 250\'000',
          deductible: 'CHF 500',
          waitingPeriod: '12h',
        },
        riskScore: RiskScore.B,
        riskScoreReason: 'Gute IT-Sicherheit, professionelle Beratung durch Vermittler',
        premium: 350000n, // 3'500 CHF
      },
    }),
  ]);

  // Underwriting-Fälle für Score C, D und E
  await Promise.all([
    // Score C - ausstehend, braucht MFU Teamleiter
    prisma.underwritingCase.create({
      data: {
        quoteId: quotes[2].id, // Score C
        underwriterId: users[3].id, // Normaler Underwriter
        status: UnderwritingStatus.PENDING,
        notes: '',
        internalNotes: 'Score C - benötigt Freigabe von MFU Teamleiter',
      },
    }),
    // Score D - ausstehend, braucht Head Cyber Underwriting
    prisma.underwritingCase.create({
      data: {
        quoteId: quotes[3].id, // Score D
        underwriterId: users[3].id, // Normaler Underwriter
        status: UnderwritingStatus.PENDING,
        notes: '',
        internalNotes: 'Score D - benötigt Freigabe von Head Cyber Underwriting',
      },
    }),
    // Score E - nicht versicherbar
    prisma.underwritingCase.create({
      data: {
        quoteId: quotes[4].id, // Score E
        underwriterId: users[3].id,
        status: UnderwritingStatus.REJECTED,
        decision: UnderwritingDecision.REJECT,
        notes: 'Aktuell nicht versicherbar - grundlegende Sicherheitsmassnahmen fehlen. Bitte kontaktieren Sie uns nach Verbesserung Ihrer IT-Sicherheit erneut.',
        internalNotes: 'Score E - nicht versicherbar, erst nach kompletter IT-Modernisierung prüfen',
      },
    }),
  ]);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
