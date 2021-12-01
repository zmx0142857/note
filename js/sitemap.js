const fs = require('fs')
const toc = require('./toc.js')
const baseUrl = 'https://zmx0142857.gitee.io/note'

function getDateStr (date) {
  return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2)
}
const monthAgo = getDateStr(new Date(new Date() - 30 * 86400 * 1000)) // 减一个月
const today = getDateStr(new Date())
const buf = []

buf.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>https://zmx0142857.gitee.io/note/index.html</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>`)

Object.keys(toc).forEach(book => {
  toc[book].toc.forEach(group => {
    group.articles.forEach(article => {
      buf.push(`  <url>
    <loc>${baseUrl}/${book}/${article.src}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${article.date || monthAgo}</lastmod>
  </url>`)
    })
  })
})
buf.push('</urlset>')
fs.writeFileSync('sitemap.xml', buf.join('\n'))
