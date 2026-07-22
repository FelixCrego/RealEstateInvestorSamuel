const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.join(process.cwd(),'private','seohub'),COOKIE='fchb_seohub_session',PASSWORD_HASH='fd05eb151e2f31ff9ac88d4e9b7b9778babcb7ad0bb6dc9db5f113f3bf126474';
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.csv':'text/csv; charset=utf-8'};
const token=()=>crypto.createHash('sha256').update('fchb-seohub-session:'+PASSWORD_HASH).digest('hex');
function cookies(req){return Object.fromEntries(String(req.headers.cookie||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),decodeURIComponent(x.slice(i+1))]}))}
function authed(req){const a=Buffer.from(cookies(req)[COOKIE]||''),b=Buffer.from(token());return a.length===b.length&&a.length>0&&crypto.timingSafeEqual(a,b)}
function secure(res){res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive, nosnippet');res.setHeader('Cache-Control','no-store, private');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer')}
function loginPage(error=''){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SEO Hub Login</title><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><style>body{margin:0;font-family:Arial,sans-serif;background:#081043;color:#fff;min-height:100vh;display:grid;place-items:center}.box{width:min(420px,calc(100% - 32px));background:#fff;color:#081043;padding:34px;box-sizing:border-box}h1{margin:0 0 10px}p{line-height:1.55}.err{color:#b42318;font-weight:700}label{display:block;font-weight:700;margin:22px 0 7px}input{width:100%;box-sizing:border-box;padding:14px;border:1px solid #aab0c0;font-size:16px}button{width:100%;margin-top:14px;padding:14px;background:#081043;color:#fff;border:0;font-weight:700;font-size:16px;cursor:pointer}</style></head><body><main class="box"><h1>Florida Cash House Buyers</h1><p>SEO Hub access is restricted.</p>${error?`<p class="err">${error}</p>`:''}<form method="post" action="/seohub/login/"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required autofocus><button type="submit">Open SEO Hub</button></form></main></body></html>`}
const readBody=(req,limit=10000)=>new Promise((resolve,reject)=>{let d='';req.on('data',c=>{d+=c;if(d.length>limit)reject(new Error('Too large'))});req.on('end',()=>resolve(d));req.on('error',reject)});

const WORKFLOW_OWNER='FelixCrego',WORKFLOW_REPO='RealEstateInvestorSamuel',WORKFLOW_FILE='seo-workflow.json';
function ghHeaders(){return {Authorization:`Bearer ${process.env.SEOHUB_GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Florida-Cash-House-Buyers-SEO-Brain'}}
async function getWorkflowFile(){
 const url=`https://api.github.com/repos/${WORKFLOW_OWNER}/${WORKFLOW_REPO}/contents/${WORKFLOW_FILE}`;
 const r=await fetch(url,{headers:ghHeaders()});
 if(r.status===404)return {url,sha:null,data:null};
 if(!r.ok)throw new Error(`Workflow read failed (${r.status})`);
 const f=await r.json();return {url,sha:f.sha,data:JSON.parse(Buffer.from(f.content,'base64').toString('utf8'))};
}
async function workflowApi(req,res){
 if(!process.env.SEOHUB_GITHUB_TOKEN)return res.status(500).json({ok:false,error:'Workflow storage is not configured'});
 try{
  if(req.method==='GET'){
   const f=await getWorkflowFile();return res.status(200).json({ok:true,workspace:f.data});
  }
  if(req.method!=='PUT')return res.status(405).json({ok:false,error:'Method not allowed'});
  const body=req.body&&typeof req.body==='object'?req.body:JSON.parse((typeof req.body==='string'?req.body:await readBody(req,2500000))||'{}');
  if(!Array.isArray(body.tasks)||body.tasks.length>5000)return res.status(400).json({ok:false,error:'Invalid task collection'});
  const now=new Date().toISOString();
  for(let attempt=0;attempt<3;attempt++){
   const current=await getWorkflowFile(),previous=current.data||{};
   const revisions=Array.isArray(previous.revisions)?previous.revisions:[];
   const event={at:now,actor:String(body.actor||'SEO Hub user').slice(0,100),type:String(body.event?.type||'workspace_save').slice(0,80),taskId:String(body.event?.taskId||'').slice(0,120),detail:String(body.event?.detail||'Workspace updated').slice(0,500)};
   const workspace={version:2,updatedAt:now,tasks:body.tasks,revisions:[event,...revisions].slice(0,500)};
   const payload={message:`SEO workflow: ${event.type} ${event.taskId||''}`.trim(),content:Buffer.from(JSON.stringify(workspace,null,2)).toString('base64'),branch:'master'};
   if(current.sha)payload.sha=current.sha;
   const saved=await fetch(current.url,{method:'PUT',headers:{...ghHeaders(),'Content-Type':'application/json'},body:JSON.stringify(payload)});
   if(saved.ok)return res.status(200).json({ok:true,workspace});
   if(saved.status!==409)throw new Error(`Workflow write failed (${saved.status})`);
  }
  throw new Error('Workflow changed during save; retry');
 }catch(e){console.error(e);return res.status(500).json({ok:false,error:e.message})}
}

async function audit(req,res){try{const u=new URL(String(req.query.url||''));if(!['www.floridacashhousebuyers.com','floridacashhousebuyers.com'].includes(u.hostname))return res.status(400).json({error:'Unsupported host'});const r=await fetch(u.toString(),{redirect:'follow',headers:{'user-agent':'FloridaCashHouseBuyers-SEOHub/1.0'}}),html=await r.text();const strip=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(),get=re=>((html.match(re)||[])[1]||'').replace(/\s+/g,' ').trim();const title=get(/<title[^>]*>([\s\S]*?)<\/title>/i),description=get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)||get(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i),canonical=get(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)||get(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i),h1=(html.match(/<h1\b/gi)||[]).length,h2=(html.match(/<h2\b/gi)||[]).length,links=(html.match(/<a\b[^>]+href=/gi)||[]).length,words=strip(html).split(/\s+/).filter(Boolean).length;return res.status(200).json({auditedAt:new Date().toISOString(),status:r.status,finalUrl:r.url,title,titleLength:title.length,description,descriptionLength:description.length,canonical,h1Count:h1,h2Count:h2,linkCount:links,wordCount:words,checks:{http:r.ok,title:title.length>=30&&title.length<=68,description:description.length>=80&&description.length<=175,canonical:!!canonical,h1:h1===1,depth:words>=350}})}catch(e){return res.status(500).json({error:e.message})}}
module.exports=async(req,res)=>{secure(res);let sub=String(req.query.path||'').replace(/^\/+|\/+$/g,'');if(sub==='login'&&req.method==='POST'){const supplied=new URLSearchParams(await readBody(req)).get('password')||'',suppliedHash=crypto.createHash('sha256').update(supplied).digest('hex'),a=Buffer.from(suppliedHash),b=Buffer.from(PASSWORD_HASH);if(a.length===b.length&&crypto.timingSafeEqual(a,b)){res.setHeader('Set-Cookie',`${COOKIE}=${token()}; Path=/seohub; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);res.statusCode=303;res.setHeader('Location','/seohub/');return res.end()}res.statusCode=401;res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(loginPage('Incorrect password.'))}if(sub==='logout'){res.setHeader('Set-Cookie',`${COOKIE}=; Path=/seohub; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);res.statusCode=303;res.setHeader('Location','/seohub/');return res.end()}if(!authed(req)){res.statusCode=401;res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(loginPage())}if(sub==='api/audit')return audit(req,res);if(sub==='api/workflow')return workflowApi(req,res);if(!sub)sub='index.html';const file=path.normalize(path.join(ROOT,sub));if(!file.startsWith(ROOT)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.statusCode=404;return res.end('Not found')}res.setHeader('Content-Type',TYPES[path.extname(file)]||'application/octet-stream');return fs.createReadStream(file).pipe(res)};
