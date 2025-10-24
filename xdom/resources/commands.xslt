<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:x="http://panax.io/xdom"
xmlns:source="http://panax.io/xdom/binding/source"
xmlns:command="http://panax.io/commands"
xmlns:copy="http://panax.io/commands/copy"
><xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>
  
  <xsl:key name="nodes" match="*" use="generate-id()"/>

  <xsl:key name="copy_ref" match="*[@copy:before='this()']" use="concat('before:',generate-id())"/>
  <xsl:key name="copy_ref" match="*[@copy:after='this()']" use="concat('after:',generate-id())"/>
  <xsl:key name="copy_ref" match="*[1][@copy:before='first()']" use="concat('before:',generate-id())"/>
  <xsl:key name="copy_ref" match="*[last()][@copy:after='last()']" use="concat('after:',generate-id())"/>
  <xsl:key name="copy_ref" match="*[@copy:before='first()']" use="concat('before:',generate-id(preceding-sibling::*[last()]))"/>
  <xsl:key name="copy_ref" match="*[@copy:after='last()']" use="concat('after:',generate-id(following-sibling::*[last()]))"/>
  <xsl:key name="copy_ref" match="*[@copy:before][not(contains(@copy:before,'()'))]" use="concat('before:',.)"/>
  <xsl:key name="copy_ref" match="*[@copy:after][not(contains(@copy:after,'()'))]" use="concat('after:',.)"/>

  <xsl:template match="@* | node() | text()" priority="-1">
    <xsl:copy>
      <xsl:apply-templates select="@*"/>
      <xsl:apply-templates/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="@* | node() | text()" priority="-1" mode="copy">
    <xsl:copy>
      <xsl:apply-templates select="@*" mode="copy"/>
      <xsl:apply-templates mode="copy"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*[ancestor-or-self::*[@copy:*]]/@x:id|@copy:*" mode="copy"/>

  <xsl:template match="@copy:*"/>

  <xsl:template match="*[key('copy_ref',concat('before:',generate-id()))]">
    <xsl:copy>
      <xsl:apply-templates select="@* | node() | text()" mode="copy"/>
    </xsl:copy>
    <xsl:copy>
      <xsl:apply-templates select="@* | node() | text()"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="*[key('copy_ref',concat('after:',generate-id()))]">
    <xsl:copy>
      <xsl:apply-templates select="@* | node() | text()"/>
    </xsl:copy>
    <xsl:copy>
      <xsl:apply-templates select="@* | node() | text()" mode="copy"/>
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>