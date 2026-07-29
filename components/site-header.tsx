import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SiteHeader({ showBack = false }: { showBack?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/80 bg-white/85 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        {showBack ? (
          <Button
            render={<Link href="/" aria-label="뒤로 가기" />}
            nativeButton={false}
            variant="ghost"
            size="icon-sm"
          >
            <ArrowLeft />
          </Button>
        ) : null}

        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="size-4" />
          </span>
          <span className="font-serif text-lg font-bold tracking-tight text-foreground">
            지금, 전주
          </span>
        </Link>
      </div>
    </header>
  )
}
