'use strict';
const themeButton = document.getElementById('theme-toggle');
function updateThemeButton(){const light=document.documentElement.dataset.theme==='light';const label=`Switch to ${light?'dark':'light'} mode`;themeButton.setAttribute('aria-label',label);themeButton.title=label;document.querySelector('meta[name="theme-color"]').content=light?'#f7f7f9':'#090a0c'}
themeButton.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('patoo-theme',document.documentElement.dataset.theme)}catch{}updateThemeButton()});updateThemeButton();
const menuButton=document.getElementById('menu-toggle');const mobileNav=document.getElementById('mobile-nav');
function closeMenu(){mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open navigation')}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';mobileNav.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation')});mobileNav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
document.getElementById('year').textContent=new Date().getFullYear();
const icons={
  terminal:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/>',
  shield:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  tool:'<path d="m14 6 4-3a6 6 0 0 1-7 8l-6 8a2 2 0 0 1-3-3l8-6a6 6 0 0 1 4-8Z"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/>',
  code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>',
  layers:'<path d="m12 3 10 5-10 5L2 8Zm-9 10 9 5 9-5M3 18l9 5 9-5"/>',
  flag:'<path d="M4 22V3m0 1c6-5 10 5 16 0v11c-6 5-10-5-16 0"/>',
  award:'<circle cx="12" cy="8" r="5"/><path d="m8 12-2 9 6-3 6 3-2-9"/>',
  instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/>',
  facebook:'<path d="M14 21v-8h3l.5-4H14V7c0-1.5.5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8"/>',
  github:'<path d="M9 19c-4 1-4-2-6-2m12 4v-4c0-1 .2-1.5-.5-2 3-.4 6-1.4 6-6a5 5 0 0 0-1.4-3.5A4.5 4.5 0 0 0 19 2s-1.5-.5-4 1a13 13 0 0 0-6 0C6.5 1.5 5 2 5 2a4.5 4.5 0 0 0-.1 3.5A5 5 0 0 0 3.5 9c0 4.6 3 5.6 6 6-.7.5-.5 1-.5 2v4"/>'
};
function svg(name){return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.code}</svg>`}
function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
function safeUrl(value){try{const url=new URL(value);return url.protocol==='https:'||url.protocol==='http:'?url.href:null}catch{return null}}
const data=window.PORTFOLIO;
function renderStack(filter){const list=document.getElementById('stack-list');list.replaceChildren();data.stack.filter(group=>filter==='all'||group.group===filter).forEach(group=>{const row=el('div','stack-row');const heading=el('h3','stack-category');const icon=el('span','stack-icon');icon.innerHTML=svg(group.icon);heading.append(icon,document.createTextNode(group.title));const chips=el('div','stack-chips');group.items.forEach(item=>chips.append(el('span','tech-chip',item)));row.append(heading,chips);list.append(row)})}
renderStack('all');
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(other=>{const selected=other===button;other.classList.toggle('selected',selected);other.setAttribute('aria-pressed',String(selected))});renderStack(button.dataset.filter)}));
const projectGrid=document.getElementById('project-grid');
data.projects.forEach((project,index)=>{
  const card=el('article','project-card');
  const preview=el('div','project-preview');
  const code=el('span','project-index',String(index+1).padStart(2,'0'));
  const icon=el('div','project-symbol');icon.innerHTML=svg(['shield','flag','code'][index%3]);
  const status=el('span','project-status mono',project.comingSoon?'COMING SOON':(project.status||'FEATURED'));
  preview.append(code,icon,status);
  const body=el('div','project-body');body.append(el('p','project-category mono',project.category),el('h3','',project.title),el('p','project-description',project.description));
  const tags=el('div','project-tags');(project.tags||[]).forEach(tag=>tags.append(el('span','',tag)));body.append(tags);
  const internal=project.internal&&/^[a-z0-9-]+\.html(?:#[a-z0-9-]+)?$/i.test(project.url);
  const url=internal?project.url:safeUrl(project.url);
  if(!project.comingSoon&&url){const link=el('a','project-link',project.linkLabel||'View project');link.href=url;if(internal){card.classList.add('linked-project');link.setAttribute('aria-label',`Open ${project.title}: Hack4Gov review notes`)}else{link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`View ${project.title} (opens in a new tab)`)}body.append(link)}
  card.append(preview,body);projectGrid.append(card);
});
const socialGrid=document.getElementById('social-links');
for(const [key,label,handle] of [['instagram','Instagram','@azzzriieell'],['facebook','Facebook','Rance Sabino'],['github','GitHub','@azzzriieell00']]){const url=safeUrl(data.social[key]);const card=el(url?'a':'div','social-card');if(url){card.href=url;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`${label}: ${handle} (opens in a new tab)`)}const icon=el('div','social-icon');icon.innerHTML=svg(key);const content=el('div','social-content');content.append(el('strong','',label),el('span','',url?handle:'Link coming soon'));const marker=el('span','social-marker mono',url?'[ CONNECT ]':'[ SOON ]');card.append(icon,content,marker);socialGrid.append(card)}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}},{threshold:.08});document.querySelectorAll('.reveal').forEach(section=>{section.classList.add('reveal-ready');observer.observe(section)});const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)document.querySelectorAll('.desktop-nav a').forEach(link=>link.classList.toggle('active',link.hash===`#${entry.target.id}`))})},{rootMargin:'-15% 0px -65% 0px'});document.querySelectorAll('main section[id]').forEach(section=>navObserver.observe(section))}
