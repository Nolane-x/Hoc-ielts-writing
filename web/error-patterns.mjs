const SEVERITY_RANK={critical:0,high:1,medium:2,low:3};
const CATEGORIES={
 'task-achievement':'Task Achievement',
 'task-response':'Task Response',
 grammar:'Ngữ pháp',
 lexical:'Từ vựng',
 coherence:'Mạch lạc',
 'data-accuracy':'Độ chính xác dữ liệu',
 register:'Văn phong',
 other:'Khác'
};
const CRITERIA={
 taskAchievement:'Task Achievement',
 taskResponse:'Task Response',
 grammar:'Ngữ pháp',
 lexical:'Từ vựng',
 coherence:'Mạch lạc',
 other:'Khác'
};
const PRACTICE={
 'task-achievement':{taskId:'task1-line',action:'Lập checklist tất cả yêu cầu của Task 1, rồi tự kiểm tra overview/ý chính hoặc từng bullet thư.'},
 'task-response':{taskId:'task2-opinion',action:'Tách đề thành từng phần; đối chiếu mỗi luận điểm với lý do và bằng chứng hỗ trợ.'},
 coherence:{taskId:'task2-discussion',action:'Viết chức năng của từng đoạn và kiểm tra mạch ý trước khi thêm từ nối.'},
 lexical:{taskId:'task2-online-learning',action:'Ghi lại collocation chưa tự nhiên và tự tạo ví dụ mới trước khi đổi sang từ đồng nghĩa.'},
 grammar:{taskId:'task1-process',action:'Rà một nhóm lỗi cụ thể trong các câu mới; chỉ tăng độ phức tạp khi kiểm soát chính xác.'},
 'data-accuracy':{taskId:'task1-table',action:'Đối chiếu số liệu, đơn vị, năm và chiều hướng với dữ kiện đề cho; không tự thêm con số.'},
 register:{taskId:'task1-formal-letter',action:'Xác định người nhận và mục đích thư, rồi rà mức độ trang trọng từ đầu đến cuối.'},
 other:{taskId:'task2-opinion',action:'So sánh nhận xét cụ thể giữa các bài và chỉ chọn một điểm có thể kiểm tra được để luyện.'}
};

