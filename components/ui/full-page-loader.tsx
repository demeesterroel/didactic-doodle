'use client'

import { Loader2 } from 'lucide-react'

export function FullPageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
        </div>
    )
}
