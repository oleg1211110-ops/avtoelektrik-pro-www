/* avtoelektrik-pro.kz — лёгкие интерактивы: счётчики, квиз, обратный звонок, мини-диагностика, формы. */
(function(){
'use strict';
var WA='77011211110', TEL='+77011211110';
var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||document).querySelector(s);}
function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function wa(text){return 'https://wa.me/'+WA+(text?'?text='+encodeURIComponent(text):'');}

/* Google Ads — конверсия «Заявка с сайта» (клик по телефону/WhatsApp, отправка формы). Метка из кабинета Олега. */
(function(){
  var SEND_TO='AW-972695651/DxMVCJfywr4dEOPQ6M8D';
  function fireLead(){ if(typeof gtag==='function'){ try{ gtag('event','conversion',{send_to:SEND_TO,value:1.0,currency:'USD'}); }catch(e){} } }
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null; if(!a)return;
    var h=a.getAttribute('href')||'';
    if(h.indexOf('tel:')===0||h.indexOf('wa.me')>-1||h.indexOf('api.whatsapp.com')>-1){ fireLead(); }
  },true);
  document.addEventListener('submit',function(e){ var f=e.target; if(f&&f.matches&&f.matches('form.form')){ fireLead(); } },true);
})();

/* Счётчики — набегают при входе в экран; без JS уже показано финальное число. */
function animateCount(el){
  var to = parseFloat(el.getAttribute('data-count')); if(isNaN(to))return;
  var dec = (el.getAttribute('data-count').split('.')[1]||'').length;
  var suf = el.getAttribute('data-suf')||''; var dur=900, t0=null;
  if(rm){el.textContent=to.toFixed(dec).replace('.',',')+suf;return;}
  function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1); var v=(to*(0.2+0.8*p));
    el.textContent=(p>=1?to:v).toFixed(dec).replace('.',',')+suf; if(p<1)requestAnimationFrame(step);}
  requestAnimationFrame(step);
}
var counters=$all('[data-count]');
if(counters.length){
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){animateCount(e.target);io.unobserve(e.target);}});},{threshold:.4});
    counters.forEach(function(c){io.observe(c);});
  } else counters.forEach(animateCount);
}

/* График работы — статус «открыто/закрыто» и подсветка «сегодня» по времени Алматы (UTC+5). */
(function(){
  var box=$('.sched'); if(!box) return;
  var wd, mins;
  try{
    var pr=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Almaty',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
    var o={}; pr.forEach(function(p){o[p.type]=p.value;});
    var wm={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    wd=wm[o.weekday]; mins=(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10);
    if(isNaN(wd)||isNaN(mins)) return;
  }catch(e){ return; }
  var key='sun', open=false;
  if(wd>=1&&wd<=5){ key='wd'; open=mins>=540&&mins<1080; }
  else if(wd===6){ key='sat'; open=mins>=540&&mins<900; }
  var row=box.querySelector('.sched-rows li[data-day="'+key+'"]'); if(row)row.classList.add('today');
  var st=box.querySelector('[data-sched]');
  if(st){ st.textContent=open?'Сейчас открыто':'Сейчас закрыто'; st.classList.add(open?'open':'closed'); }
})();

/* Квиз «Что с машиной?» — 3 шага → WhatsApp с заполненным текстом. */
$all('.quiz').forEach(function(q){
  var steps=$all('.q-step',q), fill=$('.bar>i',q), ans=[], idx=0;
  function show(i){ idx=i; steps.forEach(function(s,k){s.classList.toggle('on',k===i);}); if(fill)fill.style.width=Math.round((i+1)/steps.length*100)+'%'; }
  $all('.opt',q).forEach(function(b){
    b.addEventListener('click',function(){
      var s=b.closest('.q-step'); var si=steps.indexOf(s); ans[si]=b.getAttribute('data-v')||b.textContent.trim();
      if(si<steps.length-1){show(si+1);}
      else{
        var txt='Здравствуйте, Олег! Нужна помощь автоэлектрика.\n'+ans.filter(Boolean).map(function(a,i){return (i+1)+') '+a;}).join('\n')+'\nПодскажите, пожалуйста, что делать?';
        window.location.href=wa(txt);
      }
    });
  });
  $all('.back',q).forEach(function(b){b.addEventListener('click',function(){if(idx>0)show(idx-1);});});
  show(0);
});

/* Обратный звонок «Перезвоню за 1 минуту» */
$all('[data-callback]').forEach(function(btn){
  btn.addEventListener('click',function(e){
    e.preventDefault();
    var txt='Здравствуйте, Олег! Перезвоните, пожалуйста — нужна консультация автоэлектрика.';
    // десктоп → WhatsApp, мобильный → предложим звонок
    if(/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)){ window.location.href='tel:'+TEL; }
    else { window.open(wa(txt),'_blank'); }
  });
});

/* Мини-диагностика: симптом → совет «сначала сам» → звонок */
$all('.diag').forEach(function(d){
  var sel=$('.diag-sym',d), out=$('.diag-out',d);
  if(!sel||!out)return;
  var data={};
  try{data=JSON.parse(d.getAttribute('data-diag')||'{}');}catch(e){}
  sel.addEventListener('change',function(){
    var k=sel.value, t=data[k];
    if(!t){out.innerHTML='';out.style.display='none';return;}
    out.innerHTML='<div class="card" style="margin-top:12px"><b>Что можно проверить самому:</b><div class="prose" style="margin-top:8px">'+t+'</div>'+
      '<div class="cta" style="margin-top:14px"><a class="btn wa" href="'+wa('Здравствуйте, Олег! '+ (sel.options[sel.selectedIndex].text) +' — не помогло, нужна помощь.')+'">Не помогло — написать Олегу</a>'+
      '<a class="btn ghost" href="tel:'+TEL+'">Позвонить</a></div></div>';
    out.style.display='block';
  });
});

/* Умные формы: валидация + отправка в WhatsApp (бэкенд форм — у Сергея, пока prefill) */
$all('form.form').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault(); var ok=true;
    $all('[required]',f).forEach(function(i){
      var bad=!i.value.trim() || (i.type==='tel' && i.value.replace(/\D/g,'').length<10);
      i.classList.toggle('bad',bad); var er=i.parentNode.querySelector('.err'); if(er)er.style.display=bad?'block':'none'; if(bad)ok=false;
    });
    if(!ok)return;
    var name=(f.querySelector('[name=name]')||{}).value||'', phone=(f.querySelector('[name=phone]')||{}).value||'', msg=(f.querySelector('[name=msg]')||{}).value||'';
    var txt='Заявка с сайта:\nИмя: '+name+'\nТелефон: '+phone+(msg?('\nВопрос: '+msg):'');
    window.open(wa(txt),'_blank');
    toast('Открываю WhatsApp — отправьте сообщение Олегу');
    f.reset();
  });
});
function toast(m){var t=$('#toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t);} t.textContent=m;t.classList.add('on');setTimeout(function(){t.classList.remove('on');},3200);}

/* внешние ссылки (другой домен) — открывать в новой вкладке, чтобы не терять сайт (совет Сергея, 24.11) */
document.querySelectorAll('a[href]').forEach(function(a){try{var u=new URL(a.href,location.href);if((u.protocol==='http:'||u.protocol==='https:')&&u.host!==location.host){a.target='_blank';a.rel='noopener noreferrer';}}catch(e){}});

/* PWA */
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}
})();
