import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AGE_RATING_OPTIONS,
  COUNTRY_CODES,
  DEFAULT_ANSWERS,
  DISTRIBUTION_GOAL_OPTIONS,
  ENCRYPTION_OPTIONS,
  ENROLLMENT_STATUS_OPTIONS,
  HEALTH_OPTIONS,
  LAUNCH_WINDOW_OPTIONS,
  MONETIZATION_OPTIONS,
  PAID_APPS_STATUS_OPTIONS,
  PRIMARY_CATEGORIES,
  PRIMARY_LOCALES,
  PUBLISHING_ACCOUNT_OPTIONS,
  REGULATED_OPTIONS,
  SOCIAL_AI_OPTIONS,
  STEPS,
  STORAGE_KEY,
  TARGET_REGIONS,
  TRACKING_OPTIONS,
  USER_DATA_OPTIONS,
  createUuidV4,
  formatKeywords,
  formatPhoneToE164,
  labelForOption,
  labelsForValues,
} from '../data/appStoreIntake';

const EASE = [0.16, 1, 0.3, 1];
const MAX_FILES = 10;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_BYTES = 100 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_RE = /^\+[1-9]\d{6,14}$/;

const YES_NO_UNSURE = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure yet' },
];

async function safeParseJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function isHttpUrl(raw) {
  try {
    const u = new URL(String(raw || '').trim());
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function loadDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      sessionId: parsed.sessionId || createUuidV4(),
      stepIndex: Number.isInteger(parsed.stepIndex) ? Math.min(Math.max(parsed.stepIndex, 0), STEPS.length - 1) : 0,
      maxVisited: Number.isInteger(parsed.maxVisited) ? parsed.maxVisited : 0,
      answers: { ...DEFAULT_ANSWERS, ...(parsed.answers || {}) },
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      sendClientCopy: typeof parsed.sendClientCopy === 'boolean' ? parsed.sendClientCopy : true,
    };
  } catch {
    return null;
  }
}

function FieldBadge({ required }) {
  return required ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-forest/10 text-forest">
      Needed now
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-cloud text-graphite">
      Optional — can finalize during build
    </span>
  );
}

