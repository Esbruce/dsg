export const dynamic = 'force-static';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-1)]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[var(--color-neutral-900)]">Terms of Service</h1>
        <p className="mt-2 text-sm text-[var(--color-neutral-600)]">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-8 text-[var(--color-neutral-800)]">
          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">1) Agreement to terms</h2>
            <p className="mt-2">By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">2) Accounts and security</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>You are responsible for the activity on your account and for keeping your authentication factors secure.</li>
              <li>Authentication is provided by Supabase; session cookies are required to keep you signed in.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">3) Acceptable use</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Do not misuse the Service, interfere with its normal operation, attempt to circumvent security, or use it in violation of law.</li>
              <li>Do not submit unlawful content or content you do not have a right to process. You are responsible for ensuring you have a lawful basis to process any personal data you submit.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">4) Content and outputs</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>You provide input content (e.g., medical notes). Outputs are generated through third‑party models (OpenAI API) based on your input, and we do not store your submitted content or outputs after processing.</li>
              <li>We do not guarantee the accuracy, completeness, or fitness of any outputs. You must review outputs before relying on them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">5) Subscriptions and billing</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Paid features are billed via Stripe. We do not store full card details on our servers.</li>
              <li>Cancellations take effect at the end of the current billing period unless stated otherwise.</li>
              <li>Discounts for invitees are only valid upon the successful sign up of your invitee.</li>
              <li>Invite discounts may be revoked if the invitee cancels their subscription.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">6) Privacy</h2>
            <p className="mt-2">Your use of the Service is subject to our Privacy Policy, which explains what personal data we process and why.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">7) Service changes</h2>
            <p className="mt-2">We may modify, suspend, or discontinue features at any time. If we make material changes to these Terms, we will update the “Last updated” date above.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">8) Disclaimers</h2>
            <p className="mt-2">The Service is provided on an “as is” and “as available” basis to the extent permitted by law. We do not make promises beyond what is explicitly stated here.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">9) Limitation of liability</h2>
            <p className="mt-2">To the maximum extent permitted by law, we are not liable for indirect, incidental, consequential, special, or punitive damages, or loss of data, profits, revenue, or business, arising from or related to your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">10) Termination</h2>
            <p className="mt-2">You may stop using the Service at any time. You can delete your account in‑app, which will cancel any active subscription and remove associated data we control, subject to legal or operational requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--color-neutral-900)]">11) Contact</h2>
            <p className="mt-2">If you have questions about these Terms, contact us via <a href="mailto:revivewebsites@outlook.com" className="text-[var(--color-primary-600)] hover:underline">revivewebsites@outlook.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}


