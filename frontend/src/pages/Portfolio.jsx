import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

const THEMES = {
  modern: {
    label:"Modern", bg:"#FAF3E8", card:"#FFFDF9", primary:"#5C4033", accent:"#C89B6D",
    text:"#4A3728", sub:"#8D6E63", heroGradient:"linear-gradient(135deg,#5C4033,#C89B6D)", font:"'Segoe UI',sans-serif"
  },
  minimal: {
    label:"Minimal", bg:"#FFFFFF", card:"#FAFAFA", primary:"#1A1A1A", accent:"#1A1A1A",
    text:"#2A2A2A", sub:"#767676", heroGradient:"#FFFFFF", font:"Georgia, serif"
  },
  developer: {
    label:"Developer", bg:"#0D1117", card:"#161B22", primary:"#58A6FF", accent:"#3FB950",
    text:"#C9D1D9", sub:"#8B949E", heroGradient:"linear-gradient(135deg,#0D1117,#161B22)", font:"'Courier New',monospace"
  }
}

function Portfolio() {
  const navigate = useNavigate()
  const resumeId = localStorage.getItem("resume_id")

  const [theme, setTheme] = useState("modern")
  const [form, setForm] = useState({
    name: localStorage.getItem("full_name") || "",
    tagline: "",
    about: "",
    email: "",
    location: "",
    linkedin: "",
    github: "",
    skills: "",
    projects: [{name:"", description:"", link:"", tech:""}]
  })
  const [githubStats, setGithubStats] = useState(null)
  const [githubLoading, setGithubLoading] = useState(false)
  const [githubError, setGithubError] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState(null)
  const [deployError, setDeployError] = useState(null)

  const handleChange = (field, value) => setForm(prev => ({...prev, [field]: value}))

  const handleProjectChange = (i, field, value) => {
    const arr = [...form.projects]
    arr[i] = {...arr[i], [field]: value}
    setForm(prev => ({...prev, projects: arr}))
  }

  const addProject = () => setForm(prev => ({...prev, projects:[...prev.projects, {name:"",description:"",link:"",tech:""}]}))
  const removeProject = (i) => setForm(prev => ({...prev, projects: prev.projects.filter((_,idx) => idx !== i)}))

  const fetchGithubStats = async () => {
    if (!form.github.trim()) return
    setGithubLoading(true)
    setGithubError(false)
    try {
      const res = await axios.get("http://127.0.0.1:8000/github/stats/" + encodeURIComponent(form.github.trim()))
      setGithubStats(res.data)
    } catch {
      setGithubError(true)
    }
    setGithubLoading(false)
  }

  const buildPortfolioHTML = () => {
    const t = THEMES[theme]
    const skillsList = form.skills.split(",").map(s => s.trim()).filter(Boolean)

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${form.name || "Portfolio"}</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:${t.font}; background:${t.bg}; color:${t.text}; line-height:1.7; }
.container { max-width:900px; margin:0 auto; padding:0 24px; }
.hero { background:${t.heroGradient}; padding:80px 0 60px; text-align:center; color:${theme==="minimal"?t.primary:"#fff"}; }
.hero h1 { font-size:42px; font-weight:800; margin-bottom:8px; }
.hero p { font-size:16px; opacity:0.85; max-width:500px; margin:0 auto; }
.section { padding:50px 0; border-bottom:1px solid ${theme==="developer"?"#30363D":"#E8D9C5"}; }
.section h2 { font-size:22px; font-weight:700; color:${t.primary}; margin-bottom:20px; }
.card { background:${t.card}; border-radius:14px; padding:22px; margin-bottom:16px; ${theme==="developer"?"border:1px solid #30363D;":""} }
.skill-chip { display:inline-block; background:${theme==="developer"?"#21262D":t.accent+"22"}; color:${t.accent}; padding:6px 14px; border-radius:20px; font-size:13px; font-weight:600; margin:4px 6px 4px 0; }
.project h3 { color:${t.primary}; font-size:17px; margin-bottom:6px; }
.project .tech { font-size:12px; color:${t.sub}; margin-top:8px; }
.project a { color:${t.accent}; text-decoration:none; font-size:13px; font-weight:600; }
.links { display:flex; gap:16px; justify-content:center; margin-top:20px; flex-wrap:wrap; }
.links a { color:${theme==="minimal"?t.primary:"#fff"}; text-decoration:underline; font-size:14px; }
.repo { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid ${theme==="developer"?"#30363D":"#EFE4D3"}; }
.repo a { color:${t.primary}; font-weight:600; text-decoration:none; }
footer { text-align:center; padding:30px; color:${t.sub}; font-size:12px; }
</style></head>
<body>
  <div class="hero">
    <h1>${form.name || "Your Name"}</h1>
    <p>${form.tagline || ""}</p>
    <div class="links">
      ${form.email ? `<a href="mailto:${form.email}">${form.email}</a>` : ""}
      ${form.linkedin ? `<a href="${form.linkedin.startsWith("http")?form.linkedin:"https://"+form.linkedin}" target="_blank">LinkedIn</a>` : ""}
      ${form.github ? `<a href="${form.github.startsWith("http")?form.github:"https://"+form.github}" target="_blank">GitHub</a>` : ""}
    </div>
  </div>

  <div class="container">
    ${form.about ? `
    <div class="section">
      <h2>About</h2>
      <p>${form.about}</p>
    </div>` : ""}

    ${skillsList.length > 0 ? `
    <div class="section">
      <h2>Skills</h2>
      <div>${skillsList.map(s => `<span class="skill-chip">${s}</span>`).join("")}</div>
    </div>` : ""}

    ${form.projects.some(p => p.name) ? `
    <div class="section">
      <h2>Projects</h2>
      ${form.projects.filter(p => p.name).map(p => `
        <div class="card project">
          <h3>${p.name}</h3>
          <p>${p.description}</p>
          ${p.tech ? `<div class="tech">${p.tech}</div>` : ""}
          ${p.link ? `<a href="${p.link.startsWith("http")?p.link:"https://"+p.link}" target="_blank">View Project →</a>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    ${githubStats ? `
    <div class="section">
      <h2>GitHub Activity</h2>
      <p style="margin-bottom:14px">${githubStats.public_repos} public repos · ${githubStats.followers} followers${githubStats.top_languages.length ? " · " + githubStats.top_languages.slice(0,5).join(", ") : ""}</p>
      ${githubStats.top_repos.map(r => `
        <div class="repo">
          <a href="${r.url}" target="_blank">${r.name}</a>
          <span style="font-size:12px;color:${t.sub}">${r.stars > 0 ? "★ "+r.stars : ""} ${r.language||""}</span>
        </div>
      `).join("")}
    </div>` : ""}

    ${resumeId ? `
    <div class="section" style="text-align:center;border-bottom:none">
      <a href="http://127.0.0.1:8000/resume/${resumeId}/download-original" target="_blank" style="display:inline-block;background:${t.primary};color:${theme==="minimal"?"#fff":t.bg};padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
        📄 Download Resume
      </a>
    </div>` : ""}
  </div>

  <footer>Built with InternSight</footer>
</body></html>`
  }

  const previewHTML = buildPortfolioHTML()

  const deployPortfolio = async () => {
    setDeploying(true)
    setDeployError(null)
    try {
      const res = await axios.post("http://127.0.0.1:8000/portfolio/deploy", {
        html: previewHTML,
        site_name: (form.name || "portfolio").toLowerCase().replace(/\s+/g,"-")
      })
      if (res.data.success) {
        setDeployedUrl(res.data.url)
      } else {
        setDeployError(res.data.message)
      }
    } catch {
      setDeployError("Couldn't reach the deployment service — please try again.")
    }
    setDeploying(false)
  }

  const downloadPortfolio = () => {
    const blob = new Blob([previewHTML], {type:"text/html"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = (form.name || "portfolio").replace(/\s+/g,"_") + "_portfolio.html"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div style={{maxWidth:"1300px",margin:"0 auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🌐 Portfolio Generator</h2>
            <p style={{color:"#8D6E63",fontSize:"14px"}}>Download it, or publish to a real live URL.</p>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            {deployedUrl && (
              <a href={deployedUrl} target="_blank" rel="noreferrer" style={{fontSize:"12px",color:"#16A34A",fontWeight:"700",textDecoration:"underline"}}>
                🔗 {deployedUrl.replace("https://","")}
              </a>
            )}
            <button onClick={deployPortfolio} disabled={deploying} className="btn btn-accent" style={{padding:"10px 20px",fontSize:"13px"}}>
              {deploying ? "Publishing..." : "🚀 Publish Live"}
            </button>
            <button onClick={downloadPortfolio} className="btn btn-primary" style={{padding:"10px 20px",fontSize:"13px"}}>
              📥 Download
            </button>
          </div>
        </div>

        {deployError && (
          <div className="animate-fadeIn" style={{backgroundColor:"#FEF3C7",borderRadius:"10px",padding:"12px 16px",marginBottom:"16px",fontSize:"12px",color:"#B45309"}}>
            {deployError}
          </div>
        )}

        <div style={{display:"flex",gap:"8px",marginBottom:"20px"}}>
          {Object.entries(THEMES).map(([key,t]) => (
            <button key={key} onClick={() => setTheme(key)}
              style={{padding:"8px 18px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"700",fontSize:"12px",backgroundColor:theme===key?"#5C4033":"#F0E4D3",color:theme===key?"white":"#5C4033"}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{display:"flex",gap:"20px",alignItems:"flex-start"}}>
          <div style={{flex:"1 1 45%",minWidth:0}}>
            <div style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"16px"}}>
              <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"14px"}}>Basic Info</h3>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                <input placeholder="Your Name" value={form.name} onChange={e=>handleChange("name",e.target.value)} style={inputStyle}/>
                <input placeholder="Email" value={form.email} onChange={e=>handleChange("email",e.target.value)} style={inputStyle}/>
              </div>
              <input placeholder="Tagline — e.g. Full Stack Developer & AI Enthusiast" value={form.tagline} onChange={e=>handleChange("tagline",e.target.value)} style={{...inputStyle,width:"100%",marginBottom:"10px",boxSizing:"border-box"}}/>
              <textarea placeholder="About you..." value={form.about} onChange={e=>handleChange("about",e.target.value)} rows={3} style={{...inputStyle,width:"100%",resize:"none",boxSizing:"border-box",marginBottom:"10px"}}/>
              <input placeholder="Skills, comma separated" value={form.skills} onChange={e=>handleChange("skills",e.target.value)} style={{...inputStyle,width:"100%",marginBottom:"10px",boxSizing:"border-box"}}/>
              <input placeholder="LinkedIn URL" value={form.linkedin} onChange={e=>handleChange("linkedin",e.target.value)} style={{...inputStyle,width:"100%",marginBottom:"10px",boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:"6px"}}>
                <input placeholder="GitHub username or URL" value={form.github} onChange={e=>{handleChange("github",e.target.value); setGithubStats(null)}} style={{...inputStyle,flex:1,boxSizing:"border-box"}}/>
                <button onClick={fetchGithubStats} disabled={!form.github.trim()||githubLoading} style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"0 14px",borderRadius:"8px",cursor:"pointer",fontSize:"12px",fontWeight:"700"}}>
                  {githubLoading ? "..." : "Fetch"}
                </button>
              </div>
              {githubError && <p style={{color:"#DC2626",fontSize:"11px",marginTop:"5px"}}>Couldn't fetch GitHub stats.</p>}
              {githubStats && <p style={{color:"#16A34A",fontSize:"11px",marginTop:"5px"}}>✓ {githubStats.public_repos} repos loaded</p>}
            </div>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"14px"}}>Projects</h3>
              {form.projects.map((p,i) => (
                <div key={i} style={{backgroundColor:"#FDF8F0",borderRadius:"10px",padding:"14px",marginBottom:"10px"}}>
                  <div style={{display:"flex",justifyContent:"flex-end",marginBottom:"4px"}}>
                    <button onClick={() => removeProject(i)} style={{background:"none",border:"none",color:"#DC2626",fontSize:"12px",cursor:"pointer"}}>✕ Remove</button>
                  </div>
                  <input placeholder="Project name" value={p.name} onChange={e=>handleProjectChange(i,"name",e.target.value)} style={{...inputStyle,width:"100%",marginBottom:"8px",boxSizing:"border-box"}}/>
                  <textarea placeholder="Description" value={p.description} onChange={e=>handleProjectChange(i,"description",e.target.value)} rows={2} style={{...inputStyle,width:"100%",resize:"none",boxSizing:"border-box",marginBottom:"8px"}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                    <input placeholder="Tech used" value={p.tech} onChange={e=>handleProjectChange(i,"tech",e.target.value)} style={inputStyle}/>
                    <input placeholder="Link" value={p.link} onChange={e=>handleProjectChange(i,"link",e.target.value)} style={inputStyle}/>
                  </div>
                </div>
              ))}
              <button onClick={addProject} style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 16px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}>
                + Add Project
              </button>
            </div>
          </div>

          <div style={{flex:"1 1 55%",position:"sticky",top:"20px",minWidth:0}}>
            <p style={{color:"#8D6E63",fontSize:"11px",fontWeight:"700",letterSpacing:"0.5px",marginBottom:"8px",textTransform:"uppercase"}}>Live Preview — {THEMES[theme].label}</p>
            <div style={{border:"1px solid #E8D9C5",borderRadius:"14px",overflow:"hidden",height:"640px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <iframe srcDoc={previewHTML} style={{width:"100%",height:"100%",border:"none"}} title="Portfolio Preview"/>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const inputStyle = {padding:"9px 12px",borderRadius:"8px",border:"1.5px solid #E8D9C5",fontSize:"13px",outline:"none"}

export default Portfolio