import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function BulletImprover() {
  const navigate = useNavigate()
  const [resumeData, setResumeData] = useState(null)
  const [bullets, setBullets] = useState([])
  const [customBullet, setCustomBullet] = useState("")
  const [results, setResults] = useState({})
  const [loadingIndex, setLoadingIndex] = useState(null)
  const [customLoading, setCustomLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const resumeId = localStorage.getItem("resume_id")

  useEffect(() => {
    if (!resumeId) { setPageLoading(false); return }
    axios.get("http://127.0.0.1:8000/resume/" + resumeId)
      .then(res => {
        setResumeData(res.data)
        const extracted = extractBullets(res.data)
        setBullets(extracted)
        setPageLoading(false)
      })
      .catch(() => setPageLoading(false))
  }, [])

  const extractBullets = (data) => {
    const sections = [data.experience || "", data.projects || "", data.certifications || ""]
    const allText = sections.join("\n")
    const lines = allText.split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 20 && l.length < 300)
      .filter(l => !l.match(/^(experience|projects|certifications|education|skills)/i))
    return [...new Set(lines)].slice(0, 8)
  }

  const improveBullet = async (bullet, index) => {
    setLoadingIndex(index)
    try {
      const res = await axios.post("http://127.0.0.1:8000/resume/improve-bullet", {bullet})
      setResults(prev => ({...prev, [index]: res.data}))
    } catch (err) {
      console.error("Failed")
    }
    setLoadingIndex(null)
  }

  const improveCustom = async () => {
    if (!customBullet.trim()) return
    setCustomLoading(true)
    try {
      const res = await axios.post("http://127.0.0.1:8000/resume/improve-bullet", {bullet: customBullet})
      setResults(prev => ({...prev, "custom": res.data}))
    } catch (err) {
      console.error("Failed")
    }
    setCustomLoading(false)
  }

  if (pageLoading) {
    return (
      <Layout>
        <div style={{maxWidth:"800px",margin:"0 auto"}}>
          <div className="skeleton" style={{height:"32px",width:"260px",borderRadius:"8px",marginBottom:"24px"}}/>
          <div className="skeleton" style={{height:"280px",borderRadius:"20px",marginBottom:"20px"}}/>
          <div className="skeleton" style={{height:"180px",borderRadius:"20px"}}/>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>✏️ AI Bullet Improver</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>We found these sentences from your resume. Click Improve to get a stronger version!</p>
        </div>

        {bullets.length > 0 && (
          <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"20px"}}>
            <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>📄 From Your Resume</h3>
            <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"20px"}}>Click Improve on any weak sentence!</p>
            <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
              {bullets.map((bullet, index) => (
                <div key={index} className={`card-hover animate-fadeUp stagger-${(index%6)+1}`} style={{border:"1px solid #EFE4D3",borderRadius:"12px",padding:"16px"}}>
                  <div style={{backgroundColor:"#FEE2E2",borderRadius:"8px",padding:"12px",marginBottom:"10px"}}>
                    <p style={{color:"#8D6E63",fontSize:"10px",fontWeight:"700",marginBottom:"4px",textTransform:"uppercase"}}>Original</p>
                    <p style={{color:"#4A3728",fontSize:"13px",lineHeight:"1.6",margin:0}}>{bullet}</p>
                  </div>
                  {results[index] && (
                    <div>
                      <div style={{backgroundColor:"#DCFCE7",borderRadius:"8px",padding:"12px",marginBottom:"10px"}}>
                        <p style={{color:"#8D6E63",fontSize:"10px",fontWeight:"700",marginBottom:"4px",textTransform:"uppercase"}}>✅ Improved</p>
                        <p style={{color:"#16A34A",fontSize:"13px",lineHeight:"1.6",margin:0,fontWeight:"600"}}>{results[index].improved}</p>
                      </div>
                      <div style={{backgroundColor:"#F5EDE0",borderRadius:"8px",padding:"10px",marginBottom:"8px"}}>
                        {results[index].improvements_made.map((imp,i) => (
                          <p key={i} style={{color:"#5C4033",fontSize:"12px",margin:"0 0 4px"}}>→ {imp}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {!results[index] ? (
                    <button
                      onClick={() => improveBullet(bullet, index)}
                      disabled={loadingIndex === index}
                      style={{width:"100%",backgroundColor:"#5C4033",color:"white",border:"none",padding:"10px",borderRadius:"8px",fontSize:"13px",fontWeight:"700",cursor:loadingIndex===index?"not-allowed":"pointer",opacity:loadingIndex===index?0.7:1}}
                    >
                      {loadingIndex === index ? "⏳ Improving..." : "✨ Improve This"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setResults(prev => { const n={...prev}; delete n[index]; return n })}
                      style={{width:"100%",backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"8px",borderRadius:"8px",fontSize:"12px",fontWeight:"600",cursor:"pointer"}}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"6px"}}>✍️ Custom Sentence</h3>
          <p style={{color:"#8D6E63",fontSize:"13px",marginBottom:"16px"}}>Paste any sentence from your resume</p>
          <textarea
            value={customBullet}
            onChange={e => setCustomBullet(e.target.value)}
            placeholder="Paste your resume sentence here..."
            rows={3}
            style={{width:"100%",padding:"12px",borderRadius:"10px",border:"1px solid #E8D9C5",fontSize:"13px",outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"'Segoe UI',sans-serif",marginBottom:"12px"}}
          />
          <button
            onClick={improveCustom}
            disabled={customLoading || !customBullet.trim()}
            style={{width:"100%",backgroundColor:customBullet.trim()?"#5C4033":"#ccc",color:"white",border:"none",padding:"12px",borderRadius:"10px",fontSize:"14px",fontWeight:"700",cursor:customBullet.trim()?"pointer":"not-allowed",marginBottom:"14px"}}
          >
            {customLoading ? "⏳ Improving..." : "✨ Improve This Sentence"}
          </button>

          {results["custom"] && (
            <div>
              <div style={{backgroundColor:"#DCFCE7",borderRadius:"10px",padding:"14px",marginBottom:"10px"}}>
                <p style={{color:"#8D6E63",fontSize:"10px",fontWeight:"700",marginBottom:"6px",textTransform:"uppercase"}}>✅ Improved</p>
                <p style={{color:"#16A34A",fontSize:"14px",lineHeight:"1.7",margin:0,fontWeight:"600"}}>{results["custom"].improved}</p>
              </div>
              <div style={{backgroundColor:"#F5EDE0",borderRadius:"10px",padding:"12px",marginBottom:"10px"}}>
                {results["custom"].improvements_made.map((imp,i) => (
                  <p key={i} style={{color:"#5C4033",fontSize:"12px",margin:"0 0 4px"}}>→ {imp}</p>
                ))}
              </div>
              <div style={{backgroundColor:"#F0E4D3",borderRadius:"10px",padding:"12px"}}>
                <p style={{color:"#5C4033",fontSize:"12px",fontWeight:"600",margin:"0 0 4px"}}>💡 {results["custom"].tip}</p>
                <p style={{color:"#6B5B4D",fontSize:"11px",margin:0}}>Example: {results["custom"].example}</p>
              </div>
              <button
                onClick={() => { setCustomBullet(""); setResults(prev => { const n={...prev}; delete n["custom"]; return n }) }}
                style={{width:"100%",marginTop:"10px",backgroundColor:"#F5EDE0",color:"#5C4033",border:"none",padding:"10px",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:"pointer"}}
              >
                Improve Another
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default BulletImprover