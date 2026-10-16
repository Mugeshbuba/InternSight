import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Layout from "../Layout"

const ALL_JOBS = [
  {
    id:1,title:"Frontend Developer Intern",company:"TechCorp Solutions",location:"Bangalore",type:"Remote",stipend:"₹15,000/month",
    skills:["react","javascript","html","css","git"],logo:"💻",
    description:"We are looking for a passionate Frontend Developer Intern to join our product team. You will build responsive web interfaces using React.js and modern CSS.",
    responsibilities:["Build responsive UI using React","Collaborate with designers","Write clean maintainable code","Participate in code reviews"],
    eligibility:["B.Tech/B.E/MCA pursuing","Knowledge of HTML CSS JavaScript","Basic React experience","Good problem solving"],
    applyLink:"https://www.linkedin.com/jobs/",duration:"6 months",openings:3,roleKey:"frontend_developer"
  },
  {
    id:2,title:"Data Analyst Intern",company:"Analytics Pro",location:"Chennai",type:"Hybrid",stipend:"₹12,000/month",
    skills:["python","sql","excel","pandas","tableau"],logo:"📊",
    description:"Join our data team to analyze business data, build dashboards and provide insights that drive company decisions.",
    responsibilities:["Analyze datasets using Python and SQL","Create visualizations","Write data reports","Support business decisions"],
    eligibility:["Statistics/CS/IT background","Python and SQL skills","Excel knowledge","Analytical mindset"],
    applyLink:"https://www.naukri.com/",duration:"3 months",openings:2,roleKey:"data_analyst"
  },
  {
    id:3,title:"Machine Learning Intern",company:"AI Ventures",location:"Hyderabad",type:"Remote",stipend:"₹20,000/month",
    skills:["python","machine learning","tensorflow","numpy","pandas"],logo:"🤖",
    description:"Work with our AI team to build and deploy ML models for real-world applications in computer vision and NLP.",
    responsibilities:["Build and train ML models","Process datasets","Evaluate model performance","Deploy models to production"],
    eligibility:["CS/IT/ECE background","Strong Python","ML algorithm knowledge","TensorFlow or PyTorch is a plus"],
    applyLink:"https://www.linkedin.com/jobs/",duration:"6 months",openings:2,roleKey:"ml_engineer"
  },
  {
    id:4,title:"Backend Developer Intern",company:"StartupHub",location:"Mumbai",type:"Onsite",stipend:"₹18,000/month",
    skills:["python","nodejs","sql","docker","git"],logo:"⚙️",
    description:"Build scalable REST APIs and backend systems for our growing SaaS platform serving 10,000+ users.",
    responsibilities:["Develop REST APIs","Design databases","Write tests","Collaborate with frontend"],
    eligibility:["CS/IT background","Python or Node.js","Basic SQL","REST API understanding"],
    applyLink:"https://internshala.com/",duration:"6 months",openings:4,roleKey:"backend_developer"
  },
  {
    id:5,title:"DevOps Intern",company:"CloudSystems",location:"Pune",type:"Remote",stipend:"₹16,000/month",
    skills:["docker","kubernetes","aws","linux","git"],logo:"☁️",
    description:"Help manage cloud infrastructure and build CI/CD pipelines for automated testing and deployment.",
    responsibilities:["Set up CI/CD pipelines","Manage AWS infrastructure","Write infrastructure as code","Monitor systems"],
    eligibility:["CS/IT background","Basic Linux","Docker familiarity","Cloud interest"],
    applyLink:"https://www.naukri.com/",duration:"6 months",openings:2,roleKey:"devops_engineer"
  },
  {
    id:6,title:"Full Stack Developer Intern",company:"WebWorks",location:"Delhi",type:"Hybrid",stipend:"₹14,000/month",
    skills:["react","nodejs","mongodb","javascript","git"],logo:"🌐",
    description:"Work on both frontend and backend using MERN stack in an agile environment.",
    responsibilities:["Build full stack features","React frontend work","Node.js API development","MongoDB integration"],
    eligibility:["Any CS background","JavaScript knowledge","Basic React and Node.js","MERN stack interest"],
    applyLink:"https://internshala.com/",duration:"3 months",openings:5,roleKey:"frontend_developer"
  },
  {
    id:7,title:"TCS Digital Intern",company:"Tata Consultancy Services",location:"Multiple Cities",type:"Onsite",stipend:"₹10,000/month",
    skills:["java","sql","python","git","communication"],logo:"🏢",
    description:"TCS Digital internship for fresh graduates. Work on real enterprise projects with mentoring from senior professionals.",
    responsibilities:["Work on client projects","Learn enterprise development","Participate in training","Contribute to deliverables"],
    eligibility:["B.Tech/B.E 60%+ aggregate","CS/IT/ECE branch","No active backlogs","Good communication"],
    applyLink:"https://www.tcs.com/careers",duration:"6 months",openings:100,roleKey:"backend_developer"
  },
  {
    id:8,title:"Infosys InStep Intern",company:"Infosys",location:"Bangalore/Pune",type:"Onsite",stipend:"₹15,000/month",
    skills:["python","java","sql","communication","teamwork"],logo:"💼",
    description:"Infosys InStep is a prestigious internship offering hands-on experience in cutting-edge technologies.",
    responsibilities:["Work on innovation projects","Collaborate globally","Present outcomes","Get senior mentoring"],
    eligibility:["Top 10% academic performance","B.Tech/M.Tech/MCA","Strong technical fundamentals","Good English"],
    applyLink:"https://www.infosys.com/careers/",duration:"8 weeks",openings:50,roleKey:"backend_developer"
  },
  {
    id:9,title:"Google STEP Intern",company:"Google",location:"Hyderabad/Bangalore",type:"Onsite",stipend:"₹80,000/month",
    skills:["python","algorithms","data structures","problem solving","git"],logo:"🔍",
    description:"Google STEP for pre-final year students passionate about software engineering excellence.",
    responsibilities:["Work on Google products","Solve complex problems","Collaborate with Googlers","Present project"],
    eligibility:["Pre-final year B.Tech","Excellent DSA","Strong problem solving","Competitive programming preferred"],
    applyLink:"https://careers.google.com/",duration:"10-12 weeks",openings:20,roleKey:"backend_developer"
  },
  {
    id:10,title:"Microsoft Engage Intern",company:"Microsoft",location:"Hyderabad",type:"Onsite",stipend:"₹60,000/month",
    skills:["algorithms","problem solving","python","git","teamwork"],logo:"🪟",
    description:"Microsoft Engage for engineering students to work on real Microsoft products and Azure cloud services.",
    responsibilities:["Build Microsoft product features","Work with Azure","Solve engineering challenges","Present to leadership"],
    eligibility:["2nd/3rd year B.Tech","Strong DSA","Cloud interest","Team player"],
    applyLink:"https://careers.microsoft.com/",duration:"10 weeks",openings:30,roleKey:"backend_developer"
  },
  {
    id:11,title:"Python Developer Intern",company:"CodeFactory",location:"Hyderabad",type:"Remote",stipend:"₹15,000/month",
    skills:["python","django","sql","git","docker"],logo:"🐍",
    description:"Build Python web applications and automation tools serving enterprise clients.",
    responsibilities:["Develop Django apps","Build automation scripts","Write API integrations","Optimize queries"],
    eligibility:["CS/IT background","Strong Python","Basic Django","Backend interest"],
    applyLink:"https://internshala.com/",duration:"6 months",openings:4,roleKey:"backend_developer"
  },
  {
    id:12,title:"NLP Engineer Intern",company:"LinguaTech AI",location:"Bangalore",type:"Remote",stipend:"₹22,000/month",
    skills:["python","machine learning","deep learning","pytorch","numpy"],logo:"💬",
    description:"Work on state-of-the-art NLP models for text classification, sentiment analysis and language generation.",
    responsibilities:["Build NLP pipelines","Fine-tune models","Evaluate performance","Write research reports"],
    eligibility:["CS/AI/ML background","Python and PyTorch","NLP knowledge","Research mindset"],
    applyLink:"https://www.linkedin.com/jobs/",duration:"6 months",openings:2,roleKey:"ml_engineer"
  }
]

