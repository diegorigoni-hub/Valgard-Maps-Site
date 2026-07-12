(() => {
  "use strict";
  const object = document.querySelector("#eldrath-map");
  const status = document.querySelector("#map-status");
  const detail = document.querySelector("#feature-detail");
  const search = document.querySelector("#feature-search");
  const suggestions = document.querySelector("#feature-options");
  const layerInputs = [...document.querySelectorAll("[data-layer]")];
  const fullView = [0, 0, 1600, 1000];
  const layerGroups = {biomes:["layer-biomes"],territories:["layer-territories"],regions:["layer-regions","layer-region-labels"],routes:["layer-routes"],hydrology:["layer-lakes","layer-rivers"],relief:["layer-relief"],settlements:["layer-settlements","layer-natural-ports"],unknown:["layer-unknown-regions"]};
  let features = new Map(), svg, view = [...fullView], drag;
  const setStatus = message => { status.textContent = message; };
  const setView = next => {
    const width = Math.max(220, Math.min(fullView[2], next[2]));
    const height = width / 1.6;
    const x = Math.max(0, Math.min(fullView[2] - width, next[0]));
    const y = Math.max(0, Math.min(fullView[3] - height, next[1]));
    view = [x, y, width, height];
    svg.setAttribute("viewBox", view.join(" "));
  };
  const zoom = factor => { const [x,y,w,h]=view,nw=w*factor,nh=h*factor; setView([x+(w-nw)/2,y+(h-nh)/2,nw,nh]); };
  const pan = (dx,dy) => setView([view[0]+dx,view[1]+dy,view[2],view[3]]);
  const formatRange = range => range?.status === "known" ? `${range.minimum}–${range.maximum} ${range.unit}` : "não informada";
  const addDetail = (list, label, value) => {
    const term=document.createElement("dt"),description=document.createElement("dd");
    term.textContent=label;description.textContent=value;list.append(term,description);
  };
  const showFeature = id => {
    const feature=features.get(id),target=svg?.getElementById(id); if(!feature||!target)return;
    const box=target.getBBox(),width=Math.max(300,box.width*2.4),height=width/1.6;
    setView([box.x+box.width/2-width/2,box.y+box.height/2-height/2,width,height]);
    const p=feature.properties,title=document.createElement("h2"),list=document.createElement("dl");
    title.textContent=p.name;list.className="detail-list";addDetail(list,"Categoria",p.type);addDetail(list,"Precisão",p.precision);addDetail(list,"Geometria","adaptação cartográfica");
    if(p.collection==="routes"){addDetail(list,"Distância",formatRange(p.distance));addDetail(list,"Viagem",formatRange(p.travelDays));}
    detail.replaceChildren(title,list);
    history.replaceState(null,"",`#feature=${encodeURIComponent(id)}`); setStatus(`${p.name} selecionado.`);
  };
  const findFeatureId = target => { let node=target; while(node&&node!==svg){if(node.id&&features.has(node.id))return node.id;node=node.parentElement;} return null; };
  const applyLayer = input => { for(const id of layerGroups[input.dataset.layer]||[]){const group=svg?.getElementById(id);if(group)group.hidden=!input.checked;} if(svg)setStatus(`Camada ${input.labels[0].textContent.trim()} ${input.checked?"visível":"oculta"}.`); };
  async function initialize(){
    const response=await fetch("downloads/eldrath-v001.geojson");if(!response.ok)throw new Error("GeoJSON indisponível");
    const geojson=await response.json();features=new Map(geojson.features.map(feature=>[feature.id,feature]));
    suggestions.replaceChildren(...[...features.values()].sort((a,b)=>a.properties.name.localeCompare(b.properties.name,"pt-BR")).map(feature=>{const option=document.createElement("option");option.value=feature.properties.name;option.dataset.id=feature.id;return option;}));
    svg=object.contentDocument?.documentElement;if(!svg)throw new Error("SVG indisponível");svg.setAttribute("tabindex","0");svg.setAttribute("aria-label","Mapa interativo de Eldrath");setView(fullView);
    const doc=object.contentDocument;
    doc.addEventListener("click",event=>{const id=findFeatureId(event.target);if(id)showFeature(id);});
    doc.addEventListener("wheel",event=>{event.preventDefault();zoom(event.deltaY<0?.82:1.2);},{passive:false});
    doc.addEventListener("pointerdown",event=>{drag={x:event.clientX,y:event.clientY,view:[...view]};event.target.setPointerCapture?.(event.pointerId);});
    doc.addEventListener("pointermove",event=>{if(!drag)return;const scale=drag.view[2]/object.clientWidth;setView([drag.view[0]-(event.clientX-drag.x)*scale,drag.view[1]-(event.clientY-drag.y)*scale,drag.view[2],drag.view[3]]);});
    doc.addEventListener("pointerup",()=>{drag=null;});
    doc.addEventListener("keydown",event=>{const step=view[2]*.08,actions={ArrowLeft:()=>pan(-step,0),ArrowRight:()=>pan(step,0),ArrowUp:()=>pan(0,-step),ArrowDown:()=>pan(0,step),"+":()=>zoom(.82),"-":()=>zoom(1.2),"0":()=>setView(fullView)};if(actions[event.key]){event.preventDefault();actions[event.key]();}});
    layerInputs.forEach(applyLayer);const selected=new URLSearchParams(location.hash.slice(1)).get("feature");if(selected)showFeature(selected);setStatus("Mapa interativo carregado. Use os controles, o mouse ou o teclado.");
  }
  document.querySelector("#zoom-in").addEventListener("click",()=>zoom(.82));document.querySelector("#zoom-out").addEventListener("click",()=>zoom(1.2));document.querySelector("#reset-view").addEventListener("click",()=>setView(fullView));
  layerInputs.forEach(input=>input.addEventListener("change",()=>applyLayer(input)));
  document.querySelector("#feature-form").addEventListener("submit",event=>{event.preventDefault();const option=[...suggestions.options].find(item=>item.value.toLocaleLowerCase("pt-BR")===search.value.toLocaleLowerCase("pt-BR"));if(option?.dataset.id)showFeature(option.dataset.id);else setStatus("Local não encontrado.");});
  const start=()=>initialize().catch(error=>setStatus(`Modo estático ativo: ${error.message}.`));
  if(object.contentDocument?.documentElement)start();else object.addEventListener("load",start,{once:true});
})();
