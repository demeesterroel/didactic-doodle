import Link from 'next/link'
import { Globe, Lock, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoteCardProps {
    note: any
    user: any
    onEdit?: (note: any) => void
    onDelete?: (id: number) => void
    onClick?: (note: any) => void
    href?: string
}

export function NoteCard({ note, user, onEdit, onDelete, onClick, href }: NoteCardProps) {
    const isOwner = user && user.id === note.user_id

    const CardContent = (
        <div
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault() // If using Link, prevent default only if onClick overrides? No.
                    onClick(note)
                }
            }}
            className={`group relative p-5 border rounded-2xl bg-card hover:border-muted-foreground/50 transition-colors duration-200 shadow-sm ${href || onClick || (isOwner && onEdit) ? 'cursor-pointer' : ''}`}
        >
            <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                    {note.title && <h3 className="font-semibold text-lg leading-tight">{note.title}</h3>}
                    {note.is_public ? (
                        <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                        <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                </div>

                {note.content && (
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed line-clamp-[12]">
                        {note.content}
                    </p>
                )}
            </div>

            {/* Actions */}
            {isOwner && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1 bg-card/80 backdrop-blur rounded-md p-1 shadow-sm border" onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                }}>
                    {onEdit && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(note)}>
                            <Edit className="w-3 h-3" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDelete(note.id)}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )

    if (href) {
        return <Link href={href} className="block">{CardContent}</Link>
    }

    return CardContent
}
