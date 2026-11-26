'use strict';

const stages = [
  {
    id: 'kickoff', label: 'Kickoff and Apple account', navLabel: 'Kickoff',
    fields: ['publishing-account', 'org-enrollment-status', 'account-holder-team-duns', 'registration-country',
      'business-reg-number', 'regulated-industries', 'target-devices', 'content-rights', 'health-fitness-medical',
      'distribution-method', 'availability', 'monetization-price-schedule', 'paid-apps-tax-banking'],
  },
  {
    id: 'build', label: 'Build verification', navLabel: 'Build',
    fields: ['build', 'user-accounts-deletion', 'social-login-siwa', 'social-ugc-ai-features',
      'in-app-tracking-att', 'privacy-manifest', 'export-compliance', 'purpose-strings'],
  },
  {
    id: 'legal', label: 'Legal approval', navLabel: 'Legal',
    fields: ['privacy-policy-url', 'eula-terms', 'privacy-choices-url'],
  },
  {
    id: 'listing', label: 'App Store listing', navLabel: 'Listing',
    fields: ['platforms', 'store-app-name', 'primary-language', 'bundle-id', 'sku', 'user-access',
      'subtitle', 'primary-category', 'secondary-category', 'age-rating', 'kids-category', 'eu-dsa',
      'china-compliance', 'icon-background', 'brand-fonts', 'app-icon', 'iphone-screenshots',
      'ipad-screenshots', 'app-previews', 'promotional-text', 'description', 'keywords', 'support-url',
      'support-email', 'marketing-url', 'whats-new', 'version-number', 'copyright',
      'release-option-launch-window', 'routing-coverage', 'user-data-nutrition-labels',
      'iap-subscriptions', 'pre-order'],
  },
  {
    id: 'review', label: 'App Review and handoff', navLabel: 'App Review',
    fields: ['review-contact-name', 'review-contact-phone', 'review-contact-email',
      'demo-account', 'review-notes', 'review-attachment'],
  },
];

const verifyOnBuild = new Set([
  'age-rating', 'app-icon', 'iphone-screenshots', 'ipad-screenshots', 'app-previews', 'whats-new',
  'build', 'routing-coverage', 'user-accounts-deletion', 'demo-account', 'social-login-siwa',
  'review-notes', 'review-attachment', 'user-data-nutrition-labels', 'health-fitness-medical',
  'social-ugc-ai-features', 'in-app-tracking-att', 'privacy-manifest', 'iap-subscriptions',
  'export-compliance', 'purpose-strings',
]);
const fieldBindings = {
  'publishing-account': ['account'],
  'org-enrollment-status': ['enrolment'],
  'account-holder-team-duns': ['account-holder', 'team-id', 'duns-number'],
  'health-fitness-medical': ['fitness', 'health-kit', 'health-data', 'clinical', 'no-health-features'],
  build: ['build'],
  'support-url': ['support'],
  'demo-account': ['signin', 'review-tested'],
  'review-notes': ['notes'],
};
const shortFields = {
  'registration-country': 100, 'business-reg-number': 80, 'store-app-name': 30, sku: 100,
  subtitle: 30, 'promotional-text': 170, 'review-contact-name': 200,
};
const fieldHints = {
  'app-icon': 'Record where the approved asset is stored or how it was verified in the build.',
  'iphone-screenshots': 'Record the screenshot folder or App Store Connect upload.',
  'ipad-screenshots': 'Record the screenshot folder or App Store Connect upload for iPad.',
  'review-attachment': 'Record the attachment location or App Store Connect upload.',
  'paid-apps-tax-banking': 'Record the agreement status and finance contact. Enter tax and banking information in App Store Connect.',
  'privacy-policy-url': 'Record the published URL for the approved version.',
  'eula-terms': 'Record the standard or custom EULA choice and where it is configured.',
};
const statuses = {
  '': 'Not started', drafted: 'Drafted', 'awaiting-build': 'Awaiting build',
  verified: 'Verified', 'not-applicable': 'Not applicable',
};
const requirements = { required: 'Required', conditional: 'Conditional', optional: 'Optional' };
const catalogue = typeof APP_STORE_CONNECT_SECTIONS === 'undefined' ? [] : APP_STORE_CONNECT_SECTIONS;
const fields = new Map(catalogue.flatMap(section => section.fields)
  .filter(field => field.source !== 'intake')
  .map(field => [field.id, field]));
