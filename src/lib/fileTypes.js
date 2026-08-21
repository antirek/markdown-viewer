export function isMarkdownName(name) {
  return /\.(md|markdown|mdown|mkd|mdx)$/i.test(name || '');
}

export function isAcceptableMarkdownFile(file) {
  if (!file) return false;
  if (isMarkdownName(file.name)) return true;
  const type = file.type || '';
  return type.includes('markdown') || type === 'text/plain';
}
