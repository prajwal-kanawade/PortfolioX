import './LegalPage.css'

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <span className="settings-muted">Last updated: this is placeholder template copy for a demo project, not legal advice.</span>

      <h2>1. What we collect</h2>
      <p>Account details (name, email, username), the content you add to your portfolios and resumes, and basic usage data such as page views on published portfolios.</p>

      <h2>2. How we use it</h2>
      <ul>
        <li>To operate your account, portfolios, and resumes.</li>
        <li>To send account-related emails (verification, security alerts, password resets) and, where enabled, notification emails you've opted into in Settings &gt; Notifications.</li>
        <li>To show anonymized view counts on your own portfolios.</li>
      </ul>

      <h2>3. What we don't do</h2>
      <p>We don't sell your personal data. Portfolio content you publish is visible to anyone with the link (and, if your profile is public, via Explore) - keep that in mind about what you choose to include.</p>

      <h2>4. Your controls</h2>
      <ul>
        <li>Download a copy of your account data from Settings &gt; Data Management.</li>
        <li>Make your profile private, or hide it from search engines, from Settings &gt; Privacy.</li>
        <li>Delete your account at any time - this permanently removes your data.</li>
      </ul>

      <h2>5. Cookies</h2>
      <p>We use a small number of cookies for session handling and to remember trusted devices for login security - see the Security page for details on trusted devices.</p>

      <h2>6. Changes</h2>
      <p>This policy may be updated from time to time. Continued use of PortfolioX after a change means you accept the updated policy.</p>
    </div>
  )
}
