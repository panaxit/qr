<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
xmlns:px="http://panax.io/panax"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:template match="text()"/>

  <xsl:template match="results">
    <x:message xmlns:x="http://panax.io/xdom" type="exception">
      <xsl:apply-templates select=".//result[@statusMessage][1]/@statusMessage"/>
    </x:message>
  </xsl:template>

  <xsl:template match="results[not(.//*/@status='error')]">
    <x:message xmlns:x="http://panax.io/xdom" type="info">
      <xsl:text/>Guardado con éxito<xsl:text/>
      <xsl:copy-of select="."/>
    </x:message>
  </xsl:template>

</xsl:stylesheet>