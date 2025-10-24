<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:msxsl="urn:schemas-microsoft-com:xslt" 
xmlns:x="http://panax.io/xdom"
xmlns:px="http://panax.io"
xmlns:state="http://panax.io/state"
exclude-result-prefixes="msxsl"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <xsl:output media-type="xml" omit-xml-declaration="yes"/>
  <xsl:template match="/">
    <result>
      <xsl:apply-templates/>
    </result>
  </xsl:template>

  <xsl:template match="*|text()" priority="-1">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="singlequoted">
    <xsl:text/>'<xsl:apply-templates/>'<xsl:text/>
  </xsl:template>

  <xsl:template match="quoted|autoquoted">
    <xsl:text/>"<xsl:apply-templates/>"<xsl:text/>
  </xsl:template>
  
  <xsl:template match="quoted/autoquoted">
    <xsl:value-of select="text()"/>
  </xsl:template>
</xsl:stylesheet>
