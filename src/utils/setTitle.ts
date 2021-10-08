// import { PROJECT_NAME } from '../config'

export function setTitle(...title: string[]) {
  title = title || []
  title.push('Blog Now')
  document.title = title.join(' | ')
  return document.title
}
