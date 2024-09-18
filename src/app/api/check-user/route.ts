import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const DB_URL = process.env.NEXT_PUBLIC_DB_URL;

const client = new Pool({
  connectionString: DB_URL,
});

export async function POST(request: Request) {
  const { nik, name } = await request.json();

  try {
    const result = await client.query(
      'SELECT * FROM public."pengguna_new" p  WHERE nik = $1 or namalengkap  = $2',
      [nik, name]
    );
    await client.end()
    console.log('[result 2]', result.rows[0]);

    if (result.rows.length > 0) {
      return NextResponse.json({ isValid: true  , data: result.rows[0]});
    } else {
      return NextResponse.json({ isValid: false });
    }
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}