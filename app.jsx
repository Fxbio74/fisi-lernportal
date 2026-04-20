import { useState, useEffect } from "react";

const STORE_KEY = "fisi_shared_v3";

const PRELOADED = [
  {
    id: "pre_001",
    title: "OSI-Modell – Die 7 Schichten",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:00:00Z",
    starred: true,
    tags: ["OSI", "Schichten", "Protokolle", "Grundlagen"],
    content: `OSI-Modell (Open Systems Interconnection) – 7 Schichten von unten nach oben:

MERKSATZ: "Please Do Not Throw Salami Pizza Away"

Schicht 1 – Physical (Bitübertragung)
→ Kabel, Hubs, elektrische Signale
→ Überträgt rohe Bits

Schicht 2 – Data Link (Sicherung)
→ MAC-Adressen, Switches, Ethernet, VLANs, ARP
→ Fehlererkennung, physische Adressierung

Schicht 3 – Network (Vermittlung)
→ IP-Adressen, Router, ICMP
→ Logische Adressierung, Routing

Schicht 4 – Transport
→ TCP (verbindungsorientiert), UDP (verbindungslos), Ports
→ TCP 3-Way-Handshake: SYN → SYN-ACK → ACK

Schicht 5 – Session (Sitzung)
→ NetBIOS, RPC
→ Auf- und Abbau von Verbindungen

Schicht 6 – Presentation (Darstellung)
→ TLS/SSL, JPEG, Verschlüsselung, Kompression

Schicht 7 – Application (Anwendung)
→ HTTP, HTTPS, FTP, SMTP, DNS, DHCP
→ Direkte Nutzerinteraktion

PRÜFUNGSTIPPS:
• Switch = Schicht 2 (MAC)
• Router = Schicht 3 (IP)
• Firewall = Schicht 3–7 je nach Typ`
  },
  {
    id: "pre_002",
    title: "IP-Adressen & Subnetting",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:05:00Z",
    starred: true,
    tags: ["Subnetting", "CIDR", "IPv4", "Berechnung"],
    content: `IPv4-Adressen haben 32 Bit (4 Oktette). CIDR gibt die Präfixlänge an.

CIDR-SCHNELLTABELLE:
/24 → 255.255.255.0   → 254 Hosts
/25 → 255.255.255.128 → 126 Hosts
/26 → 255.255.255.192 →  62 Hosts
/27 → 255.255.255.224 →  30 Hosts
/28 → 255.255.255.240 →  14 Hosts
/30 → 255.255.255.252 →   2 Hosts (Router-Links)

SUBNETZMASKE BERECHNEN:
/26 = 26 Bits → letztes Oktett: 2 Bits gesetzt = 128+64 = 192
Bits: 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1

BEISPIEL 192.168.10.0/26:
• Netzadresse:  192.168.10.0
• Broadcast:    192.168.10.63
• Erster Host:  192.168.10.1
• Letzter Host: 192.168.10.62
• Hosts nutzbar: 62

FORMEL: Nutzbare Hosts = 2^(32-CIDR) - 2

WICHTIG: IHK verlangt Binärpräfixe!
• Datenmenge: KiB, MiB, GiB (Faktor 1024)
• Übertragungsrate: kbit/s, Mbit/s (Faktor 1000)
• 1 KiB = 1024 Byte (NICHT 1 KB!)`
  },
  {
    id: "pre_003",
    title: "TCP vs. UDP & 3-Way-Handshake",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:10:00Z",
    starred: false,
    tags: ["TCP", "UDP", "Handshake", "Protokolle"],
    content: `TCP – Transmission Control Protocol:
• Verbindungsorientiert (Handshake vor Datenübertragung)
• Zuverlässig – garantierte Zustellung, Reihenfolge
• Langsamer, mehr Overhead
• Protokolle: HTTP, HTTPS, FTP, SSH, SMTP

UDP – User Datagram Protocol:
• Verbindungslos – kein Handshake
• Keine Garantie der Zustellung
• Schneller, weniger Overhead
• Protokolle: DNS, DHCP, VoIP, Gaming, Streaming

TCP 3-WAY-HANDSHAKE:
1. SYN       → Client → Server  ("Ich will verbinden")
2. SYN-ACK   → Server → Client  ("OK, bin bereit")
3. ACK       → Client → Server  ("Verbindung steht!")

VERBINDUNGSABBAU: FIN → FIN-ACK → ACK

MERKSATZ:
• TCP = Telefonieren (anrufen, abnehmen, reden)
• UDP = Brief einwerfen (weißt nicht ob er ankommt)

PORTS MERKEN:
HTTP=80, HTTPS=443, FTP=21, SSH=22, SMTP=25, DNS=53, DHCP=67/68`
  },
  {
    id: "pre_004",
    title: "DHCP & DORA-Prozess",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:15:00Z",
    starred: false,
    tags: ["DHCP", "DORA", "IP-Vergabe", "Broadcast"],
    content: `DHCP = Dynamic Host Configuration Protocol
Vergibt automatisch: IP-Adresse, Subnetzmaske, Gateway, DNS-Server

DER DORA-PROZESS:
D – Discover  → Client → ALLE      (Broadcast) "Gibt es einen DHCP-Server?"
O – Offer     → Server → Client    (Unicast)   "Ich biete dir 192.168.1.50 an"
R – Request   → Client → ALLE      (Broadcast) "Ich nehme das Angebot!"
A – Acknowledge→ Server → Client   (Unicast)   "Bestätigt! IP gehört dir für X min"

MERKSATZ: "Der Onkel Rennt Als" – Discover, Offer, Request, Acknowledge

WICHTIG:
• Discover & Request = BROADCAST
• Offer & Acknowledge = UNICAST (das wird gerne geprüft!)
• Lease-Time: Wie lange gilt die IP-Adresse
• Nach halber Lease-Time: Client versucht IP zu verlängern

DHCP-RELAY:
Problem: DHCP-Discovery ist Broadcast, Router leiten Broadcasts NICHT weiter
Lösung: DHCP-Relay-Agent auf Router leitet Anfrage als Unicast weiter
→ Ein zentraler DHCP-Server kann alle VLANs bedienen`
  },
  {
    id: "pre_005",
    title: "VLANs – Vollständige Erklärung",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:20:00Z",
    starred: true,
    tags: ["VLAN", "802.1Q", "Trunk", "Access", "Switching"],
    content: `VLAN = Virtual Local Area Network
Logische Trennung eines physischen Netzwerks ohne extra Hardware.

WARUM VLANs?
• Sicherheit: Abteilungen voneinander trennen
• Broadcast-Reduzierung: Broadcasts bleiben im VLAN
• Flexibilität: Logische Trennung unabhängig von Physik
• Kosteneinsparung: Ein Switch für alle VLANs

TYPISCHE VERGABE:
VLAN 10 → Management (Switches, Router)
VLAN 20 → Server
VLAN 30 → Clients / PCs
VLAN 40 → VoIP-Telefone
VLAN 50 → Gäste-WLAN
VLAN 60 → IoT-Geräte
VLAN 999→ Native VLAN (Sicherheit)

PORT-TYPEN:
• Access-Port: Gehört zu genau 1 VLAN, kein Tag, für Endgeräte (PCs, Drucker)
• Trunk-Port: Mehrere VLANs gleichzeitig, mit 802.1Q-Tag, für Switch↔Switch
• Hybrid-Port: Kombination, für IP-Telefone mit PC dahinter

IEEE 802.1Q TAG (4 Byte extra im Frame):
• TPID (2B): Immer 0x8100 = getaggter Frame
• PCP (3Bit): Priorität für QoS (0–7)
• DEI (1Bit): Drop Eligible
• VID (12Bit): VLAN-ID (0–4094)

NATIVE VLAN:
• Ungetaggtes VLAN auf Trunk-Port
• Standard: VLAN 1 → NICHT produktiv nutzen!
• Sicherheit: Auf VLAN 999 setzen (verhindert Double Tagging)

INTER-VLAN-ROUTING:
Verschiedene VLANs können NICHT direkt kommunizieren → brauchen Layer 3!
1. Router on a Stick: Router mit Trunk + Subinterfaces (günstig, Flaschenhals)
2. Layer-3-Switch: Internes Routing per SVI (schnell, teurer)

WLAN + VLANs:
Eine SSID = ein VLAN. AP per Trunk an Switch.
z.B. "Firma-Intern" → VLAN 30 | "Firma-Gast" → VLAN 50

VLAN HOPPING ANGRIFFE:
• Switch Spoofing: Angreifer gibt sich als Switch aus → DTP deaktivieren!
• Double Tagging: Zwei Tags, äußerer wird entfernt → Native VLAN ändern!

STP (Spanning Tree Protocol):
Verhindert Switching-Loops in redundanten Netzen.
STP (802.1D) = langsam | RSTP (802.1w) = schnell | MSTP (802.1s) = pro VLAN`
  },
  {
    id: "pre_006",
    title: "Symmetrische, Asymmetrische & Hybride Verschlüsselung",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T08:25:00Z",
    starred: true,
    tags: ["Verschlüsselung", "AES", "RSA", "TLS", "Hybrid"],
    content: `SYMMETRISCHE VERSCHLÜSSELUNG:
• Gleicher Schlüssel für Ver- und Entschlüsselung
• Schnell und effizient
• Problem: Wie tauscht man den Schlüssel sicher aus?
• Algorithmen: AES (sicher, Standard), DES/3DES (veraltet)
• Einsatz: VPN-Tunnel, Festplattenverschlüsselung, TLS-Daten

ASYMMETRISCHE VERSCHLÜSSELUNG:
• Zwei Schlüssel: Public Key (jeder darf ihn haben) + Private Key (nur du)
• Was mit Public Key verschlüsselt wird → nur Private Key kann öffnen
• Löst das Schlüsselaustausch-Problem
• Langsamer als symmetrisch!
• Algorithmen: RSA (2048/4096 Bit), ECC (moderner, effizienter)
• Einsatz: HTTPS, digitale Signaturen, Zertifikate

HYBRIDE VERSCHLÜSSELUNG (das macht TLS/HTTPS):
Schritt 1: Asymmetrisch → Session-Key sicher austauschen
Schritt 2: Symmetrisch (AES) → Daten mit Session-Key verschlüsseln
→ Sicher + schnell!

MERKSATZ:
Asymmetrisch = Briefkasten-Prinzip
Jeder kann Brief einwerfen (Public Key), nur du hast Schlüssel zum Öffnen (Private Key)

TLS-HANDSHAKE:
1. Client Hello (TLS-Version, Cipher Suites)
2. Server Hello + Zertifikat (mit Public Key)
3. Browser prüft Zertifikat (CA vertrauenswürdig?)
4. Session-Key wird ausgetauscht (Diffie-Hellman)
5. Ab jetzt: AES symmetrisch

PRÜFUNGSTIPP: TLS ist HYBRID – asymmetrisch für Schlüsselaustausch, dann AES!`
  },
  {
    id: "pre_007",
    title: "Hashwerte & Digitale Signaturen",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T08:30:00Z",
    starred: false,
    tags: ["Hash", "SHA", "Signatur", "PKI", "Integrität"],
    content: `HASHFUNKTIONEN:
• Erzeugen aus beliebiger Eingabe einen Fingerabdruck fester Länge
• Einwegfunktion: Kein Rückschluss auf Original möglich
• Kollisionsresistenz: Zwei verschiedene Eingaben → nie gleicher Hash
• Deterministisch: Gleiche Eingabe → immer gleicher Hash

ALGORITHMEN:
MD5    → 128 Bit → UNSICHER, veraltet
SHA-1  → 160 Bit → UNSICHER, veraltet
SHA-256 → 256 Bit → SICHER, aktueller Standard
SHA-512 → 512 Bit → Sehr sicher

ANWENDUNG:
• Datei-Download: Hash der Datei prüfen ob unverändert
• Passwörter speichern: Hash statt Klartext in Datenbank
• Digitale Signaturen: Hash wird signiert

DIGITALE SIGNATUR – Ablauf:
1. Sender berechnet Hash der Nachricht
2. Sender verschlüsselt Hash mit PRIVATE KEY → das ist die Signatur
3. Empfänger entschlüsselt Signatur mit PUBLIC KEY des Senders → erhält Hash
4. Empfänger berechnet selbst den Hash der Nachricht
5. Stimmen beide überein? → Nachricht ECHT & UNVERÄNDERT ✓

MERKSATZ: Hash = Fingerabdruck. Signatur = Fingerabdruck mit persönlichem Stempel

PKI (Public Key Infrastructure):
• CA = Certificate Authority (stellt Zertifikate aus, z.B. Let's Encrypt)
• X.509 = Standard für digitale Zertifikate
• Zertifikat enthält: Domain, Public Key, Gültigkeit, CA-Signatur
• S/MIME = E-Mail-Verschlüsselung und Signatur`
  },
  {
    id: "pre_008",
    title: "IT-Sicherheit – CIA-Dreieck & Angriffe",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T08:35:00Z",
    starred: false,
    tags: ["CIA", "Schutzziele", "Angriffe", "DDoS", "Phishing"],
    content: `CIA-DREIECK – Die 3 Schutzziele:

C – Confidentiality (Vertraulichkeit)
→ Nur Berechtigte haben Zugriff
→ Maßnahmen: Verschlüsselung, Zugriffsrechte, VPN

I – Integrity (Integrität)
→ Daten werden nicht unbemerkt verändert
→ Maßnahmen: Hashwerte, digitale Signaturen, RAID

A – Availability (Verfügbarkeit)
→ Systeme verfügbar wenn gebraucht
→ Maßnahmen: RAID, Backups, Redundanz, USV, Clustering

HÄUFIGE ANGRIFFE:
Phishing        → Gefälschte E-Mails/Webseiten → Spam-Filter, MFA
Spear-Phishing  → Gezieltes Phishing auf Person → Awareness
Social Engineering → Menschen manipulieren → Training
Brute Force     → Alle Passwörter probieren → Account-Lockout, MFA
Man-in-the-Middle → Angreifer zwischen Partnern → HTTPS, Zertifikate
DDoS            → Server überfluten → Firewall, Rate-Limiting
Ransomware      → Daten verschlüsseln, Lösegeld → Backups, EDR
SQL-Injection   → SQL in Eingabefelder → Prepared Statements

BSI IT-GRUNDSCHUTZ:
• Schutzbedarfskategorien: Normal / Hoch / Sehr hoch
• ISMS = Information Security Management System
• Härtung: Unnötige Dienste deaktivieren, Patch-Management

DSGVO:
• Gilt seit Mai 2018 in der EU
• Grundsätze: Datensparsamkeit, Zweckbindung, Transparenz
• Meldepflicht bei Datenpannen: Innerhalb 72 Stunden!
• Betroffenenrechte: Auskunft, Löschung, Berichtigung`
  },
  {
    id: "pre_009",
    title: "Virtualisierung – Hypervisor Typ 1 & 2",
    category: "Virtualisierung",
    author: "Claude",
    createdAt: "2024-01-01T08:40:00Z",
    starred: true,
    tags: ["Hypervisor", "VMware", "Hyper-V", "VirtualBox", "VM"],
    content: `VIRTUALISIERUNG:
Mehrere virtuelle Maschinen (VMs) auf einer physischen Hardware.
Jede VM verhält sich wie ein eigenständiger Computer mit eigenem OS.

TYP-1 HYPERVISOR (Bare Metal):
• Läuft DIREKT auf der Hardware – kein Host-OS nötig
• VMware ESXi, Microsoft Hyper-V, KVM
• Hohe Performance → Produktion, Rechenzentren
• Beispiel: Firmenserver bei ebm-papst

TYP-2 HYPERVISOR (Hosted):
• Läuft als Programm auf einem normalen Betriebssystem
• VirtualBox, VMware Workstation
• Einfach zu installieren → Tests, Entwicklung
• Beispiel: VirtualBox auf dem privaten Windows-PC

MERKSATZ:
Typ-1 = der Hypervisor IST das Betriebssystem
Typ-2 = der Hypervisor ist ein PROGRAMM auf dem Betriebssystem

WICHTIGE BEGRIFFE:
Snapshot    → Momentaufnahme der VM für Rollback
Live Migration → VM auf andere Hardware ohne Downtime (vMotion)
Template    → Vorlage zum schnellen Klonen
vSwitch     → Virtueller Switch für VM-Netzwerke
HA          → High Availability: automatischer VM-Neustart bei Host-Ausfall
DRS         → Dynamic Resource Scheduler: automatische Lastverteilung

VORTEILE:
• Bessere Hardware-Auslastung
• Schnelle Bereitstellung (Minuten statt Tage)
• Einfache Backups per Snapshot
• Isolation: Problem in einer VM betrifft andere nicht
• Disaster Recovery

VM vs. CONTAINER (Docker):
VM: Eigenes OS, GB groß, minutenlanger Start, stark isoliert
Container: Teilt Kernel, MB groß, Sekunden-Start, effizienter`
  },
  {
    id: "pre_010",
    title: "RAID-Systeme – Alle Level",
    category: "Hardware",
    author: "Claude",
    createdAt: "2024-01-01T08:45:00Z",
    starred: false,
    tags: ["RAID", "Speicher", "Redundanz", "Festplatte"],
    content: `RAID = Redundant Array of Independent Disks
Kombiniert mehrere Festplatten für Geschwindigkeit und/oder Ausfallsicherheit.

RAID-LEVEL ÜBERSICHT:
RAID 0 → Striping → min. 2 Platten → KEINE Redundanz → 100% nutzbar
         Nur Geschwindigkeit! Fällt eine aus → ALLES weg!

RAID 1 → Mirroring → min. 2 Platten → 1 Platte darf ausfallen → 50% nutzbar
         Spiegelung. Einfach und sicher.

RAID 5 → Parität → min. 3 Platten → 1 Platte darf ausfallen → (n-1)/n nutzbar
         Parität verteilt auf alle Platten.
         Beispiel: 4x2TB = (4-1)x2TB = 6TB nutzbar

RAID 6 → Doppelparität → min. 4 Platten → 2 Platten dürfen ausfallen
         (n-2)/n nutzbar. Sicherer als RAID 5.

RAID 10 → RAID 1+0 → min. 4 Platten → je 1 pro Spiegel darf ausfallen
          50% nutzbar. Schnell UND sicher. Teuerste Lösung.

BERECHNUNG:
4 Platten × 3 TB in RAID 5: (4-1) × 3 TB = 9 TB nutzbar
2 Platten × 4 TB in RAID 1: 1 × 4 TB = 4 TB nutzbar

WICHTIG: RAID IST KEIN BACKUP!
RAID schützt NUR vor Festplattenausfall.
Nicht vor: versehentlichem Löschen, Ransomware, Brand, Diebstahl!
→ Immer zusätzlich Backup nach 3-2-1-Regel!

3-2-1-REGEL:
3 Kopien der Daten
2 verschiedene Speichermedien
1 Kopie an anderem Standort (Offsite/Cloud)`
  },
  {
    id: "pre_011",
    title: "Active Directory & Gruppenrichtlinien (GPO)",
    category: "Virtualisierung",
    author: "Claude",
    createdAt: "2024-01-01T08:50:00Z",
    starred: false,
    tags: ["Active Directory", "GPO", "AD", "Kerberos", "LDAP"],
    content: `ACTIVE DIRECTORY (AD):
Verzeichnisdienst von Microsoft für zentrale Verwaltung von
Benutzern, Computern, Gruppen und Richtlinien in Windows-Netzen.

WICHTIGE BEGRIFFE:
Domain          → Logische Einheit, z.B. ebm-papst.local
Domain Controller (DC) → Server der das AD hostet und Anmeldungen prüft
OU (Org. Unit)  → Ordnerstruktur im AD (z.B. OU=IT, OU=Buchhaltung)
GPO             → Group Policy Object: Regeln für Benutzer/Computer
Kerberos        → Authentifizierungsprotokoll im AD
LDAP            → Protokoll zum Abfragen des Verzeichnisdienstes

WAS KANN EINE GPO?
• Passwortrichtlinien (min. 12 Zeichen, Ablauf alle 90 Tage)
• Desktop-Hintergrund festlegen
• Software automatisch installieren
• USB-Sticks sperren
• Firewall-Regeln verteilen
• Netzlaufwerke verbinden

PRAXISBEISPIEL:
Morgens einloggen → DC prüft Passwort per Kerberos → GPOs laden
→ Laufwerk L: verbunden, Drucker eingerichtet, USB gesperrt

NTFS-BERECHTIGUNGEN:
Lesen, Schreiben, Ausführen, Ändern, Vollzugriff

GOLDENE REGEL: NTFS + Freigabe-Recht → immer das RESTRIKTIVERE gilt!
Freigabe=Vollzugriff + NTFS=Lesen → Ergebnis: NUR LESEN

LEAST PRIVILEGE PRINZIP:
Jeder bekommt nur die Rechte die er wirklich braucht – nicht mehr!

LDAP-PORTS:
389 = LDAP (unverschlüsselt)
636 = LDAPS (TLS, verschlüsselt) ← empfohlen!`
  },
  {
    id: "pre_012",
    title: "IoT – Internet of Things",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:55:00Z",
    starred: false,
    tags: ["IoT", "MQTT", "Sensor", "Aktor", "Edge Computing"],
    content: `IoT = Internet of Things (Internet der Dinge)
Physische Geräte die Daten senden/empfangen ohne menschliches Eingreifen.

4-SCHICHTEN-ARCHITEKTUR:
Schicht 4 → Anwendung: Dashboard, App (Grafana)
Schicht 3 → Verarbeitung: Cloud, Server, Analyse (InfluxDB)
Schicht 2 → Netzwerk: WLAN, LoRaWAN, LTE, Zigbee
Schicht 1 → Wahrnehmung: Sensoren und Aktoren

Sensor = misst und liefert Daten (Temperatur, Bewegung)
Aktor  = führt Aktion aus aufgrund von Daten (Motor, Ventil)

KOMMUNIKATIONSPROTOKOLLE:
WLAN      → 50m, hoch, für Heimgeräte
Bluetooth/BLE → 10m, niedrig, Fitnesstracker
Zigbee    → 100m, sehr niedrig, smarte Lampen
LoRaWAN   → 15km!, extrem niedrig, Landwirtschaft
NB-IoT    → sehr groß, niedrig, Smart Meter
LTE/5G    → sehr groß, hoch, Fahrzeuge

MQTT (wichtigstes IoT-Protokoll!):
• Publisher → sendet an Topic
• Broker → zentrale Vermittlung (z.B. Mosquitto, Port 1883)
• Subscriber → abonniert Topics
• QoS 0 = Fire & Forget | QoS 1 = mind. einmal | QoS 2 = genau einmal

MERKSATZ: MQTT = Postzentrale. Sensor wirft Brief ein (publish),
Zentrale (Broker) verteilt an alle Abonnenten (subscribe).

EDGE vs. CLOUD COMPUTING:
Edge → Verarbeitung direkt vor Ort → niedrige Latenz, Echtzeit
Cloud → Verarbeitung im Rechenzentrum → für Langzeitanalysen

IoT-SICHERHEIT:
• Standard-Passwörter sofort ändern!
• IoT in eigenes VLAN isolieren
• Firmware regelmäßig updaten
• TLS für alle Kommunikation
• Mirai-Botnetz: Millionen IoT-Geräte durch Standard-PW gehackt!`
  },
  {
    id: "pre_013",
    title: "MQTT, Mosquitto, Node-RED, InfluxDB, Grafana",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T09:00:00Z",
    starred: false,
    tags: ["MQTT", "Mosquitto", "Node-RED", "InfluxDB", "Grafana", "IoT-Stack"],
    content: `DER KOMPLETTE IoT-STACK:
Sensor → MQTT → Mosquitto → Node-RED → InfluxDB → Grafana

MOSQUITTO (MQTT-Broker):
• Open-Source MQTT-Broker von Eclipse
• Installation: apt install mosquitto mosquitto-clients
• Test publizieren: mosquitto_pub -h localhost -t 'test/temp' -m '22.5'
• Test abonnieren: mosquitto_sub -h localhost -t 'test/#'
• # = Wildcard für alle Subtopics
• Port 1883 (unverschlüsselt), 8883 (TLS)

NODE-RED (Verbindung/Verarbeitung):
• Visuelles Flow-basiertes Programmieren
• Verbindet MQTT ↔ Datenbanken ↔ HTTP ↔ APIs
• Typischer Flow: [MQTT-In] → [Funktion] → [InfluxDB-Out]
• Läuft auf Node.js, Port 1880
• Ideal: Daten transformieren, Regeln implementieren

INFLUXDB (Zeitreihendatenbank):
• Optimiert für zeitlich anfallende Messwerte
• Measurement = Tabelle | Tag = Index | Field = Messwert
• Retention Policy: Daten nach X Tagen automatisch löschen
• Port 8086
• Abfragesprache: Flux (modern) oder InfluxQL (SQL-ähnlich)

GRAFANA (Dashboard/Visualisierung):
• Open-Source Dashboard-Tool
• Verbindet sich mit InfluxDB, Prometheus, MySQL etc.
• Panels: Linien, Balken, Gauge, Tabelle
• Alerting: Benachrichtigung bei Schwellwert-Überschreitung
• Port 3000

MQTT QoS-LEVEL:
0 = At most once  → Fire & Forget, keine Garantie
1 = At least once → Mindestens einmal, Duplikate möglich
2 = Exactly once  → Genau einmal, aufwendigster Handshake`
  },
  {
    id: "pre_014",
    title: "PowerShell – Wichtige Cmdlets & Skripte",
    category: "Scripting",
    author: "Claude",
    createdAt: "2024-01-01T09:05:00Z",
    starred: false,
    tags: ["PowerShell", "Cmdlets", "AD", "Windows", "Automatisierung"],
    content: `POWERSHELL – Schema: Verb-Noun

WICHTIGE CMDLETS:
Get-ADUser -Filter *                    → Alle AD-Benutzer auflisten
New-ADUser -Name 'Max Mustermann'       → Neuen AD-Benutzer erstellen
Get-Service | Where {$_.Status -eq 'Running'} → Laufende Dienste
Set-ExecutionPolicy RemoteSigned        → Ausführungsrichtlinie setzen
Get-EventLog -LogName Security -Newest 50 → Sicherheitsereignisse
Restart-Computer -Force                 → Computer neu starten
Test-Connection -ComputerName 8.8.8.8  → Ping-Test
Get-Content C:\logs\error.log          → Dateiinhalt lesen

PIPELINE (|):
Get-Process | Where-Object {$_.CPU -gt 50} | Sort-Object CPU
Get-ADUser -Filter * | Where {$_.Enabled -eq $true} | Export-CSV users.csv

SKRIPT-GRUNDLAGEN:
# Variablen
$name = "Fabio"
$alter = 20

# If-Bedingung
if ($CPU -gt 80) {
    Write-Host "CPU-Last hoch!"
} else {
    Write-Host "Alles OK"
}

# Foreach-Schleife
foreach ($PC in $Computer) {
    Test-Connection -ComputerName $PC
}

# Fehlerbehandlung
try {
    Get-ADUser -Identity 'testuser'
} catch {
    Write-Host "Benutzer nicht gefunden"
}

EXECUTION POLICY:
Restricted → Keine Skripte erlaubt
RemoteSigned → Lokale Skripte OK, externe müssen signiert sein
Unrestricted → Alle Skripte erlaubt (unsicher!)`
  },
  {
    id: "pre_015",
    title: "Bash & Linux-Grundlagen",
    category: "Scripting",
    author: "Claude",
    createdAt: "2024-01-01T09:10:00Z",
    starred: false,
    tags: ["Bash", "Linux", "chmod", "Shell", "Berechtigungen"],
    content: `WICHTIGE BASH-BEFEHLE:
ls -la /etc              → Alle Dateien inkl. versteckter anzeigen
chmod 755 skript.sh      → Berechtigungen setzen
chown user:gruppe datei  → Eigentümer und Gruppe ändern
grep 'error' /var/log/syslog → In Logs suchen
ps aux | grep nginx      → Prozess suchen
systemctl start nginx    → Dienst starten
systemctl enable nginx   → Dienst bei Boot aktivieren
systemctl status nginx   → Status prüfen
crontab -e               → Cron-Jobs bearbeiten
ssh user@server          → Remote-Verbindung
scp datei.txt user@server:/pfad → Datei kopieren
tail -f /var/log/syslog  → Log in Echtzeit
find / -name '*.log'     → Dateien suchen

LINUX-BERECHTIGUNGEN:
3 Kategorien: Eigentümer (u) | Gruppe (g) | Andere (o)
3 Rechte:    Read=4 | Write=2 | Execute=1

Beispiel: -rwxr-xr--
• rwx = Eigentümer: 4+2+1 = 7
• r-x = Gruppe: 4+0+1 = 5
• r-- = Andere: 4+0+0 = 4
→ chmod 754

HÄUFIGE KOMBINATIONEN:
777 → rwxrwxrwx → Alle dürfen alles (GEFÄHRLICH!)
755 → rwxr-xr-x → Standard für ausführbare Dateien
644 → rw-r--r-- → Standard für normale Dateien
600 → rw------- → Nur Eigentümer (SSH-Keys!)
700 → rwx------ → Nur Eigentümer, ausführbar

SKRIPT-GRUNDLAGEN:
#!/bin/bash
if [ $disk_usage -gt 90 ]; then
    echo "Festplatte fast voll!"
fi

for server in server1 server2; do
    ping -c 1 $server
done

CRONTAB FORMAT:
Minute Stunde Tag Monat Wochentag Befehl
0 2 * * * /usr/local/bin/backup.sh  → Täglich 02:00 Uhr`
  },
  {
    id: "pre_016",
    title: "IPv6 – Migration & Dual-Stack",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T09:15:00Z",
    starred: false,
    tags: ["IPv6", "Dual-Stack", "Migration", "CGNAT", "SLAAC"],
    content: `IPv4 vs. IPv6:
IPv4 → 32 Bit → ~4,3 Milliarden Adressen → ERSCHÖPFT
IPv6 → 128 Bit → 340 Sextillionen Adressen → Zukunft

IPv6-SCHREIBWEISE:
Voll: 2001:0db8:0000:0000:0000:0000:0000:0001
Regel 1: Führende Nullen weglassen: 2001:db8:0:0:0:0:0:1
Regel 2: Null-Blöcke zusammenfassen (nur EINMAL!): 2001:db8::1

IPv6-ADRESSTYPEN:
Unicast       → Genau ein Empfänger
Multicast     → Gruppe (ersetzt Broadcast!)
Anycast       → Nächster von mehreren
Link-Local    → fe80::/10, nur lokal, automatisch vergeben
Global Unicast→ 2000::/3, öffentlich (wie IPv4-Public)
Loopback      → ::1 (wie 127.0.0.1)

UNTERSCHIEDE IPv4 → IPv6:
• Kein Broadcast mehr → Multicast
• Kein ARP mehr → NDP (Neighbor Discovery Protocol) über ICMPv6
• NAT oft nicht nötig (genug Adressen)
• IPSec integriert
• SLAAC: Geräte konfigurieren sich SELBST (ohne DHCP!)

DUAL-STACK:
• IPv4 UND IPv6 gleichzeitig auf einem Gerät
• Häufigste Migrationsstrategie
• Vorteil: Rückwärtskompatibel, schrittweise Einführung
• Nachteil: Doppelter Konfigurationsaufwand
• ACHTUNG: Sicherheitsregeln für BEIDE Protokolle!

CGNAT (Carrier-Grade NAT):
• ISP macht NAT für viele Kunden → Adressbereich 100.64.0.0/10
• Problem: Kein Port-Forwarding, kein eigener Server
• Lösung langfristig: IPv6!

NDP ersetzt ARP in IPv6:
Neighbor Solicitation  = ARP-Request
Neighbor Advertisement = ARP-Reply`
  },
  {
    id: "pre_017",
    title: "Firewall, DMZ, Proxy & Reverse Proxy",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T09:20:00Z",
    starred: false,
    tags: ["Firewall", "DMZ", "Proxy", "Reverse Proxy", "Load Balancer"],
    content: `FIREWALL-TYPEN:
Paketfilter (Stateless) → Prüft einzelne Pakete nach IP/Port
Stateful Inspection     → Verfolgt Verbindungsstatus → empfohlen!
Application Firewall    → Prüft Anwendungsinhalte (HTTP etc.)
NGFW (Next-Gen)        → Alles + IPS, DPI, URL-Filter (Palo Alto, Fortinet)
WAF (Web App Firewall)  → Nur für HTTP/HTTPS, schützt Webserver

DMZ (Demilitarisierte Zone):
Netzwerksegment ZWISCHEN Internet und internem Netz.

Aufbau:
Internet → [Firewall 1] → DMZ → [Firewall 2] → Internes Netz
                          ↑
                    Webserver, Mailserver, VPN-GW

Warum? Gehackter Webserver → Angreifer nur in DMZ, nicht im internen Netz!

PROXY SERVER:
Sitzt zwischen Clients und Internet.
Aufgaben:
• Caching: Häufige Inhalte zwischenspeichern (Bandbreite sparen)
• Filterung: Webseiten sperren (Social Media etc.)
• Protokollierung: Alle Anfragen loggen
• Virenscan: Inhalte prüfen

HTTPS mit Proxy (SSL-Inspection):
Problem: HTTPS ist verschlüsselt → Proxy kann nicht lesen
Lösung: Proxy entschlüsselt, prüft, verschlüsselt neu
→ Client muss Proxy-Zertifikat vertrauen (per GPO verteilen)
→ Datenschutzrechtlich heikel! Betriebsvereinbarung nötig!

REVERSE PROXY:
Sitzt VOR den Servern (nicht vor Clients)
• Schützt Server (versteckt interne Struktur)
• Ermöglicht Load Balancing
• Caching auf Server-Seite
• Beispiele: nginx, HAProxy

LOAD BALANCER:
Verteilt Anfragen auf mehrere Server.
• Round Robin: Reihum auf alle Server
• Least Connections: Server mit wenigsten Verbindungen
• IP Hash: Gleiche Client-IP → immer gleicher Server`
  },
  {
    id: "pre_018",
    title: "Routing – Statisch, RIP, OSPF, BGP",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T09:25:00Z",
    starred: false,
    tags: ["Routing", "OSPF", "BGP", "RIP", "Dijkstra"],
    content: `STATISCHES ROUTING:
• Manuell eingetragene Routen
• Kein Protokoll-Overhead
• Kein automatisches Failover
• Für kleine, stabile Netze

DYNAMISCHES ROUTING – Protokolle:

RIP (Routing Information Protocol):
• Distance Vector Algorithmus (Bellman-Ford)
• Metrik: Hop-Count (max. 15! → 16 = unerreichbar)
• Sendet alle 30s komplette Routing-Tabelle an Nachbarn
• Langsame Konvergenz (Minuten)
• RIPv2: CIDR + MD5-Authentifizierung
• MERKSATZ: "Teile deinem Nachbarn mit wie du die Welt siehst"
• Nur für sehr kleine Netze geeignet!

OSPF (Open Shortest Path First):
• Link State Algorithmus (Dijkstra)
• Metrik: Cost (basiert auf Bandbreite)
• Jeder Router kennt KOMPLETTE Topologie (LSDB)
• Ablauf:
  1. Hello-Pakete → Nachbarn entdecken
  2. LSA → Verbindungen beschreiben und fluten
  3. LSDB → Vollständige Netzkarte aufbauen
  4. Dijkstra → Kürzesten Weg berechnen
• Schnelle Konvergenz (Sekunden)
• Areas: Area 0 = Backbone
• MERKSATZ: OSPF = "Jeder kennt die komplette Landkarte"

BGP (Border Gateway Protocol):
• Verbindet autonome Systeme (AS) im Internet
• Das Routing-Protokoll DES Internets
• z.B. Telekom ↔ Vodafone, Unternehmen ↔ ISP
• Sehr langsame Konvergenz (Minuten)
• Sehr hoch skalierbar
• Nur für Netzwerkspezialisten relevant

DEFAULT ROUTE: 0.0.0.0/0 → wenn keine spezifische Route passt (Internet)`
  },
  {
    id: "pre_019",
    title: "WLAN-Sicherheit – WPA2/3 & RADIUS",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T09:30:00Z",
    starred: false,
    tags: ["WLAN", "WPA2", "WPA3", "RADIUS", "802.1X", "Enterprise"],
    content: `WLAN-SICHERHEITSSTANDARDS:
WEP         → RC4, 40 Bit → SEHR SCHWACH, nicht mehr nutzen!
WPA         → TKIP → Schwach, veraltet
WPA2 Personal → AES-CCMP + PSK (Passwort) → Gut, für Heimnetz
WPA2 Enterprise → AES-CCMP + 802.1X/RADIUS → Sehr gut, Unternehmen
WPA3 Personal → SAE (kein PSK!) → Sehr hoch, modernes Heimnetz
WPA3 Enterprise → AES-256-GCMP + RADIUS → Sehr hoch, modern

WPA2/3 ENTERPRISE MIT RADIUS:
Statt gemeinsamem Passwort: jeder Nutzer mit eigenem Account!

Komponenten:
• Supplicant: Das WLAN-Gerät
• Authenticator: Der Access Point
• Authentication Server: RADIUS-Server (z.B. Windows NPS, FreeRADIUS)

ABLAUF 802.1X:
1. Gerät verbindet mit AP
2. AP sendet EAP-Request
3. Gerät sendet Credentials (Zertifikat oder Benutzername/PW)
4. AP leitet an RADIUS weiter
5. RADIUS prüft gegen AD/LDAP
6. RADIUS: Access-Accept oder Access-Reject
7. AP öffnet oder sperrt den Port

VORTEILE WPA2 ENTERPRISE:
• Jeder Nutzer hat eigene Credentials
• Nutzer sperren: nur Account deaktivieren
• Vollständige Protokollierung (wer, wann, wo)
• VLAN-Zuweisung per RADIUS möglich
• EAP-TLS: Zertifikate statt Passwörter (sehr sicher!)

WEITERE WLAN-SICHERHEIT:
• Gäste-WLAN → eigenes VLAN (kein Zugriff aufs Firmennetz)
• WIDS: erkennt unautorisierte Access Points (Rogue APs)
• 802.11w: Management Frame Protection (verhindert Deauth-Angriffe)`
  },
  {
    id: "pre_020",
    title: "SQL – Abfragen, JOINs, Normalisierung",
    category: "Datenbanken",
    author: "Claude",
    createdAt: "2024-01-01T09:35:00Z",
    starred: false,
    tags: ["SQL", "JOIN", "SELECT", "Normalisierung", "Datenbank"],
    content: `SQL = Structured Query Language

DDL (Datenbankstruktur):
CREATE TABLE Mitarbeiter (
    ID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Abteilung VARCHAR(50),
    Gehalt DECIMAL(10,2)
);
ALTER TABLE Mitarbeiter ADD COLUMN Email VARCHAR(100);
DROP TABLE Mitarbeiter;

DML (Daten manipulieren):
INSERT INTO Mitarbeiter (ID, Name) VALUES (1, 'Max Mustermann');
UPDATE Mitarbeiter SET Gehalt = 50000 WHERE ID = 1;
DELETE FROM Mitarbeiter WHERE Abteilung = 'Marketing';

DQL (Daten abfragen):
SELECT Name, Abteilung FROM Mitarbeiter
WHERE Gehalt > 40000
ORDER BY Name ASC;

AGGREGAT-FUNKTIONEN:
SELECT Abteilung, COUNT(*) AS Anzahl, AVG(Gehalt) AS Durchschnitt
FROM Mitarbeiter
GROUP BY Abteilung
HAVING COUNT(*) > 2;

JOINs:
INNER JOIN → Nur Datensätze die in BEIDEN Tabellen vorkommen
LEFT JOIN  → Alle linke Tabelle + matching rechte (NULL wenn kein Match)
RIGHT JOIN → Alle rechte + matching linke

SELECT m.Name, a.Abteilungsname
FROM Mitarbeiter m
INNER JOIN Abteilungen a ON m.AbtID = a.ID;

NORMALISIERUNG:
1NF → Atomare Werte, keine Wiederholungsgruppen
2NF → 1NF + volle Abhängigkeit vom gesamten Schlüssel
3NF → 2NF + keine transitiven Abhängigkeiten

MERKSATZ:
1NF = Eine Info pro Zelle
2NF = Alle Felder hängen vom GANZEN Schlüssel ab
3NF = Alle Felder hängen NUR vom Schlüssel ab`
  },
  {
    id: "pre_021",
    title: "WiSo – Arbeitsrecht, Sozialversicherung, Unternehmensformen",
    category: "WiSo",
    author: "Claude",
    createdAt: "2024-01-01T09:40:00Z",
    starred: false,
    tags: ["WiSo", "Arbeitsrecht", "Sozialversicherung", "GmbH", "AG"],
    content: `AUSBILDUNG & ARBEITSRECHT:
Berufsausbildungsvertrag → schriftlich, enthält: Dauer, Vergütung, Urlaub, Arbeitszeiten
Probezeit → min. 1 Monat, max. 4 Monate, kündbar ohne Angabe von Gründen
Kündigung nach Probezeit → AN: 4 Wochen | AG: nur aus wichtigem Grund
Jugendarbeitsschutz → bis 18 J.: max. 8h/Tag, 40h/Woche, kein Nacht-/Feiertagsarbeit
Betriebsrat → Interessensvertretung der Arbeitnehmer (demokratisch gewählt)

SOZIALVERSICHERUNG (5 Säulen):
KV  = Krankenversicherung     → je ½ AG + AN
RV  = Rentenversicherung      → je ½ AG + AN
AV  = Arbeitslosenversicherung → je ½ AG + AN
PV  = Pflegeversicherung      → je ½ AG + AN
UV  = Unfallversicherung      → NUR Arbeitgeber!

MERKSATZ: 4 von 5 teilen sich AG und AN – nur Unfall zahlt allein der AG!

UNTERNEHMENSFORMEN:
Einzelunternehmen → kein Mindestkapital, unbeschränkte Haftung
GbR               → min. 2 Personen, gesamtschuldnerisch
GmbH              → 25.000 € Stammkapital, Haftung = Gesellschaftsvermögen
UG                → ab 1 €, 25% Gewinn in Rücklage bis 25.000 €
AG                → 50.000 € Grundkapital, Aktionäre, Vorstand, Aufsichtsrat

KAUFMÄNNISCHE BEGRIFFE:
Netto = ohne MwSt. | Brutto = inkl. MwSt.
MwSt. = 19% (Regelsteuersatz), 7% (Lebensmittel, Bücher)
Skonto = Nachlass bei früher Zahlung (z.B. 2% bei Zahlung in 10 Tagen)
Rabatt = Preisnachlass vom Listenpreis
TCO = Total Cost of Ownership (Anschaffung + Betrieb über Nutzungsdauer)
ROI = Return on Investment = (Gewinn / Kapital) × 100`
  },
  {
    id: "pre_022",
    title: "SNMP & ICMP – Netzwerkmanagement",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T09:45:00Z",
    starred: false,
    tags: ["SNMP", "ICMP", "Monitoring", "Ping", "TTL"],
    content: `SNMP (Simple Network Management Protocol):
Überwacht und verwaltet Netzwerkgeräte (Router, Switches, Server).

KOMPONENTEN:
Manager → Zentrale Software (Nagios, Zabbix, PRTG)
Agent   → Läuft auf jedem überwachten Gerät
MIB     → Datenbank aller verwaltbaren Objekte
OID     → Eindeutige ID für jeden Messwert

OPERATIONEN:
GET      → Manager fragt einzelnen Wert ab
GET-NEXT → Nächsten Wert in MIB
GET-BULK → Mehrere Werte auf einmal
SET      → Wert setzen/ändern
TRAP     → Agent meldet Ereignis proaktiv (z.B. "Port down!")
INFORM   → Wie TRAP aber mit Bestätigung

VERSIONEN:
SNMPv1  → Community String im KLARTEXT → nicht nutzen!
SNMPv2c → Community String im KLARTEXT → nur in sicheren Netzen
SNMPv3  → Verschlüsselung + Authentifizierung → EMPFOHLEN!

ICMP (Internet Control Message Protocol):
Hilfsprotokoll für IP – keine Ports, läuft direkt über IP.

WICHTIGE TYPEN:
Type 0  = Echo Reply       → Antwort auf Ping
Type 3  = Destination Unreachable → Ziel nicht erreichbar
Type 8  = Echo Request     → Ping-Anfrage
Type 11 = Time Exceeded    → TTL abgelaufen (nutzt Traceroute!)

TTL (Time to Live):
Jedes IP-Paket hat TTL-Wert. Jeder Router dekrementiert um 1.
TTL=0 → Paket wird verworfen → ICMP Time Exceeded zurück.
Verhindert ewige Routing-Loops!

TRACEROUTE nutzt TTL:
Sendet Pakete mit TTL=1, 2, 3... → bekommt ICMP von jedem Router
Windows: tracert | Linux: traceroute`
  },
  {
    id: "pre_023",
    title: "VPN – FirmenVPN vs. Anbieter & IPSec",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T09:50:00Z",
    starred: false,
    tags: ["VPN", "IPSec", "WireGuard", "OpenVPN", "Homeoffice"],
    content: `VPN = Virtual Private Network
Verschlüsselter Tunnel über unsichere Netze (Internet).

FIRMEN-VPN vs. KOMMERZIELLER ANBIETER:
FirmenVPN:
• Zweck: Sicherer Zugriff auf Firmennetz (Homeoffice)
• Betreiber: Das eigene Unternehmen
• Zugriff auf: Interne Server, Freigaben, Intranet
• Vertrauen: Man vertraut dem eigenen Unternehmen

Kommerzieller Anbieter (NordVPN, ExpressVPN):
• Zweck: Anonymisierung, Ländersperren umgehen
• Betreiber: Kommerzielles Unternehmen
• ACHTUNG: Anbieter sieht DEINEN gesamten Traffic!
• Datenschutz kritisch prüfen!

VPN-TYPEN:
Site-to-Site  → Zwei Standorte dauerhaft verbunden (Filiale ↔ Zentrale)
Remote-Access → Einzelne Nutzer von außen ins Firmennetz (Homeoffice)

VPN-PROTOKOLLE:
IPSec      → L3, sehr sicher, Standard in Unternehmen
OpenVPN    → L3/L4, sehr sicher, open source, flexibel
WireGuard  → L3, sehr sicher, modern, schnellstes Protokoll!
L2TP/IPSec → L2, häufig auf mobilen Geräten
PPTP       → VERALTET, unsicher – nicht mehr nutzen!
SSL-VPN    → läuft über HTTPS, firewall-freundlich

IPSec DETAIL:
Modi:
• Tunnel-Modus → ganzes Paket verschlüsselt (für VPN)
• Transport-Modus → nur Nutzlast (End-to-End)

Protokolle:
• AH → nur Integrität, KEINE Verschlüsselung
• ESP → Verschlüsselung + Integrität ← das wird genutzt!

IKE (Port 500 UDP) → handelt Sicherheitsparameter aus`
  },
  {
    id: "pre_024",
    title: "Backup-Strategien & 3-2-1-Regel",
    category: "Hardware",
    author: "Claude",
    createdAt: "2024-01-01T09:55:00Z",
    starred: false,
    tags: ["Backup", "3-2-1", "RTO", "RPO", "Inkrementell"],
    content: `BACKUP-TYPEN:
Voll-Backup:
• Sichert ALLES komplett
• Dauer: Lang | Speicher: Viel | Restore: Schnell (nur 1 Band)

Differenziell:
• Sichert alles seit letztem VOLL-BACKUP
• Dauer: Mittel | Speicher: Mittel | Restore: Voll + 1 Diff

Inkrementell:
• Sichert nur Änderungen seit letztem BACKUP (egal welcher Art)
• Dauer: Kurz | Speicher: Wenig | Restore: LANGSAM (Voll + ALLE Inkremente)

PRÜFUNGSTIPP: Inkrementell ist beim RESTORE am LANGSAMSTEN!
Alle Inkremente müssen der Reihe nach eingespielt werden.

3-2-1-REGEL:
3 Kopien der Daten
2 verschiedene Speichermedien (z.B. Festplatte + NAS)
1 Kopie an anderem Standort (Offsite oder Cloud)

MERKSATZ: Wenn Büro brennt → Offsite-Kopie rettet dich!

WICHTIGE BEGRIFFE:
RTO (Recovery Time Objective):
Wie lange darf das System ausfallen?
z.B. "Wir müssen innerhalb von 4 Stunden wieder online sein"

RPO (Recovery Point Objective):
Wie viel Datenverlust ist akzeptabel?
z.B. "Wir dürfen maximal 1 Stunde Daten verlieren"

RAID IST KEIN BACKUP:
• Schützt nur vor Festplattenausfall
• NICHT vor: Löschen, Ransomware, Brand, Diebstahl
• Immer zusätzlich Backup nach 3-2-1!

MONITORING:
SNMP, Syslog, ICMP/Ping
Tools: Nagios, Zabbix, Prometheus + Grafana`
  },
  {
    id: "pre_025",
    title: "Urheberrecht, Lizenzen & DSGVO",
    category: "WiSo",
    author: "Claude",
    createdAt: "2024-01-01T10:00:00Z",
    starred: false,
    tags: ["Urheberrecht", "Lizenz", "GPL", "MIT", "DSGVO"],
    content: `URHEBERRECHT:
• Entsteht automatisch mit der Schöpfung (keine Anmeldung nötig!)
• Schutzdauer: 70 Jahre nach Tod des Urhebers
• Softwareentwickler = Urheber des Codes
• Privatkopie erlaubt (aber kein Kopierschutz umgehen)

SOFTWARE-LIZENZEN:
Proprietär/Closed Source → Quellcode geheim, Nutzung nach EULA (Windows, Office)
Freeware       → Kostenlos, aber Quellcode geschlossen
Open Source    → Quellcode offen, Weitergabe möglich

WICHTIGE OPEN SOURCE LIZENZEN:
GPL (GNU Public License):
→ Copyleft! Abgeleitete Werke MÜSSEN auch GPL sein
→ Kann nicht in proprietäre Software eingebaut werden
→ Beispiel: Linux-Kernel

MIT-Lizenz:
→ Sehr permissiv – fast alles erlaubt
→ Nur Namensnennung nötig
→ Kann in proprietäre Software eingebaut werden
→ Beispiel: React, jQuery

Apache 2.0:
→ Wie MIT, aber mit Patentklausel
→ Beispiel: Android (Teile)

EULA = End User License Agreement (Endnutzer-Lizenzvertrag)
OEM-Lizenz = An Hardware gebunden, nicht übertragbar
Volumenlizenz = Für viele Nutzer/Geräte (Unternehmen)
Subscription = Abonnement (z.B. Microsoft 365)

DSGVO (seit Mai 2018):
7 GRUNDSÄTZE:
1. Rechtmäßigkeit (Rechtsgrundlage nötig)
2. Datensparsamkeit (nur nötige Daten)
3. Zweckbindung (nur für angegebenen Zweck)
4. Richtigkeit (aktuell und korrekt)
5. Speicherbegrenzung (nicht länger als nötig)
6. Integrität/Vertraulichkeit (technischer Schutz)
7. Rechenschaftspflicht (Nachweis der Einhaltung)

BETROFFENENRECHTE:
Auskunft, Löschung, Berichtigung, Datenübertragbarkeit, Widerspruch

MELDEPFLICHT: Datenpannen → innerhalb 72 STUNDEN melden!`
  }
];

