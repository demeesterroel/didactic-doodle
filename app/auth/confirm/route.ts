import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // transform "next" param to absolute URL or handle forwarded hosts
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // Helper to ensure we have a valid absolute URL for redirection
      const getRedirectUrl = (baseUrl: string) => {
        if (next.startsWith("http")) return next;
        return `${baseUrl}${next}`;
      };

      if (isLocalEnv) {
        return NextResponse.redirect(getRedirectUrl(origin));
      } else if (forwardedHost) {
        return NextResponse.redirect(getRedirectUrl(`https://${forwardedHost}`));
      } else {
        return NextResponse.redirect(getRedirectUrl(origin));
      }
    } else {
      // return the user to an error page with specific message
      return NextResponse.redirect(
        new URL(
          `/auth/error?error=${encodeURIComponent(error.message)}`,
          request.url,
        ),
      );
    }
  }

  // return the user to an error page if params are missing
  return NextResponse.redirect(
    new URL("/auth/error?error=No token hash or type", request.url),
  );
}
