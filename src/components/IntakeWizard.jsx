import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { INTAKE_WIZARDS, SOFTWARE_OPTIONS } from '../data/intake';

const EASE = [0.16, 1, 0.3, 1];

const SLIDE = {
  enter: (direction) => ({ opacity: 0, x: direction * 36 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction * -36 }),
};

const PERIODS = [
  { id: 'month', label: 'per month' },
  { id: 'year', label: 'per year' },
];

const resolvePrompt = (step, answers) =>
  typeof step.prompt === 'function' ? step.prompt(answers) : step.prompt;

function isAnswered(step, value) {
  switch (step.kind) {
    case 'text':
    case 'longtext':
      return Boolean(value?.trim());
    case 'choice':
      return Boolean(value);
    case 'spend':
      return Boolean(value?.unsure || value?.amount);
    case 'stack':
      return (value?.length ?? 0) > 0;
    default: {
      const exhaustive = step.kind;
      throw new Error(`Unhandled intake step kind: ${exhaustive}`);
    }
  }
}

function formatAnswer(step, value) {
  if (!isAnswered(step, value)) return 'Skipped';
  switch (step.kind) {
    case 'text':
    case 'longtext':
    case 'choice':
      return value.trim ? value.trim() : value;
    case 'spend':
      return value.unsure
        ? 'Not sure'
        : `$${Number(value.amount).toLocaleString('en-AU')} ${value.period === 'year' ? 'per year' : 'per month'}`;
    case 'stack':
      return value.join(', ');
    default: {
      const exhaustive = step.kind;
      throw new Error(`Unhandled intake step kind: ${exhaustive}`);
    }
  }
}

function SpendField({ id, value, onChange }) {
  const spend = value ?? { amount: '', period: 'month', unsure: false };
  const update = (patch) => onChange({ ...spend, ...patch });

  return (
    <div className="intake-spend">
      <div className={`intake-spend__amount${spend.unsure ? ' intake-spend__amount--off' : ''}`}>
        <span aria-hidden="true">$</span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          step="50"
          placeholder="0"
          value={spend.amount}
          disabled={spend.unsure}
          onChange={(event) => update({ amount: event.target.value })}
          autoFocus
        />
      </div>
      <div className="intake-spend__periods" role="group" aria-label="Billing period">
        {PERIODS.map((period) => (
          <button
            key={period.id}
            type="button"
            className={`intake-chip${spend.period === period.id && !spend.unsure ? ' intake-chip--on' : ''}`}
            aria-pressed={spend.period === period.id && !spend.unsure}
            disabled={spend.unsure}
            onClick={() => update({ period: period.id })}
          >
            {period.label}
          </button>
        ))}
        <button
          type="button"
          className={`intake-chip${spend.unsure ? ' intake-chip--on' : ''}`}
          aria-pressed={spend.unsure}
          onClick={() => update({ unsure: !spend.unsure })}
        >
          Not sure
        </button>
      </div>
    </div>
  );
}

function StackField({ value, onChange }) {
  const selected = value ?? [];
  const [draft, setDraft] = useState('');
  const custom = selected.filter((tool) => !SOFTWARE_OPTIONS.includes(tool));

  const toggle = (tool) =>
    onChange(selected.includes(tool) ? selected.filter((t) => t !== tool) : [...selected, tool]);

  const addDraft = () => {
    const tool = draft.trim();
    if (!tool) return;
    if (!selected.some((t) => t.toLowerCase() === tool.toLowerCase())) {
      onChange([...selected, tool]);
    }
    setDraft('');
  };

  return (
    <div className="intake-stack">
      <div className="intake-stack__chips" role="group" aria-label="Software in your stack">
        {[...SOFTWARE_OPTIONS, ...custom].map((tool) => {
          const on = selected.includes(tool);
          return (
            <button
              key={tool}
              type="button"
              className={`intake-chip${on ? ' intake-chip--on' : ''}`}
              aria-pressed={on}
              onClick={() => toggle(tool)}
            >
              {tool}
            </button>
          );
        })}
      </div>
      <div className="intake-stack__add">
        <input
          type="text"
          className="intake-wizard__input"
          placeholder="Add another tool"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.stopPropagation();
              addDraft();
            }
          }}
          aria-label="Add another tool"
        />
        <button type="button" className="btn-ghost" onClick={addDraft}>
          Add
        </button>
      </div>
    </div>
  );
}

