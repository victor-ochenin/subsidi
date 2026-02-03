import { NextResponse } from 'next/server';
import { pool } from '@/mysql/db';

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT id, city_name, market_value_per_sq_meter, market_value_correction_factor FROM city_coefficients ORDER BY city_name'
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

