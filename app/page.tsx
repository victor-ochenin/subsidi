'use client';

import { useState, useEffect } from 'react';

interface City {
  id: number;
  city_name: string;
  market_value_per_sq_meter: number;
  market_value_correction_factor: number;
}

interface CalculationResult {
  success: boolean;
  subsidy?: number;
  calculationDetails?: {
    cityName: string;
    marketValuePerSqMeter: number;
    marketValueCorrectionFactor: number;
    yearsOfService: number;
    serviceCoefficient: number;
    familyMembers: number;
    normativeArea: number;
    additionalArea: number;
    ownedArea: number;
    totalArea: number;
  };
  error?: string;
}

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    cityId: '',
    familyMembers: '',
    additionalArea: '',
    ownedArea: '',
    yearsOfService: '',
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cities');
      const data = await response.json();

      if (data.success) {
        setCities(data.cities);
      } else {
        alert('Ошибка при загрузке списка городов');
      }
    } catch (err) {
      alert('Ошибка при загрузке списка городов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResult(null);

    if (
      !formData.cityId ||
      !formData.familyMembers ||
      !formData.additionalArea ||
      !formData.ownedArea ||
      !formData.yearsOfService
    ) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    const members = parseInt(formData.familyMembers);
    const additionalArea = parseFloat(formData.additionalArea);
    const ownedArea = parseFloat(formData.ownedArea);
    const yearsOfService = parseInt(formData.yearsOfService);


    if (isNaN(yearsOfService) || yearsOfService < 7 || !Number.isInteger(yearsOfService)) {
      alert('Стаж службы должен быть не менее 7 лет и быть целым числом');
      return;
    }

    try {
      setCalculating(true);
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityId: parseInt(formData.cityId),
          familyMembers: members,
          additionalArea: additionalArea,
          ownedArea: ownedArea,
          yearsOfService: yearsOfService,
        }),
      });

      const data = await response.json();
      setResult(data);
      if (data.success) {
        setShowResult(true);
      } else {
        alert(data.error || 'Ошибка при расчете субсидии');
      }
    } catch (err) {
      alert('Ошибка при отправке запроса');
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      cityId: '',
      familyMembers: '',
      additionalArea: '',
      ownedArea: '',
      yearsOfService: '',
    });
    setResult(null);
    setShowResult(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center py-16 px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-2">
              Калькулятор субсидий
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Расчет единовременной субсидии на приобретение жилого помещения, предоставляемой федеральным государственным гражданским служащим 
            </p>
          </div>
          {showResult && result && result.success && result.calculationDetails ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
                Результат расчета
              </h2>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {result.subsidy?.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 2,
                  })}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 pt-2 border-t border-green-200 dark:border-green-700">
                  <p>
                    <span className="font-medium">Город:</span>{' '}
                    {result.calculationDetails.cityName}
                  </p>
                  <p>
                    <span className="font-medium">Норматив стоимости 1 кв. метра общей площади жилья:</span>{' '}
                    {result.calculationDetails.marketValuePerSqMeter.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Стаж государственной гражданской службы:</span>{' '}
                    {result.calculationDetails.yearsOfService} лет
                  </p>
                  <p>
                    <span className="font-medium">Норматив общей площади жилого помещения:</span>{' '}
                    {result.calculationDetails.normativeArea} кв. м
                  </p>
                  <p>
                    <span className="font-medium">Дополнительная общая площадь жилого помещения:</span>{' '}
                    {result.calculationDetails.additionalArea} кв. м
                  </p>
                  <p>
                    <span className="font-medium">Сумма общей площади жилых помещений, принадлежащих гражданскому служащему:</span>{' '}
                    {result.calculationDetails.ownedArea} кв. м
                  </p>
                  <p>
                    <span className="font-medium">Общая площадь жилого помещения:</span>{' '}
                    {result.calculationDetails.totalArea} кв. м
                  </p>
                  <p>
                    <span className="font-medium">Членов семьи:</span>{' '}
                    {result.calculationDetails.familyMembers}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-lg">
              <div>
                <label
                  htmlFor="cityId"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Город
                </label>
                <select
                  id="cityId"
                  value={formData.cityId}
                  onChange={(e) =>
                    setFormData({ ...formData, cityId: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  required
                  disabled={loading}
                >
                  <option value="">
                    Выберите город
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="additionalArea"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Размер дополнительной общей площади жилого помещения (кв. м)
                </label>
                <input
                  type="number"
                  id="additionalArea"
                  value={formData.additionalArea}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalArea: e.target.value })
                  }
                  className="w-full px-4 py-2 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="Введите дополнительную площадь"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="ownedArea"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Сумма общей площади жилых помещений, принадлежащих гражданскому служащему и (или) членам его семьи (кв. м)
                </label>
                <input
                  type="number"
                  id="ownedArea"
                  value={formData.ownedArea}
                  onChange={(e) =>
                    setFormData({ ...formData, ownedArea: e.target.value })
                  }
                  className="w-full px-4 py-2 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="Введите площадь имеющихся жилых помещений"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="yearsOfService"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Стаж государственной гражданской службы Российской Федерации (лет)
                </label>
                <input
                  type="number"
                  id="yearsOfService"
                  value={formData.yearsOfService}
                  onChange={(e) =>
                    setFormData({ ...formData, yearsOfService: e.target.value })
                  }
                  className="w-full px-4 py-2 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="Введите стаж службы"
                  min="0"
                  step="1"
                  required
                />
              </div>


              <div>
                <label
                  htmlFor="familyMembers"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Количество членов семьи
                </label>
                <input
                  type="number"
                  id="familyMembers"
                  value={formData.familyMembers}
                  onChange={(e) =>
                    setFormData({ ...formData, familyMembers: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  placeholder="Введите количество членов семьи"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || calculating}
                  className="flex-1 px-6 py-3 dark:bg-zinc-700 text-white rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {calculating ? 'Расчет...' : 'Рассчитать'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
                >
                  Сбросить
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
