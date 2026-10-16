import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../assets/logo.jpeg"

function Upload() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedMode, setSelectedMode] = useState(null)
  const [showRocket, setShowRocket] = useState(false)
  const [rocketPos, setRocketPos] = useState({x:0, y:0})
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [extractedPreview, setExtractedPreview] = useState(null)
  const fullName = localStorage.getItem("full_name") || "Student"

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }
  }, [previewUrl])

  const applyFile = (f) => {
    if (!f) return
    if (!f.name.endsWith(".pdf")) { setError("Only PDF files allowed"); return }
    setError("")
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) applyFile(dropped)
  }

  const modes = [
    {
      id:"student", icon:"🎓", title:"Resume Analysis",
      desc:"Get ATS score, job matches, salary insights and full career analysis",
      color:"#F0E4D3", border:"#C89B6D", textColor:"#5C4033",
      features:["ATS Score","Job Matching","Salary Intelligence","Red Flag Detection","Score Predictor"]
    },
    {
      id:"interview", icon:"🎤", title:"Interview Prep",
      desc:"Practice with MNC companies, mock interviews and aptitude tests",
      color:"#F5EDE0", border:"#7A5233", textColor:"#5C4033",
      features:["10 MNC Companies","Technical Questions","Mock Interview","Aptitude Test","Career Path"]
    },
    {
      id:"recruiter", icon:"👔", title:"Recruiter Mode",
      desc:"Batch upload and rank multiple candidates automatically",
      color:"#FBEDD3", border:"#B45309", textColor:"#5C4033",
      features:["Batch Upload","Auto Ranking","Candidate Comparison","Shortlist Report","Analytics"]
    }
  ]

  const handleUpload = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    if (!selectedMode) { setError("Please select a mode first"); return }
    if (!file) { setError("Please select a PDF file"); return }
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files allowed"); return }

    setLoading(true)
    setError("")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const loggedInUserId = localStorage.getItem("user_id") || 1
      const res = await axios.post(
        "http://127.0.0.1:8000/resume/upload?user_id=" + loggedInUserId,
        formData,
        {
          headers:{"Content-Type":"multipart/form-data"},
          onUploadProgress: (evt) => {
            if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100))
          }
        }
      )
      localStorage.setItem("resume_id", res.data.resume_id)
      localStorage.setItem("mode", selectedMode)

      try {
        const detail = await axios.get("http://127.0.0.1:8000/resume/" + res.data.resume_id)
        const raw = detail.data?.raw_text || ""
        if (raw) setExtractedPreview(raw.slice(0, 160))
      } catch { /* preview is a nice-to-have, safe to skip on failure */ }

      setRocketPos({x: rect.left + rect.width/2, y: rect.top + rect.height/2})
      setShowRocket(true)

      setTimeout(() => {
        if (selectedMode === "recruiter") navigate("/recruiter")
        else if (selectedMode === "interview") navigate("/interview/"+res.data.resume_id)
        else navigate("/dashboard")
      }, 1600)
    } catch (err) {
      setError("Upload failed. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#FAF3E8",fontFamily:"'Segoe UI',sans-serif"}}>

      {showRocket && (
        <div
          className="rocket-fly"
          style={{left: rocketPos.x, top: rocketPos.y}}
        >
          🚀
        </div>
      )}

      <nav style={{backgroundColor:"#FFFDF9",padding:"12px 40px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 4px rgba(92,64,51,0.08)"}}>
        <img src={logo} alt="InternSight" style={{height:"44px",objectFit:"contain"}}/>
        <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <span style={{color:"#5C4033",fontWeight:"600",fontSize:"14px"}}>👋 Hello, {fullName}!</span>
          <button onClick={() => { localStorage.clear(); navigate("/") }} style={{color:"#8D6E63",background:"none",border:"1px solid #E8D9C5",padding:"7px 14px",borderRadius:"8px",cursor:"pointer",fontSize:"13px"}}>Logout</button>
        </div>
      </nav>

      <div style={{maxWidth:"960px",margin:"0 auto",padding:"48px 20px"}}>

        <div style={{textAlign:"center",marginBottom:"48px"}} className="animate-fadeUp">
          <div style={{fontSize:"48px",marginBottom:"16px"}} className="animate-float">🎯</div>
          <h2 style={{fontSize:"36px",fontWeight:"800",color:"#5C4033",marginBottom:"10px"}}>
            What do you want to do today?
          </h2>
          <p style={{color:"#8D6E63",fontSize:"16px"}}>Select a mode to get started with your career journey</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"20px",marginBottom:"40px"}}>
          {modes.map((mode, idx) => (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`card card-clickable animate-fadeUp stagger-${idx+1}`}
              style={{
                padding:"28px",
                border: selectedMode === mode.id ? "2px solid "+mode.border : "2px solid transparent",
                transform: selectedMode === mode.id ? "translateY(-6px)" : "none",
                boxShadow: selectedMode === mode.id ? "0 16px 48px rgba(92,64,51,0.14)" : "0 4px 24px rgba(92,64,51,0.08)"
              }}
            >
              <div style={{backgroundColor:mode.color,width:"56px",height:"56px",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"28px",marginBottom:"16px"}}>
                {mode.icon}
              </div>
              <h3 style={{fontSize:"18px",fontWeight:"700",color:mode.textColor,marginBottom:"8px"}}>{mode.title}</h3>
              <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"16px",lineHeight:"1.6"}}>{mode.desc}</p>
              <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
                {mode.features.map((f,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <span style={{color:mode.border,fontSize:"12px",fontWeight:"700"}}>✓</span>
                    <span style={{color:"#6B5B4D",fontSize:"12px"}}>{f}</span>
                  </div>
                ))}
              </div>
              {selectedMode === mode.id && (
                <div style={{marginTop:"14px",backgroundColor:mode.color,borderRadius:"8px",padding:"6px",textAlign:"center"}} className="animate-scaleIn">
                  <span style={{color:mode.border,fontWeight:"700",fontSize:"12px"}}>✅ Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedMode && selectedMode !== "recruiter" && (
          <div className="card animate-fadeUp" style={{padding:"36px"}}>
            <h3 style={{fontSize:"18px",fontWeight:"700",color:"#5C4033",marginBottom:"20px"}}>📄 Upload Your Resume</h3>
            <div
              onClick={() => document.getElementById("fileInput").click()}
              onDragOver={e => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              style={{
                border:"2px dashed "+(dragActive?"#5C4033":file?"#5C4033":"#C89B6D"),
                borderRadius:"14px",
                padding: file ? "24px 40px" : "48px 40px",
                textAlign:"center",
                cursor:"pointer",
                backgroundColor: dragActive ? "#F0E4D3" : file ? "#F0E4D3" : "#FDF8F0",
                transition:"all 0.2s ease",
                marginBottom:"20px"
              }}
            >
              {file && previewUrl ? (
                <div style={{display:"flex",gap:"16px",alignItems:"center",textAlign:"left"}}>
                  <div style={{width:"56px",height:"72px",flexShrink:0,borderRadius:"6px",overflow:"hidden",boxShadow:"0 2px 10px rgba(92,64,51,0.15)",backgroundColor:"white"}}>
                    <embed src={previewUrl} type="application/pdf" style={{width:"100%",height:"100%",pointerEvents:"none"}}/>
                  </div>
                  <div>
                    <p style={{color:"#5C4033",fontWeight:"700",fontSize:"15px",marginBottom:"2px"}}>✅ {file.name}</p>
                    <p style={{color:"#8D6E63",fontSize:"12px"}}>{(file.size/1024).toFixed(1)} KB · PDF ready to analyze</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{fontSize:"44px",marginBottom:"12px"}} className="animate-float">📄</div>
                  <p style={{color:"#5C4033",fontWeight:"700",fontSize:"16px",marginBottom:"6px"}}>
                    {dragActive ? "Drop your resume here" : "Click or drag your resume here"}
                  </p>
                  <p style={{color:"#B3A292",fontSize:"13px"}}>PDF files only · Max 10MB</p>
                </div>
              )}
              <input id="fileInput" type="file" accept=".pdf" style={{display:"none"}} onChange={e => applyFile(e.target.files[0])}/>
            </div>

            {loading && (
              <div className="animate-fadeIn" style={{marginBottom:"16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}>
                  <span style={{color:"#8D6E63",fontSize:"12px"}}>Uploading resume...</span>
                  <span style={{color:"#5C4033",fontSize:"12px",fontWeight:"700"}}>{uploadProgress}%</span>
                </div>
                <div style={{backgroundColor:"#EFE4D3",borderRadius:"8px",height:"8px",overflow:"hidden"}}>
                  <div style={{height:"100%",width:uploadProgress+"%",backgroundColor:"#C89B6D",borderRadius:"8px",transition:"width 0.2s ease"}}/>
                </div>
              </div>
            )}

            {extractedPreview && (
              <div className="animate-scaleIn" style={{backgroundColor:"#DCFCE7",borderRadius:"10px",padding:"14px 16px",marginBottom:"16px"}}>
                <p style={{color:"#16A34A",fontWeight:"700",fontSize:"12px",marginBottom:"4px"}}>✅ Text extracted successfully</p>
                <p style={{color:"#166534",fontSize:"12px",lineHeight:"1.6",fontStyle:"italic"}}>"{extractedPreview}..."</p>
              </div>
            )}

            {error && (
              <div style={{backgroundColor:"#FEE2E2",color:"#DC2626",padding:"12px 16px",borderRadius:"8px",marginBottom:"16px",fontSize:"13px"}} className="animate-scaleIn">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`btn ${file ? "btn-primary" : ""}`}
              style={{width:"100%",padding:"16px",fontSize:"16px",fontWeight:"700",backgroundColor:file?"#5C4033":"#ccc",color:"white",border:"none",borderRadius:"12px",cursor:file?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"}}
            >
              {loading ? (
                <>
                  <span className="animate-spin" style={{fontSize:"18px"}}>⏳</span>
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Launch Analysis!
                </>
              )}
            </button>
          </div>
        )}

        {selectedMode === "recruiter" && (
          <div className="card animate-fadeUp" style={{padding:"36px",textAlign:"center"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}} className="animate-float">👔</div>
            <h3 style={{fontSize:"20px",fontWeight:"700",color:"#5C4033",marginBottom:"10px"}}>Recruiter Mode</h3>
            <p style={{color:"#8D6E63",marginBottom:"24px",fontSize:"14px"}}>Upload multiple resumes directly in the Recruiter Dashboard</p>
            <button onClick={() => navigate("/recruiter")} className="btn btn-primary" style={{padding:"13px 36px",fontSize:"15px"}}>
              Go to Recruiter Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Upload