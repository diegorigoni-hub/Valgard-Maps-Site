(() => {
  "use strict";
  const state = {entries: []};
  const search = document.querySelector("#atlas-search");
  const kind = document.querySelector("#atlas-kind");
  const theme = document.querySelector("#atlas-theme");
  const knowledge = document.querySelector("#atlas-knowledge");
  const period = document.querySelector("#atlas-period");
  const results = document.querySelector("#atlas-results");
  const status = document.querySelector("#atlas-status");

  const knowledgeOf = item => item.themes.includes("lendário") ? "legendary" : item.themes.includes("desconhecido") ? "unknown" : "known";
  const knowledgeLabel = value => ({known: "Conhecido", unknown: "Desconhecido", legendary: "Lendário"})[value];
  const formatRange = range => range?.status === "known" ? `${range.minimum}–${range.maximum} ${range.unit === "travel-day" ? "dias" : range.unit}` : "não informada";
  const routeLabels = {terrestrial:"Terrestre", fluvial:"Fluvial", maritime:"Marítima", "year-round":"Todo o ano", seasonal:"Sazonal", low:"Baixo", moderate:"Moderado", high:"Alto"};
  const writeState = () => {
    const params = new URLSearchParams();
    if (search.value.trim()) params.set("q", search.value.trim());
    if (kind.value !== "all") params.set("kind", kind.value);
    if (theme.value !== "all") params.set("theme", theme.value);
    if (knowledge.value !== "all") params.set("knowledge", knowledge.value);
    history.replaceState(null, "", params.size ? `#${params}` : location.pathname);
  };
  const mapLink = item => {
    const params = new URLSearchParams({feature: item.mapEntityIds[0] || ""});
    params.set("layers", "biomes,territories,regions,routes,hydrology,relief,settlements,unknown");
    return `index.html#${params}`;
  };
  const render = (persist = true) => {
    const query = search.value.trim().toLocaleLowerCase("pt-BR");
    const filtered = state.entries.filter(item =>
      (kind.value === "all" || item.kind === kind.value) &&
      (theme.value === "all" || item.themes.includes(theme.value)) &&
      (knowledge.value === "all" || knowledgeOf(item) === knowledge.value) &&
      (period.value === "all" || item.period === period.value) &&
      (`${item.title} ${item.summary} ${item.themes.join(" ")}`).toLocaleLowerCase("pt-BR").includes(query)
    );
    results.replaceChildren();
    for (const item of filtered) {
      const article = document.createElement("article");
      article.className = "panel atlas-card";
      article.id = item.id;
      article.tabIndex = -1;
      const title = document.createElement("h2");
      title.textContent = item.title;
      const badges = document.createElement("p");
      badges.className = "atlas-badges";
      const categoryBadge = document.createElement("span");
      categoryBadge.textContent = item.kind === "route" ? "Rota" : item.kind === "theme" ? "Tema" : "Lugar";
      const knowledgeBadge = document.createElement("span");
      knowledgeBadge.dataset.knowledge = knowledgeOf(item);
      knowledgeBadge.textContent = knowledgeLabel(knowledgeOf(item));
      badges.append(categoryBadge, knowledgeBadge);
      const summary = document.createElement("p");
      summary.textContent = item.summary;
      const tags = document.createElement("p");
      tags.className = "atlas-tags";
      tags.textContent = item.themes.join(" · ");
      const travel = document.createElement("dl");
      travel.className = "atlas-travel";
      if (item.travel) {
        const rows = [
          ["Modalidade", routeLabels[item.travel.routeClass] || item.travel.routeClass],
          ["Distância", formatRange(item.travel.distance)],
          ["Ida", formatRange(item.travel.travelDays)],
          ["Retorno", formatRange(item.travel.reverseTravelDays)],
          ["Disponibilidade", routeLabels[item.travel.availability] || item.travel.availability],
          ["Risco", routeLabels[item.travel.riskLevel] || item.travel.riskLevel],
          ["Função", item.travel.routeFunction]
        ];
        for (const [label, value] of rows) {const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=label;dd.textContent=value;travel.append(dt,dd);}
      }
      const link = document.createElement("a");
      link.href = mapLink(item);
      link.textContent = "Ver no mapa";
      article.append(title, badges, summary, ...(item.travel ? [travel] : []), tags, link);
      results.append(article);
    }
    status.textContent = filtered.length ? `${filtered.length} ficha(s) pública(s).` : "Nenhum conteúdo público aprovado nesta combinação.";
    if (persist) writeState();
  };
  const populateThemes = () => {
    const themes = [...new Set(state.entries.flatMap(item => item.themes))].sort((a, b) => a.localeCompare(b, "pt-BR"));
    theme.append(...themes.map(value => Object.assign(document.createElement("option"), {value, textContent: value[0].toLocaleUpperCase("pt-BR") + value.slice(1)})));
  };
  const restoreState = () => {
    const params = new URLSearchParams(location.hash.slice(1));
    search.value = params.get("q") || "";
    for (const [control, key] of [[kind, "kind"], [theme, "theme"], [knowledge, "knowledge"]]) {
      if ([...control.options].some(option => option.value === params.get(key))) control.value = params.get(key);
    }
    const entry = params.get("entry");
    if (entry) {
      const item = state.entries.find(candidate => candidate.id === entry);
      if (item) search.value = item.title;
    }
    render(false);
    if (entry) requestAnimationFrame(() => document.getElementById(entry)?.focus());
  };

  for (const control of [search, kind, theme, knowledge, period]) control.addEventListener("input", () => render());
  fetch("data/atlas.json")
    .then(response => {if (!response.ok) throw new Error("catálogo indisponível"); return response.json();})
    .then(data => {state.entries = data.entries; populateThemes(); restoreState();})
    .catch(() => {status.textContent = "Não foi possível carregar o atlas.";});
})();
