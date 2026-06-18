"use client";

import { useState, useEffect, useCallback } from "react";

export interface DayWeather {
  date: string;
  tempMax: number | null;
  tempMin: number | null;
  tempMean: number | null;
}

interface WeatherData {
  days: Record<string, DayWeather>;
  loading: boolean;
  error: string | null;
}

const KAWAGUCHI_LAT = 35.8082;
const KAWAGUCHI_LON = 139.724;

export function useWeatherData(year: number, month: number): WeatherData {
  const [days, setDays] = useState<Record<string, DayWeather>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const now = new Date();
    const isCurrentOrFutureMonth =
      year > now.getFullYear() ||
      (year === now.getFullYear() && month >= now.getMonth() + 1);

    if (isCurrentOrFutureMonth) {
      const today = now.toISOString().split("T")[0];
      if (startDate > today) {
        setDays({});
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL("https://archive-api.open-meteo.com/v1/archive");
      url.searchParams.set("latitude", String(KAWAGUCHI_LAT));
      url.searchParams.set("longitude", String(KAWAGUCHI_LON));
      url.searchParams.set("start_date", startDate);
      url.searchParams.set("end_date", endDate);
      url.searchParams.set(
        "daily",
        "temperature_2m_max,temperature_2m_min,temperature_2m_mean"
      );
      url.searchParams.set("timezone", "Asia/Tokyo");

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`APIエラー: ${res.status}`);

      const json = await res.json();
      const result: Record<string, DayWeather> = {};

      json.daily.time.forEach((date: string, i: number) => {
        result[date] = {
          date,
          tempMax: json.daily.temperature_2m_max[i],
          tempMin: json.daily.temperature_2m_min[i],
          tempMean: json.daily.temperature_2m_mean[i],
        };
      });

      setDays(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "データ取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return { days, loading, error };
}
