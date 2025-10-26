# AXIS - Posture Analysis System

A Next.js web application for uploading, processing, and analyzing posture data using AWS S3 and Python processing.

## Features

- **File Upload**: Drag & drop interface for uploading files to AWS S3
- **Data Processing**: Python scripts process uploaded posture data
- **Data Visualization**: Interactive charts showing posture status over time
- **S3 Integration**: Secure file storage and retrieval from AWS S3

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Languages**: JavaScript, TypeScript, Python
- **Storage**: AWS S3
- **Processing**: Python with boto3
- **Charts**: Chart.js
- **Deployment**: Vercel-ready

## Project Structure

```
AXIS/
├── frontend/
│   ├── app/
│   │   ├── api/upload/          # S3 upload/download API
│   │   ├── file-upload/         # File upload page
│   │   ├── data-processing/     # Data analysis page
│   │   └── globals.css          # Global styles
│   ├── data.json               # Sample posture data
│   ├── process_s3_file.py      # Python processing script
│   └── package.json            # Dependencies
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
   pip install boto3 pandas pillow
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Usage

### File Upload
- Navigate to `/file-upload`
- Drag & drop files or click to select
- Files are uploaded to S3 and processed with Python

### Data Analysis
- Navigate to `/data-processing`
- Fetch and analyze posture data from S3
- View interactive charts showing posture trends

## API Endpoints

- `POST /api/upload` - Upload files to S3
- `GET /api/upload?key=filename` - Download specific file from S3
- `GET /api/upload?action=getall` - Fetch all files from posture folder

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