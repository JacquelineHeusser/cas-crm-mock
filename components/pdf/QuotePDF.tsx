/**
 * PDF-Komponente für Cyberversicherungs-Offerte
 * Zeigt alle erfassten Daten in einem druckbaren Format
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { PACKAGES } from '@/lib/validation/premium-schema';

// Styles für das PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '2px solid #0032A0',
    paddingBottom: 15,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    textAlign: 'right',
  },
  title: {
    fontSize: 20,
    color: '#0032A0',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0032A0',
    marginBottom: 10,
    fontFamily: 'Helvetica-Bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 10,
  },
  label: {
    width: '50%',
    color: '#333',
  },
  value: {
    width: '50%',
    color: '#000',
    fontFamily: 'Helvetica-Bold',
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
  packageBadge: {
    backgroundColor: '#008C95',
    color: '#FFF',
    padding: 8,
    borderRadius: 5,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});

interface QuotePDFProps {
  formData: any;
  quoteNumber: string;
  createdDate: string;
  validUntil: string;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ formData, quoteNumber, createdDate, validUntil }) => {
  const packageData = formData.package ? PACKAGES[formData.package as keyof typeof PACKAGES] : null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header mit Logo */}
        <View style={styles.header}>
          <Image src="/zurich-logo.png" style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.title}>Cyberversicherung</Text>
            <Text style={styles.subtitle}>Offerte</Text>
          </View>
        </View>

        {/* Offertinformationen */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Offertennummer:</Text>
            <Text style={styles.value}>{quoteNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Erstellt am:</Text>
            <Text style={styles.value}>{createdDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gültig bis:</Text>
            <Text style={styles.value}>{validUntil}</Text>
          </View>
        </View>

        {/* Unternehmensdaten */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unternehmensdaten</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Firma:</Text>
            <Text style={styles.value}>{formData.companyName || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Adresse:</Text>
            <Text style={styles.value}>{formData.address || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PLZ / Ort:</Text>
            <Text style={styles.value}>{formData.zip || '-'} {formData.city || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Website:</Text>
            <Text style={styles.value}>{formData.website || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Branche:</Text>
            <Text style={styles.value}>{formData.industry || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anzahl Mitarbeitende:</Text>
            <Text style={styles.value}>{formData.employees || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Brutto-Gesamtumsatz:</Text>
            <Text style={styles.value}>CHF {formData.revenue?.toLocaleString('de-CH') || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>E-Commerce Umsatzanteil:</Text>
            <Text style={styles.value}>{formData.eCommercePercentage || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Auslandsumsatz:</Text>
            <Text style={styles.value}>{formData.foreignRevenuePercentage || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Keine Tochtergesellschaften im Ausland:</Text>
            <Text style={styles.value}>{formData.noForeignSubsidiaries || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Kein abgelehnter Versicherungsantrag:</Text>
            <Text style={styles.value}>{formData.noRejectedInsurance || '-'}</Text>
          </View>
        </View>

        {/* Cyber-Sicherheit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cyber-Sicherheit</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cybervorfälle in letzten 3 Jahren:</Text>
            <Text style={styles.value}>{formData.hadCyberIncidents || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anzahl Personen-/Kundendaten:</Text>
            <Text style={styles.value}>{formData.personalDataCount || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anzahl Medizinal-/Gesundheitsdaten:</Text>
            <Text style={styles.value}>{formData.medicalDataCount || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Anzahl Kreditkartendaten:</Text>
            <Text style={styles.value}>{formData.creditCardDataCount || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>End-of-Life Systeme:</Text>
            <Text style={styles.value}>{formData.hasEndOfLifeSystems || '-'}</Text>
          </View>
        </View>

        {/* Gewähltes Paket */}
        {formData.package && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gewähltes Deckungspaket</Text>
            <View style={styles.packageBadge}>
              <Text>{formData.package} PAKET</Text>
            </View>
          </View>
        )}

        {/* Versicherte Leistungen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Versicherte Leistungen</Text>
          <View style={styles.row}>
            <Text style={styles.label}>VS Eigenschäden:</Text>
            <Text style={styles.value}>{formData.sumInsuredProperty || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>VS Haftpflicht:</Text>
            <Text style={styles.value}>{formData.sumInsuredLiability || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>VS Rechtsschutz:</Text>
            <Text style={styles.value}>{formData.sumInsuredLegalProtection || 'CHF 50\'000'}</Text>
          </View>
          {formData.sumInsuredCyberCrime && (
            <View style={styles.row}>
              <Text style={styles.label}>VS Cyber Crime:</Text>
              <Text style={styles.value}>{formData.sumInsuredCyberCrime}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Selbstbehalt:</Text>
            <Text style={styles.value}>{formData.deductible || '-'}</Text>
          </View>
          {formData.waitingPeriod && (
            <View style={styles.row}>
              <Text style={styles.label}>Wartefrist Betriebsunterbruch:</Text>
              <Text style={styles.value}>{formData.waitingPeriod}</Text>
            </View>
          )}
        </View>

        {/* Prämie */}
        {packageData && (
          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Jahresprämie</Text>
            <Text style={styles.priceValue}>CHF {packageData.price.toLocaleString('de-CH')}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Zurich Versicherung • Hagenholzstrasse 60 • 8050 Zürich • Tel. +41 44 628 28 28</Text>
          <Text>Diese Offerte ist gültig bis {validUntil} und unverbindlich.</Text>
        </View>
      </Page>
    </Document>
  );
};
