'use client';

import { useState, useEffect } from 'react';

interface City {
  id: number;
  city_name: string;
  coefficient: number;
}

interface CalculationResult {
  success: boolean;
  subsidy?: number;
  calculationDetails?: {
    cityName: string;
    coefficient: number;
    familyIncome: number;
    familyMembers: number;
  };
  error?: string;
}

export default function Home() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cityId: '',
    familyIncome: '',
    familyMembers: '',
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
        setError('Ошибка при загрузке списка городов');
      }
    } catch (err) {
      setError('Ошибка при загрузке списка городов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!formData.cityId || !formData.familyIncome || !formData.familyMembers) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    const income = parseFloat(formData.familyIncome);
    const members = parseInt(formData.familyMembers);

    if (isNaN(income) || income <= 0) {
      setError('Доход семьи должен быть положительным числом');
      return;
    }

    if (isNaN(members) || members <= 0 || !Number.isInteger(members)) {
      setError('Количество членов семьи должно быть положительным целым числом');
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
          familyIncome: income,
          familyMembers: members,
        }),
      });

      const data = await response.json();
      setResult(data);

      if (!data.success) {
        setError(data.error || 'Ошибка при расчете субсидии');
      }
    } catch (err) {
      setError('Ошибка при отправке запроса');
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      cityId: '',
      familyIncome: '',
      familyMembers: '',
    });
    setResult(null);
    setError(null);
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
              Рассчитайте размер субсидии для вашей семьи
            </p>
          </div>

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
                <option value="">Выберите город</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.city_name} (коэф. {city.coefficient})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="familyIncome"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Доход семьи (руб.)
              </label>
              <input
                type="number"
                id="familyIncome"
                value={formData.familyIncome}
                onChange={(e) =>
                  setFormData({ ...formData, familyIncome: e.target.value })
                }
                className="w-full px-4 py-2 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                placeholder="Введите доход семьи"
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

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

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

          {result && result.success && result.calculationDetails && (
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
                    <span className="font-medium">Коэффициент:</span>{' '}
                    {result.calculationDetails.coefficient}
                  </p>
                  <p>
                    <span className="font-medium">Доход семьи:</span>{' '}
                    {result.calculationDetails.familyIncome.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                    })}
                  </p>
                  <p>
                    <span className="font-medium">Членов семьи:</span>{' '}
                    {result.calculationDetails.familyMembers}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
