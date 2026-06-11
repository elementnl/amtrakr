import { useQuery } from '@tanstack/react-query'
import { fetchTrain } from '../lib/amtraker'

export function useTrain(trainNum: string | number | null) {
  return useQuery({
    queryKey: ['train', String(trainNum)],
    queryFn: () => fetchTrain(trainNum!),
    enabled: trainNum != null,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })
}
