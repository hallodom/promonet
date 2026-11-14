import { Link } from 'react-router-dom'

export default function StarterOffer() {
  return (
    <aside className="campaign-starter">
      <div><span className="campaign-eyebrow">A smaller first step</span><h2>Simple connection starter</h2><p>One simple, one-way workflow between two tools with suitable existing integration access. Setup, testing, a short handover and 14 days of fixes for faults in the agreed workflow.</p></div>
      <div><p className="campaign-price"><span>From</span> £350 <small>total</small></p><p className="campaign-field-hint">Includes any applicable VAT. Third-party costs separate. Fixed quote after a feasibility check.</p><Link className="campaign-text-link" to="/connect-your-tools">Explore the starter offer →</Link></div>
    </aside>
  )
}
