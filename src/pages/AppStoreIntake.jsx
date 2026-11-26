import { useEffect, useRef, useState } from 'react';
import {
  ALLOWED_EXTENSIONS,
  COUNTRY_CODES,
  DEFAULT_ANSWERS,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  MAX_TOTAL_SIZE_BYTES,
  QUICK_INTAKE_VERSION,
  STORAGE_KEY,
  createUuidV4,
  getExtension,
  restoreIntakeDraft,
  validateQuickIntakeAnswers,
} from '../data/appStoreIntake.js';

const CONTROL = 'min-h-11 min-w-0 rounded-lg border border-graphite bg-canvas px-3 py-2 text-base text-forest placeholder:text-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest aria-invalid:border-[#a42b2b] disabled:bg-cloud';
const ACTION = 'inline-flex min-h-11 items-center justify-center rounded-full border border-forest px-5 py-2 text-sm font-semibold text-forest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest enabled:hover:bg-cloud disabled:cursor-not-allowed disabled:opacity-60';
const PRIMARY_ACTION = ACTION + ' bg-spring text-[#08483d] enabled:hover:bg-forest enabled:hover:text-canvas';
const HELP = 'text-sm/5 text-[#4b5060]';
const ERROR = 'text-sm/5 text-[#a42b2b]';
const KICKOFF = 'On the kickoff call, we’ll discuss how your app will use personal information and any health or fitness features you have in mind.';

function readDraft() {
  try {
    return restoreIntakeDraft(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

async function intakeRequest(path, method, payload) {
  const response = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.error || 'The request failed. Please try again.'), {
      fieldErrors: data.fieldErrors,
    });
  }
  return data;
}

function Field({ name, label, optional, hint, error, children }) {
  const hintId = hint ? name + '-hint' : undefined;
  const errorId = error ? name + '-error' : undefined;
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-forest">
        {label}
        {optional && <span className="ml-2 font-normal text-[#4b5060]">Optional</span>}
      </label>
      {hint && <p id={hintId} className={HELP}>{hint}</p>}
      {children({
        id: name,
        'aria-invalid': Boolean(error) || undefined,
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
      })}
      {error && <p id={errorId} className={ERROR}>{error}</p>}
    </div>
  );
}

