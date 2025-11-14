import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FelizResponse } from '@/types/api';
import type { RootState } from '../store';

type FelizQueryReturn = QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/action',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const csrfToken = state.session.csrfToken;

    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }

    headers.set('Accept', 'application/json');
    return headers;
  },
});

export const baseQueryWithPayload: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    return result;
  }

  const data = result.data as FelizResponse<unknown> | undefined;
  const meta = result.meta as FetchBaseQueryMeta | undefined;

  if (data && typeof data === 'object' && 'success' in data) {
    if (data.success) {
      const success: FelizQueryReturn = {
        data: data.payload,
        meta,
      };
      return success;
    }

    const errorPayload = data.errors ?? data.fielderrors ?? data.message ?? 'Unknown error';
    const errorResult: FelizQueryReturn = {
      error: {
        status: 'CUSTOM_ERROR',
        data: errorPayload,
        error: 'SERVER_ERROR',
      },
      meta,
    };
    return errorResult;
  }

  return result as FelizQueryReturn;
};

