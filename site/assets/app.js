/* avtoelektrik-pro.kz — лёгкие интерактивы: счётчики, квиз, обратный звонок, мини-диагностика, формы. */
(function(){
'use strict';
var WA=(window.__SITE_WA||'77011211110'), TEL=(window.__SITE_TEL||'+77011211110');
var rm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||document).querySelector(s);}
function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function wa(text){return 'https://wa.me/'+WA+(text?'?text='+encodeURIComponent(text):'');}

/* Google Ads — конверсия «Заявка с сайта». Один помощник fireLead() на ВСЕ целевые действия:
   клик по телефону/WhatsApp, отправка формы, завершение квиза, обратный звонок — чтобы ни одна заявка не терялась.
   Метка из кабинета Олега. Беакон переживает переход (gtag шлёт через sendBeacon). В предпросмотре gtag нет — тихо ничего. */
var LEAD_SEND_TO='AW-972695651/DxMVCJfywr4dEOPQ6M8D';
function fireLead(){ if(typeof gtag==='function'){ try{ gtag('event','conversion',{send_to:LEAD_SEND_TO,value:1.0,currency:'USD'}); }catch(e){} } }
(function(){
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null; if(!a)return;
    var h=a.getAttribute('href')||'';
    if(h.indexOf('tel:')===0||h.indexOf('wa.me')>-1||h.indexOf('api.whatsapp.com')>-1){ fireLead(); }
  },true);
  document.addEventListener('submit',function(e){ var f=e.target; if(f&&f.matches&&f.matches('form.form')){ fireLead(); } },true);
})();

/* «Поделиться» — системный шэринг (все приложения телефона); запасной вариант — копирование ссылки или WhatsApp */
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('.ao-share'):null; if(!b)return;
  e.preventDefault();
  var t=b.getAttribute('data-sh-t')||document.title, u=b.getAttribute('data-sh-u')||location.href, full=t+' '+u;
  if(navigator.share){ navigator.share({title:t,text:t,url:u}).catch(function(){}); return; }
  if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(full).then(function(){ var o=b.textContent; b.textContent='Ссылка скопирована ✓'; setTimeout(function(){b.textContent=o;},2500); },function(){ window.open('https://wa.me/?text='+encodeURIComponent(full),'_blank','noopener'); }); }
  else { window.open('https://wa.me/?text='+encodeURIComponent(full),'_blank','noopener'); }
});

/* кнопка «Наверх» — появляется при прокрутке, плавно поднимает страницу */
(function(){var b=document.querySelector('.to-top'); if(!b) return;
  var on=function(){ b.classList.toggle('show',(window.scrollY||document.documentElement.scrollTop)>500); };
  window.addEventListener('scroll',on,{passive:true}); on();
  b.addEventListener('click',function(){ window.scrollTo({top:0,behavior:'smooth'}); });
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

/* Мобильное меню: закрываем при клике по пункту. Иначе якорь («Вопросы» → #faq, «Отзывы» → #otzyvy)
   открывается ПОД полноэкранным оверлеем меню — выглядит, будто ссылка «тупит». Якорь на этой же
   странице доводим скроллом сами (с учётом scroll-margin под шапкой). */
(function(){
  var cb=document.getElementById('nav-t'); var menu=$('nav.menu');
  if(!cb||!menu) return;
  menu.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null; if(!a) return;
    cb.checked=false;
    var h=a.getAttribute('href')||'', i=h.indexOf('#');
    if(i>-1){
      var id=h.slice(i+1), t=id&&document.getElementById(id);
      if(t){ e.preventDefault(); if(history.replaceState){try{history.replaceState(null,'','#'+id);}catch(_){}} t.scrollIntoView(); }
    }
  });
})();

/* Появление по скроллу: .shown при входе во вьюпорт. При любом сбое анимации/JS текст остаётся видимым
   (базовый .reveal{opacity:1}; прячем только html.js .reveal при разрешённом движении). Элементы уже в/над
   вьюпортом и внутри горизонтального скролла (.hscroll) показываем сразу, чтобы текст не пропадал. */
