import { promisify } from 'util';
import { execFile } from 'child_process';

const execFileAsync = promisify(execFile);

function getOllamaBaseUrls() {
  const configured = (process.env.OLLAMA_BASE_URL || '').trim();
  const urls = [configured, 'http://127.0.0.1:11434', 'http://localhost:11434']
    .filter(Boolean);

  return [...new Set(urls)];
}

function getOllamaModel() {
  return (process.env.OLLAMA_MODEL || 'tinyllama:latest').trim();
}

function getOllamaExecutable() {
  return (
    (process.env.OLLAMA_PATH || '').trim()
    || `${process.env.LOCALAPPDATA || ''}\\Programs\\Ollama\\ollama.exe`
    || 'ollama'
  );
}

function buildJsonSchema(questionCount) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      questions: {
        type: 'array',
        minItems: questionCount,
        maxItems: questionCount,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            text: { type: 'string' },
            options: {
              type: 'array',
              minItems: 4,
              maxItems: 4,
              items: { type: 'string' }
            },
            correctOptionIndex: { type: 'integer', minimum: 0, maximum: 3 },
            explanation: { type: 'string' }
          },
          required: ['text', 'options', 'correctOptionIndex', 'explanation']
        }
      }
    },
    required: ['title', 'description', 'questions']
  };
}

function sanitizeQuestion(question, index) {
  const rawOptions = Array.isArray(question?.options) ? question.options : [];
  const options = rawOptions
    .map((option) => String(option ?? '').trim())
    .filter(Boolean)
    .slice(0, 4);

  if (options.length !== 4) {
    throw new Error(`Ollama returned an invalid option set for question ${index + 1}`);
  }

  const correctOptionIndex = Number(question?.correctOptionIndex);
  if (!Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > 3) {
    throw new Error(`Ollama returned an invalid correct option index for question ${index + 1}`);
  }

  return {
    text: String(question?.text ?? '').trim(),
    options,
    correctOptionIndex,
    explanation: String(question?.explanation ?? '').trim()
  };
}

function sanitizeQuizPayload(payload, questionCount) {
  if (!payload || !Array.isArray(payload.questions) || payload.questions.length !== questionCount) {
    throw new Error('Ollama returned an invalid quiz payload');
  }

  const questions = payload.questions.map((question, index) => sanitizeQuestion(question, index));
  const title = String(payload.title ?? '').trim();
  const description = String(payload.description ?? '').trim();

  if (!title || !description || questions.some((question) => !question.text)) {
    throw new Error('Ollama returned incomplete quiz content');
  }

  return {
    title,
    description,
    questions
  };
}

function normalizeQuestionText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ensureUniqueQuestions(questions, questionCount, excludeQuestionTexts = []) {
  const seen = new Set(excludeQuestionTexts.map(normalizeQuestionText).filter(Boolean));
  const uniqueQuestions = [];

  for (const question of questions) {
    const key = normalizeQuestionText(question.text);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniqueQuestions.push(question);
  }

  if (uniqueQuestions.length < questionCount) {
    throw new Error('AI generated repeated questions. Retrying with a new variation.');
  }

  return uniqueQuestions.slice(0, questionCount);
}

function buildPrompt({
  topic,
  category,
  difficulty,
  questionCount,
  sourceMaterial,
  variationHint,
  excludeQuestionTexts,
  attempt
}) {
  return [
    'Generate an accurate multiple-choice quiz in valid JSON.',
    `Topic: ${topic || 'Study material provided by the user'}.`,
    `Category: ${category}.`,
    `Difficulty: ${difficulty}.`,
    `Question count: ${questionCount}.`,
    variationHint ? `Variation hint: ${variationHint}.` : '',
    attempt > 1 ? `Attempt: ${attempt}. Create a substantially different set from previous attempts.` : '',
    'Rules:',
    '- Create exactly the requested number of questions.',
    '- Each question must have exactly 4 answer options.',
    '- Only one option can be correct.',
    '- Keep wording clear and playable.',
    '- Avoid duplicate questions and duplicate answer options.',
    '- Make the title and description engaging for a quiz card.',
    excludeQuestionTexts.length > 0
      ? [
          'Do not repeat any of these previous questions:',
          excludeQuestionTexts.slice(0, 80).map((text, index) => `${index + 1}. ${text}`).join('\n')
        ].join('\n')
      : '',
    sourceMaterial
      ? [
          'Use the following source material as the main basis for the quiz.',
          'Prefer facts that are clearly supported by the provided material.',
          'Source material:',
          sourceMaterial.slice(0, 18000)
        ].join('\n')
      : ''
  ]
    .filter(Boolean)
    .join('\n');
}

async function callOllama({ prompt, questionCount }) {
  const model = getOllamaModel();
  const connectionErrors = [];

  for (const baseUrl of getOllamaBaseUrls()) {
    let response;

    try {
      response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          format: buildJsonSchema(questionCount),
          options: {
            temperature: 0.7
          }
        })
      });
    } catch (error) {
      connectionErrors.push(`${baseUrl}: ${error.message}`);
      continue;
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Ollama request failed for model "${model}" at ${baseUrl}: ${message}`);
    }

    const data = await response.json();
    if (!data.response) {
      throw new Error(`Ollama did not return quiz content for model "${model}" at ${baseUrl}`);
    }

    return JSON.parse(data.response);
  }

  throw new Error(
    `Cannot reach Ollama over HTTP. Checked ${getOllamaBaseUrls().join(', ')}. ${connectionErrors.join(' | ')}`
  );
}

async function callOllamaCli({ prompt }) {
  const model = getOllamaModel();
  const executable = getOllamaExecutable();

  try {
    const { stdout } = await execFileAsync(executable, ['run', model, prompt], {
      maxBuffer: 10 * 1024 * 1024,
      windowsHide: true
    });

    const cleaned = stdout
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(
      `Ollama CLI fallback failed using "${executable}". ${error.message}`
    );
  }
}

export async function generateQuizWithAI({
  topic,
  category,
  difficulty,
  questionCount,
  sourceMaterial = '',
  variationHint = '',
  excludeQuestionTexts = []
}) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const prompt = buildPrompt({
      topic,
      category,
      difficulty,
      questionCount,
      sourceMaterial,
      variationHint,
      excludeQuestionTexts,
      attempt
    });

    try {
      let parsed;
      try {
        parsed = await callOllama({ prompt, questionCount });
      } catch (httpError) {
        parsed = await callOllamaCli({ prompt });
      }

      const sanitized = sanitizeQuizPayload(parsed, questionCount);
      const uniqueQuestions = ensureUniqueQuestions(
        sanitized.questions,
        questionCount,
        excludeQuestionTexts
      );

      return {
        ...sanitized,
        questions: uniqueQuestions
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to generate a unique quiz right now');
}
