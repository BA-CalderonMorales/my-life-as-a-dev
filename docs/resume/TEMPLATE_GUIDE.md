---
title: Resume Template Design Guide
description: Comprehensive guide to the ATS-optimized resume template structure and best practices
hide:
  - navigation
  - toc
---

# Resume Template Design Guide

This document explains the design decisions behind the ATS-optimized resume template at `/docs/resume/index.md`.

---

## Design Philosophy

The resume template balances three critical audiences:

1. **Applicant Tracking Systems (ATS)** - Software that parses and ranks resumes
2. **Human Recruiters** - Decision-makers with limited time
3. **Search Engines** - For discoverability and SEO optimization

---

## ATS Optimization Features

### 1. Clear Hierarchical Structure

```markdown
# Name (H1)
## Section Headers (H2)
### Subsections (H3)
```

**Why:** ATS systems parse markdown headers to understand document structure. Clear hierarchy ensures proper categorization of information.

### 2. Standard Section Headers

The template uses industry-standard section names:

- Professional Summary
- Technical Skills
- Professional Experience
- Education
- Certifications & Achievements

**Why:** ATS systems are trained to recognize these specific headers. Using non-standard names (like "My Journey" or "What I Know") can cause parsing failures.

### 3. Linear, Chronological Format

Experience is presented in reverse-chronological order with clear date ranges.

**Why:** ATS systems expect and are optimized for this format. Non-linear or creative layouts confuse parsers.

### 4. Keyword Integration

Technical skills are organized by category with natural keyword density:

- Languages explicitly listed
- Frameworks and tools named directly
- Technologies mentioned in context of achievements

**Why:** ATS systems scan for specific keywords from job descriptions. Natural integration improves matching while remaining readable.

### 5. Standard Date Formats

```
[Start Date] - Present
[Start Date] - [End Date]
```

**Why:** ATS systems extract employment dates to calculate experience. Non-standard formats (like "Summer 2020" or "A while back") fail to parse.

### 6. No Complex Tables or Graphics

Skills are presented using MkDocs Material tabs instead of complex tables.

**Why:** ATS systems struggle with nested tables, graphics, and complex formatting. Simple lists and tabs parse reliably.

---

## Human Readability Features

### 1. 30-Second Scannable Layout

Key information is presented in the first screen:

- Name and contact info
- Professional summary (2-3 sentences)
- Technical skills matrix
- Most recent experience

**Why:** Recruiters spend 30 seconds on initial resume scan. Critical information must be immediately visible.

### 2. Achievement Highlights with Admonitions

```markdown
!!! success "Key Achievements"
    - Built CI/CD pipelines serving 50+ developers
    - Reduced deployment time by 40%
    - Achieved 99.9% uptime
```

**Why:** Admonitions draw the eye to quantifiable achievements. Color-coded boxes break up text walls.

### 3. Quantifiable Metrics

Every achievement includes numbers:

- "50+ developers" not "many developers"
- "40% reduction" not "significant improvement"
- "99.9% uptime" not "high reliability"

**Why:** Concrete metrics demonstrate impact and are more memorable than qualitative descriptions.

### 4. Tabbed Skills Organization

Technical skills are organized into collapsible tabs:

- Languages
- Frontend
- Backend
- Infrastructure
- AI & ML

**Why:** Tabs allow readers to focus on relevant skill categories without overwhelming them with full lists.

### 5. Visual Hierarchy with Icons

```markdown
[:material-github: Repository](url)
[:material-npm: NPM](url)
[:material-language-rust: Crates.io](url)
```

**Why:** Material icons provide visual cues and make links more scannable. Professional appearance without breaking ATS parsing.

---

## SEO Optimization Features

### 1. Comprehensive Meta Description

```yaml
---
title: Resume - Brandon A. Calderon Morales
description: Product-Minded Software Engineer with 4 years of experience specializing in CI/CD pipelines, distributed systems, and AI workflow optimization.
keywords: software engineer, CI/CD, distributed systems, TypeScript, Rust, Python
---
```

**Why:** Search engines use meta descriptions for snippets and ranking. Keywords improve discoverability.

### 2. Structured Headers for Rich Snippets

