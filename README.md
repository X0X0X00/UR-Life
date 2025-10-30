# UR Life

<div align="center">
  <img src="./Code/image/symbol_only.svg" width="120" alt="University of Rochester Logo">

  ### University of Rochester Campus Life Assistant

  A comprehensive web application designed to help UR students manage their academic life, track degree progress, organize courses, and stay connected with the campus community.

  [![University of Rochester](https://img.shields.io/badge/University-of%20Rochester-003B71)](https://rochester.edu)
  [![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org)
  [![License](https://img.shields.io/badge/License-Academic-green.svg)]()

  **🌐 Live Demo:** [https://hegemonic-ontogenetically-forest.ngrok-free.dev](https://hegemonic-ontogenetically-forest.ngrok-free.dev)
</div>

---

## ✨ Features

### 📝 Task Management
- Create, complete, and organize daily tasks
- Task history tracking with restore functionality
- Date-based task organization
- Real-time synchronization across devices

### 📊 Degree Progress Tracker
- Track completion of major requirements
- Visual progress indicators for each category:
  - Pre-major requirements
  - Core courses
  - Math requirements
  - Advanced requirements
  - Upper-level writing courses
- Dynamic calculation of progress percentages
- Persistent state across sessions

### 📅 Course Calendar
- Interactive weekly course schedule
- **5-minute precision** for course times (e.g., 11:05 AM - 12:55 PM)
- Visual course blocks spanning multiple hours
- Add, edit, and delete courses
- Location tracking for each course
- Color-coded schedule visualization

### 📧 Mailing List Manager
- Organized contacts by category:
  - Professors
  - Teaching Assistants
  - Classmates
  - Friends
  - Clubs
  - Research Groups
- One-click email links
- Quick search and filtering

### 👤 Profile Management
- Customizable avatar (12 emoji options)
- Update name and email
- Secure password changes
- Profile synchronization across devices

### 🔐 User Authentication
- Secure login system
- Session-based authentication
- Multiple demo accounts for testing

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **ngrok** (optional, for public access)

### Installation

1. **Clone the repository**
   ```bash
   cd "/Users/zzh/Pychram/CSC 212/UR Life"
   ```

2. **Navigate to Code directory**
   ```bash
   cd Code
   ```

3. **Start the server**
   ```bash
   python3 server.py
   ```

4. **Access the application**
   - Local: [http://localhost:8000/index.html](http://localhost:8000/index.html)
   - Or use ngrok for public access (see below)

---

## 🌐 Public Access with ngrok

### Setup ngrok

1. **Install ngrok** (if not already installed)
   ```bash
   brew install ngrok
   ```

2. **Start ngrok tunnel**
   ```bash
   ngrok http 8000
   ```

3. **Get your public URL**
   - ngrok will display a forwarding URL like: `https://xxxx-yyyy.ngrok-free.app`
   - Share this URL to access from anywhere!

### Current Public URL
```
https://hegemonic-ontogenetically-forest.ngrok-free.dev
```

---

## 👥 Demo Accounts

| User | Net ID | Password | Major |
|------|--------|----------|-------|
| 🦊 Fox | `fox123` | `rochester2025` | Computer Science B.S. |
| 🐻 Bear | `bear456` | `yellowjacket` | Mathematics Senior |
| 🐱 Cat | `cat789` | `meowmeow123` | Biology Sophomore |

**Tip:** Click on demo account cards on the login page to auto-fill credentials!

---

## 📁 Project Structure

```
UR Life/
├── Code/
│   ├── index.html              # Login page
│   ├── campus-assistant.html   # Main application
│   ├── app.js                  # Application logic
│   ├── api.js                  # API helper functions
│   ├── server.py               # Backend server with REST API
│   ├── database.json           # User data storage
│   ├── users-database.js       # Demo user data
│   └── image/
│       └── symbol_only.svg     # UR official logo
├── Prototype/                  # Design mockups and screenshots
├── image/                      # Original image assets
├── README.md                   # This file
└── USER_GUIDE.md              # Detailed user guide
```

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Structure and markup
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Application logic
- **Local Storage** - Client-side data persistence

### Backend
- **Python 3** - Server runtime
- **HTTP Server** - Built-in SimpleHTTPRequestHandler
- **JSON** - Data storage format

### Deployment
- **ngrok** - Public URL tunneling
- **Multi-device sync** - Cloud-based data synchronization

---

## 💾 Data Synchronization

### How It Works

UR Life uses a **dual-layer persistence system**:

1. **Local Storage** (Browser)
   - Instant save on every change
   - Works offline
   - Backup layer

2. **Cloud Database** (database.json)
   - Server-side persistence
   - Multi-device synchronization
   - Shared across sessions

### Sync Flow

```
User Action (e.g., add task)
    ↓
Save to Local Storage (immediate)
    ↓
POST to /api/user/save
    ↓
Update database.json
    ↓
Available on all devices ✅
```

---

## 🔌 API Endpoints

### Authentication
- `GET /api/login?netId=xxx&password=xxx` - User login

### User Data
- `GET /api/user?netId=xxx` - Fetch user data
- `POST /api/user/save` - Save user data (tasks, courses, profile, etc.)
- `POST /api/user/password` - Change user password

### Example Request
```javascript
// Save user data
fetch('http://localhost:8000/api/user/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    netId: 'fox123',
    data: {
      tasks: [...],
      courses: [...],
      profile: {...}
    }
  })
});
```

---

## 🎨 Key Features Breakdown

### Course Calendar with 5-Minute Precision

The course calendar supports **5-minute time intervals** for precise scheduling:

- Time options: 9:00 AM, 9:05 AM, 9:10 AM, ..., 6:00 PM
- Course duration: Automatically calculated
- Visual rendering: Pixel-perfect positioning based on start/end times
- Example: A course from 11:05 AM to 12:55 PM spans exactly 1 hour 50 minutes

**Technical Implementation:**
```javascript
// Time stored as string: "11:05"
// Parsed to minutes: 11 * 60 + 5 = 665 minutes
// Rendered with precise offset and height
```

### Dynamic Progress Tracking

Progress is **never hardcoded** - it's dynamically calculated:

```javascript
// Check all checkboxes in category
const completed = categoryCheckboxes.filter(cb => cb.checked).length;
const total = categoryCheckboxes.length;

// Display ✓ only when 100% complete
if (completed === total && total > 0) {
  display = '✓';
} else {
  display = `${completed}/${total}`;
}
```

---

## 🔧 Troubleshooting

### Server Won't Start

**Problem:** Port 8000 already in use

**Solution:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Restart server
python3 server.py
```

### Data Not Syncing

**Check:**
1. Confirm using `python3 server.py` (not simple HTTP server)
2. Verify `database.json` exists in Code directory
3. Check browser console for "✅ 数据已同步到云端数据库"
4. Ensure stable network connection

### ngrok Connection Issues

**Solutions:**
```bash
# Check if ngrok is running
ps aux | grep ngrok

# Restart ngrok
pkill ngrok
ngrok http 8000
```

### Browser Cache Issues

**Clear cache:**
- Mac: `Cmd + Shift + R`
- Windows: `Ctrl + Shift + R`
- Or use Incognito/Private mode

---

## 📝 Development Notes

### Version History

- **v8.0** (Current) - 5-minute course time intervals
- **v7.0** - Course calendar with start/end times
- **v6.0** - Editable course calendar
- **v5.0** - Profile editing and password management
- **v4.0** - Database synchronization
- **v3.0** - Degree progress tracker fixes
- **v2.0** - ngrok public access
- **v1.0** - Initial release

### Future Enhancements

- [ ] Mobile responsive design
- [ ] Push notifications for tasks
- [ ] Integration with UR Blackboard
- [ ] Calendar export (iCal format)
- [ ] Group project collaboration features
- [ ] AI-powered course recommendations

---

## 🤝 Contributing

This project is developed as part of CSC 212 coursework at the University of Rochester.

### Development Workflow

1. Make changes in `/Code` directory
2. Test locally: `python3 server.py`
3. Verify changes via ngrok public URL
4. Update version in console log

---

## 📄 License

Academic project for University of Rochester CSC 212.

**© 2025 University of Rochester**

---

## 🙏 Acknowledgments

- University of Rochester for the official branding assets
- CSC 212 course staff for guidance and feedback
- ngrok for public URL tunneling service

---

## 📞 Support

For issues or questions:
- Check [USER_GUIDE.md](./USER_GUIDE.md) for detailed instructions
- Review troubleshooting section above
- Contact: CSC 212 course staff

---

<div align="center">
  <strong>Made with ❤️ for University of Rochester</strong>

  **Meliora** - Ever Better
</div>
