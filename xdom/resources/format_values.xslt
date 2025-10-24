<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:x="http://panax.io/xdom"
  xmlns:initial="http://panax.io/xdom/values/initial"
  xmlns:prev="http://panax.io/xdom/values/previous"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl"
>
  <xsl:import href="functions.xslt"/>
  <xsl:decimal-format
    name="money"
    grouping-separator=","
    decimal-separator="."/>

  <xsl:key name="money" match="x:dummy" use="."/>
  <xsl:key name="date" match="x:dummy" use="."/>
  <xsl:key name="controls.date" match="x:dummy" use="."/>
  <xsl:key name="controls.picture" match="x:dummy" use="."/>
  <xsl:key name="controls.percentage" match="x:dummy" use="."/>

  <xsl:template match="@x:selected[.='true']" priority="-5">
    <xsl:text>Seleccionado</xsl:text>
  </xsl:template>

  <xsl:template match="@x:selected[not(.='true')]" priority="-5">
    <xsl:text>No seleccionado</xsl:text>
  </xsl:template>

  <xsl:template match="@x:value" priority="-5">
    <xsl:value-of select="." disable-output-escaping="yes"/>
  </xsl:template>

  <xsl:template match="@x:value[contains(.,'&amp;')]" priority="-5">
    <!--If exists an entity, it should be escaped-->
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="*[@x:text!='']/@x:value" priority="-5">
    <xsl:apply-templates select="../@x:text"/>
  </xsl:template>

  <xsl:template match="*[@x:value!=@prev:value and @x:text=@prev:text]/@x:value" priority="-5">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="*[key('controls.percentage',generate-id()) | key('controls.percentage',@fieldId)]/@x:value">
    <xsl:value-of select="number(concat('0',.))"/>%
  </xsl:template>

  <xsl:template match="*[key('controls.percentage',generate-id()) | key('controls.percentage',@fieldId)]/@x:value[.='']">
    <xsl:text>%</xsl:text>
  </xsl:template>

  <xsl:template match="*[key('date',generate-id()) | key('date',@fieldId) | key('controls.date',@fieldId) ]/@x:value">
    <xsl:value-of select="substring(.,1,10)"/>
  </xsl:template>

  <xsl:template match="*[key('money',generate-id()) | key('money',@fieldId)]/@x:value">
    <xsl:variable name="value" select="."/>
    <xsl:choose>
      <xsl:when test="number($value)=$value">
        <xsl:value-of select="format-number($value, '$###,##0.00', 'money')"/>
      </xsl:when>
      <xsl:otherwise>--</xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*[key('controls.picture',generate-id()) | key('controls.picture',@fieldId)]/@x:value">
    <xsl:variable name="file_extension">
      <xsl:call-template name="substring-after-last">
        <xsl:with-param name="string" select="." />
        <xsl:with-param name="delimiter" select="'.'" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="display_name">
      <xsl:call-template name="substring-after-last">
        <xsl:with-param name="string" select="." />
        <xsl:with-param name="delimiter" select="'\'" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="file_name">
      <xsl:choose>
        <xsl:when test="contains(.,'fakepath\')">
          <xsl:value-of select="concat(../@x:id,'.',$file_extension)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$display_name"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="full_path">
      <xsl:call-template name="substring-before-last">
        <xsl:with-param name="string" select="." />
        <xsl:with-param name="delimiter" select="'\'" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:value-of select="$file_name"/>
  </xsl:template>
  
  





</xsl:stylesheet>