const GOVT_JOBS = [
  {title:"DRDO Apprentice 2026",org:"Defence R&D Organisation",eligibility:"B.Tech/Diploma",link:"https://drdo.gov.in/",deadline:"Rolling",logo:"🛡️"},
  {title:"ISRO Scientist/Engineer",org:"Indian Space Research Organisation",eligibility:"B.Tech CS/ECE",link:"https://www.isro.gov.in/",deadline:"Rolling",logo:"🚀"},
  {title:"TNPSC Group 2 Posts",org:"Tamil Nadu Public Service Commission",eligibility:"Any Degree",link:"https://www.tnpsc.gov.in/",deadline:"Varies",logo:"🏛️"},
  {title:"SSC CHSL 2026",org:"Staff Selection Commission",eligibility:"12th Pass/Graduate",link:"https://ssc.nic.in/",deadline:"Upcoming",logo:"📋"},
  {title:"RBI Grade B Officer",org:"Reserve Bank of India",eligibility:"Bachelor Degree 60%+",link:"https://rbi.org.in/",deadline:"Rolling",logo:"🏦"},
  {title:"NABARD Grade A",org:"National Bank for Agriculture",eligibility:"B.Tech/MBA/Economics",link:"https://nabard.org/",deadline:"Rolling",logo:"🌾"}
]

