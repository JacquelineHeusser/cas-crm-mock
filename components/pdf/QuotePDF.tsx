/**
 * PDF-Komponente für Cyberversicherungs-Offerte
 * Zeigt alle erfassten Daten in einem druckbaren Format
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { PACKAGES } from '@/lib/validation/premium-schema';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    // Helvetica dient hier als Ersatz für die Zurich-Hausschrift
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomColor: '#D1D5DB',
    borderBottomWidth: 1,
  },
  logo: {
    width: 100,
    height: 35,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    color: '#0032A0',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  headerMeta: {
    fontSize: 9,
    color: '#4B5563',
  },
  section: {
    marginBottom: 15,
  },
  sectionWithExtraMargin: {
    marginBottom: 20,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0032A0',
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '50%',
    color: '#000',
    fontFamily: 'Helvetica-Bold',
  },
  value: {
    width: '50%',
    color: '#333',
  },
  priceBox: {
    backgroundColor: '#D9E8FC',
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
  },
  priceLabel: {
    fontSize: 12,
    color: '#0032A0',
    marginBottom: 5,
  },
  priceValue: {
    fontSize: 18,
    color: '#0032A0',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    borderTop: '1px solid #E5E5E5',
    paddingTop: 10,
  },
});

interface QuotePDFProps {
  formData: any;
  quoteNumber: string;
  createdDate: string;
  validUntil: string;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ 
  formData, 
  quoteNumber, 
  createdDate, 
  validUntil 
}) => {
  const packageData = formData.package 
    ? PACKAGES[formData.package as keyof typeof PACKAGES] 
    : null;

  // Alle möglichen Coverages
  const allCoverages = [
    'Cyber Daten- und Systemwiederherstellung',
    'Cyber Krisenmanagement',
    'Cyber Haftpflicht',
    'Cyber Rechtsschutz',
    'Cyber Betriebsunterbruch',
    'Cyber Diebstahl',
    'Cyber Betrug',
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Zurich Cyber-Versicherung</Text>
            <Text style={styles.subtitle}>Offerte Nr. {quoteNumber}</Text>
            <Text style={styles.headerMeta}>Zurich Versicherung  Firmenkunden Schweiz</Text>
          </View>
          <View style={styles.headerRight}>
            <Image src="/zurich-logo.png" style={styles.logo} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Erstellt am:</Text>
            <Text style={styles.value}>{createdDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gültig bis:</Text>
            <Text style={styles.value}>{validUntil}</Text>
          </View>
          {packageData && (
            <View style={styles.row}>
              <Text style={styles.label}>Jahresprämie:</Text>
              <Text style={styles.value}>CHF {packageData.price.toLocaleString("de-CH")}</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionWithExtraMargin}>
          <Text style={styles.sectionTitle}>Unternehmensdaten</Text>
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <Text style={styles.label}>Firma:</Text>
              <Text style={styles.value}>{formData.companyName || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adresse:</Text>
              <Text style={styles.value}>{formData.address || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>PLZ / Ort:</Text>
              <Text style={styles.value}>{formData.zip || "-"} {formData.city || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Website:</Text>
              <Text style={styles.value}>{formData.website || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Branche:</Text>
              <Text style={styles.value}>{formData.industry || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Anzahl Mitarbeitende:</Text>
              <Text style={styles.value}>{formData.employees || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Brutto-Gesamtumsatz:</Text>
              <Text style={styles.value}>CHF {formData.revenue?.toLocaleString("de-CH") || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>E-Commerce Umsatzanteil:</Text>
              <Text style={styles.value}>{formData.eCommercePercentage || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Auslandsumsatz:</Text>
              <Text style={styles.value}>{formData.foreignRevenuePercentage || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Keine Tochtergesellschaften im Ausland:</Text>
              <Text style={styles.value}>{formData.noForeignSubsidiaries || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Kein abgelehnter Versicherungsantrag:</Text>
              <Text style={styles.value}>{formData.noRejectedInsurance || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cyber-Sicherheit</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cybervorfälle in letzten 3 Jahren:</Text>
            <Text style={styles.value}>{formData.hadCyberIncidents || "-"}</Text>
          </View>
          
          {/* Bedingte Folgefragen bei Cybervorfällen */}
          {formData.hadCyberIncidents === 'Ja' && (
            <>
              {formData.multipleIncidents && (
                <View style={styles.row}>
                  <Text style={styles.label}>  Mehrere Vorfälle:</Text>
                  <Text style={styles.value}>{formData.multipleIncidents}</Text>
                </View>
              )}
              {formData.incidentDowntime72h && (
                <View style={styles.row}>
                  <Text style={styles.label}>  Ausfall &gt; 72 Stunden:</Text>
                  <Text style={styles.value}>{formData.incidentDowntime72h}</Text>
                </View>
              )}
              {formData.incidentFinancialLoss && (
                <View style={styles.row}>
                  <Text style={styles.label}>  Finanzieller Schaden:</Text>
                  <Text style={styles.value}>{formData.incidentFinancialLoss}</Text>
                </View>
              )}
              {formData.incidentLiabilityClaims && (
                <View style={styles.row}>
                  <Text style={styles.label}>  Haftpflichtansprüche:</Text>
                  <Text style={styles.value}>{formData.incidentLiabilityClaims}</Text>
                </View>
              )}
              {formData.businessContinuityAfterITFailure && (
                <View style={styles.row}>
                  <Text style={styles.label}>  Business Continuity (interne IT):</Text>
                  <Text style={styles.value}>{formData.businessContinuityAfterITFailure}</Text>
                </View>
              )}
            </>
          )}
          
          <View style={styles.row}>
            <Text style={styles.label}>Anzahl Personen-/Kundendaten:</Text>
            <Text style={styles.value}>{formData.personalDataCount || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anzahl Medizinal-/Gesundheitsdaten:</Text>
            <Text style={styles.value}>{formData.medicalDataCount || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anzahl Kreditkartendaten:</Text>
            <Text style={styles.value}>{formData.creditCardDataCount || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>End-of-Life Systeme:</Text>
            <Text style={styles.value}>{formData.hasEndOfLifeSystems || "-"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Versicherte Deckungen ({formData.package || "BASIC"} Paket)
          </Text>
          
          {allCoverages.map((coverage: string, index: number) => {
            const isIncluded = packageData?.coverages.includes(coverage) || false;
            return (
              <View key={index} style={styles.row}>
                <Text style={styles.label}>{coverage}:</Text>
                <Text style={styles.value}>{isIncluded ? 'Versichert' : 'Nicht versichert'}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionWithExtraMargin}>
          <Text style={styles.sectionTitle}>Versicherte Leistungen</Text>
          <View style={styles.sectionCard}>
            <View style={styles.row}>
              <Text style={styles.label}>VS Eigenschäden:</Text>
              <Text style={styles.value}>
                {packageData 
                  ? `CHF ${packageData.eigenSchadenSum.toLocaleString("de-CH")}` 
                  : "-"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>VS Haftpflicht:</Text>
              <Text style={styles.value}>
                {packageData 
                  ? `CHF ${packageData.haftpflichtSum.toLocaleString("de-CH")}` 
                  : "-"}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>VS Rechtsschutz:</Text>
              <Text style={styles.value}>
                {packageData 
                  ? `CHF ${packageData.rechtsschutzSum.toLocaleString("de-CH")}` 
                  : "CHF 50'000"}
              </Text>
            </View>
            {packageData && packageData.crimeSum > 0 && (
              <View style={styles.row}>
                <Text style={styles.label}>VS Cyber Crime:</Text>
                <Text style={styles.value}>
                  CHF {packageData.crimeSum.toLocaleString("de-CH")}
                </Text>
              </View>
            )}
            <View style={styles.row}>
              <Text style={styles.label}>Selbstbehalt:</Text>
              <Text style={styles.value}>
                {packageData 
                  ? `CHF ${packageData.deductible.toLocaleString("de-CH")}` 
                  : "-"}
              </Text>
            </View>
            {packageData && packageData.waitingPeriod !== "n/a" && (
              <View style={styles.row}>
                <Text style={styles.label}>Wartefrist Betriebsunterbruch:</Text>
                <Text style={styles.value}>{packageData.waitingPeriod}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Umsatz > 5 Mio. Fragen - direkt auf gleicher Seite */}
        {formData.revenue > 5_000_000 && (formData.hasMFARemoteAccess || formData.hasITEmergencyPlan || formData.hasWeeklyBackups || formData.hasEncryptedBackups || formData.hasOfflineBackups || formData.usesIndustrialControlSystems || formData.hasEmailSecuritySolution || formData.hasAutomaticUpdates || formData.hasAntivirusSoftware || formData.hasStrongPasswordPolicies || formData.hasAnnualSecurityTraining) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Erweiterte Sicherheit (Umsatz &gt; CHF 5 Mio.)</Text>
            {formData.hasMFARemoteAccess && (
              <View style={styles.row}>
                <Text style={styles.label}>MFA für Fernzugriff:</Text>
                <Text style={styles.value}>{formData.hasMFARemoteAccess}</Text>
              </View>
            )}
            {formData.hasITEmergencyPlan && (
              <View style={styles.row}>
                <Text style={styles.label}>IT-Notfallplan vorhanden:</Text>
                <Text style={styles.value}>{formData.hasITEmergencyPlan}</Text>
              </View>
            )}
            {formData.hasWeeklyBackups && (
              <View style={styles.row}>
                <Text style={styles.label}>Wöchentliche Backups:</Text>
                <Text style={styles.value}>{formData.hasWeeklyBackups}</Text>
              </View>
            )}
            {formData.hasEncryptedBackups && (
              <View style={styles.row}>
                <Text style={styles.label}>Verschlüsselte Backups:</Text>
                <Text style={styles.value}>{formData.hasEncryptedBackups}</Text>
              </View>
            )}
            {formData.hasOfflineBackups && (
              <View style={styles.row}>
                <Text style={styles.label}>Offline/getrennte Backups:</Text>
                <Text style={styles.value}>{formData.hasOfflineBackups}</Text>
              </View>
            )}
            {formData.usesIndustrialControlSystems && (
              <View style={styles.row}>
                <Text style={styles.label}>Industrielle Steuerungssysteme (OT):</Text>
                <Text style={styles.value}>{formData.usesIndustrialControlSystems}</Text>
              </View>
            )}
            {formData.usesIndustrialControlSystems === 'Ja' && (
              <>
                {formData.hasOTMFARemoteAccess && (
                  <View style={styles.row}>
                    <Text style={styles.label}>  OT: MFA für Fernzugriff:</Text>
                    <Text style={styles.value}>{formData.hasOTMFARemoteAccess}</Text>
                  </View>
                )}
                {formData.hasOTFirewallSeparation && (
                  <View style={styles.row}>
                    <Text style={styles.label}>  OT: Firewall-Trennung:</Text>
                    <Text style={styles.value}>{formData.hasOTFirewallSeparation}</Text>
                  </View>
                )}
              </>
            )}
            {formData.hasEmailSecuritySolution && (
              <View style={styles.row}>
                <Text style={styles.label}>E-Mail-Sicherheitslösung:</Text>
                <Text style={styles.value}>{formData.hasEmailSecuritySolution}</Text>
              </View>
            )}
            {formData.hasAutomaticUpdates && (
              <View style={styles.row}>
                <Text style={styles.label}>Automatische Updates:</Text>
                <Text style={styles.value}>{formData.hasAutomaticUpdates}</Text>
              </View>
            )}
            {formData.hasAntivirusSoftware && (
              <View style={styles.row}>
                <Text style={styles.label}>Antiviren-Software:</Text>
                <Text style={styles.value}>{formData.hasAntivirusSoftware}</Text>
              </View>
            )}
            {formData.hasStrongPasswordPolicies && (
              <View style={styles.row}>
                <Text style={styles.label}>Starke Passwort-Richtlinien:</Text>
                <Text style={styles.value}>{formData.hasStrongPasswordPolicies}</Text>
              </View>
            )}
            {formData.hasAnnualSecurityTraining && (
              <View style={styles.row}>
                <Text style={styles.label}>Jährliche Security-Schulungen:</Text>
                <Text style={styles.value}>{formData.hasAnnualSecurityTraining}</Text>
              </View>
            )}
          </View>
        )}

        {/* Umsatz > 10 Mio. Fragen - direkt anschliessend */}
        {formData.revenue > 10_000_000 && (formData.usesCloudServices || formData.hasOutsourcedProcesses || formData.usesRemovableMedia || formData.usesSeparateAdminAccounts || formData.hasIsolatedBackupAccess || formData.hasUniquePasswordPolicy || formData.hasFirewallIDSIPS || formData.hasRegularPatchManagement || formData.hasCriticalPatchManagement || formData.hasPhishingSimulations || formData.hasSecurityOperationCenter || formData.businessContinuityExternalIT) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Umfassende Sicherheitsanalyse (Umsatz &gt; CHF 10 Mio.)</Text>
            {formData.usesCloudServices && (
              <View style={styles.row}>
                <Text style={styles.label}>Cloud-Services:</Text>
                <Text style={styles.value}>{formData.usesCloudServices}</Text>
              </View>
            )}
            {formData.cloudServiceProviders && (
              <View style={styles.row}>
                <Text style={styles.label}>Cloud-Anbieter:</Text>
                <Text style={styles.value}>{formData.cloudServiceProviders}</Text>
              </View>
            )}
            {formData.hasOutsourcedProcesses && (
              <View style={styles.row}>
                <Text style={styles.label}>Ausgelagerte Prozesse:</Text>
                <Text style={styles.value}>{formData.hasOutsourcedProcesses}</Text>
              </View>
            )}
            {formData.outsourcedProcessTypes && (
              <View style={styles.row}>
                <Text style={styles.label}>Ausgelagerte System-Typen:</Text>
                <Text style={styles.value}>{formData.outsourcedProcessTypes}</Text>
              </View>
            )}
            {formData.usesRemovableMedia && (
              <View style={styles.row}>
                <Text style={styles.label}>Wechseldatenträger:</Text>
                <Text style={styles.value}>{formData.usesRemovableMedia}</Text>
              </View>
            )}
            {formData.usesSeparateAdminAccounts && (
              <View style={styles.row}>
                <Text style={styles.label}>Separate Admin-Konten:</Text>
                <Text style={styles.value}>{formData.usesSeparateAdminAccounts}</Text>
              </View>
            )}
            {formData.hasIsolatedBackupAccess && (
              <View style={styles.row}>
                <Text style={styles.label}>Isolierte Backup-Zugriffe:</Text>
                <Text style={styles.value}>{formData.hasIsolatedBackupAccess}</Text>
              </View>
            )}
            {formData.hasUniquePasswordPolicy && (
              <View style={styles.row}>
                <Text style={styles.label}>Einzigartige Passwörter:</Text>
                <Text style={styles.value}>{formData.hasUniquePasswordPolicy}</Text>
              </View>
            )}
            {formData.hasFirewallIDSIPS && (
              <View style={styles.row}>
                <Text style={styles.label}>Firewalls/IDS/IPS:</Text>
                <Text style={styles.value}>{formData.hasFirewallIDSIPS}</Text>
              </View>
            )}
            {formData.hasRegularPatchManagement && (
              <View style={styles.row}>
                <Text style={styles.label}>Patch-Management (30 Tage):</Text>
                <Text style={styles.value}>{formData.hasRegularPatchManagement}</Text>
              </View>
            )}
            {formData.hasCriticalPatchManagement && (
              <View style={styles.row}>
                <Text style={styles.label}>Kritische Patches (3 Tage):</Text>
                <Text style={styles.value}>{formData.hasCriticalPatchManagement}</Text>
              </View>
            )}
            {formData.hasPhishingSimulations && (
              <View style={styles.row}>
                <Text style={styles.label}>Phishing-Simulationen:</Text>
                <Text style={styles.value}>{formData.hasPhishingSimulations}</Text>
              </View>
            )}
            {formData.hasSecurityOperationCenter && (
              <View style={styles.row}>
                <Text style={styles.label}>Security Operation Center (SOC):</Text>
                <Text style={styles.value}>{formData.hasSecurityOperationCenter}</Text>
              </View>
            )}
            {formData.businessContinuityExternalIT && (
              <View style={styles.row}>
                <Text style={styles.label}>Business Continuity (externe IT):</Text>
                <Text style={styles.value}>{formData.businessContinuityExternalIT}</Text>
              </View>
            )}
            {formData.usesIndustrialControlSystems === 'Ja' && (
              <>
                {formData.hasOTInventory && (
                  <View style={styles.row}>
                    <Text style={styles.label}>  OT-Inventarliste:</Text>
                    <Text style={styles.value}>{formData.hasOTInventory}</Text>
                  </View>
                )}
                {formData.hasOTSiteSeparation && (
                  <View style={styles.row}>
                    <Text style={styles.label}>  OT-Standort-Trennung:</Text>
                    <Text style={styles.value}>{formData.hasOTSiteSeparation}</Text>
                  </View>
                )}
                {formData.hasOTInternetSeparation && (
                  <View style={styles.row}>
                    <Text style={styles.label}>  OT-Internet-Trennung:</Text>
                    <Text style={styles.value}>{formData.hasOTInternetSeparation}</Text>
                  </View>
                )}
                {formData.hasOTVulnerabilityScans && (
                  <View style={styles.row}>
                    <Text style={styles.label}>  OT-Schwachstellenscans:</Text>
                    <Text style={styles.value}>{formData.hasOTVulnerabilityScans}</Text>
                  </View>
                )}
                {formData.hasOTRegularBackups && (
                  <View style={styles.row}>
                    <Text style={styles.label}>  OT-Regelmässige Backups:</Text>
                    <Text style={styles.value}>{formData.hasOTRegularBackups}</Text>
                  </View>
                )}
              </>
            )}
            {formData.hasPCICertification && (
              <View style={styles.row}>
                <Text style={styles.label}>PCI-Zertifizierung:</Text>
                <Text style={styles.value}>{formData.hasPCICertification}</Text>
              </View>
            )}
            {formData.protectsMedicalDataGDPR && (
              <View style={styles.row}>
                <Text style={styles.label}>Medizinischer Datenschutz (GDPR):</Text>
                <Text style={styles.value}>{formData.protectsMedicalDataGDPR}</Text>
              </View>
            )}
            {formData.protectsBiometricData && (
              <View style={styles.row}>
                <Text style={styles.label}>Biometrischer Datenschutz:</Text>
                <Text style={styles.value}>{formData.protectsBiometricData}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Zurich Versicherung • Hagenholzstrasse 60 • 8050 Zürich • Tel. +41 44 628 28 28</Text>
          <Text>Diese Offerte ist gültig bis {validUntil} und unverbindlich.</Text>
        </View>
      </Page>
    </Document>
  );
};