const owners = new Map(stages.flatMap(stage => stage.fields.map(id => [id, stage])));
const catalogueReady = fields.size > 0 && owners.size === fields.size && [...fields.keys()].every(id => owners.has(id));

const $ = id => document.getElementById(id);
const form = $('step-2');
const status = $('status');
const catalogueControls = new Map();
const checklistRows = new Map();
const storageKey = 'renatus-step2-wizard';
const legacyKey = 'renatus-step2-prototype';
const drafts = new Map();
const sample = window.renatusDemoIntake;
let activeStage = 0;
let checklistOpen = false;
let activeReference = '';
let previousBuild = '';
let signoff = null;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(text, handler, className = 'metadata-jump') {
  const node = element('button', text, className);
  node.type = 'button';
  node.addEventListener('click', handler);
  return node;
}

function addQuestion(saved = {}, focus = false) {
  const question = element('div', '', 'question grid');
  const text = element('input');
  text.value = saved.text || '';
  const owner = element('input');
  owner.value = saved.owner || '';
  const due = element('select');
  due.add(new Option('Choose a stage', ''));
  for (const stage of stages) due.add(new Option(stage.label, stage.id));
  due.value = saved.due || '';
  for (const [label, control] of [['Question', text], ['Owner', owner], ['Due stage', due]]) {
    const field = element('label', label, label === 'Question' ? 'wide' : '');
    field.append(control);
    question.append(field);
  }
  const remove = button('Remove question', () => {
    question.remove();
    status.textContent = '';
    $('add-question').focus();
  });
  question.append(remove);
  $('questions').append(question);
  if (focus) text.focus();
}

function captureQuestions() {
  return [...$('questions').querySelectorAll('.question')].map(row => {
    const [text, owner, due] = [...row.querySelectorAll('input,select')].map(controlValue);
    return { text, owner, due };
  }).filter(row => row.text || row.owner || row.due);
}

function renderField(field) {
  const { id } = field;
  const slot = form.querySelector(`[data-field-slot="${id}"]`);
  const item = slot || element('section', '', 'metadata-item');
  item.dataset.fieldId = id;
  const progress = element('select');
  progress.name = 'metadata-status-' + id;
  for (const [value, label] of Object.entries(statuses)) {
    if (value === 'not-applicable' && field.req === 'required') continue;
    progress.add(new Option(label, value));
  }
  progress.value = verifyOnBuild.has(id) ? 'awaiting-build' : '';
  const progressLabel = element('label', slot ? field.name + ' progress' : 'Progress');
  progress.setAttribute('aria-label', field.name + ' progress');
  progressLabel.append(progress);

  let inputs;
  if (slot) {
    slot.classList.add('field-progress');
    inputs = fieldBindings[id].map($);
    slot.append(progressLabel);
  } else {
    const heading = element('h3', field.name);
    heading.id = 'metadata-heading-' + id;
    item.setAttribute('aria-labelledby', heading.id);
    const tags = element('p',
      requirements[field.req] + (verifyOnBuild.has(id) ? ' · Verify on the release build' : ''), 'metadata-tags');
    const limit = element('p', '', 'hint');
    limit.id = 'metadata-limit-' + id;
    // Reference formatting is bundled with the prototype. Draft values use DOM properties.
    limit.innerHTML = field.limit;
    const guidance = element('p', '', 'hint');
    guidance.innerHTML = fieldHints[id] || field.notes;
    const maxLength = shortFields[id];
    const input = element(maxLength ? 'input' : 'textarea');
    if (maxLength) input.maxLength = maxLength;
    else input.rows = 2;
    input.name = 'metadata-value-' + id;
    input.id = input.name;
    input.setAttribute('aria-label', field.name + ' value or evidence reference');
    input.setAttribute('aria-describedby', limit.id);
    inputs = [input];
    const valueLabel = element('label', 'Value or evidence reference');
    valueLabel.append(input);
    const grid = element('div', '', 'grid');
    grid.append(valueLabel, progressLabel);
    item.append(heading, tags, limit, guidance, grid);
  }
  catalogueControls.set(id, { progress, inputs, item });
  return item;
}

