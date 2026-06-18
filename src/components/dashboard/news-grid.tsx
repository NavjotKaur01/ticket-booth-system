import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { NewsItem } from "@/types/dashboard"

type NewsCardProps = {
  item: NewsItem
}

function NewsCard({ item }: NewsCardProps) {
  return (
    <Card className="flex w-full flex-col overflow-hidden py-0 transition-shadow hover:shadow-md">
      {item.imageUrl && (
        <div className="flex h-44 shrink-0 items-center justify-center bg-muted/50 p-2 sm:h-48">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>
      )}

      <CardContent className="flex flex-col px-4 pt-3 pb-5">
        <div>
          <a
            href="#"
            className="line-clamp-2 text-sm font-semibold leading-snug text-primary underline-offset-4 hover:underline"
          >
            {item.title}
          </a>
          <p className="mt-1 text-xs text-muted-foreground">{item.date}</p>
        </div>

        <div className="mt-2.5 space-y-2">
          {item.description && (
            <p
              className={cn(
                "text-sm leading-snug text-muted-foreground",
                !item.fees && "line-clamp-5"
              )}
            >
              {item.description}
            </p>
          )}

          {item.fees && (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-8 px-2 text-xs">Walkup Fee</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Phone Fee</TableHead>
                  <TableHead className="h-8 px-2 text-xs">Web Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="px-2 py-1.5 text-sm font-medium">
                    {item.fees.walkup}
                  </TableCell>
                  <TableCell className="px-2 py-1.5 text-sm font-medium">
                    {item.fees.phone}
                  </TableCell>
                  <TableCell className="px-2 py-1.5 text-sm font-medium">
                    {item.fees.web}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

type NewsGridProps = {
  items: NewsItem[]
}

export function NewsGrid({ items }: NewsGridProps) {
  return (
    <section aria-labelledby="news-heading">
      <h2
        id="news-heading"
        className="mb-5 text-xl font-semibold leading-snug text-primary"
      >
        News, Features and Tips{" "}
        <span className="text-sm font-normal text-muted-foreground">
          (Click on title to see details and instructions)
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
