// src/utils/resumeToken.js
import fs from 'fs';
import path from 'path';

const TOKEN_FILE = path.resolve(process.cwd(), 'resumeToken.json');

/**
 * Попробуем прочитать последний сохранённый Resume Token.
 * Если файл не найден или битый — вернём null.
 */
export function loadResumeToken() {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
    const { token } = JSON.parse(raw);
    return token;
  } catch {
    return null;
  }
}

/**
 * Сохраняем Resume Token (changeStream._id) после успешной обработки.
 */
export function saveResumeToken(token) {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token }), 'utf-8');
  } catch (err) {
    console.error('Не удалось сохранить resume token:', err);
  }
}
