"use client";

import { useState, useEffect } from "react";

export interface DayWeather {
  date: string;
  tempMax: number | null;
  tempMin: number | null;
  tempMean: number | null;
  weatherCode: number | null;
}

interface WeatherData {
  days: Record<string, DayWeather>;
  loading: boolean;
  error: string | null;
}

const KAWAGUCHI_LAT = 35.8082;
const KAWAGUCHI_LON = 139.724;
const CURRENT_MONTH_TTL = 60 * 60 * 1000;

function cacheKey(year: number, month: number) {
  return `weather_kawaguchi_v2_${year}_${String(month).padStart(2, "0")}`;
}

function loadCache(
  year: number,
  month: number,
  isPastMonth: boolean
): Record<string, DayWeather> | null {
  try {
    const raw = localStorage.getItem(cacheKey(year, month));
    if (!raw) return null;
    const { ts, days } = JSON.parse(raw) as { ts: number; days: Record<string, DayWeather> };
    if (isPastMonth) return days;
    if (Date.now() - ts < CURRENT_MONTH_TTL) return days;
    return null;
  } catch {
    return null;
  }
}

function saveCache(year: number, month: number, days: Record<string, DayWeather>) {
  try {
    localStorage.setItem(cacheKey(year, month), JSON.stringify({ ts: Date.now(), days }));
  } catch {
    // localStorage が使えない環境ではスキップ
  }
}

export function useWeatherData(year: number | null, month: number): WeatherData {
  const [days, setDays] = useState<Record<string, DayWeather>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (year === null) {
      setDays({});
      setLoading(false);
      setError(null);
      return;
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const maxDate = yesterday.toISOString().split("T")[0];

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const rawEndDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const endDate = rawEndDate < maxDate ? rawEndDate : maxDate;

    if (startDate > maxDate) {
      setDays({});
      setLoading(false);
      setError(null);
      return;
    }

    const isPastMonth =
      year < now.getFullYear() ||
      (year === now.getFullYear() && month < now.getMonth() + 1);

    const cached = loadCache(year, month, isPastMonth);
    if (cached) {
      setDays(cached);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const url = new URL("https://archive-api.open-meteo.com/v1/archive");
        url.searchParams.set("latitude", String(KAWAGUCHI_LAT));
        url.searchParams.set("longitude", String(KAWAGUCHI_LON));
        url.searchParams.set("start_date", startDate);
        url.searchParams.set("end_date", endDate);
        url.searchParams.set(
          "daily",
          "temperature_2m_max,temperature_2m_min,temperature_2m_mean,weathercode"
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
            weatherCode: json.daily.weathercode?.[i] ?? null,
          };
        });

        saveCache(year, month, result);
        if (!cancelled) setDays(result);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "データ取得に失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [year, month]);

  return { days, loading, error };
}