function StepField({ step, value, onChange, onNext }) {
  const id = `intake-${step.id}`;

  switch (step.kind) {
    case 'text':
      return (
        <input
          id={id}
          type="text"
          className="intake-wizard__input"
          placeholder={step.placeholder}
          autoComplete={step.autoComplete}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onNext();
            }
          }}
          autoFocus
        />
      );
    case 'longtext':
      return (
        <textarea
          id={id}
          className="intake-wizard__input intake-wizard__input--area"
          placeholder={step.placeholder}
          rows={5}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              onNext();
            }
          }}
          autoFocus
        />
      );
    case 'choice':
      return (
        <div className="intake-choices" role="radiogroup" aria-labelledby={`${id}-prompt`}>
          {step.options.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={value === option}
              className={`intake-choice${value === option ? ' intake-choice--on' : ''}`}
              onClick={() => {
                onChange(option);
                window.setTimeout(() => onNext(option), 180);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      );
    case 'spend':
      return <SpendField id={id} value={value} onChange={onChange} />;
    case 'stack':
      return <StackField value={value} onChange={onChange} />;
    default: {
      const exhaustive = step.kind;
      throw new Error(`Unhandled intake step kind: ${exhaustive}`);
    }
  }
}

function WizardDialog({ wizard, onClose }) {
  const lenis = useLenis();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const { steps } = wizard;
  const step = steps[index];
  const isLast = index === steps.length - 1;
  const progress = done ? 100 : (index / steps.length) * 100;
  const firstName = (answers.name ?? '').trim().split(/\s+/)[0];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, lenis]);

  const setAnswer = (value) => {
    setError('');
    setAnswers((current) => ({ ...current, [step.id]: value }));
  };

  // A choice step passes its value directly, because state has not updated yet.
  const goNext = (pickedValue) => {
    const value = pickedValue ?? answers[step.id];
    if (step.required && !isAnswered(step, value)) {
      setError('We need this one to tailor the first conversation.');
      document.getElementById(`intake-${step.id}`)?.focus();
      return;
    }
    setError('');
    setDirection(1);
    if (isLast) {
      setDone(true);
    } else {
      setIndex((current) => current + 1);
    }
  };

  const goBack = () => {
    setError('');
    setDirection(-1);
    setIndex((current) => Math.max(0, current - 1));
  };

  return (
    <div className="booking-modal" role="presentation" data-lenis-prevent>
      <motion.button
        type="button"
        className="booking-modal__backdrop"
        aria-label="Close intake form"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${wizard.eyebrow} intake`}
        className="intake-wizard"
        data-lenis-prevent
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <button type="button" className="booking-modal__close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <p className="section-eyebrow mb-3 pr-12">{wizard.eyebrow}</p>
        {index === 0 && !done && <p className="intake-wizard__intro">{wizard.intro}</p>}

        <div className="intake-wizard__card">
          {done ? (
            <motion.div
              className="intake-wizard__done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <img src="/brand/renatus-emblem.svg" alt="" width="40" height="40" />
              <h2 className="intake-wizard__prompt">
                Thanks{firstName ? `, ${firstName}` : ''}. <em>We have what we need.</em>
              </h2>
              <p className="intake-wizard__helper">
                We will review your answers and come back with an honest view on where to start.
              </p>
              <dl className="intake-wizard__summary">
                {steps.map((s) => (
                  <div key={s.id}>
                    <dt>{resolvePrompt(s, answers)}</dt>
                    <dd>{formatAnswer(s, answers[s.id])}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className="btn-primary mt-8 self-start" onClick={onClose}>
                Close
              </button>
            </motion.div>
          ) : (
            <>
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step.id}
                  className="intake-wizard__step"
                  custom={direction}
                  variants={SLIDE}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  <label
                    id={`intake-${step.id}-prompt`}
                    htmlFor={`intake-${step.id}`}
                    className="intake-wizard__prompt"
                  >
                    {resolvePrompt(step, answers)}
                    {!step.required && <span className="intake-wizard__optional">Optional</span>}
                  </label>
                  {step.helper && <p className="intake-wizard__helper">{step.helper}</p>}
                  <StepField
                    step={step}
                    value={answers[step.id]}
                    onChange={setAnswer}
                    onNext={goNext}
                  />
                  {error && (
                    <p className="enquiry-error mt-3" role="alert">
                      {error}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="intake-wizard__nav">
                {index > 0 ? (
                  <button type="button" className="intake-wizard__back" onClick={goBack}>
                    &larr; Back
                  </button>
                ) : (
                  <span />
                )}
                {(step.kind !== 'choice' || answers[step.id]) && (
                  <button type="button" className="btn-primary" onClick={() => goNext()}>
                    {isLast ? 'Submit' : 'Next'}
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="intake-wizard__progress">
          <div
            className="intake-wizard__progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={done ? steps.length : index}
            aria-label="Intake progress"
          >
            <motion.span
              className="intake-wizard__progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.45, ease: EASE }}
            />
          </div>
          <p>{done ? 'Complete' : `Question ${index + 1} of ${steps.length}`}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function IntakeWizard({ wizardId, onClose }) {
  const wizard = wizardId ? INTAKE_WIZARDS[wizardId] : null;

  return createPortal(
    <AnimatePresence>
      {wizard && <WizardDialog key={wizardId} wizard={wizard} onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  );
}