function renderForms() {
  for (const [index, stage] of stages.entries()) {
    const stepButton = button(`${index + 1}. ${stage.navLabel}`, () => navigate(index), '');
    stepButton.id = 'step-button-' + stage.id;
    stepButton.setAttribute('aria-controls', stage.id + '-panel');
    const li = element('li');
    li.append(stepButton);
    $('wizard-progress').append(li);

    const section = form.querySelector(`[data-fields="${stage.id}"]`);
    for (const category of catalogue) {
      const fieldsGroup = element('details', '', 'metadata-group');
      fieldsGroup.append(element('summary', category.title));
      for (const field of category.fields) {
        if (owners.get(field.id) !== stage) continue;
        const view = renderField(field);
        if (!view.parentElement) fieldsGroup.append(view);
      }
      if (fieldsGroup.childElementCount > 1) section.append(fieldsGroup);
    }
  }
}

function renderChecklist() {
  $('catalog-coverage').textContent = catalogueReady
    ? `${catalogue.flatMap(section => section.fields).length - fields.size} client fields in Step 1 and ${fields.size} staff fields in Step 2.`
    : 'The field inventory is incomplete. Keep the shared metadata catalogue with the wizard.';
  for (const section of catalogue) {
    const group = element('details', '', 'metadata-group');
    group.append(element('summary', section.title));
    for (const field of section.fields) {
      const owner = owners.get(field.id);
      if (!owner) continue;
      const item = element('section', '', 'metadata-item');
      const state = element('p', '', 'status-pills');
      const timing = verifyOnBuild.has(field.id) ? 'Verify on the release build' : 'Plan before the build';
      const info = `${owner.label} · ${requirements[field.req]} · ${timing}`;
      const action = button('Open field', () => jumpToField(field.id));
      action.setAttribute('aria-label', 'Open ' + field.name);
      item.append(element('h3', field.name), element('p', info, 'metadata-tags'), state, action);
      group.append(item);
      checklistRows.set(field.id, { item, state, group, info });
    }
    if (group.childElementCount > 1) $('metadata-fields').append(group);
  }
  const firstGroup = $('metadata-fields').querySelector('details');
  if (firstGroup) firstGroup.open = true;
}

function controlValue(input) {
  return input.type === 'checkbox' ? (input.checked ? 'on' : '') : input.value.trim();
}

function editableControls() {
  return [...form.elements].filter(input => input.name && input.matches('input,select,textarea'));
}

function captureValues() {
  // Include organisation fields when hidden so switching publishing paths preserves prior work.
  return Object.fromEntries(editableControls().map(input => [input.name, controlValue(input)]));
}

const value = id => controlValue($(id));
const verifiedFindings = 'Verified against release build';
const demoRequired = 'Yes, demo login required';
const openAccess = 'No, open access';
const organisationFields = new Set(['org-enrollment-status', 'account-holder-team-duns']);

function applicable(id) {
  const organisationApplies = !organisationFields.has(id) || value('account') === 'client_org';
  const demoApplies = id !== 'demo-account' || value('signin') !== openAccess;
  return organisationApplies && demoApplies;
}

function forcedApplicable(id) {
  return (id === 'org-enrollment-status' && value('account') === 'client_org') ||
    (id === 'demo-account' && value('signin') === demoRequired);
}

