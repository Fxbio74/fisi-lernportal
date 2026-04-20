import { useState, useEffect } from "react";

// ── Storage (localStorage fuer Vercel-Hosting) ───────────────────────────────
const STORE_KEY = "fisi_lernportal_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const savedIds = new Set(saved.map((s) => s.id));
      const missing = PRELOADED.filter((p) => !savedIds.has(p.id));
      if (missing.length > 0) {
        const merged = [...saved, ...missing].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        localStorage.setItem(STORE_KEY, JSON.stringify(merged));
        return merged;
      }
      return saved;
    } else {
      localStorage.setItem(STORE_KEY, JSON.stringify(PRELOADED));
      return PRELOADED;
    }
  } catch {
    return PRELOADED;
  }
}

function saveData(list) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Speichern fehlgeschlagen", e);
  }
}

// ── Vorgeladene Zusammenfassungen ────────────────────────────────────────────
const PRELOADED = [
  {
    id: "pre_001",
    title: "OSI-Modell – Die 7 Schichten",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:00:00Z",
    starred: true,
    tags: ["OSI", "Schichten", "Protokolle", "Grundlagen"],
    content: `OSI-Modell – 7 Schichten (Open Systems Interconnection)

MERKSATZ: "Please Do Not Throw Salami Pizza Away"

Schicht 1 – Physical:    Kabel, Hubs, Signale (Bits)
Schicht 2 – Data Link:   MAC, Switches, Ethernet, VLAN, ARP
Schicht 3 – Network:     IP, Router, ICMP (logische Adressierung)
Schicht 4 – Transport:   TCP (verbindungsorientiert), UDP (verbindungslos), Ports
Schicht 5 – Session:     NetBIOS, RPC (Sitzungsaufbau)
Schicht 6 – Presentation:TLS/SSL, JPEG (Verschluesselung, Kompression)
Schicht 7 – Application: HTTP, HTTPS, FTP, SMTP, DNS, DHCP

PRUEFUNGSTIPPS:
• Switch     = Schicht 2 (MAC-Adressen)
• Router     = Schicht 3 (IP-Adressen)
• Firewall   = Schicht 3–7 je nach Typ
• Hub        = Schicht 1 (dummes Geraet, keine Intelligenz)

TCP 3-Way-Handshake: SYN → SYN-ACK → ACK
TCP Verbindungsabbau: FIN → FIN-ACK → ACK

WICHTIGE PORTS:
HTTP=80 | HTTPS=443 | FTP=21 | SSH=22
SMTP=25 | DNS=53 | DHCP=67/68 | RDP=3389`,
  },
  {
    id: "pre_002",
    title: "IP-Adressen & Subnetting",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:05:00Z",
    starred: true,
    tags: ["Subnetting", "CIDR", "IPv4", "Berechnung"],
    content: `IPv4-Adressen: 32 Bit, 4 Oktette (z.B. 192.168.10.50)

CIDR-SCHNELLTABELLE:
/24 = 255.255.255.0   → 254 Hosts
/25 = 255.255.255.128 → 126 Hosts
/26 = 255.255.255.192 →  62 Hosts
/27 = 255.255.255.224 →  30 Hosts
/28 = 255.255.255.240 →  14 Hosts
/29 = 255.255.255.248 →   6 Hosts
/30 = 255.255.255.252 →   2 Hosts (Router-Links!)

SUBNETZMASKE BERECHNEN (/26):
26 Bits = 1 → letztes Oktett: 2 Bits gesetzt = 128+64 = 192
Bitwerte: 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1

BEISPIEL 192.168.10.0/26:
Netzadresse:  192.168.10.0
Broadcast:    192.168.10.63
Erster Host:  192.168.10.1
Letzter Host: 192.168.10.62
Nutzbar:      62 Hosts

FORMEL: Hosts = 2^(32-CIDR) - 2

BINAERPRAEFIXE (IHK!):
Datenmenge:    KiB, MiB, GiB (Faktor 1024)
Uebertragung:  kbit/s, Mbit/s (Faktor 1000)
1 KiB = 1024 Byte (NICHT 1 KB schreiben!)

PRIVATE IP-BEREICHE:
10.0.0.0/8 | 172.16.0.0/12 | 192.168.0.0/16`,
  },
  {
    id: "pre_003",
    title: "TCP vs. UDP & DHCP-DORA",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:10:00Z",
    starred: false,
    tags: ["TCP", "UDP", "DHCP", "DORA", "Protokolle"],
    content: `TCP vs. UDP:
TCP: verbindungsorientiert, zuverlaessig, langsamer
     → HTTP, HTTPS, FTP, SSH, SMTP
UDP: verbindungslos, schnell, keine Garantie
     → DNS, DHCP, VoIP, Gaming, Streaming

MERKSATZ:
TCP = Telefonieren (anrufen, abnehmen, reden)
UDP = Brief einwerfen (weisst nicht ob er ankommt)

TCP 3-WAY-HANDSHAKE:
1. SYN     Client→Server ("Ich will verbinden")
2. SYN-ACK Server→Client ("OK, bin bereit")
3. ACK     Client→Server ("Verbindung steht!")

DHCP-DORA:
D – Discover  → Client→ALLE   (Broadcast) "Gibt es einen DHCP-Server?"
O – Offer     → Server→Client (Unicast)   "Ich biete dir eine IP an"
R – Request   → Client→ALLE   (Broadcast) "Ich nehme das Angebot!"
A – Acknowledge→Server→Client (Unicast)   "Bestaetigt! Gehoert dir!"

MERKSATZ: "Der Onkel Rennt Als" – D, O, R, A
Discover & Request = BROADCAST
Offer & Acknowledge = UNICAST (wird geprueft!)

DHCP vergibt: IP, Subnetzmaske, Gateway, DNS-Server
Lease-Time: Wie lange gilt die IP (z.B. 24 Stunden)`,
  },
  {
    id: "pre_004",
    title: "VLANs – Vollstaendige Erklaerung",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:15:00Z",
    starred: true,
    tags: ["VLAN", "802.1Q", "Trunk", "Access", "STP"],
    content: `VLAN = Virtual Local Area Network
Logische Trennung ohne extra Hardware.

WARUM VLANs?
• Sicherheit: Abteilungen trennen
• Broadcast-Reduzierung
• Flexibilitaet & Kostenersparnis

TYPISCHE VERGABE:
VLAN 10 → Management | VLAN 20 → Server
VLAN 30 → Clients    | VLAN 40 → VoIP
VLAN 50 → Gaeste     | VLAN 60 → IoT
VLAN 999→ Native VLAN (Sicherheit)

PORT-TYPEN:
Access-Port: 1 VLAN, kein Tag, fuer Endgeraete (PCs, Drucker)
Trunk-Port:  mehrere VLANs mit 802.1Q-Tag, fuer Switch↔Switch
Hybrid-Port: gemischt, fuer IP-Telefone mit PC dahinter

802.1Q TAG (4 Byte im Frame):
TPID=0x8100 | PCP (QoS 0-7) | DEI | VID (VLAN-ID 0-4094)

NATIVE VLAN:
Ungetaggtes VLAN auf Trunk-Port, Standard=VLAN 1
→ Immer auf VLAN 999 setzen! (Double-Tagging-Schutz)

INTER-VLAN-ROUTING (verschiedene VLANs kommunizieren):
1. Router on a Stick: Trunk + Subinterfaces (guenstig)
2. Layer-3-Switch: interne SVIs (schnell, teurer)

WLAN + VLANs: Eine SSID = ein VLAN, AP per Trunk

VLAN HOPPING:
• Switch Spoofing → DTP deaktivieren
• Double Tagging   → Native VLAN aendern

STP: verhindert Switching-Loops
STP=langsam | RSTP=schnell | MSTP=pro VLAN`,
  },
  {
    id: "pre_005",
    title: "Verschluesselung – Sym., Asym., Hybrid, TLS",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T08:20:00Z",
    starred: true,
    tags: ["AES", "RSA", "TLS", "Hybrid", "Verschluesselung"],
    content: `SYMMETRISCH:
• Gleicher Schluessel fuer Ver- und Entschluesselung
• Schnell, effizient
• Problem: Wie tauscht man Schluessel sicher aus?
• AES (sicher, Standard) | DES/3DES (veraltet)
• Einsatz: VPN-Tunnel, Festplatte, TLS-Daten

ASYMMETRISCH:
• Public Key (jeder darf haben) + Private Key (nur du)
• Public Key verschluesselt → Private Key entschluesselt
• Loest Schluesselaustausch-Problem
• Langsamer als symmetrisch!
• RSA (2048/4096 Bit) | ECC (moderner)
• Einsatz: HTTPS, Signaturen, Zertifikate

HYBRID (was TLS/HTTPS macht):
Schritt 1: Asymmetrisch → Session-Key sicher austauschen
Schritt 2: Symmetrisch (AES) → Daten verschluesseln
→ Sicher UND schnell!

MERKSATZ: Briefkasten-Prinzip
Jeder kann Brief einwerfen (Public Key),
nur du hast Schluessel zum Oeffnen (Private Key)

TLS-HANDSHAKE:
1. Client Hello (TLS-Version, Cipher Suites)
2. Server Hello + Zertifikat (mit Public Key)
3. Browser prueft Zertifikat (CA vertrauenswuerdig?)
4. Session-Key austauschen (Diffie-Hellman)
5. Ab jetzt: AES symmetrisch

PRUEFUNGSTIPP: TLS ist HYBRID!
Asymmetrisch nur fuer Schluessel, dann AES fuer alles.`,
  },
  {
    id: "pre_006",
    title: "Hashwerte & Digitale Signaturen",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T08:25:00Z",
    starred: false,
    tags: ["Hash", "SHA-256", "Signatur", "PKI", "CA"],
    content: `HASHFUNKTIONEN:
• Fingerabdruck fester Laenge aus beliebiger Eingabe
• Einwegfunktion (kein Rueckschluss moeglich)
• Kollisionsresistent
• Deterministisch (gleiche Eingabe → gleicher Hash)

MD5  (128 Bit) → UNSICHER, veraltet
SHA-1 (160 Bit)→ UNSICHER, veraltet
SHA-256 (256 Bit)→ SICHER, aktueller Standard
SHA-512 (512 Bit)→ Sehr sicher

ANWENDUNG:
• Download pruefen: Hash der Datei vergleichen
• Passwoerter: Hash statt Klartext in DB speichern
• Signaturen: Hash wird signiert

DIGITALE SIGNATUR – Ablauf:
1. Sender berechnet Hash der Nachricht
2. Sender verschluesselt Hash mit PRIVATE KEY = Signatur
3. Empfaenger entschluesselt mit PUBLIC KEY = Hash
4. Empfaenger berechnet selbst Hash der Nachricht
5. Beide Hashes gleich? → ECHT & UNVERAENDERT ✓

MERKSATZ: Hash = Fingerabdruck
Signatur = Fingerabdruck mit persoenlichem Stempel

PKI (Public Key Infrastructure):
• CA = Certificate Authority (z.B. Let's Encrypt, DigiCert)
• X.509 = Standard fuer Zertifikate
• Zertifikat: Domain + Public Key + Gueltigkeit + CA-Signatur
• S/MIME = E-Mail-Verschluesselung und Signatur`,
  },
  {
    id: "pre_007",
    title: "IT-Sicherheit – CIA & Angriffe",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T08:30:00Z",
    starred: false,
    tags: ["CIA", "Schutzziele", "Angriffe", "DSGVO", "BSI"],
    content: `CIA-DREIECK – Die 3 Schutzziele:

C – Confidentiality (Vertraulichkeit)
    Nur Berechtigte haben Zugriff
    → Verschluesselung, Zugriffsrechte, VPN

I – Integrity (Integritaet)
    Daten werden nicht unbemerkt veraendert
    → Hashwerte, digitale Signaturen

A – Availability (Verfuegbarkeit)
    Systeme verfuegbar wenn gebraucht
    → RAID, Backups, Redundanz, USV

HAEUFIGE ANGRIFFE:
Phishing        → Gefaelschte E-Mails → Spam-Filter, MFA
Spear-Phishing  → Gezieltes Phishing → Awareness
Social Eng.     → Menschen manipulieren → Training
Brute Force     → Passwoerter probieren → Lockout, MFA
Man-in-the-Middle→Angreifer dazwischen → HTTPS
DDoS            → Server ueberfluten → Firewall, CDN
Ransomware      → Daten verschluesseln → Backups, EDR
SQL-Injection   → SQL einschleusen → Prepared Statements

BSI IT-GRUNDSCHUTZ:
• Schutzbedarf: Normal / Hoch / Sehr hoch
• ISMS = Information Security Management System
• Haertung: unnoetige Dienste deaktivieren

DSGVO (seit Mai 2018):
Datensparsamkeit, Zweckbindung, Transparenz
Meldepflicht: Datenpannen in 72 STUNDEN melden!
Betroffenenrechte: Auskunft, Loeschung, Berichtigung`,
  },
  {
    id: "pre_008",
    title: "Virtualisierung – Hypervisor & Container",
    category: "Virtualisierung",
    author: "Claude",
    createdAt: "2024-01-01T08:35:00Z",
    starred: true,
    tags: ["Hypervisor", "VMware", "Docker", "Container", "VM"],
    content: `VIRTUALISIERUNG:
Mehrere VMs auf einer physischen Hardware.

TYP-1 (Bare Metal): Direkt auf Hardware
→ VMware ESXi, Microsoft Hyper-V, KVM
→ Hohe Performance, fuer Produktion

TYP-2 (Hosted): Als Programm auf Host-OS
→ VirtualBox, VMware Workstation
→ Einfach, fuer Tests/Entwicklung

MERKSATZ:
Typ-1 = Hypervisor IST das Betriebssystem
Typ-2 = Hypervisor ist ein PROGRAMM

WICHTIGE BEGRIFFE:
Snapshot      → Momentaufnahme fuer Rollback
Live Migration→ VM ohne Downtime verschieben (vMotion)
Template      → Vorlage zum Klonen
vSwitch       → Virtueller Switch fuer VMs
HA            → Auto-Neustart bei Host-Ausfall
DRS           → Automatische Lastverteilung

VORTEILE:
• Bessere Auslastung, schnelle Bereitstellung
• Einfache Backups (Snapshot), Isolation

VM vs. CONTAINER (Docker):
VM:        eigenes OS, GB gross, Minuten-Start, stark isoliert
Container: teilt Kernel, MB gross, Sekunden-Start, effizienter

DOCKER-BEFEHLE:
docker ps          → Laufende Container
docker run nginx   → Container starten
docker logs [ID]   → Logs anzeigen
docker exec -it [ID] bash → Shell oeffnen
docker-compose up -d → Stack starten

CLOUD-MODELLE:
IaaS → Hardware mieten (AWS EC2)
PaaS → Plattform mieten (Google App Engine)
SaaS → Software mieten (Office 365)`,
  },
  {
    id: "pre_009",
    title: "RAID & Backup",
    category: "Hardware",
    author: "Claude",
    createdAt: "2024-01-01T08:40:00Z",
    starred: false,
    tags: ["RAID", "Backup", "3-2-1", "USV", "Speicher"],
    content: `RAID-LEVEL:
RAID 0 → Striping, min. 2 Platten, KEINE Redundanz, 100% nutzbar
RAID 1 → Mirror, min. 2 Platten, 1 Platte darf ausfallen, 50% nutzbar
RAID 5 → Paritaet, min. 3 Platten, 1 Platte darf ausfallen, (n-1)/n
RAID 6 → 2x Paritaet, min. 4 Platten, 2 Platten, (n-2)/n
RAID 10→ RAID 1+0, min. 4 Platten, je 1/Spiegel, 50% nutzbar

BEISPIEL RAID 5 (4x2TB): (4-1)x2 = 6 TB nutzbar

WICHTIG: RAID IST KEIN BACKUP!
Schuetzt nur vor Festplattenausfall.
Nicht vor: Loeschen, Ransomware, Brand!

BACKUP-TYPEN:
Voll-Backup:   Alles → langsam, viel Platz, schneller Restore
Differenziell: Seit letztem VOLL → mittel, 2 Baender zum Restore
Inkrementell:  Seit letztem BACKUP → schnell, wenig Platz, LANGSAMER Restore

PRUEFUNGSTIPP: Inkrementell ist beim Restore am LANGSAMSTEN!

3-2-1-REGEL:
3 Kopien | 2 verschiedene Medien | 1 Offsite

RTO = Recovery Time Objective (Wie lange darf System ausfallen?)
RPO = Recovery Point Objective (Wie viel Datenverlust akzeptabel?)

USV (Unterbrechungsfreie Stromversorgung):
Offline/VFD     → Einfach, ~5ms Umschaltzeit
Line-Interactive→ Spannungsregelung, gut
Online/VFI      → Immer ueber Akku, kein Umschalten → RZ!

Formel: Scheinleistung (VA) = Wirkleistung (W) / Leistungsfaktor`,
  },
  {
    id: "pre_010",
    title: "Active Directory, GPO & NTFS",
    category: "Virtualisierung",
    author: "Claude",
    createdAt: "2024-01-01T08:45:00Z",
    starred: false,
    tags: ["AD", "GPO", "NTFS", "Kerberos", "LDAP"],
    content: `ACTIVE DIRECTORY:
Verzeichnisdienst von Microsoft.
Zentrale Verwaltung: Benutzer, Computer, Gruppen, Richtlinien.

BEGRIFFE:
Domain  → Logische Einheit (ebm-papst.local)
DC      → Domain Controller (hostet AD, prueft Anmeldungen)
OU      → Organizational Unit (Ordnerstruktur im AD)
GPO     → Group Policy Object (Regeln fuer Benutzer/Computer)
Kerberos→ Authentifizierungsprotokoll
LDAP    → Protokoll zum Abfragen des Verzeichnisses (Port 389/636)

GPO KANN:
• Passwortrichtlinien (min. 12 Zeichen, 90 Tage Ablauf)
• Desktop-Hintergrund, Laufwerke verbinden
• Software installieren, USB sperren
• Firewall-Regeln verteilen

NTFS-BERECHTIGUNGEN:
Lesen | Schreiben | Ausfuehren | Aendern | Vollzugriff

GOLDENE REGEL:
NTFS + Freigabe-Recht → immer das RESTRIKTIVERE gilt!
Freigabe=Vollzugriff + NTFS=Lesen → Ergebnis: NUR LESEN

LEAST PRIVILEGE: Nur noetige Rechte vergeben!

LDAP-STRUKTUR (DN):
CN=Max Mustermann,OU=IT,DC=firma,DC=local
• CN = Common Name | OU = Organisationseinheit | DC = Domain

LDAP-PORTS:
389 = unverschluesselt (nicht empfohlen)
636 = LDAPS mit TLS (empfohlen!)`,
  },
  {
    id: "pre_011",
    title: "Routing – Statisch, RIP, OSPF, BGP",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T08:50:00Z",
    starred: false,
    tags: ["Routing", "OSPF", "BGP", "RIP", "Dijkstra", "NAT"],
    content: `STATISCHES ROUTING:
• Manuell, kein Overhead, kein Auto-Failover
• Fuer kleine stabile Netze

RIP (Routing Information Protocol):
• Distance Vector (Bellman-Ford)
• Metrik: Hop-Count (max. 15! 16 = unerreichbar)
• Alle 30s komplette Tabelle an Nachbarn senden
• Langsame Konvergenz (Minuten)
• MERKSATZ: "Teile deinem Nachbarn mit wie du die Welt siehst"
• Nur fuer kleine Netze geeignet!

OSPF (Open Shortest Path First):
• Link State (Dijkstra-Algorithmus)
• Metrik: Cost (basiert auf Bandbreite)
• Jeder Router kennt KOMPLETTE Topologie
• Ablauf: Hello → LSA fluten → LSDB → Dijkstra
• Schnelle Konvergenz (Sekunden)
• Fuer Unternehmensnetze geeignet

BGP (Border Gateway Protocol):
• Verbindet autonome Systeme (AS) im Internet
• DAS Routing-Protokoll des Internets
• Telekom ↔ Vodafone, Unternehmen ↔ ISP
• Sehr langsam, sehr skalierbar

DEFAULT ROUTE: 0.0.0.0/0 → wenn keine Route passt → Internet

NAT (Network Address Translation):
• Private IPs auf eine oeffentliche IP (PAT/Masquerading)
• Private Bereiche: 10.x | 172.16-31.x | 192.168.x
• CGNAT: ISP macht NAT → kein Port-Forwarding moeglich!

DHCP-RELAY:
DHCP-Discovery = Broadcast, Router leiten nicht weiter
→ DHCP-Relay leitet als Unicast an zentralen Server`,
  },
  {
    id: "pre_012",
    title: "Firewall, DMZ, Proxy & VPN",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T08:55:00Z",
    starred: false,
    tags: ["Firewall", "DMZ", "Proxy", "VPN", "IPSec"],
    content: `FIREWALL-TYPEN:
Paketfilter (Stateless)→ IP/Port pruefen, kein Status
Stateful Inspection    → Verbindungsstatus verfolgen (empfohlen!)
Application Firewall   → Inhalt auf L7 pruefen
NGFW                   → Alles + IPS, DPI, URL-Filter
WAF                    → Nur HTTP/HTTPS fuer Webserver

DMZ (Demilitarisierte Zone):
Internet → [FW1] → DMZ (Webserver, Mail) → [FW2] → Internes Netz
→ Gehackter Webserver = nur DMZ kompromittiert

PROXY SERVER:
• Caching, Filterung, Protokollierung, Virenscan
• SSL-Inspection: Proxy entschluesselt HTTPS, prueft, verschluesselt neu
  → Benutzer muessen informiert werden! (DSGVO/Betriebsvereinbarung)

REVERSE PROXY:
• Sitzt VOR Servern (nicht vor Clients)
• Load Balancing: Round Robin | Least Connections | IP Hash
• Beispiele: nginx, HAProxy

VPN-PROTOKOLLE:
IPSec     → Standard, sehr sicher, Unternehmen
WireGuard → Modern, schnellstes Protokoll, empfohlen!
OpenVPN   → Open Source, sehr flexibel
PPTP      → VERALTET, unsicher - nicht nutzen!

IPSec-MODI:
Tunnel-Modus    → ganzes Paket verschluesselt (VPN)
Transport-Modus → nur Nutzlast (End-to-End)
AH → nur Integritaet | ESP → Verschluesselung + Integritaet

FirmenVPN vs. Kommerziell:
FirmenVPN: Zugriff aufs Firmennetz (Homeoffice)
Kommerziell: Anonymisierung → Anbieter sieht Traffic!`,
  },
  {
    id: "pre_013",
    title: "WLAN-Sicherheit – WPA2/3 & RADIUS",
    category: "IT-Sicherheit",
    author: "Claude",
    createdAt: "2024-01-01T09:00:00Z",
    starred: false,
    tags: ["WLAN", "WPA2", "WPA3", "RADIUS", "802.1X"],
    content: `WLAN-STANDARDS:
WEP        → RC4, SEHR SCHWACH, nicht nutzen!
WPA        → TKIP, veraltet
WPA2 Personal  → AES + PSK (Passwort), gut fuer Heimnetz
WPA2 Enterprise→ AES + 802.1X/RADIUS, sehr gut, Unternehmen
WPA3 Personal  → SAE (kein PSK!), sehr hoch
WPA3 Enterprise→ AES-256 + RADIUS, sehr hoch

WPA2 ENTERPRISE MIT RADIUS:
Jeder Nutzer meldet sich mit eigenem Account an!

KOMPONENTEN:
Supplicant     → Das WLAN-Geraet
Authenticator  → Der Access Point
Auth-Server    → RADIUS (Windows NPS, FreeRADIUS)

ABLAUF 802.1X:
1. Geraet verbindet mit AP
2. AP sendet EAP-Request
3. Geraet schickt Credentials
4. AP leitet an RADIUS weiter
5. RADIUS prueft gegen AD/LDAP
6. Access-Accept oder Reject
7. AP oeffnet oder sperrt Port

VORTEILE ENTERPRISE:
• Jeder Nutzer hat eigene Credentials
• Nutzer sperren: nur Account deaktivieren
• Vollstaendige Protokollierung (wer, wann)
• VLAN-Zuweisung per RADIUS moeglich

SNMP (Netzwerkmonitoring):
v1/v2 = Community String im Klartext (unsicher!)
v3    = Verschluesselung + Authentifizierung (empfohlen!)
TRAP  = Agent meldet Ereignis proaktiv an Manager
GET   = Manager fragt Wert ab`,
  },
  {
    id: "pre_014",
    title: "IPv6 & Migration",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T09:05:00Z",
    starred: false,
    tags: ["IPv6", "Dual-Stack", "CGNAT", "NDP", "Migration"],
    content: `IPv4 vs. IPv6:
IPv4: 32 Bit, ~4,3 Mrd. Adressen, ERSCHOEPFT
IPv6: 128 Bit, 340 Sextillionen Adressen

IPv6-ADRESSE KUERZEN:
2001:0db8:0000:0000:0000:0000:0000:0001
Schritt 1: Fuehrende Nullen: 2001:db8:0:0:0:0:0:1
Schritt 2: Null-Bloecke (nur EINMAL!): 2001:db8::1

IPv6-ADRESSTYPEN:
Unicast      → ein Empfaenger
Multicast    → Gruppe (ersetzt Broadcast!)
Link-Local   → fe80::/10, nur lokal, automatisch
Global Unicast→ 2000::/3, oeffentlich
Loopback     → ::1 (wie 127.0.0.1)

UNTERSCHIEDE:
• Kein Broadcast → Multicast
• Kein ARP → NDP (Neighbor Discovery Protocol)
• NAT oft unnoetig (genug Adressen)
• SLAAC: Geraet konfiguriert sich selbst!
• IPSec integriert

DUAL-STACK:
IPv4 + IPv6 gleichzeitig auf einem Geraet.
Haeufigste Migrationsstrategie.
ACHTUNG: Sicherheitsregeln fuer BEIDE Protokolle!

CGNAT (Carrier-Grade NAT):
• ISP macht NAT fuer viele Kunden
• Bereich: 100.64.0.0/10
• Problem: Kein Port-Forwarding, kein eigener Server!
• Loesung: IPv6 nutzen

NDP ersetzt ARP in IPv6:
Neighbor Solicitation  = ARP-Request
Neighbor Advertisement = ARP-Reply`,
  },
  {
    id: "pre_015",
    title: "IoT & MQTT-Stack",
    category: "Netzwerke",
    author: "Claude",
    createdAt: "2024-01-01T09:10:00Z",
    starred: false,
    tags: ["IoT", "MQTT", "Mosquitto", "Node-RED", "InfluxDB", "Grafana"],
    content: `IoT = Internet of Things
Geraete senden/empfangen Daten ohne menschliches Eingreifen.

Sensor = misst Daten (Temperatur, Bewegung)
Aktor  = fuehrt Aktion aus (Motor, Ventil)

4-SCHICHTEN:
4 Anwendung:    Dashboard, App (Grafana)
3 Verarbeitung: Cloud, Server (InfluxDB, Node-RED)
2 Netzwerk:     WLAN, LoRaWAN, Zigbee, LTE
1 Wahrnehmung:  Sensoren und Aktoren

PROTOKOLLE:
WLAN      → 50m, hoch, Heimgeraete
Zigbee    → 100m, sehr niedrig, smarte Lampen
LoRaWAN   → 15km!, extrem niedrig, Landwirtschaft
NB-IoT    → gross, niedrig, Smart Meter

MQTT (wichtigstes IoT-Protokoll!):
Publisher → sendet Daten an Topic
Broker    → vermittelt (Mosquitto, Port 1883/8883 TLS)
Subscriber→ abonniert Topics
QoS 0 = Fire & Forget | QoS 1 = mind. einmal | QoS 2 = genau einmal

IoT-STACK:
Sensor → MQTT → Mosquitto → Node-RED → InfluxDB → Grafana

Node-RED: visuelles Flow-Tool, verbindet MQTT↔DB↔HTTP
InfluxDB: Zeitreihendatenbank (Port 8086)
Grafana:  Dashboard-Visualisierung (Port 3000)

IoT-SICHERHEIT:
• Standard-Passwort sofort aendern!
• IoT in eigenes VLAN isolieren
• TLS fuer alle Kommunikation
• Mirai-Botnetz: Millionen Geraete durch Standard-PW gehackt!

EDGE vs. CLOUD:
Edge  → direkt vor Ort, niedrige Latenz, Echtzeit
Cloud → Rechenzentrum, Langzeitanalysen`,
  },
  {
    id: "pre_016",
    title: "PowerShell & Bash",
    category: "Scripting",
    author: "Claude",
    createdAt: "2024-01-01T09:15:00Z",
    starred: false,
    tags: ["PowerShell", "Bash", "Linux", "chmod", "Automatisierung"],
    content: `POWERSHELL (Windows) – Schema: Verb-Noun

WICHTIGE CMDLETS:
Get-ADUser -Filter *          → Alle AD-Benutzer
New-ADUser -Name 'Max'        → Benutzer erstellen
Get-Service | Where {$_.Status -eq 'Running'} → Laufende Dienste
Set-ExecutionPolicy RemoteSigned → Ausfuehrungsrichtlinie
Get-EventLog -LogName Security -Newest 50
Restart-Computer -Force
Test-Connection -ComputerName 8.8.8.8

PIPELINE:
Get-Process | Where {$_.CPU -gt 50} | Sort-Object CPU

SKRIPT-GRUNDSTRUKTUR:
$var = "Wert"
if ($CPU -gt 80) { Write-Host "Hoch!" } else { Write-Host "OK" }
foreach ($PC in $Computer) { Test-Connection $PC }
try { ... } catch { Write-Host "Fehler!" }

BASH (Linux) – WICHTIGE BEFEHLE:
ls -la          → Dateien anzeigen
chmod 755 datei → Berechtigungen setzen
chown user:grp  → Eigentuemer aendern
grep 'error' /var/log/syslog
systemctl start/stop/status nginx
crontab -e      → Geplante Aufgaben
ssh user@server | scp datei user@server:/pfad
tail -f /var/log/syslog → Live-Log

LINUX-BERECHTIGUNGEN (r=4, w=2, x=1):
777 → rwxrwxrwx (GEFAEHRLICH!)
755 → rwxr-xr-x (ausfuehrbare Dateien)
644 → rw-r--r-- (normale Dateien)
600 → rw------- (SSH-Keys, privat)

CRONTAB: Min Std Tag Mon Wochentag Befehl
0 2 * * * /backup.sh → Taeglich 02:00`,
  },
  {
    id: "pre_017",
    title: "SQL – Abfragen, JOINs & Normalisierung",
    category: "Datenbanken",
    author: "Claude",
    createdAt: "2024-01-01T09:20:00Z",
    starred: false,
    tags: ["SQL", "JOIN", "SELECT", "Normalisierung", "CREATE"],
    content: `SQL = Structured Query Language

DDL (Struktur):
CREATE TABLE Mitarbeiter (
  ID INT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  Gehalt DECIMAL(10,2)
);
ALTER TABLE Mitarbeiter ADD COLUMN Email VARCHAR(100);
DROP TABLE Mitarbeiter;

DML (Daten):
INSERT INTO Mitarbeiter VALUES (1, 'Max', 50000);
UPDATE Mitarbeiter SET Gehalt=55000 WHERE ID=1;
DELETE FROM Mitarbeiter WHERE ID=1;

DQL (Abfragen):
SELECT Name, Abteilung
FROM Mitarbeiter
WHERE Gehalt > 40000
ORDER BY Name ASC;

AGGREGAT:
SELECT Abteilung, COUNT(*) AS Anzahl, AVG(Gehalt)
FROM Mitarbeiter
GROUP BY Abteilung
HAVING COUNT(*) > 2;

JOINs:
INNER JOIN → Nur in BEIDEN Tabellen vorhandene Datensaetze
LEFT JOIN  → Alle linke + matching rechte (NULL wenn kein Match)
RIGHT JOIN → Alle rechte + matching linke

SELECT m.Name, a.Name
FROM Mitarbeiter m
INNER JOIN Abteilungen a ON m.AbtID = a.ID;

NORMALISIERUNG:
1NF → Atomare Werte, keine Wiederholungsgruppen
2NF → 1NF + volle Abhaengigkeit vom Schluessel
3NF → 2NF + keine transitiven Abhaengigkeiten

MERKSATZ:
1NF = Eine Info pro Zelle
2NF = Abhaengig vom GANZEN Schluessel
3NF = Abhaengig NUR vom Schluessel`,
  },
  {
    id: "pre_018",
    title: "WiSo – Recht, Soziales & Wirtschaft",
    category: "WiSo",
    author: "Claude",
    createdAt: "2024-01-01T09:25:00Z",
    starred: false,
    tags: ["WiSo", "Arbeitsrecht", "Sozialversicherung", "GmbH", "Lizenz"],
    content: `AUSBILDUNG & ARBEITSRECHT:
Berufsausbildungsvertrag: schriftlich, Dauer, Verguetung, Urlaub
Probezeit: min. 1 Monat, max. 4 Monate (kein Grund noetig!)
Kuendigung nach Probezeit:
  Arbeitnehmer → 4 Wochen
  Arbeitgeber  → nur aus wichtigem Grund
Jugendarbeitsschutz: bis 18 J.: max. 8h/Tag, 40h/Woche

SOZIALVERSICHERUNG (5 Saeulnen):
KV = Krankenversicherung      → je 1/2 AG + AN
RV = Rentenversicherung       → je 1/2 AG + AN
AV = Arbeitslosenversicherung → je 1/2 AG + AN
PV = Pflegeversicherung       → je 1/2 AG + AN
UV = Unfallversicherung       → NUR Arbeitgeber!

MERKSATZ: 4 teilen sich, Unfall zahlt allein der AG!

UNTERNEHMENSFORMEN:
Einzelunternehmen → kein Mindestkapital, unbeschraenkte Haftung
GbR              → min. 2 Personen, gesamtschuldnerisch
GmbH             → 25.000 EUR, Haftung nur Gesellschaftsvermoegen
UG               → ab 1 EUR, 25% Gewinn in Ruecklage
AG               → 50.000 EUR, Aktionaere, Vorstand

KAUFMAENNISCHES:
Netto = ohne MwSt. | Brutto = inkl. MwSt. (19% / 7%)
Skonto = Nachlass bei fruehzeitiger Zahlung
Rabatt = Preisnachlass vom Listenpreis
TCO = Total Cost of Ownership | ROI = Rendite

LIZENZEN:
GPL    → Copyleft! Ableitungen muessen auch GPL sein (Linux)
MIT    → Sehr permissiv, nur Namensnennung (React)
Apache → Wie MIT + Patentklausel
EULA   → Endnutzer-Lizenzvertrag

DSGVO-GRUNDSAETZE:
Rechtmaessigkeit, Datensparsamkeit, Zweckbindung,
Richtigkeit, Speicherbegrenzung, Integritaet
Meldepflicht: 72 STUNDEN bei Datenpannen!`,
  },
  {
    id: "pre_019",
    title: "BPMN & Projektmanagement",
    category: "WiSo",
    author: "Claude",
    createdAt: "2024-01-01T09:30:00Z",
    starred: false,
    tags: ["BPMN", "Scrum", "Projektmanagement", "Agile", "Wirtschaftlichkeit"],
    content: `BPMN (Business Process Model and Notation):
NEU im Pruefungskatalog 2025!

SYMBOLE:
Start-Event    → duenner Kreis
End-Event      → dicker/ausgefuellter Kreis
Task           → abgerundetes Rechteck (Aufgabe)
Gateway (XOR)  → Raute mit X (Entweder-Oder)
Gateway (AND)  → Raute mit + (Parallel)
Pool           → grosse Box (Organisation)
Lane           → Bereich im Pool (Abteilung/Person)
Sequenzfluss   → Pfeil (Reihenfolge)

MERKSATZ: BPMN = Comic-Strip fuer Geschaeftsprozesse

KLASSISCHES PROJEKTMANAGEMENT:
1. Initiierung: Auftrag, Ziele, Scope
2. Planung:     Zeitplan (Gantt/Netzplan), Ressourcen, Kosten
3. Durchfuehrung: Umsetzung
4. Kontrolle:   Fortschritt pruefen, Abweichungen
5. Abschluss:   Abnahme, Dokumentation

SMART-Ziele: Spezifisch, Messbar, Akzeptiert, Realistisch, Terminiert
Lastenheft = Was der Kunde will (WAS)
Pflichtenheft = Was umgesetzt wird (WIE)

SCRUM:
Sprint:          1-4 Wochen, klares Ziel
Product Backlog: priorisierte Anforderungsliste
Daily Standup:   max. 15 Minuten
Sprint Review:   Ergebnis praesentieren
Retrospektive:   Was lief gut/schlecht?

WIRTSCHAFTLICHKEIT:
TCO = Anschaffung + Betrieb ueber Nutzungsdauer
ROI = (Gewinn / Kapital) x 100
Amortisation = Investition / jaehrliche Einsparung
Make-or-Buy: Eigenentwicklung vs. Kauf vergleichen`,
  },
];

