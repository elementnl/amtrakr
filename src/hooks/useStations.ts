import { useQuery } from '@tanstack/react-query'
import { fetchAllStations, fetchStation } from '../lib/amtraker'

const ONE_HOUR = 60 * 60 * 1_000

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: fetchAllStations,
    staleTime: ONE_HOUR,
    gcTime: ONE_HOUR * 6,
  })
}

export function useStation(stationCode: string | null) {
  return useQuery({
    queryKey: ['station', stationCode],
    queryFn: () => fetchStation(stationCode!),
    enabled: stationCode != null,
    staleTime: ONE_HOUR,
  })
}
