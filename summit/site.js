const preview = new URLSearchParams(location.search).has('draft');
const model = {...window.ascentContent,...(preview ? JSON.parse(localStorage.getItem('ascentDraft')||'{}') : {})};
document.querySelectorAll('[data-field]').forEach(el=>el.textContent=model[el.dataset.field]);
const title=document.querySelector('h1'), lines=model.headline.split('\n');
if(lines.length>1){title.textContent=lines.shift()+'\n';const accent=document.createElement('em');accent.textContent=lines.join(' ');title.append(accent)}
for(const id of model.order){const section=document.getElementById(id);if(section)document.querySelector('main').append(section)}
document.querySelector('#propertyImage').src=model.propertyImage;
if(model.logo){const img=new Image();img.src=model.logo;img.alt='Ascent Realty';img.style='max-width:200px;max-height:62px';document.querySelector('.brand').replaceChildren(img)}
for(const i of [1,2]){if(!model['agent'+i])continue;const card=document.createElement('article');if(model['portrait'+i]){const img=new Image();img.alt=model['agent'+i];img.src=model['portrait'+i];card.append(img)}const role=document.createElement('span');role.className='role';role.textContent=model['role'+i]||'The Kuhl Group';card.append(role);const name=document.createElement('strong');name.textContent=model['agent'+i];card.append(name);for(const [key,protocol] of [['email','mailto:'],['phone','tel:']]){const value=model[key+i];if(value){const a=document.createElement('a');a.href=protocol+value;a.textContent=value;card.append(a)}}document.querySelector('#agents').append(card)}

document.querySelector('form').onsubmit=async e=>{e.preventDefault();const form=e.target,f=new FormData(form);if(f.get('_honey'))return;const out=form.querySelector('output');const name=String(f.get('name')||'').trim(),email=String(f.get('email')||'').trim(),phone=String(f.get('phone')||'').trim(),message=String(f.get('message')||'').trim();
if(!name||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!message){out.className='err';out.textContent='Please add your name, a valid email, and a short message.';return}
const to=model.leadEmail||model.email1;
if(model.inboxEnabled&&!preview&&to){const button=form.querySelector('button');button.disabled=true;button.textContent='Sending…';out.textContent='';out.className='';
try{const res=await fetch('https://formsubmit.co/ajax/'+to,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({Name:name,Email:email,Phone:phone||'Not provided',Message:message,_subject:'New website inquiry from '+name,_replyto:email,_template:'table',_url:location.href})});const data=await res.json().catch(()=>({}));if(!res.ok||String(data.success)!=='true')throw Error(data.message||res.status);
form.reset();out.className='ok';out.textContent='Thank you, '+name.split(' ')[0]+'. Hagen has your message and will be in touch soon.'}
catch(err){console.warn('Inquiry delivery failed',err);out.className='err';out.innerHTML='';out.append('Something went wrong sending your message. ');const a=document.createElement('a');a.href='mailto:'+to+'?subject='+encodeURIComponent('Website inquiry')+'&body='+encodeURIComponent(message+'\n\n'+name+'\n'+email+(phone?'\n'+phone:''));a.textContent='Email us directly ↗';out.append(a)}
finally{button.disabled=false;button.innerHTML='Send inquiry <b>→</b>'}return}
location.href='mailto:'+encodeURIComponent(to||'')+'?subject=Ascent Realty inquiry&body='+encodeURIComponent(message+'\n\n'+name+'\n'+email);out.textContent='Your email app will open with your inquiry.'};
document.querySelectorAll('a[href^="/#"]').forEach(anchor=>{
  anchor.addEventListener('click',event=>{
    const target=document.getElementById(anchor.hash.slice(1));
    if(target){event.preventDefault();target.scrollIntoView();}
  });
});




const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12}):null;
document.querySelectorAll('.trust, #services h2, .card, .property, .groupGrid>div, .contactGrid>div, form').forEach((el,i)=>{if(!io)return;el.classList.add('reveal');el.style.transitionDelay=(el.classList.contains('card')?[...el.parentNode.children].indexOf(el)*80:0)+'ms';io.observe(el)});

/* live weather for Gypsum, CO (Open-Meteo, free, no key); hidden if unavailable */
(async()=>{try{const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=39.6466&longitude=-106.9517&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit&timezone=America%2FDenver');const d=(await r.json()).current;const c=d.weather_code;
const label=c===0?'Clear sky':c<=2?'Partly cloudy':c===3?'Overcast':c<=48?'Fog':c<=67?'Rain':c<=77?'Snow':c<=82?'Showers':c<=86?'Snow showers':'Thunderstorms';
const icons={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',cloud:'<path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 18z"/>',snow:'<path d="M7 14h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 14z"/><path d="M8 18v.01M12 20v.01M16 18v.01"/>',rain:'<path d="M7 14h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 14z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>'};
const k=c<=1?(d.is_day?'sun':'moon'):(c>=71&&c<=77)||c===85||c===86?'snow':c>=51&&c!==71?'rain':'cloud';
const el=document.getElementById('wx');el.querySelector('svg').innerHTML=icons[k];document.getElementById('wxText').textContent=Math.round(d.temperature_2m)+'° '+label;el.hidden=false}catch(e){}})();
