/* Vasilwwq Merge - engine */
const SAVE_KEY='vasilwwq_merge_v3';
const COLS=6,ROWS=8,EV_COLS=5,EV_ROWS=7;
const EN_CAP=150,EN_SEC=60,STORAGE_SLOTS=8,MAXL=10;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const rnd=n=>Math.floor(Math.random()*n), pick=a=>a[rnd(a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let S=null, lang=localStorage.getItem('vm_lang')||'ru';
const T=k=>{const v=I18N[lang][k];return v===undefined?k:v};
const nameOf=(chain,l)=>{const c=CHAIN_BY_ID[chain];return c?c.items[l-1][lang==='ru'?0:1]:''};
const itemImg=(chain,l)=>'assets/items/'+chain+'_'+l+'.webp';
const valOf=(chain,l)=>Math.round(CHAIN_BY_ID[chain].base*Math.pow(1.95,l-1));
const sellPrice=(chain,l)=>Math.max(5,Math.round(valOf(chain,l)*0.4));
const xpNeed=lv=>60+lv*55;
const fmt=n=>n>=1000000?(n/1000000).toFixed(1)+'M':n>=10000?Math.round(n/1000)+'k':String(n);
const now=()=>Date.now();

/* ---------- state ---------- */
function emptyBoard(cols,rows){const a=[];for(let i=0;i<cols*rows;i++)a.push({type:'empty'});return a}
function newGame(){
 S={v:3,coins:800,gems:12,energy:100,enAt:now(),level:1,xp:0,season:0,outfit:'stef_autumn',
  board:emptyBoard(COLS,ROWS),storage:[],orders:[],discovered:{},
  quests:{date:'',list:[]},stats:{merges:0,orders:0,taps:0,discovers:0,sells:0,spend:0},
  chapter:0,scene:0,flags:[],map:['apart'],opened:0,loc:'apart',
  ev:{active:false,pts:0,until:0,claimed:[],board:emptyBoard(EV_COLS,EV_ROWS)},
  music:true,sfx:true,hints:{}};
 // Lock the bottom two rows and leave a few dirty cells to clean.
 for(let i=(ROWS-2)*COLS;i<COLS*ROWS;i++)S.board[i]={type:'locked'};
 [15,23,31].forEach(i=>{if(S.board[i])S.board[i]={type:'dirty',n:2}});
 placeGen(0,17);placeGen(1,25);
 spawnRandomStart();
 fillOrders();ensureQuests();
}
function placeGen(gid,idx){S.board[idx]={type:'gen',gid:gid,glvl:1}}
function spawnRandomStart(){
 const f=freeCells(S.board);
 for(let i=0;i<6 && f.length;i++){
  const idx=f.splice(rnd(f.length),1)[0];
  const ch=pick(['clothing','makeup']);
  S.board[idx]={type:'item',chain:ch,lvl:1+rnd(2)};
  discover(S.board[idx].chain,S.board[idx].lvl,true);
 }
}
function freeCells(b){const r=[];b.forEach((c,i)=>{if(c.type==='empty')r.push(i)});return r}
function migrateBoardLayout(B){
 if(!Array.isArray(B)||B.length===COLS*ROWS)return B;
 const oldCols=Math.floor(B.length/ROWS),out=emptyBoard(COLS,ROWS),overflow=[];
 B.forEach((c,i)=>{
  const row=Math.floor(i/oldCols),col=i%oldCols;
  if(row>=ROWS)return;
  if(col<COLS)out[row*COLS+col]=c;
  else if(c&&['item','gen','dirty'].indexOf(c.type)>=0)overflow.push(c);
 });
 overflow.forEach(c=>{const i=out.findIndex(x=>x.type==='empty');if(i>=0)out[i]=c});
 return out;
}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}
function loadSave(){
 try{const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;const d=JSON.parse(raw);if(!d||d.v!==3)return false;S=d;
  if(!S.ev)S.ev={active:false,pts:0,until:0,claimed:[],board:emptyBoard(EV_COLS,EV_ROWS)};
  if(!S.hints)S.hints={};if(!S.loc)S.loc='apart';if(S.mapEv===undefined)S.mapEv=0;if(!LOCS.find(x=>x.id===S.loc))S.loc='apart';if(!S.outfit||!WARDROBE.some(x=>x.id===S.outfit))S.outfit='stef_autumn';S.map=S.map.filter(id=>MAP_SPOTS.find(x=>x.id===id));
  S.board=migrateBoardLayout(S.board);
  // Repair old or invalid generator ids before rendering.
  [S.board,S.ev.board].forEach(B=>{if(!B)return;B.forEach(c=>{if(c.type==='gen'&&!GENS[c.gid]&&c.gid!==100){c.gid=0;c.glvl=1}})});
  fixOrderWho();return true}catch(e){return false}
}
function offlineEnergy(){
 const el=Math.floor((now()-(S.enAt||now()))/1000/EN_SEC);
 if(el>0){const add=Math.min(el,EN_CAP-S.energy);if(add>0)S.energy+=add;S.enAt=now()-((now()-S.enAt)%(EN_SEC*1000));
  if(add>0)toast('+'+add,'assets/ui/energy.webp')}
}

/* ---------- audio ---------- */
const Audio_={ctx:null,musicOn:true,timer:null,
 init(){if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}} if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});},
 beep(f,d,type,vol){if(!S||!S.sfx||!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type=type||'sine';o.frequency.value=f;g.gain.value=vol||0.05;o.connect(g);g.connect(this.ctx.destination);
  o.start();g.gain.exponentialRampToValueAtTime(0.0001,this.ctx.currentTime+(d||0.15));o.stop(this.ctx.currentTime+(d||0.15))},
 merge(){this.beep(660,0.12,'triangle',0.06);setTimeout(()=>this.beep(880,0.14,'triangle',0.05),70)},
 tap(){this.beep(430,0.07,'sine',0.04)},
 coin(){this.beep(980,0.09,'square',0.03);setTimeout(()=>this.beep(1320,0.12,'square',0.025),60)},
 bad(){this.beep(180,0.16,'sawtooth',0.04)},
 win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.beep(f,0.2,'triangle',0.05),i*110))},
 music(){
  if(this.timer){clearInterval(this.timer);this.timer=null}
  if(!S||!S.music||!this.ctx)return;
  const notes=[392,494,587,494,440,523,659,523];let i=0;
  this.timer=setInterval(()=>{if(!S.music)return;const f=notes[i%notes.length];i++;
   const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=f;
   g.gain.value=0.018;o.connect(g);g.connect(this.ctx.destination);o.start();
   g.gain.exponentialRampToValueAtTime(0.0001,this.ctx.currentTime+0.55);o.stop(this.ctx.currentTime+0.6)},640)}
};

/* ---------- fx ---------- */
function toast(text,img){
 const box=$('#toast');const d=document.createElement('div');d.className='toastItem';
 d.innerHTML=(img?'<img src="'+img+'">':'')+'<span>'+text+'</span>';box.appendChild(d);
 setTimeout(()=>{d.classList.add('out')},1400);setTimeout(()=>d.remove(),2100);
}
function floatText(x,y,text){
 const d=document.createElement('div');d.className='floatTxt';d.style.left=x+'px';d.style.top=y+'px';d.textContent=text;
 $('#fx').appendChild(d);setTimeout(()=>d.remove(),1000);
}
function sparkAt(x,y,n){
 for(let i=0;i<(n||10);i++){const s=document.createElement('div');s.className='spark';
  s.style.left=x+'px';s.style.top=y+'px';
  s.style.setProperty('--dx',(rnd(90)-45)+'px');s.style.setProperty('--dy',(rnd(90)-55)+'px');
  $('#fx').appendChild(s);setTimeout(()=>s.remove(),700)}
}
function confetti(){
 const cols=['#ff5fa2','#ffc54d','#8fd6ff','#b6ff9e','#ff9ec9'];
 for(let i=0;i<70;i++){const c=document.createElement('div');c.className='confetti';
  c.style.left=rnd(100)+'vw';c.style.background=pick(cols);c.style.animationDelay=(rnd(12)/10)+'s';
  $('#fx').appendChild(c);setTimeout(()=>c.remove(),4200)}
}

/* ---------- economy ---------- */
function addCoins(n){S.coins+=n;Audio_.coin()}
function addGems(n){S.gems+=n}
function addXp(n){
 S.xp+=n;let up=false;
 while(S.xp>=xpNeed(S.level)){S.xp-=xpNeed(S.level);S.level++;up=true;levelUpPopup(S.level)}
 if(up){S.season=Math.floor((S.level-1)/4)%4;document.body.dataset.season=S.season}
}
function useEnergy(n){
 if(S.energy<n){toast(T('noEnergy'),'assets/ui/energy.webp');Audio_.bad();return false}
 S.energy-=n;S.stats.spend+=n;bumpQuest('spend',n);return true;
}

