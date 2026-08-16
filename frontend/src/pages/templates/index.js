import DoctorTemplate from './DoctorTemplate'
import PhotographerTemplate from './PhotographerTemplate'
import GraphicDesignerTemplate from './GraphicDesignerTemplate'
import WriterTemplate from './WriterTemplate'
import DeveloperTemplate from './DeveloperTemplate'
import LawyerTemplate from './LawyerTemplate'
import MusicianTemplate from './MusicianTemplate'
import ArchitectTemplate from './ArchitectTemplate'
import FitnessTrainerTemplate from './FitnessTrainerTemplate'
import ChefTemplate from './ChefTemplate'
import GenericTemplate from './GenericTemplate'

export { GenericTemplate }

export const TEMPLATE_COMPONENTS = {
  '01_MED': DoctorTemplate,
  '02_VIS': PhotographerTemplate,
  '03_ART': GraphicDesignerTemplate,
  '06_WRIT': WriterTemplate,
  '05_DEV': DeveloperTemplate,
  '04_ENG': LawyerTemplate,
  '07_MUS': MusicianTemplate,
  '08_ARC': ArchitectTemplate,
  '09_FIT': FitnessTrainerTemplate,
  '10_CHF': ChefTemplate,
}

export function resolveTemplateComponent(templateCode) {
  return TEMPLATE_COMPONENTS[templateCode] || GenericTemplate
}

// Static preview thumbnails for the Marketplace grid card (screenshots of the real template).
export const TEMPLATE_PREVIEW_IMAGES = {
  '01_MED': '/template-previews/doctor.png',
  '02_VIS': '/template-previews/photographer.png',
  '03_ART': '/template-previews/graphic-designer.png',
  '06_WRIT': '/template-previews/writer.png',
  '05_DEV': '/template-previews/developer.png',
  '04_ENG': '/template-previews/lawyer.png',
  '07_MUS': '/template-previews/musician.png',
  '08_ARC': '/template-previews/architect.png',
  '09_FIT': '/template-previews/fitness-trainer.png',
  '10_CHF': '/template-previews/chef.png',
}