function FieldLabel({ htmlFor, label, required, badge = true, helper, helperTone }) {
  return (
    <div className="mb-2">
      <div className="flex flex-wrap items-center gap-2">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-medium text-forest">
            {label}
          </label>
        ) : (
          <span className="text-sm font-medium text-forest">{label}</span>
        )}
        {badge && <FieldBadge required={required} />}
      </div>
      {helper && (
        <p
          className={`text-xs mt-1 leading-relaxed ${
            helperTone === 'error' ? 'text-red-700 font-medium' : 'text-graphite'
          }`}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

function ChoiceList({ options, value, onChange, name }) {
  return (
    <div className="grid gap-2.5" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const hint = typeof opt === 'string' ? null : opt.hint;
        const checked = value === val;
        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(val)}
            className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
              checked
                ? 'border-forest bg-forest/[0.05] shadow-[0_0_0_1px_var(--color-forest)]'
                : 'border-smoke bg-canvas hover:border-forest/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 h-4 w-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  checked ? 'border-forest bg-forest' : 'border-steel bg-canvas'
                }`}
              >
                {checked && <span className="h-1.5 w-1.5 rounded-full bg-spring" />}
              </span>
              <div>
                <div className="text-sm font-medium text-forest">{label}</div>
                {hint && <div className="text-xs text-graphite mt-0.5 leading-relaxed">{hint}</div>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectList({ options, values, onChange, name }) {
  const selected = values || [];
  const toggle = (opt) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    const isExclusive = typeof opt === 'object' && opt.exclusive;
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
      return;
    }
    if (isExclusive) {
      onChange([val]);
      return;
    }
    const nonExclusive = selected.filter((v) => {
      const match = options.find((o) => (typeof o === 'string' ? o : o.value) === v);
      return !(typeof match === 'object' && match.exclusive);
    });
    onChange([...nonExclusive, val]);
  };

  return (
    <div className="grid gap-2" role="group" aria-label={name}>
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const checked = selected.includes(val);
        return (
          <button
            key={val}
            type="button"
            aria-pressed={checked}
            onClick={() => toggle(opt)}
            className={`text-left px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
              checked
                ? 'border-forest bg-forest/[0.05] shadow-[0_0_0_1px_var(--color-forest)]'
                : 'border-smoke bg-canvas hover:border-forest/50'
            }`}
          >
            <span
              className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${
                checked ? 'border-forest bg-forest text-spring' : 'border-steel bg-canvas text-transparent'
              }`}
            >
              ✓
            </span>
            <span className="text-sm text-forest">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Callout({ tone = 'info', title, children }) {
  const styles =
    tone === 'warn'
      ? 'bg-amber-50 border-amber-300 text-amber-950'
      : 'bg-cloud border-smoke text-forest';
  return (
    <div className={`rounded-xl border p-4 text-xs leading-relaxed ${styles}`}>
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div>{children}</div>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const map = {
    Blocker: 'bg-red-100 text-red-900 border-red-200',
    Requirement: 'bg-forest/10 text-forest border-forest/20',
    'Action Needed': 'bg-amber-100 text-amber-900 border-amber-200',
    Warning: 'bg-orange-100 text-orange-900 border-orange-200',
    'Info (Deferred)': 'bg-cloud text-graphite border-smoke',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        map[severity] || 'bg-cloud text-graphite border-smoke'
      }`}
    >
      {severity}
    </span>
  );
}

const INPUT_CLASS =
  'w-full rounded-xl border border-smoke bg-canvas px-3.5 py-2.5 text-sm text-forest placeholder:text-space focus:outline-none focus:border-forest focus:ring-2 focus:ring-spring/30 transition';

export default function AppStoreIntake() {
  const initial = useMemo(() => loadDraft(), []);
  const [sessionId, setSessionId] = useState(() => initial?.sessionId || createUuidV4());
  const [stepIndex, setStepIndex] = useState(() => initial?.stepIndex || 0);
  const [maxVisited, setMaxVisited] = useState(() => initial?.maxVisited || 0);
  const [answers, setAnswers] = useState(() => initial?.answers || DEFAULT_ANSWERS);
  const [assets, setAssets] = useState(() => initial?.assets || []);
  const [sendClientCopy, setSendClientCopy] = useState(() => initial?.sendClientCopy ?? true);
  // Honeypot stays strictly in component state — NEVER persisted to localStorage
  const [honeypot, setHoneypot] = useState('');

  const [stepError, setStepError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (submitted) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sessionId,
          stepIndex,
          maxVisited,
          answers,
          assets,
          sendClientCopy,
        }),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [sessionId, stepIndex, maxVisited, answers, assets, sendClientCopy, submitted]);

  const update = (field, value) => {
    setStepError('');
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const clearDraft = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSessionId(createUuidV4());
    setStepIndex(0);
    setMaxVisited(0);
    setAnswers(DEFAULT_ANSWERS);
    setAssets([]);
    setSendClientCopy(true);
    setStepError('');
    setUploadError('');
    setSubmitted(null);
  };

  const formattedKeywords = useMemo(() => formatKeywords(answers.keywords), [answers.keywords]);
  const e164Phone = useMemo(
    () => formatPhoneToE164(answers.phoneCountryCode, answers.phoneNumber),
    [answers.phoneCountryCode, answers.phoneNumber],
  );
  const needsApplePaidSetup = useMemo(
    () => (answers.monetization || []).some((m) => ['paid_download', 'iap_digital', 'subscriptions'].includes(m)),
    [answers.monetization],
  );
  const showMonetizationCallout = useMemo(
    () =>
      (answers.monetization || []).some((m) =>
        ['paid_download', 'iap_digital', 'subscriptions', 'external_digital'].includes(m),
      ),
    [answers.monetization],
  );

  const validateStep = (idx) => {
    if (idx === 0) {
      if (!answers.legalName.trim() || !answers.brandName.trim() || !answers.contactName.trim()) {
        return 'Please enter your legal business name, brand name, and primary contact name.';
      }
      if (!EMAIL_RE.test(answers.contactEmail.trim())) {
        return 'Please enter a valid primary contact email address.';
      }
      if (!E164_RE.test(e164Phone)) {
        return 'Please enter a valid mobile or phone number.';
      }
      if (!isHttpUrl(answers.websiteUrl)) {
        return 'Please enter a valid website URL starting with https:// or http://.';
      }
      if (!answers.country.trim()) {
        return 'Please enter your country or region of registration.';
      }
      if (!answers.regulatedIndustries.length) {
        return 'Please select your regulated industry status (or "None of these").';
      }
      if (!answers.publishingAccount) {
        return 'Please select a publishing account preference.';
      }
      if (answers.publishingAccount === 'own' && !answers.enrollmentStatus) {
        return 'Please select your current Apple Developer enrollment status.';
      }
      if (
        answers.publishingAccount === 'own' &&
        answers.accountHolderEmail.trim() &&
        !EMAIL_RE.test(answers.accountHolderEmail.trim())
      ) {
        return 'Please enter a valid Apple Account Holder email address.';
      }
    }
    if (idx === 1) {
      const nameLen = answers.appName.trim().length;
      if (nameLen < 2 || nameLen > 30) {
        return 'Preferred app name must be between 2 and 30 characters.';
      }
      if (!answers.appSummary.trim()) {
        return 'Please share a short summary of what the app will do.';
      }
      if (!answers.distributionGoal) {
        return 'Please select your distribution goal.';
      }
      if (!answers.primaryCategory) {
        return 'Please select a primary category.';
      }
      if (!answers.ageRatingBand) {
        return 'Please select a target age rating band (or "Not sure yet").';
      }
      if (!answers.targetRegions.length) {
        return 'Please select at least one target country or region.';
      }
      if (formattedKeywords.length > 100) {
        return 'Search keywords must be 100 characters or fewer (comma-separated).';
      }
    }
    if (idx === 2) {
      if (answers.brandKitUrl.trim() && !isHttpUrl(answers.brandKitUrl)) {
        return 'Brand kit folder link must start with https:// or http://.';
      }
      if (!answers.contentRights) {
        return 'Please confirm third-party content and IP rights.';
      }
    }
    if (idx === 3) {
      if (!answers.hasPrivacyPolicy) {
        return 'Please indicate whether you already have a live Privacy Policy page.';
      }
      if (answers.hasPrivacyPolicy === 'yes' && !isHttpUrl(answers.privacyPolicyUrl)) {
        return 'Please enter a valid Privacy Policy URL starting with https:// or http://.';
      }
      if (answers.supportUrl.trim() && !isHttpUrl(answers.supportUrl)) {
        return 'Support URL must start with https:// or http://.';
      }
      if (!EMAIL_RE.test(answers.supportEmail.trim())) {
        return 'Please enter a valid Public Support Email.';
      }
      if (answers.termsUrl.trim() && !isHttpUrl(answers.termsUrl)) {
        return 'Terms of Service URL must start with https:// or http://.';
      }
      if (!answers.hasAccounts) {
        return 'Please indicate whether users will create accounts or log in.';
      }
    }
    if (idx === 4) {
      if (!answers.healthInvolvement.length) {
        return 'Please select your health & fitness involvement (or "None of the above").';
      }
      if (!answers.socialAiFeatures.length) {
        return 'Please select any social, community, or AI features (or "None of the above").';
      }
      if (!answers.userDataCollected.length) {
        return 'Please select what user data the app will collect (or "Not sure yet").';
      }
      if (!answers.trackingAds) {
        return 'Please select your in-app advertising or tracking setup.';
      }
    }
    if (idx === 5) {
      if (!answers.monetization.length) {
        return 'Please select how the app will make money (or "Not sure yet").';
      }
      if (needsApplePaidSetup && !answers.paidAppsStatus) {
        return 'Please select your Apple Paid Apps setup status.';
      }
      if (
        showMonetizationCallout &&
        answers.financeContactEmail.trim() &&
        !EMAIL_RE.test(answers.financeContactEmail.trim())
      ) {
        return 'Please enter a valid Finance/Billing contact email.';
      }
    }
    return '';
  };

  const goNext = () => {
    const err = validateStep(stepIndex);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError('');
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(next);
    setMaxVisited((prev) => Math.max(prev, next));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setStepError('');
    setStepIndex((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jumpToStep = (targetIdx) => {
    if (targetIdx <= maxVisited) {
      setStepError('');
      setStepIndex(targetIdx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFileUpload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploadError('');

    if (assets.length + files.length > MAX_FILES) {
      setUploadError(`You can upload up to ${MAX_FILES} files per submission.`);
      return;
    }

    const currentTotal = assets.reduce((sum, a) => sum + (a.size || 0), 0);
    const addedTotal = files.reduce((sum, f) => sum + f.size, 0);
    if (currentTotal + addedTotal > MAX_TOTAL_BYTES) {
      setUploadError('Total uploaded files cannot exceed 100 MB per submission.');
      return;
    }

    // Pre-validate every file size before starting any upload
    for (const file of files) {
      if (file.size > MAX_FILE_BYTES) {
        setUploadError(`"${file.name}" exceeds the 25 MB per-file limit.`);
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of files) {
        const res = await fetch('/api/app-store-intake/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            filename: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeBytes: file.size,
            website: honeypot,
          }),
        });
        const data = await safeParseJson(res);
        if (!res.ok) {
          throw new Error(data.error || `Could not start upload for "${file.name}".`);
        }

        const putRes = await fetch(data.signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        });
        if (!putRes.ok) {
          throw new Error(`Upload failed for "${file.name}". Please try again.`);
        }

        // Append immediately after each PUT so partial batch failures never orphan uploaded files
        const nextAsset = {
          path: data.path,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream',
        };
        setAssets((prev) => [...prev, nextAsset]);
      }
    } catch (err) {
      setUploadError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAsset = async (asset) => {
    setUploadError('');
    try {
      const res = await fetch('/api/app-store-intake/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, path: asset.path }),
      });
      if (!res.ok) {
        const data = await safeParseJson(res);
        setUploadError(data.error || `Could not remove "${asset.name}". Please try again.`);
        return;
      }
      setAssets((prev) => prev.filter((a) => a.path !== asset.path));
    } catch {
      setUploadError(`Could not remove "${asset.name}". Please check your connection and retry.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let i = 0; i < STEPS.length - 1; i += 1) {
      const err = validateStep(i);
      if (err) {
        setStepIndex(i);
        setStepError(err);
        return;
      }
    }

    setSubmitting(true);
    setStepError('');
    try {
      const payload = {
        sessionId,
        sendClientCopy,
        website: honeypot,
        assets,
        answers: {
          ...answers,
          contactPhone: e164Phone,
          keywords: formattedKeywords,
        },
      };

      const res = await fetch('/api/app-store-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit your intake. Please try again.');
      }

      window.localStorage.removeItem(STORAGE_KEY);
      setSubmitted(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setStepError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const gaps = submitted.gaps || [];
    return (
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="rounded-2xl border border-smoke bg-canvas p-6 sm:p-10 shadow-sm"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spring/20 text-forest text-xs font-semibold mb-4">
            Submission received
          </div>
          <h1 className="heading-display text-3xl sm:text-4xl text-forest">
            Thanks, {answers.contactName.split(/\s+/)[0] || 'there'}. We have what we need.
          </h1>
          <p className="text-sm text-graphite mt-3 leading-relaxed">
            Your iOS App Store onboarding intake for <strong>{answers.brandName}</strong> ({answers.appName}) has been saved.
            {submitted.emailDelivered === false
              ? ' Our team has your record saved in our system and will follow up shortly.'
              : ' Our team has been notified and will review everything before getting back to you.'}
          </p>
          <p className="text-xs text-graphite mt-2">
            Reference ID: <code className="font-mono text-forest">{submitted.id}</code>
          </p>

          <div className="mt-8">
            <h2 className="text-base font-semibold text-forest mb-3">
              App Store Readiness &amp; Next Steps Summary
            </h2>
            {gaps.length === 0 ? (
              <p className="text-sm text-graphite">No immediate blockers detected.</p>
            ) : (
              <ul className="space-y-3">
                {gaps.map((g) => (
                  <li
                    key={g.code}
                    className="rounded-xl border border-smoke bg-cloud/40 p-4 flex flex-col gap-1.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={g.severity} />
                      <span className="text-sm font-semibold text-forest">
                        {g.clientTitle || 'Next step'}
                      </span>
                    </div>
                    <p className="text-xs text-graphite leading-relaxed">
                      {g.clientSummary || ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-smoke flex flex-wrap items-center gap-3">
            <button type="button" onClick={clearDraft} className="btn-ghost text-sm">
              Start another intake
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  const currentStep = STEPS[stepIndex];
  const progressPct = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Intro Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest/80 mb-2">
            Renatus · Client Onboarding
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-forest">
            iOS App Store Intake
          </h1>
          <p className="text-sm text-graphite mt-2 max-w-2xl leading-relaxed">
            This form collects everything we need to prepare your Apple App Store setup. Items you
            don’t have yet are clearly marked optional—your progress auto-saves in this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={clearDraft}
          className="text-xs font-medium text-graphite hover:text-forest underline underline-offset-4 self-start sm:self-auto cursor-pointer"
        >
          Clear draft
        </button>
      </div>

      {/* Stepper Navigation */}
      <nav aria-label="Intake steps" className="mb-6">
        <div className="h-1.5 w-full bg-cloud rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-spring transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ol className="flex gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((s, idx) => {
            const active = idx === stepIndex;
            const visited = idx <= maxVisited;
            return (
              <li key={s.id} className="flex-shrink-0">
                <button
                  type="button"
                  disabled={!visited}
                  onClick={() => jumpToStep(idx)}
                  aria-current={active ? 'step' : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${
                    active
                      ? 'bg-forest text-canvas'
                      : visited
                        ? 'bg-cloud text-forest hover:bg-forest/10 cursor-pointer'
                        : 'bg-cloud/50 text-space cursor-not-allowed'
                  }`}
                >
                  {s.number}. {s.shortTitle}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Wizard Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-smoke bg-canvas p-5 sm:p-8 shadow-sm"
      >
        {/* Honeypot (hidden from humans, never stored in localStorage) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="intake-hp-website">Leave this blank</label>
          <input
            id="intake-hp-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="mb-6 pb-4 border-b border-smoke/70">
          <p className="text-xs font-medium text-graphite">
            Step {currentStep.number} of {STEPS.length}
          </p>
          <h2 className="text-xl sm:text-2xl font-semibold text-forest mt-1">
            {currentStep.title}
          </h2>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="space-y-6"
          >
            {/* STEP 1: BUSINESS & LEGAL */}
            {stepIndex === 0 && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel
                      htmlFor="legalName"
                      label="Legal Business Name"
                      required
                      helper="Registered entity name (e.g., Pty Ltd or sole trader). Apple uses this for legal verification."
                    />
                    <input
                      id="legalName"
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="e.g. The Mobility Collective Pty Ltd"
                      value={answers.legalName}
                      onChange={(e) => update('legalName', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="brandName"
                      label="Trading / Brand Name"
                      required
                      helper="The customer-facing name of your business."
                    />
                    <input
                      id="brandName"
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="e.g. The Mobility Collective"
                      value={answers.brandName}
                      onChange={(e) => update('brandName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel htmlFor="contactName" label="Primary Contact Name" required />
                    <input
                      id="contactName"
                      type="text"
                      autoComplete="name"
                      className={INPUT_CLASS}
                      placeholder="Full name"
                      value={answers.contactName}
                      onChange={(e) => update('contactName', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="contactEmail"
                      label="Primary Contact Email"
                      required
                      helper="Used for follow-ups and your optional confirmation receipt."
                    />
                    <input
                      id="contactEmail"
                      type="email"
                      autoComplete="email"
                      className={INPUT_CLASS}
                      placeholder="you@company.com"
                      value={answers.contactEmail}
                      onChange={(e) => update('contactEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel
                      htmlFor="phoneNumber"
                      label="Mobile / Phone"
                      required
                      helper="Apple requires a contact phone number with international country code."
                    />
                    <div className="flex gap-2">
                      <select
                        aria-label="Country code"
                        className="rounded-xl border border-smoke bg-canvas px-2.5 py-2.5 text-sm text-forest focus:outline-none focus:border-forest"
                        value={answers.phoneCountryCode}
                        onChange={(e) => update('phoneCountryCode', e.target.value)}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phoneNumber"
                        type="tel"
                        className={INPUT_CLASS}
                        placeholder="0412 345 678"
                        value={answers.phoneNumber}
                        onChange={(e) => update('phoneNumber', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel htmlFor="websiteUrl" label="Business Website URL" required />
                    <input
                      id="websiteUrl"
                      type="url"
                      className={INPUT_CLASS}
                      placeholder="https://www.yourbusiness.com"
                      value={answers.websiteUrl}
                      onChange={(e) => update('websiteUrl', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel htmlFor="country" label="Country / Region of Registration" required />
                    <input
                      id="country"
                      type="text"
                      className={INPUT_CLASS}
                      value={answers.country}
                      onChange={(e) => update('country', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="businessRegNumber"
                      label="Business Registration Number (ABN / ACN / EIN)"
                      required={false}
                      helper="Needed if publishing under your own Apple account or selling paid features."
                    />
                    <input
                      id="businessRegNumber"
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="Optional"
                      value={answers.businessRegNumber}
                      onChange={(e) => update('businessRegNumber', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel
                    label="Does your app operate in a regulated industry or provide special system features?"
                    required
                    helper="Apple requires regulated businesses to publish under their own company account."
                  />
                  <MultiSelectList
                    name="Regulated industries"
                    options={REGULATED_OPTIONS}
                    values={answers.regulatedIndustries}
                    onChange={(v) => update('regulatedIndustries', v)}
                  />
                </div>

                <div>
                  <FieldLabel label="Publishing Account Preference" required />
                  <ChoiceList
                    name="Publishing Account Preference"
                    options={PUBLISHING_ACCOUNT_OPTIONS}
                    value={answers.publishingAccount}
                    onChange={(v) => update('publishingAccount', v)}
                  />
                </div>

                {answers.publishingAccount === 'own' && (
                  <div className="rounded-xl border border-smoke bg-cloud/40 p-4 sm:p-5 space-y-4">
                    <Callout title="Apple Organization Enrollment Timing">
                      Apple organization enrollment and identity verification currently take{' '}
                      <strong>2–6 weeks</strong> (converting a personal account to an organization
                      can take up to 60+ days). We recommend starting at least 6 weeks before your
                      target launch.
                    </Callout>

                    <div>
                      <FieldLabel label="Apple Developer Enrollment Status" required />
                      <ChoiceList
                        name="Apple Developer Enrollment Status"
                        options={ENROLLMENT_STATUS_OPTIONS}
                        value={answers.enrollmentStatus}
                        onChange={(v) => update('enrollmentStatus', v)}
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <FieldLabel
                          htmlFor="accountHolderEmail"
                          label="Apple Account Holder Email"
                          required={false}
                          helper="Needed to invite Renatus."
                        />
                        <input
                          id="accountHolderEmail"
                          type="email"
                          className={INPUT_CLASS}
                          placeholder="owner@company.com"
                          value={answers.accountHolderEmail}
                          onChange={(e) => update('accountHolderEmail', e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel
                          htmlFor="teamId"
                          label="Apple Developer Team ID"
                          required={false}
                          helper="Optional if enrolled."
                        />
                        <input
                          id="teamId"
                          type="text"
                          className={INPUT_CLASS}
                          placeholder="e.g. A1B2C3D4E5"
                          value={answers.teamId}
                          onChange={(e) => update('teamId', e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel
                          htmlFor="dunsNumber"
                          label="D-U-N-S Number"
                          required={false}
                          helper="Free 9-digit business ID from Dun & Bradstreet used by Apple."
                        />
                        <input
                          id="dunsNumber"
                          type="text"
                          className={INPUT_CLASS}
                          placeholder="9 digits (optional)"
                          value={answers.dunsNumber}
                          onChange={(e) => update('dunsNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: APP CONCEPT & DRAFT METADATA */}
            {stepIndex === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel
                      htmlFor="appName"
                      label="Preferred App Name"
                      required
                      helper={`2–30 characters (${answers.appName.trim().length}/30). What appears under the icon on iPhone.`}
                    />
                    <input
                      id="appName"
                      type="text"
                      maxLength={30}
                      className={INPUT_CLASS}
                      placeholder="e.g. TMC"
                      value={answers.appName}
                      onChange={(e) => update('appName', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="primaryCategory" label="Primary Category" required />
                    <select
                      id="primaryCategory"
                      className={INPUT_CLASS}
                      value={answers.primaryCategory}
                      onChange={(e) => update('primaryCategory', e.target.value)}
                    >
                      {PRIMARY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel
                    htmlFor="appSummary"
                    label="What will the app do? (Plain-English summary)"
                    required
                    helper={`2–3 sentences on what users do in the app (${answers.appSummary.length}/2000). Apple requires real mobile utility beyond a repackaged website.`}
                  />
                  <textarea
                    id="appSummary"
                    rows={4}
                    maxLength={2000}
                    className={INPUT_CLASS}
                    placeholder="Describe the core experience and features users will get in the app..."
                    value={answers.appSummary}
                    onChange={(e) => update('appSummary', e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel label="Distribution Goal" required />
                  <ChoiceList
                    name="Distribution Goal"
                    options={DISTRIBUTION_GOAL_OPTIONS}
                    value={answers.distributionGoal}
                    onChange={(v) => update('distributionGoal', v)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel htmlFor="primaryLocale" label="Primary App Store Language / Locale" required />
                    <select
                      id="primaryLocale"
                      className={INPUT_CLASS}
                      value={answers.primaryLocale}
                      onChange={(e) => update('primaryLocale', e.target.value)}
                    >
                      {PRIMARY_LOCALES.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <FieldLabel
                      label="Target Devices"
                      required
                      helper="Selecting iPad requires iPad-sized layouts and screenshots."
                    />
                    <ChoiceList
                      name="Target Devices"
                      options={['iPhone only', 'iPhone & iPad']}
                      value={answers.targetDevices}
                      onChange={(v) => update('targetDevices', v)}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel
                    label="Target Age Rating Band"
                    required
                    helper="Apple’s current age bands are 4+, 9+, 13+, 16+, and 18+. Final rating is confirmed via Apple’s questionnaire."
                  />
                  <ChoiceList
                    name="Target Age Rating Band"
                    options={AGE_RATING_OPTIONS}
                    value={answers.ageRatingBand}
                    onChange={(v) => update('ageRatingBand', v)}
                  />
                </div>

                <div>
                  <FieldLabel
                    label="Is this app specifically made for children (Kids Category)?"
                    required
                    helper="Kids Category apps have strict rules: no third-party ads or analytics, and parental gates on all links and purchases."
                  />
                  <ChoiceList
                    name="Made for Kids"
                    options={[
                      { value: 'no', label: 'No' },
                      { value: 'yes', label: 'Yes (Ages 5 & under, 6–8, or 9–11)' },
                      { value: 'unsure', label: 'Not sure yet' },
                    ]}
                    value={answers.kidsCategory}
                    onChange={(v) => update('kidsCategory', v)}
                  />
                </div>

                <div>
                  <FieldLabel label="Target Countries / Regions for Release" required />
                  <MultiSelectList
                    name="Target Regions"
                    options={TARGET_REGIONS}
                    values={answers.targetRegions}
                    onChange={(v) => update('targetRegions', v)}
                  />
                </div>

                <div className="pt-4 border-t border-smoke/70 space-y-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-graphite">
                    Draft App Store Copy (Optional — can finalize during build)
                  </p>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <FieldLabel
                        htmlFor="subtitle"
                        label="Subtitle"
                        required={false}
                        helper={`Short tagline under the app name (${answers.subtitle.length}/30).`}
                      />
                      <input
                        id="subtitle"
                        type="text"
                        maxLength={30}
                        className={INPUT_CLASS}
                        placeholder="e.g. Mobility & Recovery Classes"
                        value={answers.subtitle}
                        onChange={(e) => update('subtitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel
                        htmlFor="keywords"
                        label="Search Keywords"
                        required={false}
                        helperTone={formattedKeywords.length > 100 ? 'error' : undefined}
                        helper={`Comma-separated search terms (${formattedKeywords.length}/100). Spaces are formatted automatically.`}
                      />
                      <input
                        id="keywords"
                        type="text"
                        className={INPUT_CLASS}
                        placeholder="mobility, recovery, pilates, stretching"
                        value={answers.keywords}
                        onChange={(e) => update('keywords', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="promoText"
                      label="Promotional Text"
                      required={false}
                      helper={`Short highlight at the top of your listing (${answers.promoText.length}/170).`}
                    />
                    <input
                      id="promoText"
                      type="text"
                      maxLength={170}
                      className={INPUT_CLASS}
                      placeholder="e.g. New 14-day hip mobility program now live."
                      value={answers.promoText}
                      onChange={(e) => update('promoText', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="draftDescription"
                      label="Draft App Store Description"
                      required={false}
                      helper={`Full listing copy (${answers.draftDescription.length}/4000).`}
                    />
                    <textarea
                      id="draftDescription"
                      rows={4}
                      maxLength={4000}
                      className={INPUT_CLASS}
                      placeholder="Optional rough notes or full description..."
                      value={answers.draftDescription}
                      onChange={(e) => update('draftDescription', e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: BRAND IDENTITY & ASSET UPLOADS */}
            {stepIndex === 2 && (
              <>
                <div>
                  <FieldLabel
                    htmlFor="asset-upload"
                    label="Upload Brand Assets (Logo, Brandmark, Brand Kit)"
                    required={false}
                    helper="Upload your raw designer files, logo/brandmark, brand snapshot PDF, or zipped brand kit—no need to resize anything to 1024x1024, we'll handle that. Max 10 files, 25 MB each (100 MB total)."
                  />
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    className="rounded-xl border-2 border-dashed border-smoke bg-cloud/30 p-6 text-center hover:border-forest/50 transition"
                  >
                    <input
                      ref={fileInputRef}
                      id="asset-upload"
                      type="file"
                      multiple
                      accept=".png,.svg,.jpg,.jpeg,.webp,.pdf,.zip,.eps,.ttf,.otf,.woff2"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <p className="text-sm font-medium text-forest">
                      {uploading ? 'Uploading files…' : 'Drag & drop brand files here, or browse'}
                    </p>
                    <p className="text-xs text-graphite mt-1">
                      PNG, SVG, JPG, WEBP, PDF, ZIP, EPS, TTF, OTF, WOFF2
                    </p>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-ghost mt-4 text-xs py-2 px-4 cursor-pointer"
                    >
                      {uploading ? 'Uploading…' : 'Choose files'}
                    </button>
                  </div>

                  {uploadError && (
                    <p className="text-xs text-red-700 mt-2" role="alert">
                      {uploadError}
                    </p>
                  )}

                  {assets.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {assets.map((asset) => (
                        <li
                          key={asset.path}
                          className="flex items-center justify-between rounded-lg border border-smoke bg-canvas px-3.5 py-2 text-xs"
                        >
                          <div className="truncate pr-3">
                            <span className="font-medium text-forest">{asset.name}</span>{' '}
                            <span className="text-graphite">
                              ({Math.max(1, Math.round((asset.size || 0) / 1024))} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(asset)}
                            className="text-red-700 hover:underline font-medium cursor-pointer flex-shrink-0"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <FieldLabel
                    htmlFor="brandKitUrl"
                    label="Brand Kit Folder Link (Optional Backup)"
                    required={false}
                    helper="Have a large Google Drive, Dropbox, Figma, or Canva folder? Paste a share link here."
                  />
                  <input
                    id="brandKitUrl"
                    type="url"
                    className={INPUT_CLASS}
                    placeholder="https://drive.google.com/..."
                    value={answers.brandKitUrl}
                    onChange={(e) => update('brandKitUrl', e.target.value)}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel
                      htmlFor="brandColors"
                      label="Brand Colors (Hex or Descriptions)"
                      required={false}
                    />
                    <input
                      id="brandColors"
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="e.g. #1E2D40, #E0BA7B, #DED1BD, #F0F0EB"
                      value={answers.brandColors}
                      onChange={(e) => update('brandColors', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="iconBackground"
                      label="Preferred App Icon Background Color / Style"
                      required={false}
                      helper="App Store icons cannot have transparent backgrounds."
                    />
                    <input
                      id="iconBackground"
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="e.g. Dark Blue #1E2D40 with white mark"
                      value={answers.iconBackground}
                      onChange={(e) => update('iconBackground', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel htmlFor="brandFonts" label="Brand Fonts" required={false} />
                    <input
                      id="brandFonts"
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="e.g. Gloock"
                      value={answers.brandFonts}
                      onChange={(e) => update('brandFonts', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="brandFontLicense" label="Font License Status" required={false} />
                    <select
                      id="brandFontLicense"
                      className={INPUT_CLASS}
                      value={answers.brandFontLicense}
                      onChange={(e) => update('brandFontLicense', e.target.value)}
                    >
                      <option value="">Select (optional)</option>
                      <option value="free_google">Free / Google Font</option>
                      <option value="paid_owned">Paid license owned</option>
                      <option value="unsure">Not sure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel label="Third-Party Content & IP Rights" required />
                  <ChoiceList
                    name="Third-Party Content & IP Rights"
                    options={[
                      { value: 'owned', label: 'All brand assets, copy, and media are owned by us' },
                      {
                        value: 'licensed',
                        label: 'Includes third-party licensed content/media (we have written permission)',
                      },
                      { value: 'unsure', label: 'Not sure yet — Renatus to advise' },
                    ]}
                    value={answers.contentRights}
                    onChange={(v) => update('contentRights', v)}
                  />
                </div>
              </>
            )}

            {/* STEP 4: LEGAL, PRIVACY & SUPPORT URLS */}
            {stepIndex === 3 && (
              <>
                <div>
                  <FieldLabel
                    label="Do you already have a live Privacy Policy page?"
                    required
                    helper="Apple requires a live Privacy Policy both on your App Store listing and accessible inside the app."
                  />
                  <ChoiceList
                    name="Has Privacy Policy"
                    options={[
                      { value: 'yes', label: 'Yes — we already have a live Privacy Policy URL' },
                      { value: 'no', label: 'No — Renatus needs to help set this up' },
                    ]}
                    value={answers.hasPrivacyPolicy}
                    onChange={(v) => update('hasPrivacyPolicy', v)}
                  />
                </div>

                {answers.hasPrivacyPolicy === 'yes' && (
                  <div>
                    <FieldLabel htmlFor="privacyPolicyUrl" label="Privacy Policy URL" required />
                    <input
                      id="privacyPolicyUrl"
                      type="url"
                      className={INPUT_CLASS}
                      placeholder="https://www.yourbusiness.com/privacy"
                      value={answers.privacyPolicyUrl}
                      onChange={(e) => update('privacyPolicyUrl', e.target.value)}
                    />
                  </div>
                )}

                {answers.hasPrivacyPolicy === 'no' && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3">
                    <p className="text-xs text-amber-950 font-medium">
                      We will flag this so Renatus can help get a Privacy Policy live before Apple submission.
                    </p>
                    <div>
                      <FieldLabel
                        htmlFor="websiteManager"
                        label="Who manages your website / what platform is it on?"
                        required={false}
                      />
                      <input
                        id="websiteManager"
                        type="text"
                        className={INPUT_CLASS}
                        placeholder="e.g. Squarespace, Wix, Webflow, Custom / Agency, In-house"
                        value={answers.websiteManager}
                        onChange={(e) => update('websiteManager', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel
                      htmlFor="supportUrl"
                      label="Support URL"
                      required={false}
                      helper="A live contact or support page on your website (e.g. yoursite.com/contact)."
                    />
                    <input
                      id="supportUrl"
                      type="url"
                      className={INPUT_CLASS}
                      placeholder="https://www.yourbusiness.com/contact"
                      value={answers.supportUrl}
                      onChange={(e) => update('supportUrl', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel
                      htmlFor="supportEmail"
                      label="Public Support Email"
                      required
                      helper="Displayed on App Store support and legal pages."
                    />
                    <input
                      id="supportEmail"
                      type="email"
                      className={INPUT_CLASS}
                      placeholder="support@yourbusiness.com"
                      value={answers.supportEmail}
                      onChange={(e) => update('supportEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel
                    htmlFor="termsUrl"
                    label="Terms of Service / User Agreement URL"
                    required={false}
                    helper="Required if offering subscriptions or user-posted content."
                  />
                  <input
                    id="termsUrl"
                    type="url"
                    className={INPUT_CLASS}
                    placeholder="https://www.yourbusiness.com/terms"
                    value={answers.termsUrl}
                    onChange={(e) => update('termsUrl', e.target.value)}
                  />
                </div>

                <div>
                  <FieldLabel label="Will users create accounts or log in?" required />
                  <ChoiceList
                    name="User Accounts"
                    options={[
                      { value: 'yes', label: 'Yes' },
                      { value: 'no', label: 'No' },
                      { value: 'unsure', label: 'Not sure yet' },
                    ]}
                    value={answers.hasAccounts}
                    onChange={(v) => update('hasAccounts', v)}
                  />
                </div>

                {answers.hasAccounts === 'yes' && (
                  <div className="space-y-4">
                    <div>
                      <FieldLabel
                        label="Will you offer social login (e.g., Google, Facebook)?"
                        required={false}
                      />
                      <ChoiceList
                        name="Social Login"
                        options={[
                          { value: 'yes', label: 'Yes' },
                          { value: 'no', label: 'No' },
                          { value: 'unsure', label: 'Not sure yet' },
                        ]}
                        value={answers.hasSocialLogin}
                        onChange={(v) => update('hasSocialLogin', v)}
                      />
                    </div>
                    <Callout title="What Apple requires for apps with accounts">
                      Apple requires: (1) a way for users to permanently delete their account inside
                      the app, (2) optional browsing without login for general content where
                      possible, (3) <strong>Sign in with Apple</strong> alongside any third-party
                      social login, and (4) a test login account for Apple’s review team.
                    </Callout>
                  </div>
                )}
              </>
            )}

            {/* STEP 5: HEALTH, SOCIAL, AI & PRIVACY */}
            {stepIndex === 4 && (
              <>
                <div>
                  <FieldLabel label="Health, Fitness & Medical Involvement" required />
                  <MultiSelectList
                    name="Health & Fitness Involvement"
                    options={HEALTH_OPTIONS}
                    values={answers.healthInvolvement}
                    onChange={(v) => update('healthInvolvement', v)}
                  />
                  {answers.healthInvolvement.some((v) => v !== 'none') && (
                    <div className="mt-3">
                      <Callout title="Health & fitness data rules">
                        Health and fitness data can never be used for advertising or marketing. Apps
                        that provide medical advice or clinical treatment require disclaimers and
                        publishing under your own company’s Apple Developer account.
                      </Callout>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel label="Social, Community & AI Features" required />
                  <MultiSelectList
                    name="Social, Community & AI Features"
                    options={SOCIAL_AI_OPTIONS}
                    values={answers.socialAiFeatures}
                    onChange={(v) => update('socialAiFeatures', v)}
                  />
                </div>

                <div>
                  <FieldLabel
                    label="User Data the App Will Collect"
                    required
                    helper="Select anything you expect the app to collect—or choose Not sure yet if you haven’t finalized features."
                  />
                  <MultiSelectList
                    name="User Data Collected"
                    options={USER_DATA_OPTIONS}
                    values={answers.userDataCollected}
                    onChange={(v) => update('userDataCollected', v)}
                  />
                </div>

                <div>
                  <FieldLabel
                    label="In-App Advertising or Cross-App Tracking"
                    required
                    helper="Running Instagram/Google ads for your business does not count here—this is only for tracking tools inside the mobile app."
                  />
                  <ChoiceList
                    name="In-App Tracking"
                    options={TRACKING_OPTIONS}
                    value={answers.trackingAds}
                    onChange={(v) => update('trackingAds', v)}
                  />
                </div>

                <div>
                  <FieldLabel label="Data Security / Encryption" required={false} />
                  <ChoiceList
                    name="Encryption"
                    options={ENCRYPTION_OPTIONS}
                    value={answers.encryption}
                    onChange={(v) => update('encryption', v)}
                  />
                </div>
              </>
            )}

            {/* STEP 6: MONETIZATION & PAID APPS */}
            {stepIndex === 5 && (
              <>
                <div>
                  <FieldLabel label="How will the app make money?" required />
                  <MultiSelectList
                    name="Monetization"
                    options={MONETIZATION_OPTIONS}
                    values={answers.monetization}
                    onChange={(v) => update('monetization', v)}
                  />
                </div>

                {showMonetizationCallout && (
                  <div className="space-y-5">
                    <Callout tone="warn" title="Apple Paid Apps Agreement & Financial Lodging">
                      Paid downloads and Apple In-App Purchases require signing Apple’s Paid Apps
                      Agreement, submitting tax forms, and verifying banking details inside App Store
                      Connect.{' '}
                      <strong>
                        Do not enter bank account or tax numbers here. We will handle financial
                        lodging securely 1:1 once scoped.
                      </strong>
                    </Callout>

                    {needsApplePaidSetup && (
                      <div>
                        <FieldLabel label="Apple Paid Apps Setup Status" required />
                        <ChoiceList
                          name="Apple Paid Apps Setup Status"
                          options={PAID_APPS_STATUS_OPTIONS}
                          value={answers.paidAppsStatus}
                          onChange={(v) => update('paidAppsStatus', v)}
                        />
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <FieldLabel
                          htmlFor="financeContactName"
                          label="Finance / Billing Contact Name"
                          required={false}
                          helper="Optional — if different from primary contact."
                        />
                        <input
                          id="financeContactName"
                          type="text"
                          className={INPUT_CLASS}
                          placeholder="Full name"
                          value={answers.financeContactName}
                          onChange={(e) => update('financeContactName', e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel
                          htmlFor="financeContactEmail"
                          label="Finance / Billing Contact Email"
                          required={false}
                        />
                        <input
                          id="financeContactEmail"
                          type="email"
                          className={INPUT_CLASS}
                          placeholder="accounts@yourbusiness.com"
                          value={answers.financeContactEmail}
                          onChange={(e) => update('financeContactEmail', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STEP 7: REVIEW NOTES, TIMELINE & CONFIRMATION */}
            {stepIndex === 6 && (
              <>
                <div>
                  <FieldLabel label="Target Launch Window" required={false} />
                  <ChoiceList
                    name="Target Launch Window"
                    options={LAUNCH_WINDOW_OPTIONS}
                    value={answers.launchWindow}
                    onChange={(v) => update('launchWindow', v)}
                  />
                </div>

                <div>
                  <FieldLabel
                    htmlFor="reviewNotes"
                    label="Special Notes for Renatus or Apple Review"
                    required={false}
                    helper={`Optional (${answers.reviewNotes.length}/2000) — e.g. existing booking system, beta tester list, or special review notes.`}
                  />
                  <textarea
                    id="reviewNotes"
                    rows={4}
                    maxLength={2000}
                    className={INPUT_CLASS}
                    placeholder="Anything else we should know before setting up your App Store listing..."
                    value={answers.reviewNotes}
                    onChange={(e) => update('reviewNotes', e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendClientCopy}
                    onChange={(e) => setSendClientCopy(e.target.checked)}
                    className="h-4 w-4 rounded border-smoke text-forest focus:ring-spring"
                  />
                  <span className="text-sm text-forest">
                    Send me a confirmation receipt email ({answers.contactEmail || 'your email'})
                  </span>
                </label>

                {/* Expandable Review Summary Panel */}
                <div className="rounded-xl border border-smoke bg-cloud/30 overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={reviewOpen}
                    onClick={() => setReviewOpen((o) => !o)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-semibold text-forest cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                  >
                    <span>Review Summary</span>
                    <span className="text-xs text-graphite">{reviewOpen ? 'Hide' : 'Show'}</span>
                  </button>
                  {reviewOpen && (
                    <dl className="px-4 pb-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-xs border-t border-smoke/60 pt-3">
                      <div>
                        <dt className="text-graphite">Business / Brand</dt>
                        <dd className="font-medium text-forest">
                          {answers.brandName} ({answers.legalName}) · {answers.country}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Primary Contact</dt>
                        <dd className="font-medium text-forest">
                          {answers.contactName} · {answers.contactEmail} · {e164Phone}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Publishing Account &amp; Regulated Status</dt>
                        <dd className="font-medium text-forest">
                          {labelForOption(PUBLISHING_ACCOUNT_OPTIONS, answers.publishingAccount)}
                          {answers.publishingAccount === 'own' && answers.enrollmentStatus
                            ? ` (${labelForOption(ENROLLMENT_STATUS_OPTIONS, answers.enrollmentStatus)})`
                            : ''}{' '}
                          · {labelsForValues(REGULATED_OPTIONS, answers.regulatedIndustries)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">App Name, Category &amp; Devices</dt>
                        <dd className="font-medium text-forest">
                          {answers.appName} — {answers.primaryCategory} ({answers.targetDevices},{' '}
                          {answers.primaryLocale})
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Distribution, Age &amp; Regions</dt>
                        <dd className="font-medium text-forest">
                          {labelForOption(DISTRIBUTION_GOAL_OPTIONS, answers.distributionGoal)} · Age:{' '}
                          {labelForOption(AGE_RATING_OPTIONS, answers.ageRatingBand)} (Kids:{' '}
                          {labelForOption(YES_NO_UNSURE, answers.kidsCategory)}) ·{' '}
                          {labelsForValues(TARGET_REGIONS, answers.targetRegions)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Brand Assets</dt>
                        <dd className="font-medium text-forest">
                          {assets.length > 0
                            ? assets.map((f) => f.name).join(', ')
                            : 'No files uploaded directly'}
                          {answers.brandKitUrl ? ` · Folder link provided` : ''}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Legal, Privacy &amp; Accounts</dt>
                        <dd className="font-medium text-forest">
                          Privacy:{' '}
                          {answers.hasPrivacyPolicy === 'yes'
                            ? answers.privacyPolicyUrl
                            : 'Needs setup'}{' '}
                          · Support: {answers.supportEmail} · Accounts:{' '}
                          {labelForOption(YES_NO_UNSURE, answers.hasAccounts)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Health, Social &amp; AI</dt>
                        <dd className="font-medium text-forest">
                          Health: {labelsForValues(HEALTH_OPTIONS, answers.healthInvolvement)} ·
                          Social/AI: {labelsForValues(SOCIAL_AI_OPTIONS, answers.socialAiFeatures)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Data, Tracking &amp; Security</dt>
                        <dd className="font-medium text-forest">
                          Data: {labelsForValues(USER_DATA_OPTIONS, answers.userDataCollected)} ·
                          Tracking: {labelForOption(TRACKING_OPTIONS, answers.trackingAds)} ·{' '}
                          {labelForOption(ENCRYPTION_OPTIONS, answers.encryption)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-graphite">Monetization &amp; Paid Apps</dt>
                        <dd className="font-medium text-forest">
                          {labelsForValues(MONETIZATION_OPTIONS, answers.monetization)}
                          {needsApplePaidSetup && answers.paidAppsStatus
                            ? ` (${labelForOption(PAID_APPS_STATUS_OPTIONS, answers.paidAppsStatus)})`
                            : ''}
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {stepError && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {stepError}
          </div>
        )}

        {/* Footer Nav */}
        <div className="mt-8 pt-6 border-t border-smoke/70 flex items-center justify-between gap-4">
          {stepIndex > 0 ? (
            <button type="button" onClick={goBack} className="btn-ghost text-sm cursor-pointer">
              &larr; Back
            </button>
          ) : (
            <span />
          )}

          {stepIndex < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} className="btn-primary text-sm cursor-pointer">
              Next &rarr;
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn-primary text-sm cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit Intake'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