function updateConditions() {
  const organisation = $('organisation');
  organisation.hidden = value('account') !== 'client_org';
  organisation.disabled = organisation.hidden;
  for (const id of ['org-enrollment-status', 'demo-account']) {
    const option = catalogueControls.get(id)?.progress.querySelector('[value="not-applicable"]');
    if (option) option.disabled = forcedApplicable(id);
  }
}

function progressLabel(id) {
  if (!applicable(id)) return statuses['not-applicable'];
  const progress = catalogueControls.get(id).progress.value;
  if (verifyOnBuild.has(id) && !value('build') && progress === 'verified') return statuses['awaiting-build'];
  return statuses[progress];
}

function isHttpUrl(text) {
  try { return ['http:', 'https:'].includes(new URL(text).protocol); }
  catch { return false; }
}

function fieldIssue(field) {
  const { id, req } = field;
  if (req === 'optional' || !applicable(id)) return '';
  const control = catalogueControls.get(id);
  if (!control) return 'Open the field inventory to assign this item a stage.';
  const progress = control.progress.value;
  if (progress === 'not-applicable' && req === 'conditional' && !forcedApplicable(id)) return '';
  if (verifyOnBuild.has(id) && !value('build')) return 'Awaiting build.';
  if (progress !== 'verified') {
    return req === 'conditional' && !forcedApplicable(id)
      ? 'Verify the evidence or record that this requirement does not apply.'
      : 'Verify the value or evidence.';
  }
  const entry = control.inputs.map(controlValue);
  if (id === 'demo-account' && !value('review-tested')) return 'Test the demo login on the release build.';
  if (!entry.some(Boolean)) return 'Record the value or evidence.';
  if (id === 'org-enrollment-status' && entry[0] !== 'Active organisation') return 'Confirm active organisation enrolment.';
  if (['privacy-policy-url', 'support-url'].includes(id) && !isHttpUrl(entry[0])) return 'Enter a live HTTP or HTTPS URL.';
  return '';
}

function getIssues() {
  const issues = [];
  function require(check, stage, target, label, reason) {
    if (!check) issues.push({ stage, target, label, reason });
  }

  require(catalogueReady, 'review', 'open-checklist', 'Field inventory', 'Load the shared metadata catalogue.');
  require(value('project-ref'), 'kickoff', 'project-ref', 'Intake reference', 'Enter the client’s Step 1 reference.');
  require(value('owner'), 'kickoff', 'owner', 'Renatus owner', 'Assign someone to this intake.');
  require(value('findings') === verifiedFindings && value('verification'),
    'build', 'findings', 'Verified data use', 'Record what the release build does and verify the findings.');

  for (const [doc, label] of [['privacy', 'Privacy policy'], ['terms', 'Terms of service']]) {
    const version = value(doc + '-version');
    const evidence = value(doc + '-approval-evidence') || value('approval');
    require(version && version === value(doc + '-approved-version') && value(doc + '-approved-date') &&
      evidence && !value(doc + '-reapproval'),
      'legal', doc + '-version', label + ' approval', 'Record client approval and evidence for the current version.');
  }
  require(isHttpUrl(value('terms-url')), 'legal', 'terms-url', 'Published terms', 'Enter the live terms URL.');
  require(['Completed', 'Not applicable'].includes(value('health-declarations')),
    'listing', 'health-declarations', 'Health declarations', 'Complete the applicable declarations or confirm they do not apply.');
  require(value('signin'), 'review', 'signin', 'Reviewer access', 'Choose how reviewers can access the app.');
  require(value('signin') !== openAccess || value('review-tested'),
    'review', 'review-tested', 'Open-access walkthrough', 'Test the walkthrough on the release build.');
  require(value('notes'), 'review', 'notes', 'App Review notes', 'Record the key flows and access instructions.');
  require(value('blockers-state') === 'cleared', 'review', 'blockers-state', 'Release blockers', 'Confirm that all applicable blockers are cleared.');
  require(value('signoff-owner'), 'review', 'signoff-owner', 'Submission owner', 'Enter who is signing off.');

  for (const field of fields.values()) {
    const stage = owners.get(field.id);
    if (!stage) continue;
    const reason = fieldIssue(field);
    if (reason) issues.push({ stage: stage.id, field: field.id, label: field.name, reason });
  }
  return issues;
}

