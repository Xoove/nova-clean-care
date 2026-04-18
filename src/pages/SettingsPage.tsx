import React, { useRef, useState } from 'react';
import { exportBackup, importBackup } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Shield, BookOpen, Database } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);

  const doBackup = () => {
    try {
      const data = exportBackup();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nika-lux-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Резервная копия сохранена');
    } catch (e: any) {
      toast.error('Ошибка экспорта: ' + e.message);
    }
  };

  const doRestore = (file: File) => {
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importBackup(String(reader.result));
        toast.success('Восстановление завершено. Перезагрузите страницу.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (e: any) {
        toast.error('Ошибка восстановления: ' + e.message);
      } finally { setBusy(false); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Настройки системы</h1>
        <p className="text-sm text-muted-foreground">Резервное копирование, доступ и справочники</p>
      </div>

      <Card className="p-5 card-shadow">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Резервное копирование</h2>
            <p className="text-sm text-muted-foreground mb-3">Сохраните полную копию данных системы (клиенты, заказы, операции, справочники) одним файлом, чтобы восстановить их при необходимости.</p>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={doBackup} className="gap-2"><Download className="h-4 w-4" />Создать резервную копию</Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={busy} className="gap-2">
                <Upload className="h-4 w-4" />Восстановить из копии
              </Button>
              <input ref={fileRef} type="file" accept="application/json" hidden onChange={e => {
                const f = e.target.files?.[0];
                if (f) doRestore(f);
                e.target.value = '';
              }} />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 card-shadow">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Управление доступом</h2>
            <p className="text-sm text-muted-foreground mb-3">Роли пользователей системы и их права.</p>
            <div className="space-y-2 text-sm">
              <div className="bg-muted/50 px-3 py-2 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Администратор-кассир</Badge>
                  <span className="text-xs font-mono text-muted-foreground">admin</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Полный доступ: заказы, клиенты, оплата, выдача, уведомления, отчёты, настройки</p>
              </div>
              <div className="bg-muted/50 px-3 py-2 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Производственный персонал</Badge>
                  <span className="text-xs font-mono text-muted-foreground">production</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Заказы (смена статусов), операции, дефекты, отчёты, справочники (просмотр)</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 card-shadow">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Настройка справочников</h2>
            <p className="text-sm text-muted-foreground mb-3">Изменение и пополнение нормативно-справочной информации (типы изделий, материалы, услуги, статусы и т.д.).</p>
            <Button variant="outline" onClick={() => navigate('/directories')}>Перейти к справочникам</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
