import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function SuggestionTextarea({ value, onChange, fieldType, context, placeholder }) {
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const fetchSuggestion = async (text) => {
    if (text.trim().length < 15) { setSuggestion(null); return }
    setLoading(true)
    try {
      const res = await axios.post("http://127.0.0.1:8000/resume/smart-suggestion", {
        field_type: fieldType, current_text: text, context
      })
      if (res.data.suggestion) { setSuggestion(res.data.suggestion); setDismissed(false) }
      else setSuggestion(null)
    } catch {
      setSuggestion(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => { if (value) fetchSuggestion(value) }, 1500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div>
      <textarea value={value} onChange={e => { onChange(e.target.value); setDismissed(true) }}
        placeholder={placeholder}
        rows={2} style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"12px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"'Segoe UI',sans-serif"}}/>
      {loading && <p style={{color:"#A08D7C",fontSize:"10px",marginTop:"4px"}}>✨ Checking for a stronger phrasing...</p>}
      {suggestion && !dismissed && !loading && (
        <div className="animate-fadeIn" style={{backgroundColor:"#F0E4D3",borderRadius:"8px",padding:"10px 12px",marginTop:"6px"}}>
          <p style={{fontSize:"10px",color:"#8D6E63",fontWeight:"700",marginBottom:"4px"}}>💡 SUGGESTED REWRITE</p>
          <p style={{fontSize:"12px",color:"#4A3728",marginBottom:"8px"}}>{suggestion}</p>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={() => { onChange(suggestion); setSuggestion(null) }} style={{background:"#5C4033",color:"white",border:"none",padding:"4px 12px",borderRadius:"6px",fontSize:"10px",fontWeight:"700",cursor:"pointer"}}>✓ Accept</button>
            <button onClick={() => setDismissed(true)} style={{background:"none",border:"none",color:"#8D6E63",fontSize:"10px",cursor:"pointer"}}>✕ Reject</button>
            <button onClick={() => fetchSuggestion(value)} style={{background:"none",border:"none",color:"#C89B6D",fontSize:"10px",fontWeight:"700",cursor:"pointer"}}>🔄 Regenerate</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResumeBuilder() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [template, setTemplate] = useState("classic")
  const [loading, setLoading] = useState(false)
  const [generatedResume, setGeneratedResume] = useState(null)
  const [githubStats, setGithubStats] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(null)
  const [autosaveStatus, setAutosaveStatus] = useState(null)
  const [restoredDraft, setRestoredDraft] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState(false)
  const [form, setForm] = useState({
    name:"", email:"", phone:"", location:"", linkedin:"", github:"",
    targetRole:"", summary:"",
    education:[{degree:"",college:"",year:"",cgpa:""}],
    skills:"",
    experience:[{company:"",role:"",duration:"",description:""}],
    projects:[{name:"",tech:"",description:""}],
    certifications:[]
  })

  useEffect(() => {
    const saved = localStorage.getItem("resume_builder_draft")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setForm(parsed)
        setRestoredDraft(true)
        setTimeout(() => setRestoredDraft(false), 4000)
      } catch { /* corrupt draft, ignore and start fresh */ }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("resume_builder_draft", JSON.stringify(form))
      setAutosaveStatus("saved")
      setTimeout(() => setAutosaveStatus(null), 1500)
    }, 1200)
    return () => clearTimeout(timer)
  }, [form])

  const handleChange = (field, value) => {
    setForm(prev => ({...prev, [field]: value}))
  }

  const generateSummary = async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const experienceText = form.experience.filter(e => e.company).map(e => e.role+" at "+e.company).join("; ")
      const res = await axios.post("http://127.0.0.1:8000/resume/generate-summary", {
        name: form.name,
        target_role: form.targetRole,
        skills: form.skills,
        experience_summary: experienceText,
        education: form.education?.[0]?.degree || ""
      })
      if (res.data.summary) {
        handleChange("summary", res.data.summary)
      } else {
        setSummaryError(res.data.message || "AI summary is unavailable right now.")
      }
    } catch {
      setSummaryError("Couldn't reach the AI service — please try again.")
    }
    setSummaryLoading(false)
  }

  const fetchGithubStats = async () => {
    if (!form.github.trim()) return
    setGithubLoading(true)
    setGithubError(false)
    setGithubStats(null)
    try {
      const res = await axios.get("http://127.0.0.1:8000/github/stats/" + encodeURIComponent(form.github.trim()))
      setGithubStats(res.data)
    } catch (err) {
      if (err.response?.status === 404) setGithubError("GitHub user not found — check the username or URL.")
      else if (err.response?.status === 429) setGithubError("GitHub's rate limit was hit — try again in a few minutes.")
      else setGithubError("Couldn't fetch GitHub stats right now.")
    }
    setGithubLoading(false)
  }

  const attachCertificateFile = (index, file) => {
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      alert(file.name + " is over 4MB — please upload a smaller file.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      handleArrayChange("certifications", index, "file", {name: file.name, dataUrl: reader.result, type: file.type})
    }
    reader.readAsDataURL(file)
  }

  const removeCertificateFile = (index) => {
    handleArrayChange("certifications", index, "file", null)
  }

  const handleArrayChange = (field, index, subField, value) => {
    const arr = [...form[field]]
    arr[index] = {...arr[index], [subField]: value}
    setForm(prev => ({...prev, [field]: arr}))
  }

  const addItem = (field, template) => {
    setForm(prev => ({...prev, [field]: [...prev[field], template]}))
  }

  const removeItem = (field, index) => {
    setForm(prev => ({...prev, [field]: prev[field].filter((_,i) => i !== index)}))
  }

  const generateResume = () => {
    setLoading(true)
    setTimeout(() => {
      const resume = buildResumeHTML(form)
      setGeneratedResume(resume)
      setLoading(false)
      setStep(4)
    }, 1500)
  }

  const normalizeUrl = (url) => {
    const trimmed = url.trim()
    if (!trimmed) return "#"
    return /^https?:\/\//i.test(trimmed) ? trimmed : "https://" + trimmed
  }

  // --- Shared section-content builders — same HTML fragment logic used by every template.
  // Only the CSS class definitions differ per template, not this markup. ---
  const renderHeaderBlock = (f) => `
    <div class="header">
      <div class="name">${f.name || "Your Name"}</div>
      <div class="contact">
        ${f.email ? `<span>📧 ${f.email}</span>` : ""}
        ${f.phone ? `<span>📱 ${f.phone}</span>` : ""}
        ${f.location ? `<span>📍 ${f.location}</span>` : ""}
        ${f.linkedin ? `<span>🔗 <a href="${normalizeUrl(f.linkedin)}" target="_blank" class="link">${f.linkedin}</a></span>` : ""}
        ${f.github ? `<span>💻 <a href="${normalizeUrl(f.github)}" target="_blank" class="link">${f.github}</a></span>` : ""}
      </div>
    </div>
    ${f.targetRole ? `<div class="target-role">${f.targetRole}</div>` : ""}
  `

  const renderSummarySection = (f) => f.summary ? `
    <div class="section-title">Professional Summary</div>
    <p class="summary">${f.summary}</p>
  ` : ""

  const renderEducationSection = (f) => f.education.some(e => e.degree) ? `
    <div class="section-title">Education</div>
    ${f.education.filter(e => e.degree).map(e => `
      <div class="item">
        <div class="item-header"><span class="item-title">${e.degree}</span><span class="item-date">${e.year}</span></div>
        <div class="item-sub">${e.college}${e.cgpa ? ` | CGPA: ${e.cgpa}` : ""}</div>
      </div>
    `).join("")}
  ` : ""

  const renderSkillsSection = (f) => f.skills ? `
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">${f.skills.split(",").map(s => `<span class="skill-tag">${s.trim()}</span>`).join("")}</div>
  ` : ""

  const renderExperienceSection = (f) => f.experience.some(e => e.company) ? `
    <div class="section-title">Experience</div>
    ${f.experience.filter(e => e.company).map(e => `
      <div class="item">
        <div class="item-header"><span class="item-title">${e.role}</span><span class="item-date">${e.duration}</span></div>
        <div class="item-sub">${e.company}</div>
        <div class="desc">${e.description}</div>
      </div>
    `).join("")}
  ` : ""

  const renderProjectsSection = (f) => f.projects.some(p => p.name) ? `
    <div class="section-title">Projects</div>
    ${f.projects.filter(p => p.name).map(p => `
      <div class="item">
        <div class="item-title">${p.name} ${p.tech ? `<span style="font-weight:400;color:#6B5B4D">| ${p.tech}</span>` : ""}</div>
        <div class="desc">${p.description}</div>
      </div>
    `).join("")}
  ` : ""

  const renderCertificationsSection = (f) => f.certifications.length > 0 ? `
    <div class="section-title">Certifications</div>
    ${f.certifications.map(c => `
      <div class="item" style="margin-bottom:10px">
        <div class="item-header">
          <span class="item-title">${c.name || "Untitled Certificate"}${c.issuer ? " — " + c.issuer : ""}</span>
          ${c.issue_date ? `<span class="item-date">${c.issue_date}</span>` : ""}
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:3px">
          ${c.credential_id ? `<span style="font-size:11px;color:#6B5B4D">ID: ${c.credential_id}</span>` : ""}
          ${c.credential_url ? `<a href="${normalizeUrl(c.credential_url)}" target="_blank" class="link" style="font-size:11px">🔗 Verify Credential</a>` : ""}
          ${c.file ? (c.file.type.startsWith("image/")
            ? `<a href="${c.file.dataUrl}" target="_blank" class="link" style="font-size:11px">🖼️ View Certificate</a>`
            : `<a href="${c.file.dataUrl}" download="${c.file.name}" class="link" style="font-size:11px">📄 ${c.file.name}</a>`
          ) : ""}
        </div>
      </div>
    `).join("")}
  ` : ""

  const renderGithubSection = (f) => githubStats ? `
    <div class="section-title">GitHub Highlights</div>
    <div class="desc">${githubStats.public_repos} public repositories · ${githubStats.followers} followers${githubStats.top_languages.length ? " · Top languages: " + githubStats.top_languages.slice(0,5).join(", ") : ""}</div>
    ${githubStats.top_repos.length > 0 ? `
    <div style="margin-top:6px">
      ${githubStats.top_repos.slice(0,3).map(r => `
        <div style="margin-bottom:6px">
          <a href="${r.url}" target="_blank" class="link" style="font-weight:600;font-size:12px">${r.name}</a>
          ${r.stars > 0 ? `<span style="color:#A08D7C;font-size:10px"> · ★ ${r.stars}</span>` : ""}
          ${r.description ? `<div style="color:#6B5B4D;font-size:11px">${r.description}</div>` : ""}
        </div>
      `).join("")}
    </div>
    ` : ""}
  ` : ""

  // --- Template 1: Classic — single column, traditional, most ATS-safe ---
  const buildClassicHTML = (f) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Arial',sans-serif; font-size:11px; color:#1a1a1a; background:white; padding:32px; }
  .header { border-bottom:2px solid #5C4033; padding-bottom:14px; margin-bottom:16px; }
  .name { font-size:24px; font-weight:700; color:#5C4033; margin-bottom:4px; }
  .contact { color:#6B5B4D; font-size:10px; display:flex; gap:14px; flex-wrap:wrap; }
  .target-role { color:#5C4033; font-weight:700; font-size:13px; margin-bottom:8px; text-align:center; }
  .section-title { font-size:13px; font-weight:700; color:#5C4033; border-bottom:1px solid #5C4033; padding-bottom:3px; margin:14px 0 8px; text-transform:uppercase; letter-spacing:0.5px; }
  .item { margin-bottom:10px; }
  .item-header { display:flex; justify-content:space-between; align-items:baseline; }
  .item-title { font-weight:700; font-size:11px; }
  .item-sub, .item-date { color:#6B5B4D; font-size:10px; }
  .desc { color:#5C4A3D; margin-top:3px; line-height:1.5; }
  .skills-grid { display:flex; flex-wrap:wrap; gap:6px; }
  .skill-tag { background:#F0E4D3; color:#5C4033; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:500; }
  .summary { color:#5C4A3D; line-height:1.6; }
  .link { color:#5C4033; text-decoration:underline; }
</style></head><body>
  ${renderHeaderBlock(f)}
  ${renderSummarySection(f)}
  ${renderEducationSection(f)}
  ${renderSkillsSection(f)}
  ${renderExperienceSection(f)}
  ${renderProjectsSection(f)}
  ${renderCertificationsSection(f)}
  ${renderGithubSection(f)}
</body></html>`

  // --- Template 2: Modern — two-column, sidebar for contact info/skills/certs ---
  const buildModernHTML = (f) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',sans-serif; font-size:11px; color:#2A2A2A; background:white; }
  .layout { display:flex; min-height:100%; }
  .sidebar { width:32%; background:#5C4033; color:#FFFDF9; padding:28px 20px; }
  .main { width:68%; padding:28px 24px; }
  .name { font-size:22px; font-weight:800; margin-bottom:4px; }
  .target-role { font-size:12px; opacity:0.85; margin-bottom:20px; }
  .contact span { display:block; font-size:10px; margin-bottom:6px; opacity:0.9; }
  .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin:18px 0 8px; }
  .sidebar .section-title { color:#F0E4D3; border-bottom:1px solid rgba(255,255,255,0.25); padding-bottom:4px; }
  .main .section-title { color:#5C4033; border-bottom:1px solid #E8D9C5; padding-bottom:4px; }
  .item { margin-bottom:10px; }
  .item-header { display:flex; justify-content:space-between; align-items:baseline; }
  .item-title { font-weight:700; font-size:11px; color:#3A2E22; }
  .item-sub, .item-date { color:#8D7A6A; font-size:10px; }
  .desc { color:#4A3E32; margin-top:3px; line-height:1.5; }
  .skills-grid { display:flex; flex-wrap:wrap; gap:5px; }
  .skill-tag { background:rgba(255,255,255,0.15); color:#FFFDF9; padding:3px 9px; border-radius:12px; font-size:9px; }
  .summary { color:#4A3E32; line-height:1.6; }
  .link { color:#D9B98C; text-decoration:underline; }
  .main .link { color:#5C4033; }
</style></head><body>
  <div class="layout">
    <div class="sidebar">
      <div class="name">${f.name || "Your Name"}</div>
      <div class="target-role">${f.targetRole || ""}</div>
      <div class="contact">
        ${f.email ? `<span>📧 ${f.email}</span>` : ""}
        ${f.phone ? `<span>📱 ${f.phone}</span>` : ""}
        ${f.location ? `<span>📍 ${f.location}</span>` : ""}
        ${f.linkedin ? `<span>🔗 <a href="${normalizeUrl(f.linkedin)}" target="_blank" class="link">LinkedIn</a></span>` : ""}
        ${f.github ? `<span>💻 <a href="${normalizeUrl(f.github)}" target="_blank" class="link">GitHub</a></span>` : ""}
      </div>
      ${renderSkillsSection(f)}
      ${renderCertificationsSection(f)}
    </div>
    <div class="main">
      ${renderSummarySection(f)}
      ${renderExperienceSection(f)}
      ${renderProjectsSection(f)}
      ${renderEducationSection(f)}
      ${renderGithubSection(f)}
    </div>
  </div>
</body></html>`

  // --- Template 3: Compact — dense single column, maximizes content per page ---
  const buildCompactHTML = (f) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica',Arial,sans-serif; font-size:9.5px; color:#222; background:white; padding:20px 24px; line-height:1.35; }
  .header { display:flex; justify-content:space-between; align-items:baseline; border-bottom:1.5px solid #333; padding-bottom:6px; margin-bottom:8px; flex-wrap:wrap; }
  .name { font-size:17px; font-weight:800; color:#1A1A1A; }
  .target-role { display:none; }
  .contact { color:#555; font-size:9px; display:flex; gap:10px; flex-wrap:wrap; }
  .section-title { font-size:10px; font-weight:800; color:#1A1A1A; text-transform:uppercase; letter-spacing:0.3px; margin:9px 0 4px; }
  .item { margin-bottom:5px; }
  .item-header { display:flex; justify-content:space-between; align-items:baseline; }
  .item-title { font-weight:700; font-size:9.5px; }
  .item-sub, .item-date { color:#666; font-size:9px; }
  .desc { color:#333; margin-top:1px; }
  .skills-grid { display:flex; flex-wrap:wrap; gap:4px; }
  .skill-tag { background:#EEE; color:#333; padding:1px 6px; border-radius:3px; font-size:8.5px; }
  .summary { color:#333; }
  .link { color:#1A1A1A; text-decoration:underline; }
</style></head><body>
  ${renderHeaderBlock(f)}
  ${renderSummarySection(f)}
  ${renderExperienceSection(f)}
  ${renderProjectsSection(f)}
  ${renderEducationSection(f)}
  ${renderSkillsSection(f)}
  ${renderCertificationsSection(f)}
  ${renderGithubSection(f)}
</body></html>`

  const buildResumeHTML = (f) => {
    if (template === "modern") return buildModernHTML(f)
    if (template === "compact") return buildCompactHTML(f)
    return buildClassicHTML(f)
  }

  const getInlineATSScore = (f) => {
    const checks = []

    checks.push({label:"Professional summary", pass: !!f.summary && f.summary.length > 30, points:15})
    checks.push({label:"5+ skills listed", pass: f.skills.split(",").filter(s=>s.trim()).length >= 5, points:15})
    checks.push({label:"Experience with quantifiable results", pass: f.experience.some(e => /\d/.test(e.description)), points:20})
    checks.push({label:"At least one project", pass: f.projects.some(p => p.name), points:15})
    checks.push({label:"Education listed", pass: f.education.some(e => e.degree), points:10})
    checks.push({label:"Certifications", pass: f.certifications.length > 0, points:10})
    checks.push({label:"LinkedIn or GitHub linked", pass: !!(f.linkedin || f.github), points:10})
    checks.push({label:"Target role specified", pass: !!f.targetRole, points:5})

    const score = checks.reduce((sum,c) => sum + (c.pass ? c.points : 0), 0)
    return {score, checks}
  }

  const livePreviewHTML = buildResumeHTML(form)
  const inlineATSScore = getInlineATSScore(form)

  const buildPlainTextResume = (f) => {
    const lines = []
    lines.push(f.name || "Your Name")
    lines.push([f.email, f.phone, f.location].filter(Boolean).join(" | "))
    if (f.linkedin) lines.push("LinkedIn: " + f.linkedin)
    if (f.github) lines.push("GitHub: " + f.github)
    if (f.targetRole) lines.push("\nTarget Role: " + f.targetRole)

    if (f.summary) {
      lines.push("\n" + "SUMMARY".padEnd(40,"-"))
      lines.push(f.summary)
    }
    if (f.education.some(e => e.degree)) {
      lines.push("\n" + "EDUCATION".padEnd(40,"-"))
      f.education.filter(e => e.degree).forEach(e => {
        lines.push(`${e.degree} — ${e.college} (${e.year})${e.cgpa ? " | CGPA: "+e.cgpa : ""}`)
      })
    }
    if (f.skills) {
      lines.push("\n" + "TECHNICAL SKILLS".padEnd(40,"-"))
      lines.push(f.skills)
    }
    if (f.experience.some(e => e.company)) {
      lines.push("\n" + "EXPERIENCE".padEnd(40,"-"))
      f.experience.filter(e => e.company).forEach(e => {
        lines.push(`${e.role} — ${e.company} (${e.duration})`)
        lines.push(e.description)
        lines.push("")
      })
    }
    if (f.projects.some(p => p.name)) {
      lines.push("PROJECTS".padEnd(40,"-"))
      f.projects.filter(p => p.name).forEach(p => {
        lines.push(`${p.name}${p.tech ? " | "+p.tech : ""}`)
        lines.push(p.description)
        lines.push("")
      })
    }
    if (f.certifications.length > 0) {
      lines.push("CERTIFICATIONS".padEnd(40,"-"))
      f.certifications.forEach(c => {
        lines.push(`${c.name || "Untitled"}${c.issuer ? " — "+c.issuer : ""}${c.issue_date ? " ("+c.issue_date+")" : ""}`)
      })
    }
    return lines.join("\n")
  }

  const downloadTXT = () => {
    const text = buildPlainTextResume(form)
    const blob = new Blob([text], {type:"text/plain"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = (form.name || "resume").replace(" ","_")+"_resume.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadResume = () => {
    const blob = new Blob([generatedResume], {type:"text/html"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = (form.name || "resume").replace(" ","_")+"_resume.html"
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = () => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(generatedResume)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
    }
  }

  const downloadDOCX = () => {
    const wordWrapped = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="UTF-8"></head>
<body>${generatedResume.replace(/<!DOCTYPE[^>]*>/i,"").replace(/<html>|<\/html>|<head>[\s\S]*?<\/head>/gi,"")}</body>
</html>`
    const blob = new Blob(['\ufeff', wordWrapped], {type:"application/msword"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = (form.name || "resume").replace(" ","_")+"_resume.doc"
    a.click()
    URL.revokeObjectURL(url)
  }

  const steps = ["Personal Info","Education & Skills","Experience & Projects","Preview & Download"]

  return (
    <Layout>
      <div style={{maxWidth: step===4 ? "800px" : "1200px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"8px"}}>
          <div>
            <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>📄 Resume Builder</h2>
            <p style={{color:"#8D6E63",fontSize:"14px"}}>Build a professional resume step by step and download it!</p>
          </div>
          {autosaveStatus && (
            <span className="animate-fadeIn" style={{color:"#16A34A",fontSize:"12px",fontWeight:"600"}}>✓ Draft saved</span>
          )}
        </div>

        {restoredDraft && (
          <div className="animate-fadeIn" style={{backgroundColor:"#F0E4D3",borderRadius:"10px",padding:"10px 16px",marginBottom:"16px",fontSize:"12px",color:"#5C4033"}}>
            📝 Restored your saved draft from last time.
          </div>
        )}

        {/* Step Indicator */}
        <div style={{display:"flex",gap:"0",marginBottom:"28px",backgroundColor:"#FFFDF9",borderRadius:"12px",padding:"6px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
          {steps.map((s,i) => (
            <div key={i} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:"8px",backgroundColor:step===i+1?"#5C4033":step>i+1?"#F0E4D3":"transparent",cursor:step>i+1?"pointer":"default",transition:"all 0.2s"}}
              onClick={() => step>i+1 && setStep(i+1)}>
              <p style={{color:step===i+1?"white":step>i+1?"#5C4033":"#8D6E63",fontSize:"11px",fontWeight:"600",margin:0}}>
                {step>i+1?"✓ ":""}{i+1}. {s}
              </p>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:"20px",alignItems:"flex-start"}}>
        <div style={{flex: step===4 ? "1" : "1 1 55%",minWidth:0}}>

        {/* Step 1 — Personal Info */}
        {step === 1 && (
          <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"28px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
            <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>👤 Personal Information</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              {[
                {label:"Full Name *",field:"name",placeholder:"e.g. Denesh Babu"},
                {label:"Target Role *",field:"targetRole",placeholder:"e.g. Software Developer Intern"},
                {label:"Email *",field:"email",placeholder:"your@email.com"},
                {label:"Phone",field:"phone",placeholder:"+91 98765 43210"},
                {label:"Location",field:"location",placeholder:"Chennai, Tamil Nadu"},
                {label:"LinkedIn",field:"linkedin",placeholder:"linkedin.com/in/yourname"},
              ].map((f,i) => (
                <div key={i} style={i===0||i===1?{gridColumn:"span 1"}:{}}>
                  <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>{f.label}</label>
                  <input type="text" value={form[f.field]} onChange={e => handleChange(f.field,e.target.value)} placeholder={f.placeholder}
                    style={{width:"100%",padding:"10px 14px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"13px",outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",marginBottom:"6px",display:"block"}}>GitHub</label>
                <div style={{display:"flex",gap:"6px"}}>
                  <input type="text" value={form.github} onChange={e => { handleChange("github",e.target.value); setGithubStats(null); setGithubError(false) }} placeholder="github.com/yourname"
                    style={{flex:1,padding:"10px 14px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"13px",outline:"none",boxSizing:"border-box",minWidth:0}}/>
                  <button
                    onClick={fetchGithubStats}
                    disabled={!form.github.trim() || githubLoading}
                    style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"0 14px",borderRadius:"8px",cursor:form.github.trim()?"pointer":"not-allowed",fontSize:"12px",fontWeight:"700",flexShrink:0}}
                  >
                    {githubLoading ? "..." : "Fetch"}
                  </button>
                </div>
                {githubError && <p style={{color:"#DC2626",fontSize:"11px",marginTop:"5px"}}>{githubError}</p>}
                {githubStats && (
                  <div className="animate-fadeIn" style={{marginTop:"8px",backgroundColor:"#FDF8F0",borderRadius:"8px",padding:"10px 12px",display:"flex",alignItems:"center",gap:"10px"}}>
                    <img src={githubStats.avatar_url} alt="" style={{width:"32px",height:"32px",borderRadius:"50%"}}/>
                    <div style={{flex:1}}>
                      <p style={{fontSize:"11px",color:"#5C4033",fontWeight:"700",margin:0}}>{githubStats.public_repos} repos · {githubStats.followers} followers</p>
                      <p style={{fontSize:"10px",color:"#8D6E63",margin:0}}>{githubStats.top_languages.slice(0,4).join(" · ") || "No language data"}</p>
                    </div>
                  </div>
                )}
              </div>
              <div style={{gridColumn:"span 2"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                  <label style={{fontSize:"12px",fontWeight:"600",color:"#6B5B4D",display:"block"}}>Professional Summary</label>
                  <button
                    onClick={generateSummary}
                    disabled={summaryLoading}
                    style={{background:"none",border:"none",color:"#C89B6D",fontSize:"11px",fontWeight:"700",cursor:"pointer",padding:0}}
                  >
                    {summaryLoading ? "✨ Generating..." : "✨ Generate with AI"}
                  </button>
                </div>
                <textarea value={form.summary} onChange={e => handleChange("summary",e.target.value)} placeholder="Write a 2-3 line summary about yourself, your skills and career goals..."
                  rows={3} style={{width:"100%",padding:"10px 14px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"13px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"'Segoe UI',sans-serif"}}/>
                {summaryError && <p style={{color:"#DC2626",fontSize:"11px",marginTop:"4px"}}>{summaryError}</p>}
              </div>
            </div>
            <button onClick={() => setStep(2)} style={{width:"100%",marginTop:"20px",backgroundColor:"#5C4033",color:"white",border:"none",padding:"13px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>
              Next: Education & Skills →
            </button>
          </div>
        )}

        {/* Step 2 — Education & Skills */}
        {step === 2 && (
          <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"28px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
            <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>🎓 Education & Skills</h3>

            {form.education.map((edu,i) => (
              <div key={i} style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
                <p style={{fontWeight:"600",color:"#5C4033",fontSize:"13px",marginBottom:"12px"}}>Education #{i+1}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
                  {[
                    {label:"Degree",field:"degree",placeholder:"B.Tech Computer Science"},
                    {label:"College/University",field:"college",placeholder:"Kumaraguru College of Technology"},
                    {label:"Year",field:"year",placeholder:"2021-2025"},
                    {label:"CGPA/%",field:"cgpa",placeholder:"8.5 CGPA"},
                  ].map((f,j) => (
                    <div key={j}>
                      <label style={{fontSize:"11px",fontWeight:"600",color:"#6B5B4D",marginBottom:"4px",display:"block"}}>{f.label}</label>
                      <input type="text" value={edu[f.field]} onChange={e => handleArrayChange("education",i,f.field,e.target.value)} placeholder={f.placeholder}
                        style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => addItem("education",{degree:"",college:"",year:"",cgpa:""})}
              style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px",marginBottom:"20px"}}>
              + Add Education
            </button>

            <div>
              <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>🛠️ Technical Skills (comma separated)</label>
              <textarea value={form.skills} onChange={e => handleChange("skills",e.target.value)}
                placeholder="Python, React, SQL, Machine Learning, Docker, Git, JavaScript, Node.js..."
                rows={3} style={{width:"100%",padding:"12px 14px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"13px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"'Segoe UI',sans-serif"}}/>
            </div>

            <div style={{display:"flex",gap:"10px",marginTop:"20px"}}>
              <button onClick={() => setStep(1)} style={{flex:1,backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}>← Back</button>
              <button onClick={() => setStep(3)} style={{flex:2,backgroundColor:"#5C4033",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>Next: Experience & Projects →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Experience & Projects */}
        {step === 3 && (
          <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"28px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
            <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>💼 Experience & Projects</h3>

            {form.experience.map((exp,i) => (
              <div key={i} style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
                <p style={{fontWeight:"600",color:"#5C4033",fontSize:"13px",marginBottom:"12px"}}>Experience #{i+1}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                  {[
                    {label:"Company Name",field:"company",placeholder:"TCS, Google, Startup..."},
                    {label:"Role",field:"role",placeholder:"Software Developer Intern"},
                    {label:"Duration",field:"duration",placeholder:"Jan 2024 - Jun 2024"},
                  ].map((f,j) => (
                    <div key={j}>
                      <label style={{fontSize:"11px",fontWeight:"600",color:"#6B5B4D",marginBottom:"4px",display:"block"}}>{f.label}</label>
                      <input type="text" value={exp[f.field]} onChange={e => handleArrayChange("experience",i,f.field,e.target.value)} placeholder={f.placeholder}
                        style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{fontSize:"11px",fontWeight:"600",color:"#6B5B4D",marginBottom:"4px",display:"block"}}>Description</label>
                  <SuggestionTextarea
                    value={exp.description}
                    onChange={val => handleArrayChange("experience",i,"description",val)}
                    fieldType="experience"
                    context={exp.role}
                    placeholder="Developed REST APIs using FastAPI that served 500+ users, improving response time by 40%..."
                  />
                </div>
              </div>
            ))}
            <button onClick={() => addItem("experience",{company:"",role:"",duration:"",description:""})}
              style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px",marginBottom:"20px"}}>
              + Add Experience
            </button>

            <h4 style={{fontWeight:"700",color:"#5C4033",fontSize:"14px",marginBottom:"12px"}}>🚀 Projects</h4>
            {form.projects.map((proj,i) => (
              <div key={i} style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
                <p style={{fontWeight:"600",color:"#5C4033",fontSize:"13px",marginBottom:"12px"}}>Project #{i+1}</p>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                  {[
                    {label:"Project Name",field:"name",placeholder:"InternSight - AI Career Platform"},
                    {label:"Tech Stack",field:"tech",placeholder:"React, FastAPI, PostgreSQL"},
                  ].map((f,j) => (
                    <div key={j}>
                      <label style={{fontSize:"11px",fontWeight:"600",color:"#6B5B4D",marginBottom:"4px",display:"block"}}>{f.label}</label>
                      <input type="text" value={proj[f.field]} onChange={e => handleArrayChange("projects",i,f.field,e.target.value)} placeholder={f.placeholder}
                        style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{fontSize:"11px",fontWeight:"600",color:"#6B5B4D",marginBottom:"4px",display:"block"}}>Description</label>
                  <SuggestionTextarea
                    value={proj.description}
                    onChange={val => handleArrayChange("projects",i,"description",val)}
                    fieldType="project"
                    context={proj.name}
                    placeholder="Built an AI-powered resume analyzer serving 1000+ students with 95% accuracy in skill detection..."
                  />
                </div>
              </div>
            ))}
            <button onClick={() => addItem("projects",{name:"",tech:"",description:""})}
              style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px",marginBottom:"20px"}}>
              + Add Project
            </button>

            <div style={{marginBottom:"20px"}}>
              <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>📜 Certifications</label>

              {form.certifications.map((cert,i) => (
                <div key={i} style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"16px",marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <p style={{fontWeight:"600",color:"#5C4033",fontSize:"13px",margin:0}}>Certificate #{i+1}</p>
                    <button onClick={() => removeItem("certifications",i)} style={{background:"none",border:"none",cursor:"pointer",color:"#DC2626",fontWeight:"700",fontSize:"13px"}}>✕ Remove</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                    {[
                      {label:"Certificate Name",field:"name",placeholder:"AWS Certified Cloud Practitioner"},
                      {label:"Issued By",field:"issuer",placeholder:"Amazon Web Services"},
                      {label:"Credential ID",field:"credential_id",placeholder:"ABC123XYZ"},
                      {label:"Issue Date",field:"issue_date",placeholder:"Jan 2026"},
                    ].map((f,j) => (
                      <div key={j}>
                        <label style={{fontSize:"11px",fontWeight:"600",color:"#6B5B4D",marginBottom:"4px",display:"block"}}>{f.label}</label>
                        <input type="text" value={cert[f.field]} onChange={e => handleArrayChange("certifications",i,f.field,e.target.value)} placeholder={f.placeholder}
                          style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{marginBottom:"10px"}}>
                    <label style={{fontSize:"11px",fontWeight:"600",color:"#6B5B4D",marginBottom:"4px",display:"block"}}>Verification URL</label>
                    <input type="text" value={cert.credential_url} onChange={e => handleArrayChange("certifications",i,"credential_url",e.target.value)} placeholder="credly.com/badges/..."
                      style={{width:"100%",padding:"9px 12px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"12px",outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  {cert.file ? (
                    <div style={{display:"flex",alignItems:"center",gap:"6px",backgroundColor:"#F0E4D3",borderRadius:"8px",padding:"6px 10px",width:"fit-content"}}>
                      <span style={{fontSize:"11px",color:"#5C4033",fontWeight:"600"}}>{cert.file.type.startsWith("image/") ? "🖼️" : "📄"} {cert.file.name}</span>
                      <button onClick={() => removeCertificateFile(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#DC2626",fontWeight:"700",fontSize:"12px",padding:0}}>✕</button>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById("certFile"+i).click()}
                      style={{border:"1.5px dashed #C89B6D",borderRadius:"8px",padding:"10px",textAlign:"center",cursor:"pointer",backgroundColor:"#FFFDF9"}}
                    >
                      <p style={{color:"#5C4033",fontSize:"11px",fontWeight:"600",margin:0}}>📎 Attach certificate file (optional, max 4MB)</p>
                      <input id={"certFile"+i} type="file" accept="image/*,.pdf" style={{display:"none"}}
                        onChange={e => { attachCertificateFile(i, e.target.files[0]); e.target.value = "" }}/>
                    </div>
                  )}
                </div>
              ))}
              </div>

              <button onClick={() => addItem("certifications",{name:"",issuer:"",credential_id:"",credential_url:"",issue_date:"",file:null})}
                style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px",marginBottom:"10px"}}>
                + Add Certificate
              </button>

              <div style={{backgroundColor:"#F0E4D3",borderRadius:"8px",padding:"10px 14px",marginBottom:"20px"}}>
                <p style={{color:"#5C4033",fontSize:"11px",margin:0,lineHeight:"1.6"}}>
                  💡 <strong>Tip:</strong> if your certificate is stored in DigiLocker, download it from there first — a DigiLocker-issued certificate carries more weight with recruiters than a photo of a printout.
                </p>
              </div>

            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => setStep(2)} style={{flex:1,backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}>← Back</button>
              <button onClick={generateResume} disabled={loading} style={{flex:2,backgroundColor:"#5C4033",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}>
                {loading ? "⏳ Building Your Resume..." : "✨ Generate Resume →"}
              </button>
            </div>
          </div>
        )}

        </div>

        {step !== 4 && (
          <div className="animate-fadeIn" style={{flex:"1 1 45%",position:"sticky",top:"20px",minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
              <p style={{color:"#8D6E63",fontSize:"11px",fontWeight:"700",letterSpacing:"0.5px",margin:0,textTransform:"uppercase"}}>Live Preview</p>
              <div style={{display:"flex",gap:"4px"}}>
                {[{key:"classic",label:"Classic"},{key:"modern",label:"Modern"},{key:"compact",label:"Compact"}].map(t => (
                  <button key={t.key} onClick={() => setTemplate(t.key)}
                    style={{padding:"4px 12px",borderRadius:"14px",border:"none",cursor:"pointer",fontSize:"10px",fontWeight:"700",backgroundColor:template===t.key?"#5C4033":"#F0E4D3",color:template===t.key?"white":"#5C4033"}}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{backgroundColor:"#FFFDF9",borderRadius:"10px",padding:"12px 14px",marginBottom:"10px",boxShadow:"0 2px 8px rgba(92,64,51,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                <span style={{fontSize:"11px",fontWeight:"700",color:"#5C4033"}}>Live ATS Readiness</span>
                <span style={{fontSize:"14px",fontWeight:"900",color:inlineATSScore.score>=70?"#22C55E":inlineATSScore.score>=40?"#F59E0B":"#EF4444"}}>{inlineATSScore.score}/100</span>
              </div>
              <div style={{backgroundColor:"#EFE4D3",borderRadius:"6px",height:"5px",overflow:"hidden",marginBottom:"8px"}}>
                <div style={{height:"100%",width:inlineATSScore.score+"%",backgroundColor:inlineATSScore.score>=70?"#22C55E":inlineATSScore.score>=40?"#F59E0B":"#EF4444",borderRadius:"6px",transition:"width 0.4s ease"}}/>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                {inlineATSScore.checks.filter(c => !c.pass).slice(0,3).map((c,i) => (
                  <span key={i} style={{fontSize:"9px",color:"#A08D7C",backgroundColor:"#FDF8F0",padding:"2px 8px",borderRadius:"10px"}}>+ {c.label}</span>
                ))}
              </div>
            </div>
            <div style={{border:"1px solid #E8D9C5",borderRadius:"12px",overflow:"hidden",height:"520px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <iframe srcDoc={livePreviewHTML} style={{width:"100%",height:"100%",border:"none"}} title="Live Resume Preview"/>
            </div>
          </div>
        )}
        </div>

        {/* Step 4 — Preview & Download */}
        {step === 4 && generatedResume && (
          <div>
            <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
                <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",margin:0}}>✅ Your Resume is Ready!</h3>
                <div style={{display:"flex",gap:"4px"}}>
                  {[{key:"classic",label:"Classic"},{key:"modern",label:"Modern"},{key:"compact",label:"Compact"}].map(t => (
                    <button key={t.key} onClick={() => {
                      setTemplate(t.key)
                      const builder = t.key === "modern" ? buildModernHTML : t.key === "compact" ? buildCompactHTML : buildClassicHTML
                      setGeneratedResume(builder(form))
                    }}
                      style={{padding:"5px 12px",borderRadius:"14px",border:"none",cursor:"pointer",fontSize:"10px",fontWeight:"700",backgroundColor:template===t.key?"#5C4033":"#F0E4D3",color:template===t.key?"white":"#5C4033"}}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{border:"1px solid #E8D9C5",borderRadius:"12px",overflow:"hidden",height:"400px"}}>
                <iframe srcDoc={generatedResume} style={{width:"100%",height:"100%",border:"none"}} title="Resume Preview"/>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"10px"}}>
                <button onClick={downloadPDF} className="btn btn-primary" style={{padding:"14px 6px",fontSize:"12px"}}>
                  📕 PDF
                </button>
                <button onClick={downloadDOCX} className="btn btn-primary" style={{padding:"14px 6px",fontSize:"12px"}}>
                  📘 DOCX
                </button>
                <button onClick={downloadTXT} className="btn btn-ghost" style={{padding:"14px 6px",fontSize:"12px"}}>
                  📝 TXT
                </button>
                <button onClick={downloadResume} className="btn btn-ghost" style={{padding:"14px 6px",fontSize:"12px"}}>
                  🌐 HTML
                </button>
              </div>
              <button onClick={() => setStep(3)} style={{width:"100%",backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"12px",borderRadius:"12px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}>
                ← Edit Resume
              </button>
              <div style={{backgroundColor:"#FEF3C7",borderRadius:"10px",padding:"12px 16px"}}>
                <p style={{color:"#B45309",fontSize:"13px",fontWeight:"600",margin:"0 0 4px"}}>💡 Pro Tip:</p>
                <p style={{color:"#6B5B4D",fontSize:"12px",margin:0}}>PDF opens your browser's print dialog — choose "Save as PDF" as the destination. DOCX opens directly in Microsoft Word or Google Docs.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ResumeBuilder