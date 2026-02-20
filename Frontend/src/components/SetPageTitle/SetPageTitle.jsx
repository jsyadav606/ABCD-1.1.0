import { useEffect } from 'react'

export const SetPageTitle = ({ title }) => {
  useEffect(() => {
    document.title = title
  }, [title])

  return null
}