/* ---------- board ---------- */
let EVENT_MODE=false;
function curBoard(){return EVENT_MODE?S.ev.board:S.board}
function curCols(){return EVENT_MODE?EV_COLS:COLS}
function discover(chain,l,silent){
 const d=S.discovered[chain]||0;
 if(l>d){S.discovered[chain]=l;S.stats.discovers++;bumpQuest('discover',1);
  if(!silent){toast(T('newItem')+' '+nameOf(chain,l),itemImg(chain,l));}}
}
function addItem(chain,lvl,bubble){
 const b=curBoard(),f=freeCells(b);
 if(!f.length){toast(T('noSpace'));return -1}
 const idx=f[rnd(f.length)];
 b[idx]={type:'item',chain:chain,lvl:lvl};
 if(bubble)b[idx].bub=now()+45000;
 discover(chain,lvl);
 return idx;
}
function mergeAt(a,b){
 const B=curBoard(),x=B[a],y=B[b];
 if(!x||!y||x.type!=='item'||y.type!=='item')return false;
 if(x.chain!==y.chain||x.lvl!==y.lvl||x.lvl>=MAXL)return false;
 B[b]={type:'item',chain:y.chain,lvl:y.lvl+1};
 B[a]={type:'empty'};
 S.stats.merges++;bumpQuest('merge',1);
 discover(y.chain,y.lvl+1);
 Audio_.merge();
 if(EVENT_MODE){S.ev.pts+=y.lvl+1;}
 if(Math.random()<0.22){
  const extra=Math.max(1,y.lvl-1);
  const i=addItem(y.chain,Math.min(MAXL,extra),true);
 }
 return true;
}
function mergeGens(a,b){
 const B=curBoard(),x=B[a],y=B[b];
 if(x.type!=='gen'||y.type!=='gen')return false;
 if(x.gid!==y.gid||x.glvl!==y.glvl||x.glvl>=5)return false;
 const nextLevel=y.glvl+1;
 B[b]={type:'gen',gid:y.gid,glvl:nextLevel,created:!!(x.created||y.created)};B[a]={type:'empty'};
 Audio_.merge();toast('Lv '+(y.glvl+1),'assets/ui/up.webp');
 // At level 3 a generator creates a second generator as a guaranteed bonus.
 if(!EVENT_MODE&&nextLevel===GEN_SPAWN_LEVEL)spawnBonusGenerator(y.gid);
 return true;
}
function tryMove(from,to){
 const B=curBoard();
 if(from===to)return false;
 const a=B[from],b=B[to];
 if(!a||a.type==='empty'||a.type==='locked'||a.type==='dirty')return false;
 if(b.type==='locked'||b.type==='dirty')return false;
 if(b.type==='empty'){B[to]=a;B[from]={type:'empty'};return true}
 if(a.type==='item'&&b.type==='item')return mergeAt(from,to);
 if(a.type==='gen'&&b.type==='gen')return mergeGens(from,to);
 const t=B[to];B[to]=a;B[from]=t;return true;
}
function afterChange(){fillOrders();save();renderAll()}

/* ---------- generators ---------- */
const GEN_SPAWN_LEVEL=3;
function genOutput(g,glvl){
 const maxStart=Math.min(4,1+Math.floor(glvl/2));
 const chain=(g.extra&&Math.random()<0.25)?g.extra:g.main;
 const lvl=1+rnd(maxStart);
 return {chain:chain,lvl:lvl};
}
function spawnBonusGenerator(sourceGid){
 const B=curBoard(),free=freeCells(B);
 if(!free.length){toast(T('noSpace'));return -1}
 const candidates=GENS.filter(g=>g.id!==sourceGid&&S.level>=g.unlock);
 if(!candidates.length)return -1;
 const g=pick(candidates);
 const idx=free[rnd(free.length)];
 B[idx]={type:'gen',gid:g.id,glvl:1,created:true};
 toast((lang==='ru'?'Новый генератор: ':'New generator: ')+g[lang],'assets/gen/'+g.img+'.webp');
 return idx;
}
function tapGen(idx){
 const B=curBoard(),c=B[idx];
 const g=EVENT_MODE?EVENT_GEN:GENS[c.gid];
 if(!freeCells(B).length){toast(T('noSpace'));return}
 // Every generator tap costs exactly one energy.
 if(!useEnergy(1))return;
 const o=genOutput(g,c.glvl);
 const n=1+(c.glvl>=4&&Math.random()<0.35?1:0);
 for(let i=0;i<n;i++)addItem(o.chain,o.lvl);
 S.stats.taps++;bumpQuest('taps',1);
 Audio_.tap();
 afterChange();
}

/* ---------- orders ---------- */
function availableChains(){
 const r=[];GENS.forEach(g=>{if(S.level>=g.unlock){if(r.indexOf(g.main)<0)r.push(g.main);if(g.extra&&r.indexOf(g.extra)<0)r.push(g.extra)}});
 return r.length?r:['clothing','makeup'];
}
function makeOrder(){
 const chains=availableChains();
 const diff=rnd(3);
 const parts=1+diff+(Math.random()<0.4?1:0);
 const req=[];
 for(let i=0;i<parts;i++){
  const ch=pick(chains);
  const top=Math.max(2,Math.min(MAXL-1,(S.discovered[ch]||2)));
  const lvl=clamp(2+rnd(Math.max(1,top-1)),1,MAXL);
  const ex=req.find(r=>r.chain===ch&&r.lvl===lvl);
  if(ex)ex.n++;else req.push({chain:ch,lvl:lvl,n:1+(Math.random()<0.25?1:0)});
 }
 let total=0;req.forEach(r=>total+=valOf(r.chain,r.lvl)*r.n);
 const line=pick(ORDER_LINES);
 return {id:'o'+now()+rnd(9999),who:freeNpc(),
  lineRu:line[0],lineEn:line[1],req:req,
  coins:Math.round(total*1.35+40),xp:Math.round(total/9+8),gems:Math.random()<0.18?1:0};
}
function freeNpc(){
 const used=S.orders.map(o=>o.who);
 const free=NPCS.filter(n=>used.indexOf(n.id)<0);
 return (free.length?pick(free):pick(NPCS)).id;
}
function fixOrderWho(){
 if(!S.orders)return;
 const ids=NPCS.map(n=>n.id);const used=[];
 S.orders.forEach(o=>{
  if(ids.indexOf(o.who)<0||used.indexOf(o.who)>=0){
   const free=ids.filter(i=>used.indexOf(i)<0);
   o.who=free.length?free[rnd(free.length)]:ids[rnd(ids.length)];
  }
  used.push(o.who);
 });
}
function fillOrders(){while(S.orders.length<7)S.orders.push(makeOrder())}
function countItem(chain,lvl){
 let n=0;S.board.forEach(c=>{if(c.type==='item'&&c.chain===chain&&c.lvl===lvl)n++});
 S.storage.forEach(c=>{if(c.chain===chain&&c.lvl===lvl)n++});
 return n;
}
function canDeliver(o){return o.req.every(r=>countItem(r.chain,r.lvl)>=r.n)}
function deliver(id){
 const i=S.orders.findIndex(o=>o.id===id);if(i<0)return;
 const o=S.orders[i];if(!canDeliver(o)){toast(T('orderHint'));Audio_.bad();return}
 o.req.forEach(r=>{let need=r.n;
  for(let k=0;k<S.board.length&&need>0;k++){const c=S.board[k];if(c.type==='item'&&c.chain===r.chain&&c.lvl===r.lvl){S.board[k]={type:'empty'};need--}}
  for(let k=S.storage.length-1;k>=0&&need>0;k--){const c=S.storage[k];if(c.chain===r.chain&&c.lvl===r.lvl){S.storage.splice(k,1);need--}}
 });
 addCoins(o.coins);if(o.gems)addGems(o.gems);addXp(o.xp);
 S.stats.orders++;bumpQuest('orders',1);
 if(S.ev.active)S.ev.pts+=6;
 S.orders.splice(i,1);fillOrders();
 sparkAt(window.innerWidth/2,140,16);
 toast('+'+fmt(o.coins),'assets/ui/coin.webp');
 save();renderAll();
}

/* ---------- interaction ---------- */
let sellMode=false, selIdx=-1;
function cellTap(idx){
 const B=curBoard(),c=B[idx];
 if(!c)return;
 if(c.type==='locked'){unlockCell(idx);return}
 if(c.type==='dirty'){cleanCell(idx);return}
 if(sellMode&&c.type==='item'){sellCell(idx);return}
 if(c.type==='gen'){tapGen(idx);return}
 if(c.type==='item'){
  if(c.bub){delete c.bub;Audio_.tap();afterChange();return}
  toast(nameOf(c.chain,c.lvl)+' · Lv'+c.lvl,itemImg(c.chain,c.lvl));
 }
}
function unlockCell(idx){
 if(EVENT_MODE)return;
 const price=400+S.opened*30;
 if(S.coins<price){toast(T('notEnough')+' ('+fmt(price)+')','assets/ui/coin.webp');Audio_.bad();return}
 S.coins-=price;S.opened++;S.board[idx]={type:'empty'};
 Audio_.win();sparkAt(window.innerWidth/2,window.innerHeight/2,14);
 afterChange();
}
function cleanCell(idx){
 const B=curBoard(),c=B[idx];
 if(!useEnergy(2))return;
 c.n--;
 if(c.n<=0){B[idx]={type:'empty'};addXp(6);toast('+6 XP')}
 afterChange();
}
function sellCell(idx){
 const B=curBoard(),c=B[idx];
 if(c.type!=='item')return;
 const p=sellPrice(c.chain,c.lvl);
 B[idx]={type:'empty'};addCoins(p);S.stats.sells++;bumpQuest('sell',1);
 toast(T('sold')+' +'+fmt(p),'assets/ui/coin.webp');
 afterChange();
}
function toStorage(idx){
 const B=curBoard(),c=B[idx];
 if(EVENT_MODE)return;
 if(c.type!=='item'){return}
 if(S.storage.length>=STORAGE_SLOTS){toast(T('storageFull'));Audio_.bad();return}
 S.storage.push({chain:c.chain,lvl:c.lvl});B[idx]={type:'empty'};
 Audio_.tap();afterChange();
}
function fromStorage(i){
 const it=S.storage[i];if(!it)return;
 const f=freeCells(S.board);
 if(!f.length){toast(T('noSpace'));Audio_.bad();return}
 S.board[f[rnd(f.length)]]={type:'item',chain:it.chain,lvl:it.lvl};
 S.storage.splice(i,1);Audio_.tap();afterChange();
}

