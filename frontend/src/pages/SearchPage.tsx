import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLazySearchProfilesQuery } from '@/services/apiSlice';
import { TextField } from '@/components/common/TextField';
import { Button } from '@/components/common/Button';
import { MatchGrid } from '@/components/matches/MatchGrid';
import type { PagedProfiles } from '@/types/api';

const searchSchema = z.object({
  gender: z.string().optional(),
  minage: z.coerce.number().min(18).max(80).optional(),
  maxage: z.coerce.number().min(18).max(80).optional(),
  loggedIn: z.boolean().optional(),
});

type SearchFields = z.infer<typeof searchSchema>;

export const SearchPage = () => {
  const [search, searchState] = useLazySearchProfilesQuery();
  const [results, setResults] = useState<PagedProfiles | undefined>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFields>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      gender: '',
      minage: 22,
      maxage: 40,
      loggedIn: true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const response = await search({
      ...values,
      loggedIn: values.loggedIn ? 'on' : 'off',
    }).unwrap();
    setResults(response);
  });

  return (
    <div className="fd-grid" style={{ gap: '1.5rem' }}>
      <form
        onSubmit={onSubmit}
        className="fd-card"
        style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
      >
        <h2 style={{ gridColumn: '1 / -1', margin: 0 }}>Custom search</h2>
        <label>
          Gender
          <select
            {...register('gender')}
            style={{
              width: '100%',
              borderRadius: '0.85rem',
              border: '1px solid var(--fd-muted)',
              padding: '0.65rem',
            }}
          >
            <option value="">Everyone</option>
            <option value="M">Men</option>
            <option value="F">Women</option>
          </select>
        </label>
        <TextField
          label="Min age"
          type="number"
          {...register('minage', { valueAsNumber: true })}
          error={errors.minage?.message}
        />
        <TextField
          label="Max age"
          type="number"
          {...register('maxage', { valueAsNumber: true })}
          error={errors.maxage?.message}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" {...register('loggedIn')} />
          Only show online profiles
        </label>
        <div style={{ gridColumn: '1 / -1' }}>
          <Button type="submit" disabled={searchState.isFetching}>
            {searchState.isFetching ? 'Searching…' : 'Search'}
          </Button>
        </div>
      </form>

      <MatchGrid
        title="Results"
        profiles={results?.profiles}
        emptyState={searchState.isUninitialized ? 'Run a search to see matches.' : 'No profiles found.'}
      />
    </div>
  );
};

