import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AllocationStatsProps {
  stats: {
    total: number
    got1stChoice: number
    got2ndChoice: number
    got3rdChoice: number
    sonderliste: number
  } | null
}

export function AllocationStats({ stats }: AllocationStatsProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zuteilungsstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Noch keine Zuteilung durchgefuehrt
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatPercent = (count: number): string => {
    if (stats.total === 0) return '0.0'
    return ((count / stats.total) * 100).toFixed(1)
  }

  const getBarWidth = (count: number): string => {
    if (stats.total === 0) return '0%'
    return `${(count / stats.total) * 100}%`
  }

  const categories = [
    {
      label: '1. Wahl',
      count: stats.got1stChoice,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      label: '2. Wahl',
      count: stats.got2ndChoice,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      label: '3. Wahl',
      count: stats.got3rdChoice,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Zuteilung offen',
      count: stats.sonderliste,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Zuteilungsstatistik</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {stats.total} Schueler insgesamt
        </p>

        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={category.textColor}>{category.label}</span>
                <span className="text-muted-foreground">
                  {category.count} ({formatPercent(category.count)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${category.color} rounded-full transition-all`}
                  style={{ width: getBarWidth(category.count) }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
