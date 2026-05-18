import { useState } from 'react'
import axios from 'axios'

// ── Field definitions ──────────────────────────────────────────────────────
const FIELDS = [
  { name: 'name',        label: 'Full Name',         type: 'text',     required: true,  placeholder: 'Jane Doe' },
  { name: 'email',       label: 'Work Email',        type: 'email',    required: true,  placeholder: 'jane@company.com' },
  { name: 'company',     label: 'Company Name',      type: 'text',     required: true,  placeholder: 'Acme Corp' },
  { name: 'website',     label: 'Website',           type: 'url',      required: false, placeholder: 'https://acmecorp.com' },
  { name: 'industry',    label: 'Industry / Sector', type: 'select',   required: false,
    options: ['Technology', 'Finance & Banking', 'Healthcare', 'Consulting', 'SaaS', 'E-Commerce', 'Manufacturing', 'Real Estate', 'Education', 'Marketing & Advertising', 'Legal', 'Other'] },
  { name: 'employees',   label: 'Team Size',         type: 'select',   required: false,
    options: ['1–10', '11–50', '51–200', '201–500', '501–1000', '1000+'] },
  { name: 'role',        label: 'Your Role / Title', type: 'text',     required: false, placeholder: 'Head of Operations' },
  { name: 'painPoints',  label: 'Biggest Challenge', type: 'textarea', required: false, placeholder: 'Tell us about your biggest operational or growth challenge…' },
]

const STEPS = [
  { title: 'About You', fields: ['name', 'email', 'role'] },
  { title: 'Your Company', fields: ['company', 'website', 'industry', 'employees'] },
  { title: 'Your Challenge', fields: ['painPoints'] },
]

