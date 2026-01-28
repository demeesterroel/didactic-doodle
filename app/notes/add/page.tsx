'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { NoteForm } from '@/components/note/note-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddNotePage() {
    const supabase = createClient()
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/auth/login')
            return
        }

        const noteData = {
            ...data,
            user_id: user.id,
            modified_at: new Date().toISOString()
        }

        const { error } = await supabase.from('notes').insert([noteData])

        if (error) {
            throw error
        }

        router.push('/notes')
        router.refresh()
    }

    return (
        <div className="container max-w-2xl mx-auto py-12 px-6">
            <Button variant="ghost" className="mb-8" asChild>
                <Link href="/notes">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Notes
                </Link>
            </Button>

            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Create New Note</h1>
                    <p className="text-muted-foreground">Add a new thought to your collection.</p>
                </div>

                <div className="border rounded-2xl p-6 bg-card">
                    <NoteForm onSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    )
}
