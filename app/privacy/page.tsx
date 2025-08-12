export const dynamic = 'force-static';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-1)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[var(--color-neutral-900)]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)]">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-8 text-[var(--color-neutral-800)]">
          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">1) Who we are and scope</h2>
            <p className="mt-2">
              This policy explains how we handle personal data when you use this application and related APIs (the “Service”). It is written to meet the transparency requirements of the UK/EU GDPR without making assurances we cannot verify.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">2) Personal data we process</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium">Account and authentication data</span>: your phone number (and email if you provide it). Authentication is handled by Supabase, which sets cookies to maintain your session.
              </li>
              <li>
                <span className="font-medium">Usage and quota data</span>: we track daily usage counts and last-used dates in our database to enforce free-tier limits and subscription access.
              </li>
              <li>
                <span className="font-medium">Content you submit</span>: medical notes you provide for processing and the resulting outputs are sent to the OpenAI API to generate responses. We do not store your submitted content or generated outputs on our servers beyond what is necessary to process your request.
              </li>
              <li>
                <span className="font-medium">Payment data</span>: handled by Stripe. We do not store your full payment card details on our servers.
              </li>
              <li>
                <span className="font-medium">Security/anti‑abuse data</span>: we use rate limiting and CAPTCHA. For this we may process an identifier derived from your phone number or IP address and CAPTCHA tokens (Cloudflare Turnstile) to prevent abuse.
              </li>
              <li>
                <span className="font-medium">Feedback and support</span>: if you submit feedback, we store the message and any name/email you choose to provide.
              </li>
              <li>
                <span className="font-medium">Referral data</span>: if you arrive with a referral parameter, we store a referral UUID in localStorage and associate referral relationships in our database when you sign up.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">3) Purposes and lawful bases</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li><span className="font-medium">Provide the Service</span> (contract): authenticate you, process your inputs, and deliver outputs.</li>
              <li><span className="font-medium">Billing</span> (contract): manage subscriptions and payments via Stripe.</li>
              <li><span className="font-medium">Security and abuse prevention</span> (legitimate interests): rate limiting, CAPTCHA, fraud/abuse prevention.</li>
              <li><span className="font-medium">Service operation</span> (legitimate interests): track usage/quota to operate free and paid tiers.</li>
              <li><span className="font-medium">Legal</span> (legal obligation): comply with applicable law where required.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">4) Third‑party processing</h2>
            <p className="mt-2">
              We use service providers as part of delivering the Service. We do not sell personal data. Providers we use include:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li><span className="font-medium">Supabase</span> (authentication and database; stores user accounts, session cookies, usage records, and referral data).</li>
              <li><span className="font-medium">Stripe</span> (payments and subscriptions; handles billing information and payment processing).</li>
              <li><span className="font-medium">OpenAI API</span> (content processing; we send your submitted medical notes to OpenAI’s API to generate summaries and plans; we do not store this content ourselves).</li>
              <li><span className="font-medium">Cloudflare Turnstile</span> (CAPTCHA; processes tokens and may set cookies to verify requests).</li>
            </ul>
            <p className="mt-2">
              These providers may process data in countries outside your jurisdiction. For specific details about each provider’s practices and safeguards, please refer to their respective privacy documentation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">5) International transfers</h2>
            <p className="mt-2">
              Data may be processed in regions where our providers operate. We do not make representations beyond what we can verify about each provider’s transfer mechanisms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">6) Retention</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Account, usage, and referral records are retained while your account is active. Account deletion will remove your user record and related account data we control and will cancel any active Stripe subscription.</li>
              <li>Rate‑limit entries are temporary and are cleaned up automatically after their reset time.</li>
              <li>Submitted content and generated outputs are not stored by us after processing. Feedback is retained as needed to operate the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">7) Your rights</h2>
            <p className="mt-2">
              Subject to applicable law, you may have rights to access, rectify, erase, restrict, or object to processing of your personal data, and to data portability. You can also withdraw consent where processing is based on consent. To exercise these rights, contact us via the in‑app feedback form or support channel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">8) Cookies and similar technologies</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li><span className="font-medium">Authentication cookies</span>: Supabase sets session cookies (e.g., access/refresh tokens) required to keep you signed in.</li>
              <li><span className="font-medium">Payment and security cookies</span>: Stripe and Cloudflare Turnstile may set cookies to facilitate payments and prevent abuse.</li>
              <li><span className="font-medium">Local storage</span>: we store a referral UUID in your browser’s localStorage when you visit with a referral link.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">9) Security</h2>
            <p className="mt-2">
              We implement reasonable technical and organizational measures appropriate to the Service. However, no method of transmission or storage is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">11) Changes</h2>
            <p className="mt-2">We may update this policy to reflect changes to the Service or legal requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">12) Contact</h2>
            <p className="mt-2">Questions or requests? Contact us via <a href="mailto:revivewebsites@outlook.com" className="text-[var(--color-primary-600)] hover:underline">revivewebsites@outlook.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}