function words(text){
 return String(text||'').trim().match(/\b[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu)?.length||0;
}
function normalizeEssay(text){
 return String(text||'').toLocaleLowerCase().replace(/\s+/g,' ').trim();
}
function validBand(value){
 if(value===null||value===undefined||value==='')return false;
 const n=Number(value);
 return Number.isFinite(n)&&n>=0&&n<=9&&Math.abs(n*2-Math.round(n*2))<1e-9;
}
function mapCriterion(record,item){
 const taskType=record.report?.taskType||record.taskType;
 const rawId=item?.id??item?.criterion;
 if(rawId==='taskResponse'&&taskType!=='task2')return 'taskAchievement';
 return ['taskAchievement','taskResponse','coherence','lexical','grammar'].includes(rawId)?rawId:'other';
}
function mapCategory(record,item){
 let category=Object.hasOwn(CATEGORIES,item?.category)?item.category:'other';
 const taskType=record.report?.taskType||record.taskType;
 if(taskType!=='task2'&&category==='task-response')category='task-achievement';
 return category;
}

export function eligibleAIRecords(history){
 return (Array.isArray(history)?history:[])
  .filter(record=>record&&record.source==='ai'&&record.report?.status==='ai-formative'&&
    typeof record.essay==='string'&&words(record.essay)>=80&&
    Number(record.report.wordCount??words(record.essay))>=80)
  .slice(0,30);
}

export function buildRecurringErrorPatterns(history){
 const records=eligibleAIRecords(history);
 const groups=new Map();
 for(const record of records){
  const essayKey=normalizeEssay(record.essay);
  if(!essayKey)continue;
  const issues=Array.isArray(record.report.issues)?record.report.issues:[];
  const seenInEssay=new Set();
  for(const issue of issues){
   if(!issue||typeof issue!=='object')continue;
   const category=mapCategory(record,issue);
   const criterion=mapCriterion(record,issue);
   const key=category+'|'+criterion;
   if(seenInEssay.has(key))continue;
   seenInEssay.add(key);
   let group=groups.get(key);
   if(!group){
    group={id:key,category,categoryLabel:CATEGORIES[category],criterion,criterionLabel:CRITERIA[criterion]||'Khác',essays:new Map(),severity:'low',examples:[]};
    groups.set(key,group);
   }
   if(!group.essays.has(essayKey)){
    const sample={
     recordId:typeof record.id==='string'?record.id:'',
     at:typeof record.at==='string'?record.at:'',
     taskTitle:typeof record.taskTitle==='string'?record.taskTitle:'Bài viết',
     taskType:record.report.taskType||record.taskType||'task2',
     title:typeof issue.title==='string'?issue.title.slice(0,140):'Nhóm lỗi được ghi nhận',
     explanation:typeof issue.explanation==='string'?issue.explanation.slice(0,500):'',
     suggestedFix:typeof issue.suggestedFix==='string'?issue.suggestedFix.slice(0,400):'',
     severity:Object.hasOwn(SEVERITY_RANK,issue.severity)?issue.severity:'medium',
     resolved:issue.userMarkedResolved===true
    };
    group.essays.set(essayKey,sample);
    group.examples.push(sample);
   }
   if(SEVERITY_RANK[issue.severity]!==undefined&&SEVERITY_RANK[issue.severity]<SEVERITY_RANK[group.severity])group.severity=issue.severity;
  }
 }
 const patterns=[...groups.values()]
  .map(group=>{
   const examples=[...group.essays.values()].sort((a,b)=>(Date.parse(b.at)||0)-(Date.parse(a.at)||0));
   const practice=PRACTICE[group.category]||PRACTICE.other;
   return {
    id:group.id,category:group.category,categoryLabel:group.categoryLabel,criterion:group.criterion,criterionLabel:group.criterionLabel,
    assessmentCount:examples.length,severity:group.severity,firstSeenAt:examples.at(-1)?.at||'',lastSeenAt:examples[0]?.at||'',
    latestTaskTitle:examples[0]?.taskTitle||'',latestTitle:examples[0]?.title||'',latestExplanation:examples[0]?.explanation||'',
    suggestedAction:examples[0]?.suggestedFix||practice.action,practiceTaskId:practice.taskId,
    examples:examples.slice(0,3).map(({recordId,at,taskTitle,title,resolved})=>({recordId,at,taskTitle,title,resolved}))
   };
  })
  .filter(group=>group.assessmentCount>=2)
  .sort((a,b)=>b.assessmentCount-a.assessmentCount||
    SEVERITY_RANK[a.severity]-SEVERITY_RANK[b.severity]||
    (Date.parse(b.lastSeenAt)||0)-(Date.parse(a.lastSeenAt)||0));
 return {
  eligibleAssessmentCount:records.length,
  patterns,
  basis:records.length<2
    ?'Cần ít nhất hai bài AI đủ dài trước khi WMR có thể nhận diện nhóm lỗi lặp lại.'
    :'Đếm các nhóm lỗi xuất hiện trong nhiều bài khác nhau; mỗi bản essay chỉ tính một lần cho mỗi nhóm. Đây là tín hiệu học tập, không phải kết luận chắc chắn.'
 };
}

export function learnerCriterionSummary(history){
 const records=eligibleAIRecords(history);
 const ids=['taskAchievement','taskResponse','coherence','lexical','grammar'];
 return ids.map(id=>{
  const values=[];
  for(const record of records){
   const items=Array.isArray(record.report.criteria)?record.report.criteria:[];
   for(const item of items)if(mapCriterion(record,item)===id&&validBand(item?.score))values.push(Number(item.score));
  }
  return {id,count:values.length,mean:values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null};
 });
}
