import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/mysql/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityId, familyMembers, additionalArea, ownedArea, yearsOfService } = body;

    if (!cityId || !familyMembers || additionalArea === undefined || ownedArea === undefined || yearsOfService === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Необходимо заполнить все поля',
        },
        { status: 400 }
      );
    }

    if (typeof additionalArea !== 'number' || additionalArea < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Дополнительная площадь должна быть не отрицательным числом',
        },
        { status: 400 }
      );
    }

    if (typeof ownedArea !== 'number' || ownedArea < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Имеющаяся площадь должна быть не отрицательным числом',
        },
        { status: 400 }
      );
    }

    if (typeof yearsOfService !== 'number' || yearsOfService < 0 || !Number.isInteger(yearsOfService)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Стаж службы должен быть не отрицательным целым числом',
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
      'SELECT city_name, market_value_per_sq_meter, market_value_correction_factor FROM city_coefficients WHERE id = ?',
      [cityId]
    );

    const cities = rows as Array<{
      city_name: string;
      market_value_per_sq_meter: number;
      market_value_correction_factor: number;
    }>;

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
    const marketValuePerSqMeter = Number(city.market_value_per_sq_meter);
    const marketValueCorrectionFactor = Number(city.market_value_correction_factor);

    let normativeArea: number = 0;
    if (familyMembers === 1) {
      normativeArea = 33;
    } else if (familyMembers === 2) {
      normativeArea = 42;
     } else if (familyMembers >= 3) {
       normativeArea = 18 * familyMembers;
    }

    const totalArea = normativeArea + additionalArea - ownedArea;

    let serviceCoefficient: number;
    if (yearsOfService >= 7 && yearsOfService < 9) {
      serviceCoefficient = 1.1;
    } else if (yearsOfService >= 9 && yearsOfService < 11) {
      serviceCoefficient = 1.15;
    } else if (yearsOfService >= 11 && yearsOfService < 15) {
      serviceCoefficient = 1.2;
    } else if (yearsOfService >= 15 && yearsOfService < 20) {
      serviceCoefficient = 1.25;
    } else if (yearsOfService >= 20) {
      serviceCoefficient = Math.min(1.5, 1.25 + (yearsOfService - 20) * 0.025);
    } else {
      serviceCoefficient = 1;
    }

    const subsidy = totalArea * marketValuePerSqMeter * marketValueCorrectionFactor * serviceCoefficient;

    return NextResponse.json({
      success: true,
      subsidy: Math.round(subsidy * 100) / 100,
      calculationDetails: {
        cityName: city.city_name,
        marketValuePerSqMeter: marketValuePerSqMeter,
        marketValueCorrectionFactor: marketValueCorrectionFactor,
        yearsOfService: yearsOfService,
        serviceCoefficient: serviceCoefficient,
        familyMembers: familyMembers,
        normativeArea: normativeArea,
        additionalArea: additionalArea,
        ownedArea: ownedArea,
        totalArea: totalArea,
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