/* ---------- quests ---------- */
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function ensureQuests(){
 if(S.quests.date===todayKey()&&S.quests.list.length)return;
 const pool=[...QUEST_POOL].sort(()=>Math.random()-0.5).slice(0,3);
 S.quests={date:todayKey(),list:pool.map(q=>{
  const tier=clamp(Math.floor(S.level/6),0,2);
  return {id:q.id,target:q.target[tier],prog:0,claimed:false}
 })};
}
function bumpQuest(id,n){
 if(!S.quests||!S.quests.list)return;
 const q=S.quests.list.find(x=>x.id===id);
 if(q&&!q.claimed){q.prog=Math.min(q.target,q.prog+n);renderRail()}
}
function claimQuest(id){
 const q=S.quests.list.find(x=>x.id===id);if(!q||q.claimed||q.prog<q.target)return;
 const def=QUEST_POOL.find(x=>x.id===id);
 q.claimed=true;
 addCoins(def.reward.coins);if(def.reward.gems)addGems(def.reward.gems);addXp(def.reward.xp);
 Audio_.win();confetti();
 const rw=[{img:'assets/ui/coin.webp',t:'+'+fmt(def.reward.coins)}];
 if(def.reward.gems)rw.push({img:'assets/ui/gem.webp',t:'+'+def.reward.gems});
 rw.push({img:'assets/ui/star.webp',t:'+'+def.reward.xp+' XP'});
 showRewards(T('reward'),rw);
 save();renderAll();
}

/* ---------- chests ---------- */
function openChest(def){
 const rw=[];
 const chains=availableChains();
 for(let i=0;i<def.count;i++){
  const ch=pick(chains);
  const lvl=clamp(def.lvl[0]+rnd(def.lvl[1]-def.lvl[0]+1),1,MAXL);
  addItem(ch,lvl);
  rw.push({img:itemImg(ch,lvl),t:nameOf(ch,lvl)});
 }
 if(def.coins){addCoins(def.coins);rw.push({img:'assets/ui/coin.webp',t:'+'+fmt(def.coins)})}
 addXp(30);
 Audio_.win();confetti();
 showRewards(def.id,rw);
 save();renderAll();
}
function levelUpPopup(l){
 const coins=250*l, gems=2+Math.floor(l/4);
 S.coins+=coins;S.gems+=gems;S.energy=Math.min(EN_CAP,S.energy+25);
 const rw=[{img:'assets/ui/coin.webp',t:'+'+fmt(coins)},{img:'assets/ui/gem.webp',t:'+'+gems},{img:'assets/ui/energy.webp',t:'+25'}];
 if(l%3===0){const def=SHOP.chests[clamp(Math.floor(l/6),0,3)];setTimeout(()=>openChest(def),400)}
 if(l===6&&!S.ev.active)startEvent();
 confetti();Audio_.win();
 setTimeout(()=>showRewards(T('levelUp')+' '+l,rw),120);
}

