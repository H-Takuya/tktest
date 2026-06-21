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

const CURRENT_MONTH_TTL = 60 * 60 * 1000;

function cacheKey(lat: number, lon: number, year: number, month: number) {
  const latStr = lat.toFixed(4).replace(".", "_");
  const lonStr = lon.toFixed(4).replace(".", "_");
  return `weather_${latStr}_${lonStr}_v2_${year}_${String(month).padStart(2, "0")}`;
}

function loadCache(
  lat: number,
  lon: number,
  year: number,
  month: number,
  isPastMonth: boolean
): Record<string, DayWeather> | null {
  try {
    const raw = localStorage.getItem(cacheKey(lat, lon, year, month));
    if (!raw) return null;
    const { ts, days } = JSON.parse(raw) as { ts: number; days: Record<string, DayWeather> };
    if (isPastMonth) return days;
    if (Date.now() - ts < CURRENT_MONTH_TTL) return days;
    return null;
  } catch {
    return null;
  }
}

function saveCache(lat: number, lon: number, year: number, month: number, days: Record<string, DayWeather>) {
  try {
    localStorage.setItem(cacheKey(lat, lon, year, month), JSON.stringify({ ts: Date.now(), days }));
  } catch {
    // localStorage が使えない環境ではスキップ
  }
}

export function useWeatherData(
  year: number | null,
  month: number,
  lat: number,
  lon: number
): WeatherData {
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

    const cached = loadCache(lat, lon, year, month, isPastMonth);
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
        url.searchParams.set("latitude", String(lat));
        url.searchParams.set("longitude", String(lon));
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

        saveCache(lat, lon, year, month, result);
        if (!cancelled) setDays(result);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "データ取得に失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [year, month, lat, lon]);

  return { days, loading, error };
}
