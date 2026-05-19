export const prerender = false;

import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

const jsonPath = path.resolve(process.cwd(), 'src/data/emdash.json');

export const GET: APIRoute = async () => {
  try {
    if (!fs.existsSync(jsonPath)) {
      return new Response(JSON.stringify({ error: 'Data file not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const data = fs.readFileSync(jsonPath, 'utf-8');
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to read data', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Ensure parent directories exist
    const dir = path.dirname(jsonPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write back to the local database file
    fs.writeFileSync(jsonPath, JSON.stringify(body, null, 2), 'utf-8');
    
    return new Response(JSON.stringify({ success: true, message: 'Content saved successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to save data', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};
