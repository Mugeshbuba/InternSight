import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function Recruiter() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [previewResume, setPreviewResume] = useState(null)
  const [previewText, setPreviewText] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files).filter(f => f.name.endsWith(".pdf"))
    if (files.length === 0) return
    setLoading(true)
    const uploaded = []
    for (const file of files) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        const res = await axios.post(
          "http://127.0.0.1:8000/resume/upload?user_id=1",
          formData,
          {headers:{"Content-Type":"multipart/form-data"}}
        )
        uploaded.push({name:file.name, id:res.data.resume_id, status:"uploaded"})
      } catch {
        uploaded.push({name:file.name, id:null, status:"failed"})
      }
    }
    setResumes(uploaded)
    setLoading(false)
    analyzeAll(uploaded)
  }

  const analyzeAll = async (uploaded) => {
    setAnalyzing(true)
    const results = []
    for (const resume of uploaded) {
      if (!resume.id) { results.push({...resume, score:null}); continue }
      try {
        const [scoreRes, flagsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/resume/"+resume.id+"/score"),
          axios.get("http://127.0.0.1:8000/resume/"+resume.id+"/redflags")
        ])
        results.push({
          ...resume,
          score:scoreRes.data.total_score,
          grade: typeof scoreRes.data.grade === "string" ? scoreRes.data.grade : "",
          health:flagsRes.data.resume_health_score,
          flags:flagsRes.data.total_flags,
          recommendations:scoreRes.data.recommendations
        })
      } catch {
        results.push({...resume, score:null})
      }
    }
    results.sort((a,b) => (b.score||0)-(a.score||0))
    setResumes(results)
    setAnalyzing(false)
  }

  const openPreview = async (resume) => {
    setPreviewResume(resume)
    setPreviewText("")
    if (!resume.id) return
    setPreviewLoading(true)
    try {
      const res = await axios.get("http://127.0.0.1:8000/resume/"+resume.id)
      setPreviewText(res.data?.raw_text || "No extracted text available.")
    } catch {
      setPreviewText("Could not load resume preview.")
    }
    setPreviewLoading(false)
  }

  const getScoreColor = (s) => {
    if (!s) return "#8D6E63"
    if (s >= 80) return "#22C55E"
    if (s >= 60) return "#F59E0B"
    if (s >= 40) return "#F97316"
    return "#EF4444"
  }

  const getVerdict = (s) => {
    if (!s) return {text:"Failed", color:"#8D6E63", bg:"#EFE4D3"}
    if (s >= 75) return {text:"✅ Shortlist", color:"#16A34A", bg:"#DCFCE7"}
    if (s >= 55) return {text:"⚠️ Review", color:"#B45309", bg:"#FEF3C7"}
    return {text:"❌ Reject", color:"#DC2626", bg:"#FEE2E2"}
  }

  const filteredResumes = resumes.filter(r => {
    const matchesSearch = (r.name || "").toLowerCase().includes(search.toLowerCase())
    const verdict = getVerdict(r.score).text
    const matchesFilter = filter === "All"
      || (filter === "Shortlist" && verdict.includes("Shortlist"))
      || (filter === "Review" && verdict.includes("Review"))
      || (filter === "Reject" && verdict.includes("Reject"))
    return matchesSearch && matchesFilter
  })

  const avgScore = resumes.length ? Math.round(resumes.reduce((sum,r) => sum + (r.score||0), 0) / resumes.length) : 0

  return (
    <Layout>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>👔 Recruiter Dashboard</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Upload multiple resumes and instantly rank candidates by ATS score</p>
        </div>

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"32px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"24px",textAlign:"center"}}>
          <div
            onClick={() => document.getElementById("multiUpload").click()}
            style={{border:"2px dashed #C89B6D",borderRadius:"14px",padding:"40px",cursor:"pointer",backgroundColor:"#FDF8F0"}}
          >
            <div style={{fontSize:"40px",marginBottom:"12px"}}>📁</div>
            <p style={{color:"#5C4033",fontWeight:"700",fontSize:"16px",marginBottom:"6px"}}>Click to upload multiple resumes</p>
            <p style={{color:"#B3A292",fontSize:"13px",margin:0}}>Select multiple PDF files · All analyzed automatically</p>
            <input id="multiUpload" type="file" accept=".pdf" multiple style={{display:"none"}} onChange={handleFiles}/>
          </div>
          {loading && <p style={{color:"#5C4033",fontWeight:"600",marginTop:"14px",fontSize:"14px"}}>⏳ Uploading resumes...</p>}
          {analyzing && <p style={{color:"#C89B6D",fontWeight:"600",marginTop:"14px",fontSize:"14px"}}>🔍 Analyzing all resumes... please wait</p>}
        </div>

        {resumes.length > 0 && !analyzing && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:"14px",marginBottom:"20px"}}>
              {[
                {label:"Total", value:resumes.length, color:"#5C4033"},
                {label:"Avg Score", value:avgScore, color:"#C89B6D"},
                {label:"Shortlisted", value:resumes.filter(r=>r.score>=75).length, color:"#22C55E"},
                {label:"Review", value:resumes.filter(r=>r.score>=55&&r.score<75).length, color:"#F59E0B"},
                {label:"Rejected", value:resumes.filter(r=>!r.score||r.score<55).length, color:"#EF4444"}
              ].map((stat,i) => (
                <div key={i} style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"18px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",textAlign:"center"}}>
                  <p style={{fontSize:"28px",fontWeight:"800",color:stat.color,margin:"0 0 4px"}}>{stat.value}</p>
                  <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>{stat.label}</p>
                </div>
              ))}
            </div>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
              <p style={{color:"#5C4033",fontWeight:"700",fontSize:"13px",marginBottom:"14px"}}>📊 Score Distribution</p>
              <div style={{display:"flex",alignItems:"flex-end",gap:"6px",height:"90px"}}>
                {resumes.slice().sort((a,b)=>(b.score||0)-(a.score||0)).map((r,i) => (
                  <div key={i} title={r.name+": "+(r.score||0)} style={{flex:1,backgroundColor:getScoreColor(r.score),borderRadius:"4px 4px 0 0",height:((r.score||2)/100*90)+"px",minWidth:"6px",transition:"height 1s ease"}}/>
                ))}
              </div>
            </div>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",flexWrap:"wrap",gap:"10px"}}>
                <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",margin:0}}>Candidate Rankings</h3>
                <span style={{backgroundColor:"#F0E4D3",color:"#5C4033",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>Sorted by Score</span>
              </div>

              <div style={{display:"flex",gap:"10px",marginBottom:"18px",flexWrap:"wrap",alignItems:"center"}}>
                <input
                  type="text"
                  placeholder="🔍 Search by candidate name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{flex:"1 1 200px",padding:"9px 14px",borderRadius:"8px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",boxSizing:"border-box"}}
                />
                <div style={{display:"flex",gap:"6px"}}>
                  {["All","Shortlist","Review","Reject"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{padding:"7px 14px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"12px",backgroundColor:filter===f?"#5C4033":"#F0E4D3",color:filter===f?"white":"#5C4033"}}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {filteredResumes.length === 0 && (
                  <p style={{textAlign:"center",color:"#8D6E63",fontSize:"13px",padding:"20px"}}>No candidates match your search/filter.</p>
                )}
                {filteredResumes.map((resume, index) => {
                  const verdict = getVerdict(resume.score)
                  return (
                    <div key={index} className="card-hover" onClick={() => openPreview(resume)} style={{display:"flex",alignItems:"center",gap:"14px",backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"14px 18px",border:"1px solid #EFE4D3",cursor:"pointer"}}>
                      <div style={{width:"34px",height:"34px",borderRadius:"50%",backgroundColor:index===0?"#FEF3C7":index===1?"#EFE4D3":"#FDF8F0",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"15px",flexShrink:0}}>
                        {index===0?"🥇":index===1?"🥈":index===2?"🥉":"#"+(index+1)}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:"700",color:"#5C4033",margin:"0 0 2px",fontSize:"14px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {resume.name.replace(".pdf","")}
                        </p>
                        <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>{resume.flags} issues · {resume.grade}</p>
                      </div>
                      <div style={{width:"140px",flexShrink:0}}>
                        <div style={{backgroundColor:"#E8D9C5",borderRadius:"4px",height:"7px",overflow:"hidden"}}>
                          <div style={{height:"100%",width:(resume.score||0)+"%",backgroundColor:getScoreColor(resume.score),borderRadius:"4px"}}/>
                        </div>
                      </div>
                      <div style={{textAlign:"center",width:"52px",flexShrink:0}}>
                        <p style={{fontSize:"20px",fontWeight:"800",color:getScoreColor(resume.score),margin:"0 0 2px"}}>{resume.score||"–"}</p>
                        <p style={{color:"#8D6E63",fontSize:"10px",margin:0}}>/ 100</p>
                      </div>
                      <div style={{backgroundColor:verdict.bg,color:verdict.color,padding:"5px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"700",flexShrink:0}}>
                        {verdict.text}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{marginTop:"20px",backgroundColor:"#F5EDE0",borderRadius:"10px",padding:"14px 18px"}}>
                <p style={{color:"#5C4033",fontWeight:"600",fontSize:"13px",margin:"0 0 4px"}}>📊 Summary</p>
                <p style={{color:"#6B5B4D",fontSize:"12px",margin:0}}>
                  Out of {resumes.length} candidates — {resumes.filter(r=>r.score>=75).length} recommended for shortlisting,
                  {" "}{resumes.filter(r=>r.score>=55&&r.score<75).length} need review,
                  {" "}{resumes.filter(r=>!r.score||r.score<55).length} do not meet criteria.
                </p>
              </div>
            </div>
          </>
        )}

        {resumes.length === 0 && !loading && (
          <div style={{textAlign:"center",padding:"48px",color:"#8D6E63"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>📋</div>
            <p style={{fontSize:"16px",fontWeight:"600",color:"#5C4033"}}>No resumes uploaded yet</p>
            <p style={{fontSize:"13px"}}>Upload multiple PDF resumes above to start ranking candidates</p>
          </div>
        )}

        {previewResume && (
          <div onClick={() => setPreviewResume(null)} style={{position:"fixed",inset:0,backgroundColor:"rgba(74,55,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"20px"}}>
            <div onClick={e => e.stopPropagation()} className="animate-scaleIn" style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"28px",maxWidth:"600px",width:"100%",maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"16px"}}>
                <div>
                  <h3 style={{fontSize:"17px",fontWeight:"700",color:"#5C4033",margin:"0 0 4px"}}>{previewResume.name.replace(".pdf","")}</h3>
                  <p style={{color:"#8D6E63",fontSize:"12px",margin:0}}>Score: {previewResume.score ?? "–"}/100 · {previewResume.flags ?? 0} issues</p>
                </div>
                <button onClick={() => setPreviewResume(null)} style={{background:"none",border:"none",fontSize:"20px",cursor:"pointer",color:"#8D6E63"}}>✕</button>
              </div>
              <div style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"20px",overflowY:"auto",flex:1}}>
                {previewLoading ? (
                  <p style={{color:"#8D6E63",fontSize:"13px"}}>Loading resume text...</p>
                ) : (
                  <p style={{color:"#4A3728",fontSize:"13px",lineHeight:"1.8",whiteSpace:"pre-line",margin:0}}>{previewText}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Recruiter