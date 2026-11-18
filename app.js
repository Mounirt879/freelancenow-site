(function(){
  var API="https://api.freelancenow.io/waitlist";
  var LANG=(document.documentElement.lang||"en").slice(0,2);
  var ROOT=LANG==="en"?"":"../";
  var M={
    en:{locate:"Locate me",locating:"Locating...",located:"Located",noloc:"Location is not available on this device",saving:"Saving...",
        okC:"Done. We will email you as soon as someone near you is on the map.",okP:"You are on the list. We will text you when people near you can see you.",
        err:"This did not go through. Write to contact@freelancenow.io and we will add you.",
        shareH:"Want it to open faster near you?",shareP:"Every person you bring in fills the map in your area. Share your link:",
        shareMsg:"I just joined FreelanceNow: people near you who are free right now, for any job. Free.",
        share:"Share",text:"Text",copy:"Copy link",copied:"Copied"},
    es:{locate:"Ubicarme",locating:"Ubicando...",located:"Ubicado",noloc:"La ubicación no está disponible en este dispositivo",saving:"Guardando...",
        okC:"Listo. Te avisamos por email en cuanto haya alguien cerca de ti.",okP:"Ya estás en la lista. Te mandamos un mensaje cuando la gente cerca de ti pueda verte.",
        err:"No se pudo enviar. Escribe a contact@freelancenow.io y te agregamos.",
        shareH:"¿Quieres que abra antes en tu zona?",shareP:"Cada persona que invitas llena el mapa en tu zona. Comparte tu enlace:",
        shareMsg:"Me uní a FreelanceNow: gente cerca de ti que está libre ahora, para cualquier trabajo. Gratis.",
        share:"Compartir",text:"Mensaje",copy:"Copiar enlace",copied:"Copiado"},
    fr:{locate:"Me localiser",locating:"Localisation...",located:"Localisé",noloc:"La localisation n'est pas disponible sur cet appareil",saving:"Envoi...",
        okC:"C'est noté. On t'écrit dès que quelqu'un près de toi est sur la carte.",okP:"Tu es sur la liste. On t'envoie un message quand les gens près de toi peuvent te voir.",
        err:"Ça n'est pas passé. Écris à contact@freelancenow.io et on t'ajoute.",
        shareH:"Tu veux que ça démarre plus vite près de toi ?",shareP:"Chaque personne que tu invites remplit la carte autour de toi. Partage ton lien :",
        shareMsg:"Je viens de rejoindre FreelanceNow : des gens dispo maintenant près de toi, pour tous les métiers. Gratuit.",
        share:"Partager",text:"SMS",copy:"Copier le lien",copied:"Copié"},
    ar:{locate:"حدد موقعي",locating:"جار التحديد...",located:"تم التحديد",noloc:"تحديد الموقع غير متاح على هذا الجهاز",saving:"جار الإرسال...",
        okC:"تم. سنراسلك فور ظهور شخص قريب منك على الخريطة.",okP:"أنت على القائمة. سنرسل لك رسالة حين يستطيع الناس القريبون رؤيتك.",
        err:"لم يتم الإرسال. اكتب إلى contact@freelancenow.io وسنضيفك.",
        shareH:"تريد أن يبدأ أسرع بالقرب منك؟",shareP:"كل شخص تدعوه يملأ الخريطة حولك. شارك رابطك:",
        shareMsg:"انضممت إلى FreelanceNow: أشخاص متاحون الآن بالقرب منك، لكل المهن. مجانا.",
        share:"مشاركة",text:"رسالة",copy:"نسخ الرابط",copied:"تم النسخ"}
  }[LANG]||{};

  // Remember who invited this visitor (?ref=CODE)
  var refBy="";
  try{refBy=new URLSearchParams(location.search).get("ref")||localStorage.getItem("fn_ref_by")||"";if(refBy)localStorage.setItem("fn_ref_by",refBy)}catch(e){}
  function myCode(){var c="";try{c=localStorage.getItem("fn_code")}catch(e){}
    if(!c){c=Math.random().toString(36).slice(2,8);try{localStorage.setItem("fn_code",c)}catch(e){}}return c}

  // Job suggestions (autocomplete) in the visitor's language
  var jobsList=document.getElementById("jobs");
  if(jobsList){
    fetch(ROOT+"jobs.json").then(function(r){return r.json()}).then(function(d){
      jobsList.innerHTML=(d[LANG]||[]).map(function(o){return '<option value="'+o.j.replace(/"/g,"&quot;")+'">'}).join("");
    }).catch(function(){});
  }

  // Locate me, next to every ZIP field
  var PIN='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var nearCity=document.getElementById("near-city");
  function setHidden(f,k,v){var h=f.querySelector("input[type=hidden][name="+k+"]");if(!h){h=document.createElement("input");h.type="hidden";h.name=k;f.appendChild(h)}h.value=v}
  function locate(input,btn){
    var label=btn.querySelector("span");
    if(!navigator.geolocation){btn.title=M.noloc;return}
    label.textContent=M.locating;btn.disabled=true;
    navigator.geolocation.getCurrentPosition(function(pos){
      var lat=pos.coords.latitude,lng=pos.coords.longitude,f=input.form;
      setHidden(f,"lat",lat);setHidden(f,"lng",lng);
      fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+lat+"&longitude="+lng+"&localityLanguage="+LANG)
        .then(function(r){return r.json()})
        .then(function(d){
          var city=d.city||d.locality||"";
          if(city){setHidden(f,"city",city);if(nearCity)nearCity.textContent=city;input.value=city}else{input.removeAttribute("required");input.placeholder=M.located}
          label.textContent=city||M.located;
        })
        .catch(function(){input.removeAttribute("required");input.placeholder=M.located;label.textContent=M.located})
        .finally(function(){btn.disabled=false});
    },function(){label.textContent=M.locate;btn.disabled=false;input.focus()},{timeout:10000,maximumAge:600000});
  }
  document.querySelectorAll("input[name=place]:not([type=hidden])").forEach(function(input){
    var wrap=document.createElement("span");wrap.className="where";
    input.parentNode.insertBefore(wrap,input);wrap.appendChild(input);
    var b=document.createElement("button");b.type="button";b.className="locate";
    b.setAttribute("aria-label",M.locate);b.innerHTML=PIN+"<span>"+M.locate+"</span>";
    b.addEventListener("click",function(){locate(input,b)});
    wrap.appendChild(b);
  });

  // Example chips fill the search
  var need=document.getElementById("need"),ask=document.getElementById("ask"),reveal=document.getElementById("reveal");
  document.querySelectorAll(".chip").forEach(function(c){c.addEventListener("click",function(){if(need){need.value=c.textContent;need.focus()}})});

  // Search: nobody on the map yet, so offer the alert with what they typed
  if(ask&&reveal){
    ask.addEventListener("submit",function(e){
      e.preventDefault();reveal.hidden=false;
      var f=reveal.querySelector("form");
      f.querySelector("[name=need]").value=need.value;
      var z=f.querySelector("input[name=place]:not([type=hidden])");z.value=document.getElementById("azip").value;
      ["lat","lng","city"].forEach(function(k){var s=ask.querySelector("input[type=hidden][name="+k+"]");if(s)setHidden(f,k,s.value)});
      f.querySelector("[name=email]").focus();
    });
  }

  // After sign-up: share your link (brings more people to your area)
  function shareCard(form){
    var url="https://freelancenow.io/"+(LANG==="en"?"":LANG+"/")+"?ref="+myCode();
    var msg=M.shareMsg+" "+url;
    var box=document.createElement("div");box.className="sharecard";
    box.innerHTML='<p class="sh-h">'+M.shareH+'</p><p>'+M.shareP+'</p><div class="sh-row">'+
      (navigator.share?'<button type="button" class="sh-native">'+M.share+'</button>':'')+
      '<a class="sh-sms" href="sms:?&body='+encodeURIComponent(msg)+'">'+M.text+'</a>'+
      '<a class="sh-wa" href="https://wa.me/?text='+encodeURIComponent(msg)+'" target="_blank" rel="noopener">WhatsApp</a>'+
      '<button type="button" class="sh-copy">'+M.copy+'</button></div>';
    var n=box.querySelector(".sh-native");if(n)n.addEventListener("click",function(){navigator.share({title:"FreelanceNow",text:M.shareMsg,url:url}).catch(function(){})});
    box.querySelector(".sh-copy").addEventListener("click",function(e){var b=e.target;(navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(function(){b.textContent=M.copied}).catch(function(){prompt("",url)})});
    form.appendChild(box);
  }

  function send(form,data){
    var msg=form.querySelector(".form-msg"),btn=form.querySelector("button[type=submit]");
    btn.disabled=true;msg.className="form-msg";msg.textContent=M.saving;
    fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})
      .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
      .then(function(){msg.className="form-msg ok";msg.textContent=data.kind==="pro"?M.okP:M.okC;form.reset();if(!form.querySelector(".sharecard"))shareCard(form)})
      .catch(function(){msg.className="form-msg err";msg.textContent=M.err})
      .finally(function(){btn.disabled=false});
  }
  document.querySelectorAll("form.notify,form.pro-form").forEach(function(f){
    f.addEventListener("submit",function(e){
      e.preventDefault();
      var d={kind:f.dataset.kind,trade:f.dataset.trade||"",page:location.pathname,lang:LANG,code:myCode(),ref_by:refBy};
      var when=[];
      new FormData(f).forEach(function(v,k){if(k==="when")when.push(v);else d[k]=v});
      if(when.length)d.when=when;
      send(f,d);
    });
  });
})();
