<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
xmlns:source="http://panax.io/xdom/binding/source"
xmlns:query="http://panax.io/xdom/binding/query"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:template match="@* | node() | text()" priority="-1">
    <xsl:copy>
      <xsl:copy-of select="//namespace::*"/>
      <xsl:attribute name="transformed">
        <xsl:value-of select="count(preceding-sibling::*)"/>
      </xsl:attribute>
      <xsl:copy-of select="@*|*|text()"/>
      <!--<xsl:copy-of select="@*"/>
      <xsl:apply-templates/>-->
    </xsl:copy>
  </xsl:template>

</xsl:stylesheet>