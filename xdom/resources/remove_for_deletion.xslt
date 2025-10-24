<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes" standalone="yes"/>
  <xsl:key name="remove" match="*[@forDeletion='true']" use="generate-id(.)"/>
  <xsl:template match="@* | node() | text() | processing-instruction() | comment()" priority="-1">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*[key('remove',generate-id())]"/>

</xsl:stylesheet>