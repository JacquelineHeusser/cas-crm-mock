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
          name: companies[0].name,
          industry: companies[0].industry,
          employees: companies[0].employees,
        },
        itStructure: {
          systems: ['Windows Server 2022', 'Office 365', 'Backup-System'],
          endOfLifeSystems: [],
          cloudServices: ['Microsoft Azure', 'Office 365'],
        },
        securityMeasures: {
          firewall: true,
          antivirus: true,
          backup: true,
          mfa: true,
          encryption: true,
          incidentResponse: true,
        },
        incidents: {
          lastIncidents: [],
          incidentCount: 0,
        },
        coverageVariant: 'Optimum',
        sumInsured: 100000000n, // 1 Mio CHF
        deductible: 1000000n, // 10'000 CHF
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
          name: companies[1].name,
          industry: companies[1].industry,
          employees: companies[1].employees,
        },
        itStructure: {
          systems: ['Windows Server 2012', 'Alte ERP-Software'],
          endOfLifeSystems: ['Windows Server 2012'],
          cloudServices: [],
        },
        securityMeasures: {
          firewall: true,
          antivirus: true,
          backup: false,
          mfa: false,
          encryption: false,
          incidentResponse: false,
        },
        incidents: {
          lastIncidents: ['Phishing-Angriff 2023'],
          incidentCount: 1,
        },
        coverageVariant: 'Standard',
        sumInsured: 50000000n, // 500'000 CHF
        deductible: 500000n, // 5'000 CHF
        riskScore: RiskScore.C,
        riskScoreReason: 'Veraltete Systeme, fehlende MFA, früherer Vorfall',
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
          name: companies[2].name,
          industry: companies[2].industry,
          employees: companies[2].employees,
        },
        itStructure: {
          systems: ['Windows XP', 'Keine Antivirus'],
          endOfLifeSystems: ['Windows XP', 'Server 2008'],
          cloudServices: [],
        },
        securityMeasures: {
          firewall: false,
          antivirus: false,
          backup: false,
          mfa: false,
          encryption: false,
          incidentResponse: false,
        },
        incidents: {
          lastIncidents: ['Ransomware 2023', 'Data Leak 2022'],
          incidentCount: 2,
        },
        coverageVariant: 'Basic',
        sumInsured: 25000000n, // 250'000 CHF
        deductible: 250000n, // 2'500 CHF
        riskScore: RiskScore.E,
        riskScoreReason: 'Veraltete Systeme, keine Sicherheitsmassnahmen, mehrere Vorfälle',
        premium: 800000n, // 8'000 CHF
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
