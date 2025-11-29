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
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 15,
  },
  logo: {
    width: 100,
    height: 35,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: '#0032A0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
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
  coverageItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    color: '#008C95',
  },
  checkmark: {
    width: 20,
    color: '#008C95',
    fontSize: 14,
    marginRight: 5,
  },
  crossmark: {
    width: 20,
    color: '#CCCCCC',
    fontSize: 14,
    marginRight: 5,
  },
  coverageText: {
    flex: 1,
    color: '#000',
    fontFamily: 'Helvetica-Bold',
  },
  coverageList: {
    marginBottom: 15,
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
            <Text style={styles.title}>Ihre Zurich Cyberversicherung</Text>
            <Text style={styles.subtitle}>Offerte Nr. {quoteNumber}</Text>
          </View>
          <Image src="/zurich-logo.png" style={styles.logo} />
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unternehmensdaten</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cyber-Sicherheit</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cybervorfälle in letzten 3 Jahren:</Text>
            <Text style={styles.value}>{formData.hadCyberIncidents || "-"}</Text>
          </View>
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
            Versicherte Leistungen ({formData.package || "BASIC"} Paket)
          </Text>
          
          <View style={styles.coverageList}>
            {allCoverages.map((coverage: string, index: number) => {
              const isIncluded = packageData?.coverages.includes(coverage) || false;
              return (
                <View key={index} style={styles.coverageItem}>
                  <Text style={isIncluded ? styles.checkmark : styles.crossmark}>
                    {isIncluded ? '●' : '○'}
                  </Text>
                  <Text style={styles.coverageText}>{coverage}</Text>
                </View>
              );
            })}
          </View>
          
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


        <View style={styles.footer}>
          <Text>Zurich Versicherung • Hagenholzstrasse 60 • 8050 Zürich • Tel. +41 44 628 28 28</Text>
          <Text>Diese Offerte ist gültig bis {validUntil} und unverbindlich.</Text>
        </View>
      </Page>
    </Document>
  );
};
