# ⚡ HackMatch

**Find your perfect hackathon team in a swipe.**

HackMatch is a high-performance matchmaking platform designed specifically for developers. It eliminates the friction of finding teammates by bringing the intuitive "swipe-to-match" experience to the hackathon world.

---

## ✨ Key Features

### 🎴 **Intuitive Swipe Deck**
Browse through potential teammates with a sleek, interactive card deck. Filter by specific hackathons or explore developers globally.

### 🚀 **Real-Time Matching**
Powered by a robust backend, matches are calculated instantly. When two developers swipe right on each other, a match is created and a dedicated workspace is initialized.

### 🔔 **Smart Notifications**
Stay updated with a near real-time notification system. Get notified the second someone shows interest or when you've successfully matched.

### 💬 **Integrated Team Spaces**
Once matched, teams get immediate access to private chat rooms (DMs or Group Chats) to start brainstorming and building.

---

## 📸 Experience the UI

<div align="center">
  <img src="./brain/0e5ff001-232c-476a-be7a-29aaec042f42/media__1777522298494.png" width="45%" alt="Swipe Deck View" />
  <img src="./brain/0e5ff001-232c-476a-be7a-29aaec042f42/media__1777521675338.png" width="45%" alt="Match Celebration" />
</div>

<div align="center">
  <img src="./brain/0e5ff001-232c-476a-be7a-29aaec042f42/media__1777507489546.png" width="91%" alt="Dashboard Overview" />
</div>

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion & React Spring (for the deck)
- **State Management**: React Hooks & Context API

### **Backend**
- **Runtime**: Node.js / Express
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Better-Auth (Secure Session Management)
- **Real-time**: High-frequency Polling (Scalable Notification Engine)

### **Architecture**
- **Monorepo**: Managed with NPM Workspaces for clean separation of concerns.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SakshiAwasthi19/HackMatch.git
   cd HackMatch
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root and add your database and auth credentials.

4. **Database Migration**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

---

## 🤝 Contributing
HackMatch is built for the community. Feel free to open issues or submit pull requests to help make hackathon team-finding even easier!

---

<div align="center">
  Built with 💜 for the next generation of Hackers.
</div>