// ── Styles (inline for self-containment) ──────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrb1: {
    position: 'fixed', top: '-200px', right: '-200px',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgOrb2: {
    position: 'fixed', bottom: '-150px', left: '-150px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  left: {
    flex: '0 0 420px',
    background: 'linear-gradient(160deg, #1a1a2e 0%, #0d0d1a 100%)',
    padding: '60px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: '1px solid #2a2a3d',
    position: 'relative',
    overflow: 'hidden',
  },
  right: {
    flex: 1,
    padding: '60px 64px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '640px',
  },
  brand: {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    color: '#fff',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  brandAccent: { color: '#c9a84c' },
  tagline: {
    fontSize: '11px',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    color: '#c9a84c',
    fontWeight: 600,
    marginTop: '6px',
  },
  heroTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '32px',
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.2,
    margin: '40px 0 16px',
  },
  heroSub: {
    fontSize: '14px',
    color: '#8888a0',
    lineHeight: 1.7,
  },
  featureList: {
    listStyle: 'none',
    marginTop: '32px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '18px',
  },
  featureIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(201,168,76,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '13px',
  },
  featureText: {
    fontSize: '13px',
    color: '#aaaabc',
    lineHeight: 1.5,
  },
  featureTitle: {
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    display: 'block',
    marginBottom: '2px',
  },
  stepTrack: {
    marginBottom: '40px',
  },
  stepLabel: {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#8888a0',
    marginBottom: '14px',
  },
  stepDots: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  dot: (active, done) => ({
    height: '4px',
    borderRadius: '2px',
    transition: 'all 0.3s',
    background: done ? '#c9a84c' : active ? '#c9a84c' : '#2a2a3d',
    width: active ? '32px' : '16px',
    opacity: done ? 0.6 : 1,
  }),
  stepTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '6px',
  },
  stepSub: {
    fontSize: '13px',
    color: '#8888a0',
    marginBottom: '32px',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    color: '#aaaabc',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  required: {
    color: '#c9a84c',
    marginLeft: '3px',
  },
  input: (err) => ({
    width: '100%',
    background: '#13131f',
    border: `1px solid ${err ? '#ef4444' : '#2a2a3d'}`,
    borderRadius: '10px',
    padding: '13px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  }),
  textarea: (err) => ({
    width: '100%',
    background: '#13131f',
    border: `1px solid ${err ? '#ef4444' : '#2a2a3d'}`,
    borderRadius: '10px',
    padding: '13px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  }),
  select: (err) => ({
    width: '100%',
    background: '#13131f',
    border: `1px solid ${err ? '#ef4444' : '#2a2a3d'}`,
    borderRadius: '10px',
    padding: '13px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  }),
  errText: {
    color: '#ef4444',
    fontSize: '11px',
    marginTop: '5px',
  },
  btnRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  btnBack: {
    flex: '0 0 auto',
    padding: '14px 24px',
    background: 'transparent',
    border: '1px solid #2a2a3d',
    borderRadius: '10px',
    color: '#8888a0',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, color 0.2s',
  },
  btnNext: (loading) => ({
    flex: 1,
    padding: '14px 24px',
    background: loading ? '#a07830' : '#c9a84c',
    border: 'none',
    borderRadius: '10px',
    color: '#0a0a0f',
    fontSize: '14px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
    transition: 'background 0.2s, transform 0.1s',
  }),
  successWrap: {
    textAlign: 'center',
    padding: '20px 0',
  },
  successIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(201,168,76,0.15)',
    border: '2px solid rgba(201,168,76,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 24px',
  },
  successTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '12px',
  },
  successSub: {
    fontSize: '14px',
    color: '#8888a0',
    lineHeight: 1.7,
    maxWidth: '400px',
    margin: '0 auto 32px',
  },
  successCard: {
    background: '#13131f',
    border: '1px solid #2a2a3d',
    borderRadius: '12px',
    padding: '20px 24px',
    textAlign: 'left',
    marginTop: '8px',
  },
}

// ── Features sidebar content ───────────────────────────────────────────────
const FEATURES = [
  { icon: '🔍', title: 'Deep Company Research', desc: 'We analyse your website, digital footprint, and industry data automatically.' },
  { icon: '📊', title: 'AI Readiness Score', desc: 'Benchmarked against 1,000+ companies in your sector.' },
  { icon: '📄', title: 'Personalised PDF Audit', desc: 'A professional, branded report delivered straight to your inbox.' },
  { icon: '⚡', title: 'Zero Human Wait Time', desc: 'The entire workflow completes in under 3 minutes.' },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const currentStep = STEPS[step]
  const currentFields = FIELDS.filter(f => currentStep.fields.includes(f.name))

  function validate() {
    const errs = {}
    currentFields.forEach(f => {
      if (f.required && !values[f.name]?.trim()) {
        errs[f.name] = `${f.label} is required.`
      }
      if (f.type === 'email' && values[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.name])) {
        errs[f.name] = 'Please enter a valid email address.'
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleNext() {
    if (!validate()) return
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      return
    }
    // Final submit
    setLoading(true)
    try {
      const { data } = await axios.post(
`${import.meta.env.VITE_API_URL}/api/lead`,
values
)
      setSuccessMsg(data.message)
      setSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      setErrors({ _global: msg })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(name, val) {
    setValues(v => ({ ...v, [name]: val }))
    if (errors[name]) setErrors(e => { const n = { ...e }; delete n[name]; return n })
  }

  function renderField(field) {
    const err = errors[field.name]
    const val = values[field.name] || ''
    const commonProps = {
      id: field.name,
      value: val,
      onChange: e => handleChange(field.name, e.target.value),
      placeholder: field.placeholder,
    }
    return (
      <div key={field.name} style={S.field}>
        <label htmlFor={field.name} style={S.label}>
          {field.label}
          {field.required && <span style={S.required}>*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea style={S.textarea(err)} {...commonProps} />
        ) : field.type === 'select' ? (
          <select style={S.select(err)} {...commonProps} onChange={e => handleChange(field.name, e.target.value)}>
            <option value="">Select…</option>
            {field.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={field.type} style={S.input(err)} {...commonProps} />
        )}
        {err && <div style={S.errText}>{err}</div>}
      </div>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.bgOrb1} />
      <div style={S.bgOrb2} />

      {/* ── Left Sidebar ── */}
      <aside style={S.left}>
        {/* subtle grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#2a2a3d 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.3, pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={S.brand}>Simplif<span style={S.brandAccent}>IQ</span></div>
          <div style={S.tagline}>AI Intelligence Platform</div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={S.heroTitle}>Your personalised<br/>AI audit,<br/><em style={{ fontStyle: 'italic', fontWeight: 300 }}>in minutes.</em></div>
          <div style={S.heroSub}>Submit your company details. Our AI researches your business, generates a professional audit report, and sends it to your inbox — automatically.</div>

          <ul style={S.featureList}>
            {FEATURES.map(f => (
              <li key={f.title} style={S.featureItem}>
                <div style={S.featureIcon}>{f.icon}</div>
                <div style={S.featureText}>
                  <span style={S.featureTitle}>{f.title}</span>
                  {f.desc}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ position: 'relative', fontSize: '11px', color: '#4444558', letterSpacing: '0.5px' }}>
          <div style={{ color: '#44445588', fontSize: '11px' }}>© 2024 SimplifIQ · Confidential</div>
        </div>
      </aside>

      {/* ── Right Form Panel ── */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={S.right}>
          {submitted ? (
            <div style={S.successWrap}>
              <div style={S.successIcon}>✨</div>
              <div style={S.successTitle}>You're all set!</div>
              <div style={S.successSub}>{successMsg || 'Your audit is being generated. Check your inbox shortly.'}</div>
              <div style={S.successCard}>
                <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#8888a0', marginBottom: '12px', fontWeight: 600 }}>What happens next</div>
                {[
                  ['🔍', 'Researching your company', '~30 seconds'],
                  ['🤖', 'Generating personalised AI insights', '~60 seconds'],
                  ['📄', 'Building your PDF audit report', '~30 seconds'],
                  ['📧', 'Sending to your inbox', '~10 seconds'],
                ].map(([icon, label, time]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2a2a3d', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#aaaabc' }}>{icon} {label}</span>
                    <span style={{ fontSize: '11px', color: '#c9a84c', fontWeight: 600 }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div style={S.stepTrack}>
                <div style={S.stepLabel}>Step {step + 1} of {STEPS.length}</div>
                <div style={S.stepDots}>
                  {STEPS.map((_, i) => (
                    <div key={i} style={S.dot(i === step, i < step)} />
                  ))}
                </div>
              </div>

              <div style={S.stepTitle}>{currentStep.title}</div>
              <div style={S.stepSub}>
                {step === 0 && 'Tell us who you are so we can personalise your report.'}
                {step === 1 && 'Help us understand your company so we can research it accurately.'}
                {step === 2 && "Share your biggest challenge — we'll address it directly in your audit."}
              </div>

              {/* Fields */}
              {currentFields.map(renderField)}

              {errors._global && (
                <div style={{ background: '#1f0a0a', border: '1px solid #ef444455', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#ef4444', marginBottom: '16px' }}>
                  {errors._global}
                </div>
              )}

              {/* Buttons */}
              <div style={S.btnRow}>
                {step > 0 && (
                  <button style={S.btnBack} onClick={() => setStep(s => s - 1)}>← Back</button>
                )}
                <button
                  style={S.btnNext(loading)}
                  onClick={handleNext}
                  disabled={loading}
                >
                  {loading ? 'Generating your audit…' : step === STEPS.length - 1 ? 'Generate My Audit →' : 'Continue →'}
                </button>
              </div>

              {step === STEPS.length - 1 && (
                <p style={{ fontSize: '11px', color: '#4a4a5a', marginTop: '16px', lineHeight: 1.6 }}>
                  By submitting, you agree to receive your personalised audit report via email. We do not sell your data.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
