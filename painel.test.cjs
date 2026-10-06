const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function run(data){
 const nodes={};
 function el(){return {textContent:'',innerHTML:'',children:[],style:{setProperty(){}},classList:{add(){},remove(){}},setAttribute(){},appendChild(c){this.children.push(c)}};}
 const ctx={document:{getElementById(id){return nodes[id]??=el()},createElement:el,body:el()},window:{},setTimeout(){},clearTimeout(){},setInterval(){}};
 vm.runInNewContext(fs.readFileSync(__dirname+'/index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
 ctx.window.migracaoCB_1(data);return nodes;
}
function valid(){return {schemaVersion:2,timeZone:'America/Sao_Paulo',geradoEm:new Date().toISOString(),total:5,counts:{'Não Migrado':1,'Selecionado - Não Iniciado':1,'Fase 1':1,'Fase 2':1,'Em Andamento':0,'Concluído':1},quality:{unclassified:0,missingCompletionDate:1},byDay:{}};}
test('exibe dados válidos e cinco etapas',()=>{const n=run(valid());assert.equal(n.heroPct.textContent,'20,0%');assert.equal(n.flowTrack.children.length,5)});
for(const [name,change] of [['versão antiga',d=>delete d.schemaVersion],['fase ausente',d=>delete d.counts['Fase 1']],['total divergente',d=>d.total=6],['negativo',d=>d.counts['Fase 1']=-1],['datas divergentes',d=>d.byDay={'2026-09-01':2}]]){
 test('rejeita '+name,()=>{const d=valid();change(d);const n=run(d);assert.notEqual(n.liveLabel.textContent,'ao vivo');assert.equal(n.heroPct,undefined)});
}
test('exibe pendências separadamente',()=>{const d=valid();d.quality.unclassified=2;d.total=7;const n=run(d);assert.match(n.qualityNotice.textContent,/2/)});
test('monta as oito ondas do cronograma de virada',()=>{const d=valid();d.byDay={'2026-10-01':1};d.quality.missingCompletionDate=0;const n=run(d);assert.equal(n.planRows.children.length,8);assert.match(n.planPrevistoSub.textContent,/meta total 573/)});
