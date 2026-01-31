import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/mysql/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityId, familyIncome, familyMembers } = body;

    if (!cityId || !familyIncome || !familyMembers) {
      return NextResponse.json(
        {
          success: false,
          error: 'Необходимо заполнить все поля',
        },
        { status: 400 }
      );
    }

    if (typeof familyIncome !== 'number' || familyIncome <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Доход семьи должен быть положительным числом',
        },
        { status: 400 }
      );
    }

    if (
      typeof familyMembers !== 'number' ||
      familyMembers <= 0 ||
      !Number.isInteger(familyMembers)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Количество членов семьи должно быть положительным целым числом',
        },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      'SELECT city_name, coefficient FROM city_coefficients WHERE id = ?',
      [cityId]
    );

    const cities = rows as Array<{ city_name: string; coefficient: number }>;

    if (cities.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Город не найден',
        },
        { status: 404 }
      );
    }

    const city = cities[0];
    const coefficient = Number(city.coefficient);

    const subsidy = (familyIncome / familyMembers) * coefficient;

    return NextResponse.json({
      success: true,
      subsidy: Math.round(subsidy * 100) / 100,
      calculationDetails: {
        cityName: city.city_name,
        coefficient: coefficient,
        familyIncome: familyIncome,
        familyMembers: familyMembers,
      },
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ошибка при расчете субсидии',
      },
      { status: 500 }
    );
  }
}

