<xsl:stylesheet
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:x="http://panax.io/xdom"
  xmlns:changed="http://panax.io/xdom/binding/changed"
  xmlns:request="http://panax.io/xdom/binding/request"
  xmlns:interval="http://panax.io/xdom/binding/interval"
  xmlns:source="http://panax.io/xdom/binding/source"
  xmlns:prev="http://panax.io/xdom/values/previous"
  xmlns:fixed="http://panax.io/xdom/values/fixed"
  xmlns:debug="http://panax.io/debug"
  xmlns:state="http://panax.io/state" version="1.0">
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:key name="datasource" match="source:*" use="concat(generate-id(..),'::',local-name(),'::')"/>
  <xsl:key name="sourcedefinition" match="@source:*" use="concat(generate-id(..),'::',local-name(),'::')"/>
  <!--<xsl:key name="interval" match="@interval:*" use="concat(local-name(),'_',generate-id(..))"/>-->

  <xsl:template match="@* | text() | processing-instruction() | comment()" priority="-1">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="node()" priority="-1">
    <xsl:copy>
      <!--<xsl:if test="not(parent::*)">
        <xsl:copy-of select="//namespace::*"/>
      </xsl:if>-->
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="@source:*" mode="sources">
        <xsl:with-param name="mode">attributes</xsl:with-param>
      </xsl:apply-templates>
      <xsl:apply-templates select="@source:*" mode="sources">
        <xsl:with-param name="mode">nodes</xsl:with-param>
      </xsl:apply-templates>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="source:*/*/@x:id" priority="-1"/>

  <xsl:template match="source:*[key('sourcedefinition',concat(generate-id(..),'::',local-name(),'::'))]"/>

  <xsl:template match="@source:*[.!='']" mode="sources">
    <xsl:param name="ref" select=".."/>
    <xsl:param name="mode">nodes</xsl:param>
    <xsl:variable name="attribute_name" select="local-name()"/>
    <xsl:variable name="curr_value" select="../@x:*[local-name()=$attribute_name and .!='' and .!='NULL']"/>
    <xsl:variable name="prev_value" select="../@prev:*[local-name()=$attribute_name]"/>
    <xsl:variable name="curr_source" select="../@source:*[local-name()=$attribute_name]"/>
    <xsl:variable name="prev_source" select="../@changed:*[local-name()=$attribute_name]"/>
    <xsl:variable name="current_datasource" select="key('datasource',concat(generate-id($ref),'::',local-name(),'::'))"/>
    <xsl:variable name="current_source_value">
      <xsl:choose>
        <xsl:when test="not(self::*)">
          <xsl:value-of select="."/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="../@*[local-name()=$attribute_name]"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="selected_record" select="$current_datasource/x:r[@x:*[local-name()=$attribute_name]=$prev_value]"/>
    <xsl:choose>
      <xsl:when test="$mode='attributes'">
        <!-- Sólo pueden ir atributos en esta sección -->
        <xsl:if test="$curr_value and not($current_datasource)">
          <xsl:attribute name="prev:{local-name()}">
            <xsl:value-of select="$curr_value"/>
          </xsl:attribute>
        </xsl:if>
        <xsl:choose>
          <xsl:when test="$current_datasource and not($current_datasource[@command=$curr_source]) or contains($curr_source,'{{') and $curr_value">
            <xsl:if test="$curr_value">
              <xsl:attribute name="x:{local-name()}"></xsl:attribute>
              <xsl:attribute name="prev:{local-name()}">
                <xsl:value-of select="$curr_value"/>
              </xsl:attribute>
            </xsl:if>
            <xsl:attribute name="changed:{local-name()}">
              <xsl:value-of select="$curr_source"/>
            </xsl:attribute>
            <xsl:attribute name="state:refresh">true</xsl:attribute>
          </xsl:when>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$mode='nodes'">
        <!-- Sólo pueden ir nodos en esta sección -->
        <xsl:choose>
          <xsl:when test="contains($curr_source,'{{')"></xsl:when>
          <xsl:when test="$current_datasource[@command=$curr_source]">
            <xsl:copy-of select="($current_datasource[@command=$curr_source])[1]"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:element name="source:{local-name()}">
              <xsl:attribute name="x:id">
                <xsl:value-of select="concat('__request_',generate-id())"/>
              </xsl:attribute>
              <xsl:attribute name="changed:{local-name()}"></xsl:attribute>
              <xsl:attribute name="command">
                <xsl:value-of select="$curr_source"/>
              </xsl:attribute>
              <!--<xsl:if test="$curr_value">
                <xsl:element name="x:r">
                  <xsl:attribute name="x:{local-name()}">
                    <xsl:value-of select="$curr_value"/>
                  </xsl:attribute>
                </xsl:element>
              </xsl:if>-->
            </xsl:element>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@source:init[.='true']">
    <!--<xsl:copy/>-->
  </xsl:template>

  <xsl:template match="@source:init[.='true']" mode="sources">
  </xsl:template>

  <xsl:template match="@changed:*">
    <!--<xsl:attribute name="debug:{local-name()}">changed</xsl:attribute>-->
  </xsl:template>

  <!--<xsl:template match="@prev:*">
    <xsl:attribute name="debug:{local-name()}">changed</xsl:attribute>
  </xsl:template>-->
</xsl:stylesheet>