export type FormValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[]
  | boolean[];

const appendValue = (params: URLSearchParams, key: string, value: string) =>
  params.append(key, value);

const serialize = (value: string | number | boolean) => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
};

export const toFormBody = (payload: Record<string, FormValue>) => {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => appendValue(params, key, serialize(item)));
      return;
    }

    appendValue(params, key, serialize(value));
  });

  return params;
};

