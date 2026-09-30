import { useEffect, useState } from 'react';

import { Bar, Card, EmptyState, GradeFilter, ScreenLoader } from '../components/ui';
import { api } from '../lib/api';
import type { RiskStudent } from '../types';

export function TeacherRiskPage(): JSX.Element {
  const [students, setStudents] = useState<RiskStudent[] | null>(null);
  const [grade, setGrade] = useState<number | null>(null);

  useEffect(() => {
    setStudents(null);
    void (async () => {
      try {
        const query = grade === null ? '' : `?grades=${grade}`;
        const data = await api.get<{ students: RiskStudent[] }>(`/tutor/risk${query}`);
        setStudents(data.students);
      } catch {
        setStudents([]);
      }
    })();
  }, [grade]);

  if (students === null) return <ScreenLoader label="Загрузка группы риска" />;

  if (students.length === 0) {
    return (
      <Card title="Группа риска">
        <EmptyState
          title="Кто систематически застревает — не найден"
          description="В список попадают ученики с тремя и более нерешёнными задачами за последние 7 дней."
        />
      </Card>
    );
  }

  return (
    <div className="stack">
      <GradeFilter grades={[5, 6, 7, 8, 9, 10, 11]} value={grade} onChange={setGrade} />
      <p className="muted">
        Ученики с тремя и более нерешёнными задачами за последние 7 дней. Стоит обсудить темы на
        уроке и поддержать учеников.
      </p>
      {students.map((student) => (
        <Card key={student.user_id} title={student.name} hint={`${student.grade} класс`}>
          <div className="stack">
            <Bar
              label="Нерешённых задач за неделю"
              value={student.unsolved}
              max={5}
              hint={String(student.unsolved)}
            />
            {student.stuck_topics.length > 0 && (
              <p className="muted">Темы: {student.stuck_topics.join(', ')}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
