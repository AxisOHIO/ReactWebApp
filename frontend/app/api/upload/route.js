import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';


// Create S3 Client instance
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  },
});

// API Route to get file from S3
export async function GET(req) {
  try {
    // Validate environment variables
    if (!process.env.AWS_BUCKET_NAME) {
      return NextResponse.json({ error: 'AWS bucket not configured' }, { status: 500 });
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    // Handle GETALL action
    if (action === 'getall') {
      return await handleGetAll();
    }
    
    const fileKey = searchParams.get('key');

    if (!fileKey) {
      return NextResponse.json({ error: 'File key parameter required' }, { status: 400 });
    }

    // Validate file key format
    if (fileKey.includes('..') || fileKey.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid file key format' }, { status: 400 });
    }

    console.log('Retrieving file:', fileKey);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    });

    const data = await s3.send(command);
    const filename = fileKey.split('/').pop() || 'download';

    return new NextResponse(data.Body, {
      headers: {
        'Content-Type': data.ContentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': data.ContentLength?.toString() || '',
      },
    });
  } catch (error) {
    console.error('File retrieval failed:', error.message);
    
    if (error.name === 'NoSuchKey') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    if (error.name === 'NoSuchBucket') {
      return NextResponse.json({ error: 'S3 bucket not found' }, { status: 404 });
    }
    if (error.name === 'AccessDenied') {
      return NextResponse.json({ error: 'Access denied to file' }, { status: 403 });
    }
    if (error.name === 'CredentialsError') {
      return NextResponse.json({ error: 'Invalid AWS credentials' }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to retrieve file', 
      details: error.message 
    }, { status: 500 });
  }
}

const execAsync = promisify(exec);

async function handleGetAll() {
  try {
    // List all files in posture folder
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'posture/'
    });

    const listResult = await s3.send(listCommand);
    const files = listResult.Contents || [];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files found in posture folder' }, { status: 404 });
    }

    // Fetch all JSON files as separate objects
    const allFiles = [];
    
    for (const file of files) {
      if (file.Key.endsWith('.json')) {
        try {
          const getCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.Key
          });
          
          const data = await s3.send(getCommand);
          const text = await data.Body.transformToString();
          const jsonData = JSON.parse(text);
          
          if (jsonData.sessions) {
            // Sort sessions within each file
            jsonData.sessions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            allFiles.push({
              filename: file.Key,
              ...jsonData
            });
          }
        } catch (fileError) {
          console.error(`Error reading file ${file.Key}:`, fileError.message);
        }
      }
    }

    return NextResponse.json({ files: allFiles });
  } catch (error) {
    console.error('GETALL failed:', error.message);
    return NextResponse.json({ error: 'Failed to fetch all files', details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Validate environment variables
    if (!process.env.AWS_BUCKET_NAME) {
      return NextResponse.json({ error: 'AWS bucket not configured' }, { status: 500 });
    }
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json({ error: 'AWS credentials not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    console.log('Processing file:', file.name, `${(file.size / 1024).toFixed(1)}KB`);

    const buffer = Buffer.from(await file.arrayBuffer());
    const s3Key = `posture/${Date.now()}_${file.name}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
    });

    const uploadResult = await s3.send(command);
    console.log('S3 upload successful:', s3Key);

    // Run Python script
    try {
      const pythonResult = await execAsync(`python process_s3_file.py ${process.env.AWS_BUCKET_NAME} ${s3Key}`);
      
      return NextResponse.json({ 
        message: 'File uploaded and processed successfully',
        filename: file.name,
        s3Key: s3Key,
        pythonOutput: pythonResult.stdout.trim()
      });
    } catch (pythonError) {
      console.error('Python processing failed:', pythonError.message);
      return NextResponse.json({ 
        message: 'File uploaded successfully but processing failed',
        filename: file.name,
        s3Key: s3Key,
        error: `Processing error: ${pythonError.message}`
      }, { status: 207 }); // 207 Multi-Status
    }
  } catch (error) {
    console.error('Upload failed:', error.message);
    
    if (error.name === 'CredentialsError') {
      return NextResponse.json({ error: 'Invalid AWS credentials' }, { status: 401 });
    }
    if (error.name === 'NoSuchBucket') {
      return NextResponse.json({ error: 'S3 bucket not found' }, { status: 404 });
    }
    if (error.name === 'AccessDenied') {
      return NextResponse.json({ error: 'Access denied to S3 bucket' }, { status: 403 });
    }
    
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}
