import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecurringErrorPatterns, eligibleAIRecords, learnerCriterionSummary } from '../web/error-patterns.mjs';

function rec({id,essay,taskType='task2',source='ai',status='ai-formative',wordCount,issues=[],criteria=[],at='2026-10-14T10:00:00.000Z'}){
 return {id,source,taskId:taskType==='task2'?'task2-opinion':'task1-line',taskType,taskTitle:taskType==='task2'?'Task 2':'Task 1',at,essay,report:{status,taskType,wordCount:wordCount??essay.split(/\s+/).length,issues,criteria}};
}
const longEssayA=('A clear topic sentence supports the argument with a relevant reason. ').repeat(14);
const longEssayB=('Another response explains its position and develops examples in enough detail. ').repeat(13);

test('recurring patterns count distinct essays once, not duplicate issues inside one essay',()=>{
 const first=rec({id:'a',essay:longEssayA,issues:[
  {category:'grammar',criterion:'grammar',severity:'high',title:'Verb control',suggestedFix:'Review tense choices.'},
  {category:'grammar',criterion:'grammar',severity:'medium',title:'Verb control repeated'}
 ]});
 const second=rec({id:'b',essay:longEssayB,at:'2026-10-14T11:00:00.000Z',issues:[
  {category:'grammar',criterion:'grammar',severity:'low',title:'Verb agreement'}
 ]});
 const result=buildRecurringErrorPatterns([first,second]);
 assert.equal(result.eligibleAssessmentCount,2);
 assert.equal(result.patterns.length,1);
 assert.equal(result.patterns[0].assessmentCount,2);
 assert.equal(result.patterns[0].severity,'high');
 assert.equal(result.patterns[0].latestTaskTitle,'Task 2');
});

test('duplicate exact essay submissions do not count as independent recurrence',()=>{
 const a=rec({id:'a',essay:longEssayA,issues:[{category:'lexical',criterion:'lexical',severity:'medium'}]});
 const b=rec({id:'b',essay:longEssayA.replace(/\s+/g,'  '),issues:[{category:'lexical',criterion:'lexical',severity:'high'}]});
 assert.equal(buildRecurringErrorPatterns([a,b]).patterns.length,0);
});

test('Task 1 Task Response legacy category is normalized to Task Achievement in recurrence summaries',()=>{
 const a=rec({id:'a',essay:longEssayA,taskType:'task1-academic',issues:[{category:'task-response',criterion:'taskResponse',severity:'high'}]});
 const b=rec({id:'b',essay:longEssayB,taskType:'task1-academic',issues:[{category:'task-achievement',criterion:'taskResponse',severity:'medium'}]});
 const pattern=buildRecurringErrorPatterns([a,b]).patterns[0];
 assert.equal(pattern.category,'task-achievement');
 assert.equal(pattern.criterion,'taskAchievement');
 assert.equal(pattern.categoryLabel,'Task Achievement');
});

test('local preflight, local fallback, failed AI and short essays cannot influence recurring patterns',()=>{
 const valid=rec({id:'a',essay:longEssayA,issues:[{category:'grammar',criterion:'grammar'}]});
 const ignored=[
  rec({id:'local',essay:longEssayB,source:'local',issues:[{category:'grammar',criterion:'grammar'}]}),
  rec({id:'fallback',essay:longEssayB,source:'local-fallback',issues:[{category:'grammar',criterion:'grammar'}]}),
  rec({id:'failed',essay:longEssayB,status:'error',issues:[{category:'grammar',criterion:'grammar'}]}),
  rec({id:'short',essay:'short response here with only a few words',wordCount:8,issues:[{category:'grammar',criterion:'grammar'}]})
 ];
 assert.equal(eligibleAIRecords([valid,...ignored]).length,1);
 assert.equal(buildRecurringErrorPatterns([valid,...ignored]).patterns.length,0);
});

test('criterion summary separates Task Achievement and Task Response and validates half-band scores',()=>{
 const a=rec({id:'a',essay:longEssayA,taskType:'task1-academic',criteria:[
  {id:'taskResponse',score:6.5},{id:'coherence',score:7.3},{id:'lexical',score:6}
 ]});
 const b=rec({id:'b',essay:longEssayB,taskType:'task2',criteria:[
  {id:'taskResponse',score:7},{id:'coherence',score:6},{id:'grammar',score:5.5}
 ]});
 const summary=learnerCriterionSummary([a,b]);
 assert.equal(summary.find(x=>x.id==='taskAchievement').mean,6.5);
 assert.equal(summary.find(x=>x.id==='taskResponse').mean,7);
 assert.equal(summary.find(x=>x.id==='coherence').count,1);
 assert.equal(summary.find(x=>x.id==='grammar').mean,5.5);
});
