import { useState, useEffect } from 'react';
import { MOCK_USERS_METRICS } from '../pages/metrics/mockData.ts';
import { getAccessToken } from '../shared/auth/session.ts';
import { http } from '../shared/api/http.ts';

export type Interval = 'day' | 'week' | 'month';

export interface UsersMetricsResponse {
  summary: { total_registered_all_time: number; new_users_in_period: number };
  timeseries: { date: string; count: number }[];
}

export interface OrdersSummaryResponse {
  summary: { total_orders_in_period: number; total_amount_in_period: number };
  distribution_by_status: Record<string, number>;
  timeseries: { date: string; orders_count: number; amount: number }[];
}

export interface TopSellingProductsResponse {
  items: { product_id: string; product_name: string; total_quantity_sold: number; total_revenue: number }[];
}

export interface CategorySalesResponse {
  items: { category: string; orders_count: number; total_amount: number }[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function fetchMetrics<T>(endpoint: string, queryParams: Record<string, string>): Promise<T> {
  // const token = getAccessToken();
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      // Convertir fechas date-only a date-time
      if ((key === 'start_date' || key === 'end_date') && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        value = key === 'start_date' ? `${value}T00:00:00` : `${value}T23:59:59`;
      }
      url.searchParams.append(key, value);
    }
  });

  const { data } = await http.get<T>(endpoint, { params: queryParams });
  return data;
}

export function useUsersMetrics(startDate: string, endDate: string, interval: Interval) {
  const [data, setData] = useState<UsersMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchMetrics<UsersMetricsResponse>('/users/admin/metrics/users', { start_date: startDate, end_date: endDate, interval })
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('API call to /users/admin/metrics/users failed, using mock data fallback.', err);
          setData(MOCK_USERS_METRICS as UsersMetricsResponse);
          setError(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, interval]);

  return { data, isLoading, error };
}

export function useOrdersSummary(startDate: string, endDate: string, interval: Interval) {
  const [data, setData] = useState<OrdersSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchMetrics<OrdersSummaryResponse>('/orders/admin/metrics/orders/summary', { start_date: startDate, end_date: endDate, interval })
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, interval]);

  return { data, isLoading, error };
}

export function useTopSellingProducts(startDate: string, endDate: string, limit: number = 5) {
  const [data, setData] = useState<TopSellingProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchMetrics<TopSellingProductsResponse>('/orders/admin/metrics/products/top-selling', { start_date: startDate, end_date: endDate, limit: limit.toString() })
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, limit]);

  return { data, isLoading, error };
}

export function useCategorySales(startDate: string, endDate: string) {
  const [data, setData] = useState<CategorySalesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchMetrics<CategorySalesResponse>('/orders/admin/metrics/categories/sales', { start_date: startDate, end_date: endDate })
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  return { data, isLoading, error };
}

export async function exportMetricsCSV(endpoint: string, queryParams: Record<string, string>): Promise<Blob> {
  const { data } = await http.get<Blob>(endpoint, {
    params: queryParams,
    responseType: 'blob',
  });
  return data;
}