/* ---------- render ---------- */
function renderTop(){
 $('#coinV').textContent=fmt(S.coins);
 $('#gemV').textContent=fmt(S.gems);
 $('#enV').textContent=S.energy+'/'+EN_CAP;
 $('#lvlV').textContent=S.level;
 $('#xpFill').style.width=Math.round(S.xp/xpNeed(S.level)*100)+'%';
 $('#seasonTag').textContent=T('season')[S.season];
 document.body.dataset.season=S.season;
}
const WARDROBE=[
 {id:'stef_autumn',ru:'Осенний образ',en:'Autumn look',descRu:'Тёплый повседневный образ',descEn:'Warm everyday look'},
 {id:'stef_gala',ru:'Гала-вечер',en:'Gala evening',descRu:'Сверкай на премьере',descEn:'Shine at the premiere'},
 {id:'stef_spring',ru:'Весенний образ',en:'Spring look',descRu:'Свежий образ для новых сцен',descEn:'A fresh look for new scenes'},
 {id:'stef_wedding',ru:'Свадебный образ',en:'Wedding look',descRu:'Особенный наряд для финала',descEn:'A special look for the finale'}
];
const HERO_IDS=['stef_autumn','stef_gala','stef_spring','stef_wedding'];
function heroAssetId(id){
 const base=id.replace(/_(happy|sad|surprised)$/,'');
 return HERO_IDS.indexOf(base)>=0&&S&&S.outfit?S.outfit:id;
}
function charImg(id){return 'assets/chars/'+heroAssetId(id)+'.webp'}
const EMO_SET={};
function emoImg(id,emo){
 if(!emo||emo==='base')return charImg(id);
 const base=heroAssetId(id),k=base+'_'+emo;
 if(EMO_SET[k]===false)return charImg(id);
 return 'assets/chars/'+k+'.webp';
}
function lineEmotion(txt){
 if(!txt)return 'base';
 if(/[!]{1,}$|^(Да|Yes|Ура)/.test(txt.trim()))return 'happy';
 if(/\?\s*$/.test(txt))return 'surprised';
 if(/\.\.\.|увы|прости|sorry|Не /i.test(txt))return 'sad';
 return 'base';
}
function charName(id){const c=CHARS.find(x=>x.id===id)||NPCS.find(x=>x.id===id);return c?c[lang]:''}
// A green check means the whole requested quantity is available, not just one item.
function reqReady(r){return countItem(r.chain,r.lvl)>=r.n}
function orderSig(o,ok){
 return o.id+'|'+(ok?1:0)+'|'+o.who+'|'+lang+'|'+o.req.map(r=>r.chain+r.lvl+'x'+r.n+':'+(reqReady(r)?1:0)).join(',');
}
function orderInnerHTML(o,ok){
 return '<div class="cust"><img src="'+charImg(o.who)+'"><span class="nameTag">'+charName(o.who)+'</span></div>'+
  '<div class="think">'+
  '<div class="line">'+(lang==='ru'?o.lineRu:o.lineEn)+'</div>'+
  '<div class="reqs">'+o.req.map(r=>'<div class="req"><img src="'+itemImg(r.chain,r.lvl)+'">'+(reqReady(r)?'<span class="reqNeed" aria-label="'+(lang==='ru'?'Предмет есть':'Item available')+'"><img src="assets/ui/check.webp"></span>':'')+(r.n>1?'<b>x'+r.n+'</b>':'')+'</div>').join('')+'</div>'+
  '<div class="foot"><span><img src="assets/ui/coin.webp">'+fmt(o.coins)+'</span>'+  (o.gems?'<span><img src="assets/ui/gem.webp">'+o.gems+'</span>':'')+  '<span><img src="assets/ui/star.webp">'+o.xp+'</span>'+  '<button class="btnSm'+(ok?' go':'')+'" data-deliver="'+o.id+'">'+T('deliver')+'</button></div>'+  '<i class="tail t1"></i><i class="tail t2"></i><i class="tail t3"></i></div>';
}
function renderOrders(){
 const box=$('#orders');if(!box)return;
 const have={};
 [...box.children].forEach(el=>{if(el.dataset.oid)have[el.dataset.oid]=el});
 const keep={};
 // Ready orders always move to the front, while non-ready orders keep their order.
 const displayOrders=S.orders.map((o,index)=>({o,index,ok:canDeliver(o)}))
  .sort((a,b)=>Number(b.ok)-Number(a.ok)||a.index-b.index);
 displayOrders.forEach(({o,ok},i)=>{
  const sig=orderSig(o,ok);
  let el=have[o.id];
  if(!el){
   el=document.createElement('div');
   el.dataset.oid=o.id;
   el.className='order fresh'+(ok?' ready':'');
   el.innerHTML=orderInnerHTML(o,ok);
   el.__sig=sig;
   setTimeout(()=>el.classList.remove('fresh'),900);
  }else if(el.__sig!==sig){
   el.innerHTML=orderInnerHTML(o,ok);
   el.__sig=sig;
   el.classList.toggle('ready',ok);
  }else{
   el.classList.toggle('ready',ok);
  }
  keep[o.id]=1;
  if(box.children[i]!==el)box.insertBefore(el,box.children[i]||null);
 });
 [...box.children].forEach(el=>{if(!keep[el.dataset.oid])el.remove()});
}
function tileHTML(c){
 if(c.type==='item'){
  return '<div class="tile"><img src="'+itemImg(c.chain,c.lvl)+'"><span class="lvlBadge">'+c.lvl+'</span>'+(c.bub?'<span class="bubble"></span>':'')+'</div>';
 }
 if(c.type==='gen'){
  const g=EVENT_MODE?EVENT_GEN:GENS[c.gid];
  return '<div class="tile gen"><img src="assets/gen/'+g.img+'.webp"><span class="genLvl">Lv'+c.glvl+'</span></div>';
 }
 if(c.type==='locked')return '<img class="lockIco" src="assets/ui/key.webp">';
 if(c.type==='dirty')return '<span class="dirtyN">'+c.n+'</span>';
 return '';
}
function cellSig(c){
 if(c.type==='item')return 'i|'+c.chain+'|'+c.lvl+'|'+(c.bub?1:0);
 if(c.type==='gen')return 'g|'+(EVENT_MODE?'e':c.gid)+'|'+c.glvl;
 if(c.type==='locked')return 'l';
 if(c.type==='dirty')return 'd|'+c.n;
 return '-';
}
// signature without the bubble flag: bubble popping must not restart the item animation
function cellAnimSig(c){
 if(c.type==='item')return 'i|'+c.chain+'|'+c.lvl;
 return cellSig(c);
}
function renderBoard(){
 const el=EVENT_MODE?$('#evBoard'):$('#board');
 const B=curBoard(),cols=curCols();
 el.style.setProperty('--c',cols);
 const prev=el.__sigs,prevA=el.__asigs;
 const full=!prev||prev.length!==B.length||el.children.length!==B.length;
 if(full){
  el.innerHTML=B.map((c,i)=>'<div class="cell '+(c.type==='locked'?'locked':c.type==='dirty'?'dirty':'')+(c.type==='gen'?' hot':'')+'" data-i="'+i+'">'+tileHTML(c)+'</div>').join('');
 }else{
  for(let i=0;i<B.length;i++){
   const c=B[i],sg=cellSig(c);
   if(prev[i]===sg)continue; // unchanged cell keeps its DOM, so its animation is not replayed
   const cell=el.children[i];
   cell.classList.toggle('locked',c.type==='locked');
   cell.classList.toggle('dirty',c.type==='dirty');
   cell.classList.toggle('hot',c.type==='gen');
   cell.innerHTML=tileHTML(c);
   const t=cell.querySelector('.tile');
   if(t&&prevA&&prevA[i]!==cellAnimSig(c)){
    t.classList.add('isNew');
    t.addEventListener('animationend',function(){t.classList.remove('isNew')},{once:true});
    setTimeout(function(){t.classList.remove('isNew')},400);
   }
  }
 }
 el.__sigs=B.map(cellSig);
 el.__asigs=B.map(cellAnimSig);
}
function renderStorage(){
 $('#storageCount').textContent=S.storage.length+'/'+STORAGE_SLOTS;
 const p=$('#storagePanel');
 let h='';
 for(let i=0;i<STORAGE_SLOTS;i++){
  const it=S.storage[i];
  h+='<div class="box" data-st="'+i+'">'+(it?'<img src="'+itemImg(it.chain,it.lvl)+'">':'')+'</div>';
 }
 p.innerHTML=h;
}
function renderQuests(){
 ensureQuests();
 const box=$('#questList');box.innerHTML='';
 S.quests.list.forEach(q=>{
  const def=QUEST_POOL.find(x=>x.id===q.id);
  const txt=def[lang].replace('%n',q.target);
  const done=q.prog>=q.target;
  const d=document.createElement('div');d.className='qRow'+(q.claimed?' claimed':'');
  d.innerHTML='<img class="qIco" src="assets/ui/star.webp">'+
   '<div class="qMain">'+txt+'<div class="qBar"><div class="bar" style="width:'+Math.round(q.prog/q.target*100)+'%"></div></div>'+
   '<span style="font-size:11px;opacity:.7">'+q.prog+'/'+q.target+' · '+fmt(def.reward.coins)+'<img class="ico tiny" src="assets/ui/coin.webp">'+(def.reward.gems?' '+def.reward.gems+'<img class="ico tiny" src="assets/ui/gem.webp">':'')+'</span></div>'+
   (q.claimed?'<span><img class="ico" src="assets/ui/check.webp"></span>':'<button class="btnSm'+(done?' go':'')+'" '+(done?'':'disabled')+' data-quest="'+q.id+'">'+T('collect')+'</button>');
  box.appendChild(d);
 });
}
function railFeedback(btn,e){
 try{
  if(btn.classList.contains('railBtn')){
   btn.classList.remove('press');void btn.offsetWidth;btn.classList.add('press');
   let box=btn.querySelector('.ripBox');
   if(!box){box=document.createElement('span');box.className='ripBox';btn.appendChild(box)}
   const r=document.createElement('span');r.className='rip';
   const b=btn.getBoundingClientRect();
   if(e&&e.clientX){r.style.left=(e.clientX-b.left)+'px';r.style.top=(e.clientY-b.top)+'px'}
   box.appendChild(r);setTimeout(()=>r.remove(),480);
   if(btn.classList.contains('lock')){btn.classList.remove('shake');void btn.offsetWidth;btn.classList.add('shake')}
  }
  Audio_.tap();
  if(navigator.vibrate)navigator.vibrate(btn.classList.contains('lock')?[8,40,8]:12);
 }catch(err){}
}
function renderRail_(){}
function setBdg(sel,n){
 const el=$(sel);if(!el)return;const b=el.querySelector('.bdg');if(!b)return;
 if(n){b.textContent=n;b.classList.add('on');el.classList.add('ready')}
 else{b.classList.remove('on');el.classList.remove('ready')}
}
function renderRail(){
 ensureQuests();
 const qReady=S.quests.list.filter(q=>!q.claimed&&q.prog>=q.target).length;
 setBdg('#railQuests',qReady);
 setBdg('#railStory',nextSceneAvailable()?1:0);
 const ev=$('#railEvent');
 ev.style.opacity='';
 ev.classList.toggle('lock',!S.ev.active);
 setBdg('#railEvent',S.ev.active&&S.ev.pts?0:0);
}
function renderSideArt(){
 const el=$('#sideChar');if(!el)return;
 el.src=charImg(S.outfit||'stef_autumn');
 $('#sideSub').textContent=T('season')[S.season]+' · '+T('level')+' '+S.level;
}
function fitBoard(){
 const wrap=EVENT_MODE?$('#evBoardWrap'):$('#boardWrap');
 const el=EVENT_MODE?$('#evBoard'):$('#board');
 if(!wrap||!el)return;
 const cols=curCols(),rows=EVENT_MODE?EV_ROWS:ROWS;
 const isPhone=window.matchMedia&&window.matchMedia('(max-width:520px)').matches;
 const w=wrap.clientWidth,h=wrap.clientHeight;
 const size=Math.floor(Math.min((w-(cols-1)*3)/cols,(h-(rows-1)*3)/rows));
 if(isPhone&&!EVENT_MODE&&el.id==='board'){
  // Fill the whole field with six equal-width columns and no inter-cell gaps.
  const cell=wrap.clientWidth/cols;
  el.style.setProperty('--cs',cell+'px');
  el.style.width='100%';
  el.style.height=(cell*rows)+'px';
  el.style.aspectRatio='auto';
  el.style.gridTemplateColumns=`repeat(${cols},${cell}px)`;
  el.style.gridAutoRows=cell+'px';
  el.style.gap='0px';
 }else{
  el.style.setProperty('--cs',clamp(size,12,88)+'px');
 }
}
function renderAll(){
 renderTop();renderOrders();renderBoard();renderStorage();renderRail();renderSideArt();fitBoard();applyLocBg();
 if($('#questModal').classList.contains('show'))renderQuests();
 if($('#shopModal').classList.contains('show'))renderShop();
}

/* ---------- modals ---------- */
function openModal(sel){$(sel).classList.add('show')}
function closeModal(sel){$(sel).classList.remove('show')}
function showRewards(title,list){
 $('#rewardTitle').textContent=title;
 $('#rewardBody').innerHTML=list.map(r=>'<div class="rw"><img src="'+r.img+'"><span>'+r.t+'</span></div>').join('');
 openModal('#rewardModal');
}