(function(){
  var els=$all('.reveal'); if(!els.length) return;
  function show(el){el.classList.add('shown');}
  if(rm || !('IntersectionObserver' in window)){ els.forEach(show); return; }
  // threshold 0: показываем, как только появился край. Высокие блоки (выше вьюпорта) порог по доле
  // не набирают никогда — их показываем сразу, иначе текст остался бы невидимым.
  var vo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);vo.unobserve(e.target);}});},{threshold:0,rootMargin:'0px 0px -8% 0px'});
  var vh=window.innerHeight||document.documentElement.clientHeight||0;
  // внутри горизонтальной карусели (overflow-x: auto/scroll — .hscroll, .rev-carousel, .news-carousel)
  // элемент, сдвинутый вбок, по вертикальному наблюдателю не появится никогда — показываем сразу.
  function inHScroll(el){
    var n=el.parentElement;
    while(n && n!==document.body){
      var ox=getComputedStyle(n).overflowX;
      if(ox==='auto'||ox==='scroll') return true;
      n=n.parentElement;
    }
    return false;
  }
  els.forEach(function(el){
    var r=el.getBoundingClientRect();
    if(r.top < vh || r.height > vh*0.7 || inHScroll(el)){ show(el); }
    else { vo.observe(el); }
  });
  // Страховка от невидимого текста: показываем по скроллу напрямую (не только через IO), и через 2.5с — всё оставшееся.
  function sweep(){ var h=window.innerHeight||0; for(var i=0;i<els.length;i++){ var e=els[i]; if(!e.classList.contains('shown') && e.getBoundingClientRect().top < h*0.95) show(e); } }
  var _t=false; function _onSc(){ if(_t)return; _t=true; requestAnimationFrame(function(){_t=false;sweep();}); }
  window.addEventListener('scroll',_onSc,{passive:true}); window.addEventListener('resize',_onSc,{passive:true}); window.addEventListener('load',sweep);
  setTimeout(function(){ for(var i=0;i<els.length;i++) show(els[i]); }, 2500);
})();

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
        fireLead(); window.location.href=wa(txt);
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
    fireLead();
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


