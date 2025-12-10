/**
 * PDF-Komponente für Cyberversicherungs-Police
 * Zeigt alle Policendaten in einem druckbaren Format
 */

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { PACKAGES } from '@/lib/validation/premium-schema';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
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

interface PolicyPDFProps {
  formData: any;
  policyNumber: string;
  startDate: string;
  endDate: string;
}

export const PolicyPDF: React.FC<PolicyPDFProps> = ({ 
  formData, 
  policyNumber, 
  startDate, 
  endDate 
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
            <Text style={styles.subtitle}>Police Nr. {policyNumber}</Text>
            <Text style={styles.headerMeta}>Zurich Versicherung  Firmenkunden Schweiz</Text>
          </View>
          <View style={styles.headerRight}>
            <Image src="/zurich-logo.png" style={styles.logo} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Versicherungsbeginn:</Text>
            <Text style={styles.value}>{startDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Versicherungsende:</Text>
            <Text style={styles.value}>{endDate}</Text>
          </View>
          {packageData && (
            <View style={styles.row}>
              <Text style={styles.label}>Jahresprämie:</Text>
              <Text style={styles.value}>CHF {packageData.price.toLocaleString("de-CH")}</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionWithExtraMargin}>
          <Text style={styles.sectionTitle}>Versicherter</Text>
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

        <View style={styles.footer}>
          <Text>Zurich Versicherung • Hagenholzstrasse 60 • 8050 Zürich • Tel. +41 44 628 28 28</Text>
          <Text>Diese Police ist rechtsgültig und verbindlich.</Text>
        </View>
      </Page>
    </Document>
  );
};