/* ---------- shop ---------- */
let shopTab='gems';
function renderShop(){
 const b=$('#shopBody');let h='';
 $$('#shopTabs .tab').forEach(t=>t.classList.toggle('on',t.dataset.tab===shopTab));
 if(shopTab==='wardrobe'){
  h+='<div class="wardrobeHint">'+(lang==='ru'?'Выбери образ — он будет использоваться на поле и в истории.':'Choose a look — it will be used on the board and in the story.')+'</div>'+
   '<div class="wardrobeGrid">'+WARDROBE.map(o=>{
    const selected=S.outfit===o.id;
    return '<div class="wardrobeCard'+(selected?' selected':'')+'"><img class="wardrobeHero" src="assets/chars/'+o.id+'.webp"><b>'+o[lang]+'</b><div class="cap">'+(lang==='ru'?o.descRu:o.descEn)+'</div><button class="btnSm'+(selected?' go':'')+'" data-outfit="'+o.id+'">'+(selected?(lang==='ru'?'Надето':'Equipped'):(lang==='ru'?'Надеть':'Wear'))+'</button></div>';
   }).join('')+'</div>';
 }else if(shopTab==='gems'){
  h+='<div class="grid">'+SHOP.gems.map((g,i)=>'<div class="card"><img src="assets/ui/gem.webp">'+
   (g.bonus?'<div class="bonus">'+g.bonus+'</div>':'')+'<div class="big">'+g.amount+'</div>'+
   '<button class="btnSm go" data-buygems="'+i+'">'+g.price+'</button></div>').join('')+
   '<div class="card ad"><img src="assets/ui/gift.webp"><div class="cap">'+T('adHint')+'</div>'+
   '<button class="btnSm" data-ad="gems">'+T('freeAd')+' +3<img class=\"ico\" src=\"assets/ui/gem.webp\"></button></div></div>';
 }else if(shopTab==='coins'){
  h+='<div class="grid">'+SHOP.coins.map((c,i)=>'<div class="card"><img src="assets/ui/coin.webp"><div class="big">'+fmt(c.amount)+'</div>'+
   '<button class="btnSm go" data-buy="coins:'+i+'">'+c.gems+' <img class=\"ico\" src=\"assets/ui/gem.webp\"></button></div>').join('')+
   '<div class="card ad"><img src="assets/ui/coin.webp"><div class="cap">'+T('adHint')+'</div>'+
   '<button class="btnSm" data-ad="coins">'+T('freeAd')+' +1500</button></div></div>';
 }else if(shopTab==='energy'){
  h+='<div class="grid">'+SHOP.energy.map((c,i)=>'<div class="card"><img src="assets/ui/energy.webp"><div class="big">'+c.amount+'</div>'+
   '<button class="btnSm go" data-buy="energy:'+i+'">'+c.gems+' <img class=\"ico\" src=\"assets/ui/gem.webp\"></button></div>').join('')+
   '<div class="card ad"><img src="assets/ui/energy.webp"><div class="cap">'+T('adHint')+'</div>'+
   '<button class="btnSm" data-ad="energy">'+T('freeAd')+' +40</button></div></div>';
 }else{
  h+='<div class="grid">'+SHOP.chests.map((c,i)=>'<div class="card"><img src="assets/ui/chest.webp"><div class="big">'+c.id+'</div>'+
   '<div class="cap">'+c.count+' · Lv'+c.lvl[0]+'-'+c.lvl[1]+'</div>'+
   '<button class="btnSm go" data-chest="'+i+'">'+(c.gems?c.gems+' <img class=\"ico\" src=\"assets/ui/gem.webp\">':fmt(c.coins)+' <img class=\"ico\" src=\"assets/ui/coin.webp\">')+'</button></div>').join('')+
   '<div class="card ad"><img src="assets/ui/chest.webp"><div class="cap">'+T('adHint')+'</div>'+
   '<button class="btnSm" data-ad="chest">'+T('freeAd')+'</button></div></div>';
 }
 b.innerHTML=h;
}
function equipOutfit(id){
 const outfit=WARDROBE.find(x=>x.id===id);if(!outfit)return;
 if(S.outfit===id)return;
 S.outfit=id;save();renderAll();Audio_.win();
 toast((lang==='ru'?'Образ выбран: ':'Look equipped: ')+outfit[lang]);
}
function buyGems(i){
 const g=SHOP.gems[i];addGems(g.amount);Audio_.win();confetti();
 showRewards(T('shop'),[{img:'assets/ui/gem.webp',t:'+'+g.amount}]);save();renderAll();
}
function buyWithGems(kind,i){
 const def=SHOP[kind][i];
 if(S.gems<def.gems){toast(T('notEnough'),'assets/ui/gem.webp');Audio_.bad();return}
 S.gems-=def.gems;
 if(kind==='coins'){addCoins(def.amount);showRewards(T('shop'),[{img:'assets/ui/coin.webp',t:'+'+fmt(def.amount)}])}
 else{S.energy=Math.min(EN_CAP,S.energy+def.amount);showRewards(T('shop'),[{img:'assets/ui/energy.webp',t:'+'+def.amount}])}
 Audio_.coin();save();renderAll();
}
function buyChest(i){
 const def=SHOP.chests[i];
 if(def.gems){if(S.gems<def.gems){toast(T('notEnough'),'assets/ui/gem.webp');Audio_.bad();return}S.gems-=def.gems}
 else{if(S.coins<def.coins){toast(T('notEnough'),'assets/ui/coin.webp');Audio_.bad();return}S.coins-=def.coins}
 openChest(def);
}
function adReward(kind){
 if(kind==='gems'){addGems(3);showRewards(T('freeAd'),[{img:'assets/ui/gem.webp',t:'+3'}])}
 if(kind==='coins'){addCoins(1500);showRewards(T('freeAd'),[{img:'assets/ui/coin.webp',t:'+1500'}])}
 if(kind==='energy'){S.energy=Math.min(EN_CAP,S.energy+40);showRewards(T('freeAd'),[{img:'assets/ui/energy.webp',t:'+40'}])}
 if(kind==='chest'){openChest({id:'Ad',count:3,lvl:[1,4],coins:400});return}
 Audio_.win();save();renderAll();
}

/* ---------- album ---------- */
function renderAlbum(){
 let found=0,total=0,h='';
 CHAINS.forEach(c=>{
  const d=S.discovered[c.id]||0;total+=MAXL;found+=Math.min(d,MAXL);
  h+='<div class="chainRow"><h4>'+c[lang]+' · '+Math.min(d,MAXL)+'/'+MAXL+'</h4><div class="chainItems">';
  for(let l=1;l<=MAXL;l++){
   const open=l<=d;
   h+='<div class="ci'+(open?'':' lockItem')+'"><img src="'+itemImg(c.id,l)+'"><span class="nm">'+(open?nameOf(c.id,l):'???')+'</span></div>';
  }
  h+='</div></div>';
 });
 $('#albumCount').textContent=found+'/'+total;
 $('#albumBody').innerHTML=h;
}

/* ---------- locations / travel ---------- */
function locDef(id){return LOCS.find(x=>x.id===id)||LOCS[0]}
function locName(id){const s=MAP_SPOTS.find(x=>x.id===id);return s?s[lang]:''}
function locGens(id){const l=locDef(id);const r=l.gens.filter(i=>GENS[i]&&S.level>=GENS[i].unlock);return r.length?r:[0,1]}
function applyLocBg(){
 const w=$('#boardWrap');if(!w)return;
 w.style.backgroundImage='none';
 w.style.backgroundColor='#f7eaf5';
}
function travelTo(id){
 if(S.map.indexOf(id)<0){toast(lang==='ru'?'Локация ещё закрыта':'Location is still locked');Audio_.bad();return}
 if(S.loc===id){toast(lang==='ru'?'Вы уже здесь':'You are already here');return}
 S.loc=id;
 const list=locGens(id);let i=0;
 // Generators created as level-up bonuses keep their own type when travelling.
 S.board.forEach(c=>{if(c.type==='gen'&&!c.created){c.gid=list[i%list.length];i++}});
 save();closeModal('#mapModal');
 const w=$('#boardWrap');if(w){w.classList.remove('locFade');void w.offsetWidth;w.classList.add('locFade')}
 applyLocBg();renderAll();Audio_.win();
 toast((lang==='ru'?'Вы переместились: ':'Travelled to: ')+locName(id));
}

