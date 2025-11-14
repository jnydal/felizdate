import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/services/apiSlice';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/TextField';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(4, 'Password is required'),
});

type LoginFields = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const authenticated = useAppSelector((state) => state.session.authenticated);
  const [login, loginState] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    await login(values).unwrap();
  });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        background:
          'radial-gradient(circle at top, rgba(236, 72, 153, 0.25), transparent 60%)',
      }}
    >
      <form
        onSubmit={onSubmit}
        className="fd-card"
        style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <h2 style={{ margin: 0 }}>Welcome back</h2>
        <p style={{ marginTop: 0, color: 'var(--fd-text-secondary)' }}>
          Sign in to continue your conversations.
        </p>
        <TextField label="Email" placeholder="you@email.com" {...register('email')} error={errors.email?.message} />
        <TextField
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          error={errors.password?.message}
        />
        {loginState.error ? (
          <p style={{ color: '#be123c', margin: 0 }}>
            Unable to sign you in. Please double-check your credentials.
          </p>
        ) : null}
        <Button type="submit" disabled={loginState.isLoading}>
          {loginState.isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
};

