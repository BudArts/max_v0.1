import { describe, expect, it } from 'vitest';

import { tasksWord, formatDate, formatDateTime, formatInitials, plural, truncate } from './format';

describe('plural', () => {
  it('выбирает форму по правилам русского языка', () => {
    expect(plural(1, 'задача', 'задачи', 'задач')).toBe('задача');
    expect(plural(2, 'задача', 'задачи', 'задач')).toBe('задачи');
    expect(plural(5, 'задача', 'задачи', 'задач')).toBe('задач');
    expect(plural(11, 'задача', 'задачи', 'задач')).toBe('задач');
    expect(plural(21, 'задача', 'задачи', 'задач')).toBe('задача');
    expect(plural(104, 'задача', 'задачи', 'задач')).toBe('задачи');
  });

  it('формирует счётчик задач', () => {
    expect(tasksWord(0)).toBe('0 задач');
    expect(tasksWord(3)).toBe('3 задачи');
  });
});

describe('formatInitials', () => {
  it('показывает фамилию с инициалом имени', () => {
    expect(formatInitials('Мария', 'Ковалёва')).toBe('Ковалёва М.');
  });

  it('обрабатывает неполные данные', () => {
    expect(formatInitials(null, 'Ковалёва')).toBe('Ковалёва');
    expect(formatInitials('Мария', null)).toBe('Мария');
    expect(formatInitials(null, null)).toBe('Пользователь');
  });
});

describe('formatDate', () => {
  it('возвращает дату в русском формате', () => {
    expect(formatDate('2026-09-29T10:00:00Z')).toMatch(/^\d{1,2} [а-яё]+ \d{4}$/);
  });

  it('не падает на пустых и некорректных значениях', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('не дата')).toBe('');
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime('не дата')).toBe('');
  });
});

describe('truncate', () => {
  it('сохраняет короткий текст без изменений', () => {
    expect(truncate('Короткий текст', 140)).toBe('Короткий текст');
  });

  it('обрезает длинный текст и ставит многоточие', () => {
    const result = truncate('а'.repeat(50), 20);
    expect(result).toHaveLength(20);
    expect(result.endsWith('…')).toBe(true);
  });
});
