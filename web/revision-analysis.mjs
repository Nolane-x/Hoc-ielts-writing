import { countWords, getCriterionDefinitions } from './assessment.mjs';
export function buildRevisionComparison(currentRecord, history) {
 if(!currentRecord||currentRecord.source!=='ai'||currentRecord.report?.status!=='ai-formative'||typeof currentRecord.essay!=='string')return null;
 const when=Date.parse(currentRecord.at||'');if(!Number.isFinite(when))return null;
 const previous=(Array.isArray(history)?history:[]).filter(r=>r&&r.id!==currentRecord.id&&r.source==='ai'&&r.taskId===currentRecord.taskId&&r.taskType===currentRecord.taskType&&r.taskPrompt===currentRecord.taskPrompt&&r.report?.status==='ai-formative'&&typeof r.essay==='string'&&r.essay!==currentRecord.essay&&Number.isFinite(Date.parse(r.at||''))&&Date.parse(r.at)<when).sort((a,b)=>Date.parse(b.at)-Date.parse(a.at))[0];
 if(!previous)return null;
 const labels=new Map(getCriterionDefinitions(currentRecord.taskType).map(x=>[x.id,x.title]));
 const before=new Map((previous.report.criteria||[]).map(x=>[x?.id,x]));
 const after=new Map((currentRecord.report.criteria||[]).map(x=>[x?.id,x]));
 const criteria=[...labels].map(([id,label])=>{const a=before.get(id)?.score,b=after.get(id)?.score;return Number.isFinite(a)&&Number.isFinite(b)?{id,label,before:a,after:b,delta:Math.round((b-a)*10)/10}:null;}).filter(Boolean);
 const oldBand=Number.isFinite(previous.report.estimatedTaskBand)?previous.report.estimatedTaskBand:null;
 const newBand=Number.isFinite(currentRecord.report.estimatedTaskBand)?currentRecord.report.estimatedTaskBand:null;
 const oldIssues=Array.isArray(previous.report.issues)?previous.report.issues.length:0,newIssues=Array.isArray(currentRecord.report.issues)?currentRecord.report.issues.length:0;
 const oldWords=countWords(previous.essay),newWords=countWords(currentRecord.essay);
 return {previousAt:previous.at,currentAt:currentRecord.at,previousBand:oldBand,currentBand:newBand,bandDelta:oldBand!==null&&newBand!==null?Math.round((newBand-oldBand)*10)/10:null,previousWords:oldWords,currentWords:newWords,wordDelta:newWords-oldWords,issueCountBefore:oldIssues,issueCountAfter:newIssues,issueDelta:newIssues-oldIssues,criteria};
}
