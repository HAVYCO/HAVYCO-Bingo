const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const store={
  drawn:JSON.parse(localStorage.getItem('havyco_drawn')||'[]'),
  sales:JSON.parse(localStorage.getItem('havyco_sales')||'[]'),
  prizes:JSON.parse(localStorage.getItem('havyco_prizes')||'["Premio sorpresa"]'),
  settings:JSON.parse(localStorage.getItem('havyco_settings')||'{}'),
  installPrompt:null,
  voices:[]
};
let remaining=Array.from({length:75},(_,i)=>i+1).filter(n=>!store.drawn.includes(n));

function letterFor(n){return n<=15?'B':n<=30?'I':n<=45?'N':n<=60?'G':'O'}
function spanishNumber(n){
  const a=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
  const d={30:'treinta',40:'cuarenta',50:'cincuenta',60:'sesenta',70:'setenta'};
  if(n<30)return a[n]; const b=Math.floor(n/10)*10,r=n%10;return r?`${d[b]} y ${a[r]}`:d[b];
}
const lname={B:'be',I:'i',N:'ene',G:'ge',O:'o'};

function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.view===id))}
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));

function buildBoard(){
  const board=$('#board');board.innerHTML='';
  [['B',1,15],['I',16,30],['N',31,45],['G',46,60],['O',61,75]].forEach(([l,s,e])=>{
    const c=document.createElement('div');c.className='board-col';
    const h=document.createElement('div');h.className=`board-head ${l.toLowerCase()}`;h.textContent=l;c.appendChild(h);
    for(let n=s;n<=e;n++){const d=document.createElement('div');d.className='cell';d.dataset.n=n;d.textContent=n;c.appendChild(d)}board.appendChild(c);
  });
}
function render(){
  $('#drawnCount').textContent=store.drawn.length;$('#remainCount').textContent=remaining.length;
  $$('.cell').forEach(c=>c.classList.toggle('called',store.drawn.includes(Number(c.dataset.n))));
  $('#recentList').innerHTML='';
  store.drawn.slice(-10).reverse().forEach(n=>{const d=document.createElement('div');d.className='recent-item';d.innerHTML=`<span class="mini">${letterFor(n)}</span><b>${n}</b><time>${new Date().toLocaleTimeString()}</time>`;$('#recentList').appendChild(d)});
  $('#historyGrid').innerHTML=store.drawn.map(n=>`<span class="history-ball">${letterFor(n)}-${n}</span>`).join('');
  $('#drawBtn').disabled=!remaining.length;
  renderSales();renderPrizes();
}
function playBeep(){if(!$('#soundEnabled').checked)return;try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=740;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start();setTimeout(()=>{o.stop();c.close()},130)}catch(e){}}
function loadVoices(){store.voices=speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('es'));const s=$('#voiceSelect');s.innerHTML='';[...store.voices].sort((a,b)=>(b.lang==='es-MX')-(a.lang==='es-MX')).forEach(v=>{const o=document.createElement('option');o.value=v.name;o.textContent=`${v.name} (${v.lang})`;s.appendChild(o)})}
function speak(t){if(!$('#voiceEnabled').checked||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t),v=store.voices.find(v=>v.name===$('#voiceSelect').value)||store.voices.find(v=>v.lang==='es-MX')||store.voices[0];if(v)u.voice=v;u.lang=v?.lang||'es-MX';u.rate=Number($('#rateRange').value);speechSynthesis.speak(u)}
function drawNumber(){
  if(!remaining.length)return;
  const i=Math.floor(Math.random()*remaining.length),n=remaining.splice(i,1)[0];store.drawn.push(n);localStorage.setItem('havyco_drawn',JSON.stringify(store.drawn));
  const l=letterFor(n),t=`Letra ${lname[l]}. Número ${spanishNumber(n)}.`;$('#lastLetter').textContent=l;$('#lastNumber').textContent=n;$('#spokenText').textContent=t;playBeep();speak(t);render();
}
function resetGame(){if(!confirm('¿Reiniciar el sorteo completo?'))return;store.drawn=[];remaining=Array.from({length:75},(_,i)=>i+1);localStorage.setItem('havyco_drawn','[]');$('#lastLetter').textContent='—';$('#lastNumber').textContent='—';$('#spokenText').textContent='Listo para comenzar';render()}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function randomCard(){const ranges=[[1,15],[16,30],[31,45],[46,60],[61,75]],cols=ranges.map(([a,b])=>shuffle(Array.from({length:b-a+1},(_,i)=>a+i)).slice(0,5)),vals=[];for(let r=0;r<5;r++)for(let c=0;c<5;c++)vals.push(r===2&&c===2?'LIBRE':cols[c][r]);return vals}
function generateCards(){
  const qty=Number($('#cardQty').value);if(!Number.isInteger(qty)||qty<1||qty>10000){alert('Cantidad válida: 1 a 10000.');return}
  const fields=['eventTitle','beneficiary','eventDate','eventTime','eventPrice'];if(fields.some(id=>!$('#'+id).value.trim())){alert('Completa todos los datos del bingo.');return}
  const p=$('#cardsPreview');p.innerHTML='';
  for(let k=1;k<=qty;k++){const vals=randomCard(),a=document.createElement('article');a.className='bingo-card';a.innerHTML=`<header><img src="assets/logo-havyco.png" style="width:45px;height:45px;border-radius:12px"><div><b>${$('#eventTitle').value}</b><br><small>${$('#beneficiary').value}</small></div><b>#${String(k).padStart(4,'0')}</b></header><div class="letters">${['B','I','N','G','O'].map(x=>`<div>${x}</div>`).join('')}</div><div class="nums">${vals.map(v=>`<div class="${v==='LIBRE'?'free':''}">${v}</div>`).join('')}</div><footer style="display:flex;justify-content:space-between;color:#07123d;padding-top:7px"><small>${$('#eventDate').value} · ${$('#eventTime').value}</small><b>${$('#eventPrice').value}</b></footer>`;p.appendChild(a)}
  alert(`Se generaron ${qty} cartones.`);
}

