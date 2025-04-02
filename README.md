# RegTrack 📡⏱️  
**Asterisk Peer Registration Tracker**  

RegTrack is a Node.js application that monitors Asterisk peers via AMI (Asterisk Manager Interface), logs registration/unregistration events to a MySQL database, and generates insightful reports on peer availability.

## Key Features  
- 📊 **Tracks SIP/IAX2 peer registrations/unregistrations** in real-time via AMI  
- 💾 **Persists events** to a MySQL database for historical analysis  
- ⏳ **Calculates critical metrics**:  
  - Time between `Register` → `Unregister` events  
  - Duration of `Reachable` status    

---

## 📦 Prerequisites  
1. **Asterisk PBX** with AMI enabled  
2. **MySQL/MariaDB** database  
3. **Node.js** v16+  

---

## 🛠️ Installation  
```bash
git clone https://github.com/yourusername/regtrack.git
cd regtrack
npm install
```
---

## ⚙️ Configuration
Make sure to configure the asterisk manager user and on  /etc/asterisk/manager.conf:
```bash
[general]
enabled = yes
webenabled = no

port = 5038
bindaddr = 0.0.0.0
allowmultiplelogin = yes

[admin]
secret=password
permit=0.0.0.0/0.0.0.0

read = system,call,log,verbose,agent,user,config,dtmf,reporting,cdr,dialplan,event
write = system,call,agent,user,config,command,reporting,originate,message,event

eventfilter = !* ; Primeiro nega todos os eventos
eventfilter = PeerStatus ; Depois permite apenas PeerStatus
```

Reload AMI:
```bash
sudo asterisk -rx "manager reload"
```
Mysql Moonu Database and user examples:
```bash
CREATE DATABASE Moonu;
CREATE USER 'regtrack'@'10.37.129.3' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON Moonu.* TO 'regtrack'@'10.37.129.3';
FLUSH PRIVILEGES;
```

---

## 🚀 Usage
```bash
npm install
npm start
```

---


Copy
## 📂 Project Structure  

```bash
regtrack/
├── lib/ # Core application logic
│ ├── infra/ # Infrastructure components
│ │ ├── config.js # 🛠️ Configuration loader
│ │ └── logger.js # 📝 Logging system
│ ├── models/ # Data models
│ │ └── EventModel.js # 📦 Database schema
│ ├── services/ # Business logic
│ │ ├── AMIService.js # 📡 Asterisk AMI handler
│ │ └── DatabaseService.js # 🗃️ DB operations
│ └── utils/ # Helper functions
│ └── eventHandlers.js # ⚙️ Custom event processors
├── regtrack.js # 🚀 Main application entry
├── README.md # 📖 Documentation
├── .env.example # ⚙️ Environment template
└── .gitignore # 🙈 Ignored files
```

---

## 📊 Sample Report Output

```bash
ami_events:

id    CompanyId    Exten    Status        Time
----  ----------  ------   -----------   ---------------------
1     1           1000     Reachable     2025-04-01 13:26:39.0
2     1           1000     Unreachable   2025-04-01 13:26:39.0
3     1           1000     Reachable     2025-04-01 13:26:40.0
4     323         9992     Reachable     2025-04-01 13:26:45.0
5     323         9992     Unreachable   2025-04-01 13:26:45.0
6     323         9992     Reachable     2025-04-01 13:26:45.0
7     1           1000     Unreachable   2025-04-01 13:44:46.0
8     1           1000     Reachable     2025-04-01 13:44:57.0
9     1           1000     Unreachable   2025-04-01 13:44:57.0
10    1           1000     Reachable     2025-04-01 13:44:58.0
```

```bash
view_peerStatus:
id    CompanyId    Exten    RegisterTime             UnregisterTime           DurationSec    DurationFormatted
----  ----------  ------   ---------------------    ---------------------    ------------   ---------------
3     1           1000     2025-04-01 13:26:40.0    2025-04-01 13:44:46.0    1086           00:18:06
8     1           1000     2025-04-01 13:44:57.0    2025-04-01 13:44:57.0    0              00:00:00
10    1           1000     2025-04-01 13:44:58.0    2025-04-01 15:00:32.0    4534           01:15:34
18    1           1000     2025-04-01 18:31:27.0    2025-04-01 18:46:32.0    905            00:15:05
21    1           1000     2025-04-02 13:18:52.0    2025-04-02 13:21:00.0    128            00:02:08
26    1           1000     2025-04-02 13:21:04.0    2025-04-02 13:21:04.0    0              00:00:00
6     323         9992     2025-04-01 13:26:45.0    2025-04-01 13:26:45.0    0              00:00:00
4     323         9992     2025-04-01 13:26:45.0    2025-04-01 14:23:23.0    3398           00:56:38
14    323         9992     2025-04-01 14:23:47.0    2025-04-01 14:23:47.0    0              00:00:00
12    323         9992     2025-04-01 14:23:47.0    2025-04-01 15:00:32.0    2205           00:36:45
17    323         9992     2025-04-01 18:31:27.0    2025-04-01 18:46:37.0    910            00:15:10
```