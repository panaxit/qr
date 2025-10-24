<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns:debug="http://panax.io/debug"
  xmlns:x="http://panax.io/xdom"
  xmlns:xhr="http://panax.io/xdom/xhr"
  xmlns="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="xsl msxsl x debug xhr"
>
  <xsl:output method="xml"
     omit-xml-declaration="yes"
     indent="yes" standalone="no"/>

  <xsl:template match="x:message" priority="-1">
    <xsl:variable name="type">
      <xsl:choose>
        <xsl:when test="@type='exception'">danger</xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@type"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <div class="alert alert-{$type} w3-panel w3-display-container w3-animate-top">
      <span onclick="this.parentElement.style.display='none'; xdom.data.remove('{@x:id}')"
      class="w3-button w3-large w3-display-topright" style="color:white;">&#215;</span>
      <h3 style="color:white;">¡Aviso!</h3>
      <p style="color:white;">
        <xsl:value-of select="text()"/>
      </p>
    </div>
  </xsl:template>

  <xsl:template match="x:message" mode="messages.popover" priority="-1">
    <xsl:variable name="type">
      <xsl:choose>
        <xsl:when test="@type='exception'">danger</xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@type"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <span style="position:relative">
      <div class="popover {$type} fade show bs-popover-right" role="tooltip" x-placement="right" style="position: absolute; will-change: transform; top: 0px; left: 0px; margin-top: -45px; width:200px;">
        <div class="arrow" style="top: 34px;"></div>
        <h3 class="popover-header" onclick="this.parentElement.style.display='none'; xdom.data.remove('{@x:id}')">Mensaje</h3>
        <div class="popover-body">
          <xsl:value-of select="text()"/>
        </div>
      </div>
    </span>
  </xsl:template>
  
</xsl:stylesheet>