function IntakeGroup({ title, children }) {
  return (
    <fieldset className="min-w-0 border-t border-smoke pt-4 pb-6">
      <legend className="pr-4 text-lg font-semibold text-forest">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function AppStoreIntake() {
  const [initial] = useState(readDraft);
  const [sessionId, setSessionId] = useState(() => initial?.sessionId || createUuidV4());
  const [answers, setAnswers] = useState(initial?.answers || DEFAULT_ANSWERS);
  const [assets, setAssets] = useState(initial?.assets || []);
  const [sendClientCopy, setSendClientCopy] = useState(initial?.sendClientCopy ?? true);
  const [honeypot, setHoneypot] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [operation, setOperation] = useState('');
  const [reference, setReference] = useState('');
  const busy = useRef(false);
  const fileInput = useRef(null);
  const chooseFiles = useRef(null);
  const heading = useRef(null);
  const submissionAlert = useRef(null);
  const removedFocusedFile = useRef(false);
  const submitting = operation === 'submit';
  const uploading = operation === 'upload';
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const hasDraft = assets.length > 0 || !sendClientCopy ||
    Object.keys(DEFAULT_ANSWERS).some((key) => answers[key] !== DEFAULT_ANSWERS[key]);

  useEffect(() => {
    try {
      if (reference || !hasDraft) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          submissionVersion: QUICK_INTAKE_VERSION,
          sessionId,
          answers,
          assets,
          sendClientCopy,
        }));
      }
    } catch {
      // Intake still works when browser storage is unavailable.
    }
  }, [answers, assets, hasDraft, reference, sendClientCopy, sessionId]);

  useEffect(() => {
    if (reference) heading.current?.focus();
  }, [reference]);

  useEffect(() => {
    if (hasFieldErrors || submitError) submissionAlert.current?.focus();
  }, [hasFieldErrors, submitError]);

  useEffect(() => {
    if (operation || !removedFocusedFile.current) return;
    removedFocusedFile.current = false;
    if (document.activeElement === document.body) chooseFiles.current?.focus();
  }, [operation]);

  function update(field, value) {
    setAnswers((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => {
      const next = { ...previous };
      if (field === 'brandNameMatchesLegalName') delete next.brandName;
      delete next[field === 'phoneCountryCode' || field === 'phoneNumber' ? 'contactPhone' : field];
      return next;
    });
  }

  function clearDraft() {
    if (busy.current) return;
    setSessionId(createUuidV4());
    setAnswers(DEFAULT_ANSWERS);
    setAssets([]);
    setSendClientCopy(true);
    setHoneypot('');
    setFieldErrors({});
    setSubmitError('');
    setUploadError('');
    setReference('');
    if (fileInput.current) fileInput.current.value = '';
    requestAnimationFrame(() => heading.current?.focus());
  }

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (busy.current || files.length === 0) return;
    setUploadError('');
    if (assets.length + files.length > MAX_FILES) {
      setUploadError('You can upload up to 10 files.');
      return;
    }

    const totalBytes = [...assets, ...files].reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
      setUploadError('Your uploads must total 100 MB or less.');
      return;
    }

    for (const file of files) {
      if (!ALLOWED_EXTENSIONS.has(getExtension(file.name))) {
        setUploadError('Choose a supported file type for “' + file.name + '”.');
        return;
      }
      if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError('“' + file.name + '” must be between 1 byte and 25 MB.');
        return;
      }
    }

    busy.current = true;
    setOperation('upload');
    try {
      for (const file of files) {
        const mimeType = file.type || 'application/octet-stream';
        const { signedUrl, path } = await intakeRequest('/api/app-store-intake/upload-url', 'POST', {
          sessionId,
          filename: file.name,
          mimeType,
          sizeBytes: file.size,
          website: honeypot,
        });
        const uploaded = await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': mimeType },
          body: file,
        });
        if (!uploaded.ok) throw new Error('Could not upload “' + file.name + '”. Please try again.');
        const asset = { path, name: file.name, size: file.size, mimeType };
        setAssets((previous) => [...previous, asset]);
      }
    } catch (error) {
      setUploadError(error.message || 'Could not upload your files. Please try again.');
    } finally {
      busy.current = false;
      setOperation('');
    }
  }

  async function removeAsset(asset, button) {
    if (busy.current) return;
    busy.current = true;
    setOperation('remove');
    setUploadError('');
    const wasFocused = document.activeElement === button;
    try {
      await intakeRequest('/api/app-store-intake/upload', 'DELETE', { sessionId, path: asset.path });
      removedFocusedFile.current = wasFocused;
      setAssets((previous) => previous.filter(({ path }) => path !== asset.path));
    } catch (error) {
      setUploadError(error.message || 'Could not remove the file. Please try again.');
    } finally {
      busy.current = false;
      setOperation('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy.current) return;
    const { phoneNumber, ...fields } = answers;
    const payloadAnswers = { ...fields, contactPhone: phoneNumber };
    const { errors } = validateQuickIntakeAnswers(payloadAnswers);
    setSubmitError('');
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      submissionAlert.current?.focus();
      return;
    }

    busy.current = true;
    setOperation('submit');
    try {
      const data = await intakeRequest('/api/app-store-intake', 'POST', {
        submissionVersion: QUICK_INTAKE_VERSION,
        sessionId,
        answers: payloadAnswers,
        assets: assets.map(({ path, name }) => ({ path, name })),
        sendClientCopy,
        website: honeypot,
      });
      if (!data.ok || !data.id) throw new Error('Could not confirm your submission. Please try again.');
      setReference(data.id);
    } catch (error) {
      if (error.fieldErrors) setFieldErrors(error.fieldErrors);
      else setSubmitError(error.message || 'Could not send your intake. Please try again.');
    } finally {
      busy.current = false;
      setOperation('');
    }
  }

  function renderTextField(name, label, { optional, hint, value = answers[name], ...inputProps } = {}) {
    return (
      <Field name={name} label={label} optional={optional} hint={hint} error={fieldErrors[name]}>
        {(fieldProps) => (
          <input
            {...inputProps}
            {...fieldProps}
            className={CONTROL + ' w-full'}
            required={!optional && !inputProps.disabled}
            value={value}
            onChange={(event) => update(name, event.target.value)}
          />
        )}
      </Field>
    );
  }

  if (reference) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-smoke bg-cloud/40 p-6 sm:p-9">
          <h1 ref={heading} tabIndex={-1} className="heading-display scroll-mt-24 text-3xl sm:text-4xl">
            We’ve received your app details
          </h1>
          <p className="mt-4 max-w-prose text-base/7 text-[#4b5060]">{KICKOFF}</p>
          <p className="mt-4 text-sm/6">
            Your reference is <code className="wrap-anywhere">{reference}</code>
          </p>
          <button type="button" onClick={clearDraft} className={ACTION + ' mt-6'}>
            Start another intake
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-9 sm:px-6 sm:py-12">
      <div className="mb-9 grid items-start gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] sm:gap-8">
        <div>
          <h1 ref={heading} tabIndex={-1} className="heading-display scroll-mt-24 text-4xl sm:text-5xl">
            Tell us about your app
          </h1>
          <p className="mt-3 max-w-md text-base/7 text-[#4b5060]">
            Share your business details, branding and app idea so we can prepare for kickoff.
          </p>
        </div>
        <div className="rounded-r-xl border-l-4 border-spring bg-cloud/55 px-4 py-3">
          <h2 className="text-sm font-semibold">What happens next</h2>
          <p className={'mt-1 ' + HELP}>
            We’ll discuss privacy and any health or fitness features at kickoff. Renatus prepares the App Store submission during the build.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div hidden aria-hidden="true">
          <input
            type="text"
            name="website"
            aria-label="Leave this field blank"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>
        {(hasFieldErrors || submitError) && (
          <div
            ref={submissionAlert}
            tabIndex={-1}
            role="alert"
            className="mb-5 scroll-mt-24 rounded-lg border border-[#a42b2b] bg-[#fff6f5] px-4 py-3 text-sm text-[#a42b2b]"
          >
            {submitError || 'Check the highlighted fields and try again.'}
          </div>
        )}

        <fieldset disabled={submitting} className="min-w-0">
          <IntakeGroup title="Business and contact">
            <div className="grid gap-4 sm:grid-cols-2">
              {renderTextField('legalName', 'Legal business name', { maxLength: 200 })}
              <div className="space-y-2">
                {renderTextField('brandName', 'Trading or brand name', {
                  autoComplete: 'organization',
                  disabled: answers.brandNameMatchesLegalName,
                  maxLength: 200,
                  value: answers.brandNameMatchesLegalName ? answers.legalName : answers.brandName,
                })}
                <label className="flex min-h-9 w-fit items-center gap-2 text-sm text-forest">
                  <input
                    type="checkbox"
                    className="size-4 shrink-0 accent-forest"
                    checked={answers.brandNameMatchesLegalName}
                    onChange={(event) => update('brandNameMatchesLegalName', event.target.checked)}
                  />
                  Same as the legal business name
                </label>
              </div>
              {renderTextField('contactName', 'Primary contact name', { autoComplete: 'name', maxLength: 200 })}
              {renderTextField('contactEmail', 'Contact email', { type: 'email', autoComplete: 'email' })}
              <Field name="contactPhone" label="Contact phone" error={fieldErrors.contactPhone}>
                {(fieldProps) => (
                  <div className="flex gap-2">
                    <select
                      aria-label="Phone country code"
                      autoComplete="tel-country-code"
                      className={CONTROL + ' shrink-0'}
                      value={answers.phoneCountryCode}
                      onChange={(event) => update('phoneCountryCode', event.target.value)}
                    >
                      {COUNTRY_CODES.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                    </select>
                    <input
                      {...fieldProps}
                      type="tel"
                      required
                      autoComplete="tel-national"
                      className={CONTROL + ' w-full'}
                      value={answers.phoneNumber}
                      onChange={(event) => update('phoneNumber', event.target.value)}
                    />
                  </div>
                )}
              </Field>
              {renderTextField('websiteUrl', 'Business website', {
                optional: true, type: 'url', autoComplete: 'url', placeholder: 'https://',
              })}
            </div>
          </IntakeGroup>

          <IntakeGroup title="Brand">
            <div className="grid items-start gap-4 sm:grid-cols-2">
              <div
                className="min-w-0 rounded-xl border border-dashed border-graphite bg-cloud/35 p-4"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  uploadFiles(event.dataTransfer.files);
                }}
              >
                <p className="text-sm font-semibold">
                  Logo files <span className="ml-2 font-normal text-[#4b5060]">Optional</span>
                </p>
                <p id="logo-help" className={'mt-1 ' + HELP}>
                  Drop your logo or brand kit here, or choose files. Up to 10 files, 25 MB each, 100 MB total.
                </p>
                <p className={'mt-1 ' + HELP}>PNG, SVG, JPG, WebP, PDF, ZIP, EPS, TTF, OTF or WOFF2.</p>
                <input
                  ref={fileInput}
                  type="file"
                  hidden
                  multiple
                  accept={[...ALLOWED_EXTENSIONS].join(',')}
                  onChange={(event) => {
                    uploadFiles(event.currentTarget.files);
                    event.currentTarget.value = '';
                  }}
                />
                <button
                  type="button"
                  ref={chooseFiles}
                  disabled={Boolean(operation)}
                  aria-describedby="logo-help"
                  className={ACTION + ' mt-3 bg-canvas'}
                  onClick={() => fileInput.current?.click()}
                >
                  Choose files
                </button>
                {uploading && <p role="status" className={'mt-2 ' + HELP}>Uploading files…</p>}
                {assets.length > 0 && (
                  <ul className="mt-3 divide-y divide-smoke" aria-label="Uploaded files">
                    {assets.map((asset) => (
                      <li key={asset.path} className="flex items-center justify-between gap-2 py-1 text-sm">
                        <span className="min-w-0 wrap-anywhere">{asset.name}</span>
                        <button
                          type="button"
                          aria-label={'Remove ' + asset.name}
                          disabled={Boolean(operation)}
                          className="min-h-10 shrink-0 px-2 text-sm underline focus-visible:outline-2 focus-visible:outline-forest disabled:opacity-60"
                          onClick={(event) => removeAsset(asset, event.currentTarget)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {uploadError && <p role="alert" className={'mt-2 wrap-anywhere ' + ERROR}>{uploadError}</p>}
              </div>
              <div className="space-y-4">
                {renderTextField('brandKitUrl', 'Brand kit link', {
                  optional: true, type: 'url', placeholder: 'https://', hint: 'Share a link if your logo is already in a brand kit.',
                })}
                {renderTextField('brandColors', 'Brand colours', {
                  optional: true, maxLength: 300, placeholder: '#126656 or forest green',
                })}
              </div>
            </div>
          </IntakeGroup>

          <IntakeGroup title="App idea">
            <div className="space-y-4">
              {renderTextField('appName', 'Preferred app name', { maxLength: 30 })}
              <Field
                name="appSummary"
                label="Short description"
                hint="In two or three sentences, tell us who the app is for and what they’ll do in it."
                error={fieldErrors.appSummary}
              >
                {(fieldProps) => (
                  <textarea
                    {...fieldProps}
                    className={CONTROL + ' block w-full resize-y'}
                    rows={4}
                    maxLength={2000}
                    required
                    value={answers.appSummary}
                    onChange={(event) => update('appSummary', event.target.value)}
                  />
                )}
              </Field>
            </div>
          </IntakeGroup>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-smoke pt-5">
            <label className="flex min-h-10 items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 shrink-0 accent-forest"
                checked={sendClientCopy}
                onChange={(event) => setSendClientCopy(event.target.checked)}
              />
              Email me a confirmation
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={ACTION} onClick={clearDraft} disabled={!hasDraft || Boolean(operation)}>
                Clear draft
              </button>
              <button type="submit" className={PRIMARY_ACTION} disabled={Boolean(operation)}>
                {submitting ? 'Sending…' : 'Send app details'}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