function Jobs() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("All")
  const [userSkills, setUserSkills] = useState("")
  const [selectedJob, setSelectedJob] = useState(null)
  const [activeSection, setActiveSection] = useState("internships")
  const resumeId = localStorage.getItem("resume_id")

  useEffect(() => {
    if (resumeId) {
      axios.get("http://127.0.0.1:8000/resume/"+resumeId)
        .then(res => setUserSkills((res.data.raw_text||"").toLowerCase()))
        .catch(()=>{})
    }
  },[])

  const getMatchScore = (jobSkills) => {
    if (!userSkills) return 0
    const matched = jobSkills.filter(s => userSkills.includes(s))
    return Math.round((matched.length/jobSkills.length)*100)
  }

  const getVerdict = (score) => {
    if (score >= 70) return {text:"✅ Apply Now!",color:"#16A34A",bg:"#DCFCE7"}
    if (score >= 40) return {text:"⚠️ Almost There",color:"#B45309",bg:"#FEF3C7"}
    return {text:"❌ Not Ready",color:"#DC2626",bg:"#FEE2E2"}
  }

  const getScoreColor = (s) => {
    if (s >= 70) return "#22C55E"
    if (s >= 40) return "#F59E0B"
    return "#EF4444"
  }

  const filtered = ALL_JOBS.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.skills.some(s => s.includes(search.toLowerCase()))
    const matchFilter = filter === "All" || job.type === filter
    return matchSearch && matchFilter
  })

  return (
    <Layout>
      <div style={{maxWidth:"1000px",margin:"0 auto"}}>

        <div style={{marginBottom:"20px"}} className="animate-fadeUp">
          <h2 style={{fontSize:"26px",fontWeight:"800",color:"#5C4033",marginBottom:"6px"}}>💼 Internship & Job Listings</h2>
          <p style={{color:"#8D6E63",fontSize:"14px"}}>{resumeId?"Showing your match score for each listing":"Upload your resume to see match scores"}</p>
        </div>

        <div style={{display:"flex",gap:"8px",marginBottom:"20px",backgroundColor:"#FFFDF9",padding:"5px",borderRadius:"12px",boxShadow:"0 2px 8px rgba(92,64,51,0.06)"}}>
          {[{key:"internships",label:"🏢 Internships"},{key:"govt",label:"🏛️ Govt Jobs"}].map(tab => (
            <button key={tab.key} onClick={() => setActiveSection(tab.key)}
              style={{flex:1,padding:"9px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"13px",backgroundColor:activeSection===tab.key?"#5C4033":"transparent",color:activeSection===tab.key?"white":"#8D6E63",transition:"all 0.2s"}}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeSection === "internships" && (
          <>
            <div style={{backgroundColor:"#FFFDF9",borderRadius:"14px",padding:"14px",marginBottom:"20px",display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap",boxShadow:"0 2px 12px rgba(92,64,51,0.08)"}}>
              <input type="text" placeholder="🔍 Search by role, company or skill..." value={search} onChange={e => setSearch(e.target.value)}
                style={{flex:1,minWidth:"200px",border:"1.5px solid #E8D9C5",borderRadius:"8px",padding:"9px 14px",fontSize:"13px",outline:"none"}}/>
              {["All","Remote","Hybrid","Onsite"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{padding:"8px 16px",borderRadius:"8px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:"12px",backgroundColor:filter===f?"#5C4033":"#F5EDE0",color:filter===f?"white":"#5C4033",transition:"all 0.2s"}}>
                  {f}
                </button>
              ))}
            </div>

            {!resumeId && (
              <div style={{backgroundColor:"#F0E4D3",borderRadius:"12px",padding:"14px",marginBottom:"16px",textAlign:"center",border:"1px solid #C89B6D"}}>
                <p style={{color:"#5C4033",fontWeight:"600",margin:"0 0 10px",fontSize:"13px"}}>Upload your resume to see your match score for each job!</p>
                <button onClick={() => navigate("/upload")} style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"7px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>Upload Resume →</button>
              </div>
            )}

            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {filtered.map((job,idx) => {
                const score = resumeId ? getMatchScore(job.skills) : null
                const verdict = score !== null ? getVerdict(score) : null
                return (
                  <div key={job.id} className={`card-hover animate-fadeUp stagger-${(idx%6)+1}`} style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"22px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",border:"1px solid #EFE4D3"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"14px"}}>
                      <div style={{display:"flex",gap:"14px",alignItems:"center"}}>
                        <div style={{fontSize:"32px",backgroundColor:"#F5EDE0",width:"52px",height:"52px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{job.logo}</div>
                        <div>
                          <h3 style={{fontSize:"16px",fontWeight:"700",color:"#5C4033",margin:"0 0 3px"}}>{job.title}</h3>
                          <p style={{color:"#8D6E63",fontSize:"12px",margin:"0 0 6px"}}>{job.company} · {job.location} · {job.duration}</p>
                          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
                            <span style={{backgroundColor:"#F0E4D3",color:"#5C4033",padding:"2px 8px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>{job.type}</span>
                            <span style={{backgroundColor:"#F5EDE0",color:"#5C4033",padding:"2px 8px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>{job.stipend}</span>
                            <span style={{backgroundColor:"#FEF3C7",color:"#B45309",padding:"2px 8px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>{job.openings} openings</span>
                          </div>
                        </div>
                      </div>
                      {verdict && (
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{backgroundColor:verdict.bg,color:verdict.color,padding:"5px 12px",borderRadius:"20px",fontWeight:"700",fontSize:"12px",marginBottom:"3px"}}>{verdict.text}</div>
                          <p style={{color:"#8D6E63",fontSize:"11px",margin:0}}>{score}% match</p>
                        </div>
                      )}
                    </div>

                    <p style={{color:"#7A6A5D",fontSize:"13px",marginBottom:"12px",lineHeight:"1.5"}}>{job.description}</p>

                    {verdict && score > 0 && (
                      <div style={{backgroundColor:"#FDF8F0",borderRadius:"8px",padding:"8px 12px",marginBottom:"12px"}}>
                        <div style={{backgroundColor:"#E8D9C5",borderRadius:"6px",height:"7px",overflow:"hidden"}}>
                          <div style={{height:"100%",width:score+"%",backgroundColor:getScoreColor(score),borderRadius:"6px",transition:"width 1s ease"}}/>
                        </div>
                      </div>
                    )}

                    <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"14px"}}>
                      {job.skills.map((skill,i) => {
                        const has = userSkills && userSkills.includes(skill)
                        return (
                          <span key={i} style={{backgroundColor:has?"#DCFCE7":"#FEE2E2",color:has?"#16A34A":"#DC2626",padding:"3px 9px",borderRadius:"6px",fontSize:"11px",fontWeight:"600"}}>
                            {has?"✓ ":"✗ "}{skill}
                          </span>
                        )
                      })}
                    </div>

                    <div style={{display:"flex",gap:"8px"}}>
                      <button
                        onClick={() => setSelectedJob(job)}
                        style={{flex:1,backgroundColor:"#F5EDE0",color:"#5C4033",border:"1.5px solid #E8D9C5",padding:"9px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px",transition:"all 0.2s"}}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor="#EDE0CC"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor="#F5EDE0"}
                      >
                        📋 View Details
                      </button>
                      {score >= 70 ? (
                        <button
                          onClick={() => setSelectedJob(job)}
                          style={{flex:1,backgroundColor:"#5C4033",color:"white",border:"none",padding:"9px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px",transition:"all 0.2s"}}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor="#7A5233"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor="#5C4033"}
                        >
                          ✅ Apply Now
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (resumeId) navigate("/roadmap/"+resumeId+"/"+job.roleKey)
                            else navigate("/upload")
                          }}
                          style={{flex:1,backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"9px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px",transition:"all 0.2s"}}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor="#E8D5BE"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor="#F0E4D3"}
                        >
                          🗺️ What to Learn
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="animate-fadeIn" style={{textAlign:"center",padding:"48px",color:"#8D6E63"}}>
                <div style={{fontSize:"40px",marginBottom:"12px"}}>🔍</div>
                <p style={{fontSize:"16px",fontWeight:"600",color:"#5C4033"}}>No jobs found</p>
                <p style={{fontSize:"13px"}}>Try a different keyword</p>
              </div>
            )}
          </>
        )}

        {activeSection === "govt" && (
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            <div style={{backgroundColor:"#F0E4D3",borderRadius:"12px",padding:"14px 18px",border:"1px solid #C89B6D"}}>
              <p style={{color:"#5C4033",fontWeight:"600",fontSize:"13px",margin:0}}>
                🏛️ These links redirect to official websites. Always verify on the official portal before applying.
              </p>
            </div>
            {GOVT_JOBS.map((job,i) => (
              <div key={i} className={`card-hover animate-fadeUp stagger-${(i%6)+1}`} style={{backgroundColor:"#FFFDF9",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 12px rgba(92,64,51,0.08)",display:"flex",gap:"16px",alignItems:"center"}}>
                <div style={{fontSize:"32px",backgroundColor:"#F5EDE0",width:"52px",height:"52px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{job.logo}</div>
                <div style={{flex:1}}>
                  <h3 style={{fontSize:"15px",fontWeight:"700",color:"#5C4033",margin:"0 0 3px"}}>{job.title}</h3>
                  <p style={{color:"#8D6E63",fontSize:"12px",margin:"0 0 6px"}}>{job.org}</p>
                  <div style={{display:"flex",gap:"6px"}}>
                    <span style={{backgroundColor:"#F5EDE0",color:"#5C4033",padding:"2px 8px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>Eligibility: {job.eligibility}</span>
                    <span style={{backgroundColor:"#FEF3C7",color:"#B45309",padding:"2px 8px",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>Deadline: {job.deadline}</span>
                  </div>
                </div>
                <a href={job.link} target="_blank" rel="noreferrer"
                  style={{backgroundColor:"#5C4033",color:"white",border:"none",padding:"9px 18px",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px",textDecoration:"none",whiteSpace:"nowrap",transition:"all 0.2s"}}>
                  Apply →
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div
            style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",backdropFilter:"blur(4px)"}}
            onClick={() => setSelectedJob(null)}
          >
            <div
              style={{backgroundColor:"#FFFDF9",borderRadius:"20px",maxWidth:"620px",width:"100%",maxHeight:"88vh",overflowY:"auto",padding:"32px",boxShadow:"0 24px 80px rgba(92,64,51,0.20)"}}
              onClick={e => e.stopPropagation()}
              className="animate-scaleIn"
            >
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"20px"}}>
                <div style={{display:"flex",gap:"14px",alignItems:"center"}}>
                  <div style={{fontSize:"36px",backgroundColor:"#F5EDE0",width:"52px",height:"52px",borderRadius:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>{selectedJob.logo}</div>
                  <div>
                    <h2 style={{fontSize:"20px",fontWeight:"800",color:"#5C4033",margin:"0 0 3px"}}>{selectedJob.title}</h2>
                    <p style={{color:"#8D6E63",fontSize:"13px",margin:0}}>{selectedJob.company} · {selectedJob.location}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"22px",color:"#8D6E63",lineHeight:1}}>✕</button>
              </div>

              <div style={{display:"flex",gap:"8px",marginBottom:"20px",flexWrap:"wrap"}}>
                {[
                  {label:selectedJob.type,bg:"#F0E4D3"},
                  {label:selectedJob.stipend,bg:"#DCFCE7"},
                  {label:selectedJob.duration,bg:"#FEF3C7"},
                  {label:selectedJob.openings+" openings",bg:"#F5EDE0"}
                ].map((b,i) => (
                  <span key={i} style={{backgroundColor:b.bg,color:"#5C4033",padding:"4px 10px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>{b.label}</span>
                ))}
              </div>

              <div style={{marginBottom:"18px"}}>
                <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"8px"}}>📋 About the Role</h3>
                <p style={{color:"#6B5B4D",fontSize:"13px",lineHeight:"1.7",margin:0,backgroundColor:"#FDF8F0",padding:"14px",borderRadius:"10px"}}>{selectedJob.description}</p>
              </div>

              <div style={{marginBottom:"18px"}}>
                <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"10px"}}>✅ What You Will Do</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                  {selectedJob.responsibilities.map((r,i) => (
                    <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",backgroundColor:"#F5EDE0",padding:"10px 14px",borderRadius:"8px"}}>
                      <span style={{color:"#C89B6D",fontWeight:"700",flexShrink:0}}>→</span>
                      <span style={{color:"#5C4A3D",fontSize:"13px"}}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:"18px"}}>
                <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"10px"}}>🎓 Eligibility Criteria</h3>
                <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
                  {selectedJob.eligibility.map((e,i) => (
                    <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start"}}>
                      <span style={{color:"#22C55E",fontWeight:"700",flexShrink:0,marginTop:"1px"}}>✓</span>
                      <span style={{color:"#6B5B4D",fontSize:"13px"}}>{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:"18px"}}>
                <h3 style={{fontSize:"14px",fontWeight:"700",color:"#5C4033",marginBottom:"10px"}}>🛠️ Required Skills</h3>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {selectedJob.skills.map((skill,i) => {
                    const has = userSkills && userSkills.includes(skill)
                    return (
                      <span key={i} style={{backgroundColor:has?"#DCFCE7":"#FEE2E2",color:has?"#16A34A":"#DC2626",padding:"4px 12px",borderRadius:"20px",fontSize:"12px",fontWeight:"600"}}>
                        {has?"✓ ":"✗ "}{skill}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                <a
                  href={selectedJob.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{display:"block",width:"100%",backgroundColor:"#5C4033",color:"white",border:"none",padding:"14px",borderRadius:"12px",fontSize:"15px",fontWeight:"700",cursor:"pointer",textDecoration:"none",textAlign:"center",boxSizing:"border-box"}}
                >
                  🚀 Ready to Apply → Visit Company Portal
                </a>
                <button
                  onClick={() => {
                    setSelectedJob(null)
                    if (resumeId) navigate("/roadmap/"+resumeId+"/"+selectedJob.roleKey)
                    else navigate("/upload")
                  }}
                  style={{width:"100%",backgroundColor:"#F0E4D3",color:"#5C4033",border:"none",padding:"12px",borderRadius:"12px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}
                >
                  🗺️ Get Learning Roadmap for This Role
                </button>
                <button onClick={() => setSelectedJob(null)} style={{width:"100%",backgroundColor:"#EFE4D3",color:"#8D6E63",border:"none",padding:"10px",borderRadius:"10px",fontSize:"13px",cursor:"pointer"}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Jobs