// Placeholder content used only for the Marketplace "Preview" — never tied to a real user's portfolio.
export const TEMPLATE_SAMPLE_DATA = {
  '01_MED': {
    title: 'Dr. Alex Rivera',
    headline: 'Neurologist | Cognitive Health & Neuro-Rehabilitation Specialist',
    aboutMe: 'Board-certified neurologist dedicated to compassionate, evidence-based care for complex neurological conditions, combining clinical precision with a calm, patient-first approach.',
    viewCount: 128,
    template: { code: '01_MED', category: 'Healthcare' },
    skills: [
      { id: 's1', skillName: 'Cognitive Health & Memory Care', proficiencyLevel: 'expert', endorsements: 24 },
      { id: 's2', skillName: 'Neuro-Rehabilitation', proficiencyLevel: 'expert', endorsements: 18 },
      { id: 's3', skillName: 'Sleep Medicine', proficiencyLevel: 'advanced', endorsements: 9 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Chief Neurologist',
        companyName: 'CarePoint Health',
        location: 'Austin, TX',
        description: 'Leading the neurology department, overseeing diagnostics and treatment plans for complex cognitive and neurological cases.',
        startDate: '2018-03-01',
        isCurrent: true,
      },
      {
        id: 'e2',
        jobTitle: 'Neurology Resident',
        companyName: 'Stanford Medical Center',
        location: 'Palo Alto, CA',
        description: 'Completed residency training in neurology with a focus on neuro-rehabilitation.',
        startDate: '2014-07-01',
        endDate: '2018-02-01',
        isCurrent: false,
      },
    ],
    educations: [
      {
        id: 'ed1',
        institutionName: 'Stanford University School of Medicine',
        degree: 'Doctor of Medicine',
        fieldOfStudy: 'Neuroscience',
        graduationDate: '2014-06-01',
        description: 'Concentration in neuroscience and behavioral biology.',
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Non-Invasive Brain Stimulation Study',
        description: 'Co-authored clinical research on non-invasive brain stimulation for post-stroke recovery.',
        technologies: 'Clinical Research, Neuro-imaging',
      },
    ],
  },
  '02_VIS': {
    title: 'Elena Marlowe',
    headline: 'Editorial Photographer | Portraits & Visual Storytelling',
    aboutMe: 'I capture the raw essence of human experience through composition, light, and timing — stripping away the unnecessary to reveal the unpolished beauty of the subject.',
    viewCount: 342,
    template: { code: '02_VIS', category: 'Creative' },
    galleryPhotos: [],
    skills: [
      { id: 's1', skillName: 'Portrait Photography', proficiencyLevel: 'expert', endorsements: 31 },
      { id: 's2', skillName: 'Editorial Direction', proficiencyLevel: 'expert', endorsements: 22 },
      { id: 's3', skillName: 'Film Development', proficiencyLevel: 'advanced', endorsements: 14 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Lead Photographer',
        companyName: 'Marlowe Studio',
        location: 'London, UK',
        description: 'Directing editorial shoots for fashion and lifestyle publications, from concept through final retouching.',
        startDate: '2019-04-01',
        isCurrent: true,
      },
    ],
    educations: [
      {
        id: 'ed1',
        institutionName: 'London College of Communication',
        degree: 'BA',
        fieldOfStudy: 'Photography',
        graduationDate: '2018-06-01',
      },
    ],
  },
  '03_ART': {
    title: 'Natasha Brooks',
    headline: 'Product Designer Crafting Intuitive Digital Experiences',
    aboutMe: "Design has always been more than just a job for me — it's the passion that drives me to solve complex problems with clear, human-centered interfaces.",
    viewCount: 512,
    template: { code: '03_ART', category: 'Design' },
    skills: [
      { id: 's1', skillName: 'UI/UX Design', proficiencyLevel: 'expert', endorsements: 40 },
      { id: 's2', skillName: 'Design Systems', proficiencyLevel: 'expert', endorsements: 27 },
      { id: 's3', skillName: 'Prototyping (Figma)', proficiencyLevel: 'advanced', endorsements: 19 },
      { id: 's4', skillName: 'User Research', proficiencyLevel: 'advanced', endorsements: 15 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Product Designer',
        companyName: 'Vantage Labs',
        location: 'Remote',
        description: 'Leading end-to-end product design for a suite of B2B SaaS dashboards, from research through polished UI.',
        startDate: '2021-02-01',
        isCurrent: true,
      },
      {
        id: 'e2',
        jobTitle: 'UI/UX Designer',
        companyName: 'Odama Studio',
        location: 'Berlin, Germany',
        description: 'Designed intuitive, engaging digital experiences through functional and aesthetic interface design.',
        startDate: '2018-06-01',
        endDate: '2021-01-01',
        isCurrent: false,
      },
    ],
    educations: [
      {
        id: 'ed1',
        institutionName: 'Rhode Island School of Design',
        degree: 'BFA',
        fieldOfStudy: 'Graphic Design',
        graduationDate: '2018-05-01',
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Mobile App Redesign',
        description: 'End-to-end redesign of a fintech mobile app, improving onboarding conversion by 34%.',
        technologies: 'Figma, UI Design',
      },
      {
        id: 'p2',
        title: 'SaaS Dashboard System',
        description: 'Built a scalable design system powering a data-analytics dashboard used by 50+ enterprise clients.',
        technologies: 'Design Systems, Figma',
      },
    ],
  },
  '06_WRIT': {
    title: 'Eleanor Voss',
    headline: 'Words carved in parchment and time.',
    aboutMe: "Dedicated to the meticulous craft of long-form inquiry — a scholar's folio of essays, novels, and investigative pieces exploring the intersection of modern philosophy and classical tradition.",
    viewCount: 218,
    template: { code: '06_WRIT', category: 'Cultural Critic' },
    books: [
      {
        id: 'b1',
        title: 'The Silent Gantry',
        description: 'A haunting exploration of architectural memory and the ghosts of industrial evolution.',
        genre: 'Novel',
        publishedYear: 2023,
      },
      {
        id: 'b2',
        title: 'Ink and Iron',
        description: 'Critical meditations on the weight of history in the digital age of information.',
        genre: 'Essays',
        publishedYear: 2021,
      },
      {
        id: 'b3',
        title: "Vesper's Dial",
        description: 'Winner of the International Scholastic Prize for Contemporary Fiction.',
        genre: 'Novel',
        publishedYear: 2019,
      },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Contributing Editor',
        companyName: 'The Long Read Review',
        location: 'Remote',
        description: 'Writing long-form cultural criticism and editing feature essays on literature and philosophy.',
        startDate: '2020-01-01',
        isCurrent: true,
      },
    ],
  },
  '05_DEV': {
    title: 'Mark Antony',
    headline: 'Full-Stack Developer building fast, scalable web products.',
    aboutMe: 'I build reliable, well-tested software end to end — from database design to polished UI.',
    viewCount: 431,
    template: { code: '05_DEV', category: 'Technology' },
    skills: [
      { id: 's1', skillName: 'React', proficiencyLevel: 'expert', endorsements: 30 },
      { id: 's2', skillName: 'Node.js', proficiencyLevel: 'expert', endorsements: 24 },
      { id: 's3', skillName: 'TypeScript', proficiencyLevel: 'advanced', endorsements: 18 },
      { id: 's4', skillName: 'PostgreSQL', proficiencyLevel: 'advanced', endorsements: 14 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Senior Software Engineer',
        companyName: 'Nexus Labs',
        location: 'Remote',
        description: 'Leading development of a CRM platform used by 200+ enterprise teams.',
        startDate: '2022-01-01',
        isCurrent: true,
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Nexus CRM Interface',
        description: 'A full-stack CRM rebuild focused on real-time collaboration and performance.',
        technologies: 'React, Node.js, PostgreSQL',
      },
      {
        id: 'p2',
        title: 'Vanguard Brand Identity',
        description: 'Marketing site and component library for a fintech brand relaunch.',
        technologies: 'Next.js, TypeScript',
      },
    ],
  },
  '04_ENG': {
    title: 'Anthony Reyes',
    headline: 'Your Trusted Partner for Legal Solutions',
    aboutMe: "With 20 years of legal experience, I'm committed to helping individuals and families navigate the legal system with clarity and confidence. I offer honest advice, strong representation, and personal attention to every case.",
    viewCount: 276,
    template: { code: '04_ENG', category: 'Legal' },
    skills: [
      { id: 's1', skillName: 'Criminal Defense', proficiencyLevel: 'expert', endorsements: 22 },
      { id: 's2', skillName: 'Business Law', proficiencyLevel: 'expert', endorsements: 17 },
      { id: 's3', skillName: 'Family Law', proficiencyLevel: 'advanced', endorsements: 14 },
      { id: 's4', skillName: 'Real Estate Law', proficiencyLevel: 'advanced', endorsements: 9 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Founding Partner',
        companyName: 'Reyes & Associates',
        location: 'Chicago, IL',
        description: 'Leading a boutique practice representing individuals and small businesses in litigation and contract matters.',
        startDate: '2005-03-01',
        isCurrent: true,
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Contract Dispute Resolution',
        description: 'Negotiated a favorable settlement for a small business in a multi-party supply contract dispute.',
        technologies: 'Business Law',
      },
    ],
  },
  '07_MUS': {
    title: 'Jordan Vale',
    headline: 'Singer-Songwriter blending indie folk with electronic textures.',
    aboutMe: 'Touring musician and producer crafting songs that sit somewhere between a campfire and a synthesizer — honest lyrics, layered production, and a live show built to move a room.',
    viewCount: 289,
    template: { code: '07_MUS', category: 'Music' },
    galleryPhotos: [],
    skills: [
      { id: 's1', skillName: 'Vocals & Songwriting', proficiencyLevel: 'expert', endorsements: 26 },
      { id: 's2', skillName: 'Guitar', proficiencyLevel: 'expert', endorsements: 19 },
      { id: 's3', skillName: 'Music Production (Ableton)', proficiencyLevel: 'advanced', endorsements: 15 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Headline Artist',
        companyName: 'Independent / Self-Released',
        location: 'Nashville, TN',
        description: 'Touring venues and festivals across North America, averaging 60+ live shows a year.',
        startDate: '2020-05-01',
        isCurrent: true,
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Midnight Static (EP)',
        description: 'A five-track EP exploring themes of distance and reconnection, recorded live to tape.',
        technologies: 'Indie Folk, Electronic',
      },
      {
        id: 'p2',
        title: 'Amber Roads',
        description: 'Lead single from the upcoming album, premiered on regional radio.',
        technologies: 'Singer-Songwriter',
      },
    ],
  },
  '08_ARC': {
    title: 'Priya Chandrasekhar',
    headline: 'Architect designing quiet, light-filled spaces.',
    aboutMe: 'I design residential and cultural spaces that respond to their site, their light, and the people who use them — modern, materially honest, and built to last generations.',
    viewCount: 197,
    template: { code: '08_ARC', category: 'Architecture' },
    galleryPhotos: [],
    skills: [
      { id: 's1', skillName: 'Residential Architecture', proficiencyLevel: 'expert', endorsements: 21 },
      { id: 's2', skillName: 'CAD / BIM (Revit)', proficiencyLevel: 'expert', endorsements: 17 },
      { id: 's3', skillName: 'Sustainable Design', proficiencyLevel: 'advanced', endorsements: 12 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Principal Architect',
        companyName: 'Studio Chandrasekhar',
        location: 'Portland, OR',
        description: 'Leading a boutique residential practice focused on light, material honesty, and site-responsive design.',
        startDate: '2017-09-01',
        isCurrent: true,
      },
    ],
    educations: [
      {
        id: 'ed1',
        institutionName: 'Rice School of Architecture',
        degree: 'Master of Architecture',
        graduationDate: '2015-05-01',
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Hollow Ridge Residence',
        description: 'A cantilevered hillside home built around three mature oak trees, using reclaimed timber and board-formed concrete.',
        technologies: 'Residential, Sustainable',
      },
    ],
  },
  '09_FIT': {
    title: 'Marcus Ade',
    headline: 'Strength coach helping you build a body that lasts.',
    aboutMe: "I train everyday athletes and busy professionals with a no-nonsense approach to strength training, mobility, and sustainable nutrition — no fads, just consistent results.",
    viewCount: 356,
    template: { code: '09_FIT', category: 'Fitness' },
    galleryPhotos: [],
    skills: [
      { id: 's1', skillName: 'Certified Strength & Conditioning Specialist', proficiencyLevel: 'expert', endorsements: 28 },
      { id: 's2', skillName: 'Nutrition Coaching', proficiencyLevel: 'advanced', endorsements: 16 },
      { id: 's3', skillName: 'Mobility & Injury Prevention', proficiencyLevel: 'advanced', endorsements: 13 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Head Coach',
        companyName: 'Forge Performance Gym',
        location: 'Denver, CO',
        description: 'Coaching 1-on-1 and small-group strength programs for 80+ active clients.',
        startDate: '2019-01-01',
        isCurrent: true,
      },
    ],
    projects: [
      {
        id: 'p1',
        title: '12-Week Strength Reset',
        description: 'A progressive strength program that helped clients average a 35% increase in compound lift totals.',
        technologies: 'Strength Training',
      },
    ],
  },
  '10_CHF': {
    title: 'Gabriel Moreau',
    headline: 'Chef crafting modern French cuisine with local ingredients.',
    aboutMe: "Trained in classical French technique and shaped by a decade of seasonal, farm-driven cooking — I build menus around what's fresh, not what's fashionable.",
    viewCount: 241,
    template: { code: '10_CHF', category: 'Culinary' },
    galleryPhotos: [],
    skills: [
      { id: 's1', skillName: 'Classical French Technique', proficiencyLevel: 'expert', endorsements: 23 },
      { id: 's2', skillName: 'Menu Development', proficiencyLevel: 'expert', endorsements: 18 },
      { id: 's3', skillName: 'Pastry', proficiencyLevel: 'advanced', endorsements: 11 },
    ],
    experiences: [
      {
        id: 'e1',
        jobTitle: 'Executive Chef',
        companyName: 'Maison Laurier',
        location: 'San Francisco, CA',
        description: 'Leading the kitchen for a 40-seat seasonal tasting-menu restaurant sourced from local farms.',
        startDate: '2021-03-01',
        isCurrent: true,
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Autumn Tasting Menu',
        description: 'A seven-course seasonal menu built around root vegetables, foraged mushrooms, and heritage grains.',
        technologies: 'French, Seasonal',
      },
    ],
  },
}
