<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:session="http://panax.io/session" version="1.0">
  <!--<xsl:key name="unauthorized" match="//*[@session:init][descendant-or-self::*[@session:status] and not(@session:status='authorized' or @session:status='authorizing')]" use="true()"/>-->
  <xsl:key name="authorized" match="//*[@session:status='authorized']" use="true()"/>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:variable name="status">unauthorized</xsl:variable>
  <xsl:template match="@* | text()" priority="-1">
    <xsl:copy/>
  </xsl:template>

  <xsl:template match="processing-instruction('xml-stylesheet')"/>

  <xsl:template match="processing-instruction('xml-stylesheet')" mode="processing-instructions">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="processing-instruction('xml-stylesheet')[contains(.,'login.xslt')]" mode="processing-instructions"/>

  <xsl:template match="/*">
    <xsl:if test="not(key('authorized', true()))">
      <xsl:processing-instruction name="xml-stylesheet">type="text/xsl" href="login.xslt" title="login"</xsl:processing-instruction>
    </xsl:if>
    <xsl:apply-templates select="//processing-instruction('xml-stylesheet')" mode="processing-instructions"/>
    <xsl:copy>
      <xsl:copy-of select="//namespace::*"/>
      <xsl:copy-of select="@*|*|text()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>