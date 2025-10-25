import boto3
import sys
import os
from io import BytesIO

def process_s3_file(bucket_name, s3_key):
    # Initialize S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        region_name=os.environ.get('AWS_REGION', 'us-east-1')
    )
    
    try:
        # Download file from S3
        response = s3_client.get_object(Bucket=bucket_name, Key=s3_key)
        file_content = response['Body'].read()
        
        # Process the file (example: get file info)
        file_size = len(file_content)
        content_type = response.get('ContentType', 'unknown')
        
        # Your processing logic here
        print(f"Processing file: {s3_key}")
        print(f"File size: {file_size} bytes")
        print(f"Content type: {content_type}")
        
        # Example: If it's a text file, count lines
        if content_type.startswith('text/'):
            lines = file_content.decode('utf-8').count('\n')
            print(f"Number of lines: {lines}")
        
        return True
        
    except Exception as e:
        print(f"Error processing S3 file: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python process_s3_file.py <bucket_name> <s3_key>")
        sys.exit(1)
    
    bucket_name = sys.argv[1]
    s3_key = sys.argv[2]
    
    success = process_s3_file(bucket_name, s3_key)
    sys.exit(0 if success else 1)