H2 and H3 headers create document outline that search engines use for featured snippets.

**Why:** Proper structure increases chances of appearing in "People also ask" and knowledge panels.

### 3. Natural Keyword Density

Keywords appear naturally in context:

- "Software Engineer" in title and summary
- Technology names in skills and experience
- Industry terms in achievement descriptions

**Why:** Search engines penalize keyword stuffing but reward natural, contextual usage.

### 4. Internal Linking

```markdown
See [Projects](../projects/index.md) for detailed case studies.
```

**Why:** Internal links improve site navigation and help search engines understand content relationships.

---

## MkDocs Material Features Used

### 1. Admonitions for Highlights

```markdown
!!! success "Key Achievements"
    Content here

!!! info "Focus Areas"
    Content here

!!! quote "Leadership & Systems Thinking"
    Content here
```

**Types Used:**
- `success` - Achievements and positive outcomes
- `info` - Additional context or focus areas
- `quote` - Testimonials or philosophical statements
- `tip` - Professional development and certifications

**Why:** Draws attention to important information while maintaining ATS compatibility (admonitions render as standard text when parsed).

### 2. Tabbed Content

```markdown
=== "Languages"
    Content

=== "Frontend"
    Content
```

**Why:** Organizes dense information (skills matrix) without overwhelming readers. Tabs collapse in ATS parsing to simple sections.

### 3. Material Icons

```markdown
[:material-email: Email Me](mailto:email)
```

**Why:** Professional visual elements that enhance readability without breaking ATS parsing.

### 4. Button Styling

```markdown
[Contact Me](mailto:email){ .md-button .md-button--primary }
```

**Why:** Creates clear calls-to-action. Renders as regular links in ATS parsers.

---

## Content Strategy

### Professional Summary

**Structure:**
1. Title + years of experience
2. Core technical competencies
3. Value proposition or unique angle
4. Current status (education, location)

**Length:** 3-4 sentences maximum

**Why:** Provides complete picture in minimal text. ATS extracts this for candidate summaries.

### Technical Skills Matrix

**Organization:**
- Primary languages listed first
- Grouped by function (Frontend, Backend, Infrastructure)
- Tools and frameworks in context
- AI/ML section for emerging skills

**Why:** Enables quick scanning by recruiters and comprehensive keyword matching by ATS.

### Professional Experience

**Format per Role:**
1. Job title (bold)
2. Company, location, dates
3. Achievements callout box (3-5 items)
4. Detailed responsibilities (bullet points)
5. Technologies used (at end)

**Bullet Structure:**
- Action verb + what you did + measurable outcome
- Technical details without jargon
- Business impact when possible

**Why:** Combines achievement-focused format (for recruiters) with keyword-rich descriptions (for ATS).

### Projects Section

**Structure:**
1. Project name (H3)
2. One-line description
3. Links to live demos/repos
4. Key features (bullets)
5. Impact statement

**Why:** Demonstrates practical application of skills. Links provide evidence of work quality.

---

## Customization Guide

### Replacing Placeholder Content

**Contact Information:**
```markdown
[City, State] | [email] | [LinkedIn] | [GitHub]
```

**Company Names:**
```markdown
**[Your Company Name]** | [City, State] | [Start Date] - Present
```

**Achievements:**
Replace with your actual metrics:
```markdown
- Built CI/CD pipelines serving 50+ developers
```

### Adapting to Your Experience Level

**For Junior Developers:**
- Emphasize education and projects
- Include relevant coursework
- Highlight internships and bootcamps
- Focus on learning agility

**For Mid-Level Engineers:**
- Balance experience and projects
- Emphasize specific technical achievements
- Include mentorship activities
- Show progression in responsibilities

**For Senior Engineers:**
- Lead with system design and architecture
- Emphasize team leadership
- Include strategic initiatives
- Show business impact of technical decisions

### Industry-Specific Keywords

**Web Development:**
- React, TypeScript, Node.js, REST API, GraphQL
- Responsive design, accessibility, performance optimization

**DevOps/SRE:**
- CI/CD, Kubernetes, Docker, infrastructure as code
- Monitoring, observability, incident response

**Backend/Distributed Systems:**
- Microservices, message queues, caching, databases
- Scalability, reliability, performance

