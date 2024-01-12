import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authMiddleware } from "@clerk/nextjs";

const middleware = authMiddleware({
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

  afterAuth(auth: { isPublicRoute: any; userId: any; }, req: { nextUrl: { origin: string | URL; }; }) {
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
});

const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.png).*)"],
};

// Original Middleware Function
async function customMiddleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  let hostname = req.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  // special case for Vercel preview deployment URLs
  if (
    hostname.includes("---") &&
    hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
  ) {
    hostname = `${hostname.split("---")[0]}.${
      process.env.NEXT_PUBLIC_ROOT_DOMAIN
    }`;
  }

  const searchParams = req.nextUrl.searchParams.toString();
  // Get the pathname of the request (e.g. /, /about, /blog/first-post)
  const path = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ""
  }`;

  // rewrites for app pages
  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    const session = await getToken({ req });
    if (!session && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && path == "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, req.url),
    );
  }

  // rewrite root application to `/home` folder
  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(
      new URL(`/home${path === "/" ? "" : path}`, req.url),
    );
  }

  // rewrite everything else to `/[domain]/[slug] dynamic route
}

export { middleware as default, config, customMiddleware };
