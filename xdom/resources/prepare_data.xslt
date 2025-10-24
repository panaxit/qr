<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:x="http://panax.io/xdom" xmlns:state="http://panax.io/state" xmlns:xdom="http://panax.io/xdom"
	xmlns:context="http://panax.io/context" xmlns:transforms="http://panax.io/transforms" xmlns:prev="http://panax.io/xdom/values/previous" xmlns:temp="http://panax.io/temp" xmlns:initial="http://panax.io/xdom/values/initial" xmlns:confirmed="http://panax.io/xdom/values/confirmed" xmlns:session="http://panax.io/session" xmlns:changed="http://panax.io/xdom/binding/changed" xmlns:load="http://panax.io/xdom/binding/request" xmlns:source="http://panax.io/xdom/binding/source" xmlns:prev_source="http://panax.io/xdom/binding/source/previous" xmlns:source_fields="http://panax.io/xdom/binding/source/fields" xmlns:source_filters="http://panax.io/xdom/binding/source/filters" xmlns:source_value="http://panax.io/xdom/binding/source/value" xmlns:source_prefix="http://panax.io/xdom/binding/source/prefix" xmlns:source_text="http://panax.io/xdom/binding/source/text" xmlns:xhr="http://panax.io/xdom/xhr" xmlns:js="http://panax.io/xdom/script/js" xmlns:fn="http://panax.io/xdom/sql/function" xmlns:sp="http://panax.io/xdom/sql/procedure" xmlns:sql="http://panax.io/xdom/sql" xmlns:router="http://panax.io/xdom/router" xmlns:debug="http://panax.io/debug" xmlns:math="http://exslt.org/math" xmlns:exsl="http://exslt.org/functions" xmlns:custom="http://panax.io/custom" xmlns:copy="http://panax.io/commands/copy"
  xmlns:upload="http://panax.io/xdom/upload" xmlns:request="http://panax.io/xdom/binding/request"
  xmlns:requesting="http://panax.io/xdom/binding/requesting" xmlns:xml="http://www.w3.org/XML/1998/namespace">
  <xsl:key name="first_records" match="x:r[string(@x:value)='0']" use="generate-id(..)"/>
  <xsl:key name="rest_of_records" match="x:r[string(@x:value)!='0']" use="generate-id(..)"/>
  <xsl:key name="source_data" match="source:*//*" use="generate-id()"/>
  <xsl:key name="authorized" match="*[@session:status='authorized']" use="true()"/>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  <xsl:template match="@* | node() | text()">
    <xsl:copy>
      <xsl:apply-templates mode="attributes" select="."/>
      <xsl:apply-templates select="@*"/>
      <!--<xsl:apply-templates mode="query" select="."/>
      <xsl:apply-templates mode="sources" select="."/>-->
      <xsl:apply-templates select="node()|text()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*[@x:id='new']/*/text()">
    <xsl:text/>
  </xsl:template>

  <!--<xsl:template match="*[@x:format='money']/@x:value">
    <xsl:attribute name="{name()}">
      <xsl:value-of select="."/>
    </xsl:attribute>
  </xsl:template>-->

  <xsl:template match="*[x:r]">
    <xsl:copy>
      <xsl:attribute name="x:id">
        <xsl:value-of select="concat(translate(name(),':','_'),'_',generate-id())"/>
      </xsl:attribute>
      <xsl:apply-templates mode="attributes" select="."/>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="key('first_records',generate-id())"/>
      <xsl:apply-templates select="key('rest_of_records',generate-id())">
        <!--<xsl:sort data-type="text" select="@x:text"/>-->
      </xsl:apply-templates>
    </xsl:copy>
  </xsl:template>

  <xsl:template mode="attributes" match="*">
    <xsl:attribute name="x:id">
      <xsl:value-of select="concat(translate(name(),':','_'),'_',generate-id())"/>
    </xsl:attribute>
  </xsl:template>

  <xsl:template mode="attributes" match="/*//*" priority=".25">
    <xsl:attribute name="x:id">
      <xsl:value-of select="concat(translate(name(),':','_'),'_',generate-id())"/>
    </xsl:attribute>
    <xsl:if test="not(self::*[contains(namespace-uri(), 'http://panax.io')])">
      <xsl:attribute name="x:fieldId">
        <xsl:choose>
          <xsl:when test="@x:fieldId">
            <xsl:value-of select="@x:fieldId"/>
          </xsl:when>
          <xsl:when test="@fieldId">
            <xsl:value-of select="@fieldId"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="concat(ancestor-or-self::*[@fieldId][1]/@fieldId,'_',count(ancestor::*)-count(ancestor-or-self::*[@fieldId][1]/ancestor::*),'_',count(preceding-sibling::*[not(self::*[contains(namespace-uri(), 'http://panax.io')])]))"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
    </xsl:if>
    <xsl:if test="@text|@value|text()">
      <xsl:attribute name="x:value">
        <xsl:choose>
          <xsl:when test="@value">
            <xsl:value-of select="@value"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="text()"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>

      <xsl:if test="not(key('source_data',generate-id()))">
        <xsl:attribute name="prev:value">
          <xsl:choose>
            <xsl:when test="@value">
              <xsl:value-of select="@value"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="text()"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <xsl:attribute name="initial:value">
          <xsl:choose>
            <xsl:when test="@value">
              <xsl:value-of select="@value"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="text()"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@text|text()">
        <xsl:attribute name="x:text">
          <xsl:choose>
            <xsl:when test="@text">
              <xsl:value-of select="@text"/>
            </xsl:when>
            <xsl:when test="text()">
              <xsl:value-of select="text()"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="@value"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:attribute>
        <xsl:if test="not(key('source_data',generate-id()))">
          <xsl:attribute name="prev:text">
            <xsl:choose>
              <xsl:when test="@text">
                <xsl:value-of select="@text"/>
              </xsl:when>
              <xsl:when test="text()">
                <xsl:value-of select="text()"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="@value"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:attribute name="initial:text">
            <xsl:choose>
              <xsl:when test="@text">
                <xsl:value-of select="@text"/>
              </xsl:when>
              <xsl:when test="text()">
                <xsl:value-of select="text()"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="@value"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
        </xsl:if>
      </xsl:if>
    </xsl:if>
    <xsl:copy-of select="@*"/>
  </xsl:template>

  <!--<xsl:template mode="attributes" match="*[contains(namespace-uri(), 'http://panax.io/xdom')]" priority=".5">
    <xsl:apply-templates select="@*"/>
  </xsl:template>-->

  <xsl:template mode="attributes" match="x:message" priority="1">
    <xsl:attribute name="x:id">
      <xsl:value-of select="concat(translate(name(),':','_'),'_',generate-id())"/>
    </xsl:attribute>
  </xsl:template>

  <xsl:template mode="attributes" match="x:r" priority="1">
    <xsl:attribute name="x:id">
      <xsl:value-of select="concat(translate(name(),':','_'),'_',generate-id())"/>
    </xsl:attribute>
    <xsl:attribute name="x:value">
      <xsl:choose>
        <xsl:when test="@x:value_field">
          <xsl:value-of select="@*[concat('@',local-name())=../@x:value_field]"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@dataValue"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:attribute>
    <xsl:attribute name="x:text">
      <xsl:choose>
        <xsl:when test="@x:text_field">
          <xsl:value-of select="@*[concat('@',local-name())=../@x:text_field]"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@dataText"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:attribute>
    <xsl:copy-of select="@*"/>
  </xsl:template>

  <xsl:template match="/*">
    <xsl:copy>
      <xsl:copy-of select="//namespace::*"/>
      <xsl:attribute name="x:init">true</xsl:attribute>
      <xsl:attribute name="session:init">true</xsl:attribute>
      <xsl:attribute name="xhr:init">true</xsl:attribute>
      <xsl:attribute name="request:init">true</xsl:attribute>
      <xsl:attribute name="requesting:init">true</xsl:attribute>
      <xsl:attribute name="source:init">true</xsl:attribute>
      <xsl:attribute name="state:x-position">0</xsl:attribute>
      <xsl:attribute name="state:y-position">0</xsl:attribute>
      <xsl:apply-templates mode="attributes" select="."/>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates select="node()|text()"/>
    </xsl:copy>
  </xsl:template>

  <!--<xsl:template match="text()"/>-->
  <xsl:template match="*[contains(namespace-uri(), 'http://panax.io/xdom')]/text()">
    <xsl:copy-of select="."/>
  </xsl:template>
</xsl:stylesheet>
