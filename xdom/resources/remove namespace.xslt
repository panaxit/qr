<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
>
  <xsl:output media-type="xml" indent="yes" omit-xml-declaration="yes"/>

  <xsl:template match="*">
    <xsl:element name="{local-name()}" namespace="">
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates select="node()|comment()|processing-instruction()"/>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
