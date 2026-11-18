(function(){
  "use strict";
  var LANG=(document.documentElement.lang||"en").slice(0,2);
  var ROOT=LANG==="en"?"":"../";
  var jobs=document.getElementById("jobs");
  if(jobs&&window.fetch){
    fetch(ROOT+"jobs.json",{credentials:"omit"}).then(function(r){return r.ok?r.json():{}}).then(function(d){
      (d[LANG]||[]).forEach(function(o){var op=document.createElement("option");op.value=String(o.j);jobs.appendChild(op)});
    }).catch(function(){});
  }
  var need=document.getElementById("need"),ask=document.getElementById("ask"),reveal=document.getElementById("reveal");
  document.querySelectorAll(".chip").forEach(function(c){c.addEventListener("click",function(){if(need){need.value=c.textContent;need.focus()}})});
  if(ask&&reveal){
    ask.addEventListener("submit",function(e){
      e.preventDefault();reveal.hidden=false;var hs=document.querySelector(".hero-stores");if(hs)hs.hidden=true;
      var a=reveal.querySelector("a");if(a)a.focus();
    });
  }
  document.querySelectorAll("details.langs,details.burger").forEach(function(d){
    document.addEventListener("click",function(e){if(d.open&&!d.contains(e.target))d.open=false});
  });
})();
