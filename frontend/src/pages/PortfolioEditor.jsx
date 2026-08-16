import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { portfolioAPI, settingsAPI, siteAPI, resolveAssetUrl } from '../services/api'
import { exportPortfolioZip } from '../utils/exportPortfolio'
import SuggestButton from '../components/SuggestButton'
import ProjectBuildLog from '../components/ProjectBuildLog'
import { Plus, Download, Upload, Trash2 } from 'lucide-react'

const emptyExperience = { jobTitle: '', companyName: '', location: '', description: '', startDate: '', endDate: '', isCurrent: false }
const emptyEducation = { institutionName: '', degree: '', fieldOfStudy: '', graduationDate: '', description: '' }
const BOOKING_TEMPLATE_CODES = ['01_MED']
const GALLERY_TEMPLATE_CODES = ['02_VIS']
const BOOKSHELF_TEMPLATE_CODES = ['06_WRIT']
const MAX_GALLERY_PHOTOS = 5
const emptyBook = { title: '', description: '', genre: '', publishedYear: '' }

export default function PortfolioEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [formData, setFormData] = useState({})
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '' })
  const [skillForm, setSkillForm] = useState({ skillName: '', proficiencyLevel: 'intermediate' })
  const [experienceForm, setExperienceForm] = useState(emptyExperience)
  const [educationForm, setEducationForm] = useState(emptyEducation)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [exporting, setExporting] = useState(false)
  const [galleryFile, setGalleryFile] = useState(null)
  const [galleryPreview, setGalleryPreview] = useState(null)
  const [galleryCaption, setGalleryCaption] = useState('')
  const [galleryError, setGalleryError] = useState('')
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadingProjectId, setUploadingProjectId] = useState(null)
  const [projectPhotoError, setProjectPhotoError] = useState('')
  const [bookForm, setBookForm] = useState(emptyBook)
  const [uploadingBookCoverId, setUploadingBookCoverId] = useState(null)
  const [bookError, setBookError] = useState('')
  const [score, setScore] = useState(null)
  const [skillSuggestions, setSkillSuggestions] = useState([])
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [allowDownloads, setAllowDownloads] = useState(true)
  const skipAutosaveRef = useRef(true)

  useEffect(() => {
    loadPortfolio()
    settingsAPI.get().then(res => setAutoSaveEnabled(res.data.autoSaveEnabled)).catch(() => {})
    siteAPI.getPublicSettings().then(res => setAllowDownloads(res.data.allowPortfolioDownloads)).catch(() => {})
  }, [id])

  // A fresh load (or switching portfolios) shouldn't trigger an autosave of the data that was
  // just fetched - only genuine edits after that should.
  useEffect(() => {
    skipAutosaveRef.current = true
  }, [portfolio?.id])

  useEffect(() => {
    if (!autoSaveEnabled) return
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false
      return
    }

    const timer = setTimeout(async () => {
      setAutoSaveStatus('saving')
      try {
        await portfolioAPI.update(id, {
          title: formData.title,
          headline: formData.headline,
          aboutMe: formData.aboutMe,
          isPublished: formData.isPublished
        })
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus(''), 2000)
      } catch {
        setAutoSaveStatus('')
      }
    }, 2000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title, formData.headline, formData.aboutMe, formData.isPublished, autoSaveEnabled])

  useEffect(() => {
    if (activeTab === 'appointments' && BOOKING_TEMPLATE_CODES.includes(portfolio?.template?.code)) {
      portfolioAPI.getAppointments(id).then(res => setAppointments(res.data)).catch(() => setAppointments([]))
    }
  }, [activeTab, id, portfolio])

  useEffect(() => {
    if (activeTab === 'skills' && portfolio?.skills?.length) {
      portfolioAPI.getSkillSuggestions(id).then(res => setSkillSuggestions(res.data)).catch(() => setSkillSuggestions([]))
    } else if (activeTab === 'skills') {
      setSkillSuggestions([])
    }
  }, [activeTab, id, portfolio])

  const loadPortfolio = async () => {
    try {
      const res = await portfolioAPI.getById(id)
      setPortfolio(res.data)
      setFormData(res.data)
      portfolioAPI.getScore(id).then(scoreRes => setScore(scoreRes.data)).catch(() => setScore(null))
    } catch (err) {
      console.error('Failed to load portfolio', id, err)
      const status = err.response?.status
      if (status === 404) {
        alert('Portfolio not found')
      } else if (status === 403) {
        alert("You don't have access to this portfolio")
      } else if (status === 401) {
        alert('Your session expired - please log in again')
      } else {
        alert(err.response?.data?.message || 'Could not load this portfolio. Please try again.')
      }
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuggestedSkill = async (skillName) => {
    try {
      await portfolioAPI.addSkill(id, { skillName, proficiencyLevel: 'intermediate' })
      loadPortfolio()
    } catch (err) {
      console.error('Add suggested skill error', err)
    }
  }

  const category = portfolio?.template?.category
  const supportsBooking = BOOKING_TEMPLATE_CODES.includes(portfolio?.template?.code)
  const supportsGallery = GALLERY_TEMPLATE_CODES.includes(portfolio?.template?.code)
  const supportsBookshelf = BOOKSHELF_TEMPLATE_CODES.includes(portfolio?.template?.code)
  const galleryCount = portfolio?.galleryPhotos?.length || 0

  const handleSaveBasic = async () => {
    try {
      await portfolioAPI.update(id, {
        title: formData.title,
        headline: formData.headline,
        aboutMe: formData.aboutMe,
        isPublished: formData.isPublished
      })
      alert('Portfolio updated!')
      loadPortfolio()
    } catch (err) {
      alert('Failed to update portfolio')
    }
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    setPhotoError('')
    if (!file) return
    const isJpeg = /\.(jpe?g)$/i.test(file.name) || file.type === 'image/jpeg'
    if (!isJpeg) {
      setPhotoError('Only JPG images are allowed.')
      setPhotoFile(null)
      setPhotoPreview(null)
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handlePhotoUpload = async () => {
    if (!photoFile) return
    setUploadingPhoto(true)
    try {
      await portfolioAPI.uploadPhoto(id, photoFile)
      setPhotoFile(null)
      setPhotoPreview(null)
      loadPortfolio()
    } catch (err) {
      setPhotoError(err.response?.data || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleGallerySelect = (e) => {
    const file = e.target.files?.[0]
    setGalleryError('')
    if (!file) return
    const isImage = /\.(jpe?g|png|webp)$/i.test(file.name) || /^image\/(jpeg|jpg|png|webp)$/.test(file.type)
    if (!isImage) {
      setGalleryError('Only JPG, PNG, or WEBP images are allowed.')
      setGalleryFile(null)
      setGalleryPreview(null)
      return
    }
    setGalleryFile(file)
    setGalleryPreview(URL.createObjectURL(file))
  }

  const handleGalleryUpload = async () => {
    if (!galleryFile) return
    setUploadingGallery(true)
    try {
      await portfolioAPI.uploadGalleryPhoto(id, galleryFile, galleryCaption)
      setGalleryFile(null)
      setGalleryPreview(null)
      setGalleryCaption('')
      loadPortfolio()
    } catch (err) {
      setGalleryError(err.response?.data?.message || err.response?.data || 'Failed to upload photo')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleGalleryDelete = async (photoId) => {
    try {
      await portfolioAPI.deleteGalleryPhoto(id, photoId)
      loadPortfolio()
    } catch (err) {
      alert('Failed to delete photo')
    }
  }

  const handleAddBook = async () => {
    if (!bookForm.title) return
    try {
      await portfolioAPI.addBook(id, {
        ...bookForm,
        publishedYear: bookForm.publishedYear ? Number(bookForm.publishedYear) : null,
      })
      setBookForm(emptyBook)
      loadPortfolio()
    } catch (err) {
      console.error('Add book error', err)
      alert(err.response?.data || err.message || 'Failed to add book')
    }
  }

  const handleBookCoverSelect = async (bookId, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const isImage = /\.(jpe?g|png|webp)$/i.test(file.name) || /^image\/(jpeg|jpg|png|webp)$/.test(file.type)
    if (!isImage) {
      setBookError('Only JPG, PNG, or WEBP images are allowed.')
      return
    }
    setBookError('')
    setUploadingBookCoverId(bookId)
    try {
      await portfolioAPI.uploadBookCover(id, bookId, file)
      loadPortfolio()
    } catch (err) {
      setBookError(err.response?.data?.message || err.response?.data || 'Failed to upload cover')
    } finally {
      setUploadingBookCoverId(null)
    }
  }

  const handleDeleteBook = async (bookId) => {
    try {
      await portfolioAPI.deleteBook(id, bookId)
      loadPortfolio()
    } catch (err) {
      alert('Failed to delete book')
    }
  }

  const handleAddProject = async () => {
    if (!projectForm.title) return
    try {
      await portfolioAPI.addProject(id, projectForm)
      setProjectForm({ title: '', description: '', technologies: '' })
      loadPortfolio()
    } catch (err) {
      console.error('Add project error', err)
      alert(err.response?.data || err.message || 'Failed to add project')
    }
  }

  const handleProjectPhotoSelect = async (projectId, e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const isImage = /\.(jpe?g|png|webp)$/i.test(file.name) || /^image\/(jpeg|jpg|png|webp)$/.test(file.type)
    if (!isImage) {
      setProjectPhotoError('Only JPG, PNG, or WEBP images are allowed.')
      return
    }
    setProjectPhotoError('')
    setUploadingProjectId(projectId)
    try {
      await portfolioAPI.uploadProjectPhoto(id, projectId, file)
      loadPortfolio()
    } catch (err) {
      setProjectPhotoError(err.response?.data?.message || err.response?.data || 'Failed to upload photo')
    } finally {
      setUploadingProjectId(null)
    }
  }

  const handleAddSkill = async () => {
    if (!skillForm.skillName) return
    try {
      await portfolioAPI.addSkill(id, skillForm)
      setSkillForm({ skillName: '', proficiencyLevel: 'intermediate' })
      loadPortfolio()
    } catch (err) {
      console.error('Add skill error', err)
      alert(err.response?.data || err.message || 'Failed to add skill')
    }
  }

  const handleAddExperience = async () => {
    if (!experienceForm.jobTitle || !experienceForm.companyName || !experienceForm.startDate) {
      return alert('Job title, company, and start date are required')
    }
    try {
      await portfolioAPI.addExperience(id, {
        ...experienceForm,
        endDate: experienceForm.isCurrent ? null : (experienceForm.endDate || null),
      })
      setExperienceForm(emptyExperience)
      loadPortfolio()
    } catch (err) {
      console.error('Add experience error', err)
      alert(err.response?.data || err.message || 'Failed to add experience')
    }
  }

  const handleAddEducation = async () => {
    if (!educationForm.institutionName) return alert('Institution name is required')
    try {
      await portfolioAPI.addEducation(id, {
        ...educationForm,
        graduationDate: educationForm.graduationDate || null,
      })
      setEducationForm(emptyEducation)
      loadPortfolio()
    } catch (err) {
      console.error('Add education error', err)
      alert(err.response?.data || err.message || 'Failed to add education')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportPortfolioZip(portfolio)
    } catch (err) {
      alert('Failed to export portfolio')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>
  if (!portfolio) return null

  const tabs = ['info', 'photo', 'skills', 'experience', 'education', 'projects', ...(supportsGallery ? ['gallery'] : []), ...(supportsBookshelf ? ['bookshelf'] : []), ...(supportsBooking ? ['appointments'] : [])]

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <h1>{portfolio.title}</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {allowDownloads && (
            <button onClick={handleExport} className="btn btn-secondary" disabled={exporting}>
              <Download size={18} /> {exporting ? 'Exporting...' : 'Export as ZIP'}
            </button>
          )}
          <a href={`/portfolio/${portfolio.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {portfolio.isPublished ? 'View Portfolio' : 'Preview Portfolio'}
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="btn btn-secondary"
            style={{
              borderBottom: activeTab === tab ? '3px solid var(--accent)' : 'none',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Basic Info */}
      {activeTab === 'info' && (
        <div>
          {score && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3>Completeness Score: {score.score}/100</h3>
              {score.suggestions?.length > 0 ? (
                <ul style={{ marginTop: '12px', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {score.suggestions.map((s, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{s.suggestion} <small>(+{s.maxPoints - s.points} pts)</small></li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Great job — your portfolio looks complete!</p>
              )}
            </div>
          )}
        <div className="card">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Headline</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" style={{ flex: 1 }} value={formData.headline || ''} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} />
              <SuggestButton
                category={category}
                field="headline"
                context={formData.title}
                onSelect={(value) => setFormData({ ...formData, headline: value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>About Me</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea rows="5" style={{ flex: 1 }} value={formData.aboutMe || ''} onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })} />
              <SuggestButton
                category={category}
                field="aboutMe"
                context={[formData.title, formData.headline].filter(Boolean).join(' - ')}
                alignSelf="flex-start"
                onSelect={(value) => setFormData({ ...formData, aboutMe: value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={formData.isPublished || false} onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })} />
              Publish Portfolio
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleSaveBasic} className="btn btn-primary">Save Changes</button>
            {autoSaveEnabled && autoSaveStatus === 'saving' && <small style={{ color: 'var(--text-secondary)' }}>Saving...</small>}
            {autoSaveEnabled && autoSaveStatus === 'saved' && <small style={{ color: 'var(--accent)' }}>Saved</small>}
          </div>
        </div>
        </div>
      )}

      {/* Photo */}
      {activeTab === 'photo' && (
        <div className="card" style={{ maxWidth: '480px' }}>
          <h3>Profile Photo</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            JPG only. This photo is displayed on your public portfolio.
          </p>

          {(photoPreview || portfolio.photoUrl) && (
            <img
              src={photoPreview || resolveAssetUrl(portfolio.photoUrl)}
              alt="Portfolio"
              style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px', border: '2px solid var(--accent)' }}
            />
          )}

          <div className="form-group">
            <input type="file" accept=".jpg,.jpeg,image/jpeg" onChange={handlePhotoSelect} />
          </div>
          {photoError && <div className="error">{photoError}</div>}
          <button className="btn btn-primary" onClick={handlePhotoUpload} disabled={!photoFile || uploadingPhoto}>
            <Upload size={18} /> {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>
      )}

      {/* Gallery (Photographer template only) */}
      {activeTab === 'gallery' && (
        <div>
          <div className="card" style={{ marginBottom: '24px', maxWidth: '480px' }}>
            <h3>Add Showcase Photo</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              JPG, PNG, or WEBP. Up to {MAX_GALLERY_PHOTOS} photos ({galleryCount}/{MAX_GALLERY_PHOTOS} used).
            </p>

            {galleryPreview && (
              <img
                src={galleryPreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', marginBottom: '16px' }}
              />
            )}

            <div className="form-group">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleGallerySelect}
                disabled={galleryCount >= MAX_GALLERY_PHOTOS}
              />
            </div>
            <div className="form-group">
              <label>Caption (optional)</label>
              <input
                type="text"
                value={galleryCaption}
                onChange={(e) => setGalleryCaption(e.target.value)}
                disabled={galleryCount >= MAX_GALLERY_PHOTOS}
              />
            </div>
            {galleryError && <div className="error">{galleryError}</div>}
            {galleryCount >= MAX_GALLERY_PHOTOS && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                You've reached the {MAX_GALLERY_PHOTOS}-photo limit. Delete a photo to add another.
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={handleGalleryUpload}
              disabled={!galleryFile || uploadingGallery || galleryCount >= MAX_GALLERY_PHOTOS}
            >
              <Upload size={18} /> {uploadingGallery ? 'Uploading...' : 'Add Photo'}
            </button>
          </div>

          <div className="grid">
            {portfolio.galleryPhotos?.map(g => (
              <div key={g.id} className="card">
                <img
                  src={resolveAssetUrl(g.imageUrl)}
                  alt={g.caption || 'Showcase photo'}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', marginBottom: '12px' }}
                />
                {g.caption && <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>{g.caption}</p>}
                <button className="btn btn-secondary" onClick={() => handleGalleryDelete(g.id)}>
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookshelf (Writer template only) */}
      {activeTab === 'bookshelf' && (
        <div>
          <div className="card" style={{ marginBottom: '24px', maxWidth: '480px' }}>
            <h3>Add Book</h3>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="3" value={bookForm.description} onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Genre</label>
                <input type="text" placeholder="Novel, Essays..." value={bookForm.genre} onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Published Year</label>
                <input type="number" value={bookForm.publishedYear} onChange={(e) => setBookForm({ ...bookForm, publishedYear: e.target.value })} />
              </div>
            </div>
            {bookError && <div className="error">{bookError}</div>}
            <button onClick={handleAddBook} className="btn btn-primary"><Plus size={18} /> Add Book</button>
          </div>

          <div className="grid">
            {portfolio.books?.map(b => (
              <div key={b.id} className="card">
                {b.coverImageUrl && (
                  <img
                    src={resolveAssetUrl(b.coverImageUrl)}
                    alt={b.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover', marginBottom: '12px' }}
                  />
                )}
                <h3>{b.title}</h3>
                <small style={{ color: 'var(--text-secondary)' }}>
                  {[b.genre, b.publishedYear].filter(Boolean).join(' | ')}
                </small>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '8px 0' }}>{b.description}</p>
                <div className="form-group">
                  <label style={{ fontSize: '13px' }}>{b.coverImageUrl ? 'Replace cover' : 'Add cover'}</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => handleBookCoverSelect(b.id, e)}
                    disabled={uploadingBookCoverId === b.id}
                  />
                </div>
                <button className="btn btn-secondary" onClick={() => handleDeleteBook(b.id)}>
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {activeTab === 'projects' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Add Project</h3>
            <div className="form-group">
              <label>Title</label>
              <input type="text" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea rows="3" style={{ flex: 1 }} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
                <SuggestButton
                  category={category}
                  field="projectDescription"
                  context={projectForm.title}
                  alignSelf="flex-start"
                  onSelect={(value) => setProjectForm({ ...projectForm, description: value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Technologies</label>
              <input type="text" placeholder="React, Node.js, MongoDB" value={projectForm.technologies} onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })} />
            </div>
            <button onClick={handleAddProject} className="btn btn-primary"><Plus size={18} /> Add Project</button>
          </div>

          {projectPhotoError && <div className="error" style={{ marginBottom: '16px' }}>{projectPhotoError}</div>}

          <div className="grid">
            {portfolio.projects?.map(p => (
              <div key={p.id} className="card">
                {p.imageUrl && (
                  <img
                    src={resolveAssetUrl(p.imageUrl)}
                    alt={p.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', marginBottom: '12px' }}
                  />
                )}
                <h3>{p.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{p.description}</p>
                {p.technologies && <small>{p.technologies}</small>}
                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label style={{ fontSize: '13px' }}>{p.imageUrl ? 'Replace photo' : 'Add photo'}</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => handleProjectPhotoSelect(p.id, e)}
                    disabled={uploadingProjectId === p.id}
                  />
                </div>
                <ProjectBuildLog
                  entries={p.logEntries}
                  editable
                  onAdd={(content) => portfolioAPI.addProjectLogEntry(id, p.id, content).then(loadPortfolio)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {activeTab === 'skills' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Add Skill</h3>
            <div className="form-group">
              <label>Skill</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" style={{ flex: 1 }} value={skillForm.skillName} onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })} />
                <SuggestButton
                  category={category}
                  field="skillName"
                  context={formData.headline || formData.title}
                  onSelect={(value) => setSkillForm({ ...skillForm, skillName: value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Proficiency Level</label>
              <select value={skillForm.proficiencyLevel} onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}>
                <option>beginner</option>
                <option>intermediate</option>
                <option>advanced</option>
                <option>expert</option>
              </select>
            </div>
            <button onClick={handleAddSkill} className="btn btn-primary"><Plus size={18} /> Add Skill</button>
          </div>

          {skillSuggestions.length > 0 && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '10px' }}>Related skills you might add</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {skillSuggestions.map(sug => (
                  <button
                    key={sug}
                    onClick={() => handleAddSuggestedSkill(sug)}
                    className="btn btn-secondary"
                    style={{ textTransform: 'capitalize', padding: '6px 14px' }}
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {portfolio.skills?.map(s => (
              <div key={s.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: '500' }}>{s.skillName}</div>
                <small style={{ color: 'var(--text-secondary)' }}>{s.proficiencyLevel}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {activeTab === 'experience' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Add Experience</h3>
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
            <div className="form-group">
              <label>Description</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea rows="3" style={{ flex: 1 }} value={experienceForm.description} onChange={(e) => setExperienceForm({ ...experienceForm, description: e.target.value })} />
                <SuggestButton
                  category={category}
                  field="experienceDescription"
                  context={experienceForm.jobTitle}
                  alignSelf="flex-start"
                  onSelect={(value) => setExperienceForm({ ...experienceForm, description: value })}
                />
              </div>
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
            <button onClick={handleAddExperience} className="btn btn-primary"><Plus size={18} /> Add Experience</button>
          </div>

          {portfolio.experiences?.map(e => (
            <div key={e.id} className="card" style={{ marginBottom: '12px' }}>
              <h4>{e.jobTitle} at {e.companyName}</h4>
              <small style={{ color: 'var(--text-secondary)' }}>{e.startDate?.slice(0, 10)} - {e.isCurrent ? 'Present' : e.endDate?.slice(0, 10)}</small>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {activeTab === 'education' && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3>Add Education</h3>
            <div className="form-group">
              <label>Institution</label>
              <input type="text" value={educationForm.institutionName} onChange={(e) => setEducationForm({ ...educationForm, institutionName: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input type="text" value={educationForm.degree} onChange={(e) => setEducationForm({ ...educationForm, degree: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Field of Study</label>
              <input type="text" value={educationForm.fieldOfStudy} onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Graduation Date</label>
              <input type="date" value={educationForm.graduationDate} onChange={(e) => setEducationForm({ ...educationForm, graduationDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea rows="3" style={{ flex: 1 }} value={educationForm.description} onChange={(e) => setEducationForm({ ...educationForm, description: e.target.value })} />
                <SuggestButton
                  category={category}
                  field="educationDescription"
                  context={educationForm.institutionName}
                  alignSelf="flex-start"
                  onSelect={(value) => setEducationForm({ ...educationForm, description: value })}
                />
              </div>
            </div>
            <button onClick={handleAddEducation} className="btn btn-primary"><Plus size={18} /> Add Education</button>
          </div>

          {portfolio.educations?.map(ed => (
            <div key={ed.id} className="card" style={{ marginBottom: '12px' }}>
              <h4>{ed.degree} in {ed.fieldOfStudy}</h4>
              <p style={{ color: 'var(--text-secondary)' }}>{ed.institutionName}</p>
            </div>
          ))}
        </div>
      )}

      {/* Appointments (Doctor template only) */}
      {activeTab === 'appointments' && (
        <div>
          {appointments.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No appointment requests yet.</p>}
          {appointments.map(a => (
            <div key={a.id} className="card" style={{ marginBottom: '12px' }}>
              <h4>{a.visitorName} — {a.appointmentDate?.slice(0, 10)} at {a.timeSlot}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{a.visitorEmail}</p>
              {a.note && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{a.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