/* ---------- map ---------- */
let MAPV={z:1,x:0,y:0,sel:null};
const MAP_MILES=[{n:4,coins:1500,gems:3},{n:8,coins:3500,gems:6},{n:13,coins:7000,gems:12},{n:19,coins:15000,gems:30}];
function mapNextSpot(){return MAP_SPOTS.filter(s=>S.map.indexOf(s.id)<0).sort((a,b)=>a.lvl-b.lvl)[0]}
function mapEvKey(){return Math.floor(Date.now()/(30*60000))}
function mapEvSpot(){
 if(!S.map.length)return null;
 const list=MAP_SPOTS.filter(x=>S.map.indexOf(x.id)>=0);
 return list[mapEvKey()%list.length];
}
function mapEvReady(){return S.mapEv!==mapEvKey()}
function mapFxHTML(){
 let h='<div class="mapFx">';
 for(let k=0;k<26;k++){
  const x=8+((k*37)%86), y=14+((k*53)%74);
  h+='<i class="twk" style="left:'+x+'%;top:'+y+'%;animation-delay:'+((k%10)*.37).toFixed(2)+'s"></i>';
 }
 h+='<i class="beam b1"></i><i class="beam b2"></i>';
 h+='<i class="cloud c1"></i><i class="cloud c2"></i>';
 h+='</div>';
 return h;
}
function mapTopHTML(openN,total){
 const pct=Math.round(openN/total*100);
 const nx=mapNextSpot();
 const mile=MAP_MILES.find(m=>openN<m.n);
 let h='<div class="mapTop">'+
  '<div class="mapTopRow"><b class="mapTitle">'+(lang==='ru'?'Город':'City')+' '+pct+'%</b>'+
  '<span class="mapCnt">'+openN+'/'+total+'</span></div>'+
  '<div class="mapProg"><i style="width:'+pct+'%"></i>';
 MAP_MILES.forEach(m=>{h+='<u class="mile'+(openN>=m.n?' on':'')+'" style="left:'+(m.n/total*100)+'%"></u>'});
 h+='</div><div class="mapSub">';
 if(mile)h+='<span>'+(lang==='ru'?'До награды: ':'Next reward: ')+(mile.n-openN)+' '+(lang==='ru'?'лок.':'spots')+' · <img src="assets/ui/coin.webp">'+mile.coins+' <img src="assets/ui/gem.webp">'+mile.gems+'</span>';
 else h+='<span>'+(lang==='ru'?'Весь город открыт!':'The whole city is yours!')+'</span>';
 if(nx)h+='<button class="mapNx goNext" data-gonext="'+nx.id+'">'+(lang==='ru'?'К цели: ':'Go to: ')+'<img class="ico" src="'+nx.img+'">'+' '+nx[lang]+' · Lv '+nx.lvl+'</button>';
 h+='</div></div>';
 return h;
}
function mapInfoHTML(){
 const s=MAP_SPOTS.find(x=>x.id===MAPV.sel);
 if(!s)return '<div class="mapHint">'+T('mapHint')+'</div>';
 const open=S.map.indexOf(s.id)>=0, can=S.level>=s.lvl;
 const gl=locDef(s.id).gens.map(i=>GENS[i]?GENS[i][lang]:'').filter(Boolean).join(' · ');
 return '<div class="infoCard">'+
  '<div class="infoTop"><span class=\"infoIc\"><img src=\"'+s.img+'\"></span><b>'+s[lang]+'</b>'+(open?'<span class="okTag"><img class="ico" src="assets/ui/check.webp"></span>':'<span class="lvTag">Lv '+s.lvl+'</span>')+'</div>'+
  '<div class="infoTxt">'+s[lang==='ru'?'ru2':'en2']+'</div>'+
  '<div class="infoGens">'+(lang==='ru'?'Генераторы: ':'Generators: ')+gl+'</div>'+
  '<div class="infoFoot">'+
   (open
    ? (S.loc===s.id?'<span class="hereTag">'+(lang==='ru'?'Вы здесь':'You are here')+'</span>':'<button class="btnSm go" data-travel="'+s.id+'">'+(lang==='ru'?'Переместиться':'Travel')+'</button>')
    : '<span class="infoRw"><img src="assets/ui/coin.webp">300</span><span class="infoRw"><img src="assets/ui/star.webp">40 XP</span>'+
      '<button class="btnSm'+(can?' go':'')+'" data-mapopen="'+s.id+'"'+(can?'':' disabled')+'>'+
      (can?(lang==='ru'?'Открыть':'Unlock'):T('locked2')+' '+s.lvl)+'</button>')+
  '</div></div>';
}
function applyMapTransform(){
 const p=$('#mapPan');if(!p)return;
 const lim=(MAPV.z-1)*50;
 MAPV.x=Math.max(-lim,Math.min(lim,MAPV.x));
 MAPV.y=Math.max(-lim,Math.min(lim,MAPV.y));
 p.style.transform='translate('+MAPV.x+'%,'+MAPV.y+'%) scale('+MAPV.z+')';
 const w=$('#mapWrap');if(w)w.classList.toggle('zoomed',MAPV.z>1.05);
}
function focusSpot(s){
 MAPV.z=2.35;
 MAPV.x=-(s.x-50)*MAPV.z;
 MAPV.y=-(s.y-50)*MAPV.z;
 applyMapTransform();
}
function mapZoom(k){
 if(k==='0'){MAPV.z=1;MAPV.x=0;MAPV.y=0}
 else MAPV.z=Math.max(1,Math.min(3.2,MAPV.z+(k==='+'?.4:-.4)));
 if(MAPV.z<=1){MAPV.z=1;MAPV.x=0;MAPV.y=0}
 applyMapTransform();Audio_.tap();
}
function bindMapPan(){
 const w=$('#mapWrap');if(!w)return;
 let drag=false,sx=0,sy=0,ox=0,oy=0,moved=0,pointerId=null;
 w.addEventListener('pointerdown',e=>{
  if(MAPV.z<=1)return;
  e.preventDefault();
  drag=true;moved=0;pointerId=e.pointerId;sx=e.clientX;sy=e.clientY;ox=MAPV.x;oy=MAPV.y;
  w.dataset.moved='0';
  if(w.setPointerCapture){try{w.setPointerCapture(e.pointerId)}catch(_){} }
  w.classList.add('grab');
  const p=$('#mapPan');if(p)p.classList.add('nosmooth');
 });
 w.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==pointerId)return;
  e.preventDefault();
  const dx=e.clientX-sx,dy=e.clientY-sy;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));
  if(moved>8)w.dataset.moved='1';
  MAPV.x=ox+dx/w.clientWidth*100;MAPV.y=oy+dy/w.clientHeight*100;applyMapTransform();
 });
 const up=e=>{
  if(!drag|| (pointerId!==null&&e.pointerId!==pointerId))return;
  e.preventDefault();
  if(moved>8)w.dataset.moved='1';
  drag=false;pointerId=null;w.classList.remove('grab');
  const p=$('#mapPan');if(p)p.classList.remove('nosmooth');
 };
 w.addEventListener('pointerup',up);w.addEventListener('pointercancel',up);
 w.addEventListener('wheel',e=>{e.preventDefault();mapZoom(e.deltaY<0?'+':'-')},{passive:false});
}
function renderMap(){
 const total=MAP_SPOTS.length, openN=S.map.length;
 let h=mapTopHTML(openN,total);
 h+='<div class="mapWrap" id="mapWrap"><div class="mapPan" id="mapPan"><img id="mapImg" src="assets/bg/map.webp">'+mapFxHTML();
 const ev=mapEvSpot(), evOn=ev&&mapEvReady();
 MAP_SPOTS.forEach((s,i)=>{
  const open=S.map.indexOf(s.id)>=0;
  const can=S.level>=s.lvl;
  const here=S.loc===s.id;
  h+='<button class="spot'+(open?' openSpot':' lockSpot')+(can&&!open?' canSpot':'')+(here?' hereSpot':'')+(MAPV.sel===s.id?' sel':'')+
   '" data-spot="'+s.id+'" style="left:'+s.x+'%;top:'+s.y+'%;animation-delay:'+(i*.07)+'s">'+
   '<span class="ring"></span>'+
   '<span class="pin">'+(open?'<em class="pic"><img src="'+s.img+'" alt=""></em><i class="shine"></i>':'<img src="assets/ui/key.webp">')+'</span>'+
   (here?'<span class="hereDot"></span>':'')+
   (evOn&&ev.id===s.id?'<span class="evIc"><img src="assets/ui/gift.webp"></span>':'')+
   (s.id==='studio'&&open?'<span class="fwIc"><img src="assets/ui/fashionweek.webp"></span>':'')+
   '<span class="lb">'+(open||can?s[lang]:'Lv '+s.lvl)+'</span></button>';
 });
 h+='</div>'+
  '<div class="mapZoom"><button data-mz="-">–</button><button data-mz="+">+</button><button data-mz="0">⟲</button></div>'+
  '<button class="mapBack" data-mz="0">'+(lang==='ru'?'← Весь город':'← Whole city')+'</button>'+
  '</div><div id="mapInfo">'+mapInfoHTML()+'</div>';
 $('#mapBody').innerHTML=h;
 applyMapTransform();bindMapPan();
}
function refreshMapInfo(){
 const box=$('#mapInfo');if(!box)return;
 box.innerHTML=mapInfoHTML();
 box.classList.remove('in');void box.offsetWidth;box.classList.add('in');
}
function mapEvClaim(){
 if(!mapEvReady())return;
 S.mapEv=mapEvKey();
 addCoins(450);addXp(25);Audio_.win();
 const el=document.querySelector('.evIc');
 if(el){const r=el.getBoundingClientRect();sparkAt(r.left+r.width/2,r.top+r.height/2,16)}
 toast(lang==='ru'?'Городской бонус: +450':'City bonus: +450');
 save();renderMap();renderTop();
}
function goNextSpot(id){
 const s=MAP_SPOTS.find(x=>x.id===id);if(!s)return;
 MAPV.sel=id;
 $$('#mapPan .spot').forEach(e=>e.classList.toggle('sel',e.dataset.spot===id));
 focusSpot(s);Audio_.tap();refreshMapInfo();
 const el=document.querySelector('.spot[data-spot="'+id+'"]');
 if(el){el.classList.remove('ping');void el.offsetWidth;el.classList.add('ping')}
}
function spotClick(id){
 const w=$('#mapWrap');
 if(w&&w.dataset.moved==='1'){w.dataset.moved='0';return}
 const s=MAP_SPOTS.find(x=>x.id===id);if(!s)return;
 const ev=mapEvSpot();
 if(ev&&ev.id===id&&mapEvReady()){mapEvClaim();return}
 MAPV.sel=id;
 $$('#mapPan .spot').forEach(e=>e.classList.toggle('sel',e.dataset.spot===id));
 focusSpot(s);
 Audio_.tap();
 refreshMapInfo();
}
function mapUnlock(id){
 const s=MAP_SPOTS.find(x=>x.id===id);if(!s)return;
 if(S.map.indexOf(id)>=0)return;
 if(S.level<s.lvl){toast(T('locked2')+' '+s.lvl);Audio_.bad();return}
 const before=S.map.length;
 S.map.push(id);addXp(40);addCoins(300);Audio_.win();confetti();
 MAP_MILES.forEach(m=>{
  if(before<m.n&&S.map.length>=m.n){
   addCoins(m.coins);S.gems+=m.gems;
   toast((lang==='ru'?'Веха города! +':'City milestone! +')+m.coins+' / +'+m.gems);
  }
 });
 const el=document.querySelector('.spot[data-spot="'+id+'"]');
 if(el){const r=el.getBoundingClientRect();sparkAt(r.left+r.width/2,r.top+r.height/2,22)}
 MAPV.sel=id;save();renderMap();renderTop();
 const el2=document.querySelector('.spot[data-spot="'+id+'"]');if(el2)el2.classList.add('justOpen');
 focusSpot(s);
 refreshMapInfo();
}

