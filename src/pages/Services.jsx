import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionReveal from '../components/SectionReveal';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const SERVICES = [
  {
    id: '01',
    title: 'Workflow Automation',
    description:
      'Replace manual, repetitive tasks with AI-driven workflows that execute faster, more accurately, and around the clock. From lead processing to invoice handling — we automate the grind so your team can focus on high-value work.',
    capabilities: ['Process mapping & redesign', 'AI agent deployment', 'Real-time monitoring'],
  },
  {
    id: '02',
    title: 'Systems Integration',
    description:
      'Connect the tools your brand relies on into a unified, intelligent ecosystem. No more data silos, no more copy-pasting between platforms. One source of truth, accessible everywhere.',
    capabilities: ['API orchestration', 'Data pipeline architecture', 'Cross-platform sync'],
  },
  {
    id: '03',
    title: 'Intelligent Reporting',
    description:
      'Transform raw operational data into actionable intelligence. Our AI surfaces the metrics that matter, identifies anomalies, and delivers insights before you have to ask for them.',
    capabilities: ['Automated dashboards', 'Anomaly detection', 'Predictive analytics'],
  },
  {
    id: '04',
    title: 'Custom AI Solutions',
    description:
      'When off-the-shelf won\'t cut it, we build bespoke AI systems tailored to your exact operational reality. From natural language interfaces to decision-support engines — purpose-built for your brand.',
    capabilities: ['Bespoke model development', 'NLP interfaces', 'Decision automation'],
  },
];

const PROCESS_STEPS = [
  {
    phase: 'Phase I',
    title: 'Discover',
    description:
      'We immerse ourselves in your operations. We map every workflow, identify every friction point, and understand the human context behind each process.',
  },
  {
    phase: 'Phase II',
    title: 'Architect',
    description:
      'We design an intelligent automation blueprint — the systems, integrations, and AI agents that will transform your operations from the ground up.',
  },
  {
    phase: 'Phase III',
    title: 'Automate',
    description:
      'We build, deploy, and refine. Every system is tested rigorously, deployed progressively, and optimised continuously as it learns from real-world data.',
  },
];

export default function Services() {
  return (
    <motion.div {...pageTransition}>
      {/* ─── HERO ─── */}
      <section className="pt-40 pb-24 md:pt-52 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <p className="label-upper text-gold mb-6">Services</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h1 className="heading-display text-5xl sm:text-6xl md:text-7xl text-marble leading-tight max-w-4xl">
              Operations, <span className="text-gold italic">reborn</span>
            </h1>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-stone text-lg mt-8 max-w-2xl leading-relaxed">
              We don&rsquo;t just automate your existing workflows — we rethink them.
              Each engagement produces intelligent systems that learn, adapt, and
              compound in value over time.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ─── SERVICE CARDS ─── */}
      <section className="py-24 md:py-32 px-6 border-t border-marble/5">
        <div className="max-w-7xl mx-auto space-y-px">
          {SERVICES.map((service, i) => (
            <SectionReveal key={service.id} delay={i * 0.08}>
              <div className="group bg-black hover:bg-obsidian transition-all duration-500 p-8 md:p-12 border-b border-marble/5 last:border-b-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  <div className="md:col-span-1">
                    <span className="heading-display text-3xl text-marble/10 group-hover:text-gold/30 transition-colors duration-500">
                      {service.id}
                    </span>
                  </div>

                  <div className="md:col-span-4">
                    <h3 className="heading-display text-2xl md:text-3xl text-marble group-hover:text-gold transition-colors duration-500">
                      {service.title}
                    </h3>
                  </div>

                  <div className="md:col-span-5">
                    <p className="text-stone text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <ul className="space-y-2">
                      {service.capabilities.map((cap) => (
                        <li key={cap} className="text-stone/60 text-xs flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gold/50 shrink-0" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section className="py-32 md:py-44 px-6 bg-obsidian">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="label-upper text-gold mb-4">How We Work</p>
            <h2 className="heading-display text-4xl md:text-5xl text-marble mb-20">
              The Process
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {PROCESS_STEPS.map((step, i) => (
              <SectionReveal key={step.phase} delay={i * 0.15}>
                <div className="relative">
                  {i < PROCESS_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-marble/10 to-transparent" />
                  )}
                  <p className="label-upper text-gold/60 mb-4">{step.phase}</p>
                  <h3 className="heading-display text-3xl md:text-4xl text-marble mb-4">
                    {step.title}
                  </h3>
                  <p className="text-stone text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 md:py-44 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <SectionReveal>
            <p className="label-upper text-gold mb-6">Next Step</p>
          </SectionReveal>
          <SectionReveal delay={0.1}>
            <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-marble mb-8">
              Ready to Be Reborn?
            </h2>
          </SectionReveal>
          <SectionReveal delay={0.2}>
            <p className="text-stone text-lg mb-12 max-w-lg mx-auto leading-relaxed">
              Every transformation begins with a conversation. Tell us where you
              are, and we&rsquo;ll show you what&rsquo;s possible.
            </p>
          </SectionReveal>
          <SectionReveal delay={0.3}>
            <Link to="/contact" className="btn-gold">
              Book a Demo
            </Link>
          </SectionReveal>
        </div>
      </section>
    </motion.div>
  );
}
