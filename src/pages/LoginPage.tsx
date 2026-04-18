import React, { useState } from 'react';
import { useAuth, MOCK_USERS } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

const LoginPage = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="animate-fade-in-up w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground leading-tight">НИКА ЛЮКС</h1>
          <p className="text-muted-foreground mt-2">Система управления химчисткой</p>
        </div>
        <Card className="p-6 card-shadow space-y-3">
          <p className="text-sm font-medium text-muted-foreground mb-2">Выберите роль для входа:</p>
          {MOCK_USERS.map(u => (
            <button
              key={u.id}
              onClick={() => login(u)}
              className="w-full text-left px-4 py-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-foreground">{u.name}</div>
                <span className="text-xs font-mono text-muted-foreground">{u.id}</span>
              </div>
              <div className="text-sm text-muted-foreground">{u.position}</div>
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
