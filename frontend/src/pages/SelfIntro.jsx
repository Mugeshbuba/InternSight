import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function SelfIntro() {
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [targetRole, setTargetRole] = useState("")
  const [duration, setDuration] = useState("60sec")
  const [experienceLevel, setExperienceLevel] = useState("fresher")
  const [copied, setCopied] = useState("")
  const [practiceKey, setPracticeKey] = useState(null)
  const [practiceSeconds, setPracticeSeconds] = useState(0)
  const [practiceRunning, setPracticeRunning] = useState(false)
  const resumeId = localStorage.getItem("resume_id")

  useEffect(() => {
    if (!practiceRunning) return
    const timer = setInterval(() => setPracticeSeconds(s => s + 1), 1000)
    return () => clearInterval(timer)
  }, [practiceRunning])

  const estimateSeconds = (text) => {
    const words = text.trim().split(/\s+/).length
    return Math.round((words / 130) * 60)
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2,"0")
    const sec = (s % 60).toString().padStart(2,"0")
    return m + ":" + sec
  }

  const openPractice = (key) => {
    setPracticeKey(key)
    setPracticeSeconds(0)
    setPracticeRunning(true)
  }

  const roles = [
    "Frontend Developer", "Data Analyst", "ML Engineer",
    "Backend Developer", "DevOps Engineer", "Full Stack Developer", "Software Engineer"
  ]

  const handleGenerate = async () => {
    if (!resumeId) { alert("Please upload your resume first!"); return }
    setLoading(true)
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/resume/" + resumeId + "/self-intro",
        { target_role: targetRole, duration, experience_level: experienceLevel }
      )
      setResult(res.data)
    } catch (err) {
      console.error("Failed")
    }
    setLoading(false)
  }

  const copyText = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>🎯 Self Introduction Generator</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Generate a personalized introduction based on your resume for any interview!</p>
        </div>

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
          <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"10px",display:"block"}}>Select Target Role:</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"20px"}}>
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setTargetRole(r)}
                style={{padding:"7px 16px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"12px",backgroundColor:targetRole===r?"#5C4033":"#F5EDE0",color:targetRole===r?"white":"#5C4033",transition:"all 0.2s"}}
              >
                {r}
              </button>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
            <div>
              <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>Speaking Duration</label>
              <div style={{display:"flex",gap:"6px"}}>
                {[{key:"30sec",label:"30 sec"},{key:"60sec",label:"60 sec"},{key:"3min",label:"3 min"}].map(d => (
                  <button key={d.key} onClick={() => setDuration(d.key)}
                    style={{flex:1,padding:"7px 10px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"11px",backgroundColor:duration===d.key?"#5C4033":"#F5EDE0",color:duration===d.key?"white":"#5C4033"}}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>Experience Level</label>
              <div style={{display:"flex",gap:"6px"}}>
                {[{key:"fresher",label:"Fresher"},{key:"experienced",label:"Experienced"}].map(e => (
                  <button key={e.key} onClick={() => setExperienceLevel(e.key)}
                    style={{flex:1,padding:"7px 10px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"11px",backgroundColor:experienceLevel===e.key?"#5C4033":"#F5EDE0",color:experienceLevel===e.key?"white":"#5C4033"}}>
                    {e.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{width:"100%",backgroundColor:"#5C4033",color:"white",border:"none",padding:"13px",borderRadius:"10px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}
          >
            {loading ? "⏳ Generating..." : "✨ Generate My Introduction"}
          </button>
        </div>

        {result && (
          <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"12px"}}>📋 Skills in Your Intro</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                {result.skills_highlighted.map((s,i) => (
                  <span key={i} style={{backgroundColor:"#F0E4D3",color:"#5C4033",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{s}</span>
                ))}
              </div>
            </div>

            {[
              {key:"formal", label:"🎩 Formal Introduction", text:result.formal_introduction},
              {key:"casual", label:"😊 Casual Introduction", text:result.casual_introduction}
            ].map(intro => (
              <div key={intro.key} style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:0}}>{intro.label}</h3>
                    <span style={{backgroundColor:"#F5EDE0",color:"#8D6E63",padding:"2px 10px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>~{estimateSeconds(intro.text)}s to speak</span>
                  </div>
                  <div style={{display:"flex",gap:"8px"}}>
                    <button
                      onClick={() => openPractice(intro.key)}
                      style={{backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"6px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}
                    >
                      🎙 Practice
                    </button>
                    <button
                      onClick={() => copyText(intro.text, intro.key)}
                      style={{backgroundColor:copied===intro.key?"#DCFCE7":"#F5EDE0",color:copied===intro.key?"#16A34A":"#5C4033",border:"none",padding:"6px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}
                    >
                      {copied===intro.key ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                </div>
                <div style={{backgroundColor:"#FDF8F0",borderRadius:"10px",padding:"16px"}}>
                  <p style={{color:"#4A3728",fontSize:"14px",lineHeight:"1.8",margin:0,whiteSpace:"pre-line"}}>{intro.text}</p>
                </div>
              </div>
            ))}

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{width:"100%",backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"12px",borderRadius:"12px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}
            >
              {loading ? "⏳ Regenerating..." : "🔄 Regenerate Introductions"}
            </button>

            <div style={{backgroundColor:"#F0E4D3",borderRadius:"16px",padding:"20px"}}>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"12px"}}>💡 Delivery Tips</h3>
              {result.tips.map((tip,i) => (
                <div key={i} style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
                  <span style={{color:"#C89B6D",fontWeight:"700",flexShrink:0}}>{i+1}.</span>
                  <span style={{color:"#5C4033",fontSize:"13px"}}>{tip}</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {practiceKey && (
          <div onClick={() => setPracticeRunning(false)} style={{position:"fixed",inset:0,backgroundColor:"rgba(74,55,40,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"20px"}}>
            <div onClick={e => e.stopPropagation()} className="animate-scaleIn" style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"36px",maxWidth:"600px",width:"100%",textAlign:"center"}}>
              <p style={{color:"#8D6E63",fontSize:"12px",fontWeight:"700",letterSpacing:"0.5px",marginBottom:"6px",textTransform:"uppercase"}}>Practice Mode</p>
              <p style={{fontSize:"34px",fontWeight:"900",color:"#5C4033",margin:"0 0 4px",fontFamily:"monospace"}}>{formatTime(practiceSeconds)}</p>
              <p style={{color:"#A08D7C",fontSize:"12px",marginBottom:"24px"}}>Target: ~{formatTime(estimateSeconds(result[practiceKey==="formal"?"formal_introduction":"casual_introduction"]))}</p>
              <div style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"24px",marginBottom:"24px",maxHeight:"300px",overflowY:"auto"}}>
                <p style={{color:"#4A3728",fontSize:"17px",lineHeight:"1.9",margin:0,whiteSpace:"pre-line",textAlign:"left"}}>
                  {result[practiceKey==="formal"?"formal_introduction":"casual_introduction"]}
                </p>
              </div>
              <div style={{display:"flex",gap:"10px"}}>
                <button
                  onClick={() => setPracticeRunning(r => !r)}
                  style={{flex:1,backgroundColor:"#5C4033",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}
                >
                  {practiceRunning ? "⏸ Pause" : "▶ Resume"}
                </button>
                <button
                  onClick={() => { setPracticeKey(null); setPracticeRunning(false) }}
                  style={{flex:1,backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:"pointer"}}
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SelfIntro