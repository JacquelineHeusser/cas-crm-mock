**Sektion Unternehmensdaten**

  ----------------------------------------------------------------------------------------------------
  **Trigger**       **Feld**                    **Beispiel**
  ----------------- --------------------------- ------------------------------------------------------
  Immer             Versicherungsnehmer         Mustermann AG

  Immer             Adresse                     Bahnhofstrasse 1

  Immer             PLZ, Ort                    8050 Zürich

  Immer             Land                        Schweiz

  Immer             URL                         [www.mustermann-ag.ch](http://www.mustermann-ag.ch/)
  ----------------------------------------------------------------------------------------------------

**Sektion Vertragsdaten**

  -----------------------------------------------------------------------
  **Trigger**      **Feld**                     **Beispiel**
  ---------------- ---------------------------- -------------------------
  Immer            Offert Nummer                12.345.678

  Immer            Versicherungsbeginn          01.01.2026

  Immer            Zahlungsweise                jährlich

  Immer            Version Allgemeine           01/2024
                   Versicherungsbedingungen     
                   (AVB)                        
  -----------------------------------------------------------------------

**Sektion versicherte Leistungen**

  ------------------------------------------------------------------------
  **Trigger**      **Feld**                     **Optionen**
  ---------------- ---------------------------- --------------------------
  Immer            Versicherte Deckungen        **BASIC Paket:**\
                                                - Cyber Daten- und
                                                Systemwiederherstellung\
                                                - Cyber Krisenmanagement\
                                                - Cyber Haftpflicht\
                                                - Cyber Rechtsschutz\
                                                \
                                                **OPTIMUM Paket:**\
                                                - Cyber Daten- und
                                                Systemwiederherstellung\
                                                - Cyber Krisenmanagement\
                                                - Cyber Haftpflicht\
                                                - Cyber Rechtsschutz\
                                                - Cyber
                                                Betriebsunterbruch\
                                                \
                                                **PREMIUM Paket:**\
                                                - Cyber Krisenmanagement\
                                                - Cyber Haftpflicht\
                                                - Cyber Rechtsschutz\
                                                - Cyber
                                                Betriebsunterbruch\
                                                - Cyber Diebstahl\
                                                - Cyber Betrug

  Immer            Versicherungssummen          **Eigenschäden:**\
                                                - CHF 50\'000\
                                                - CHF 100\'000\
                                                - CHF 250\'000\
                                                - CHF 500\'000\
                                                - CHF 1\'000\'000\
                                                - CHF 2\'000\'000\
                                                \
                                                **Haftpflicht:**\
                                                - CHF 500\'000\
                                                - CHF 1\'000\'000\
                                                - CHF 2\'000\'000\
                                                \
                                                **Cyber Crime:**\
                                                - CHF 50\'000\
                                                - CHF 100\'000\
                                                - CHF 250\'000

  Immer            Selbstbehalt                 \- CHF 500\
                                                - CHF 1\'000\
                                                - CHF 2\'500\
                                                - CHF 5\'000

  Immer            Wartefrist                   \- 12h\
                   Betriebsunterbruch           - 24h\
                                                - 48h
  ------------------------------------------------------------------------

**Sektion Vermittlerdaten (nur relevant falls Vermittler eingeloggt
ist)**

  -----------------------------------------------------------------------
  **Trigger**      **Feld**                     **Beispiel**
  ---------------- ---------------------------- -------------------------
  Immer            Vermittler                   ABC Broker AG

  Immer            Adresse                      Mustergasse 31

  Immer            PLZ, Ort                     8001 Zürich

  Immer            Land                         Schweiz

  Immer            Verkaufsstellennummer        12345
  -----------------------------------------------------------------------

**Sektion Cyber Risikoprofil**

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Trigger**      **Frage**                    **Antwortoptionen**
  ---------------- ---------------------------- ----------------------------------------------------------------------------------------------------------------------
  Immer            Welche dieser Kategorien     [Liste mit
                   beschreibt die               Branchen](file:///C:\Users\Marc\AppData\Local\Microsoft\Windows\INetCache\Content.MSO\1D3796DF.xlsx#'NOGA Codes'!A1)
                   Geschäftstätigkeit Ihrer     
                   Firma am ehesten?            

  Immer            Ihre Firma hat keine         Trifft zu; Trifft nicht zu
                   Tochtergesellschaften im     
                   Ausland und gehört zu keiner 
                   ausländischen                
                   Unternehmensgruppe.          

  Immer            Für die betreffenden Risiken Trifft zu; Trifft nicht zu
                   wurde in den letzten 3       
                   Jahren kein                  
                   Versicherungsantrag          
                   abgelehnt.                   

  Immer            Anzahl Mitarbeitende         

  Immer            Brutto-Gesamtumsatz im       
                   vergangenen Geschäftsjahr    

  Immer            Wie viel Prozent des         0%; 1 -- 25%; 26 -- 50%; Mehr als 50%
                   Gesamtumsatzes wurden durch  
                   E-Commerce erwirtschaftet?   

  Immer            Wie viel Prozent des         0%; 1 -- 25%; 26 -- 50%; Mehr als 50%
                   Gesamtumsatzes wurden        
                   ausserhalb der Schweiz und   
                   dem Fürstentum Liechtenstein 
                   erwirtschaftet?              
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Sektion Cyber-Sicherheit**

  ---------------------------------------------------------------------------------------
  **Trigger**      **Frage**                       **Antwortoptionen**
  ---------------- ------------------------------- --------------------------------------
  Immer            Gab es in den letzten 3 Jahren  Ja; Nein
                   Cybervorfälle oder -angriffe,   
                   durch die Informationen         
                   verloren gingen oder gestohlen  
                   wurden?                         

  Frage 1 = Y      Gab es mehrere Vorfälle?        Ja; Nein

  Frage 1 = Y      Hat ein Vorfall dazu geführt,   Ja; Nein
                   dass Ihr Betrieb für mehr als   
                   72 Stunden stillstand?          

  Frage 1 = Y      Hat ein Vorfall unmittelbar zu  Ja; Nein
                   finanziellen Verlusten geführt? 

  Frage 1 = Y      Hat ein Vorfall zu              Ja; Nein
                   Schadenersatzansprüchen gegen   
                   Ihre Firma geführt?             

  Frage 1 = Y      Wie lange kann Ihre Firma den   Alle Geschäftsprozesse können eine
                   Betrieb aufrechthalten, wenn    Woche fortgesetzt werden.; Die meisten
                   zentrale interne IT-Systeme     Geschäftsprozesse können eine Woche
                   ausfallen?                      fortgesetzt werden.; Die meisten
                                                   Geschäftsprozesse können mindestens
                                                   einen Tag, aber weniger als eine
                                                   Woche, fortgesetzt werden.; Die
                                                   meisten Geschäftsprozesse können
                                                   weniger als einen Tag fortgesetzt
                                                   werden oder kommen sofort zum
                                                   Erliegen.

  Immer            Wie viele Personen- und         Keine; Bis 1\'000; Bis 10\'000; Bis
                   Kundendaten bearbeitet Ihre     100\'000; Bis 1\'000\'000; Mehr als
                   Firma?                          1\'000\'000

  Immer            Wie viele Medizinal- und        Keine; Nur von Mitarbeitenden; Bis
                   Gesundheitsdaten bearbeitet     10\'000; Bis 100\'000; Bis
                   Ihre Firma?                     1\'000\'000; Mehr als 1\'000\'000

  Immer            Wie viele Kreditkartendaten     Keine oder durch einen externen
                   bearbeitet Ihre Firma?          Dienstleister verarbeitet; Nur von
                                                   Mitarbeitenden; Bis 10\'000; Bis
                                                   100\'000; Bis 1\'000\'000; Mehr als
                                                   1\'000\'000

  Immer            Arbeiten Sie noch mit älteren   Ja; Nein
                   Systemen, für die keine         
                   Sicherheits-Updates mehr        
                   bereitgestellt werden (z.B.     
                   Windows 10)?                    

  Umsatz \> 5 Mio. Jeglicher Fernzugriff auf das   Ja; Nein
                   Firmennetzwerk erfolgt über     
                   eine verschlüsselte Verbindung  
                   und erfordert                   
                   Multifaktor-Authentifizierung   
                   (MFA).                          

  Umsatz \> 5 Mio. Ein dokumentierter              Ja; Nein
                   IT-Notfallplan mit definierten  
                   Verantwortlichkeiten und        
                   Checklisten ist vorhanden.      

  Umsatz \> 5 Mio. Mindestens wöchentlich wird ein Ja; Nein
                   Back-up bzw. eine               
                   Sicherheitskopie aller          
                   geschäftskritischen Daten       
                   erstellt.                       

  Umsatz \> 5 Mio. Alle Back-ups mit vertraulichen Ja; Nein
                   Personen- oder Geschäftsdaten   
                   sind verschlüsselt.             

  Umsatz \> 5 Mio. Die Back-ups der                Ja; Nein
                   geschäftskritischen Daten sind  
                   getrennt vom Firmennetzwerk     
                   gespeichert oder so gesichert,  
                   dass sie vom Firmennetzwerk aus 
                   nicht gelöscht werden können.   

  Umsatz \> 5 Mio. Werden industrielle             Ja; Nein
                   Steuerungssysteme oder          
                   Operational Technology (OT)     
                   genutzt?                        

  Umsatz \> 5 Mio. Jeglicher Fernzugriff auf       Ja; Nein
  UND Frage 16 = Y industrielle Steuerungssysteme  
                   / OT erfolgt über eine          
                   verschlüsselte Verbindung und   
                   erfordert                       
                   Multifaktor-Authentifizierung   
                   (MFA).                          

  Umsatz \> 5 Mio. Industrielle Steuerungssysteme  Ja; Nein
  UND Frage 16 = Y / OT sind mit Firewalls vom     
                   (IT-) Firmennetzwerk getrennt.  

  Umsatz \> 5 Mio. Es wird eine                    Ja; Nein
                   E-Mail-Sicherheitslösung        
                   verwendet, um Spam, Phishing    
                   und gefährliche Anhänge oder    
                   Links herauszufiltern.          

  Umsatz \> 5 Mio. IT-Systeme werden automatisch   Ja; Nein
                   aktualisiert und auf dem        
                   neuesten Softwarestand          
                   gehalten.                       

  Umsatz \> 5 Mio. Alle Geräte und Server in Ihrer Ja; Nein
                   Firma sind mit einer            
                   Antiviren-Software              
                   ausgestattet.                   

  Umsatz \> 5 Mio. Interne Richtlinien schreiben   Ja; Nein
                   für alle Benutzerkonten starke  
                   Passwörter vor.                 

  Umsatz \> 5 Mio. Alle Mitarbeitenden werden      Ja; Nein
                   mindestens jährlich zu          
                   Informationssicherheit          
                   geschult.                       

  Umsatz \> 5 Mio. Wie lange kann Ihre Firma den   Alle Geschäftsprozesse können eine
                   Betrieb aufrechthalten, wenn    Woche fortgesetzt werden.; Die meisten
                   kritische IT-Systeme, die von   Geschäftsprozesse können eine Woche
                   externen IT-Dienstleistern      fortgesetzt werden.; Die meisten
                   betrieben werden, ausfallen?    Geschäftsprozesse können mindestens
                                                   einen Tag, aber weniger als eine Woche
                                                   fortgesetzt werden.; Die meisten
                                                   Geschäftsprozesse können weniger als
                                                   einen Tag fortgesetzt werden oder
                                                   kommen sofort zum Erliegen.

  Umsatz \> 10     Nutzt Ihre Firma                Ja; Nein
  Mio.             Cloud-Services?                 

  Umsatz \> 10     Von welchen Anbietern nutzt     Microsoft; Google; Amazon; Andere
  Mio. UND Frage   Ihre Firma Cloud-Services?      
  25 = Y                                           

  Umsatz \> 10     Sind Prozesse oder Systeme      Ja; Nein
  Mio.             ausgelagert und werden von      
                   externen Dienstleistern         
                   betrieben?                      

  Umsatz \> 10     Welche Prozesse oder Systeme    Microsoft 365 (Office + AD);
  Mio. UND Frage   sind betroffen?                 Datenverarbeitung/-Prozessierung;
  27 = Y                                           Unternehmensweite Ressourcenplanung
                                                   (ERP); Notfallwiederherstellung;
                                                   Personalverwaltungssystem;
                                                   Zahlungsverarbeitung;
                                                   Kundenbeziehungsmanagement (CRM);
                                                   Drittanbieter-Risikomanagement (TPRM);
                                                   Sicherheitsdienstleistungen (MSSP) /
                                                   Sicherheitsbetriebszentrum (SOC);
                                                   IT-Betrieb (z.B. Helpdesk,
                                                   IT-Support);
                                                   Dateifreigabe-/Datenaustauschlösung;
                                                   Andere

  Umsatz \> 10     Werden Wechseldatenträger wie   Ja; Nein
  Mio.             USB-Sticks oder externe         
                   Festplatten genutzt?            

  Umsatz \> 10     Für Administrator-Aufgaben wird Ja; Nein; Teilweise
  Mio.             ein separates, privilegiertes   
                   Nutzerkonto verwendet.          

  Umsatz \> 10     Die Zugriffsrechte für die      Ja; Nein; Teilweise
  Mio.             Back-up-Umgebung werden nicht   
                   über die zentrale               
                   Benutzerverwaltung verwaltet.   

  Umsatz \> 10     Interne Richtlinien verbieten,  Ja; Nein; Teilweise
  Mio.             dass dasselbe Passwort für      
                   verschiedene Nutzerkonten       
                   verwendet wird, und alle Nutzer 
                   werden entsprechend geschult.   

  Umsatz \> 10     Firewalls oder spezielle        Ja; Nein; Teilweise
  Mio.             Sicherheitssysteme zur          
                   Erkennung und Verhinderung von  
                   Angriffen (IDS/IPS) prüfen alle 
                   Verbindungen, die ins           
                   Firmennetzwerk hinein- oder     
                   herausgehen.                    

  Umsatz \> 10     Sicherheits-Updates (Patches)   Ja; Nein; Teilweise
  Mio.             werden zentral verwaltet und    
                   innerhalb von 30 Tagen nach     
                   Veröffentlichung auf alle       
                   Systeme ausgerollt.             

  Umsatz \> 10     Kritische Sicherheits-Updates   Ja; Nein; Teilweise
  Mio.             werden mit einem                
                   Notfall-Prozess innerhalb von 3 
                   Tagen nach Veröffentlichung auf 
                   alle Systeme ausgerollt.        

  Umsatz \> 10     Phishing-Simulationen werden    Ja; Nein; Teilweise
  Mio.             regelmässig durchgeführt.       

  Umsatz \> 10     Es besteht in Ihrer Firma oder  Ja; Nein; Teilweise
  Mio.             bei einem externen              
                   Dienstleister ein Security      
                   Operation Center (SOC), dessen  
                   Experten technisch in der Lage  
                   und befugt sind, potenzielle    
                   Sicherheitsvorfälle sofort nach 
                   ihrer Entdeckung einzudämmen    
                   und zu beheben.                 

  Umsatz \> 10     Es gibt stets eine aktuelle     Ja; Nein; Teilweise
  Mio. UND Frage   Inventarliste mit allen         
  16 = Y           industriellen                   
                   Steuerungssystemen / OT.        

  Umsatz \> 10     Industrielle Steuerungssysteme  Ja; Nein; Teilweise
  Mio. UND Frage   / OT in verschiedenen Werken /  
  16 = Y           an unterschiedlichen Standorten 
                   sind mit Firewalls voneinander  
                   getrennt.                       

  Umsatz \> 10     Industrielle Steuerungssysteme  Ja; Nein; Teilweise
  Mio. UND Frage   / OT sind mit Firewalls vom     
  16 = Y           Internet getrennt.              

  Umsatz \> 10     In den Netzwerken der           Ja; Nein; Teilweise
  Mio. UND Frage   industriellen Steuerungssysteme 
  16 = Y           / OT werden regelmässig         
                   Schwachstellenscans             
                   durchgeführt.                   

  Umsatz \> 10     Ein Back-up der industrellen    Ja; Nein; Teilweise
  Mio. UND Frage   Steuerungssysteme / OT wird     
  16 = Y           mindestens einmal pro Monat und 
                   bei allen grossen Änderungen an 
                   Systemen und Prozessen          
                   erstellt.                       

  Umsatz \> 10     Die Firma hat eine              Ja; Nein; Teilweise
  Mio.             PCI-Zertifizierung (der Payment 
                   Card Industry) mit dem          
                   entsprechenden                  
                   DSS-Reporting-Level --          
                   basierend auf den jährlich      
                   verarbeiteten                   
                   Kreditkarten-Transaktionen. Bei 
                   externen Zahlungsabwicklern     
                   werden die Audit-Berichte       
                   jährlich geprüft.               

  Umsatz \> 10     Medizinische Daten werden       Ja; Nein; Teilweise
  Mio.             gemäss den anwendbaren          
                   datenschutzrechtlichen          
                   Bestimmungen (z.B. DSG, GDPR,   
                   HIPAA) geschützt.               

  Umsatz \> 10     Biometrische Daten werden nach  Ja; Nein; Teilweise
  Mio.             den geltenden Gesetzen          
                   geschützt und nur wie           
                   vorgeschrieben erfasst,         
                   gespeichert und genutzt.        
  ---------------------------------------------------------------------------------------