function evidenceSnapshot() {
  const fieldsForSignoff = [...fields.values()].filter(field => {
    const control = catalogueControls.get(field.id);
    return control && applicable(field.id) && field.req !== 'optional';
  }).map(field => {
    const { inputs, progress } = catalogueControls.get(field.id);
    return [field.id, progress.value, ...inputs.map(controlValue)];
  });
  const evidence = ['build', 'verification', 'build-evidence', 'findings', 'privacy-version', 'privacy-approved-version',
    'privacy-approved-date', 'privacy-approval-evidence', 'terms-version', 'terms-approved-version', 'terms-approved-date',
    'terms-approval-evidence', 'terms-url', 'approval', 'health-declarations', 'signin', 'review-tested', 'review-evidence', 'notes',
    'blockers', 'blockers-state', 'signoff-owner'].map(value);
  return JSON.stringify([fieldsForSignoff, evidence]);
}

function refreshHandoff() {
  if (!checklistOpen && stages[activeStage].id === 'review') renderHandoff(getIssues());
}

function renderHandoff(issues) {
  const signed = !issues.length && signoff?.evidence === evidenceSnapshot();
  $('handoff-state').textContent = signed
    ? `Handoff ready · ${signoff.owner} · ${new Date(signoff.at).toLocaleDateString('en-AU')}`
    : issues.length
      ? 'Finish the checks below before marking the handoff ready.'
      : 'Checks complete. The submission owner can mark the handoff ready.';

  const target = $('handoff-issues');
  const previouslyOpen = new Set([...target.querySelectorAll('details[open]')].map(group => group.dataset.stage));
  target.replaceChildren();
  for (const stage of stages) {
    const pending = issues.filter(issue => issue.stage === stage.id);
    if (!pending.length) continue;
    const group = element('details');
    group.dataset.stage = stage.id;
    group.open = previouslyOpen.has(stage.id);
    group.append(element('summary', stage.label));
    const list = element('ul');
    for (const issue of pending) {
      const item = element('li');
      item.append(button(issue.label, () => {
        if (issue.field) jumpToField(issue.field);
        else jumpToControl(issue.stage, issue.target);
      }));
      item.append(document.createTextNode(' — ' + issue.reason));
      list.append(item);
    }
    group.append(list);
    target.append(group);
  }
}

function searchText(text) {
  return text.trim().toLowerCase().replace(/[\u2010-\u2015\u2212]/g, '-');
}

function filterChecklist() {
  const query = searchText(value('metadata-search'));
  const timing = value('metadata-timing');
  const totals = new Map();
  let visible = 0;
  for (const [id, row] of checklistRows) {
    const field = fields.get(id);
    const search = searchText(row.info + ' ' + field.name + ' ' + field.limit + ' ' + field.notes);
    const matches = search.includes(query) &&
      (timing === 'all' || timing === (verifyOnBuild.has(id) ? 'build' : 'plan'));
    row.item.hidden = !matches;
    row.state.textContent = progressLabel(id);
    totals.set(row.group, (totals.get(row.group) || 0) + Number(matches));
    visible += Number(matches);
  }
  for (const [group, count] of totals) {
    group.hidden = count === 0;
    if (count && (query || timing !== 'all')) group.open = true;
  }
  $('metadata-results').textContent = visible
    ? `${visible} staff ${visible === 1 ? 'field' : 'fields'}`
    : 'No matching fields.';
}