// ── Storage ──────────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const res = await window.storage.get(STORE_KEY, true);
    if (res) {
      const saved = JSON.parse(res.value);
      // Preloaded mergen – nur hinzufügen wenn ID noch nicht existiert
      const savedIds = new Set(saved.map(s => s.id));
      const missing = PRELOADED.filter(p => !savedIds.has(p.id));
      if (missing.length > 0) {
        const merged = [...saved, ...missing].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        await window.storage.set(STORE_KEY, JSON.stringify(merged), true);
        return merged;
      }
      return saved;
    } else {
      await window.storage.set(STORE_KEY, JSON.stringify(PRELOADED), true);
      return PRELOADED;
    }
  } catch { return PRELOADED; }
}

async function saveData(list) {
  try { await window.storage.set(STORE_KEY, JSON.stringify(list), true); }
  catch (e) { console.error(e); }
}

// ── Konstanten ───────────────────────────────────────────────────────────────
const CATEGORIES = ["Netzwerke","IT-Sicherheit","Virtualisierung","Scripting","Datenbanken","Hardware","WiSo","Sonstiges"];
const CAT_COLORS = {
  "Netzwerke":       { bg:"#0a1f3d", badge:"#3b82f6" },
  "IT-Sicherheit":   { bg:"#1a0a2e", badge:"#a855f7" },
  "Virtualisierung": { bg:"#0a2e1a", badge:"#22c55e" },
  "Scripting":       { bg:"#2a2000", badge:"#eab308" },
  "Datenbanken":     { bg:"#0a1828", badge:"#38bdf8" },
  "Hardware":        { bg:"#2e0f0f", badge:"#ef4444" },
  "WiSo":            { bg:"#1e0a1e", badge:"#ec4899" },
  "Sonstiges":       { bg:"#111",    badge:"#888" },
};

// ── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const p = { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
  const icons = {
    upload:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    search:  <svg width={size} height={size} viewBox="0 0 24 24" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trash:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    book:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    close:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    plus:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    star:    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    check:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    copy:    <svg width={size} height={size} viewBox="0 0 24 24" {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" {...p}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
    users:   <svg width={size} height={size} viewBox="0 0 24 24" {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  };
  return icons[name] || null;
};

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Netzwerke");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    await onSave({ id: Date.now().toString(), title: title.trim(), category, content: content.trim(), tags: tags.split(",").map(t=>t.trim()).filter(Boolean), author: author.trim() || "Anonym", createdAt: new Date().toISOString(), starred: false });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const inp = { width:"100%", background:"#0f0f0f", border:"1px solid #222", borderRadius:"8px", padding:"0.7rem 1rem", color:"#ddd", fontSize:"0.88rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  const lbl = { fontSize:"0.62rem", letterSpacing:"0.18em", color:"#555", display:"block", marginBottom:"0.4rem", fontWeight:"600" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(10px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#0a0a0a", border:"1px solid #1e1e1e", borderRadius:"16px", width:"100%", maxWidth:"680px", maxHeight:"92vh", overflow:"auto", boxShadow:"0 0 80px rgba(0,0,0,0.9)" }}>
        <div style={{ padding:"1.25rem 1.75rem", borderBottom:"1px solid #141414", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#0a0a0a", zIndex:10 }}>
          <div>
            <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:"#3b82f6", marginBottom:"0.2rem", display:"flex", alignItems:"center", gap:"0.4rem" }}><Icon name="users" size={10}/> GETEILT MIT ALLEN</div>
            <div style={{ fontSize:"1.1rem", fontWeight:"bold", fontFamily:"'Courier New',monospace" }}>Neue Zusammenfassung</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #1e1e1e", borderRadius:"7px", padding:"0.4rem", cursor:"pointer", color:"#555" }}><Icon name="close" size={17}/></button>
        </div>
        <div style={{ padding:"1.5rem 1.75rem", display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 140px", gap:"1rem" }}>
            <div><label style={lbl}>TITEL *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. OSI-Modell – Die 7 Schichten" style={inp}/></div>
            <div><label style={lbl}>DEIN NAME</label><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Fabio" style={inp}/></div>
          </div>
          <div>
            <label style={lbl}>KATEGORIE</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
              {CATEGORIES.map(cat => { const active = category===cat; const col = CAT_COLORS[cat]; return (
                <button key={cat} onClick={()=>setCategory(cat)} style={{ padding:"0.35rem 0.8rem", borderRadius:"20px", fontSize:"0.78rem", border:active?`1px solid ${col.badge}`:"1px solid #1e1e1e", background:active?`${col.badge}18`:"transparent", color:active?col.badge:"#555", cursor:"pointer", fontFamily:"inherit" }}>{cat}</button>
              );})}
            </div>
          </div>
          <div><label style={lbl}>INHALT *</label><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder={"Zusammenfassung hier eingeben...\n\nTipp: Direkt aus dem Chat kopieren!"} rows={10} style={{ ...inp, fontFamily:"'Courier New',monospace", lineHeight:"1.7", resize:"vertical", color:"#bbb" }}/></div>
          <div><label style={lbl}>TAGS (Komma-getrennt)</label><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="VLAN, Switching, 802.1Q..." style={inp}/></div>
          <button onClick={handleSave} disabled={!title.trim()||!content.trim()||saving} style={{ padding:"0.85rem", borderRadius:"10px", background:saved?"#0a1a0a":(title.trim()&&content.trim()?"#fff":"#141414"), border:saved?"1px solid #22c55e":"none", color:saved?"#22c55e":(title.trim()&&content.trim()?"#000":"#333"), fontSize:"0.85rem", fontWeight:"bold", cursor:"pointer", letterSpacing:"0.06em", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
            {saved?<><Icon name="check" size={15}/>GESPEICHERT!</>:saving?"WIRD GESPEICHERT...":<><Icon name="upload" size={15}/>FÜR ALLE SPEICHERN</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ summary, onClose, onDelete, onStar }) {
  const [copied, setCopied] = useState(false);
  const col = CAT_COLORS[summary.category] || CAT_COLORS["Sonstiges"];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.93)", backdropFilter:"blur(12px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#080808", border:`1px solid ${col.badge}30`, borderRadius:"16px", width:"100%", maxWidth:"780px", maxHeight:"93vh", overflow:"auto", boxShadow:`0 0 80px ${col.badge}10` }}>
        <div style={{ padding:"1.25rem 1.75rem", borderBottom:`1px solid ${col.badge}18`, background:`linear-gradient(135deg,${col.bg}bb,#080808)`, position:"sticky", top:0, zIndex:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"1rem" }}>
            <div style={{ flex:1 }}>
              <span style={{ fontSize:"0.58rem", letterSpacing:"0.2em", color:col.badge, background:`${col.badge}12`, padding:"0.18rem 0.5rem", borderRadius:"4px", border:`1px solid ${col.badge}25`, fontWeight:"bold" }}>{summary.category.toUpperCase()}</span>
              <div style={{ fontSize:"1.2rem", fontWeight:"bold", color:"#eee", fontFamily:"'Courier New',monospace", marginTop:"0.45rem", lineHeight:1.3 }}>{summary.title}</div>
              <div style={{ fontSize:"0.7rem", color:"#444", marginTop:"0.3rem" }}>von {summary.author} · {new Date(summary.createdAt).toLocaleDateString("de-DE",{day:"2-digit",month:"long",year:"numeric"})}</div>
            </div>
            <div style={{ display:"flex", gap:"0.4rem" }}>
              {[
                { icon:"star", action:()=>onStar(summary.id), color:summary.starred?"#f5c518":"#444", hover:"#f5c518" },
                { icon:copied?"check":"copy", action:()=>{navigator.clipboard.writeText(summary.content);setCopied(true);setTimeout(()=>setCopied(false),2000);}, color:copied?"#22c55e":"#444", hover:"#22c55e" },
                { icon:"trash", action:()=>{onDelete(summary.id);onClose();}, color:"#444", hover:"#ef4444" },
                { icon:"close", action:onClose, color:"#444", hover:"#fff" },
              ].map((b,i)=>(
                <button key={i} onClick={b.action} style={{ background:"none", border:"1px solid #1a1a1a", borderRadius:"7px", padding:"0.4rem", cursor:"pointer", color:b.color, transition:"color 0.15s" }} onMouseEnter={e=>e.currentTarget.style.color=b.hover} onMouseLeave={e=>e.currentTarget.style.color=b.color}><Icon name={b.icon} size={14}/></button>
              ))}
            </div>
          </div>
          {summary.tags.length>0&&<div style={{ display:"flex", flexWrap:"wrap", gap:"0.35rem", marginTop:"0.65rem" }}>{summary.tags.map(t=><span key={t} style={{ fontSize:"0.65rem", color:"#666", background:"#0f0f0f", padding:"0.12rem 0.4rem", borderRadius:"4px", border:"1px solid #1a1a1a" }}>#{t}</span>)}</div>}
        </div>
        <div style={{ padding:"1.75rem", fontFamily:"'Courier New',monospace", fontSize:"0.87rem", color:"#b0b0b0", lineHeight:"1.9", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>{summary.content}</div>
      </div>
    </div>
  );
}

// ── Hauptapp ─────────────────────────────────────────────────────────────────
export default function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Alle");
  const [filterStarred, setFilterStarred] = useState(false);
  const [toast, setToast] = useState(null);
  const [spin, setSpin] = useState(false);

  useEffect(()=>{ loadData().then(d=>{ setSummaries(d); setLoading(false); }); },[]);
  useEffect(()=>{ const t=setInterval(()=>loadData().then(setSummaries),30000); return ()=>clearInterval(t); },[]);

  const showToast=(msg,type="ok")=>{ setToast({msg,type}); setTimeout(()=>setToast(null),3000); };
  const refresh=async()=>{ setSpin(true); const d=await loadData(); setSummaries(d); setTimeout(()=>setSpin(false),500); showToast("Aktualisiert!"); };
  const handleSave=async(e)=>{ const u=[e,...summaries]; setSummaries(u); await saveData(u); showToast("Für alle gespeichert! ✓"); };
  const handleDelete=async(id)=>{ const u=summaries.filter(s=>s.id!==id); setSummaries(u); await saveData(u); showToast("Gelöscht.","err"); };
  const handleStar=async(id)=>{ const u=summaries.map(s=>s.id===id?{...s,starred:!s.starred}:s); setSummaries(u); await saveData(u); };

  const filtered=summaries.filter(s=>{
    const q=search.toLowerCase();
    return (!q||[s.title,s.content,...s.tags,s.author].some(x=>x?.toLowerCase().includes(q)))
      &&(filterCat==="Alle"||s.category===filterCat)
      &&(!filterStarred||s.starred);
  });

  const counts=CATEGORIES.reduce((a,c)=>{a[c]=summaries.filter(s=>s.category===c).length;return a;},{});

  return (
    <div style={{ minHeight:"100vh", background:"#070707", color:"#fff", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0c0c0c}
        ::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}
        .card{transition:transform .18s,box-shadow .18s}
        .card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.5)}
        .sbtn{transition:all .15s}
        .sbtn:hover{color:#ccc!important;background:#111!important}
      `}</style>

      {toast&&<div style={{ position:"fixed", top:"1.25rem", right:"1.25rem", zIndex:200, background:toast.type==="err"?"#120808":"#081408", border:`1px solid ${toast.type==="err"?"#7b2d2d":"#2d7b4a"}`, borderRadius:"10px", padding:"0.65rem 1.1rem", color:toast.type==="err"?"#e57373":"#66bb6a", fontSize:"0.8rem", animation:"slideDown .25s ease", display:"flex", alignItems:"center", gap:"0.5rem", boxShadow:"0 4px 20px rgba(0,0,0,.5)" }}><Icon name={toast.type==="err"?"trash":"check"} size={12}/>{toast.msg}</div>}

      {/* Header */}
      <div style={{ borderBottom:"1px solid #111", background:"#090909", padding:"1rem 1.75rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.9rem" }}>
          <div style={{ width:"36px", height:"36px", background:"#fff", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Icon name="book" size={19}/></div>
          <div>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"1.05rem", fontWeight:"bold" }}>FISI Lernportal</div>
            <div style={{ fontSize:"0.6rem", color:"#3b82f6", letterSpacing:"0.12em", display:"flex", alignItems:"center", gap:"0.4rem" }}><Icon name="users" size={9}/> GETEILT · {summaries.length} EINTRÄGE · IHK HEILBRONN</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={refresh} style={{ background:"none", border:"1px solid #1e1e1e", borderRadius:"8px", padding:"0.5rem 0.8rem", color:"#555", cursor:"pointer", fontSize:"0.78rem", fontFamily:"inherit", display:"flex", alignItems:"center", gap:"0.4rem" }}>
            <div style={{ animation:spin?"spin .5s linear":"none" }}><Icon name="refresh" size={13}/></div>Sync
          </button>
          <button onClick={()=>setShowUpload(true)} style={{ display:"flex", alignItems:"center", gap:"0.45rem", background:"#fff", color:"#000", border:"none", borderRadius:"8px", padding:"0.55rem 1.1rem", fontSize:"0.82rem", fontWeight:"bold", cursor:"pointer", letterSpacing:"0.05em", fontFamily:"inherit" }}>
            <Icon name="plus" size={14}/> HINZUFÜGEN
          </button>
        </div>
      </div>

      <div style={{ display:"flex", minHeight:"calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <div style={{ width:"200px", flexShrink:0, borderRight:"1px solid #0f0f0f", padding:"1.1rem 0.65rem", display:"flex", flexDirection:"column", gap:"2px" }}>
          <div style={{ fontSize:"0.58rem", color:"#3a3a3a", letterSpacing:"0.18em", marginBottom:"0.45rem", padding:"0 0.5rem" }}>KATEGORIEN</div>
          {["Alle",...CATEGORIES].map(cat=>{
            const count=cat==="Alle"?summaries.length:(counts[cat]||0);
            const active=filterCat===cat;
            const col=CAT_COLORS[cat];
            return <button key={cat} onClick={()=>setFilterCat(cat)} className="sbtn" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.4rem 0.65rem", borderRadius:"6px", border:"none", background:active?(cat==="Alle"?"#1a1a1a":`${col?.badge}15`):"transparent", color:active?(cat==="Alle"?"#fff":col?.badge):"#4a4a4a", cursor:"pointer", fontSize:"0.8rem", fontFamily:"inherit", textAlign:"left", borderLeft:active&&cat!=="Alle"?`2px solid ${col?.badge}`:"2px solid transparent" }}>
              <span>{cat}</span>
              {count>0&&<span style={{ fontSize:"0.62rem", background:"#0f0f0f", padding:"0.08rem 0.35rem", borderRadius:"4px", color:"#444" }}>{count}</span>}
            </button>;
          })}
          <div style={{ height:"1px", background:"#0f0f0f", margin:"0.5rem 0" }}/>
          <button onClick={()=>setFilterStarred(!filterStarred)} className="sbtn" style={{ display:"flex", alignItems:"center", gap:"0.45rem", padding:"0.4rem 0.65rem", borderRadius:"6px", border:"none", background:filterStarred?"#1a150a":"transparent", color:filterStarred?"#f5c518":"#4a4a4a", cursor:"pointer", fontSize:"0.8rem", fontFamily:"inherit", borderLeft:filterStarred?"2px solid #f5c518":"2px solid transparent" }}>
            <Icon name="star" size={12}/><span>Favoriten</span>
          </button>
          <div style={{ marginTop:"auto", padding:"0.75rem 0.5rem", borderTop:"1px solid #0f0f0f" }}>
            {[["Gesamt",summaries.length],["Favoriten",summaries.filter(s=>s.starred).length],["Autoren",[...new Set(summaries.map(s=>s.author))].length]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.28rem" }}>
                <span style={{ fontSize:"0.7rem", color:"#3a3a3a" }}>{l}</span>
                <span style={{ fontSize:"0.7rem", color:"#666", fontFamily:"'Courier New',monospace" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex:1, padding:"1.25rem 1.75rem", overflow:"auto", minWidth:0 }}>
          <div style={{ position:"relative", marginBottom:"1.1rem" }}>
            <div style={{ position:"absolute", left:"0.85rem", top:"50%", transform:"translateY(-50%)", color:"#333", pointerEvents:"none" }}><Icon name="search" size={14}/></div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suchen nach Titel, Inhalt, Tags, Autor..." style={{ width:"100%", background:"#0d0d0d", border:"1px solid #181818", borderRadius:"9px", padding:"0.7rem 1rem 0.7rem 2.4rem", color:"#bbb", fontSize:"0.86rem", outline:"none", fontFamily:"inherit" }}/>
            {search&&<button onClick={()=>setSearch("")} style={{ position:"absolute", right:"0.7rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#444", cursor:"pointer" }}><Icon name="close" size={12}/></button>}
          </div>

          {loading&&<div style={{ textAlign:"center", padding:"5rem", color:"#2a2a2a", fontSize:"0.75rem", letterSpacing:"0.2em", animation:"pulse 1.5s infinite" }}>WIRD GELADEN...</div>}

          {!loading&&filtered.length===0&&(
            <div style={{ textAlign:"center", padding:"5rem 2rem" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📚</div>
              <div style={{ fontSize:"0.95rem", color:"#3a3a3a", marginBottom:"0.4rem" }}>{search||filterCat!=="Alle"||filterStarred?"Keine Treffer":"Noch keine Einträge"}</div>
              {!search&&filterCat==="Alle"&&!filterStarred&&<button onClick={()=>setShowUpload(true)} style={{ marginTop:"1.25rem", padding:"0.65rem 1.4rem", background:"#fff", color:"#000", border:"none", borderRadius:"9px", cursor:"pointer", fontSize:"0.82rem", fontWeight:"bold", fontFamily:"inherit" }}>Erste Zusammenfassung hinzufügen</button>}
            </div>
          )}

          {!loading&&filtered.length>0&&(search||filterCat!=="Alle"||filterStarred)&&(
            <div style={{ fontSize:"0.68rem", color:"#3a3a3a", marginBottom:"0.9rem", letterSpacing:"0.06em" }}>
              {filtered.length} ERGEBNIS{filtered.length!==1?"SE":""}
              {filterCat!=="Alle"&&` · ${filterCat}`}{filterStarred&&" · Favoriten"}{search&&` · "${search}"`}
            </div>
          )}

          {!loading&&filtered.length>0&&(
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))", gap:"0.9rem" }}>
              {filtered.map(s=>{
                const col=CAT_COLORS[s.category]||CAT_COLORS["Sonstiges"];
                const preview=s.content.slice(0,145)+(s.content.length>145?"…":"");
                return (
                  <div key={s.id} className="card" onClick={()=>setSelected(s)} style={{ background:`linear-gradient(150deg,${col.bg}cc,#0a0a0a)`, border:`1px solid ${col.badge}18`, borderRadius:"12px", padding:"1.1rem", cursor:"pointer", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,${col.badge},transparent 70%)` }}/>
                    {s.starred&&<div style={{ position:"absolute", top:"0.7rem", right:"0.7rem", color:"#f5c518" }}><Icon name="star" size={12}/></div>}
                    <span style={{ fontSize:"0.56rem", letterSpacing:"0.18em", color:col.badge, background:`${col.badge}10`, padding:"0.16rem 0.45rem", borderRadius:"4px", border:`1px solid ${col.badge}22`, fontWeight:"bold" }}>{s.category.toUpperCase()}</span>
                    <div style={{ fontFamily:"'Courier New',monospace", fontSize:"0.9rem", fontWeight:"bold", color:"#e0e0e0", margin:"0.5rem 0 0.4rem", lineHeight:1.35 }}>{s.title}</div>
                    <div style={{ fontSize:"0.74rem", color:"#4a4a4a", lineHeight:"1.6", fontFamily:"'Courier New',monospace" }}>{preview}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.85rem", paddingTop:"0.65rem", borderTop:`1px solid ${col.badge}10` }}>
                      <div style={{ display:"flex", gap:"0.28rem", flexWrap:"wrap" }}>
                        {s.tags.slice(0,3).map(t=><span key={t} style={{ fontSize:"0.6rem", color:"#444", background:"#0a0a0a", padding:"0.1rem 0.35rem", borderRadius:"3px", border:"1px solid #141414" }}>#{t}</span>)}
                      </div>
                      <span style={{ fontSize:"0.6rem", color:"#2a2a2a", whiteSpace:"nowrap" }}>{s.author} · {new Date(s.createdAt).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showUpload&&<UploadModal onClose={()=>setShowUpload(false)} onSave={handleSave}/>}
      {selected&&<DetailModal summary={selected} onClose={()=>setSelected(null)} onDelete={handleDelete} onStar={id=>{handleStar(id);setSelected(p=>p?{...p,starred:!p.starred}:null);}}/>}
    </div>
  );
}
