# Axis - Posture Tracking & Analysis Platform

<div align="center">

**Find your balance.**

A modern web application for tracking, analyzing, and visualizing posture data with real-time analytics, community leaderboards, and AI-powered insights.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.x-yellow?style=flat&logo=python)
![AWS](https://img.shields.io/badge/AWS-S3-orange?style=flat&logo=amazon-aws)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Usage Guide](#-usage-guide)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Axis** is a comprehensive posture tracking and analysis platform that combines modern web technologies with data science to help users maintain healthy posture habits. The application features an immersive 3D landing page, real-time data visualization, cloud storage integration, and community engagement through leaderboards.

### Key Capabilities

- **Real-time Posture Monitoring**: Upload and track posture data with detailed analytics
- **Advanced Data Visualization**: Interactive charts showing good/bad posture percentages, trends over time, and cause analysis
- **Cloud Integration**: Seamless AWS S3 storage for scalable data management
- **Python Analytics**: Advanced statistical analysis and chart generation using matplotlib and pandas
- **Community Features**: Competitive leaderboards with daily, weekly, monthly, and all-time rankings
- **Beautiful UI**: Modern glass-morphism design with 3D animations using Three.js

---

## ✨ Features

### 🏠 Landing Page
- **3D Infinite Gallery**: Interactive WebGL-powered image carousel with cloth-like physics
- Smooth scroll animations with auto-play and manual control
- Responsive design with fallback for non-WebGL browsers

### 📊 Dashboard
- **Multi-User Support**: Track and compare posture data across multiple users
- **Real-time Charts**: 
  - Good vs Bad posture percentage over time
  - Individual user analysis
  - Multi-user comparison views
- **Data Metrics**: 
  - Total files uploaded
  - Data points collected
  - Good posture percentage
- **Python-Generated Charts**:
  - Configurable timeframes (7, 14, 30 days)
  - Good/Bad percentage analysis
  - Pitch/Roll cause analysis with color-coded visualizations

### 📁 File Upload
- Drag-and-drop file upload
- AWS S3 cloud storage integration
- Automatic Python processing pipeline
- 10MB file size limit
- Real-time upload progress and status

### 🎯 Data Processing
- Automatic posture classification (good/bad/moderate)
- Pitch and roll angle analysis
- Statistical summaries (mean, std, min, max)
- Bad posture cause identification (pitch, roll, or both)
- Posture score calculation with weighted factors

### 👥 Community
- Global leaderboards
- Multiple time categories (All Time, Weekly, Monthly, Daily)
- Animated transitions with Framer Motion
- User avatars with color coding

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16.0 (App Router)
- **UI Library**: React 19.2
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x with custom glass-morphism
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **Animation**: Framer Motion 12.x
- **Charts**: Chart.js 4.4
- **Icons**: Lucide React

### Backend & APIs
- **Runtime**: Next.js API Routes (Node.js)
- **Cloud Storage**: AWS S3 (SDK v3)
- **Data Processing**: Python 3.x with child process execution
- **File Handling**: FormData, Buffer streams

### Python Processing
- **Data Analysis**: pandas 2.x, numpy 1.24+
- **Visualization**: matplotlib 3.7+
- **Cloud**: boto3 (AWS SDK for Python)
- **Image Processing**: Pillow 10.1

### DevOps & Deployment
- **Hosting**: Vercel
- **Version Control**: Git
- **Package Management**: npm
- **Environment**: Node.js, Python virtual environments

---

## 📁 Project Structure

```
ReactWebApp/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/          # File upload & S3 operations
│   │   │   │   └── route.js
│   │   │   └── python-chart/    # Python chart generation
│   │   │       └── route.js
│   │   ├── components/
│   │   │   ├── header.tsx       # Navigation header
│   │   │   └── InfiniteGallery.tsx  # 3D gallery component
│   │   ├── community/
│   │   │   ├── components/
│   │   │   │   └── Leaderboard.tsx
│   │   │   └── page.tsx         # Community page
│   │   ├── dashboard/
│   │   │   ├── file-upload/
│   │   │   ├── data-processing/
│   │   │   └── page.js          # Main dashboard
│   │   ├── python-charts/
│   │   │   └── page.js
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css          # Global styles
│   ├── public/                  # Static assets (images, logos)
│   ├── lib/
│   │   └── utils.ts
│   ├── process_s3_file.py       # S3 file processor
│   ├── requirements.txt         # Python dependencies
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
├── python-processing/
│   ├── chart_generator.py       # Chart generation script
│   ├── s3_processor.py          # Data processing logic
│   └── requirements.txt
├── vercel.json                  # Vercel deployment config
└── README.md
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Python**: 3.8 or higher
- **AWS Account**: For S3 storage (or credentials)
- **Git**: For version control

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/axis-posture-tracker.git
cd axis-posture-tracker
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Python Dependencies

```bash
# Install frontend Python dependencies
pip install -r requirements.txt

# Install python-processing dependencies
cd ../python-processing
pip install -r requirements.txt
cd ../frontend
```

**Recommended**: Use a Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🔐 Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_SESSION_TOKEN=your-session-token  # Optional, for temporary credentials
```

### AWS S3 Setup

1. **Create an S3 Bucket**:
   - Log into AWS Console
   - Navigate to S3
   - Create a new bucket (e.g., `axis-posture-data`)
   - Set appropriate permissions

2. **Create IAM User** (or use existing credentials):
   - Navigate to IAM
   - Create user with programmatic access
   - Attach policy: `AmazonS3FullAccess` (or custom policy)
   - Save Access Key ID and Secret Access Key

3. **Bucket Structure**:
   ```
   your-bucket/
   └── posture/
       ├── timestamp_file1.json
       ├── timestamp_file2.json
       └── ...
   ```

---

## 🏃‍♂️ Running the Application

### Development Mode

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 🌐 Deployment

This project is configured for **Vercel** deployment.

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - Navigate to Project Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Automatic Deployments**:
   - Connect your GitHub repository
   - Vercel will auto-deploy on every push to `main`

### Configuration (`vercel.json`)

The project includes a `vercel.json` configuration file for deployment settings.

---

## 📡 API Documentation

### Upload API (`/api/upload`)

#### POST - Upload File

**Endpoint**: `/api/upload`

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData with `file` field

**Response**:
```json
{
  "message": "File uploaded and processed successfully",
  "filename": "data.json",
  "s3Key": "posture/1234567890_data.json",
  "pythonOutput": "Processing output..."
}
```

#### GET - Retrieve Files

**Endpoint**: `/api/upload?action=getall`

**Response**:
```json
{
  "files": [
    {
      "filename": "posture/1234567890_data.json",
      "userId": "user123",
      "sessions": [
        {
          "timestamp": "2025-10-25T10:30:00Z",
          "pitch": -5.2,
          "roll": 2.1,
          "status": "good"
        }
      ]
    }
  ]
}
```

### Python Chart API (`/api/python-chart`)

#### POST - Generate Chart

**Endpoint**: `/api/python-chart`

**Request**:
```json
{
  "timeframe": 7,  // 7, 14, or 30 days
  "plotType": true  // true = Good/Bad %, false = Cause analysis
}
```

**Response**:
```json
{
  "image": "base64_encoded_png_image_data..."
}
```

---

## 📖 Usage Guide

### 1. Landing Page
- Visit the homepage to see the 3D infinite gallery
- Use mouse wheel or arrow keys to navigate
- Auto-play activates after 3 seconds of inactivity

### 2. Dashboard
#### Upload Data
1. Navigate to Dashboard
2. Click "Upload Data" or the upload icon
3. Drag & drop a JSON file or click to browse
4. File is automatically uploaded to S3 and processed

#### View Analytics
1. Dashboard auto-loads on visit
2. View real-time posture charts
3. Switch between "Individual User" and "All Users Comparison"
4. Select specific users from dropdown
5. Click "Analyze Data" for detailed modal view

#### Generate Python Charts
1. Click "Generate Charts" button
2. Select timeframe (7, 14, or 30 days)
3. Choose chart type:
   - **Good/Bad Percentages**: Overall posture distribution
   - **Bad Cause Analysis**: Breakdown by pitch, roll, or both
4. Click "Generate Chart" to create visualization

### 3. Community
- View global leaderboards
- Filter by time period (All Time, Weekly, Monthly, Daily)
- See your ranking and compete with others

### 4. Data Format

Expected JSON format for posture data:

```json
{
  "userId": "user123",
  "sessions": [
    {
      "timestamp": "2025-10-25T10:30:00.000Z",
      "pitch": -5.2,
      "roll": 2.1,
      "status": "good"
    },
    {
      "timestamp": "2025-10-25T10:31:00.000Z",
      "pitch": -15.8,
      "roll": -12.3,
      "status": "bad"
    }
  ]
}
```

### Posture Classification Rules

- **Good Posture**: 
  - Pitch ≥ -12°
  - Roll between -10° and 10°

- **Bad Posture**:
  - Pitch < -12° (looking down)
  - Roll < -10° or > 10° (tilting)

- **Cause Analysis**:
  - **Pitch**: Only pitch is bad
  - **Roll**: Only roll is bad
  - **Both**: Both pitch and roll are bad

---

## 🎨 Design Features

### Glass-Morphism UI
- Custom `liquid-glass` class for frosted glass effect
- Backdrop blur and translucent backgrounds
- Smooth transitions and hover effects

### Color Scheme
- **Primary Background**: Black (`#000000`)
- **Good Posture**: Green (`#10b981`)
- **Bad Posture**: Blue (`#3498db`)
- **Accents**: Orange (`#f39c12`), Purple (`#9b59b6`)
- **Text**: White with varying opacity

### Typography
- **Serif**: Instrument Serif (italic for emphasis)
- **Mono**: Geist Mono (for data/code)
- **Sans**: System default

---

## 🔬 Data Processing Pipeline

1. **File Upload**: User uploads JSON file via web interface
2. **S3 Storage**: File stored in AWS S3 with timestamp prefix
3. **Python Processing**: 
   - `process_s3_file.py` triggered automatically
   - Parses JSON data
   - Calculates statistics (mean, std, min, max)
   - Classifies posture states
   - Identifies bad posture causes
4. **Data Retrieval**: Dashboard fetches processed data from S3
5. **Visualization**: Chart.js renders interactive charts
6. **Advanced Analytics**: `chart_generator.py` creates matplotlib visualizations

### Posture Score Calculation

The system calculates a comprehensive posture score (1-10) based on:

- **Good Posture Percentage** (65% weight)
- **Pitch/Roll Variance** (12% weight) - Lower is better
- **Mean Deviation** (15% weight) - Closer to zero is better
- **Bad Cause Distribution** (8% weight) - Fewer "both" causes is better

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: `AWS credentials not configured`
- **Solution**: Check `.env.local` file has all AWS variables set

**Issue**: Python script execution fails
- **Solution**: Ensure Python is in PATH and dependencies are installed

**Issue**: Charts not rendering
- **Solution**: Check browser console for errors; ensure Chart.js loaded

**Issue**: 3D gallery not working
- **Solution**: Check WebGL support in browser; fallback will show static images

**Issue**: File upload fails
- **Solution**: Check S3 bucket permissions and file size (max 10MB)

---

## 📊 Performance Optimization

- **Image Loading**: Lazy loading with Next.js Image component
- **Data Fetching**: Auto-refresh with caching
- **Chart Rendering**: Canvas-based for optimal performance
- **3D Gallery**: Efficient texture management and plane recycling
- **Code Splitting**: Automatic with Next.js App Router

---

## 🔒 Security Considerations

- Environment variables for sensitive credentials
- Input validation on file uploads (size, type)
- S3 pre-signed URLs for secure access
- No credentials exposed in client-side code
- CORS configuration in Vercel

---

## 🚧 Future Enhancements

- [ ] Real-time posture tracking with device integration
- [ ] Mobile app (React Native)
- [ ] Push notifications for posture reminders
- [ ] Machine learning for personalized recommendations
- [ ] Social features (friends, challenges)
- [ ] Export reports as PDF
- [ ] Dark/Light theme toggle
- [ ] Multi-language support

---

## 📄 License

This project is proprietary. All rights reserved.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use TypeScript for type safety
- Write meaningful commit messages
- Add comments for complex logic

---

## 👥 Authors

- Enes
- Colin
- Rithvik
- Varun

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Three.js community for 3D graphics libraries
- AWS for cloud infrastructure
- Chart.js for beautiful visualizations
- All contributors and testers

---

## 📞 Support

For issues, questions, or suggestions:

- **Email**: support@axis-app.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/axis-posture-tracker/issues)
- **Docs**: [Documentation](https://docs.axis-app.com)

---

<div align="center">

**Made with ❤️ for better posture**

[Website](https://axis-app.com) • [Demo](https://demo.axis-app.com) • [Docs](https://docs.axis-app.com)

</div>
