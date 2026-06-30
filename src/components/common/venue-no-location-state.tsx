export function VenueNoLocationState({
  featureLabel,
}: {
  featureLabel: string
}) {
  return (
    <div className="rounded-sm border border-dashed border-border bg-muted/20 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">
        Select a location from the header.
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {featureLabel} loads for the venue location chosen in the app header.
      </p>
    </div>
  )
}
