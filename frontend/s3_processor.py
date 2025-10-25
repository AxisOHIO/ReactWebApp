import boto3
import pandas as pd
from io import StringIO, BytesIO

class S3FileProcessor:
    def __init__(self):
        self.s3_client = boto3.client('s3')
    
    def process_csv_from_s3(self, bucket, key):
        """Process CSV file directly from S3"""
        obj = self.s3_client.get_object(Bucket=bucket, Key=key)
        df = pd.read_csv(StringIO(obj['Body'].read().decode('utf-8')))
        
        # Your data processing here
        print(f"CSV shape: {df.shape}")
        return df
    
    def process_image_from_s3(self, bucket, key):
        """Process image file from S3"""
        obj = self.s3_client.get_object(Bucket=bucket, Key=key)
        image_data = obj['Body'].read()
        
        # Process image (example with PIL)
        # from PIL import Image
        # image = Image.open(BytesIO(image_data))
        
        print(f"Image size: {len(image_data)} bytes")
        return image_data

# Usage example
if __name__ == "__main__":
    processor = S3FileProcessor()
    # processor.process_csv_from_s3('your-bucket', 'uploads/file.csv')