/* ---------- visual novel ---------- */
function nextSceneAvailable(){
 const ch=STORY[S.chapter];if(!ch)return false;
 if(S.level<ch.lvl)return false;
 return S.scene<ch.scenes.length;
}
function renderChapters(){
 let h='';
 STORY.forEach((ch,i)=>{
  const done=i<S.chapter, cur=i===S.chapter;
  const lock=S.level<ch.lvl;
  h+='<div class="chapterRow'+(lock?' lockRow':'')+'">'+
   '<img class="chapThumb" src="assets/bg/'+ch.scenes[0].bg+'.webp">'+
   '<div class="chapMain"><b>'+ch[lang]+'</b><br><span style="font-size:11px;opacity:.7">'+
   (lock?T('locked2')+' '+ch.lvl:(done?'<img class="ico" src="assets/ui/check.webp"> 100%':T('scene')+' '+Math.min(S.scene+1,ch.scenes.length)+'/'+ch.scenes.length))+'</span></div>'+
   (lock||done?'':'<button class="btnSm go" data-play="'+i+'">'+T('play')+'</button>')+'</div>';
 });
 $('#storyBody').innerHTML=h;
}
let VN={ch:0,sc:0,line:0,scene:null};
function startScene(ci){
 const ch=STORY[ci];if(!ch)return;
 if(S.level<ch.lvl){toast(T('locked2')+' '+ch.lvl);return}
 VN.ch=ci;VN.sc=(ci===S.chapter?S.scene:0);
 VN.scene=ch.scenes[VN.sc];if(!VN.scene)return;
 VN.line=0;
 closeModal('#storyModal');
 $('#vn').classList.add('show');
 drawScene();
}
function drawScene(){
 const sc=VN.scene;
 $('#vnBg').style.backgroundImage='url(assets/bg/'+sc.bg+'.webp)';
 $('#vnTop').textContent=STORY[VN.ch][lang]+' · '+T('scene')+' '+(VN.sc+1)+'/'+STORY[VN.ch].scenes.length;
 const pos=['l','r','l'];
 $('#vnChars').innerHTML=(sc.chars||[]).map((c,i)=>'<img class="vnChar '+(i===1?'r':'l')+'" style="'+(i===2?'left:36%;max-height:80%;z-index:-1':'')+'" src="'+charImg(c)+'" data-vc="'+c+'">').join('');
 $('#vnChoices').classList.remove('show');
 showLine();
}
function showLine(){
 const sc=VN.scene,l=sc.lines[VN.line];
 if(!l){finishScene();return}
 const sp=l[0];
 const txt=lang==='ru'?l[1]:l[2];
 $('#vnName').textContent=sp?charName(sp):'';
 $('#vnText').textContent=txt;
 const emo=lineEmotion(txt);
 $$('#vnChars .vnChar').forEach(e=>{
  const me=e.dataset.vc===sp;
  e.classList.toggle('dim',!!sp&&!me);
  e.classList.toggle('talk',me);
  if(me){
   const src=emoImg(e.dataset.vc,emo);
   if(e.getAttribute('src')!==src){
    e.onerror=function(){EMO_SET[e.dataset.vc+'_'+emo]=false;e.onerror=null;e.setAttribute('src',charImg(e.dataset.vc))};
    e.setAttribute('src',src);
   }
  }else if(e.getAttribute('src')!==charImg(e.dataset.vc)){e.setAttribute('src',charImg(e.dataset.vc))}
 });
 vnProgress();
 Audio_.tap();
}
function vnProgress(){
 const bar=$('#vnBar');if(!bar)return;
 const sc=VN.scene;if(!sc)return;
 const total=sc.lines.length+(sc.choice?1:0);
 const pct=Math.min(100,Math.round((VN.line+1)/total*100));
 bar.firstElementChild.style.width=pct+'%';
}
let VNAUTO=null;
function vnAutoStop(){if(VNAUTO){clearTimeout(VNAUTO);VNAUTO=null}
 const b=$('#vnAuto');if(b)b.classList.remove('on');}
function vnAutoTick(){
 if(!VNAUTO)return;
 if($('#vnChoices').classList.contains('show')){vnAutoStop();return}
 vnAdvance();
 if(VNAUTO&&$('#vn').classList.contains('show'))VNAUTO=setTimeout(vnAutoTick,2200);
}
function vnAutoToggle(){
 const b=$('#vnAuto');
 if(VNAUTO){vnAutoStop();return}
 VNAUTO=setTimeout(vnAutoTick,600);
 if(b)b.classList.add('on');
}
function vnSkip(){
 vnAutoStop();
 const sc=VN.scene;if(!sc)return;
 if(sc.choice){VN.line=sc.lines.length-1;showLine();vnAdvance();return}
 finishScene();
}
function vnAdvance(){
 if($('#vnChoices').classList.contains('show'))return;
 VN.line++;
 const sc=VN.scene;
 if(VN.line>=sc.lines.length){
  if(sc.choice){
   $('#vnName').textContent='';
   $('#vnText').textContent=sc.choice[lang];
   $('#vnChoices').innerHTML=sc.choice.options.map((o,i)=>'<button class="chq" data-choice="'+i+'">'+o[lang]+'</button>').join('');
   $('#vnChoices').classList.add('show');
   return;
  }
  finishScene();return;
 }
 showLine();
}
function vnChoose(i){
 const o=VN.scene.choice.options[i];
 if(o&&o.flag&&S.flags.indexOf(o.flag)<0)S.flags.push(o.flag);
 $('#vnChoices').classList.remove('show');
 finishScene();
}
function finishScene(){
 vnAutoStop();
 const sc=VN.scene,r=sc.reward||{};
 if(VN.ch===S.chapter&&VN.sc===S.scene){
  if(r.coins)addCoins(r.coins);if(r.gems)addGems(r.gems);if(r.xp)addXp(r.xp);
  S.scene++;
  if(S.scene>=STORY[S.chapter].scenes.length){S.chapter=Math.min(S.chapter+1,STORY.length-1);S.scene=0}
  const rw=[];
  if(r.coins)rw.push({img:'assets/ui/coin.webp',t:'+'+fmt(r.coins)});
  if(r.gems)rw.push({img:'assets/ui/gem.webp',t:'+'+r.gems});
  if(r.xp)rw.push({img:'assets/ui/star.webp',t:'+'+r.xp+' XP'});
  confetti();Audio_.win();
  setTimeout(()=>showRewards(T('sceneDone'),rw),150);
 }
 $('#vn').classList.remove('show');
 save();renderAll();
}
function continueStory(){
 if(nextSceneAvailable())startScene(S.chapter);
 else{renderChapters();openModal('#storyModal')}
}

/* ---------- event ---------- */
const EV_MILESTONES=[30,80,160,300];
function startEvent(){
 S.ev.active=true;S.ev.pts=0;S.ev.claimed=[];S.ev.until=now()+3*24*3600*1000;
 S.ev.board=emptyBoard(EV_COLS,EV_ROWS);
 S.ev.board[17]={type:'gen',gid:100,glvl:1};
 toast(T('eventTitle'),'assets/ui/chest.webp');
}
function renderEventHead(){
 const max=EV_MILESTONES[EV_MILESTONES.length-1];
 $('#evPts').textContent=S.ev.pts;
 $('#evBar').style.width=Math.min(100,Math.round(S.ev.pts/max*100))+'%';
 const left=Math.max(0,S.ev.until-now());
 const hh=Math.floor(left/3600000),mm=Math.floor(left%3600000/60000);
 $('#evTime').textContent=hh+'h '+mm+'m';
 $('#evMiles').innerHTML=EV_MILESTONES.map((m,i)=>{
  const got=S.ev.claimed.indexOf(i)>=0, can=S.ev.pts>=m&&!got;
  return '<div class="mile'+(got?' got':'')+(can?' go':'')+'" data-mile="'+i+'"><img src="assets/ui/'+(i===3?'chest':'gift')+'.webp"><span>'+m+'</span></div>';
 }).join('');
}
function evClaim(i){
 const m=EV_MILESTONES[i];
 if(S.ev.pts<m||S.ev.claimed.indexOf(i)>=0){return}
 S.ev.claimed.push(i);
 const coins=1200*(i+1), gems=2*(i+1);
 addCoins(coins);addGems(gems);addXp(60*(i+1));
 confetti();Audio_.win();
 showRewards(T('reward'),[{img:'assets/ui/coin.webp',t:'+'+fmt(coins)},{img:'assets/ui/gem.webp',t:'+'+gems}]);
 save();renderEventHead();renderTop();
}
function openEvent(){
 if(!S.ev.active){toast(T('locked2')+' 6');Audio_.bad();return}
 if(S.ev.until<now()){startEvent()}
 EVENT_MODE=true;
 openModal('#eventModal');
 renderEventHead();renderBoard();
 setTimeout(fitBoard,60);
}
function closeEvent(){EVENT_MODE=false;closeModal('#eventModal');renderAll()}

