import { useEffect, useMemo, useState } from 'react';
import { useLazyGetSessionQuery } from '@/services/apiSlice';

export const useAppInit = () => {
  const [trigger, result] = useLazyGetSessionQuery();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    if (!result.isFetching && !result.isLoading) {
      setBootstrapped(true);
    }
  }, [result.isFetching, result.isLoading]);

  const error = useMemo(() => {
    if (!result.error) {
      return undefined;
    }
    if ('status' in result.error) {
      return typeof result.error.data === 'string'
        ? result.error.data
        : 'Unable to reach FelizDate servers.';
    }
    return result.error.message;
  }, [result.error]);

  return {
    bootstrapping: !bootstrapped,
    error,
  };
};

