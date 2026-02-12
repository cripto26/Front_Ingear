# Ingear Frontend (Vite + React + PWA)

Frontend tipo **PWA** para la automatización de procesos internos en Ingear, con navegación por módulos:
**Inicio, Cotizador, Administración, Logística, Ingeniería y Gerencia**.

Actualmente el foco es que el **Cotizador** funcione conectado a la **API** (FastAPI) en local.

---

## 🚀 Stack

- **React 18** + **TypeScript**
- **Vite**
- **React Router**
- **PWA** con `vite-plugin-pwa`
- **jsPDF + jspdf-autotable** (generación de PDF de cotización)

---

## 📦 Requisitos

- Node.js 18+ (recomendado)
- npm o yarn

---

## 📁 Estructura (resumen)

```txt
src/
├─ api/                 # Clientes, productos, empleados, etc. (fetch a la API)
├─ auth/                # AuthContext (mock) y roles
├─ config/              # ENV (VITE_API_BASE_URL, VITE_AUTH_MODE)
├─ features/
│  └─ cotizador/        # UI + cálculos + reglas de visibilidad (costos/márgenes)
├─ layout/              # Sidebar + Topbar + Layout principal
├─ lib/
│  ├─ http.ts           # wrapper fetch + manejo de errores
│  ├─ money.ts          # helpers COP / números
│  └─ pdf/              # plantilla + generador PDF
└─ pages/               # páginas por ruta (Home, Cotizador, etc.)
