import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function TimeMachine() {
  const navigate = useNavigate()
  const [oldFile, setOldFile] = useState(null)
  const [newFile, setNewFile] = useState(null)
  const [oldScore, setOldScore] = useState(null)
  const [newScore, setNewScore] = useState(null)
  const [loading, setLoading] = useState(false)

  const uploadAndScore = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    const res = await axios.post(
      "http://127.0.0.1:8000/resume/upload?user_id=1",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    )
    const scoreRes = await axios.get(
      "http://127.0.0.1:8000/resume/" + res.data.resume_id + "/score"
    )
    const flagRes = await axios.get(
      "http://127.0.0.1:8000/resume/" + res.data.resume_id + "/redflags"
    )
    return { ...scoreRes.data, health: flagRes.data.resume_health_score, flags: flagRes.data.total_flags }
  }

  const handleCompare = async () => {
    if (!oldFile || !newFile) return
    setLoading(true)
    try {
      const [old, newS] = await Promise.all([
        uploadAndScore(oldFile),
        uploadAndScore(newFile)
      ])
      setOldScore(old)
      setNewScore(newS)
    } catch (err) {
      console.error("Failed")
    }
    setLoading(false)
  }

  const getScoreColor = (s) => {
    if (s >= 80) return "#22C55E"
    if (s >= 60) return "#F59E0B"
    if (s >= 40) return "#F97316"
    return "#EF4444"
  }

  const improvement = newScore && oldScore ? (newScore.total_score - oldScore.total_score).toFixed(1) : null

  return (
    <Layout>
      <div style={{maxWidth:"900px",margin:"0 auto"}}>

        <div style={{marginBottom:"32px"}}>
          <h2 style={{fontSize:"28px",fontWeight:"800",color:"#5C4033",marginBottom:"8px"}}>
            🕐 Resume Time Machine
          </h2>
          <p style={{color:"#8D6E63",fontSize:"15px"}}>
            Upload your old and new resume to see exactly how much you have improved!
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"24px"}}>
          {[
            {label:"Old Resume", file:oldFile, setFile:setOldFile, color:"#FEE2E2", border:"#EF4444", icon:"📄"},
            {label:"New Resume", file:newFile, setFile:setNewFile, color:"#DCFCE7", border:"#22C55E", icon:"📄"}
          ].map((item, i) => (
            <div key={i} className={`card-hover animate-fadeUp stagger-${i+1}`} style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>{item.label}</h3>
              <div
                onClick={() => document.getElementById("file" + i).click()}
                style={{border:"2px dashed "+item.border,borderRadius:"12px",padding:"32px",textAlign:"center",cursor:"pointer",backgroundColor:item.file ? item.color : "#FDF8F0"}}
              >
                <div style={{fontSize:"36px",marginBottom:"8px"}}>{item.file ? "✅" : item.icon}</div>
                {item.file ? (
                  <p style={{color:"#4A3728",fontWeight:"600",fontSize:"14px",margin:0}}>{item.file.name}</p>
                ) : (
                  <p style={{color:"#B3A292",fontSize:"13px",margin:0}}>Click to upload PDF</p>
                )}
                <input id={"file"+i} type="file" accept=".pdf" style={{display:"none"}} onChange={e => item.setFile(e.target.files[0])}/>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !oldFile || !newFile}
          style={{width:"100%",backgroundColor: oldFile && newFile ? "#5C4033" : "#ccc",color:"white",border:"none",padding:"16px",borderRadius:"12px",fontSize:"16px",fontWeight:"700",cursor: oldFile && newFile ? "pointer" : "not-allowed",marginBottom:"24px"}}
        >
          {loading ? "⏳ Comparing resumes..." : "🔍 Compare My Resumes"}
        </button>

        {oldScore && newScore && (
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>

            {/* Improvement Banner */}
            <div className="animate-fadeUp" style={{
              background: parseFloat(improvement) > 0
                ? "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)"
                : parseFloat(improvement) < 0
                ? "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)"
                : "linear-gradient(135deg, #5C4033 0%, #C89B6D 100%)",
              borderRadius:"20px",padding:"32px",textAlign:"center",color:"white"
            }}>
              <p style={{fontSize:"14px",opacity:0.85,margin:"0 0 8px"}}>Score Change</p>
              <p style={{fontSize:"64px",fontWeight:"900",margin:"0 0 8px",lineHeight:1}}>
                {parseFloat(improvement) > 0 ? "+" : ""}{improvement}
              </p>
              <p style={{fontSize:"18px",fontWeight:"700",margin:"0 0 8px"}}>
                {parseFloat(improvement) > 0 ? "🎉 Your resume improved!" : parseFloat(improvement) < 0 ? "😟 Your resume got worse" : "😐 No change detected"}
              </p>
              <p style={{opacity:0.85,fontSize:"14px",margin:0}}>
                {oldScore.total_score} → {newScore.total_score} points
              </p>
            </div>

            {/* Side by Side Comparison */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px"}}>
              {[
                {label:"Old Resume", score:oldScore, color:"#FEE2E2", accent:"#DC2626"},
                {label:"New Resume", score:newScore, color:"#DCFCE7", accent:"#16A34A"}
              ].map((item, i) => (
                <div key={i} className={`animate-fadeUp stagger-${i+1}`} style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                  <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>{item.label}</h3>
                  <div style={{backgroundColor:item.color,borderRadius:"12px",padding:"16px",textAlign:"center",marginBottom:"16px"}}>
                    <p style={{fontSize:"40px",fontWeight:"900",color:item.accent,margin:"0 0 4px"}}>{item.score.total_score}</p>
                    <p style={{color:item.accent,fontSize:"14px",fontWeight:"600",margin:0}}>{item.score.grade}</p>
                  </div>
                  {Object.entries(item.score.breakdown).map(([key, value]) => (
                    <div key={key} style={{marginBottom:"10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                        <span style={{color:"#6B5B4D",fontSize:"12px",fontWeight:"600",textTransform:"capitalize"}}>{key}</span>
                        <span style={{color:getScoreColor(value.score),fontSize:"12px",fontWeight:"700"}}>{value.score}</span>
                      </div>
                      <div style={{backgroundColor:"#EFE4D3",borderRadius:"4px",height:"6px",overflow:"hidden"}}>
                        <div style={{height:"100%",width:value.score+"%",backgroundColor:getScoreColor(value.score),borderRadius:"4px"}}/>
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:"12px",backgroundColor:"#FDF8F0",borderRadius:"8px",padding:"10px 12px",display:"flex",justifyContent:"space-between"}}>
                    <span style={{color:"#8D6E63",fontSize:"12px"}}>Health Score</span>
                    <span style={{color:getScoreColor(item.score.health),fontWeight:"700",fontSize:"12px"}}>{item.score.health}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setOldFile(null); setNewFile(null); setOldScore(null); setNewScore(null) }}
              style={{width:"100%",backgroundColor:"#5C4033",color:"white",border:"none",padding:"14px",borderRadius:"12px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}
            >
              Compare Again
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default TimeMachine