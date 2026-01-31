import { NextResponse } from 'next/server';
import { pool } from '@/mysql/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, city_name, CAST(coefficient AS DECIMAL(10, 2)) as coefficient FROM city_coefficients ORDER BY city_name'
    );

    return NextResponse.json({
      success: true,
      cities: rows,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при получении списка городов',
      },
      { status: 500 }
    );
  }
}

