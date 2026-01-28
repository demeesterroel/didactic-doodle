import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { NoteCard, NoteCardSkeleton } from "@/components/note/note-card";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";

function NotesPreviewSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

async function NotesPreview() {
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .eq("is_public", true)
    .order("modified_at", { ascending: false })
    .limit(3);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-xl">Latest Public Notes</h2>
        <Button variant="ghost" asChild>
          <Link href="/notes">View All Notes &rarr;</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {notes?.map((note) => (
          <NoteCard key={note.id} note={note} user={null} href={`/notes/${note.id}`} />
        ))}
        {(!notes || notes.length === 0) && (
          <p className="text-muted-foreground text-center col-span-full py-8">
            No public notes yet. be the first to <Link href="/notes/add" className="underline">create one</Link>!
          </p>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            {hasEnvVars ? (
              <Suspense fallback={<NotesPreviewSkeleton />}>
                <NotesPreview />
              </Suspense>
            ) : (
              <ConnectSupabaseSteps />
            )}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
