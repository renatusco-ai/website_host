export const SITE = 'https://www.renatusco.com';

export const PAGES = [
  {
    path: '/',
    title: 'Renatus: The software changed. Your business hasn\u2019t.',
    description:
      'You settled for off-the-shelf because custom wasn\u2019t an option. Now it is, and the numbers can be extraordinary.',
  },
  {
    path: '/services',
    title: 'Find the expensive problem. Build only what pays. | Renatus',
    description:
      'Optimise the stack you have, build something you own, or do either with someone who stays until the change sticks.',
  },
  {
    path: '/portfolio',
    title: 'Evidence before adjectives. | Renatus',
    description:
      'What was removed, what replaced it, and where every saving came from. Delivered work is documented.',
  },
  {
    path: '/portfolio/lockeroom',
    title: 'One owned system. A $266,651 annual saving. | Renatus',
    description:
      'A documented net saving for a health and fitness enterprise: subscriptions retired and staff capacity unlocked.',
  },
  {
    path: '/learn-more',
    title: 'Learn how businesses are making crazy savings. | Renatus',
    description:
      'The old reason for renting generic software has disappeared. The bills have not.',
  },
  {
    path: '/workshops',
    title: 'Give the whole team a way to think about AI together. | Renatus',
    description:
      'Practical education first, then your company\u2019s real workflows. A session that ends with a shared next move.',
  },
  {
    path: '/contact',
    title: 'Two ways in. Both honest. | Renatus',
    description:
      'A quick conversation, a proper diagnostic, or an honest read that nothing needs building yet.',
  },
];

export const PAGE_BY_PATH = Object.fromEntries(PAGES.map((page) => [page.path, page]));

export const pageUrl = (path) => (path === '/' ? `${SITE}/` : `${SITE}${path}`);
