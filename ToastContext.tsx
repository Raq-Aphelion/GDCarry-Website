export type LegalBlock = { type: 'p'; text: string } | { type: 'ul'; items: string[] };

export interface LegalSection {
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  id: string;
  title: string;
  updated?: string;
  intro: LegalBlock[];
  sections: LegalSection[];
}

export const legalDocs: LegalDoc[] = [
  {
    id: 'terms',
    title: 'Terms and Conditions',
    updated: 'Last Updated 15th November 2025',
    intro: [],
    sections: [
      {
        heading: '1. General Overview',
        blocks: [
          {
            type: 'p',
            text: 'Our website provides game boosting, coaching, and leveling for various games such as FFXIV, WoW and OSRS.',
          },
          {
            type: 'p',
            text: 'We are not affiliated with any game developers, publishers, or trademarks.',
          },
          {
            type: 'p',
            text: 'All services are digital and intangible — no physical products are shipped.',
          },
        ],
      },
      {
        heading: '2. Account Access & Security',
        blocks: [
          { type: 'p', text: 'Some services may require temporary access to your in-game account.' },
          { type: 'p', text: 'If account sharing is required:' },
          {
            type: 'ul',
            items: [
              'You must ensure the account is secured (email 2FA, app authentication, etc.).',
              'You must not log in while a booster is working unless instructed otherwise.',
              'You accept all risks associated with account sharing, including potential freezes or warnings from the game developer.',
            ],
          },
          {
            type: 'p',
            text: 'We are not responsible for penalties resulting from misuse of your account, security breaches on your end, or violations of the game’s rules.',
          },
        ],
      },
      {
        heading: '3. Order Requirements',
        blocks: [
          {
            type: 'p',
            text: 'Before we can begin your service, you must provide accurate details including:',
          },
          {
            type: 'ul',
            items: [
              'Character name',
              'Server or region',
              'Job/class information',
              'Required gear levels',
              'Preferred schedule',
              'Any special instructions',
            ],
          },
          {
            type: 'p',
            text: 'We are not responsible for delays caused by missing or incorrect information.',
          },
        ],
      },
      {
        heading: '4. Service Completion',
        blocks: [
          { type: 'p', text: 'A service is considered completed when:' },
          {
            type: 'ul',
            items: [
              'The specified objective has been achieved (raid clear, rating, item, etc.)',
              'We provide proof of completion (screenshots, logs, video, or confirmation messages)',
            ],
          },
          { type: 'p', text: 'Upon completion, your booster’s access ends immediately.' },
        ],
      },
      {
        heading: '5. Expected Timeframes',
        blocks: [
          {
            type: 'p',
            text: 'Most services begin shortly after purchase. However, delays may occur due to:',
          },
          {
            type: 'ul',
            items: [
              'Server outages',
              'Patch changes',
              'Booster availability',
              'Queue systems',
              'Customer scheduling conflicts',
            ],
          },
          {
            type: 'p',
            text: 'We always try to meet estimated delivery times, but these are not guaranteed deadlines.',
          },
        ],
      },
      {
        heading: '6. Payments',
        blocks: [
          {
            type: 'p',
            text: 'All payments are processed securely through third-party providers (PayPal, Stripe, etc.)',
          },
          { type: 'p', text: 'We do not store credit card information' },
          { type: 'p', text: 'By paying, you agree to our Refund Policy' },
          {
            type: 'p',
            text: 'Chargebacks opened without contacting us first may result in suspension of service and permanent account blacklisting.',
          },
        ],
      },
      {
        heading: '7. Refunds & Cancellations',
        blocks: [
          { type: 'p', text: 'Our full refund rules are explained in our Refund Policy. Key points:' },
          {
            type: 'ul',
            items: [
              'Full refunds are issued only before a service starts',
              'Partial refunds may be issued for incomplete services',
              'No refunds once a service has been fully completed',
              'Refunds go back to the original payment method only',
            ],
          },
          {
            type: 'p',
            text: 'We reserve the right to cancel any order at any time for security, availability, or policy reasons.',
          },
        ],
      },
      {
        heading: '8. Risks Associated With Game Services',
        blocks: [
          { type: 'p', text: 'Game developers may penalize players for:' },
          {
            type: 'ul',
            items: [
              'Account sharing',
              'Purchasing carries or boosts',
              'Violating gameplay policies',
            ],
          },
          {
            type: 'p',
            text: 'While we take steps to minimize risks, we cannot guarantee protection from penalties (suspensions, rollbacks, warnings, etc.).',
          },
          { type: 'p', text: 'By using our services, you acknowledge and accept these risks.' },
        ],
      },
      {
        heading: '9. Intellectual Property',
        blocks: [
          {
            type: 'p',
            text: 'All content on this website—including text, graphics, logos, and page layouts—is owned by Grand Dice. You may not copy or redistribute it without written permission.',
          },
          {
            type: 'p',
            text: 'We do not claim ownership over any game-related images, concepts, or names used for service descriptions.',
          },
        ],
      },
      {
        heading: '10. Limitation of Liability',
        blocks: [
          { type: 'p', text: 'We are not liable for:' },
          {
            type: 'ul',
            items: [
              'Loss of accounts, characters, or items',
              'Suspensions or penalties issued by game companies',
              'Damages due to user error',
              'Delays or issues caused by third-party services',
            ],
          },
          {
            type: 'p',
            text: 'Our total liability for any claim shall not exceed the amount paid for the service in question.',
          },
        ],
      },
      {
        heading: '11. Modifications to Terms',
        blocks: [
          {
            type: 'p',
            text: 'We may update these Terms & Conditions at any time. Changes will appear on this page with a new revision date.',
          },
          { type: 'p', text: 'Continued use of the website means you accept the updated terms.' },
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    updated: 'Last Updated 15th November 2025',
    intro: [],
    sections: [
      {
        heading: 'Information We Collect',
        blocks: [{ type: 'p', text: 'We may collect information in several ways:' }],
      },
      {
        heading: '1. Information You Provide to Us',
        blocks: [
          {
            type: 'ul',
            items: [
              'Name or username',
              'Email address',
              'Billing information (processed securely by third-party payment providers)',
              'Game related details required to deliver your order',
              'Support messages, inquiries, or other communications you send to us',
            ],
          },
        ],
      },
      {
        heading: '2. Information Collected Automatically',
        blocks: [
          { type: 'p', text: 'When you access the site, we may automatically collect:' },
          {
            type: 'ul',
            items: [
              'IP address and geographic location',
              'Browser type and settings',
              'Device information',
              'Pages you visit and time spent',
              'Cookies, tracking pixels, and analytics data',
            ],
          },
        ],
      },
      {
        heading: '3. Information from Third-Party Services',
        blocks: [
          { type: 'p', text: 'We may receive limited data from:' },
          {
            type: 'ul',
            items: ['Payment systems (Paypal&Stripe)', 'Analytics providers (e.g., Google Analytics)'],
          },
          {
            type: 'p',
            text: 'No sensitive financial information (such as full credit card numbers) is stored on our servers.',
          },
        ],
      },
      {
        heading: '4. How We Use Your Information',
        blocks: [
          { type: 'p', text: 'We may use your information to:' },
          {
            type: 'ul',
            items: [
              'Process and fulfill orders',
              'Deliver customer support',
              'Improve the quality and functionality of our website',
              'Personalize your user experience',
              'Send service-related notifications',
              'Comply with legal obligations',
            ],
          },
          { type: 'p', text: 'We do not sell or rent personal information to third parties.' },
        ],
      },
      {
        heading: '5. Cookies and Tracking Technologies',
        blocks: [
          { type: 'p', text: 'We use cookies and similar technologies for:' },
          {
            type: 'ul',
            items: [
              'Website functionality',
              'Analytics and usage tracking',
              'Saving user preferences',
              'Improving user experience',
            ],
          },
          {
            type: 'p',
            text: 'You can disable cookies through your browser settings, though some site features may not function correctly.',
          },
        ],
      },
      {
        heading: '6. Sharing Your Information',
        blocks: [
          { type: 'p', text: 'We may share data with:' },
          {
            type: 'ul',
            items: [
              'Payment processors (e.g., PayPal, Stripe)',
              'Analytics providers (e.g., Google Analytics)',
              'Hosting providers for site functionality',
              'Customer support systems',
              'Legal authorities, if required by law or to protect our rights',
            ],
          },
          {
            type: 'p',
            text: 'All third parties are required to handle data responsibly and securely.',
          },
        ],
      },
      {
        heading: '7. Data Storage and Security',
        blocks: [
          {
            type: 'p',
            text: 'We implement security measures to protect your information, including:',
          },
          {
            type: 'ul',
            items: [
              'SSL encryption',
              'Secure payment processing',
              'Limited access to personal data',
              'Regular monitoring for vulnerabilities',
            ],
          },
        ],
      },
      {
        heading: '8. Third-Party Links',
        blocks: [
          {
            type: 'p',
            text: 'Our site may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites.',
          },
        ],
      },
      {
        heading: '9. Changes to This Privacy Policy',
        blocks: [
          {
            type: 'p',
            text: 'We may update this Privacy Policy from time to time. Updated versions will include a revised date at the top of this page.',
          },
        ],
      },
      {
        heading: '10. Contact Us',
        blocks: [
          {
            type: 'p',
            text: 'If you have any questions about this Privacy Policy or need assistance, you can reach us at:',
          },
        ],
      },
    ],
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    updated: 'Last Updated 15th November 2025',
    intro: [
      {
        type: 'p',
        text: 'This Cookie Policy explains how Grand Dice uses cookies and similar tracking technologies when you visit or interact with our website.',
      },
      {
        type: 'p',
        text: 'By using our website, you agree to the use of cookies as described in this policy.',
      },
    ],
    sections: [
      {
        heading: '1. What Are Cookies?',
        blocks: [
          {
            type: 'p',
            text: 'Cookies are small text files stored on your device when you visit a website. They help enhance your browsing experience by remembering preferences, improving performance, and collecting anonymous usage data.',
          },
          { type: 'p', text: 'Cookies may be:' },
          {
            type: 'ul',
            items: [
              'Session cookies (deleted when you close your browser)',
              'Persistent cookies (remain on your device until they expire or are deleted)',
            ],
          },
        ],
      },
      {
        heading: '2. How We Use Cookies',
        blocks: [
          { type: 'p', text: 'We use cookies on our boosting website to:' },
          {
            type: 'ul',
            items: [
              'Security and fraud prevention',
              'Page navigation',
              'Maintaining your active session',
            ],
          },
          { type: 'p', text: 'Without these cookies, the website may not work correctly.' },
        ],
      },
      {
        heading: '3. Third-Party Cookies',
        blocks: [
          {
            type: 'p',
            text: 'Some cookies are provided by third parties that support our services, including:',
          },
          {
            type: 'ul',
            items: [
              'Payment processors (e.g., PayPal, Stripe)',
              'Analytics tools (e.g., Google Analytics)',
              'Security and anti-fraud services',
            ],
          },
          { type: 'p', text: 'These third parties may collect data related to:' },
          {
            type: 'ul',
            items: ['Browser type', 'IP address', 'Device information', 'Page interactions'],
          },
          { type: 'p', text: 'We do not control these external cookies.' },
        ],
      },
      {
        heading: '4. Managing Your Cookies',
        blocks: [
          { type: 'p', text: 'You can control or delete cookies through your browser settings.' },
          { type: 'p', text: 'Most browsers allow you to:' },
          {
            type: 'ul',
            items: [
              'Block all cookies',
              'Block only third-party cookies',
              'Delete existing cookies',
              'Receive alerts before cookies are stored',
            ],
          },
          { type: 'p', text: 'Please note: Disabling certain cookies may affect website functionality.' },
        ],
      },
      {
        heading: '5. Changes to This Cookie Policy',
        blocks: [
          {
            type: 'p',
            text: 'We may update this Cookie Policy from time to time to reflect:',
          },
          {
            type: 'ul',
            items: ['Legal changes', 'Technical updates', 'Changes in our cookie use'],
          },
          { type: 'p', text: 'Updates will include a revised “Last Updated” date.' },
        ],
      },
    ],
  },
  {
    id: 'refund',
    title: 'Refund Policy',
    updated: 'Last Updated 15th November 2025',
    intro: [],
    sections: [
      {
        heading: '1. General Refund Eligibility',
        blocks: [
          {
            type: 'p',
            text: 'Because boosting services are digital and begin preparation immediately, refunds are only granted under specific conditions.',
          },
          { type: 'p', text: 'You may be eligible for a refund if:' },
          {
            type: 'ul',
            items: [
              'The service has not yet begun',
              'We are unable to complete the order',
              'A booster becomes unavailable and no replacement can be provided',
              'There was a mistake in the purchase (e.g., selected wrong service) and it has not started yet / booster was not assigned',
            ],
          },
        ],
      },
      {
        heading: '2. Non-Refundable Situations',
        blocks: [
          { type: 'p', text: 'A refund will not be issued if:' },
          {
            type: 'ul',
            items: [
              'The service has already been started',
              'The boost is partially completed',
              'You provide incorrect account details or login issues prevent progress',
              'You violate game Terms of Service resulting in account penalties such as botting / hacking',
              'You request a refund after the service has been fully completed',
              'You purchased a service for content you cannot access (wrong expansion, gear level, etc.)',
              'Chargeback without contacting support first',
            ],
          },
        ],
      },
      {
        heading: '3. Partial Refunds',
        blocks: [
          { type: 'p', text: 'Partial refunds may be issued at our discretion if:' },
          {
            type: 'ul',
            items: [
              'The boost is partially completed',
              'You request cancellation mid-service for personal reasons',
              'Progress is significantly delayed due to unforeseen factors',
            ],
          },
          {
            type: 'p',
            text: 'In these cases, the refund amount is calculated based on the portion of the service that has not been completed.',
          },
        ],
      },
      {
        heading: '3. Service Delays',
        blocks: [
          {
            type: 'p',
            text: 'In rare cases where delays occur (e.g., patch changes, server maintenance, booster emergencies), we may offer:',
          },
          {
            type: 'ul',
            items: [
              'A new estimated completion time',
              'A partial refund',
              'An alternative service of equal value',
              'A full refund if the service cannot be completed at all',
            ],
          },
        ],
      },
    ],
  },
];

export const getLegalDoc = (id: string | undefined) => legalDocs.find((d) => d.id === id);
