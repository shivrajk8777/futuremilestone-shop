import { notFound } from "next/navigation";
import PageClientShell from "../../components/pages/PageClientShell";
import {
  getPageForRoute,
  getPageMetadata,
} from "../../lib/page-registry";

export function generateMetadata({ params }) {
  const pageName = getPageForRoute(params.slug);

  if (!pageName) {
    return {};
  }

  return getPageMetadata(pageName);
}

export default function RoutePage({ params }) {
  const pageName = getPageForRoute(params.slug);

  if (!pageName) {
    notFound();
  }

  return (
    <>
      <PageClientShell pageName={pageName} />
    </>
  );
}