// ── Konstanten ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Netzwerke","IT-Sicherheit","Virtualisierung",
  "Scripting","Datenbanken","Hardware","WiSo","Sonstiges"
];
const CAT_COLORS = {
  "Netzwerke":       { bg:"#0a1f3d", badge:"#3b82f6" },
  "IT-Sicherheit":   { bg:"#1a0a2e", badge:"#a855f7" },
  "Virtualisierung": { bg:"#0a2e1a", badge:"#22c55e" },
  "Scripting":       { bg:"#2a2000", badge:"#eab308" },
  "Datenbanken":     { bg:"#0a1828", badge:"#38bdf8" },
  "Hardware":        { bg:"#2e0f0f", badge:"#ef4444" },
  "WiSo":            { bg:"#1e0a1e", badge:"#ec4899" },
  "Sonstiges":       { bg:"#111",    badge:"#888"    },
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
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({
      id: Date.now().toString(),
      title: title.trim(), category,
      content: content.trim(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      author: author.trim() || "Anonym",
      createdAt: new Date().toISOString(),
      starred: false,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const inp = { width:"100%", background:"#0f0f0f", border:"1px solid #222", borderRadius:"8px", padding:"0.7rem 1rem", color:"#ddd", fontSize:"0.88rem", outline:"none", boxSizing:"border-box", fontFamily:"inherit" };
  const lbl = { fontSize:"0.62rem", letterSpacing:"0.18em", color:"#555", display:"block", marginBottom:"0.4rem", fontWeight:"600" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(10px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#0a0a0a", border:"1px solid #1e1e1e", borderRadius:"16px", width:"100%", maxWidth:"680px", maxHeight:"92vh", overflow:"auto" }}>
        <div style={{ padding:"1.25rem 1.75rem", borderBottom:"1px solid #141414", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#0a0a0a", zIndex:10 }}>
          <div style={{ fontSize:"1.1rem", fontWeight:"bold", fontFamily:"'Courier New',monospace" }}>Neue Zusammenfassung</div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #1e1e1e", borderRadius:"7px", padding:"0.4rem", cursor:"pointer", color:"#555" }}><Icon name="close" size={17}/></button>
        </div>
        <div style={{ padding:"1.5rem 1.75rem", display:"flex", flexDirection:"column", gap:"1.1rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 140px", gap:"1rem" }}>
            <div><label style={lbl}>TITEL *</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="z.B. OSI-Modell" style={inp}/></div>
            <div><label style={lbl}>NAME</label><input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Fabio" style={inp}/></div>
          </div>
          <div>
            <label style={lbl}>KATEGORIE</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
              {CATEGORIES.map(cat => { const active=category===cat; const col=CAT_COLORS[cat]; return (
                <button key={cat} onClick={()=>setCategory(cat)} style={{ padding:"0.35rem 0.8rem", borderRadius:"20px", fontSize:"0.78rem", border:active?`1px solid ${col.badge}`:"1px solid #1e1e1e", background:active?`${col.badge}18`:"transparent", color:active?col.badge:"#555", cursor:"pointer", fontFamily:"inherit" }}>{cat}</button>
              );})}
            </div>
          </div>
          <div><label style={lbl}>INHALT *</label><textarea value={content} onChange={e=>setContent(e.target.value)} placeholder={"Zusammenfassung hier eingeben...\n\nTipp: Direkt aus dem Chat kopieren!"} rows={10} style={{ ...inp, fontFamily:"'Courier New',monospace", lineHeight:"1.7", resize:"vertical", color:"#bbb" }}/></div>
          <div><label style={lbl}>TAGS (kommagetrennt)</label><input value={tags} onChange={e=>setTags(e.target.value)} placeholder="VLAN, Switching..." style={inp}/></div>
          <button onClick={handleSave} disabled={!title.trim()||!content.trim()} style={{ padding:"0.85rem", borderRadius:"10px", background:saved?"#0a1a0a":(title.trim()&&content.trim()?"#fff":"#141414"), border:saved?"1px solid #22c55e":"none", color:saved?"#22c55e":(title.trim()&&content.trim()?"#000":"#333"), fontSize:"0.85rem", fontWeight:"bold", cursor:"pointer", letterSpacing:"0.06em", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" }}>
            {saved?<><Icon name="check" size={15}/>GESPEICHERT!</>:<><Icon name="upload" size={15}/>SPEICHERN</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ summary, onClose, onDelete, onStar }) {
  const [copied, setCopied] = useState(false);
  const col = CAT_COLORS[summary.category] || CAT_COLORS["Sonstiges"];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.93)", backdropFilter:"blur(12px)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ background:"#080808", border:`1px solid ${col.badge}30`, borderRadius:"16px", width:"100%", maxWidth:"780px", maxHeight:"93vh", overflow:"auto" }}>
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

// ── Hauptapp ──────────────────────────────────────────────────────────────────
export default function App() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Alle");
  const [filterStarred, setFilterStarred] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const data = loadData();
    setSummaries(data);
    setLoading(false);
  }, []);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };
  const handleSave = (entry) => { const u=[entry,...summaries]; setSummaries(u); saveData(u); showToast("Gespeichert!"); };
  const handleDelete = (id) => { const u=summaries.filter(s=>s.id!==id); setSummaries(u); saveData(u); showToast("Geloescht.","err"); };
  const handleStar = (id) => { const u=summaries.map(s=>s.id===id?{...s,starred:!s.starred}:s); setSummaries(u); saveData(u); };

  const filtered = summaries.filter(s => {
    const q = search.toLowerCase();
    return (!q||[s.title,s.content,...s.tags,s.author].some(x=>x?.toLowerCase().includes(q)))
      && (filterCat==="Alle"||s.category===filterCat)
      && (!filterStarred||s.starred);
  });

  const counts = CATEGORIES.reduce((a,c) => { a[c]=summaries.filter(s=>s.category===c).length; return a; }, {});

  return (
    <div style={{ minHeight:"100vh", background:"#070707", color:"#fff", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0c0c0c}
        ::-webkit-scrollbar-thumb{background:#252525;border-radius:3px}
        .card{transition:transform .18s,box-shadow .18s;cursor:pointer}
        .card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.5)}
        .sbtn{transition:all .15s}
        .sbtn:hover{color:#ccc!important;background:#111!important}
      `}</style>

      {toast&&<div style={{ position:"fixed", top:"1.25rem", right:"1.25rem", zIndex:200, background:toast.type==="err"?"#120808":"#081408", border:`1px solid ${toast.type==="err"?"#7b2d2d":"#2d7b4a"}`, borderRadius:"10px", padding:"0.65rem 1.1rem", color:toast.type==="err"?"#e57373":"#66bb6a", fontSize:"0.8rem", animation:"slideDown .25s ease", display:"flex", alignItems:"center", gap:"0.5rem" }}><Icon name={toast.type==="err"?"trash":"check"} size={12}/>{toast.msg}</div>}

      {/* Header */}
      <div style={{ borderBottom:"1px solid #111", background:"#090909", padding:"1rem 1.75rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.9rem" }}>
          <div style={{ width:"36px", height:"36px", background:"#fff", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="book" size={19}/></div>
          <div>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"1.05rem", fontWeight:"bold" }}>FISI Lernportal</div>
            <div style={{ fontSize:"0.6rem", color:"#444", letterSpacing:"0.12em" }}>IHK HEILBRONN · {summaries.length} EINTRAEGE · PRUEFUNG MAI 2026</div>
          </div>
        </div>
        <button onClick={()=>setShowUpload(true)} style={{ display:"flex", alignItems:"center", gap:"0.45rem", background:"#fff", color:"#000", border:"none", borderRadius:"8px", padding:"0.55rem 1.1rem", fontSize:"0.82rem", fontWeight:"bold", cursor:"pointer", fontFamily:"inherit" }}>
          <Icon name="plus" size={14}/> HINZUFUEGEN
        </button>
      </div>

      <div style={{ display:"flex", minHeight:"calc(100vh - 64px)" }}>
        {/* Sidebar */}
        <div style={{ width:"200px", flexShrink:0, borderRight:"1px solid #0f0f0f", padding:"1.1rem 0.65rem", display:"flex", flexDirection:"column", gap:"2px" }}>
          <div style={{ fontSize:"0.58rem", color:"#3a3a3a", letterSpacing:"0.18em", marginBottom:"0.45rem", padding:"0 0.5rem" }}>KATEGORIEN</div>
          {["Alle",...CATEGORIES].map(cat=>{
            const count = cat==="Alle"?summaries.length:(counts[cat]||0);
            const active = filterCat===cat;
            const col = CAT_COLORS[cat];
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
            {[["Gesamt",summaries.length],["Favoriten",summaries.filter(s=>s.starred).length]].map(([l,v])=>(
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
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Suchen nach Titel, Inhalt, Tags..." style={{ width:"100%", background:"#0d0d0d", border:"1px solid #181818", borderRadius:"9px", padding:"0.7rem 1rem 0.7rem 2.4rem", color:"#bbb", fontSize:"0.86rem", outline:"none", fontFamily:"inherit" }}/>
            {search&&<button onClick={()=>setSearch("")} style={{ position:"absolute", right:"0.7rem", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#444", cursor:"pointer" }}><Icon name="close" size={12}/></button>}
          </div>

          {loading&&<div style={{ textAlign:"center", padding:"5rem", color:"#2a2a2a", fontSize:"0.75rem", letterSpacing:"0.2em", animation:"pulse 1.5s infinite" }}>WIRD GELADEN...</div>}

          {!loading&&filtered.length===0&&(
            <div style={{ textAlign:"center", padding:"5rem 2rem" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>📚</div>
              <div style={{ fontSize:"0.95rem", color:"#3a3a3a" }}>{search||filterCat!=="Alle"||filterStarred?"Keine Treffer":"Noch keine Eintraege"}</div>
            </div>
          )}

          {!loading&&filtered.length>0&&(
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))", gap:"0.9rem" }}>
              {filtered.map(s=>{
                const col = CAT_COLORS[s.category]||CAT_COLORS["Sonstiges"];
                const preview = s.content.slice(0,145)+(s.content.length>145?"…":"");
                return (
                  <div key={s.id} className="card" onClick={()=>setSelected(s)} style={{ background:`linear-gradient(150deg,${col.bg}cc,#0a0a0a)`, border:`1px solid ${col.badge}18`, borderRadius:"12px", padding:"1.1rem", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,${col.badge},transparent 70%)` }}/>
                    {s.starred&&<div style={{ position:"absolute", top:"0.7rem", right:"0.7rem", color:"#f5c518" }}><Icon name="star" size={12}/></div>}
                    <span style={{ fontSize:"0.56rem", letterSpacing:"0.18em", color:col.badge, background:`${col.badge}10`, padding:"0.16rem 0.45rem", borderRadius:"4px", border:`1px solid ${col.badge}22`, fontWeight:"bold" }}>{s.category.toUpperCase()}</span>
                    <div style={{ fontFamily:"'Courier New',monospace", fontSize:"0.9rem", fontWeight:"bold", color:"#e0e0e0", margin:"0.5rem 0 0.4rem", lineHeight:1.35 }}>{s.title}</div>
                    <div style={{ fontSize:"0.74rem", color:"#4a4a4a", lineHeight:"1.6", fontFamily:"'Courier New',monospace" }}>{preview}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"0.85rem", paddingTop:"0.65rem", borderTop:`1px solid ${col.badge}10` }}>
                      <div style={{ display:"flex", gap:"0.28rem", flexWrap:"wrap" }}>
                        {s.tags.slice(0,3).map(t=><span key={t} style={{ fontSize:"0.6rem", color:"#444", background:"#0a0a0a", padding:"0.1rem 0.35rem", borderRadius:"3px", border:"1px solid #141414" }}>#{t}</span>)}
                      </div>
                      <span style={{ fontSize:"0.6rem", color:"#2a2a2a", whiteSpace:"nowrap" }}>{s.author}</span>
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
