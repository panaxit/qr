<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:px="http://panax.io/templating"
  extension-element-prefixes="px"
>
  <xsl:output media-type="xml" indent="yes" omit-xml-declaration="yes" cdata-section-elements="xsl:comment"/>

  <xsl:template match="/">
    <xsl:element name="xsl:stylesheet">
      <xsl:attribute name="version">1.0</xsl:attribute>
      <xsl:element name="xsl:output">
        <xsl:attribute name="method">html</xsl:attribute>
        <xsl:attribute name="indent">yes</xsl:attribute>
        <xsl:attribute name="omit-xml-declaration">yes</xsl:attribute>
      </xsl:element>
      <xsl:apply-templates mode="keys" select="//px:placeholder[text()]"/>
      <xsl:element name="xsl:decimal-format">
        <xsl:attribute name="name">money</xsl:attribute>
        <xsl:attribute name="grouping-separator">,</xsl:attribute>
        <xsl:attribute name="decimal-separator">.</xsl:attribute>
      </xsl:element>
      <xsl:element name="xsl:template">
        <xsl:attribute name="match">/</xsl:attribute>
        <xsl:apply-templates select="node()|comment()|processing-instruction()"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="*">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates select="node()|comment()|processing-instruction()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="comment()">
    <xsl:element name="xsl:comment">
      <xsl:element name="xsl:text"/>
      <xsl:value-of select="."/>
      <xsl:element name="xsl:text"/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="px:placeholder" mode="keys">
    <xsl:element name="xsl:key">
      <xsl:attribute name="name">data</xsl:attribute>
      <xsl:attribute name="match">
        <xsl:value-of select="concat('//',translate(text(),'.','/'))"/>
      </xsl:attribute>
      <xsl:attribute name="use">
        <xsl:text/>'<xsl:text/>
        <xsl:value-of select="text()"/>
        <xsl:text/>'<xsl:text/>
      </xsl:attribute>
    </xsl:element>
  </xsl:template>

  <xsl:template match="@style">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="@style[contains(.,'display:none')]">
    <xsl:attribute name="style">
      <xsl:value-of select="concat(.,'; display:inline; letter-spacing: 11px;')"/>
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="px:placeholder">
    <xsl:apply-templates select="../@style"/>
    <xsl:element name="div" namespace="">
      <xsl:attribute name="class">
        <xsl:value-of select="text()"/>
      </xsl:attribute>
      <xsl:element name="xsl:value-of">
        <xsl:attribute name="select">
          <xsl:text/>key('data','<xsl:value-of select="text()"/>')<xsl:text/>
        </xsl:attribute>
      </xsl:element>
    </xsl:element>
  </xsl:template>
</xsl:stylesheet>
