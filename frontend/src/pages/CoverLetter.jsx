import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

function CoverLetter() {
  const navigate = useNavigate()
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [tone, setTone] = useState("formal")
  const [result, setResult] = useState(null)
  const [editedLetter, setEditedLetter] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const resumeId = localStorage.getItem("resume_id")

  const tones = [
    {key:"formal", label:"Formal"},
    {key:"enthusiastic", label:"Enthusiastic"},
    {key:"confident", label:"Confident"}
  ]

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !company.trim()) return
    if (!resumeId) { alert("Please upload your resume first!"); return }
    setLoading(true)
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/resume/" + resumeId + "/cover-letter",
        { job_title: jobTitle, company_name: company, tone, job_description: jobDescription }
      )
      setResult(res.data)
      setEditedLetter(res.data.cover_letter)
    } catch (err) {
      console.error("Failed")
    }
    setLoading(false)
  }

  const copyText = () => {
    navigator.clipboard.writeText(editedLetter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buildLetterHTML = (text) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Georgia, serif; font-size: 14px; color: #2E2A27; padding: 48px; line-height: 1.8; white-space: pre-line; }
</style></head>
<body>${text.replace(/</g,"&lt;")}</body>
</html>`

  const downloadPDF = () => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(buildLetterHTML(editedLetter))
    printWindow.document.close()
    printWindow.onload = () => { printWindow.focus(); printWindow.print() }
  }

  const downloadDOCX = () => {
    const html = buildLetterHTML(editedLetter)
    const wordWrapped = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset="UTF-8"></head><body>${html.replace(/<!DOCTYPE[^>]*>/i,"").replace(/<html>|<\/html>|<head>[\s\S]*?<\/head>/gi,"")}</body></html>`
    const blob = new Blob(['\ufeff', wordWrapped], {type:"application/msword"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "cover_letter_" + company.replace(/\s/g,"_") + ".doc"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div style={{maxWidth:"800px",margin:"0 auto"}}>

        <div style={{marginBottom:"32px"}}>
          <h2 style={{fontSize:"28px",fontWeight:"800",color:"#5C4033",marginBottom:"8px"}}>
            📝 Cover Letter Generator
          </h2>
          <p style={{color:"#8D6E63",fontSize:"15px"}}>
            Generate a professional cover letter based on your resume in seconds!
          </p>
        </div>

        <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"32px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",marginBottom:"24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"20px"}}>
            <div>
              <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>
                Job Title
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer Intern"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                style={{width:"100%",padding:"12px 16px",borderRadius:"10px",border:"1px solid #E8D9C5",fontSize:"14px",outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div>
              <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Google, TCS, Infosys"
                value={company}
                onChange={e => setCompany(e.target.value)}
                style={{width:"100%",padding:"12px 16px",borderRadius:"10px",border:"1px solid #E8D9C5",fontSize:"14px",outline:"none",boxSizing:"border-box"}}
              />
            </div>
          </div>

          <div style={{marginBottom:"20px"}}>
            <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>
              Tone
            </label>
            <div style={{display:"flex",gap:"8px"}}>
              {tones.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTone(t.key)}
                  style={{padding:"8px 18px",borderRadius:"20px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"13px",backgroundColor:tone===t.key?"#5C4033":"#F0E4D3",color:tone===t.key?"white":"#5C4033"}}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:"20px"}}>
            <label style={{fontSize:"13px",fontWeight:"700",color:"#5C4033",marginBottom:"8px",display:"block"}}>
              Job Description <span style={{fontWeight:"400",color:"#A08D7C"}}>(optional — helps tailor the letter)</span>
            </label>
            <textarea
              placeholder="Paste the job description here for a more targeted cover letter..."
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={3}
              style={{width:"100%",padding:"12px 16px",borderRadius:"10px",border:"1px solid #E8D9C5",fontSize:"14px",outline:"none",boxSizing:"border-box",resize:"none",fontFamily:"'Segoe UI',sans-serif"}}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !jobTitle.trim() || !company.trim()}
            style={{width:"100%",backgroundColor: jobTitle.trim() && company.trim() ? "#5C4033" : "#ccc",color:"white",border:"none",padding:"14px",borderRadius:"12px",fontSize:"16px",fontWeight:"700",cursor: jobTitle.trim() && company.trim() ? "pointer" : "not-allowed"}}
          >
            {loading ? "⏳ Generating..." : "✨ Generate Cover Letter"}
          </button>
        </div>

        {result && (
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>

            <div className="animate-fadeUp" style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"28px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"10px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <h3 style={{fontSize:"18px",fontWeight:"700",color:"#5C4033",margin:0}}>
                    Your Cover Letter
                  </h3>
                  <div style={{display:"flex",backgroundColor:"#F0E4D3",borderRadius:"8px",padding:"3px"}}>
                    <button onClick={() => setEditing(false)} style={{padding:"5px 12px",borderRadius:"6px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:"600",backgroundColor:!editing?"#5C4033":"transparent",color:!editing?"white":"#5C4033"}}>Preview</button>
                    <button onClick={() => setEditing(true)} style={{padding:"5px 12px",borderRadius:"6px",border:"none",cursor:"pointer",fontSize:"12px",fontWeight:"600",backgroundColor:editing?"#5C4033":"transparent",color:editing?"white":"#5C4033"}}>Edit</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                  <button
                    onClick={copyText}
                    style={{backgroundColor: copied ? "#DCFCE7" : "#F0E4D3",color: copied ? "#16A34A" : "#5C4033",border:"none",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}
                  >
                    {copied ? "✅ Copied!" : "📋 Copy"}
                  </button>
                  <button onClick={downloadPDF} style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}>📕 PDF</button>
                  <button onClick={downloadDOCX} style={{backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"8px 14px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}>📘 DOCX</button>
                </div>
              </div>

              {editing ? (
                <textarea
                  value={editedLetter}
                  onChange={e => setEditedLetter(e.target.value)}
                  rows={14}
                  style={{width:"100%",backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"24px",fontSize:"15px",lineHeight:"1.8",color:"#4A3728",fontFamily:"Georgia, serif",border:"1px solid #E8D9C5",outline:"none",resize:"vertical",boxSizing:"border-box"}}
                />
              ) : (
                <div style={{backgroundColor:"#FDF8F0",borderRadius:"12px",padding:"24px",whiteSpace:"pre-line",fontSize:"15px",lineHeight:"1.8",color:"#4A3728",fontFamily:"Georgia, serif"}}>
                  {editedLetter}
                </div>
              )}
            </div>

            <div style={{backgroundColor:"#FFFDF9",borderRadius:"20px",padding:"24px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",marginBottom:"16px"}}>
                💡 Tips to Improve Your Cover Letter
              </h3>
              {result.tips.map((tip, i) => (
                <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",marginBottom:"10px"}}>
                  <span style={{color:"#C89B6D",fontWeight:"700",flexShrink:0}}>{i+1}.</span>
                  <span style={{color:"#6B5B4D",fontSize:"14px"}}>{tip}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setResult(null); setJobTitle(""); setCompany(""); setEditing(false) }}
              style={{width:"100%",backgroundColor:"#5C4033",color:"white",border:"none",padding:"14px",borderRadius:"12px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}
            >
              Generate Another Cover Letter
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default CoverLetter