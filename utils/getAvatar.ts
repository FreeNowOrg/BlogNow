export function getAvatar(
  url?: string,
  options: {
    width?: number
    preset?:
      | '404'
      | 'mm'
      | 'identicon'
      | 'monsterid'
      | 'wavatar'
      | 'retro'
      | 'blank'
    restrict?: 'g' | 'pg' | 'r' | 'x'
  } = {}
): string {
  url = url || 'https://gravatar.loli.net/avatar/'
  return `${url}?${new URLSearchParams({
    s: '' + (options.width || 120),
    d: options.preset || 'identicon',
    r: options.restrict || 'g',
  })}`
}