/* ---------- drag + tap ---------- */
function bindBoard(el){
 let startIdx=-1,ghost=null,moved=false,startX=0,startY=0,pointerId=null;
 const cellFromPoint=(x,y)=>{
  // Ignore the drag preview and resolve the board cell under the finger.
  const e=document.elementFromPoint(x,y);if(!e)return -1;
  const c=e.closest('.cell');return c?parseInt(c.dataset.i,10):-1;
 };
 const clearDrag=()=>{
  $$('.cell.over').forEach(c=>c.classList.remove('over'));
  if(ghost){ghost.remove();ghost=null}
  startIdx=-1;pointerId=null;moved=false;
 };
 el.addEventListener('contextmenu',e=>{
  const c=e.target.closest('.cell');if(!c)return;e.preventDefault();toStorage(parseInt(c.dataset.i,10));
 });
 el.addEventListener('pointerdown',e=>{
  const c=e.target.closest('.cell');if(!c)return;
  // Prevent the browser from treating a board gesture as page scrolling/zooming.
  e.preventDefault();
  startIdx=parseInt(c.dataset.i,10);startX=e.clientX;startY=e.clientY;
  pointerId=e.pointerId;moved=false;
  const B=curBoard(),cell=B[startIdx];
  if(cell&&(cell.type==='item'||cell.type==='gen')){
   ghost=document.createElement('div');ghost.className='dragGhost';
   ghost.innerHTML=cell.type==='item'?'<img src="'+itemImg(cell.chain,cell.lvl)+'">':'<img src="assets/gen/'+(EVENT_MODE?EVENT_GEN:GENS[cell.gid]).img+'.webp">';
   ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';ghost.style.display='none';
   $('#fx').appendChild(ghost);
  }
  if(el.setPointerCapture){try{el.setPointerCapture(e.pointerId)}catch(_){} }
 });
 el.addEventListener('pointermove',e=>{
  if(startIdx<0|| (pointerId!==null&&e.pointerId!==pointerId))return;
  e.preventDefault();
  const dx=e.clientX-startX,dy=e.clientY-startY;
  // movementX/movementY are commonly zero for touch pointers; use coordinates instead.
  if(!moved){
   if(Math.hypot(dx,dy)<8)return;
   moved=true;if(ghost)ghost.style.display='block';
  }
  if(ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px'}
  const over=cellFromPoint(e.clientX,e.clientY);
  $$('.cell.over').forEach(c=>c.classList.remove('over'));
  if(over>=0&&over!==startIdx){const t=el.querySelector('.cell[data-i="'+over+'"]');if(t)t.classList.add('over')}
 });
 const finish=e=>{
  if(startIdx<0|| (pointerId!==null&&e.pointerId!==pointerId))return;
  e.preventDefault();
  const from=startIdx,endIdx=cellFromPoint(e.clientX,e.clientY),wasMoved=moved;
  clearDrag();
  if(wasMoved&&endIdx>=0&&endIdx!==from){
   if(tryMove(from,endIdx)){
    const r=el.querySelector('.cell[data-i="'+endIdx+'"]');
    if(r){const b=r.getBoundingClientRect();sparkAt(b.left+b.width/2,b.top+b.height/2,9)}
    if(EVENT_MODE){renderEventHead();renderBoard();fitBoard();save();renderTop()}
    else afterChange();
   }
   return;
  }
  if(!wasMoved){
   cellTap(from);
   if(EVENT_MODE){renderEventHead();renderBoard();fitBoard();renderTop();save()}
  }
 };
 el.addEventListener('pointerup',finish);
 el.addEventListener('pointercancel',e=>{if(pointerId===null||e.pointerId===pointerId)clearDrag()});
}

/* ---------- hints ---------- */
const HINTS=[
 ['h1','Соединяй два одинаковых предмета — перетащи один на другой.','Merge two identical items — drag one onto the other.'],
 ['h2','Нажимай на генераторы, чтобы создавать новые предметы.','Tap generators to create new items.'],
 ['h3','Выполняй заказы сверху — за них дают монеты и опыт.','Complete the orders above for coins and XP.'],
 ['h4','Долгое нажатие правой кнопкой — убрать предмет на склад.','Right click an item to move it to storage.']
];
function showHint(){
 const h=HINTS.find(x=>!S.hints[x[0]]);
 if(!h)return;
 S.hints[h[0]]=true;save();
 const bar=$('#hintBar');bar.textContent=lang==='ru'?h[1]:h[2];bar.classList.add('show');
 setTimeout(()=>bar.classList.remove('show'),5200);
}

/* ---------- i18n ---------- */
function applyStaticText(){
 $$('[data-t]').forEach(e=>{e.textContent=T(e.dataset.t)});
 document.title=T('title');
 $('#sideTitle').textContent='Vasilwwq Merge';
 $('#setMusic').textContent=T('music')+': '+(S.music?'ON':'OFF');
 $('#setSfx').textContent=T('sfx')+': '+(S.sfx?'ON':'OFF');
 $('#setLang').textContent=T('lang')+': '+(lang==='ru'?'Русский':'English');
}
function setLang(l){lang=l;localStorage.setItem('vm_lang',l);document.documentElement.lang=l;applyStaticText();renderAll()}

/* ---------- loop ---------- */
function tick(){
 const el=Math.floor((now()-S.enAt)/1000/EN_SEC);
 if(el>0){const add=Math.min(el,EN_CAP-S.energy);S.energy=Math.min(EN_CAP,S.energy+Math.max(0,add));S.enAt+=el*EN_SEC*1000;renderTop();save()}
 let dirty=false;
 [S.board,S.ev.board].forEach(B=>{if(!B)return;B.forEach((c,i)=>{if(c.type==='item'&&c.bub&&c.bub<now()){B[i]={type:'empty'};dirty=true}})});
 if(dirty){renderBoard();fitBoard();save()}
 if($('#eventModal').classList.contains('show'))renderEventHead();
}
function seasonParticles(){
 const d=document.createElement('div');
 d.className='leafFx s'+S.season;
 d.style.left=rnd(100)+'vw';
 d.style.animationDuration=(7+rnd(6))+'s';
 $('#fx').appendChild(d);setTimeout(()=>d.remove(),14000);
}

/* ---------- settings / actions ---------- */
function renderSettings(){applyStaticText();openModal('#settingsModal')}
function enterGameView(){
 document.body.classList.remove('homeMode');
 document.body.classList.add('gameMode');
}
function doAction(act){
 Audio_.init();
 if(act==='settings'){renderSettings()}
 else if(act==='shop'){renderShop();openModal('#shopModal')}
 else if(act==='quests'){renderQuests();openModal('#questModal')}
 else if(act==='album'){renderAlbum();openModal('#albumModal')}
 else if(act==='map'){renderMap();openModal('#mapModal')}
 else if(act==='story'){continueStory()}
 else if(act==='event'){openEvent()}
 else if(act==='sell'){sellMode=!sellMode;document.body.classList.toggle('sellMode',sellMode);toast(sellMode?T('sellOn'):T('sellOff'))}
 else if(act==='storage'){$('#storagePanel').classList.toggle('open')}
 else if(act==='music'){S.music=!S.music;applyStaticText();Audio_.music();save()}
 else if(act==='sfx'){S.sfx=!S.sfx;applyStaticText();save()}
 else if(act==='lang'){setLang(lang==='ru'?'en':'ru')}
 else if(act==='reset'){if(confirm(T('resetAsk'))){localStorage.removeItem(SAVE_KEY);newGame();save();location.reload()}}
}

/* ---------- init ---------- */
function init(){
 if(!loadSave()){newGame();save()}
 document.body.classList.add('homeMode');
 offlineEnergy();
 document.documentElement.lang=lang;
 applyStaticText();
 bindBoard($('#board'));bindBoard($('#evBoard'));
 document.addEventListener('click',e=>{
  const t=e.target;
  const hp=t.closest('[data-home-play]');
  if(hp){enterGameView();return}
  const ha=t.closest('[data-home-act]');
  if(ha){enterGameView();doAction(ha.dataset.homeAct);return}
  const act=t.closest('[data-act]');
  if(act){railFeedback(act,e);doAction(act.dataset.act);return}
  const cl=t.closest('[data-close]');
  if(cl){const sel=cl.dataset.close;if(sel==='#eventModal')closeEvent();else closeModal(sel);return}
  const dv=t.closest('[data-deliver]');if(dv){deliver(dv.dataset.deliver);return}
  const q=t.closest('[data-quest]');if(q){claimQuest(q.dataset.quest);renderQuests();return}
  const tab=t.closest('[data-tab]');if(tab){shopTab=tab.dataset.tab;renderShop();return}
  const outfit=t.closest('[data-outfit]');if(outfit){equipOutfit(outfit.dataset.outfit);return}
  const bg=t.closest('[data-buygems]');if(bg){buyGems(+bg.dataset.buygems);renderShop();return}
  const bw=t.closest('[data-buy]');if(bw){const p=bw.dataset.buy.split(':');buyWithGems(p[0],+p[1]);renderShop();return}
  const chs=t.closest('[data-chest]');if(chs){buyChest(+chs.dataset.chest);return}
  const ad=t.closest('[data-ad]');if(ad){adReward(ad.dataset.ad);renderShop();return}
  const mo=t.closest('[data-mapopen]');if(mo){mapUnlock(mo.dataset.mapopen);return}
  const tv=t.closest('[data-travel]');if(tv){travelTo(tv.dataset.travel);return}
  const gn=t.closest('[data-gonext]');if(gn){goNextSpot(gn.dataset.gonext);return}
  const mz=t.closest('[data-mz]');if(mz){mapZoom(mz.dataset.mz);return}
  const sp=t.closest('[data-spot]');if(sp){spotClick(sp.dataset.spot);return}
  if(t.closest('#vnAuto')){vnAutoToggle();return}
  if(t.closest('#vnSkip')){vnSkip();return}
  const pl=t.closest('[data-play]');if(pl){startScene(+pl.dataset.play);return}
  const ml=t.closest('[data-mile]');if(ml){evClaim(+ml.dataset.mile);return}
  const st=t.closest('[data-st]');if(st){fromStorage(+st.dataset.st);return}
  const cq=t.closest('[data-choice]');if(cq){vnChoose(+cq.dataset.choice);return}
  if(t.closest('#vn')){vnAdvance();return}
  const modal=t.closest('.modal');
  if(modal&&t===modal){if(modal.id==='eventModal')closeEvent();else closeModal('#'+modal.id)}
 });
 window.addEventListener('resize',()=>{fitBoard()});
 window.addEventListener('beforeunload',save);
 renderAll();
 setInterval(tick,1000);
 setInterval(seasonParticles,2600);
 setInterval(save,15000);
 setTimeout(showHint,1200);
 setInterval(showHint,45000);
 document.addEventListener('pointerdown',function once(){Audio_.init();Audio_.music();document.removeEventListener('pointerdown',once)});
}
document.addEventListener('DOMContentLoaded',init);
