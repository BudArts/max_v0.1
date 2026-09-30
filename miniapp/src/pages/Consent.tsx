import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Alert, Button, Card, Pill } from '../components/ui';
import { useSession } from '../state/session';
import { formatDate } from '../lib/format';

export function ConsentPage(): JSX.Element {
  const { consents, acceptConsent, revokeConsent, granted } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAccepted, setAiAccepted] = useState(granted('ai_processing'));

  const service = consents.find((item) => item.purpose === 'service');

  async function submit(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await acceptConsent('service');
      if (aiAccepted) await acceptConsent('ai_processing');
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Не удалось сохранить согласие');
    } finally {
      setBusy(false);
    }
  }

  async function withdrawAi(): Promise<void> {
    setBusy(true);
    try {
      await revokeConsent('ai_processing');
      setAiAccepted(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <Card title="Согласие на обработку персональных данных">
        <div className="stack">
          <p className="muted">
            «Учусь.ai» помогает ученикам 5–11 классов решать задачи по математике и физике с
            ИИ-наставником. Без согласия обработка персональных данных невозможна.
          </p>
          <div className="divider" />
          <dl className="stack">
            <div>
              <dt className="field__label">Какие данные обрабатываются</dt>
              <dd className="muted">
                Идентификатор профиля MAX, имя и фамилия из профиля, класс ученика, содержание учебных
                диалогов с наставником, служебные отметки о действиях.
              </dd>
            </div>
            <div>
              <dt className="field__label">Цель обработки</dt>
              <dd className="muted">
                Работа ИИ-наставника, ведение истории задач, аналитика для педагогов и недельные
                дайджесты для родителей.
              </dd>
            </div>
            <div>
              <dt className="field__label">Где хранятся данные</dt>
              <dd className="muted">
                На территории Российской Федерации. Телефон и электронная почта — в зашифрованном виде.
              </dd>
            </div>
            <div>
              <dt className="field__label">Срок действия</dt>
              <dd className="muted">
                До достижения цели обработки или до отзыва. Отозвать согласие можно в разделе
                «Персональные данные».
              </dd>
            </div>
          </dl>
          {service && service.granted && (
            <Pill tone="success">Согласие предоставлено {formatDate(service.granted_at)}</Pill>
          )}
        </div>
      </Card>

      <Card title="ИИ-наставник" hint="Необходимо для работы бота">
        <div className="stack">
          <p className="muted">
            Диалоги обрабатывает модель GigaChat: она задаёт наводящие вопросы и не выдаёт готовые
            ответы. Перед передачей из текста автоматически удаляются фамилии, имена, телефоны и
            адреса почты. От согласия можно отказаться в любой момент — бот перестанет разбирать
            задачи.
          </p>
          {granted('ai_processing') ? (
            <div className="row">
              <Pill tone="success">Разрешено</Pill>
              <Button variant="ghost" small onClick={() => void withdrawAi()} disabled={busy}>
                Отключить
              </Button>
            </div>
          ) : (
            <label className="checklist">
              <input
                type="checkbox"
                checked={aiAccepted}
                onChange={(event) => setAiAccepted(event.target.checked)}
              />
              <span className="muted">Разрешить обработку задач моделью GigaChat</span>
            </label>
          )}
        </div>
      </Card>

      {error && <Alert tone="danger">{error}</Alert>}

      <Button block loading={busy} onClick={() => void submit()} disabled={granted('service')}>
        {granted('service') ? 'Согласие уже предоставлено' : 'Согласиться и продолжить'}
      </Button>

      <p className="muted small">
        Продолжая, вы подтверждаете, что ознакомились с документами: <Link to="/legal/consent_processing">Согласие на обработку</Link>,{' '}
        <Link to="/legal/privacy_policy">Политика обработки персональных данных</Link>,{' '}
        <Link to="/legal/terms">Правила использования сервиса</Link>.
      </p>
    </div>
  );
}
