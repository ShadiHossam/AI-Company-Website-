<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html>
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style type="text/css">
          body {
            font-family: Helvetica, Arial, sans-serif;
            font-size: 13px;
            color: #545353;
          }
          table {
            border: none;
            border-collapse: collapse;
          }
          #sitemap {
            width: 75%;
            margin: 0 auto;
          }
          .expl a {
            color: #da5800;
          }
          a:visited, a:link {
            color: #0071a1;
          }
          #sitemap__header {
            width: 100%;
            border-bottom: 1px solid #ccc;
            padding: 3px 0 20px;
            line-height: 1;
          }
          #sitemap__header p {
            color: #777;
            font-size: 10px;
          }
          #sitemap__intro {
            margin: 20px 0 0;
          }
          .sitemap__table {
            margin: 20px 0;
            width: 100%;
          }
          .sitemap__table td,
          .sitemap__table th {
            font-size: .8em;
          }
          .sitemap__table th {
            background-color: #f9f9f9;
            border-bottom: 1px solid #ccc;
            color: #777;
            text-align: left;
            padding: 10px 10px 10px 30px;
          }
          .sitemap__table td {
            border-top: 1px solid #f1f1f1;
            padding: 10px 10px 10px 30px;
          }
          .sitemap__table tr:hover td {
            background-color: #fafafa;
          }
          .sitemap__table td:first-child {
            width: 75%;
          }
        </style>
      </head>
      <body>
        <div id="sitemap">
          <div id="sitemap__header">
            <h1>XML Sitemap</h1>
            <p>This XML sitemap is used by search engines which follow the <a href="http://sitemaps.org">XML Sitemap standard</a>.</p>
          </div>

          <xsl:if test="count(sitemap:sitemapindex/sitemap:sitemap) &gt; 0">
            <div id="sitemap__intro">
              <p class="expl">
                This sitemap index has
                <strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/></strong>
                sitemaps.
              </p>
            </div>
            <table class="sitemap__table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                  <tr>
                    <td>
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>

          <xsl:if test="count(sitemap:urlset/sitemap:url) &gt; 0">
            <div id="sitemap__intro">
              <p class="expl">
                This sitemap contains
                <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></strong>
                URLs.
              </p>
            </div>
            <table class="sitemap__table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Last Modified</th>
                  <th>Priority</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                    </td>
                    <td><xsl:value-of select="sitemap:lastmod"/></td>
                    <td><xsl:value-of select="sitemap:priority"/></td>
                    <td><xsl:value-of select="sitemap:changefreq"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:if>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
