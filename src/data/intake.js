/**
 * Guided intake wizards for the three service options. One question per step.
 *
 * Step kinds: `text`, `longtext`, `choice` (single pick, advances on select),
 * `spend` (amount plus period, or "not sure"), and `stack` (multi-select of
 * common tools plus free-text additions). A `prompt` may be a function of the
 * answers so far, so later questions can use the visitor's name.
 */

export const SOFTWARE_OPTIONS = [
  'Microsoft 365',
  'Google Workspace',
  'Excel or Google Sheets',
  'Xero',
  'MYOB',
  'QuickBooks',
  'HubSpot',
  'Salesforce',
  'Pipedrive',
  'Zoho',
  'Monday.com',
  'Asana',
  'ClickUp',
  'Trello',
  'Notion',
  'Airtable',
  'Slack',
  'Microsoft Teams',
  'Zoom',
  'Dropbox',
  'DocuSign',
  'Calendly',
  'Mailchimp',
  'Canva',
  'Shopify',
  'Deputy',
  'Employment Hero',
  'ServiceM8',
  'simPRO',
  'Procore',
  'Buildxact',
  'Mindbody',
  'Zapier',
];

const firstName = (answers) => (answers.name ?? '').trim().split(/\s+/)[0];

const SHARED_STEPS = [
  {
    id: 'name',
    kind: 'text',
    prompt: 'First things first. What is your name?',
    placeholder: 'Your full name',
    autoComplete: 'name',
    required: true,
  },
  {
    id: 'company',
    kind: 'text',
    prompt: (answers) =>
      firstName(answers)
        ? `Nice to meet you, ${firstName(answers)}. What is the company called?`
        : 'What is the company called?',
    placeholder: 'Company name',
    autoComplete: 'organization',
    required: true,
  },
  {
    id: 'employees',
    kind: 'choice',
    prompt: 'How many people work in the business?',
    options: ['1–5', '6–15', '16–30', '31–75', '76+'],
    required: true,
  },
];

const SPEND_STEP = {
  id: 'spend',
  kind: 'spend',
  prompt: 'Roughly how much do you spend on software right now?',
  helper: 'A ballpark is fine. Add up every subscription you can think of.',
};

const STACK_STEP = {
  id: 'stack',
  kind: 'stack',
  prompt: 'Which tools are in your stack at the moment?',
  helper: 'Select everything you use, then add anything we missed.',
};

export const INTAKE_WIZARDS = {
  optimise: {
    eyebrow: 'Optimise your stack',
    intro: 'Seven quick questions so we arrive at the first conversation already understanding your setup.',
    steps: [
      ...SHARED_STEPS,
      {
        id: 'frustrations',
        kind: 'longtext',
        prompt: 'What is frustrating you most about your current tools?',
        helper: 'Double entry, tools that do not talk to each other, reports nobody trusts. Anything goes.',
        placeholder: 'Describe your biggest frustrations',
        required: true,
      },
      SPEND_STEP,
      {
        id: 'outcome',
        kind: 'longtext',
        prompt: 'What would a great outcome look like?',
        helper: 'Hours saved, a lower bill, one place for the data. Whatever matters most to you.',
        placeholder: 'Describe your ideal outcome',
      },
      STACK_STEP,
    ],
  },
  custom: {
    eyebrow: 'Build something custom',
    intro: 'Seven quick questions about where the business is heading and what it has outgrown.',
    steps: [
      ...SHARED_STEPS,
      {
        id: 'frustrations',
        kind: 'longtext',
        prompt: 'What has the business outgrown?',
        helper: 'The workarounds, the spreadsheets that hold it all together, the jobs no tool quite does.',
        placeholder: 'Describe your biggest frustrations',
        required: true,
      },
      SPEND_STEP,
      {
        id: 'ideal',
        kind: 'longtext',
        prompt: 'Imagine the ideal scenario. What does a normal day look like once this is solved?',
        helper: 'Think five to ten years out. What would the system do for you and your team?',
        placeholder: 'Describe the end outcome you are imagining',
        required: true,
      },
      STACK_STEP,
    ],
  },
  change: {
    eyebrow: 'Either one, with change management',
    intro: 'Seven quick questions about your team, what has been tried before, and what needs to stick this time.',
    steps: [
      ...SHARED_STEPS,
      {
        id: 'path',
        kind: 'choice',
        prompt: 'Which path are you pairing change management with?',
        options: ['Optimising our current stack', 'Building something custom', 'Not sure yet'],
        required: true,
      },
      {
        id: 'tried',
        kind: 'longtext',
        prompt: 'What have you tried before that did not stick?',
        helper: 'New tools nobody adopted, rollouts that stalled, consultants who left before it landed.',
        placeholder: 'What has not worked in the past',
        required: true,
      },
      {
        id: 'why',
        kind: 'longtext',
        prompt: 'Why does change management matter to you right now?',
        helper: 'What would it mean for the business if the team actually embraced the change?',
        placeholder: 'Tell us why it matters',
      },
      STACK_STEP,
    ],
  },
};
