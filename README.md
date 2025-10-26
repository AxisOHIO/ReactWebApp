# AXIS - Posture Analysis System

A Next.js web application for uploading, processing, and analyzing posture data using AWS S3 and Python processing with interactive dashboards and advanced chart generation.

## Features

- **File Upload**: Drag & drop interface for uploading files to AWS S3
- **Interactive Dashboard**: Chart.js visualizations with multi-user support
- **Python Charts**: Matplotlib-generated charts with dark theme styling
- **Data Processing**: Python scripts process uploaded posture data
- **Multi-User Analysis**: Compare posture data across different users
- **S3 Integration**: Secure file storage and retrieval from AWS S3
- **Liquid Glass UI**: Modern glassmorphism design with responsive navigation

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Languages**: JavaScript, TypeScript, Python
- **Storage**: AWS S3
- **Processing**: Python with boto3, pandas, matplotlib
- **Charts**: Chart.js, Matplotlib
- **Styling**: Tailwind CSS with custom liquid-glass effects
- **Deployment**: Vercel-ready

## Project Structure

```
AXIS/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/          # S3 upload/download API
│   │   │   └── python-chart/    # Python chart generation API
│   │   ├── dashboard/
│   │   │   ├── file-upload/     # File upload page
│   │   │   └── data-processing/ # Interactive dashboard
│   │   ├── python-charts/       # Python-generated charts page
│   │   ├── components/
│   │   │   └── header.tsx       # Navigation header
│   │   └── globals.css          # Global styles with liquid-glass
│   ├── data.json               # Sample posture data
│   ├── process_s3_file.py      # Python processing script
│   └── package.json            # Dependencies
├── python-processing/
│   ├── chart_generator.py      # Matplotlib chart generation
│   └── requirements.txt        # Python dependencies
└── README.md
```

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure AWS credentials:**
   Create `.env.local` in the frontend directory:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_SESSION_TOKEN=your_session_token  # If using temporary credentials
   AWS_BUCKET_NAME=your_bucket_name
   ```

3. **Install Python dependencies:**
   ```bash
   pip install boto3 pandas matplotlib numpy
   # Or use requirements file:
   pip install -r python-processing/requirements.txt
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Usage

### File Upload
- Navigate to `/dashboard/file-upload`
- Drag & drop files or click to select
- Files are uploaded to S3 posture folder and processed with Python

### Interactive Dashboard
- Navigate to `/dashboard/data-processing`
- Fetch and analyze posture data from S3
- Select individual users or compare all users
- View Chart.js line charts with percentage-based data

### Python Charts
- Navigate to `/python-charts`
- Generate matplotlib charts with advanced styling
- Choose timeframe (7 or 30 days)
- Toggle between posture analysis and cause breakdown
- Dark theme charts with professional styling

## API Endpoints

- `POST /api/upload` - Upload files to S3 posture folder
- `GET /api/upload?key=filename` - Download specific file from S3
- `GET /api/upload?action=getall` - Fetch all files from posture folder
- `POST /api/python-chart` - Generate matplotlib charts with timeframe and type parameters

## Navigation

- **Upload** - File upload interface
- **Dashboard** - Interactive Chart.js visualizations
- **Charts** - Python-generated matplotlib charts
- **Logo** - Click to return to home page

## Data Format

Posture data should be in JSON format:
```json
{
  "userId": "user123",
  "sessions": [
    {
      "timestamp": "2025-01-01T12:00:00Z",
      "pitch": -5.2,
      "roll": -2.1,
      "status": "good"
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License