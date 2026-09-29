import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Alert, Button, Card } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { useSession } from '../state/session';
import type { Role, UserView } from '../types';

const CHOICES: { role: Role; title: string; description: string }[] = [
  {
    role: 'student',
    title: 'Ученик',
    description: 'Решаю задачи с ИИ-наставником в чате бота',
  },
  {
    role: 'parent',
    title: 'Родитель',
    description: 'Недельный дайджест и прогресс моего ребёнка',
  },
  {
    role: 'teacher',
    title: 'Педагог',
    description: 'Проблемные темы классов и группа риска',
  },
];

export function RoleChoicePage(): JSX.Element {
  const { setUser } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(role: Role): Promise<void> {
    setBusy(role);
    setError(null);
    try {
      const updated = await api.patch<UserView>('/me/role', { role });
      setUser(updated);
      navigate('/', { replace: true });
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Не удалось сохранить роль');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="stack">
      <Card title="Добро пожаловать в «Учусь.ai»" hint="Выберите роль, чтобы настроить кабинет">
        <div className="stack">
          {CHOICES.map((choice) => (
            <Button
              key={choice.role}
              block
              loading={busy === choice.role}
              disabled={busy !== null}
              onClick={() => void choose(choice.role)}
            >
              {choice.title} — {choice.description}
            </Button>
          ))}
          {error && <Alert tone="danger">{error}</Alert>}
          <p className="muted small">
            Роль влияет только на содержимое кабинета. Ученики решают задачи в чате с ботом,
            родители и педагоги работают здесь.
          </p>
        </div>
      </Card>
    </div>
  );
}
