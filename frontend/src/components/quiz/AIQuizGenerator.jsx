import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { quizAPI, getApiErrorMessage } from '../../utils/api.js';

const initialForm = {
  difficulty: 'medium',
  questionCount: 15
};

export default function AIQuizGenerator({ onGenerated }) {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: '', message: '' });
  const fileInputRef = useRef(null);

  async function submit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: '', message: '' });

    try {
      const response = await generateFromFiles();
      setStatus({ loading: false, error: '', message: 'AI quiz generated and added to your arena.' });
      setForm(initialForm);
      setFiles([]);
      onGenerated?.(response.data.quiz);
    } catch (err) {
      setStatus({ loading: false, error: getApiErrorMessage(err, 'Unable to generate AI quiz'), message: '' });
    }
  }

  function buildFilesFormData() {
    const formData = new FormData();
    formData.append('topic', '');
    formData.append('category', 'Subject');
    formData.append('difficulty', form.difficulty);
    formData.append('questionCount', String(form.questionCount));
    formData.append('variationHint', `files-${Date.now()}`);

    files.forEach((file) => {
      formData.append('documents', file);
    });

    return formData;
  }

  function generateFromFiles() {
    return quizAPI.generateQuizFromFiles(buildFilesFormData());
  }

  function handleFilesSelected(event) {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  }

  return (
    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="ai-generator-card rounded-[28px] p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-cyan-300">Customize</p>
          <h3 className="mt-2 text-2xl font-black text-white">Generate Fresh Questions</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Add files, keep the difficulty at medium, choose the number of questions, and start your quiz.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr_0.6fr_auto]">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-2xl border border-emerald-400/35 bg-emerald-400/10 px-4 py-4 text-left text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-400/15">
          {files.length > 0 ? `${files.length} file(s) selected` : 'Add files'}
        </button>
        <select value={form.difficulty} onChange={(e) => setForm((current) => ({ ...current, difficulty: e.target.value }))} className="arena-input rounded-2xl border-emerald-400/25 px-4 py-4 text-white">
          <option value="medium">Medium</option>
        </select>
        <input type="number" min="5" max="20" value={form.questionCount} onChange={(e) => setForm((current) => ({ ...current, questionCount: Number(e.target.value) }))} className="arena-input rounded-2xl border-emerald-400/25 px-4 py-4 text-white" />
        <button type="submit" disabled={status.loading || files.length === 0} className="rounded-2xl bg-emerald-400 px-5 py-4 font-bold text-slate-950 shadow-[0_18px_40px_rgba(74,222,128,0.22)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
          {status.loading ? 'Generating...' : 'Create'}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {files.length > 0 && <p className="text-sm text-emerald-200">{files.length} file(s) ready for quiz generation</p>}
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" multiple onChange={handleFilesSelected} className="hidden" />

      {status.message && <p className="mt-4 text-sm text-emerald-300">{status.message}</p>}
      {status.error && <p className="mt-4 text-sm text-rose-300">{status.error}</p>}
    </motion.form>
  );
}
