'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

    const members = parseInt(formData.familyMembers);
    const additionalArea = parseFloat(formData.additionalArea);
    const ownedArea = parseFloat(formData.ownedArea);
    const yearsOfService = parseInt(formData.yearsOfService);


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
    <div className="min-h-screen bg-[#f0f4fa] font-sans">
      <header className="bg-white border-b border-gray-200">

      </header>

      <main className="container mx-auto px-4 py-8 max-w-242 min-h-[850px]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Калькулятор расчета единовременной субсидии на приобретение жилого помещения, предоставляемой федеральным гражданским служащим
          </h2>
        </div>

        {showResult && result && result.success && result.calculationDetails ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Результат расчета субсидии</h3>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-green-700 font-medium mb-2">РАСЧЕТНАЯ СУММА СУБСИДИИ</div>
                <div className="text-4xl font-bold text-green-800">
                  {result.subsidy?.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    minimumFractionDigits: 0,
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Детали расчета</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Субъект Российской Федерации</div>
                  <div className="font-medium text-gray-800">{result.calculationDetails.cityName}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Стоимость 1 кв. метра, утверждаемая Минстроем России</div>
                  <div className="font-medium text-gray-800">
                    {result.calculationDetails.marketValuePerSqMeter.toLocaleString('ru-RU', {
                      style: 'currency',
                      currency: 'RUB',
                    })}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Поправочный коэффициент, утверждаемый Минтрудом России</div>
                <div className="font-medium text-gray-800">{result.calculationDetails.marketValueCorrectionFactor}</div>
              </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Стаж</div>
                  <div className="font-medium text-gray-800">{result.calculationDetails.yearsOfService} лет</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Численность членов семьи</div>
                  <div className="font-medium text-gray-800">{result.calculationDetails.familyMembers}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Норматив</div>
                  <div className="font-medium text-gray-800">{result.calculationDetails.normativeArea} кв. м</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Дополнительная площадь</div>
                  <div className="font-medium text-gray-800">{result.calculationDetails.additionalArea} кв. м</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Площадь в собственности и (или) в социальном найме</div>
                  <div className="font-medium text-gray-800">{result.calculationDetails.ownedArea} кв. м</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Расчетная площадь</div>
                  <div className="font-medium text-gray-800">{result.calculationDetails.totalArea} кв. м</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-[#003366] text-white font-medium rounded-lg hover:bg-[#002244] transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
              >
                Новый расчет
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="cityId"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Место прохождения гражданской службы
                  </label>
                  <select
                    id="cityId"
                    value={formData.cityId}
                    onChange={(e) =>
                      setFormData({ ...formData, cityId: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                    required
                    disabled={loading}
                  >
                    <option value="">
                      Выберите субъект Российской Федерации 
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
                    htmlFor="familyMembers"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Лица, учитываемые при расчете единовременной субсидии
                  </label>
                  <input
                    type="number"
                    id="familyMembers"
                    value={formData.familyMembers}
                    onChange={(e) =>
                      setFormData({ ...formData, familyMembers: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                    placeholder="Введите количество"
                    min="1"
                    max="10"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="additionalArea"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Дополнительная площадь (кв. м)
                  </label>
                  <input
                    type="number"
                    id="additionalArea"
                    value={formData.additionalArea}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalArea: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                    placeholder="Введите площадь"
                    min="0"
                    step="1"
                    max="100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Согласно категории должности</p>
                </div>

                <div>
                  <label
                    htmlFor="ownedArea"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Площадь в собственности (кв. м)
                  </label>
                  <input
                    type="number"
                    id="ownedArea"
                    value={formData.ownedArea}
                    onChange={(e) =>
                      setFormData({ ...formData, ownedArea: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                    placeholder="Введите площадь"
                    min="0"
                    step="1"
                    max="100"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Общая площадь жилых помещений</p>
                </div>

                <div>
                  <label
                    htmlFor="yearsOfService"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Стаж (лет)
                  </label>
                  <input
                    type="number"
                    id="yearsOfService"
                    value={formData.yearsOfService}
                    onChange={(e) =>
                      setFormData({ ...formData, yearsOfService: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent transition-all"
                    placeholder="Введите стаж"
                    min="1"
                    step="1"
                    max="40"
                    required
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading || calculating}
                  className="flex-1 px-8 py-4 bg-[#003366] text-white font-medium rounded-lg hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2"
                >
                  {calculating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Расчет...
                    </span>
                  ) : 'Рассчитать субсидию'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  Очистить форму
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-8 text-sm text-gray-500">
          <p className="mb-2">
            <strong>Внимание:</strong> Данный калькулятор позволяет осуществить только приблизительный расчет!
          </p>
          <p>
            Точный размер субсидии уполномочен определять федеральный государственный орган на основании документов, предоставленных гражданским служащим!
          </p>
        </div>
      </main>
      <footer className="bg-gray-100 py-4 mt-12 border-t border-gray-200">
         <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-gray-800">Авторы:</h3>
              <p className="text-gray-600">Оченин Виктор и Сергей Селиванов</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Контакты:</h3>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
