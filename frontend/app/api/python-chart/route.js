import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request) {
  try {
    const { timeframe = 7, plotType = true } = await request.json();
    
    const pythonScriptPath = path.join(process.cwd(), '..', 'python-processing', 'chart_generator.py');
    
    return new Promise((resolve) => {
      const pythonProcess = spawn('python', [pythonScriptPath, timeframe.toString(), plotType.toString()]);
      
      let output = '';
      let error = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(NextResponse.json(result));
          } catch (parseError) {
            resolve(NextResponse.json({ error: 'Failed to parse Python output' }, { status: 500 }));
          }
        } else {
          resolve(NextResponse.json({ error: error || 'Python script failed' }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to execute Python script' }, { status: 500 });
  }
}