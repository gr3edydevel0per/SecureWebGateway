# Secure Web Gateway  

## 📌 Overview
This project implements a **Secure Web Gateway (SWG)** which is a subpart of **Secure Access Service Edge (SASE) framework**, to provide **secure, compliant, and controlled web access**. 
The SWG acts as an intermediary between users and web resources, performing **real-time traffic inspection, malware detection, URL filtering, and policy enforcement**.

## 🔍 Features
- ✅ **URL Filtering**: Blocks access to malicious or non-compliant websites.
- 🔄 **Rule-Based Management**: Enforces policies for secure browsing.
- 🌐 **Domain-Based Filtering**: Restricts access to certain domains based on organizational rules.
- 🔍 **Threat Detection**: Uses **ClamAV** for scanning downloaded content.
- 📊 **Logging & Reporting**: Tracks user activity and security incidents.

## 🛠️ Technologies Used
- **Programming Languages**: Golang, JavaScript
- **Databases**: MariaDB
- **Security Tools**: ClamAV, IPQS API (for domain/IP reputation checks)
- **Frontend**: EJS (templating), JavaScript
- **Networking**: HTTPS, DNS, TLS, TCP/IP

## ⚙️ System Architecture
The Secure Web Gateway (SWG) is designed with a **modular and scalable architecture**, ensuring **efficient traffic filtering, threat detection, 
and policy enforcement**. The key components include:

1. **Web Proxy Layer**: Intercepts and redirects web traffic for inspection.
2. **Threat Detection Engine**: Uses ClamAV for scanning and malware detection.
3. **URL Filtering Module**: Implements rule-based and domain-based filtering.
4. **Logging & Monitoring System**: Captures and stores logs for analysis.
5. **Rule-Based Management**: Allows administrators to define security policies.

## 🏗️ Setup & Installation
### Prerequisites
- **Golang** (≥1.17)
- **MariaDB** (for database management)
- **ClamAV** (for malware detection)
- **Node.js** & **EJS** (for frontend)
- **IPQS API Key** (for real-time domain/IP reputation checks)

### Installation Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/SanyaSinha11/SecureWebGateway_Implementation-SASE-Framework.git
   cd SecureWebGateway_Implementation-SASE-Framework
   ```
   
2. **Set up Database**
   ```bash
   mysql -u root -p < db/setup.sql
   ```
   
3. **Install Dependencies**
   ```bash
   go mod tidy
   npm install
   ```
   
4. **Run Application**
   ```bash
   go run main.go
   ```

5. **Access the Web Interface**
   Open http://localhost:8080 in your browser.

## 📜 Usage Guide
### Rule-Based Filtering
   - Define custom rules to allow or block specific websites based on security policies.
### Threat Detection
   - All downloads are scanned using ClamAV before being accessed.
### Logging & Reporting
   - User activity logs are stored in MariaDB for monitoring and analysis.

## 🚀 Future Enhancements
✅ AI-Driven Threat Detection using machine learning for advanced security.
🌍 Cloud-Based Deployment for scalable security across multiple locations.
🕵️ User Behavior Analytics for anomaly detection and proactive security.

## 🤝 Contributors
  - **Akshat Verma**
  - **Kanav**
  - **Keshav Garg**
  - **Sanya Sinha**
  - **Dr. Keshav Sinha (Guide)**


© 2024 SecureWebGateway_Implementation-SASE-Framework. All rights reserved.