function showStage(index, focus = true) {
  activeStage = index;
  checklistOpen = false;
  for (const [position, stage] of stages.entries()) {
    const selected = position === index;
    $(stage.id + '-panel').hidden = !selected;
    const stepButton = $('step-button-' + stage.id);
    if (selected) stepButton.setAttribute('aria-current', 'step');
    else stepButton.removeAttribute('aria-current');
  }
  $('metadata-panel').hidden = true;
  $('open-checklist').hidden = false;
  $('back').disabled = index === 0;
  $('continue').hidden = index === stages.length - 1;
  refreshHandoff();
  if (focus) $(stages[index].id + '-heading').focus();
}

function openChecklist(focus = true) {
  checklistOpen = true;
  for (const stage of stages) {
    $(stage.id + '-panel').hidden = true;
    $('step-button-' + stage.id).removeAttribute('aria-current');
  }
  $('metadata-panel').hidden = false;
  $('open-checklist').hidden = true;
  $('back').disabled = false;
  $('continue').hidden = true;
  filterChecklist();
  if (focus) $('metadata-heading').focus();
}

function focusControl(target) {
  let container = target.parentElement;
  while (container && container !== form) {
    if (container.tagName === 'DETAILS') container.open = true;
    container = container.parentElement;
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'center' });
}

function jumpToControl(stageId, id) {
  navigate(stages.findIndex(stage => stage.id === stageId), false);
  focusControl($(id));
}

function jumpToField(id) {
  const stage = owners.get(id);
  const control = catalogueControls.get(id);
  navigate(stages.indexOf(stage), false);
  const target = control.inputs[0];
  focusControl(!applicable(id) ? $(organisationFields.has(id) ? 'account' : 'signin') : target);
}

function validateReference() {
  const missing = !value('project-ref');
  const error = $('reference-error');
  error.hidden = !missing;
  error.textContent = missing ? 'Enter the Step 1 intake reference.' : '';
  if (missing) {
    $('project-ref').setAttribute('aria-invalid', 'true');
    focusControl($('project-ref'));
  } else {
    $('project-ref').removeAttribute('aria-invalid');
  }
  return !missing;
}

function persist(announce = false) {
  if (!activeReference) return false;
  const values = { ...captureValues(), reference: activeReference };
  drafts.set(activeReference, { stage: stages[activeStage].id, values, questions: captureQuestions(), signoff });
  try {
    sessionStorage.setItem(storageKey, JSON.stringify({
      lastReference: activeReference,
      drafts: Object.fromEntries(drafts),
    }));
    if (announce) status.textContent = 'Draft saved in this tab.';
    return true;
  } catch {
    status.textContent = 'This browser could not save the draft for reload.';
    return false;
  }
}

function restoreDraft(reference) {
  const draft = drafts.get(reference);
  const demoValues = sample?.reference === reference ? sample : {};
  const values = { ...defaults, ...demoValues, ...draft?.values, reference };
  for (const field of editableControls()) {
    if (field.type === 'checkbox') field.checked = values[field.name] === 'on';
    else field.value = values[field.name] ?? '';
  }
  $('questions').replaceChildren();
  for (const question of draft?.questions || []) addQuestion(question);
  activeReference = reference;
  signoff = draft?.signoff || null;
  previousBuild = value('build');
  updateConditions();
  const savedStage = stages.findIndex(stage => stage.id === draft?.stage);
  showStage(Math.max(0, savedStage), false);
}

function adoptReference() {
  const reference = value('project-ref');
  if (!reference || activeReference === reference) return false;
  if (!activeReference && !drafts.has(reference)) {
    activeReference = reference;
    return false;
  }
  if (activeReference && !persist()) return null;
  restoreDraft(reference);
  return true;
}

function navigate(index, focus = true) {
  if (adoptReference() === null) return;
  if (!value('project-ref') && activeReference) $('project-ref').value = activeReference;
  if (location.hash === '#metadata-panel') history.replaceState(null, '', location.pathname + location.search);
  showStage(index, focus);
  return persist();
}

