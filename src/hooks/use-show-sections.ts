import { useMemo } from 'react'

import { mapShowSectionsToOptions } from '@/lib/map-show-sections'
import { getClubmanErrorMessage } from '@/store/api/baseQuery'
import { useGetShowSectionsQuery } from '@/store/api/clubmanApi'
import type { ShowSectionItem } from '@/types/api/show-sections'

function sectionsMatchShow (sections: ShowSectionItem[], showId: string) {
  return sections.length > 0 && sections.every(section => section.ShowID === showId)
}

export function useShowSections (
  connectionString: string,
  showId: string,
  enabled = true
) {
  const shouldSkip = !enabled || !connectionString || !showId

  const { data, isLoading, isFetching, error } = useGetShowSectionsQuery(
    { connectionString, showId },
    { skip: shouldSkip }
  )

  const sections = useMemo(() => {
    if (shouldSkip || !data?.length) {
      return []
    }

    if (!sectionsMatchShow(data, showId)) {
      return []
    }

    return mapShowSectionsToOptions(data)
  }, [data, shouldSkip, showId])

  const loading = shouldSkip ? false : isLoading || isFetching

  return {
    sections,
    loading,
    error: error ? getClubmanErrorMessage(error) : null
  }
}