/* ── помощник Олега (вынесен из страниц в общий файл) ── */
(function(){
  var openers=document.querySelectorAll('.pbot-open'), panel=document.getElementById('pbotPanel'),
      log=document.getElementById('pbotLog'), inp=document.getElementById('pbotInput'),
      sendBtn=document.getElementById('pbotSend'), mic=document.getElementById('pbotMic'),
      closeBtn=document.getElementById('pbotClose');
  if(!openers.length||!panel) return;
  var WA=(window.__SITE_WA||'77011211110'), started=false;

  var KB=[
   {k:['не заводит','стартер крут','схватыва','не запуск','крутит но','заводится но'],t:'не заводится, стартер крутит',
    a:'Если стартер крутит, но не схватывает — чаще всего нет искры или топлива.\n\nЧто проверить самому:\n• Включи зажигание и послушай у бака — бензонасос должен коротко зажужжать. Нет звука — по баку можно легонько стукнуть, иногда насос «оживает».\n• Проверь предохранители (насос, зажигание).\n• Недавно отключал АКБ или лез в сигналку? Возможен иммобилайзер — не видит ключ.\n\nНе ожило — отправь мне, подскажу по твоей машине.'},
   {k:['не крут','щелч','щёлк','клац','молчит','тишина','не реагир','поворачиваю ключ'],t:'стартер не крутит / щелчки',
    a:'Стартер не крутит или щёлкает — обычно питание или сам стартер.\n\nСам:\n• Включи фары — горят ярко или тускло? Тускло → слабый аккумулятор или клеммы.\n• Пошевели клеммы АКБ, зачисти, если окисел.\n• При повороте ключа можно легонько стукнуть по стартеру — если схватил, стартер под замену.\n\nОсталось молчать — пиши, посмотрим вместе.'},
   {k:['check','чек','горит ошиб','значок','лампа','джеки','ошибка на пан','p0','p1','горит двиг'],t:'горит Check / ошибка',
    a:'Горит Check — машина пишет код, по нему видно направление.\n\nСам:\n• Знаешь код (вид Pxxxx)? Глянь его в разделе кодов на сайте.\n• Сканером: считай код, сбрось, прокатись, посмотри — вернулся или нет.\n\nНазови мне код и марку — скажу, что это и опасно ли ехать.'},
   {k:['оборот','плавают','глохн','троит','дёрга','дерга','холост','подсос','дроссел'],t:'плавают обороты / глохнет',
    a:'Плавают обороты или глохнет — чаще дроссель, подсос воздуха или ДМРВ.\n\nСам:\n• Осмотри патрубки после воздушного фильтра на трещины и хомуты (подсос).\n• Недавно мыли двигатель или снимали впуск? Проверь разъёмы датчиков.\n\nНапиши, когда глохнет (на холодную/горячую, на холостых/в движении) — подскажу точнее.'},
   {k:['расход','перерасход','много ест','жрет','много бензина','больше топлива','аппетит','много топлива','ест бензин','большой расход'],t:'большой расход топлива',
    a:'Большой расход топлива — сначала смотрим базу, чаще всего дело в расходниках и датчиках.\n\nСначала сам — вспомни, давно ли менял:\n• Воздушный фильтр (забитый — мотор «душится» и ест больше).\n• Свечи зажигания (старые — пропуски, лишний расход).\n• Топливный фильтр.\nЕщё влияет: давление в шинах, долгие прогревы и холостой ход, стиль езды, кондиционер.\n\n🔌 Есть сканер (OBD-II)? Подключи и сравни с нормой:\n• Топливные коррекции STFT+LTFT — норма ±10%. Сильный минус = мотор сбрасывает лишнее топливо (что-то льёт богато).\n• Кислородный датчик (верхний, лямбда) — на холостых быстро прыгает 0,1↔0,9 В, несколько раз в секунду. Завис высоко или ленивый — врёт, отсюда перерасход.\n• Датчик температуры ОЖ — на прогретом ~90°C. Показывает низкую (мотор «думает», что холодный) — льёт богатую смесь.\n• ДМРВ на холостых ~2–4 г/с (зависит от объёма мотора); завышает — лишнее топливо.\nИ посмотри коды ошибок.\n\nРазобрался сам — супер, для этого и делаем. Нет сканера или нужна помощь — напиши, что менял и что показывает, или жми кнопку и отправь мне.'},
   {k:['стеклопод','печк','фар','прикурив','не включ','магнитол','плафон','предохран','реле','пропал свет','не работает свет','нет света'],t:'не работает электрика',
    a:'Не работает узел электрики — начинай с питания этой цепи.\n\nСам:\n• Найди и проверь предохранитель именно этой цепи (схема на крышке блока).\n• Перегорел — поставь такой же. Снова сгорел → где-то замыкание, дальше не угадывай.\n\nНапиши, что именно не работает — подскажу, где искать массу и реле.'},
   {k:['после ремонт','поменял','снимал','снял','ставил','делал ход','развал','поменяли колес','снимали рул','после замен','загорелась после'],t:'проблема после ремонта',
    a:'Если беда вылезла сразу после ремонта — почти всегда задели разъём или датчик того узла.\n\nВспомни, что делали:\n• Ходовка/колесо → смотри датчик ABS того колеса (фишка, разъём).\n• Снимали руль/рейку → датчик угла поворота.\n• Магнитный датчик (ABS, коленвал) часто просто в грязи или стружке — снять и почистить.\n\nНапиши, что именно делали — скажу, какой датчик смотреть.'},
   {k:['иммобил','не видит ключ','чип','метк','ключ не','сигнализац','обходчик'],t:'иммобилайзер / ключ',
    a:'Похоже на иммобилайзер — машина не узнаёт ключ.\n\nСам:\n• Попробуй второй ключ.\n• Поднеси ключ вплотную к метке или замку (сел элемент в ключе — частая причина).\n• Недавно ставили сигналку? Могли задеть обходчик или проводку.\n\nНе помогло — пиши, с ключами и метками разбираюсь.'},
   {k:['садится акк','разряж','за ночь','утечк','не держит','разрядил','акб сад','аккумулятор сад'],t:'садится АКБ / утечка тока',
    a:'АКБ садится за ночь — либо сам аккумулятор устал, либо утечка тока.\n\nСам:\n• Проверь возраст и заряд АКБ (часто ему уже 5+ лет).\n• Вспомни, что добавляли: сигналка, магнитола, регистратор на постоянном плюсе — частые виновники.\n\nАКБ свежий, а всё равно садится — нужна проверка утечки, пиши.'},
   {k:['дизел','мочевин','adblue','адблю','scr','сажев','разнос','солярк','не глохнет','сам газ'],t:'дизель / мочевина (AdBlue/SCR)',
    a:'Дизель и мочевина (AdBlue/SCR) — это моя тема.\n\nКоротко:\n• Горит ошибка AdBlue — не глуши надолго, часто уходит в ограничение мощности.\n• Дизель пошёл в разнос (сам газует) — глуши передачей или перекрытием впуска, это опасно.\n\nНапиши марку и что горит или как ведёт — разберём по потоку данных.'},
   {k:['камаз','грузов','фур','газель','тягач','тахограф','спидометр','отвязк','эбу','ebu','маз','даф','ман','скани','вольво'],t:'грузовик / ЭБУ',
    a:'С грузовыми работаю (КамАЗ, европейцы, мочевина, ремонт ЭБУ).\n\nСам:\n• Назови марку и что беспокоит (не заводится, ошибка, мочевина, спидометр).\n• Если после ремонта — вспомни, что крутили.\n\nНапиши — скажу, едет ли оно само или нужен выезд.'},
   {k:['диагностик','сколько сто','цена','выезд','приедеш','записат','сканер','проверить машину','компьютерн'],t:'диагностика / выезд / цена',
    a:'Компьютерная диагностика на сервисе от 10 000 ₸, выезд с диагностикой от 15 000 ₸.\n\nЧтобы я сразу приехал с нужным — опиши машину и симптом и жми кнопку ниже. Если просто спросить — звони, часто подскажу по телефону бесплатно.'}
  ];

  function norm(s){return (s||'').toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();}
  function match(t){var n=norm(t),best=null,bs=0;for(var i=0;i<KB.length;i++){var sc=0,ks=KB[i].k;for(var j=0;j<ks.length;j++){if(n.indexOf(ks[j])>=0)sc++;}if(sc>bs){bs=sc;best=KB[i];}}return bs>0?best:null;}

  function el(cls,txt){var d=document.createElement('div');d.className=cls;if(txt!=null)d.textContent=txt;return d;}
  function toBottom(){log.scrollTop=log.scrollHeight;}
  function addUser(t){log.appendChild(el('pbot-msg pbot-u',t));toBottom();}
  function addBot(t){log.appendChild(el('pbot-msg pbot-b',t));toBottom();}

  function waBtn(userText,title){
    var msg='Здравствуйте, Олег! Пишу с сайта.\nВопрос: '+userText+(title?'\n(похоже на: '+title+')':'')+'\nПодскажите, пожалуйста.';
    var a=document.createElement('a');
    a.className='pbot-wa';a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);
    a.target='_blank';a.rel='noopener';a.textContent='📲 Отправить Олегу в WhatsApp';
    a.addEventListener('click',function(){if(window.fireLead){try{fireLead();}catch(e){}}});
    log.appendChild(a);toBottom();
  }
  function chips(items){
    var wrap=el('pbot-chips');
    items.forEach(function(it){var b=document.createElement('button');b.type='button';b.className='pbot-chip';b.textContent=it;
      b.addEventListener('click',function(){userSay(it);});wrap.appendChild(b);});
    log.appendChild(wrap);toBottom();
  }

  function respond(t){
    var m=match(t);
    if(m){addBot(m.a);waBtn(t,m.t);}
    else{
      addBot('Понял вас. Чтобы помочь точнее, напишите марку машины и что именно беспокоит (например: «Тойота не заводится, стартер крутит»). А можно сразу отправить вопрос Олегу — ответит лично.');
      waBtn(t,null);
    }
  }
  function userSay(t){t=(t||'').trim();if(!t)return;addUser(t);inp.value='';setTimeout(function(){respond(t);},260);}

  function greet(){
    addBot('Привет! Я помощник Олега. Опишите словами или голосом, что с машиной — подскажу, что проверить самому, а если нужно, отправлю вопрос Олегу уже готовым.\n\nС чего начнём?');
    chips(['Не заводится','Горит Check','Плавают обороты','Не работает электрика','После ремонта','Нужна диагностика']);
  }
  function openP(){panel.classList.add('open');if(!started){started=true;greet();}setTimeout(function(){try{inp.focus();}catch(e){}},80);}
  function closeP(){panel.classList.remove('open');}

  for(var oi=0;oi<openers.length;oi++)openers[oi].addEventListener('click',openP);
  closeBtn.addEventListener('click',closeP);
  sendBtn.addEventListener('click',function(){userSay(inp.value);});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();userSay(inp.value);}});

  // Голосовой ввод — Web Speech API (бесплатно, в браузере). Нет поддержки — кнопка скрыта.
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){
    mic.hidden=false;var rec=new SR();rec.lang='ru-RU';rec.interimResults=false;rec.maxAlternatives=1;var on=false;
    mic.addEventListener('click',function(){if(on){rec.stop();return;}try{rec.start();}catch(e){}});
    rec.onstart=function(){on=true;mic.classList.add('rec');inp.placeholder='Говорите…';};
    rec.onend=function(){on=false;mic.classList.remove('rec');inp.placeholder='Что с машиной? Словами или голосом…';};
    rec.onerror=function(){on=false;mic.classList.remove('rec');};
    rec.onresult=function(e){var txt=e.results[0][0].transcript;userSay(txt);};
  }
})();
