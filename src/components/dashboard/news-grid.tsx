import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { NewsItem } from "@/types/dashboard"

type NewsCardProps = {
  item: NewsItem
}

function NewsCard({ item }: NewsCardProps) {
  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-sm font-medium">
          <a
            href="#"
            className="text-primary underline-offset-4 hover:underline"
          >
            {item.title}
          </a>
        </CardTitle>
        <CardDescription>{item.date}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}

        {item.fees && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Walkup fee</TableHead>
                <TableHead>Phone fee</TableHead>
                <TableHead>Web fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{item.fees.walkup}</TableCell>
                <TableCell>{item.fees.phone}</TableCell>
                <TableCell>{item.fees.web}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
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
      <div className="mb-4">
        <h2
          id="news-heading"
          className="text-base font-semibold text-emerald-600"
        >
          News, Features and Tips
        </h2>
        <p className="text-sm text-muted-foreground">
          Click on a title to see details and instructions
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
