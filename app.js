const properties = window.BUSVA_PROPERTIES || [];
const $ = (selector) => document.querySelector(selector);
const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
let filtered = properties;
let visible = 24;
let selected = null;
let galleryIndex = 0;

const faq = {
  "¿Puedo comprar con crédito?": "No. Las propiedades de remate bancario se adquieren únicamente con recursos propios; no se aceptan créditos bancarios, Infonavit ni Fovissste.",
  "¿Puedo visitar la propiedad?": "Debido a la naturaleza del proceso, la propiedad solamente puede conocerse por el exterior antes de la adquisición.",
  "¿Cuánto tarda la entrega?": "El tiempo estimado de entrega es de 6 a 14 meses. Un asesor puede explicarte las condiciones específicas del inmueble que te interesa.",
  "¿Cómo recibo información de una propiedad?": "Pulsa “Solicitar información” en el anuncio. Te atenderemos por WhatsApp y podremos agendar una cita por Zoom o en una de nuestras oficinas."
};

function escapeHTML(value = "") { return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]); }
function whatsapp(property) { return `https://wa.me/523343340062?text=${encodeURIComponent(`Hola, deseo información sobre la propiedad de ${property.city} con precio de ${money.format(property.price)}.`)}`; }

function render() {
  $("#result-count").textContent = `${filtered.length} propiedades publicadas.`;
  $("#property-grid").innerHTML = filtered.slice(0, visible).map(property => `
    <article class="property-card">
      <button class="property-image" data-open="${property.id}" aria-label="Ver fotografías"><img src="${property.images[0]}" alt="${escapeHTML(property.title)}" loading="lazy"><span>Remate bancario</span><small class="photo-count">▧ ${property.images.length} fotos</small></button>
      <div class="property-body"><div class="property-location"><span>⌖</span><div><strong>${escapeHTML(property.title)}</strong><small>${escapeHTML(property.address)}</small></div></div><h3>${money.format(property.price)}</h3><div class="features"><span>${property.beds} rec.</span><span>${property.baths} baños</span><span>${property.meters} m²</span></div><p class="card-description">${escapeHTML(property.description)}</p><button class="details-button" data-open="${property.id}">Ver información completa</button><a href="${whatsapp(property)}" target="_blank">Solicitar información</a></div>
    </article>`).join("");
  $("#load-more").hidden = visible >= filtered.length;
  $("#empty").hidden = filtered.length > 0;
}

function applyFilters() {
  const query = $("#location").value.trim().toLowerCase();
  const type = $("#type").value;
  const price = Number($("#price").value || Infinity);
  filtered = properties.filter(property => `${property.title} ${property.city} ${property.state} ${property.area} ${property.description}`.toLowerCase().includes(query) && (!type || property.type === type) && property.price <= price);
  visible = 24; render(); $("#propiedades").scrollIntoView({ behavior: "smooth" });
}

function renderGallery() {
  const images = selected.images;
  $("#gallery-main").innerHTML = `<img src="${images[galleryIndex]}" alt="${escapeHTML(selected.title)}, fotografía ${galleryIndex + 1}">${images.length > 1 ? `<button class="gallery-arrow previous" data-direction="-1">‹</button><button class="gallery-arrow next" data-direction="1">›</button><small class="gallery-counter">${galleryIndex + 1} / ${images.length}</small>` : ""}`;
  $("#gallery-thumbs").innerHTML = images.length > 1 ? images.map((image, index) => `<button class="${index === galleryIndex ? "active" : ""}" data-image="${index}"><img src="${image}" alt="" loading="lazy"></button>`).join("") : "";
}

function openProperty(id) {
  selected = properties.find(property => property.id === Number(id)); galleryIndex = 0;
  $("#modal-content").innerHTML = `<span class="eyebrow">Remate bancario</span><h2>${escapeHTML(selected.title)}</h2><h3>${money.format(selected.price)}</h3><div class="modal-features"><span>${selected.beds} recámaras</span><span>${selected.baths} baños</span><span>${selected.meters} m²</span></div><div class="modal-section"><strong>Ubicación publicada</strong><p>${escapeHTML(selected.address)}</p></div><div class="modal-section"><strong>Descripción de la propiedad</strong><p>${escapeHTML(selected.description)}</p></div>${selected.amenities.length ? `<div class="modal-section"><strong>Servicios y amenidades</strong><p>${selected.amenities.map(escapeHTML).join(" · ")}</p></div>` : ""}<div class="modal-note"><strong>Información importante</strong><p>Operación con recursos propios. No se aceptan créditos. La propiedad puede conocerse únicamente por el exterior.</p></div><a class="modal-whatsapp" href="${whatsapp(selected)}" target="_blank">Pedir información por WhatsApp</a>`;
  renderGallery(); $("#modal").hidden = false; document.body.style.overflow = "hidden";
}
function closeModal() { $("#modal").hidden = true; document.body.style.overflow = ""; }

document.addEventListener("click", event => {
  const open = event.target.closest("[data-open]"); if (open) openProperty(open.dataset.open);
  const direction = event.target.closest("[data-direction]"); if (direction) { galleryIndex = (galleryIndex + Number(direction.dataset.direction) + selected.images.length) % selected.images.length; renderGallery(); }
  const image = event.target.closest("[data-image]"); if (image) { galleryIndex = Number(image.dataset.image); renderGallery(); }
});

$("#modal-close").onclick = closeModal;
$("#modal").onclick = event => { if (event.target === $("#modal")) closeModal(); };
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
$("#search").onclick = applyFilters;
$("#location").onkeydown = event => { if (event.key === "Enter") applyFilters(); };
$("#clear").onclick = $("#show-all").onclick = () => { $("#location").value = ""; $("#type").value = ""; $("#price").value = ""; filtered = properties; visible = 24; render(); };
$("#load-more").onclick = () => { visible += 24; render(); };
$("#menu").onclick = () => $("#nav").classList.toggle("open");
$("#theme").onclick = () => { const theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = theme; localStorage.setItem("busva-theme", theme); };
document.documentElement.dataset.theme = localStorage.getItem("busva-theme") || "dark";

const types = [...new Set(properties.map(property => property.type))].sort();
$("#type").insertAdjacentHTML("beforeend", types.map(type => `<option>${escapeHTML(type)}</option>`).join(""));
const questions = Object.keys(faq); $("#faq-answer").textContent = faq[questions[0]];
$("#faq-buttons").innerHTML = questions.map((question, index) => `<button class="${index === 0 ? "active" : ""}" data-question="${escapeHTML(question)}">${escapeHTML(question)}</button>`).join("");
$("#faq-buttons").onclick = event => { const button = event.target.closest("[data-question]"); if (!button) return; $("#faq-answer").textContent = faq[button.dataset.question]; $("#faq-buttons").querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button)); };
$("#appointment").onsubmit = event => { event.preventDefault(); const message = `Hola, deseo agendar una cita informativa.\nNombre: ${$("#name").value}\nModalidad: ${$("#mode").value}\nFecha preferida: ${$("#date").value}\nHorario preferido: ${$("#time").value}`; window.open(`https://wa.me/523343340062?text=${encodeURIComponent(message)}`, "_blank"); };
render();
