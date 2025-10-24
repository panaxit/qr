<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:session="http://panax.io/session" xmlns:js="http://panax.io/xdom/javascript" version="1.0">
  <xsl:key name="authorized" match="//*[@session:status='authorized']" use="true()"/>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:param name="js:status"><![CDATA[xdom.session.status || 'unauthorized']]></xsl:param>
  <xsl:param name="session:user_name"/>
  <xsl:param name="session:user_login"/>
  <xsl:param name="session:user_id"/>
  <xsl:variable name="target">body</xsl:variable>
  <xsl:template match="@* | text()" priority="-1">
    <xsl:copy/>
  </xsl:template>

  <xsl:template match="processing-instruction('xml-stylesheet')"/>

  <xsl:template match="processing-instruction('xml-stylesheet')" mode="processing-instructions">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="processing-instruction('xml-stylesheet')[contains(.,' role=&quot;login&quot;')]" mode="processing-instructions"/>

  <xsl:template match="/">
    <xsl:comment>Session stylesheet</xsl:comment>
    <xsl:apply-templates select="//processing-instruction('xml-stylesheet')" mode="processing-instructions"/>
    <xsl:apply-templates select="*"/>
  </xsl:template>

  <xsl:template match="/*">
    <xsl:if test="not($js:status='authorized') and not(//processing-instruction('xml-stylesheet')[contains(.,' privacy=&quot;public&quot;')])">
      <xsl:processing-instruction name="xml-stylesheet">
        <xsl:text/>type="text/xsl" href="login.xslt" role="login" target="<xsl:value-of select="$target"/>"<xsl:text/>
      </xsl:processing-instruction>
    </xsl:if>
    <xsl:copy>
      <!--<xsl:copy-of select="//namespace::*"/>-->
      <xsl:copy-of select="@*"/>
      <xsl:attribute name="session:status">
        <xsl:value-of select="$js:status"/>
      </xsl:attribute>
      <xsl:if test="$session:user_id!=''">
        <xsl:attribute name="session:user_id">
          <xsl:value-of select="$session:user_id"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$session:user_login!=''">
        <xsl:attribute name="session:user_login">
          <xsl:value-of select="$session:user_login"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$session:user_name!=''">
        <xsl:attribute name="session:user_name">
          <xsl:value-of select="$session:user_name"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:copy-of select="*|text()"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>