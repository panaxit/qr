<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
xmlns:prev_source="http://panax.io/xdom/binding/source/previous"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:template match="@* | node() | text()" priority="-1">
    <xsl:copy>
		<xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

<xsl:template match="@prev_source:*"/>

</xsl:stylesheet>