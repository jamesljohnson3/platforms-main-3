// middleware.js
import { NextResponse } from 'next/server';
import { authMiddleware } from "@clerk/nextjs";
import subdomains from './subdomains.json';

const customMiddleware = async (req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host");

  // Se define una lista de dominios permitidos (incluyendo localhost y el dominio real)
  const allowedDomains = ["localhost:3000", "boxy-hq.vercel.app"];

  // Verificamos si el hostname actual está en la lista de dominios permitidos
  const isAllowedDomain = allowedDomains.some(domain => hostname.includes(domain));

  // Extraemos el posible subdominio de la URL
  const subdomain = hostname.split('.')[0];

  // Si estamos en un dominio permitido y no es un subdominio, permitimos la solicitud
  if (isAllowedDomain && !subdomains.some(d => d.subdomain === subdomain)) {
    return NextResponse.next();
  }

  const subdomainData = subdomains.find(d => d.subdomain === subdomain);

  if (subdomainData) {
    // Reescribe la URL a una ruta dinámica basada en el subdominio
    return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
  }

  return new Response(null, { status: 404 });
};

export default authMiddleware({
  // routes that don't require authentication
  publicRoutes: [
    "/terms-conditions",
    "/signup",
    "/signin",
    "/register",
    "/demo",
    "/welcome",
    "/auth",
    "/sign-up",
    "/sign-in",   
    "/login",
    "/dashboard(.*)",
    "/p(.*)",
    "/"
  ],

  afterAuth(auth, req) {
    if (auth.isPublicRoute) {
      // do nothing for public routes
      return NextResponse.next();
    }

    const url = new URL(req.nextUrl.origin);

    if (!auth.userId && !auth.isPublicRoute) {
      // if the user tries to access a private route without being authenticated,
      // redirect to login page
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  },
  // Wrap the custom middleware
  middleware: customMiddleware,
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.png).*)"],
};