**AI/ML Engineering:**
- LLMs, RAG systems, model deployment, prompt engineering
- Vector databases, embeddings, fine-tuning

---

## Best Practices

### DO:

- Use action verbs (Built, Designed, Implemented, Led, Optimized)
- Quantify achievements with specific metrics
- Include technologies used in each role
- Keep formatting simple and consistent
- Update regularly with new skills and achievements
- Tailor keywords to target job descriptions
- Proofread for spelling and grammar

### DON'T:

- Use complex tables or graphics
- Include photos or headshots (unless specifically requested)
- Use first-person pronouns (I, me, my)
- List responsibilities without outcomes
- Include irrelevant work experience
- Use acronyms without spelling them out first
- Exceed 2 pages (unless 10+ years experience)

---

## Testing Your Resume

### ATS Compatibility Test

1. Copy resume content to plain text file
2. Check if structure is still clear
3. Verify all important information is preserved
4. Ensure dates and contact info are readable

### 30-Second Scan Test

Ask someone unfamiliar with your work to read resume for 30 seconds, then answer:

- What role are you seeking?
- What are your top 3 skills?
- What was your most impressive achievement?

If they can't answer, revise for clarity.

### Keyword Density Check

Compare your resume to target job descriptions:

1. Identify 10-15 key requirements
2. Count how many appear in your resume
3. Aim for 70%+ match (naturally integrated)

---

## Print and PDF Optimization

### Print-Friendly Features

- Page breaks avoid splitting sections awkwardly
- High contrast for readability
- Standard fonts (Roboto, system fallbacks)
- No background colors or complex styling

### PDF Export

**Recommended Method:**
1. Open resume in browser
2. Use Print function (Ctrl/Cmd + P)
3. Save as PDF
4. Verify formatting in PDF viewer

**Alternative:**
Use MkDocs PDF export plugin (requires additional setup)

---

## Accessibility Considerations

### Screen Reader Compatibility

- Semantic HTML structure (headings, lists, links)
- Alt text for any images (icons are decorative, use aria-hidden)
- Clear link text (avoid "click here")

### Color Contrast

- Material theme ensures WCAG AA compliance
- Admonition colors have sufficient contrast
- Links are distinguishable from body text

### Keyboard Navigation

- All interactive elements keyboard accessible
- Logical tab order
- Skip navigation links

---

## Version Control

### Tracking Changes

Create git commits when updating resume:

```bash
git add docs/resume/index.md
git commit -m "feat: update resume with new project experience"
```

### Version Tagging

Tag significant resume updates:

```bash
git tag -a resume-v2.0 -m "Major resume revision for senior roles"
```

### Branching Strategy

Create feature branches for major revisions:

```bash
git checkout -b resume/senior-engineer-focus
# Make changes
git checkout main
git merge resume/senior-engineer-focus
```

---

## Maintenance Schedule

### Monthly:
- Review for outdated information
- Update current role achievements
- Add newly acquired skills

### Quarterly:
- Refresh metrics with current numbers
- Add completed projects
- Update certifications

### Annually:
- Complete structural review
- Align with career goals
- Update professional summary
- Remove outdated experience (10+ years old)

---

## Additional Resources

### ATS Research
- [Jobscan ATS Resume Checker](https://www.jobscan.co/)
- [Resume Worded ATS Optimization](https://resumeworded.com/)

### Resume Writing
- [Harvard Resume Guide](https://ocs.fas.harvard.edu/files/ocs/files/hes-resume-cover-letter-guide.pdf)
- [Google XYZ Resume Format](https://www.inc.com/bill-murphy-jr/google-recruiters-say-these-5-resume-tips-including-x-y-z-formula-will-improve-your-odds-of-getting-hired-at-google.html)

### MkDocs Material
- [Admonitions Reference](https://squidfunk.github.io/mkdocs-material/reference/admonitions/)
- [Tabs Reference](https://squidfunk.github.io/mkdocs-material/reference/content-tabs/)
- [Icons Reference](https://squidfunk.github.io/mkdocs-material/reference/icons-emojis/)

---

*This guide is version-controlled with the resume template. Last updated: October 2025*
