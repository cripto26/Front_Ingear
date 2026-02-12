// src/lib/pdf/template.ts

let cachedDataUrl: string | null = null;

/**
 * Carga la plantilla fija del PDF desde /public/templates/cotizacion.jpg (o .png)
 * y la devuelve como DataURL para poder usarla en jsPDF.addImage().
 */
export async function getDefaultQuoteTemplateDataUrl(): Promise<string | null> {
  if (cachedDataUrl) return cachedDataUrl;

  // Puedes cambiar la extensión si tu plantilla es .png
  const candidates = ["/templates/cotizacion.jpg", "/templates/cotizacion.png"];

  for (const path of candidates) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;

      const blob = await res.blob();
      cachedDataUrl = await blobToDataURL(blob);
      return cachedDataUrl;
    } catch {
      // intenta siguiente candidato
    }
  }

  return null;
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la plantilla del PDF"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}
