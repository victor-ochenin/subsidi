import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'city_coefficients.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const cityList = JSON.parse(fileContent) as Array<{
      id: number | string;
      city_name: string;
      market_value_per_sq_meter: number;
      market_value_correction_factor: number;
    }>;

    cityList.sort((a, b) => a.city_name.localeCompare(b.city_name, 'ru'));

    return NextResponse.json({
      success: true,
      cities: cityList,
    });
  } catch (error) {
    console.error('Read cities error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при получении списка городов',
      },
      { status: 500 }
    );
  }
}

