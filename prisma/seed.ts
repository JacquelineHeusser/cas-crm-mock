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
    // Zusätzliche Firmenkunden speziell für den Broker-User
    prisma.company.create({
      data: {
        name: 'KMU Consulting AG',
        address: 'Beraterweg 7',
        zip: '9000',
        city: 'St. Gallen',
        country: 'CH',
        url: 'https://kmu-consulting.ch',
        industry: 'Unternehmensberatung',
        revenue: 7500000n, // 75'000 CHF in Rappen
        employees: 30,
      },
    }),
    prisma.company.create({
      data: {
        name: 'Alpen Logistik GmbH',
        address: 'Logistikpark 3',
        zip: '6003',
        city: 'Luzern',
        country: 'CH',
        url: 'https://alpenlogistik.ch',
        industry: 'Logistik',
        revenue: 12500000n, // 125'000 CHF in Rappen
        employees: 80,
      },
    }),
  ]);

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
    // Offerte mit Score C (braucht Underwriting)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-002',
        companyId: companies[1].id,
        userId: users[1].id,
        status: QuoteStatus.CALCULATED,
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
        riskScoreReason: 'Veraltete Systeme, früherer Vorfall',
        premium: 400000n, // 4'000 CHF
      },
    }),
    // Offerte mit Score E (sehr schlecht)
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-003',
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
    // Zusätzliche Offerte für Broker-User bei KMU Consulting AG
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-004',
        companyId: companies[3].id,
        userId: users[2].id, // Broker
        status: QuoteStatus.CALCULATED,
        companyData: {
          companyName: companies[3].name,
          address: companies[3].address,
          zip: companies[3].zip,
          city: companies[3].city,
          country: companies[3].country,
          url: companies[3].url,
        },
        cyberRiskProfile: {
          industry: 'Beratung',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft zu',
          employees: companies[3].employees,
          revenue: 7500000,
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
          sumInsuredCyberCrime: 'CHF 150\'000',
          deductible: 'CHF 2\'000',
          waitingPeriod: '24h',
        },
        riskScore: RiskScore.B,
        riskScoreReason: 'Solide IT-Sicherheitsmassnahmen, keine Vorfälle',
        premium: 350000n, // 3'500 CHF
      },
    }),
    // Zusätzliche Offerte für Broker-User bei Alpen Logistik GmbH
    prisma.quote.create({
      data: {
        quoteNumber: 'Z1-2024-005',
        companyId: companies[4].id,
        userId: users[2].id, // Broker
        status: QuoteStatus.APPROVED,
        companyData: {
          companyName: companies[4].name,
          address: companies[4].address,
          zip: companies[4].zip,
          city: companies[4].city,
          country: companies[4].country,
          url: companies[4].url,
        },
        cyberRiskProfile: {
          industry: 'Transport und Logistik',
          noForeignSubsidiaries: 'Trifft zu',
          noRejectedInsurance: 'Trifft zu',
          employees: companies[4].employees,
          revenue: 12500000,
          eCommercePercentage: '1 - 25%',
          foreignRevenuePercentage: '1 - 25%',
        },
        cyberSecurity: {
          hadCyberIncidents: 'Nein',
          personalDataCount: 'Bis 50\'000',
          medicalDataCount: 'Keine',
          creditCardDataCount: 'Nur von Mitarbeitenden',
          hasEndOfLifeSystems: 'Nein',
        },
        coverage: {
          package: 'OPTIMUM',
          sumInsuredProperty: 'CHF 2\'000\'000',
          sumInsuredLiability: 'CHF 2\'000\'000',
          sumInsuredCyberCrime: 'CHF 200\'000',
          deductible: 'CHF 5\'000',
          waitingPeriod: '24h',
        },
        riskScore: RiskScore.B,
        riskScoreReason: 'Gute Sicherheitsmassnahmen, sensible Daten in moderatem Umfang',
        premium: 600000n, // 6'000 CHF
      },
    }),
  ]);

  // Underwriting-Fälle für Score C und E
  await Promise.all([
    prisma.underwritingCase.create({
      data: {
        quoteId: quotes[1].id,
        underwriterId: users[3].id,
        status: UnderwritingStatus.IN_REVIEW,
        notes: 'Kunde muss MFA einführen und Backup-System installieren',
        internalNotes: 'Risiko kann durch Massnahmen reduziert werden',
      },
    }),
    prisma.underwritingCase.create({
      data: {
        quoteId: quotes[2].id,
        underwriterId: users[3].id,
        status: UnderwritingStatus.REJECTED,
        decision: UnderwritingDecision.REJECT,
        notes: 'Aktuell nicht versicherbar - grundlegende Sicherheitsmassnahmen fehlen',
        internalNotes: 'Erst nach kompletter IT-Modernisierung prüfen',
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