function saveSale(){
  const seller=$('#sellerName').value.trim(),from=Number($('#saleFrom').value),to=Number($('#saleTo').value),price=Number($('#salePrice').value);
  if(!seller||!from||!to||to<from||price<0){alert('Revisa los datos de la venta.');return}
  store.sales.push({seller,from,to,price,date:new Date().toISOString()});localStorage.setItem('havyco_sales',JSON.stringify(store.sales));renderSales()
}
function renderSales(){
  const sold=store.sales.reduce((s,x)=>s+(x.to-x.from+1),0),total=store.sales.reduce((s,x)=>s+(x.to-x.from+1)*x.price,0),sellers=new Set(store.sales.map(x=>x.seller)).size;
  $('#soldCards').textContent=sold;$('#salesTotal').textContent='$'+total.toFixed(2);$('#sellerCount').textContent=sellers;
  $('#salesList').innerHTML=store.sales.slice().reverse().map(x=>`<div class="row"><b>${x.seller}</b><span>#${x.from}-#${x.to}</span><span>$${((x.to-x.from+1)*x.price).toFixed(2)}</span></div>`).join('')
}
function addPrize(){const v=$('#prizeInput').value.trim();if(!v)return;store.prizes.push(v);$('#prizeInput').value='';localStorage.setItem('havyco_prizes',JSON.stringify(store.prizes));renderPrizes()}
function renderPrizes(){$('#prizeList').innerHTML=store.prizes.map((p,i)=>`<div class="row"><b>${p}</b><span></span><button data-del-prize="${i}">Eliminar</button></div>`).join('');$$('[data-del-prize]').forEach(b=>b.onclick=()=>{store.prizes.splice(Number(b.dataset.delPrize),1);localStorage.setItem('havyco_prizes',JSON.stringify(store.prizes));renderPrizes()})}
function spinPrize(){
  if(!store.prizes.length){alert('Agrega al menos un premio.');return}
  $('#wheel').classList.remove('spinning');void $('#wheel').offsetWidth;$('#wheel').classList.add('spinning');
  setTimeout(()=>{$('#currentPrize').textContent=store.prizes[Math.floor(Math.random()*store.prizes.length)]},1600)
}
function saveSettings(){store.settings={primary:$('#primaryColor').value,accent:$('#accentColor').value,called:$('#calledColor').value};localStorage.setItem('havyco_settings',JSON.stringify(store.settings));applySettings();alert('Configuración guardada.')}
function applySettings(){if(store.settings.primary)document.documentElement.style.setProperty('--primary',store.settings.primary);if(store.settings.accent)document.documentElement.style.setProperty('--accent',store.settings.accent);if(store.settings.called)document.documentElement.style.setProperty('--called',store.settings.called)}
function isIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}
function showIosInstall(){
  $('#iosInstallModal')?.classList.remove('hidden');
}
function hideIosInstall(){
  $('#iosInstallModal')?.classList.add('hidden');
}
async function launchInstall(){
  if(isStandalone()) return;

  if(isIOS()){
    showIosInstall();
    return;
  }

  if(!store.installPrompt){
    alert('La instalación todavía no está disponible en este navegador. Usa el menú del navegador para instalar o vuelve a intentarlo después de recargar.');
    return;
  }

  store.installPrompt.prompt();
  await store.installPrompt.userChoice;
  store.installPrompt=null;
  $('#installBtn').classList.add('hidden');
  $('#installCard')?.classList.add('hidden');
}

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  store.installPrompt=e;
  if(!isStandalone()){
    $('#installBtn').classList.remove('hidden');
    $('#installCard')?.classList.remove('hidden');
  }
});

