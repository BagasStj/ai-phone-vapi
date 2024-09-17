import { NextResponse } from 'next/server';
import { Client } from 'pg';

const DB_URL = process.env.NEXT_PUBLIC_DB_URL;

export async function POST(request: Request) {
  const { nik, name } = await request.json();
  
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    const result = await client.query(
      'SELECT * FROM public."pengguna_new" p  WHERE nik = $1 AND namalengkap  = $2',
      [nik, name]
    );

    console.log('[result]', result);

    await client.end();

 
    if (result.rows.length > 0) {
      return NextResponse.json({ isValid: true  , data: result.rows[0]});
    } else {
      return NextResponse.json({ isValid: false });
    }
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json({ error: 'Database error' , message: error }, { status: 500 });
  }
}