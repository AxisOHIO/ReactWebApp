# Python Processing Scripts

This folder contains Python scripts for processing posture data from AWS S3.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure AWS credentials (same as frontend):
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_SESSION_TOKEN=your_session_token  # If using temporary credentials
export AWS_REGION=us-east-1
```

## Scripts

- `s3_processor.py` - Main processing script for posture data analysis
- `requirements.txt` - Python dependencies

## Usage

```python
from s3_processor import PostureDataProcessor

# Initialize processor
processor = PostureDataProcessor('your-bucket-name')

# Fetch all files
files = processor.fetch_all_files()

# Process specific user
df = processor.process_user_data('user123', files)

# Calculate statistics
stats = processor.calculate_statistics(df)
```