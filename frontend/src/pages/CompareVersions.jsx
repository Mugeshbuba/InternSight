import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function CompareVersions() {
  const { idA, idB } = useParams()
  const navigate = useNavigate()
  const [dataA, setDataA] = useState(null)
  const [dataB, setDataB] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      Promise.all([
        axios.get("http://127.0.0.1:8000/resume/" + idA),
        axios.get("http://127.0.0.1:8000/resume/" + idA + "/score")
      ]),
      Promise.all([
        axios.get("http://127.0.0.1:8000/resume/" + idB),
        axios.get("http://127.0.0.1:8000/resume/" + idB + "/score")
      ])
    ]).then(([[resA, scoreA], [resB, scoreB]]) => {
      setDataA({...resA.data, score: scoreA.data})
      setDataB({...resB.data, score: scoreB.data})
    }).catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [idA, idB])

  const getScoreColor = (s) => s >= 75 ? "#22C55E" : s >= 50 ? "#F59E0B" : "#EF4444"

  if (loading) {
    return (
      <Layout>
        <div style={{maxWidth:"900px",margin:"0 auto"}}>
          <div className="skeleton" style={{height:"32px",width:"280px",borderRadius:"8px",marginBottom:"24px"}}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
            <div className="skeleton" style={{height:"400px",borderRadius:"18px"}}/>
            <div className="skeleton" style={{height:"400px",borderRadius:"18px"}}/>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !dataA || !dataB) {
    return (
      <Layout>
        <div style={{maxWidth:"600px",margin:"0 auto",textAlign:"center",padding:"48px"}}>
          <div style={{fontSize:"48px",marginBottom:"12px"}}>⚠️</div>
          <p style={{color:"#5C4033",fontSize:"16px",fontWeight:"700",marginBottom:"8px"}}>Couldn't load one or both versions</p>
          <button onClick={() => navigate("/resume-versions")} className="btn btn-primary" style={{marginTop:"12px",padding:"10px 20px"}}>
            ← Back to Versions
          </button>
        </div>
      </Layout>
    )
  }

  const scoreDiff = dataB.score.total_score - dataA.score.total_score
  const allCategories = [...new Set([...Object.keys(dataA.score.breakdown), ...Object.keys(dataB.score.breakdown)])]

  return (
    <Layout>
      <div style={{maxWidth:"900px",margin:"0 auto"}}>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>⚖️ Compare Versions</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>Side-by-side breakdown of both resume versions.</p>
        </div>

        {scoreDiff !== 0 && (
          <div className="animate-fadeUp" style={{
            background: scoreDiff > 0 ? "linear-gradient(135deg,#22C55E,#4ADE80)" : "linear-gradient(135deg,#EF4444,#F87171)",
            borderRadius:"16px",padding:"18px 24px",color:"white",textAlign:"center",marginBottom:"20px"
          }}>
            <p style={{fontSize:"15px",fontWeight:"700",margin:0}}>
              {scoreDiff > 0 ? "📈" : "📉"} {dataB.version_label || dataB.filename} scores {Math.abs(scoreDiff)} points {scoreDiff > 0 ? "higher" : "lower"} than {dataA.version_label || dataA.filename}
            </p>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"}}>
          {[dataA, dataB].map((d, idx) => (
            <div key={idx} className={`animate-fadeUp stagger-${idx+1}`} style={{backgroundColor:"#FFFDF9",borderRadius:"18px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <p style={{color:"#8D6E63",fontSize:"11px",fontWeight:"700",letterSpacing:"0.5px",marginBottom:"6px"}}>{idx === 0 ? "VERSION A" : "VERSION B"}</p>
              <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>{d.version_label || d.filename.replace(".pdf","")}</h3>

              <div style={{textAlign:"center",marginBottom:"20px"}}>
                <p style={{fontSize:"48px",fontWeight:"900",color:getScoreColor(d.score.total_score),margin:0,lineHeight:1}}>{d.score.total_score}</p>
                <p style={{color:"#A08D7C",fontSize:"12px",margin:"4px 0 0"}}>{d.score.grade}</p>
              </div>

              {allCategories.map(cat => {
                const val = d.score.breakdown[cat]
                return (
                  <div key={cat} style={{marginBottom:"12px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                      <span style={{fontSize:"11px",color:"#6B5B4D",fontWeight:"600",textTransform:"capitalize"}}>{cat}</span>
                      <span style={{fontSize:"11px",fontWeight:"700",color:val?getScoreColor(val.score):"#B3A292"}}>{val ? val.score+"/100" : "—"}</span>
                    </div>
                    <div style={{backgroundColor:"#EFE4D3",borderRadius:"6px",height:"7px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:(val?val.score:0)+"%",backgroundColor:val?getScoreColor(val.score):"#EFE4D3",borderRadius:"6px"}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/resume-versions")} style={{marginTop:"20px",background:"none",border:"none",color:"#8D6E63",fontSize:"13px",cursor:"pointer",fontWeight:"600"}}>
          ← Back to Versions
        </button>
      </div>
    </Layout>
  )
}

export default CompareVersions