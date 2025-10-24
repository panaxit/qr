<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
xmlns:px="http://panax.io"
xmlns:debug="http://panax.io/debug"
xmlns:source="http://panax.io/xdom/binding/source"
xmlns:autobind="http://panax.io/xdom/binding/autobind"
xmlns:source_fields="http://panax.io/xdom/binding/source/fields"
xmlns:source_text="http://panax.io/xdom/binding/source/text"
xmlns:source_value="http://panax.io/xdom/binding/source/value"
xmlns:search="http://panax.io/xdom/values/search"
xmlns:cache="http://panax.io/xdom/binding/cache"
xmlns:transforms="http://panax.io/transforms"
xmlns:initial="http://panax.io/xdom/values/initial"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>

  <xsl:key name="field" match="px:fields/*" use="@fieldId"/>
  <xsl:key name="visible" match="px:layout//px:field" use="@fieldId"/>
  <xsl:key name="cardinality.hasOne" match="*[@relationshipType='hasOne']" use="@fieldId"/>

  <xsl:key name="dataType.junctionTable" match="*[@dataType='junctionTable']" use="@fieldId"/>

  <xsl:template match="@* | node() | text()" priority="-1">
    <xsl:copy>
      <xsl:if test="count(.|/*)=1">
        <xsl:copy-of select="//namespace::*"/>
      </xsl:if>
      <xsl:copy-of select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="px:fields|px:layout">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="px:data//*">
    <xsl:copy>
      <xsl:if test="count(.|/*)=1">
        <xsl:copy-of select="//namespace::*"/>
      </xsl:if>
      <xsl:apply-templates select="@*"/>
      <xsl:attribute name="cache:test">true</xsl:attribute>
      <xsl:apply-templates mode="panax_binding" select="."/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="/*" priority="0">
    <xsl:copy>
      <xsl:copy-of select="@*"/>
      <xsl:attribute name="transforms:bindings">xdom/panax/panax_bindings.xslt</xsl:attribute>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="text()" priority="-1">
    <xsl:copy-of select="."/>
  </xsl:template>

  <xsl:template match="@*" mode="binding">
    <xsl:text/>'<xsl:value-of select="."/>'<xsl:text/>
  </xsl:template>

  <xsl:template match="@search:value" mode="binding">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="@*[number(.)=.]" mode="binding">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template match="node()" mode="binding">
    <xsl:text/>
    <xsl:apply-templates mode="binding" select="@x:value"/>
    <xsl:text/>
  </xsl:template>

  <xsl:template match="@*[.='' or .='0' or .='null']" mode="binding">
    <xsl:text/>{{<xsl:value-of select="name(ancestor-or-self::*[1])"/>/@<xsl:value-of select="name()"/>}}<xsl:text/>
  </xsl:template>

  <!--<xsl:template match="Detalle[source:mostrarCreditoPuente='true']/@search:value[.='']" mode="binding">
    <xsl:text>''</xsl:text>
  </xsl:template>-->

  <xsl:template match="px:dataRow/*[key('dataType.junctionTable', @fieldId)]/*/px:data/px:dataRow[not(@initial:checked)]/@identity" priority="-1">
    <xsl:copy/>
    <xsl:attribute name="initial:checked">true</xsl:attribute>
    <xsl:attribute name="x:checked">true</xsl:attribute>
  </xsl:template>

  <!-- FORMULA -->
  <xsl:template mode="panax_binding" match="*" priority="-1"/>
  <!--TODO: Cambiar para que los catálogos sólo carguen cuando son editables-->

  <xsl:template mode="panax_binding" match="px:data/px:dataRow/*[key('visible',@fieldId)][key('field',@fieldId)[@dataType='foreignKey' and ../parent::*[(string(@controlType)='formView' or ancestor-or-self::*[@autobind:*='true'] or not(@controlType) and ../@relationshipType='hasOne')]]]//*[@primaryKey and @Schema and @Name][not(px:data)]">
    <xsl:variable name="current" select="(ancestor::*[parent::px:dataRow])[1]"/>
    <!--<xsl:if test="//px:layout//px:field[@fieldId=$current/@fieldId]">-->
    <xsl:attribute name="cache:value">true</xsl:attribute>
    <xsl:attribute name="source:value">
      <xsl:variable name="fields">
        <xsl:choose>
          <xsl:when test="@dataText">
            <xsl:text>[@x:text]=</xsl:text>
            <xsl:value-of select="@dataText"/>
            <xsl:text>,</xsl:text>
          </xsl:when>
          <xsl:when test="@dataValue">
            <xsl:text>[@x:text]=</xsl:text>
            <xsl:value-of select="@dataValue"/>
            <xsl:text>,</xsl:text>
          </xsl:when>
        </xsl:choose>
        <xsl:if test="@dataValue!=''">
          <xsl:text>[@x:value]=</xsl:text>
          <xsl:value-of select="@dataValue"/>
          <xsl:text>,</xsl:text>
        </xsl:if>
        <xsl:choose>
          <xsl:when test="@source_fields:value!=''">
            <xsl:value-of select="@source_fields:value"/>
            <xsl:text>,</xsl:text>
          </xsl:when>
          <xsl:when test="@foreignKey!=''">
            <!--<xsl:value-of select="@foreignKey"/>-->
            <!--<xsl:text>,</xsl:text>-->
          </xsl:when>
        </xsl:choose>
      </xsl:variable>
      <xsl:if test="$fields!=''">
        <xsl:value-of select="substring($fields, 1, string-length($fields) - 1)"/>
        <xsl:text>~&gt;</xsl:text>
      </xsl:if>
      <xsl:text/>[<xsl:value-of select="@Schema"/>].[<xsl:value-of select="@Name"/>]<xsl:text/>
      <xsl:if test="@foreignKey and *[@primaryKey]">
        <xsl:text/>=&gt;<xsl:value-of select="@foreignKey"/>=<xsl:apply-templates mode="binding" select="*[@primaryKey]/@x:value"/>
      </xsl:if>
    </xsl:attribute>
    <xsl:attribute name="source_fields:value">
      <xsl:choose>
        <xsl:when test="@source_fields:value">
          <xsl:value-of select="@source_fields:value"/>
        </xsl:when>
        <!--<xsl:otherwise>
          <xsl:value-of select="@foreignKey"/>
        </xsl:otherwise>-->
      </xsl:choose>
      <!--<xsl:for-each select="@foreignKey">
        <xsl:if test="position()&gt;1">,</xsl:if>
        <xsl:value-of select="."/>
      </xsl:for-each>-->
    </xsl:attribute>
    <!--</xsl:if>-->
  </xsl:template>

</xsl:stylesheet>