function reopenBuildChecks() {
  const next = value('build');
  if (next === previousBuild) return;
  previousBuild = next;
  for (const id of verifyOnBuild) {
    const control = catalogueControls.get(id);
    if (control?.progress.value === 'verified') {
      control.progress.value = next ? 'drafted' : 'awaiting-build';
    }
  }
  if (value('findings') === verifiedFindings) $('findings').value = 'Pending verification';
  for (const id of ['review-tested', 'listing', 'age', 'disclosures']) $(id).checked = false;
  if (value('health-declarations') === 'Completed') $('health-declarations').value = 'Pending';
}

renderForms();
renderChecklist();
const defaults = captureValues();
let lastReference = '';
try {
  const stored = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
  if (stored) {
    for (const [reference, draft] of Object.entries(stored.drafts || {})) drafts.set(reference, draft);
    if (drafts.has(stored.lastReference)) lastReference = stored.lastReference;
  } else {
    const legacy = JSON.parse(sessionStorage.getItem(legacyKey) || 'null');
    if (typeof legacy?.reference === 'string' && legacy.reference.trim()) {
      lastReference = legacy.reference.trim();
      drafts.set(lastReference, { stage: 'kickoff', values: legacy });
    }
  }
} catch {
  status.textContent = 'Browser draft storage is unavailable.';
}
restoreDraft(sample?.reference || lastReference);
if (matchMedia('(max-width: 750px)').matches) $('project-summary').open = false;
if (location.hash === '#metadata-panel') openChecklist(false);
window.addEventListener('hashchange', () => {
  if (location.hash === '#metadata-panel') openChecklist();
});

$('open-intake').addEventListener('click', () => {
  if (!validateReference()) return;
  const opened = adoptReference();
  if (opened === null) return;
  if (navigate(activeStage)) status.textContent = 'Intake opened · ' + activeReference;
});
$('back').addEventListener('click', () => navigate(checklistOpen ? activeStage : activeStage - 1));
$('continue').addEventListener('click', () => navigate(activeStage + 1));
$('open-checklist').addEventListener('click', () => openChecklist());
$('return-stage').addEventListener('click', () => navigate(activeStage));
$('metadata-search').addEventListener('input', filterChecklist);
$('metadata-timing').addEventListener('change', filterChecklist);
$('add-question').addEventListener('click', () => addQuestion({}, true));
$('questions').addEventListener('input', () => { status.textContent = ''; });

form.addEventListener('input', event => {
  const { target } = event;
  if (!target.name) return;
  status.textContent = '';
  if (target.id === 'project-ref' && value('project-ref')) {
    $('reference-error').hidden = true;
    target.removeAttribute('aria-invalid');
  }
  if (target.id === 'build') reopenBuildChecks();
  if (target.id === 'account' || target.id === 'signin') updateConditions();
  if (target.id === 'signin') {
    $('review-tested').checked = false;
    const demoProgress = catalogueControls.get('demo-account')?.progress;
    if (demoProgress?.value === 'verified') demoProgress.value = value('build') ? 'drafted' : 'awaiting-build';
  }
  const group = target.closest('#health-features');
  if (group && target.checked) {
    const none = $('no-health-features');
    if (target !== none) none.checked = false;
    else for (const feature of group.querySelectorAll('input:not(#no-health-features)')) feature.checked = false;
  }
  refreshHandoff();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!validateReference()) return;
  if (adoptReference() === null) return;
  persist(true);
});

$('signoff').addEventListener('click', () => {
  const changed = adoptReference();
  if (changed === null) return;
  if (changed) showStage(stages.length - 1, false);
  const issues = getIssues();
  if (issues.length) {
    const firstGroup = $('handoff-issues').querySelector('details');
    if (firstGroup) firstGroup.open = true;
    status.textContent = 'Resolve the open items before marking the handoff ready.';
    $('handoff-heading').focus();
    return;
  }
  signoff = { owner: value('signoff-owner'), at: new Date().toISOString(), evidence: evidenceSnapshot() };
  if (persist()) {
    status.textContent = 'Handoff sign-off saved in this tab.';
    refreshHandoff();
  } else {
    signoff = null;
  }
});
