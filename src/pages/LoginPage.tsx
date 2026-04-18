import React from 'react';
import { useAuth, MOCK_USERS } from '@/contexts/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: 'var(--gradient-glow)' }} />
      <div className="animate-fade-in-up w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl gradient-primary items-center justify-center mb-4 shadow-[var(--shadow-elegant)]">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold gradient-text leading-tight">НИКА ЛЮКС</h1>
          <p className="text-muted-foreground mt-2 text-sm uppercase tracking-widest">Premium Cleaning System</p>
        </div>

        <div className="card-shadow rounded-2xl p-6 space-y-3">
          <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-3">Выберите роль для входа</p>
          {MOCK_USERS.map(u => (
            <button
              key={u.id}
              onClick={() => login(u)}
              className="group w-full text-left px-4 py-3 rounded-xl border border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{u.position}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground">{u.id}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          © {new Date().getFullYear()} НИКА ЛЮКС · Информационная система химчистки
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