window.addEventListener('appinstalled',()=>{
  $('#installBtn').classList.add('hidden');
  $('#installCard')?.classList.add('hidden');
  store.installPrompt=null;
});

$('#installBtn').onclick=launchInstall;
$('#installBtnSecondary').onclick=launchInstall;
$('#closeIosInstall')?.addEventListener('click',hideIosInstall);
$('#iosInstallModal')?.addEventListener('click',e=>{
  if(e.target.id==='iosInstallModal') hideIosInstall();
});
$('#copyIosUrl')?.addEventListener('click',()=>{
  const box=$('#iosUrlBox');
  box.textContent=location.href;
  box.classList.remove('hidden');
});

// En iPhone/iPad mostramos el botón aunque beforeinstallprompt no exista.
if(isIOS() && !isStandalone()){
  $('#installBtn').classList.remove('hidden');
  $('#installCard')?.classList.remove('hidden');
}

$('#drawBtn').onclick=drawNumber;$('#resetBtn').onclick=resetGame;$('#generateCardsBtn').onclick=generateCards;$('#printCardsBtn').onclick=()=>{showView('cartones');setTimeout(()=>window.print(),100)};$('#clearCardsBtn').onclick=()=>$('#cardsPreview').innerHTML='';
$('#saveSaleBtn').onclick=saveSale;$('#addPrizeBtn').onclick=addPrize;$('#spinPrizeBtn').onclick=spinPrize;$('#clearHistoryBtn').onclick=()=>{if(confirm('¿Borrar historial?')){store.drawn=[];remaining=Array.from({length:75},(_,i)=>i+1);localStorage.setItem('havyco_drawn','[]');render()}};
$('#saveSettingsBtn').onclick=saveSettings;$('#fullscreenBtn').onclick=()=>document.documentElement.requestFullscreen?.();
window.addEventListener('keydown',e=>{if(e.code==='Space'&&$('#ruleta').classList.contains('active')){e.preventDefault();drawNumber()}});
speechSynthesis.onvoiceschanged=loadVoices;loadVoices();applySettings();buildBoard();render();
setTimeout(()=>$('#splash').classList.add('hide'),900);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
