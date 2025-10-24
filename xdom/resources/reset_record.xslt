<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
xmlns:source="http://panax.io/xdom/binding/source"
xmlns:query="http://panax.io/xdom/binding/query"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:template match="@* | node() | text()">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()|text()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*[not(self::x:r)]/@x:*"/>
  <xsl:template match="source:*[@for]|query:*[@for]"/>
</xsl:stylesheet>