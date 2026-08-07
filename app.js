const state={remaining:Array.from({length:75},(_,i)=>i+1),drawn:[],voices:[]};
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

function letterFor(n){return n<=15?'B':n<=30?'I':n<=45?'N':n<=60?'G':'O'}
function spanishNumber(n){
  const a=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
  const d={30:'treinta',40:'cuarenta',50:'cincuenta',60:'sesenta',70:'setenta'};
  if(n<30)return a[n]; const b=Math.floor(n/10)*10,r=n%10; return r?`${d[b]} y ${a[r]}`:d[b];
}
const letterNames={B:'be',I:'i',N:'ene',G:'ge',O:'o'};

function buildBoard(){
  const board=$('#board'); board.innerHTML='';
  const defs=[['B',1,15],['I',16,30],['N',31,45],['G',46,60],['O',61,75]];
  defs.forEach(([l,s,e])=>{
    const col=document.createElement('div'); col.className='board-col';
    const head=document.createElement('div'); head.className=`board-head ${l.toLowerCase()}`; head.textContent=l; col.appendChild(head);
    for(let n=s;n<=e;n++){const c=document.createElement('div');c.className='cell';c.dataset.n=n;c.textContent=n;col.appendChild(c)}
    board.appendChild(col);
  });
}
function render(){
  $('#drawnCount').textContent=state.drawn.length; $('#remainCount').textContent=state.remaining.length;
  $$('.cell').forEach(c=>c.classList.toggle('called',state.drawn.includes(Number(c.dataset.n))));
  const recent=$('#recentList'); recent.innerHTML='';
  state.drawn.slice(-10).reverse().forEach(n=>{
    const item=document.createElement('div');item.className='recent-item';
    item.innerHTML=`<span class="ball" style="width:34px;height:34px;font-size:16px">${letterFor(n)}</span><b>${n}</b><time>${new Date().toLocaleTimeString()}</time>`;
    recent.appendChild(item);
  });
  $('#historyGrid').innerHTML=state.drawn.map(n=>`<span class="history-ball">${letterFor(n)}-${n}</span>`).join('');
  $('#drawBtn').disabled=state.remaining.length===0;
}
function drawNumber(){
  if(!state.remaining.length)return;
  const i=Math.floor(Math.random()*state.remaining.length), n=state.remaining.splice(i,1)[0];state.drawn.push(n);
  const l=letterFor(n);$('#lastLetter').textContent=l;$('#lastNumber').textContent=n;
  const phrase=`Letra ${letterNames[l]}. Número ${spanishNumber(n)}.`;$('#spokenText').textContent=phrase; speak(phrase);render();
}
function reset(){state.remaining=Array.from({length:75},(_,i)=>i+1);state.drawn=[];$('#lastLetter').textContent='—';$('#lastNumber').textContent='—';$('#spokenText').textContent='Listo para comenzar';render()}
function loadVoices(){
  state.voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('es'));
  const sel=$('#voiceSelect');sel.innerHTML='';
  const sorted=[...state.voices].sort((a,b)=>(b.lang==='es-MX')-(a.lang==='es-MX'));
  sorted.forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=`${v.name} (${v.lang})`;sel.appendChild(o)});
}
function speak(text){
  if(!$('#voiceEnabled').checked||!('speechSynthesis'in window))return;
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);
  const selected=state.voices.find(v=>v.name===$('#voiceSelect').value)||state.voices.find(v=>v.lang==='es-MX')||state.voices[0];
  if(selected)u.voice=selected;u.lang=selected?.lang||'es-MX';u.rate=Number($('#rateRange').value);speechSynthesis.speak(u);
}
function randomCard(){
  const ranges=[[1,15],[16,30],[31,45],[46,60],[61,75]];
  const cols=ranges.map(([a,b])=>shuffle(Array.from({length:b-a+1},(_,i)=>a+i)).slice(0,5));
  const vals=[];for(let r=0;r<5;r++)for(let c=0;c<5;c++)vals.push(r===2&&c===2?'LIBRE':cols[c][r]);return vals;
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function generateCards(){
  const rawQty=$('#cardQty').value.trim();
  if(!rawQty){alert('Escribe la cantidad de cartones que deseas generar.');$('#cardQty').focus();return}
  const qtyNum=Number(rawQty);
  if(!Number.isInteger(qtyNum)||qtyNum<1||qtyNum>5000){
    alert('La cantidad debe ser un número entero entre 1 y 5000.');
    $('#cardQty').focus();
    return;
  }

  const title=$('#eventTitle').value.trim();
  const beneficiary=$('#beneficiary').value.trim();
  const date=$('#eventDate').value.trim();
  const time=$('#eventTime').value.trim();
  const price=$('#eventPrice').value.trim();

  if(!title||!beneficiary||!date||!time||!price){
    alert('Completa Título, Beneficiario, Fecha, Hora y Precio antes de generar.');
    return;
  }

  const preview=$('#cardsPreview');
  preview.innerHTML='';

  for(let k=1;k<=qtyNum;k++){
    const vals=randomCard();
    const card=document.createElement('article');
    card.className='bingo-card';
    card.innerHTML=`<header><img src="assets/logo-havyco.png" style="width:46px;height:46px;border-radius:12px"><div><b>${title}</b><br><small>${beneficiary}</small></div><b>#${String(k).padStart(4,'0')}</b></header>
    <div class="letters">${['B','I','N','G','O'].map(x=>`<div>${x}</div>`).join('')}</div>
    <div class="nums">${vals.map(v=>`<div class="${v==='LIBRE'?'free':''}">${v}</div>`).join('')}</div>
    <footer style="display:flex;justify-content:space-between;color:#07123d;padding:8px 0 0"><small>${date} · ${time}</small><b>${price}</b></footer>`;
    preview.appendChild(card);
  }

  alert(`Se generaron ${qtyNum} cartones correctamente.`);
}
function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id))}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$('#drawBtn').addEventListener('click',drawNumber);$('#resetBtn').addEventListener('click',reset);
$('#generateCardsBtn').addEventListener('click',generateCards);$('#printCardsBtn').addEventListener('click',()=>{showView('cartones');setTimeout(()=>window.print(),100)});
$('#printBoardBtn').addEventListener('click',()=>window.print());
$('#primaryColor').addEventListener('input',e=>document.documentElement.style.setProperty('--primary',e.target.value));
$('#accentColor').addEventListener('input',e=>document.documentElement.style.setProperty('--accent',e.target.value));
$('#calledColor').addEventListener('input',e=>document.documentElement.style.setProperty('--called',e.target.value));
window.addEventListener('keydown',e=>{if(e.code==='Space'&&$('#ruleta').classList.contains('active')){e.preventDefault();drawNumber()}});
speechSynthesis.onvoiceschanged=loadVoices;loadVoices();buildBoard();render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});
