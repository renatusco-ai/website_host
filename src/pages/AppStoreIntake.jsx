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
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs/4 font-medium bg-forest/10 text-forest">
      Needed now
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs/4 font-medium bg-cloud text-[#4b5060]">
      Optional — can finalize during build
    </span>
  );
}

function FieldLabel({ htmlFor, helperId = htmlFor && `${htmlFor}-helper`, label, required, badge = true, helper, helperTone }) {
  return (
    <div className="mb-2 sm:in-[.intake-field-row]:contents">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:in-[.intake-field-row]:mb-2">
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
          id={helperId}
          className={`text-xs/5 mt-1 sm:in-[.intake-field-row]:mt-0 sm:in-[.intake-field-row]:mb-2 ${
            helperTone === 'error' ? 'text-red-700 font-medium' : 'text-[#4b5060]'
          }`}
        >
          {helper}
        </p>
      )}
    </div>
  );
}

function ChoiceList({ options, value, onChange, name, describedBy, required, invalid }) {
  const values = options.map((opt) => (typeof opt === 'string' ? opt : opt.value));
  const tabbableIndex = Math.max(0, values.indexOf(value));
  const fullDescribedBy = [describedBy, invalid ? 'intake-step-error' : null].filter(Boolean).join(' ') || undefined;

  const handleArrow = (event, index) => {
    const direction = {
      ArrowUp: -1,
      ArrowLeft: -1,
      ArrowDown: 1,
      ArrowRight: 1,
    }[event.key];
    if (!direction) return;

    event.preventDefault();
    const nextIndex = (index + direction + values.length) % values.length;
    onChange(values[nextIndex]);
    event.currentTarget.parentElement.children[nextIndex].focus();
  };

  return (
    <div
      className="grid gap-2"
      role="radiogroup"
      aria-label={name}
      aria-describedby={fullDescribedBy}
      aria-required={required}
      aria-invalid={invalid}
    >
      {options.map((opt, index) => {
        const val = values[index];
        const label = typeof opt === 'string' ? opt : opt.label;
        const hint = typeof opt === 'string' ? null : opt.hint;
        const checked = value === val;
        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onKeyDown={(event) => handleArrow(event, index)}
            onClick={() => onChange(val)}
            className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
              checked
                ? 'border-forest bg-forest/[0.06] shadow-[0_0_0_1px_var(--color-forest)]'
                : 'border-graphite bg-canvas hover:border-forest'
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 h-4 w-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  checked ? 'border-forest bg-forest' : 'border-graphite bg-canvas'
                }`}
              >
                {checked && (
                  <span className="h-1.5 w-1.5 rounded-full bg-spring forced-colors:bg-[CanvasText] forced-colors:border forced-colors:border-[CanvasText]" />
                )}
              </span>
              <div className="min-w-0">
                <div className="text-sm/5 font-medium text-forest">{label}</div>
                {hint && <div className="text-xs/5 text-[#4b5060] mt-1">{hint}</div>}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectList({ options, values, onChange, name, describedBy, required, invalid }) {
  const selected = values || [];
  const reqId = required ? `req-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : null;
  const fullDescribedBy = [describedBy, reqId, invalid ? 'intake-step-error' : null]
    .filter(Boolean)
    .join(' ') || undefined;
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
    <div
      className="grid gap-2"
      role="group"
      aria-label={name}
      aria-describedby={fullDescribedBy}
      aria-invalid={invalid}
    >
      {reqId && (
        <span id={reqId} className="sr-only">
          Required: select at least one option.
        </span>
      )}
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
            className={`text-left px-4 py-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
              checked
                ? 'border-forest bg-forest/[0.06] shadow-[0_0_0_1px_var(--color-forest)]'
                : 'border-graphite bg-canvas hover:border-forest'
            }`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center text-[11px] font-bold ${
                checked
                  ? 'border-forest bg-forest text-spring forced-colors:text-[CanvasText]'
                  : 'border-graphite bg-canvas'
              }`}
            >
              {checked ? '✓' : null}
            </span>
            <span className="text-sm/5 font-medium text-forest">{label}</span>
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
    <div className={`rounded-xl border p-5 text-sm/6 ${styles}`}>
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
    'Info (Deferred)': 'bg-cloud text-[#4b5060] border-smoke',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        map[severity] || 'bg-cloud text-[#4b5060] border-smoke'
      }`}
    >
      {severity}
    </span>
  );
}

// The control occupies row three even when a field has no helper.
const FIELD_ROW_CLASS =
  'intake-field-row grid gap-5 sm:gap-y-0 [&>div]:min-w-0 sm:[&>div]:row-span-3 sm:[&>div]:grid sm:[&>div]:grid-rows-subgrid sm:[&>div]:items-start sm:[&>div>:last-child]:row-start-3';

const CONTROL_CLASS =
  'min-h-11 rounded-xl border border-graphite bg-canvas px-3.5 py-2 text-base/6 sm:text-sm/6 text-forest focus:border-forest focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 transition-colors';
const INPUT_CLASS =
  `${CONTROL_CLASS} w-full min-w-0 placeholder:text-[#5c6170] placeholder:opacity-100`;

function SelectControl({ className = '', wrapperClassName = 'w-full min-w-0', children, ...props }) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        {...props}
        className={`${CONTROL_CLASS} appearance-none w-full min-w-0 pr-10 cursor-pointer ${className}`}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-forest"
      >
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

const ACTION_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-sm/5 font-semibold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-graphite disabled:bg-cloud disabled:text-[#4b5060]';
const PRIMARY_ACTION_CLASS =
  `${ACTION_CLASS} border-forest bg-spring text-[#08483d] enabled:hover:bg-forest enabled:hover:text-canvas`;
const SECONDARY_ACTION_CLASS =
  `${ACTION_CLASS} border-forest bg-canvas text-forest enabled:hover:bg-forest/[0.06]`;

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

  const [stepError, setStepError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(true);
  const fileInputRef = useRef(null);
  const uploadDropzoneRef = useRef(null);
  const chooseFilesBtnRef = useRef(null);
  const removeBtnRefs = useRef({});
  const pendingRemoveFocusRef = useRef(null);
  const stepHeadingRef = useRef(null);
  const confirmationHeadingRef = useRef(null);
  const previousStep = useRef(stepIndex);

  useEffect(() => {
    const heading = submitted
      ? confirmationHeadingRef.current
      : previousStep.current !== stepIndex
        ? stepHeadingRef.current
        : null;
    previousStep.current = stepIndex;
    if (heading) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [stepIndex, submitted]);

  useEffect(() => {
    const candidates = pendingRemoveFocusRef.current;
    if (!candidates) return;
    pendingRemoveFocusRef.current = null;
    // Only restore focus if the unmounted button dropped focus to body (do not override if user moved focus elsewhere)
    if (document.activeElement && document.activeElement !== document.body) return;
    const survivingPaths = new Set(assets.map((a) => a.path));
    const nextPath = candidates.find((p) => survivingPaths.has(p));
    if (nextPath && removeBtnRefs.current[nextPath]) {
      removeBtnRefs.current[nextPath].focus();
    } else if (chooseFilesBtnRef.current && !chooseFilesBtnRef.current.disabled) {
      chooseFilesBtnRef.current.focus();
    } else {
      uploadDropzoneRef.current?.focus();
    }
  }, [assets]);

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
    setStepError(null);
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
    setStepError(null);
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

  const invalid = (message, ...fields) => ({ message, fields });
  const isInvalid = (field) => stepError?.fields?.includes(field) || undefined;
  const describedByFor = (field, ...ids) =>
    [...ids, isInvalid(field) ? 'intake-step-error' : null].filter(Boolean).join(' ') || undefined;
  const keywordsTooLong = formattedKeywords.length > 100;

  const validateStep = (idx) => {
    if (idx === 0) {
      if (!answers.legalName.trim() || !answers.brandName.trim() || !answers.contactName.trim()) {
        return invalid('Please enter your legal business name, brand name, and primary contact name.', ...['legalName', 'brandName', 'contactName'].filter((field) => !answers[field].trim()));
      }
      if (!EMAIL_RE.test(answers.contactEmail.trim())) {
        return invalid('Please enter a valid primary contact email address.', 'contactEmail');
      }
      if (!E164_RE.test(e164Phone)) {
        return invalid('Please enter a valid mobile or phone number.', 'phoneNumber');
      }
      if (!isHttpUrl(answers.websiteUrl)) {
        return invalid('Please enter a valid website URL starting with https:// or http://.', 'websiteUrl');
      }
      if (!answers.country.trim()) {
        return invalid('Please enter your country or region of registration.', 'country');
      }
      if (!answers.regulatedIndustries.length) {
        return invalid('Please select your regulated industry status (or "None of these").', 'regulatedIndustries');
      }
      if (!answers.publishingAccount) {
        return invalid('Please select a publishing account preference.', 'publishingAccount');
      }
      if (answers.publishingAccount === 'own' && !answers.enrollmentStatus) {
        return invalid('Please select your current Apple Developer enrollment status.', 'enrollmentStatus');
      }
      if (
        answers.publishingAccount === 'own' &&
        answers.accountHolderEmail.trim() &&
        !EMAIL_RE.test(answers.accountHolderEmail.trim())
      ) {
        return invalid('Please enter a valid Apple Account Holder email address.', 'accountHolderEmail');
      }
    }
    if (idx === 1) {
      const nameLen = answers.appName.trim().length;
      if (nameLen < 2 || nameLen > 30) {
        return invalid('Preferred app name must be between 2 and 30 characters.', 'appName');
      }
      if (!answers.appSummary.trim()) {
        return invalid('Please share a short summary of what the app will do.', 'appSummary');
      }
      if (!answers.distributionGoal) {
        return invalid('Please select your distribution goal.', 'distributionGoal');
      }
      if (!answers.primaryCategory) {
        return invalid('Please select a primary category.', 'primaryCategory');
      }
      if (!answers.ageRatingBand) {
        return invalid('Please select a target age rating band (or "Not sure yet").', 'ageRatingBand');
      }
      if (!answers.targetRegions.length) {
        return invalid('Please select at least one target country or region.', 'targetRegions');
      }
      if (keywordsTooLong) {
        return invalid('Search keywords must be 100 characters or fewer (comma-separated).', 'keywords');
      }
    }
    if (idx === 2) {
      if (answers.brandKitUrl.trim() && !isHttpUrl(answers.brandKitUrl)) {
        return invalid('Brand kit folder link must start with https:// or http://.', 'brandKitUrl');
      }
      if (!answers.contentRights) {
        return invalid('Please confirm third-party content and IP rights.', 'contentRights');
      }
    }
    if (idx === 3) {
      if (!answers.hasPrivacyPolicy) {
        return invalid('Please indicate whether you already have a live Privacy Policy page.', 'hasPrivacyPolicy');
      }
      if (answers.hasPrivacyPolicy === 'yes' && !isHttpUrl(answers.privacyPolicyUrl)) {
        return invalid('Please enter a valid Privacy Policy URL starting with https:// or http://.', 'privacyPolicyUrl');
      }
      if (answers.supportUrl.trim() && !isHttpUrl(answers.supportUrl)) {
        return invalid('Support URL must start with https:// or http://.', 'supportUrl');
      }
      if (!EMAIL_RE.test(answers.supportEmail.trim())) {
        return invalid('Please enter a valid Public Support Email.', 'supportEmail');
      }
      if (answers.termsUrl.trim() && !isHttpUrl(answers.termsUrl)) {
        return invalid('Terms of Service URL must start with https:// or http://.', 'termsUrl');
      }
      if (!answers.hasAccounts) {
        return invalid('Please indicate whether users will create accounts or log in.', 'hasAccounts');
      }
    }
    if (idx === 4) {
      if (!answers.healthInvolvement.length) {
        return invalid('Please select your health & fitness involvement (or "None of the above").', 'healthInvolvement');
      }
      if (!answers.socialAiFeatures.length) {
        return invalid('Please select any social, community, or AI features (or "None of the above").', 'socialAiFeatures');
      }
      if (!answers.userDataCollected.length) {
        return invalid('Please select what user data the app will collect (or "Not sure yet").', 'userDataCollected');
      }
      if (!answers.trackingAds) {
        return invalid('Please select your in-app advertising or tracking setup.', 'trackingAds');
      }
    }
    if (idx === 5) {
      if (!answers.monetization.length) {
        return invalid('Please select how the app will make money (or "Not sure yet").', 'monetization');
      }
      if (needsApplePaidSetup && !answers.paidAppsStatus) {
        return invalid('Please select your Apple Paid Apps setup status.', 'paidAppsStatus');
      }
      if (
        showMonetizationCallout &&
        answers.financeContactEmail.trim() &&
        !EMAIL_RE.test(answers.financeContactEmail.trim())
      ) {
        return invalid('Please enter a valid Finance/Billing contact email.', 'financeContactEmail');
      }
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(stepIndex);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    const next = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(next);
    setMaxVisited((prev) => Math.max(prev, next));
  };

  const goBack = () => {
    setStepError(null);
    setStepIndex((prev) => Math.max(0, prev - 1));
  };

  const jumpToStep = (targetIdx) => {
    if (targetIdx <= maxVisited) {
      setStepError(null);
      setStepIndex(targetIdx);
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
      const isFocusedOnRemoved = document.activeElement === removeBtnRefs.current[asset.path];
      setAssets((prev) => {
        const currentIdx = prev.findIndex((a) => a.path === asset.path);
        if (isFocusedOnRemoved && currentIdx !== -1) {
          const after = prev.slice(currentIdx + 1).map((a) => a.path);
          const before = prev.slice(0, currentIdx).map((a) => a.path).reverse();
          pendingRemoveFocusRef.current = [...after, ...before];
        }
        return prev.filter((a) => a.path !== asset.path);
      });
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
    setStepError(null);
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
    } catch (err) {
      setStepError({ message: err.message || 'Submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const gaps = submitted.gaps || [];
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="rounded-2xl border border-smoke bg-canvas p-5 sm:p-8 shadow-sm"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spring/20 text-forest text-xs font-semibold mb-4">
            Submission received
          </div>
          <h1
            ref={confirmationHeadingRef}
            tabIndex={-1}
            className="heading-display text-3xl sm:text-4xl text-forest scroll-mt-24 break-words [overflow-wrap:anywhere]"
          >
            Thanks, {answers.contactName.split(/\s+/)[0] || 'there'}. We have what we need.
          </h1>
          <p className="text-sm text-[#4b5060] mt-3 leading-6 break-words [overflow-wrap:anywhere]">
            Your iOS App Store onboarding intake for <strong>{answers.brandName}</strong> ({answers.appName}) has been saved.
            {submitted.emailDelivered === false
              ? ' Our team has your record saved in our system and will follow up shortly.'
              : ' Our team has been notified and will review everything before getting back to you.'}
          </p>
          <p className="text-xs text-[#4b5060] mt-2">
            Reference ID: <code className="font-mono text-forest wrap-anywhere">{submitted.id}</code>
          </p>

          <div className="mt-8">
            <h2 className="text-base font-semibold text-forest mb-3">
              App Store Readiness &amp; Next Steps Summary
            </h2>
            {gaps.length === 0 ? (
              <p className="text-sm text-[#4b5060]">No immediate blockers detected.</p>
            ) : (
              <ul className="space-y-3">
                {gaps.map((g) => (
                  <li
                    key={g.code}
                    className="rounded-xl border border-smoke bg-cloud/40 p-5 flex flex-col items-start gap-2"
                  >
                    <SeverityBadge severity={g.severity} />
                    <h3 className="text-sm/5 font-semibold text-forest">
                      {g.clientTitle || 'Next step'}
                    </h3>
                    <p className="text-xs/5 text-[#4b5060]">
                      {g.clientSummary || ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-smoke flex flex-wrap items-center gap-3">
            <button type="button" onClick={clearDraft} className={SECONDARY_ACTION_CLASS}>
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
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest mb-2">
            Renatus · Client Onboarding
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-forest">
            iOS App Store Intake
          </h1>
          <p className="text-sm text-[#4b5060] mt-2 max-w-2xl leading-6">
            This form collects everything we need to prepare your Apple App Store setup. Items you
            don’t have yet are clearly marked optional—your progress auto-saves in this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={clearDraft}
          className="min-h-11 shrink-0 text-xs/5 font-medium text-[#4b5060] hover:text-forest underline underline-offset-4 self-start sm:self-auto cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
        >
          Clear draft
        </button>
      </div>

      {/* Stepper Navigation */}
      <nav aria-label="Intake steps" className="mb-6">
        <div className="h-1.5 w-full bg-cloud rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-forest transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <ol className="flex flex-wrap gap-2">
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
                  className={`inline-flex min-h-11 items-center rounded-full border px-3 text-xs/4 font-medium transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
                    active
                      ? 'border-forest bg-forest text-canvas'
                      : visited
                        ? 'border-forest bg-forest/[0.06] text-forest hover:bg-forest/10 cursor-pointer'
                        : 'border-transparent bg-cloud text-[#5c6170] cursor-not-allowed'
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
          <p className="text-xs font-medium text-[#4b5060]">
            Step {currentStep.number} of {STEPS.length}
          </p>
          <h2 ref={stepHeadingRef} tabIndex={-1} className="text-xl sm:text-2xl font-semibold text-forest mt-1 scroll-mt-24">
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
                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                  <div>
                    <FieldLabel
                      htmlFor="legalName"
                      label="Legal Business Name"
                      required
                      helper="Registered entity name (e.g., Pty Ltd or sole trader). Apple uses this for legal verification."
                    />
                    <input
                      id="legalName"
                      aria-describedby={describedByFor('legalName', 'legalName-helper')}
                      aria-required="true"
                      aria-invalid={isInvalid('legalName')}
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
                      aria-describedby={describedByFor('brandName', 'brandName-helper')}
                      aria-required="true"
                      aria-invalid={isInvalid('brandName')}
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="e.g. The Mobility Collective"
                      value={answers.brandName}
                      onChange={(e) => update('brandName', e.target.value)}
                    />
                  </div>
                </div>

                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                  <div>
                    <FieldLabel htmlFor="contactName" label="Primary Contact Name" required />
                    <input
                      id="contactName"
                      aria-describedby={describedByFor('contactName')}
                      aria-required="true"
                      aria-invalid={isInvalid('contactName')}
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
                      aria-describedby={describedByFor('contactEmail', 'contactEmail-helper')}
                      aria-required="true"
                      aria-invalid={isInvalid('contactEmail')}
                      type="email"
                      autoComplete="email"
                      className={INPUT_CLASS}
                      placeholder="you@company.com"
                      value={answers.contactEmail}
                      onChange={(e) => update('contactEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                  <div>
                    <FieldLabel
                      htmlFor="phoneNumber"
                      label="Mobile / Phone"
                      required
                      helper="Apple requires a contact phone number with international country code."
                    />
                    <div className="flex items-start gap-2">
                      <SelectControl
                        aria-label="Country code"
                        aria-describedby={describedByFor('phoneNumber', 'phoneNumber-helper')}
                        wrapperClassName="max-w-[48%] shrink-0"
                        value={answers.phoneCountryCode}
                        onChange={(e) => update('phoneCountryCode', e.target.value)}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </SelectControl>
                      <input
                        id="phoneNumber"
                        aria-describedby={describedByFor('phoneNumber', 'phoneNumber-helper')}
                        aria-required="true"
                        aria-invalid={isInvalid('phoneNumber')}
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
                      aria-describedby={describedByFor('websiteUrl')}
                      aria-required="true"
                      aria-invalid={isInvalid('websiteUrl')}
                      type="url"
                      className={INPUT_CLASS}
                      placeholder="https://www.yourbusiness.com"
                      value={answers.websiteUrl}
                      onChange={(e) => update('websiteUrl', e.target.value)}
                    />
                  </div>
                </div>

                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                  <div>
                    <FieldLabel htmlFor="country" label="Country / Region of Registration" required />
                    <input
                      id="country"
                      aria-describedby={describedByFor('country')}
                      aria-required="true"
                      aria-invalid={isInvalid('country')}
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
                      aria-describedby="businessRegNumber-helper"
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
                    helperId="regulatedIndustries-helper"
                    helper="Apple requires regulated businesses to publish under their own company account."
                  />
                  <MultiSelectList
                    required
                    invalid={isInvalid('regulatedIndustries')}
                    describedBy="regulatedIndustries-helper"
                    name="Regulated industries"
                    options={REGULATED_OPTIONS}
                    values={answers.regulatedIndustries}
                    onChange={(v) => update('regulatedIndustries', v)}
                  />
                </div>

                <div>
                  <FieldLabel label="Publishing Account Preference" required />
                  <ChoiceList
                    required
                    invalid={isInvalid('publishingAccount')}
                    name="Publishing Account Preference"
                    options={PUBLISHING_ACCOUNT_OPTIONS}
                    value={answers.publishingAccount}
                    onChange={(v) => update('publishingAccount', v)}
                  />
                </div>

                {answers.publishingAccount === 'own' && (
                  <div className="rounded-xl border border-smoke bg-cloud/40 p-5 space-y-6">
                    <Callout title="Apple Organization Enrollment Timing">
                      Apple organization enrollment and identity verification currently take{' '}
                      <strong>2–6 weeks</strong> (converting a personal account to an organization
                      can take up to 60+ days). We recommend starting at least 6 weeks before your
                      target launch.
                    </Callout>

                    <div>
                      <FieldLabel label="Apple Developer Enrollment Status" required />
                      <ChoiceList
                        required
                        invalid={isInvalid('enrollmentStatus')}
                        name="Apple Developer Enrollment Status"
                        options={ENROLLMENT_STATUS_OPTIONS}
                        value={answers.enrollmentStatus}
                        onChange={(v) => update('enrollmentStatus', v)}
                      />
                    </div>

                    <div className={`${FIELD_ROW_CLASS} sm:grid-cols-3`}>
                      <div>
                        <FieldLabel
                          htmlFor="accountHolderEmail"
                          label="Apple Account Holder Email"
                          required={false}
                          helper="Needed to invite Renatus."
                        />
                        <input
                          id="accountHolderEmail"
                          aria-describedby={describedByFor('accountHolderEmail', 'accountHolderEmail-helper')}
                          aria-invalid={isInvalid('accountHolderEmail')}
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
                          aria-describedby="teamId-helper"
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
                          aria-describedby="dunsNumber-helper"
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
                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                  <div>
                    <FieldLabel
                      htmlFor="appName"
                      label="Preferred App Name"
                      required
                      helper={`2–30 characters (${answers.appName.trim().length}/30). What appears under the icon on iPhone.`}
                    />
                    <input
                      id="appName"
                      aria-describedby={describedByFor('appName', 'appName-helper')}
                      aria-required="true"
                      aria-invalid={isInvalid('appName')}
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
                    <SelectControl
                      id="primaryCategory"
                      aria-describedby={describedByFor('primaryCategory')}
                      aria-required="true"
                      aria-invalid={isInvalid('primaryCategory')}
                      value={answers.primaryCategory}
                      onChange={(e) => update('primaryCategory', e.target.value)}
                    >
                      {PRIMARY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </SelectControl>
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
                    aria-describedby={describedByFor('appSummary', 'appSummary-helper')}
                    aria-required="true"
                    aria-invalid={isInvalid('appSummary')}
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
                    required
                    invalid={isInvalid('distributionGoal')}
                    name="Distribution Goal"
                    options={DISTRIBUTION_GOAL_OPTIONS}
                    value={answers.distributionGoal}
                    onChange={(v) => update('distributionGoal', v)}
                  />
                </div>

                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                  <div>
                    <FieldLabel htmlFor="primaryLocale" label="Primary App Store Language / Locale" required />
                    <SelectControl
                      id="primaryLocale"
                      aria-required="true"
                      value={answers.primaryLocale}
                      onChange={(e) => update('primaryLocale', e.target.value)}
                    >
                      {PRIMARY_LOCALES.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </SelectControl>
                  </div>
                  <div>
                    <FieldLabel
                      label="Target Devices"
                      required
                      helperId="targetDevices-helper"
                      helper="Selecting iPad requires iPad-sized layouts and screenshots."
                    />
                    <ChoiceList
                      describedBy="targetDevices-helper"
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
                    helperId="ageRatingBand-helper"
                    helper="Apple’s current age bands are 4+, 9+, 13+, 16+, and 18+. Final rating is confirmed via Apple’s questionnaire."
                  />
                  <ChoiceList
                    required
                    describedBy="ageRatingBand-helper"
                    invalid={isInvalid('ageRatingBand')}
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
                    helperId="kidsCategory-helper"
                    helper="Kids Category apps have strict rules: no third-party ads or analytics, and parental gates on all links and purchases."
                  />
                  <ChoiceList
                    describedBy="kidsCategory-helper"
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
                    required
                    invalid={isInvalid('targetRegions')}
                    name="Target Regions"
                    options={TARGET_REGIONS}
                    values={answers.targetRegions}
                    onChange={(v) => update('targetRegions', v)}
                  />
                </div>

                <div className="pt-6 border-t border-smoke/70 space-y-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b5060]">
                    Draft App Store Copy (Optional — can finalize during build)
                  </p>
                  <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                    <div>
                      <FieldLabel
                        htmlFor="subtitle"
                        label="Subtitle"
                        required={false}
                        helper={`Short tagline under the app name (${answers.subtitle.length}/30).`}
                      />
                      <input
                        id="subtitle"
                        aria-describedby="subtitle-helper"
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
                        helperTone={keywordsTooLong ? 'error' : undefined}
                        helper={`Comma-separated search terms (${formattedKeywords.length}/100). Spaces are formatted automatically.`}
                      />
                      <div>
                        <input
                          id="keywords"
                          aria-describedby={describedByFor(
                            'keywords',
                            'keywords-helper',
                            keywordsTooLong ? 'keywords-error' : null,
                          )}
                          aria-invalid={keywordsTooLong || isInvalid('keywords')}
                          type="text"
                          className={INPUT_CLASS}
                          placeholder="mobility, recovery, pilates, stretching"
                          value={answers.keywords}
                          onChange={(e) => update('keywords', e.target.value)}
                        />
                        {keywordsTooLong && (
                          <p id="keywords-error" className="mt-1 text-xs/5 text-red-700">
                            Search keywords must be 100 characters or fewer (comma-separated).
                          </p>
                        )}
                      </div>
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
                      aria-describedby="promoText-helper"
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
                      aria-describedby="draftDescription-helper"
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
                    ref={uploadDropzoneRef}
                    tabIndex={-1}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    className="rounded-xl border-2 border-dashed border-graphite bg-cloud/30 p-5 text-left hover:border-forest transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                  >
                    <input
                      ref={fileInputRef}
                      id="asset-upload"
                      aria-describedby="asset-upload-helper asset-upload-formats"
                      type="file"
                      tabIndex={-1}
                      multiple
                      accept=".png,.svg,.jpg,.jpeg,.webp,.pdf,.zip,.eps,.ttf,.otf,.woff2"
                      className="sr-only"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <p role="status" aria-live="polite" className="text-sm font-medium text-forest">
                      {uploading ? 'Uploading files…' : 'Drag & drop brand files here, or browse'}
                    </p>
                    <p id="asset-upload-formats" className="text-xs/5 text-[#4b5060] mt-1">
                      PNG, SVG, JPG, WEBP, PDF, ZIP, EPS, TTF, OTF, WOFF2
                    </p>
                    <button
                      ref={chooseFilesBtnRef}
                      type="button"
                      disabled={uploading}
                      aria-describedby="asset-upload-helper asset-upload-formats"
                      onClick={() => fileInputRef.current?.click()}
                      className={`${SECONDARY_ACTION_CLASS} mt-4`}
                    >
                      {uploading ? 'Uploading…' : 'Choose files'}
                    </button>
                  </div>

                  {uploadError && (
                    <p className="text-xs/5 text-red-700 mt-2" role="alert">
                      {uploadError}
                    </p>
                  )}

                  {assets.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {assets.map((asset) => (
                        <li
                          key={asset.path}
                          className="flex items-center gap-2 rounded-lg border border-smoke bg-canvas px-3.5 py-2 text-xs/5"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="block font-medium text-forest [overflow-wrap:anywhere]">{asset.name}</span>
                            <span className="block text-[#4b5060]">
                              ({Math.max(1, Math.round((asset.size || 0) / 1024))} KB)
                            </span>
                          </div>
                          <button
                            ref={(el) => {
                              if (el) {
                                removeBtnRefs.current[asset.path] = el;
                              } else {
                                delete removeBtnRefs.current[asset.path];
                              }
                            }}
                            type="button"
                            aria-label={`Remove ${asset.name}`}
                            onClick={() => handleRemoveAsset(asset)}
                            className="min-h-[44px] px-3 shrink-0 rounded-lg text-red-700 hover:underline font-medium cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
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
                    aria-describedby={describedByFor('brandKitUrl', 'brandKitUrl-helper')}
                    aria-invalid={isInvalid('brandKitUrl')}
                    type="url"
                    className={INPUT_CLASS}
                    placeholder="https://drive.google.com/..."
                    value={answers.brandKitUrl}
                    onChange={(e) => update('brandKitUrl', e.target.value)}
                  />
                </div>

                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
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
                      aria-describedby="iconBackground-helper"
                      type="text"
                      className={INPUT_CLASS}
                      placeholder="e.g. Dark Blue #1E2D40 with white mark"
                      value={answers.iconBackground}
                      onChange={(e) => update('iconBackground', e.target.value)}
                    />
                  </div>
                </div>

                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
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
                    <SelectControl
                      id="brandFontLicense"
                      value={answers.brandFontLicense}
                      onChange={(e) => update('brandFontLicense', e.target.value)}
                    >
                      <option value="">Select (optional)</option>
                      <option value="free_google">Free / Google Font</option>
                      <option value="paid_owned">Paid license owned</option>
                      <option value="unsure">Not sure</option>
                    </SelectControl>
                  </div>
                </div>

                <div>
                  <FieldLabel label="Third-Party Content & IP Rights" required />
                  <ChoiceList
                    required
                    invalid={isInvalid('contentRights')}
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
                    helperId="hasPrivacyPolicy-helper"
                    helper="Apple requires a live Privacy Policy both on your App Store listing and accessible inside the app."
                  />
                  <ChoiceList
                    required
                    describedBy="hasPrivacyPolicy-helper"
                    invalid={isInvalid('hasPrivacyPolicy')}
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
                      aria-describedby={describedByFor('privacyPolicyUrl')}
                      aria-required="true"
                      aria-invalid={isInvalid('privacyPolicyUrl')}
                      type="url"
                      className={INPUT_CLASS}
                      placeholder="https://www.yourbusiness.com/privacy"
                      value={answers.privacyPolicyUrl}
                      onChange={(e) => update('privacyPolicyUrl', e.target.value)}
                    />
                  </div>
                )}

                {answers.hasPrivacyPolicy === 'no' && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 space-y-6">
                    <p className="text-sm/6 text-amber-950 font-medium">
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

                <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                  <div>
                    <FieldLabel
                      htmlFor="supportUrl"
                      label="Support URL"
                      required={false}
                      helper="A live contact or support page on your website (e.g. yoursite.com/contact)."
                    />
                    <input
                      id="supportUrl"
                      aria-describedby={describedByFor('supportUrl', 'supportUrl-helper')}
                      aria-invalid={isInvalid('supportUrl')}
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
                      aria-describedby={describedByFor('supportEmail', 'supportEmail-helper')}
                      aria-required="true"
                      aria-invalid={isInvalid('supportEmail')}
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
                    aria-describedby={describedByFor('termsUrl', 'termsUrl-helper')}
                    aria-invalid={isInvalid('termsUrl')}
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
                    required
                    invalid={isInvalid('hasAccounts')}
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
                  <div className="space-y-6">
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
                    required
                    invalid={isInvalid('healthInvolvement')}
                    name="Health & Fitness Involvement"
                    options={HEALTH_OPTIONS}
                    values={answers.healthInvolvement}
                    onChange={(v) => update('healthInvolvement', v)}
                  />
                  {answers.healthInvolvement.some((v) => v !== 'none') && (
                    <div className="mt-6">
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
                    required
                    invalid={isInvalid('socialAiFeatures')}
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
                    helperId="userDataCollected-helper"
                    helper="Select anything you expect the app to collect—or choose Not sure yet if you haven’t finalized features."
                  />
                  <MultiSelectList
                    required
                    invalid={isInvalid('userDataCollected')}
                    describedBy="userDataCollected-helper"
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
                    helperId="trackingAds-helper"
                    helper="Running Instagram/Google ads for your business does not count here—this is only for tracking tools inside the mobile app."
                  />
                  <ChoiceList
                    required
                    describedBy="trackingAds-helper"
                    invalid={isInvalid('trackingAds')}
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
                    required
                    invalid={isInvalid('monetization')}
                    name="Monetization"
                    options={MONETIZATION_OPTIONS}
                    values={answers.monetization}
                    onChange={(v) => update('monetization', v)}
                  />
                </div>

                {showMonetizationCallout && (
                  <div className="space-y-6">
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
                          required
                          invalid={isInvalid('paidAppsStatus')}
                          name="Apple Paid Apps Setup Status"
                          options={PAID_APPS_STATUS_OPTIONS}
                          value={answers.paidAppsStatus}
                          onChange={(v) => update('paidAppsStatus', v)}
                        />
                      </div>
                    )}

                    <div className={`${FIELD_ROW_CLASS} sm:grid-cols-2`}>
                      <div>
                        <FieldLabel
                          htmlFor="financeContactName"
                          label="Finance / Billing Contact Name"
                          required={false}
                          helper="Optional — if different from primary contact."
                        />
                        <input
                          id="financeContactName"
                          aria-describedby="financeContactName-helper"
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
                          aria-describedby={describedByFor('financeContactEmail')}
                          aria-invalid={isInvalid('financeContactEmail')}
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
                    aria-describedby="reviewNotes-helper"
                    rows={4}
                    maxLength={2000}
                    className={INPUT_CLASS}
                    placeholder="Anything else we should know before setting up your App Store listing..."
                    value={answers.reviewNotes}
                    onChange={(e) => update('reviewNotes', e.target.value)}
                  />
                </div>

                <label className="flex min-h-11 items-start gap-3 rounded-xl border border-graphite px-4 py-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sendClientCopy}
                    onChange={(e) => setSendClientCopy(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-forest focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                  />
                  <span className="text-sm/5 font-medium text-forest wrap-anywhere">
                    Send me a confirmation receipt email ({answers.contactEmail || 'your email'})
                  </span>
                </label>

                {/* Expandable Review Summary Panel */}
                <div className="rounded-xl border border-smoke bg-cloud/30">
                  <button
                    type="button"
                    aria-expanded={reviewOpen}
                    onClick={() => setReviewOpen((o) => !o)}
                    className="w-full min-h-11 rounded-xl p-5 flex items-baseline justify-between gap-3 text-left text-sm font-semibold text-forest cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                  >
                    <span>Review Summary</span>
                    <span className="text-xs text-[#4b5060]">{reviewOpen ? 'Hide' : 'Show'}</span>
                  </button>
                  {reviewOpen && (
                    <dl className="grid gap-5 p-5 text-xs/5 border-t border-smoke/60 [&>div]:min-w-0 [&>div>dd]:mt-1 sm:grid-cols-2 sm:gap-y-0 sm:[&>div:not([data-full-row])]:row-span-2 sm:[&>div:not([data-full-row])]:grid sm:[&>div:not([data-full-row])]:grid-rows-subgrid sm:[&>div:not([data-full-row])]:pb-5 sm:[&>div:not([data-full-row])>dd]:mt-0 sm:[&>div:not([data-full-row])>dd]:pt-1">
                      <div>
                        <dt className="text-[#4b5060]">Business / Brand</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {answers.brandName} ({answers.legalName}) · {answers.country}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Primary Contact</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {answers.contactName} · {answers.contactEmail} · {e164Phone}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Publishing Account &amp; Regulated Status</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {labelForOption(PUBLISHING_ACCOUNT_OPTIONS, answers.publishingAccount)}
                          {answers.publishingAccount === 'own' && answers.enrollmentStatus
                            ? ` (${labelForOption(ENROLLMENT_STATUS_OPTIONS, answers.enrollmentStatus)})`
                            : ''}{' '}
                          · {labelsForValues(REGULATED_OPTIONS, answers.regulatedIndustries)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">App Name, Category &amp; Devices</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {answers.appName} — {answers.primaryCategory} ({answers.targetDevices},{' '}
                          {answers.primaryLocale})
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Distribution, Age &amp; Regions</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {labelForOption(DISTRIBUTION_GOAL_OPTIONS, answers.distributionGoal)} · Age:{' '}
                          {labelForOption(AGE_RATING_OPTIONS, answers.ageRatingBand)} (Kids:{' '}
                          {labelForOption(YES_NO_UNSURE, answers.kidsCategory)}) ·{' '}
                          {labelsForValues(TARGET_REGIONS, answers.targetRegions)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Subtitle</dt>
                        <dd className="font-medium text-forest wrap-anywhere">{answers.subtitle || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Promotional Text</dt>
                        <dd className="font-medium text-forest wrap-anywhere">{answers.promoText || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Search Keywords</dt>
                        <dd className="font-medium text-forest wrap-anywhere">{formattedKeywords || 'Not provided'}</dd>
                      </div>
                      <div data-full-row="true" className="sm:col-span-2 sm:pb-5">
                        <dt className="text-[#4b5060]">Draft App Store Description</dt>
                        <dd className="font-medium text-forest whitespace-pre-wrap wrap-anywhere mt-1">{answers.draftDescription || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Brand Assets</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {assets.length > 0
                            ? assets.map((f) => f.name).join(', ')
                            : 'No files uploaded directly'}
                          {answers.brandKitUrl ? ` · Folder link provided` : ''}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Legal, Privacy &amp; Accounts</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          Privacy:{' '}
                          {answers.hasPrivacyPolicy === 'yes'
                            ? answers.privacyPolicyUrl
                            : 'Needs setup'}{' '}
                          · Support: {answers.supportEmail} · Accounts:{' '}
                          {labelForOption(YES_NO_UNSURE, answers.hasAccounts)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Health, Social &amp; AI</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          Health: {labelsForValues(HEALTH_OPTIONS, answers.healthInvolvement)} ·
                          Social/AI: {labelsForValues(SOCIAL_AI_OPTIONS, answers.socialAiFeatures)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Data, Tracking &amp; Security</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          Data: {labelsForValues(USER_DATA_OPTIONS, answers.userDataCollected)} ·
                          Tracking: {labelForOption(TRACKING_OPTIONS, answers.trackingAds)} ·{' '}
                          {labelForOption(ENCRYPTION_OPTIONS, answers.encryption)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Monetization &amp; Paid Apps</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {labelsForValues(MONETIZATION_OPTIONS, answers.monetization)}
                          {needsApplePaidSetup && answers.paidAppsStatus
                            ? ` (${labelForOption(PAID_APPS_STATUS_OPTIONS, answers.paidAppsStatus)})`
                            : ''}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#4b5060]">Target Launch Window</dt>
                        <dd className="font-medium text-forest wrap-anywhere">
                          {answers.launchWindow ? labelForOption(LAUNCH_WINDOW_OPTIONS, answers.launchWindow) : 'Not provided'}
                        </dd>
                      </div>
                      <div data-full-row="true" className="sm:col-span-2">
                        <dt className="text-[#4b5060]">Special Notes for Renatus or Apple Review</dt>
                        <dd className="font-medium text-forest whitespace-pre-wrap wrap-anywhere mt-1">{answers.reviewNotes || 'Not provided'}</dd>
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
            id="intake-step-error"
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm/6 text-red-800"
          >
            {stepError.message}
          </div>
        )}

        {/* Footer Nav */}
        <div className="mt-8 pt-6 border-t border-smoke/70 flex items-center justify-between gap-4">
          {stepIndex > 0 ? (
            <button type="button" onClick={goBack} className={SECONDARY_ACTION_CLASS}>
              &larr; Back
            </button>
          ) : (
            <span />
          )}

          {stepIndex < STEPS.length - 1 ? (
            <button
              key="next-step"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                goNext();
              }}
              className={PRIMARY_ACTION_CLASS}
            >
              Next &rarr;
            </button>
          ) : (
            <button
              key="submit-intake"
              type="submit"
              disabled={submitting || uploading}
              className={PRIMARY_ACTION_CLASS}
            >
              {submitting ? 'Submitting…' : 'Submit Intake'}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
