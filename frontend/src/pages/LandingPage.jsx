import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="landing-shell relative min-h-screen overflow-hidden">
      <div className="landing-shape landing-shape-left"></div>
      <div className="landing-shape landing-shape-right"></div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 md:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="space-y-7">
            <div className="space-y-5">
              <h1 className="landing-title text-white">
                BrainBuzz
                <span className="block text-cyan-300">Quiz Arena</span>
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Play smart quiz battles, explore new missions, and generate fresh challenges with AI in one immersive arena.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/register" className="rounded-2xl bg-cyan-400 px-6 py-4 text-center text-base font-bold text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.28)] transition-transform hover:-translate-y-0.5">
                Start Playing
              </Link>
              <Link to="/login" className="rounded-2xl border border-white/14 bg-white/6 px-6 py-4 text-center text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                I Have an Account
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.12 }} className="landing-showcase rounded-[36px] p-6 md:p-8">
            <div className="landing-showcase-grid">
              <div className="showcase-card showcase-card-headset">
                <span className="showcase-outline-circle"></span>
                <span className="showcase-headband"></span>
                <span className="showcase-ear showcase-ear-left"></span>
                <span className="showcase-ear showcase-ear-right"></span>
                <span className="showcase-wave"></span>
              </div>

              <div className="showcase-card showcase-card-controller">
                <span className="showcase-controller-body"></span>
                <span className="showcase-stick showcase-stick-left"></span>
                <span className="showcase-stick showcase-stick-right"></span>
                <span className="showcase-button showcase-button-a"></span>
                <span className="showcase-button showcase-button-b"></span>
                <span className="showcase-button showcase-button-c"></span>
                <span className="showcase-button showcase-button-d"></span>
              </div>

              <div className="showcase-card showcase-card-level">
                <span className="showcase-level-frame"></span>
                <span className="showcase-level-text">LEVEL</span>
                <span className="showcase-level-up">UP</span>
              </div>

              <div className="showcase-card showcase-card-text">
                <div className="showcase-text-stack">
                  <p className="showcase-play">PLAY</p>
                  <p className="showcase-sub">GAME ON</p>
                  <p className="showcase-sub-alt">GAME OVER</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
