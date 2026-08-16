const BANK = {
  Healthcare: {
    headline: [
      'Board-Certified Physician | Patient-First Care',
      'Specialist Dedicated to Better Health Outcomes',
      'Compassionate Care Backed by Clinical Expertise',
    ],
    aboutMe: [
      'Board-certified practitioner with years of experience delivering evidence-based, patient-first care. I combine clinical expertise with a calm, empathetic approach to help patients recover and thrive.',
      'Dedicated healthcare professional focused on accurate diagnosis and personalized treatment plans. I believe in listening first and treating the whole person, not just the symptoms.',
    ],
    skillName: ['Patient Diagnosis & Care Planning', 'Clinical Research', 'Preventive Medicine', 'Telehealth Consultations'],
    experienceDescription: [
      'Managed patient care, diagnostics, and treatment planning while collaborating with a multidisciplinary clinical team.',
      'Provided direct patient care and contributed to departmental protocols for improving treatment outcomes.',
    ],
    educationDescription: ['Completed clinical training with a focus on patient-centered care and evidence-based medicine.'],
    projectDescription: ['Contributed to clinical research aimed at improving diagnostic accuracy and patient outcomes.'],
  },
  Creative: {
    headline: [
      'Visual Storyteller | Capturing Moments That Matter',
      'Creative Photographer & Visual Artist',
      'Turning Everyday Moments Into Timeless Images',
    ],
    aboutMe: [
      'Visual artist passionate about capturing authentic moments through a distinct creative lens. My work blends technical precision with an eye for emotion and story.',
      "I'm a creative professional who believes every image should tell a story. My portfolio spans a range of styles, always anchored in strong composition and genuine connection.",
    ],
    skillName: ['Portrait Photography', 'Photo Editing & Retouching', 'Lighting Design', 'Creative Direction'],
    experienceDescription: ['Led creative shoots end-to-end, from concept and lighting to final retouching and delivery.'],
    educationDescription: ['Studied visual arts with a focus on photography and creative composition.'],
    projectDescription: ['A curated visual series exploring light, texture, and emotion across a themed shoot.'],
  },
  Design: {
    headline: [
      'Product Designer | Crafting Intuitive Experiences',
      'Case-Study Driven Designer & Visual Thinker',
      'Designing Simple Solutions to Complex Problems',
    ],
    aboutMe: [
      "I'm a designer who obsesses over the details that make products feel effortless. My process blends user research, rapid prototyping, and clean visual design.",
      'Designer focused on turning ambiguous problems into clear, elegant interfaces. I care deeply about accessibility, consistency, and the story behind every design decision.',
    ],
    skillName: ['UI/UX Design', 'Design Systems', 'Prototyping (Figma)', 'User Research'],
    experienceDescription: ['Designed end-to-end product experiences, from research and wireframes to polished, tested interfaces.'],
    educationDescription: ['Studied design with an emphasis on human-centered and interaction design principles.'],
    projectDescription: ['A case study covering the research, iteration, and final design of a key product experience.'],
  },
  Technology: {
    headline: [
      'Full-Stack Developer | Building Reliable Software',
      'Software Engineer Focused on Clean, Scalable Code',
      'Turning Ideas Into Shipped Products',
    ],
    aboutMe: [
      'Full-stack developer who enjoys solving hard problems with simple, maintainable solutions. Comfortable across the stack, from database design to polished UI.',
      'Engineer passionate about building reliable, well-tested software. I care about clean architecture as much as I care about shipping features that matter.',
    ],
    skillName: ['React', 'Node.js / .NET', 'System Design', 'Cloud Infrastructure (AWS/Azure)'],
    experienceDescription: ['Built and maintained production features end-to-end, working across frontend, backend, and infrastructure.'],
    educationDescription: ['Studied computer science with a focus on software engineering and systems design.'],
    projectDescription: ['A full-stack application demonstrating clean architecture, testing, and a polished user experience.'],
  },
  Content: {
    headline: [
      'Writer & Content Strategist | Stories That Connect',
      'Turning Ideas Into Words People Actually Read',
      'Content Creator Focused on Clarity and Craft',
    ],
    aboutMe: [
      "I'm a writer who believes good content starts with genuine curiosity. I've written across formats and industries, always aiming for clarity, voice, and impact.",
      'Content creator and storyteller focused on making complex ideas easy to understand and enjoyable to read.',
    ],
    skillName: ['Long-Form Writing', 'Content Strategy', 'SEO Writing', 'Editing & Proofreading'],
    experienceDescription: ['Produced and edited content across formats, balancing brand voice with reader clarity and engagement.'],
    educationDescription: ['Studied writing/communications with a focus on storytelling and audience engagement.'],
    projectDescription: ['A long-form piece exploring a topic in depth, written for clarity and reader engagement.'],
  },
  Legal: {
    headline: [
      'Your Trusted Partner for Legal Solutions',
      'Attorney Focused on Clarity, Advocacy, and Results',
      'Legal Counsel You Can Rely On',
    ],
    aboutMe: [
      "I'm committed to helping individuals and businesses navigate the legal system with clarity and confidence, offering honest advice and strong representation from consultation to resolution.",
      'An attorney dedicated to personalized legal support — combining strategic thinking with clear communication to protect what matters most to my clients.',
    ],
    skillName: ['Criminal Defense', 'Business Law', 'Family Law', 'Real Estate Law', 'Estate Planning'],
    experienceDescription: ['Represented clients across negotiations, filings, and litigation, delivering clear guidance at every stage of the case.'],
    educationDescription: ['Studied law with a focus on litigation and client advocacy.'],
    projectDescription: ['A case study covering the strategy and resolution of a complex legal matter.'],
  },
  default: {
    headline: ['Professional | Passionate About My Craft', 'Building Great Work, One Project at a Time'],
    aboutMe: ['A dedicated professional passionate about delivering high-quality work and continuously improving my craft.'],
    skillName: ['Communication', 'Project Management', 'Problem Solving'],
    experienceDescription: ['Contributed to key projects and initiatives, collaborating closely with a cross-functional team.'],
    educationDescription: ['Completed coursework with a focus on practical, hands-on learning.'],
    projectDescription: ['A project demonstrating strong execution from initial concept through to completion.'],
    summary: ['Dedicated professional with a proven track record of delivering results and driving continuous improvement.'],
    experienceBullets: ['Delivered key projects on time by collaborating closely with cross-functional teams.'],
    educationBullets: ['Completed coursework with a focus on practical, hands-on learning.'],
    skillContent: ['Communication, Project Management, Problem Solving'],
  },
}

let cursor = 0

export function suggest(category, field) {
  const bank = BANK[category] || BANK.default
  const options = bank[field] || BANK.default[field] || []
  if (options.length === 0) return ''
  cursor = (cursor + 1) % options.length
  return options[cursor]
}
