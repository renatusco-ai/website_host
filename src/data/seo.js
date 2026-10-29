export const SITE = 'https://www.renatusco.com';

export const PAGES = [
  {
    path: '/',
    title: 'Custom Software & Change Management for Australian Businesses | Renatus',
    description:
      'Renatus builds custom business software and process automation around how your team works, then leads the change management so people use it. $266k documented annual saving.',
  },
  {
    path: '/services',
    title: 'Business Process Automation & Custom Software Services | Renatus',
    description:
      'Optimise the systems you have or build software you own, with change management included. Business process automation for Australian service businesses.',
  },
  {
    path: '/portfolio',
    title: 'Custom Software Case Studies & Results | Renatus',
    description:
      'What was removed, what replaced it, and where every saving came from. Documented custom software and automation results for Australian businesses.',
  },
  {
    path: '/portfolio/lockeroom',
    title: 'One owned system. A $266,651 annual saving. | Renatus',
    description:
      'A documented net saving for a health and fitness enterprise: subscriptions retired, staff capacity unlocked, and the team brought through the change.',
  },
  {
    path: '/learn-more',
    title: 'Why Custom Software Now Beats Off-the-Shelf SaaS | Renatus',
    description:
      'The old reason for renting generic software has disappeared. The bills have not. How Australian businesses are replacing per-seat subscriptions.',
  },
  {
    path: '/workshops',
    title: 'AI Workshops for Leadership Teams | Renatus',
    description:
      'Practical AI education first, then your company\u2019s real workflows. A facilitated session that ends with a shared next move for your team.',
  },
  {
    path: '/about',
    title: 'About Shaun Townsend, Founder & MD | Renatus',
    description:
      'Shaun Townsend scaled Lockeroom from 4 to 40+ staff and near eight figures in revenue, then built the software and led the change that lifted productivity while cutting costs.',
  },
  {
    path: '/contact',
    title: 'Contact Renatus | Free 15-Minute Conversation',
    description:
      'Tell us what is slow, manual or expensive. A free 15-minute conversation and an honest read on whether custom software or automation will help.',
  },
];

export const PAGE_BY_PATH = Object.fromEntries(PAGES.map((page) => [page.path, page]));

export const pageUrl = (path) => (path === '/' ? `${SITE}/` : `${SITE}${path}`);
