import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function ResumeVersions() {
  const navigate = useNavigate()
  const userId = localStorage.getItem("user_id")
  const activeResumeId = localStorage.getItem("resume_id")

  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editLabel, setEditLabel] = useState("")
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState([])
  const [compareSelection, setCompareSelection] = useState([])
  const [compareData, setCompareData] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  const getScoreColor = (s) => {
    if (s >= 80) return "#22C55E"
    if (s >= 60) return "#F59E0B"
    if (s >= 40) return "#F97316"
    return "#EF4444"
  }

  const toggleCompareSelect = (id) => {
    setCompareData(null)
    setCompareSelection(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const fetchVersionScore = async (id) => {
    const scoreRes = await axios.get("http://127.0.0.1:8000/resume/" + id + "/score")
    const flagRes = await axios.get("http://127.0.0.1:8000/resume/" + id + "/redflags")
    return {...scoreRes.data, health: flagRes.data.resume_health_score}
  }

  const runComparison = async () => {
    if (compareSelection.length !== 2) return
    setCompareLoading(true)
    try {
      const [a, b] = await Promise.all(compareSelection.map(fetchVersionScore))
      setCompareData({a, b})
    } catch {
      alert("Couldn't load scores for comparison — please try again.")
    }
    setCompareLoading(false)
  }

  const fetchVersions = () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    axios.get("http://127.0.0.1:8000/resume/user/" + userId + "/versions")
      .then(res => setVersions(res.data))
      .catch(() => setVersions([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVersions() }, [userId])

  const setActive = (id) => {
    localStorage.setItem("resume_id", id)
    window.location.reload()
  }

  const startRename = (v) => {
    setEditingId(v.id)
    setEditLabel(v.version_label || v.filename.replace(".pdf",""))
  }

  const saveRename = async (id) => {
    try {
      await axios.patch("http://127.0.0.1:8000/resume/" + id + "/label", null, {params:{version_label: editLabel}})
      setEditingId(null)
      fetchVersions()
    } catch {
      alert("Couldn't rename this version — please try again.")
    }
  }

  const deleteVersion = async (id) => {
    if (!confirm("Delete this resume version permanently? This can't be undone.")) return
    try {
      await axios.delete("http://127.0.0.1:8000/resume/" + id)
      if (String(id) === activeResumeId) localStorage.removeItem("resume_id")
      fetchVersions()
    } catch {
      alert("Couldn't delete this version — please try again.")
    }
  }

  const toggleCompareSelection = (id) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {day:"numeric", month:"short", year:"numeric"})
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px",flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>📁 Resume Versions</h2>
            <p style={{color:"#8D6E63",fontSize:"14px"}}>Keep a different resume for each role you're targeting — one active at a time.</p>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            {versions.length >= 2 && (
              <button
                onClick={() => { setCompareMode(!compareMode); setSelectedForCompare([]) }}
                className="btn btn-ghost"
                style={{padding:"10px 20px",fontSize:"13px"}}
              >
                {compareMode ? "Cancel Compare" : "⚖️ Compare Versions"}
              </button>
            )}
            <button onClick={() => navigate("/upload")} className="btn btn-primary" style={{padding:"10px 20px",fontSize:"13px"}}>
              + Upload New Version
            </button>
          </div>
        </div>

        {compareMode && (
          <div className="animate-fadeIn" style={{backgroundColor:"#F0E4D3",borderRadius:"12px",padding:"14px 18px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"10px"}}>
            <p style={{color:"#5C4033",fontSize:"13px",margin:0,fontWeight:"600"}}>
              Select 2 versions to compare ({selectedForCompare.length}/2 selected)
            </p>
            <button
              onClick={() => navigate("/resume-versions/compare/" + selectedForCompare[0] + "/" + selectedForCompare[1])}
              disabled={selectedForCompare.length !== 2}
              className="btn btn-primary"
              style={{padding:"8px 18px",fontSize:"12px",opacity:selectedForCompare.length===2?1:0.5,cursor:selectedForCompare.length===2?"pointer":"not-allowed"}}
            >
              Compare Selected →
            </button>
          </div>
        )}

        {!userId && (
          <div style={{backgroundColor:"#FEF3C7",borderRadius:"14px",padding:"16px 20px",color:"#B45309",fontSize:"13px"}}>
            Log in again to manage your resume versions.
          </div>
        )}

        {loading && userId && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{height:"90px",borderRadius:"14px"}}/>)}
          </div>
        )}

        {!loading && userId && versions.length === 0 && (
          <div style={{textAlign:"center",padding:"48px",color:"#8D6E63"}}>
            <div style={{fontSize:"48px",marginBottom:"12px"}}>📁</div>
            <p style={{fontSize:"16px",fontWeight:"600",color:"#5C4033"}}>No resume versions yet</p>
            <p style={{fontSize:"13px"}}>Upload your first resume to get started</p>
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {versions.map((v,i) => {
            const isActive = String(v.id) === activeResumeId
            return (
              <div
                key={v.id}
                className={`card-hover animate-fadeUp stagger-${(i%6)+1}`}
                style={{
                  backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"18px 22px",
                  boxShadow: isActive ? "0 4px 20px rgba(92,64,51,0.15)" : "0 2px 12px rgba(92,64,51,0.08)",
                  border: isActive ? "2px solid #C89B6D" : "1px solid #EFE4D3",
                  display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"12px"
                }}
              >
                {compareMode && (
                  <input
                    type="checkbox"
                    checked={selectedForCompare.includes(v.id)}
                    onChange={() => toggleCompareSelection(v.id)}
                    style={{width:"18px",height:"18px",accentColor:"#5C4033",flexShrink:0,cursor:"pointer"}}
                  />
                )}
                <div style={{flex:1,minWidth:"200px"}}>
                  {editingId === v.id ? (
                    <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
                      <input
                        type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)}
                        autoFocus
                        style={{padding:"6px 10px",borderRadius:"6px",border:"1px solid #C89B6D",fontSize:"13px",outline:"none"}}
                      />
                      <button onClick={() => saveRename(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#16A34A",fontWeight:"700",fontSize:"13px"}}>✓ Save</button>
                      <button onClick={() => setEditingId(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#8D6E63",fontSize:"13px"}}>✕</button>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
                      <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>
                        {v.version_label || v.filename.replace(".pdf","")}
                      </h3>
                      {isActive && (
                        <span style={{backgroundColor:"#C89B6D",color:"white",padding:"2px 10px",borderRadius:"20px",fontSize:"10px",fontWeight:"700"}}>ACTIVE</span>
                      )}
                      <span onClick={() => startRename(v)} style={{color:"#A08D7C",fontSize:"11px",cursor:"pointer",textDecoration:"underline"}}>rename</span>
                    </div>
                  )}
                  <p style={{color:"#8D6E63",fontSize:"12px",margin:"4px 0 0"}}>{v.filename} · Uploaded {formatDate(v.created_at)}</p>
                </div>
                <div style={{display:"flex",gap:"8px",flexShrink:0}}>
                  {!isActive && (
                    <button onClick={() => setActive(v.id)} className="btn btn-primary" style={{padding:"8px 16px",fontSize:"12px"}}>
                      Set Active
                    </button>
                  )}
                  <button onClick={() => navigate("/results/" + v.id)} className="btn btn-ghost" style={{padding:"8px 16px",fontSize:"12px"}}>
                    View Score
                  </button>
                  <button onClick={() => deleteVersion(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#DC2626",fontSize:"16px",padding:"4px"}}>
                    🗑️
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

export default ResumeVersions