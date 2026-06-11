import { useQuery } from '@tanstack/react-query'
import { fetchAllTrains } from '../lib/amtraker'
import type { Train } from '../types/amtrak'

export function useTrains() {
  const query = useQuery({
    queryKey: ['trains'],
    queryFn: fetchAllTrains,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })

  const trains: Train[] = query.data ? Object.values(query.data).flat() : []

  return { ...query, trains }
}
