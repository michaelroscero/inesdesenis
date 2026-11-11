(function () {
  const language = document.documentElement.lang === "en" ? "en" : "es";
  const worksSection = document.querySelector("#obra");
  const email = "inesdesenis@gmail.com";
  const availabilityLabels = {
    es: {
      available: "Disponible · consultar",
      sold: "Vendida",
      "not-for-sale": "No está a la venta",
      enquire: "Consultar disponibilidad"
    },
    en: {
      available: "Available · enquire",
      sold: "Sold",
      "not-for-sale": "Not for sale",
      enquire: "Enquire about availability"
    }
  };
  const interfaceText = {
    es: {
      selected: "Selección de ",
      works: " piezas",
      previous: "Imagen anterior",
      next: "Imagen siguiente",
      detail: "Ver pieza",
      poem: "Leer el poema · Emily Dickinson",
      spanish: "Español",
      english: "English",
      price: "Consultar precio →",
      available: "Consultar disponibilidad →"
    },
    en: {
      selected: "Selected from a series of ",
      works: " pieces",
      previous: "Previous image",
      next: "Next image",
      detail: "View pieces",
      poem: "Read the poem · Emily Dickinson",
      spanish: "Spanish",
      english: "English",
      price: "Enquire about price →",
      available: "Enquire about availability →"
    }
  };

  function localized(value) {
    if (typeof value === "string") return value;
    return value && typeof value === "object" ? value[language] || "" : "";
  }

  function isSafeAssetPath(value) {
    const assetPath = typeof value === "string" && value.startsWith("/") ? value.slice(1) : value;
    return typeof assetPath === "string" &&
      !value.startsWith("//") &&
      !assetPath.includes("\\") &&
      assetPath.startsWith("assets/") &&
      assetPath.split("/").every(segment => segment && segment !== "." && segment !== "..");
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function validate(site) {
    if (!site || !Array.isArray(site.works)) {
      throw new Error("Website content must contain a works list.");
    }
    const ids = new Set();
    for (const work of site.works) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(work.id || "")) {
        throw new Error(`Invalid or missing artwork ID: ${work.id || "(empty)"}`);
      }
      if (ids.has(work.id)) throw new Error(`Duplicate artwork ID: ${work.id}`);
      ids.add(work.id);
      if (!["featured", "carousel", "lunar", "logos", "single"].includes(work.layout)) {
        throw new Error(`Invalid presentation layout for ${work.id}.`);
      }
      if (!Array.isArray(work.images)) throw new Error(`Images must be a list for ${work.id}.`);
      for (const image of work.images) {
        if (!isSafeAssetPath(image.src)) {
          throw new Error(`Invalid image path ${JSON.stringify(image.src)} for ${work.id}; expected a path inside assets/.`);
        }
      }
      if (work.video && !isSafeAssetPath(work.video)) {
        throw new Error(`Invalid video path ${JSON.stringify(work.video)} for ${work.id}; expected a path inside assets/.`);
      }
    }
    if (site.works.filter(work => work.published && work.featured).length > 1) {
      throw new Error("Only one published artwork can be featured on the homepage.");
    }
  }

  function makeHeading(work, number) {
    const heading = element("div", "artwork-heading");
    heading.append(element("span", "number", String(number).padStart(2, "0")));
    const titleBlock = element("div");
    const title = element("h3", "", localized(work.title));
    titleBlock.append(title);
    const subtitle = localized(work.subtitle);
    if (subtitle) titleBlock.append(element("p", "french", subtitle));
    heading.append(titleBlock);
    const medium = localized(work.medium);
    if (medium) heading.append(element("span", "medium", medium));
    return heading;
  }

  function makeFigure(image, loading) {
    const figure = element("figure");
    const img = element("img");
    img.src = image.src;
    img.alt = localized(image.alt);
    img.loading = loading || "lazy";
    figure.append(img);
    const caption = localized(image.caption);
    if (caption) figure.append(element("figcaption", "", caption));
    return figure;
  }

  function makeFacts(work) {
    if (!Array.isArray(work.facts) || work.facts.length === 0) return null;
    const list = element("dl");
    for (const fact of work.facts) {
      const label = localized(fact.label);
      const value = localized(fact.value);
      if (!label || !value) continue;
      list.append(element("dt", "", label), element("dd", "", value));
    }
    return list.children.length ? list : null;
  }

  function makeCopy(work) {
    const copy = element("div");
    const introduction = localized(work.introduction);
    if (introduction) {
      copy.append(element(work.layout === "featured" ? "p" : "p", work.layout === "featured" ? "" : "lede", introduction));
    }
    const paragraphs = work.paragraphs && work.paragraphs[language];
    if (Array.isArray(paragraphs)) {
      for (const paragraph of paragraphs) {
        if (paragraph) copy.append(element("p", "", paragraph));
      }
    }
    const facts = makeFacts(work);
    if (facts) copy.append(facts);
    return copy;
  }

  function makeCarousel(work, images) {
    const controlsId = `${work.id}-track`;
    const carousel = element("div", "art-carousel");
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-label", localized(work.title));
    carousel.setAttribute("aria-roledescription", language === "es" ? "carrusel" : "carousel");
    const track = element("div", "carousel-track");
    track.id = controlsId;
    track.tabIndex = 0;
    images.forEach((image, index) => {
      const slide = makeFigure(image);
      slide.className = "carousel-slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-label", `${language === "es" ? "Imagen" : "Image"} ${index + 1} ${language === "es" ? "de" : "of"} ${images.length}`);
      track.append(slide);
    });
    carousel.append(track);
    if (images.length > 1) {
      if (images.length === 5 || images.length === 15 || images.length === 32) {
        carousel.append(element("p", "index", `${texts().selected}${images.length}${texts().works}`));
      }
      const controls = element("div", "carousel-controls");
      const previous = element("button", "", "←");
      previous.type = "button";
      previous.dataset.step = "-1";
      previous.setAttribute("aria-controls", controlsId);
      previous.setAttribute("aria-label", texts().previous);
      const count = element("span", "carousel-count", `1 / ${images.length}`);
      count.setAttribute("aria-live", "polite");
      const next = element("button", "", "→");
      next.type = "button";
      next.dataset.step = "1";
      next.setAttribute("aria-controls", controlsId);
      next.setAttribute("aria-label", texts().next);
      controls.append(previous, count, next);
      carousel.append(controls);
    }
    return carousel;
  }

  function texts() {
    return interfaceText[language];
  }

  function addInquiry(article, work) {
    const status = work.availability || "enquire";
    if (status === "available" || status === "sold" || status === "not-for-sale") {
      article.append(element("p", "availability", availabilityLabels[language][status]));
    }
    if (status === "sold" || status === "not-for-sale") return;
    const inquiry = element("p", "work-inquiry");
    const link = element("a", "text-link", status === "available" ? texts().available : texts().price);
    link.href = `mailto:${email}?subject=${encodeURIComponent(`${texts().price.replace(" →", "")} — ${localized(work.title)}`)}`;
    inquiry.append(link);
    article.append(inquiry);
  }

  function renderFeatured(work, number) {
    const article = element("article", "featured");
    article.id = work.id;
    const image = work.images[0];
    if (image) article.append(makeFigure(image));
    else article.append(element("figure"));
    const content = element("div");
    content.append(element("span", "index", `${String(number).padStart(2, "0")} / ${localized(work.medium)}`));
    content.append(element("h3", "", localized(work.title)));
    const subtitle = localized(work.subtitle);
    if (subtitle) content.append(element("p", "french", subtitle));
    const introduction = localized(work.introduction);
    if (introduction) content.append(element("p", "", introduction));
    const paragraphs = work.paragraphs && work.paragraphs[language];
    if (Array.isArray(paragraphs)) paragraphs.forEach(text => text && content.append(element("p", "", text)));
    article.append(content);
    if (work.availability === "available" || work.availability === "sold" || work.availability === "not-for-sale") {
      content.append(element("p", "availability", availabilityLabels[language][work.availability]));
    }
    if (work.availability !== "sold" && work.availability !== "not-for-sale") {
      const inquiry = element("p", "work-inquiry");
      const link = element("a", "text-link", work.availability === "available" ? texts().available : texts().price);
      link.href = `mailto:${email}?subject=${encodeURIComponent(`${texts().price.replace(" →", "")} — ${localized(work.title)}`)}`;
      inquiry.append(link);
      content.append(inquiry);
    }
    return article;
  }

  function renderLunar(work, number) {
    const article = element("article", "artwork");
    article.id = work.id;
    article.append(makeHeading(work, number));
    const layout = element("div", "lunar-layout");
    const figure = element("figure");
    const video = element("video");
    video.controls = true;
    video.preload = "metadata";
    const source = element("source");
    source.src = work.video;
    source.type = "video/mp4";
    video.append(source);
    figure.append(video);
    layout.append(figure, makeCopy(work));
    article.append(layout);
    if (work.poem && work.poem[language]) {
      const details = element("details", "lunar-poem");
      const summary = element("summary", "", texts().poem);
      const columns = element("div", "poem-columns");
      for (const lang of ["es", "en"]) {
        const column = element("div");
        column.lang = lang;
        column.append(element("p", "eyebrow", lang === "es" ? texts().spanish : texts().english));
        column.append(element("p", "verse", work.poem[lang]));
        columns.append(column);
      }
      details.append(summary, element("p", "", localized(work.poem.title)), columns);
      article.append(details);
    }
    addInquiry(article, work);
    return article;
  }

  function renderLogos(work, number) {
    const article = element("article", "artwork");
    article.id = work.id;
    article.append(makeHeading(work, number));
    const images = work.images || [];
    const overview = element("div", "logos-overview");
    if (images[0]) overview.append(makeFigure(images[0]));
    const copy = makeCopy(work);
    copy.className = "logos-questions";
    overview.append(copy);
    article.append(overview);
    if (images.length > 1) {
      const details = element("details", "logos-details");
      details.append(element("summary", "", texts().detail));
      const gallery = element("div", "logos-gallery");
      images.slice(1).forEach(image => gallery.append(makeFigure(image)));
      details.append(gallery);
      article.append(details);
    }
    addInquiry(article, work);
    return article;
  }

  function renderSingle(work, number) {
    const article = element("article", "artwork");
    article.id = work.id;
    article.append(makeHeading(work, number));
    const mainImage = work.images[0];
    if (mainImage) {
      const figure = makeFigure(mainImage);
      figure.className = "artwork-image";
      article.append(figure);
    }
    const info = element("div", "artwork-info");
    info.append(makeCopy(work));
    if (work.images.length > 1) {
      const details = element("details");
      details.append(element("summary", "", texts().detail));
      work.images.slice(1).forEach(image => details.append(makeFigure(image)));
      info.append(details);
    }
    article.append(info);
    addInquiry(article, work);
    return article;
  }

  function renderCarousel(work, number) {
    const article = element("article", "artwork");
    article.id = work.id;
    article.append(makeHeading(work, number));
    const layout = element("div", "viacrucis-layout");
    if (work.images.length) layout.append(makeCarousel(work, work.images));
    layout.append(makeCopy(work));
    article.append(layout);
    addInquiry(article, work);
    return article;
  }

  function renderWork(work, number) {
    switch (work.layout) {
      case "featured": return renderFeatured(work, number);
      case "lunar": return renderLunar(work, number);
      case "logos": return renderLogos(work, number);
      case "single": return renderSingle(work, number);
      case "carousel": return renderCarousel(work, number);
      default: throw new Error(`Unsupported presentation layout for ${work.id}.`);
    }
  }

  function updateHero(work) {
    const image = work.images[0];
    if (!image) throw new Error(`The featured artwork ${work.id} needs a cover image.`);
    const hero = document.querySelector(".hero");
    const heroImage = hero.querySelector(".hero-art img");
    heroImage.src = image.src;
    heroImage.alt = localized(image.alt);
    heroImage.fetchPriority = "high";
    hero.querySelector(".hero-art figcaption").textContent = localized(image.caption) || localized(work.title);
    hero.querySelector(".hero-caption .index").textContent = localized(work.medium);
    hero.querySelector(".hero-caption h2").textContent = localized(work.title);
    hero.querySelector(".hero-caption .french").textContent = localized(work.subtitle);
    const link = hero.querySelector(".hero-caption .text-link");
    link.href = `#${work.id}`;
    link.textContent = language === "es" ? "Ver la obra" : "View the work";
  }

  async function renderSite() {
    try {
      const response = await fetch("content/site.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load website content (${response.status}).`);
      const site = await response.json();
      validate(site);
      const publishedWorks = site.works.filter(work => work.published);
      if (publishedWorks.length === 0) throw new Error("At least one artwork must be published.");
      const featuredWork = publishedWorks.find(work => work.featured) || publishedWorks[0];
      updateHero(featuredWork);
      const section = document.querySelector("#obra");
      section.querySelectorAll(":scope > article").forEach(article => article.remove());
      const list = document.createDocumentFragment();
      publishedWorks.forEach((work, index) => list.append(renderWork(work, index + 1)));
      section.append(list);
      document.dispatchEvent(new CustomEvent("works:rendered"));
    } catch (error) {
      console.error("Could not render the CMS portfolio content; keeping the bundled page content.", error);
    }
  }

  renderSite();
})();
