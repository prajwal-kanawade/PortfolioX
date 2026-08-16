import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resumeAPI } from '../services/api'
import ResumeTemplate from './ResumeTemplate'
import SuggestButton from '../components/SuggestButton'
import { Plus, Printer, Check } from 'lucide-react'

const emptyExperience = { jobTitle: '', companyName: '', location: '', startDate: '', endDate: '', isCurrent: false, bullets: '' }
const emptyEducation = { degree: '', university: '', graduationDate: '', bullets: '' }
const emptySkill = { categoryName: '', content: '' }

const RESUME_TEMPLATES = [
  { code: 'modern', label: 'Modern', color: '#E53935' },
  { code: 'classic', label: 'Classic', color: '#1a1a1a' },
  { code: 'creative', label: 'Creative', color: '#7C4DFF' },
  { code: 'minimal', label: 'Minimal', color: '#111111' },
  { code: 'executive', label: 'Executive', color: '#0B3D2E' },
]

export default function ResumeEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [formData, setFormData] = useState({})
  const [experienceForm, setExperienceForm] = useState(emptyExperience)
  const [educationForm, setEducationForm] = useState(emptyEducation)
  const [skillForm, setSkillForm] = useState(emptySkill)

  useEffect(() => {
    loadResume()
  }, [id])

  const loadResume = async () => {
    try {
      const res = await resumeAPI.getById(id)
      setResume(res.data)
      setFormData(res.data)
    } catch (err) {
      alert('Resume not found')
      navigate('/resume-builder')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBasic = async () => {
    try {
      await resumeAPI.update(id, {
        title: formData.title,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        linkedInUrl: formData.linkedInUrl,
        location: formData.location,
        summary: formData.summary,
      })
      loadResume()
    } catch (err) {
      alert('Failed to save changes')
    }
  }

  const handleAddExperience = async () => {
    if (!experienceForm.jobTitle || !experienceForm.companyName || !experienceForm.startDate) {
      return alert('Job title, company, and start date are required')
    }
    try {
      await resumeAPI.addExperience(id, {
        ...experienceForm,
        endDate: experienceForm.isCurrent ? null : (experienceForm.endDate || null),
        bullets: experienceForm.bullets.split('\n').map(b => b.trim()).filter(Boolean),
      })
      setExperienceForm(emptyExperience)
      loadResume()
    } catch (err) {
      alert('Failed to add experience')
    }
  }

  const handleAddEducation = async () => {
    if (!educationForm.degree || !educationForm.university) {
      return alert('Degree and university are required')
    }
    try {
      await resumeAPI.addEducation(id, {
        ...educationForm,
        graduationDate: educationForm.graduationDate || null,
        bullets: educationForm.bullets.split('\n').map(b => b.trim()).filter(Boolean),
      })
      setEducationForm(emptyEducation)
      loadResume()
    } catch (err) {
      alert('Failed to add education')
    }
  }

  const handleAddSkillCategory = async () => {
    if (!skillForm.categoryName || !skillForm.content) {
      return alert('Category name and content are required')
    }
    try {
      await resumeAPI.addSkillCategory(id, skillForm)
      setSkillForm(emptySkill)
      loadResume()
    } catch (err) {
      alert('Failed to add skill category')
    }
  }

  const appendBullet = (formSetter, form) => (value) => {
    formSetter({ ...form, bullets: form.bullets ? `${form.bullets}\n${value}` : value })
  }

  const handleSelectTemplate = async (code) => {
    if (code === (resume.templateCode || 'modern')) return
    setResume({ ...resume, templateCode: code })
    try {
      await resumeAPI.update(id, { templateCode: code })
    } catch (err) {
      alert('Failed to switch template')
      loadResume()
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>
  if (!resume) return null

  const tabs = ['info', 'experience', 'education', 'skills', 'preview']

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{resume.title}</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="card">
          <div className="form-group">
            <label>Resume Title (internal label)</label>
            <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={formData.fullName || ''} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Phone</label>
              <input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Email</label>
              <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>LinkedIn URL</label>
              <input type="text" value={formData.linkedInUrl || ''} onChange={(e) => setFormData({ ...formData, linkedInUrl: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Location</label>
              <input type="text" placeholder="City, State" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Career Summary</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea rows="4" style={{ flex: 1 }} value={formData.summary || ''} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
              <SuggestButton
                category="Resume"
                field="summary"
                context={formData.fullName}
                alignSelf="flex-start"
                onSelect={(value) => setFormData({ ...formData, summary: value })}
              />
            </div>
          </div>
          <button onClick={handleSaveBasic} className="btn btn-primary">Save Changes</button>
        </div>
      )}

      {activeTab === 'experience' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Add Work Experience</h3>
            <div className="form-group">
              <label>Job Title</label>
              <input type="text" value={experienceForm.jobTitle} onChange={(e) => setExperienceForm({ ...experienceForm, jobTitle: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input type="text" value={experienceForm.companyName} onChange={(e) => setExperienceForm({ ...experienceForm, companyName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" value={experienceForm.location} onChange={(e) => setExperienceForm({ ...experienceForm, location: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Start Date</label>
                <input type="date" value={experienceForm.startDate} onChange={(e) => setExperienceForm({ ...experienceForm, startDate: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>End Date</label>
                <input type="date" disabled={experienceForm.isCurrent} value={experienceForm.endDate} onChange={(e) => setExperienceForm({ ...experienceForm, endDate: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={experienceForm.isCurrent} onChange={(e) => setExperienceForm({ ...experienceForm, isCurrent: e.target.checked })} />
                I currently work here
              </label>
            </div>
            <div className="form-group">
              <label>Bullet Points (one per line)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea rows="4" style={{ flex: 1 }} value={experienceForm.bullets} onChange={(e) => setExperienceForm({ ...experienceForm, bullets: e.target.value })} />
                <SuggestButton
                  category="Resume"
                  field="experienceBullets"
                  context={experienceForm.jobTitle}
                  alignSelf="flex-start"
                  onSelect={appendBullet(setExperienceForm, experienceForm)}
                />
              </div>
            </div>
            <button onClick={handleAddExperience} className="btn btn-primary"><Plus size={18} /> Add Experience</button>
          </div>

          {resume.experiences?.map(e => (
            <div key={e.id} className="card" style={{ marginBottom: '12px' }}>
              <h4>{e.jobTitle} at {e.companyName}</h4>
              <small style={{ color: 'var(--text-secondary)' }}>{e.startDate?.slice(0, 10)} - {e.isCurrent ? 'Present' : e.endDate?.slice(0, 10)}</small>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'education' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Add Education</h3>
            <div className="form-group">
              <label>Degree</label>
              <input type="text" value={educationForm.degree} onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })} />
            </div>
            <div className="form-group">
              <label>University</label>
              <input type="text" value={educationForm.university} onChange={(e) => setEducationForm({ ...educationForm, university: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Graduation Date</label>
              <input type="date" value={educationForm.graduationDate} onChange={(e) => setEducationForm({ ...educationForm, graduationDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Details (one per line, e.g. GPA, honors)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea rows="3" style={{ flex: 1 }} value={educationForm.bullets} onChange={(e) => setEducationForm({ ...educationForm, bullets: e.target.value })} />
                <SuggestButton
                  category="Resume"
                  field="educationBullets"
                  context={educationForm.degree}
                  alignSelf="flex-start"
                  onSelect={appendBullet(setEducationForm, educationForm)}
                />
              </div>
            </div>
            <button onClick={handleAddEducation} className="btn btn-primary"><Plus size={18} /> Add Education</button>
          </div>

          {resume.educations?.map(ed => (
            <div key={ed.id} className="card" style={{ marginBottom: '12px' }}>
              <h4>{ed.degree}</h4>
              <small style={{ color: 'var(--text-secondary)' }}>{ed.university}</small>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'skills' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Add Skill Category</h3>
            <div className="form-group">
              <label>Category Name</label>
              <input type="text" placeholder="e.g. Technical Skills" value={skillForm.categoryName} onChange={(e) => setSkillForm({ ...skillForm, categoryName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Content</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea rows="2" style={{ flex: 1 }} value={skillForm.content} onChange={(e) => setSkillForm({ ...skillForm, content: e.target.value })} />
                <SuggestButton
                  category="Resume"
                  field="skillContent"
                  context={skillForm.categoryName}
                  alignSelf="flex-start"
                  onSelect={(value) => setSkillForm({ ...skillForm, content: value })}
                />
              </div>
            </div>
            <button onClick={handleAddSkillCategory} className="btn btn-primary"><Plus size={18} /> Add Category</button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {resume.skillCategories?.map(s => (
              <div key={s.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '500' }}>{s.categoryName}</div>
                <small style={{ color: 'var(--text-secondary)' }}>{s.content}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div>
          <div className="rs-no-print" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button className="btn btn-primary" onClick={() => window.print()}>
              <Printer size={18} /> Print / Save as PDF
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Template:</span>
              {RESUME_TEMPLATES.map(t => {
                const active = (resume.templateCode || 'modern') === t.code
                return (
                  <button
                    key={t.code}
                    type="button"
                    onClick={() => handleSelectTemplate(t.code)}
                    title={t.label}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', borderRadius: '999px',
                      border: active ? `2px solid ${t.color}` : '1px solid var(--border)',
                      background: active ? `${t.color}1a` : 'var(--bg-card)',
                      color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    {t.label}
                    {active && <Check size={13} />}
                  </button>
                )
              })}
            </div>
          </div>
          <ResumeTemplate resume={resume} variant={resume.templateCode || 'modern'} />
        </div>
      )}
    </div>
  )
}
