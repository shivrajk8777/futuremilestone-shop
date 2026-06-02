import {
  AboutPage,
  BlogPage,
  ContactPage,
  FaqPage,
  HomePage,
  LicensingPage,
  NotFoundPage,
  ProductDetailsPage,
  ShopPage,
  TermsPage,
} from "../components/pages/generated";

const PAGE_ROUTES = {
  index: "/",
  about: "/about",
  blog: "/blog",
  contact: "/contact",
  faq: "/faq",
  licensing: "/licensing",
  "product-details": "/product-details",
  shop: "/shop",
  terms: "/terms",
  "404": "/404",
};

const PAGE_COMPONENTS = {
  index: HomePage,
  about: AboutPage,
  blog: BlogPage,
  contact: ContactPage,
  faq: FaqPage,
  licensing: LicensingPage,
  "product-details": ProductDetailsPage,
  shop: ShopPage,
  terms: TermsPage,
  "404": NotFoundPage,
};

const EXACT_ROUTE_MAP = new Map(
  Object.entries(PAGE_ROUTES).flatMap(([pageKey, route]) => {
    const normalized = route === "/" ? "" : route.slice(1);

    return [
      [normalized, pageKey],
      [`${normalized}.html`, pageKey],
    ];
  }),
);

function normalizeRoute(slug) {
  return Array.isArray(slug) ? slug.join("/") : "";
}

export function getPageForRoute(slug) {
  const route = normalizeRoute(slug);

  if (EXACT_ROUTE_MAP.has(route)) {
    return EXACT_ROUTE_MAP.get(route);
  }

  if (route.startsWith("shop/")) {
    return "product-details";
  }

  if (route.startsWith("category/")) {
    return "shop";
  }

  if (route.startsWith("blog/")) {
    return "blog";
  }

  return null;
}

export function getPageMetadata(pageName) {
  return {
    title: "Fjord - E-Commerce",
    description:
      "A clean and modern e-commerce experience with a flexible, responsive storefront designed to perform well across devices.",
  };
}

export function getPageAssets(pageName) {
  return {
    cssHref: `/template-design/css/${pageName}.css`,
    jsHref: `/template-design/js/${pageName}.js`,
  };
}

export function getPageComponent(pageName) {
  return PAGE_COMPONENTS[pageName] ?? null;
}
