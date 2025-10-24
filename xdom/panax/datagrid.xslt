<?xml-stylesheet type="text/css" href="custom/css/gridview.css"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:debug="http://panax.io/debug"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns:x="http://panax.io/xdom"
  xmlns:session="http://panax.io/session"
  xmlns:filters="http://panax.io/filters"
  xmlns:custom="http://panax.io/custom"
  xmlns:datagrid="http://panax.io/widgets/datagrid"
  xmlns:xhr="http://panax.io/xdom/xhr"
  xmlns="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="debug msxsl x session filters custom datagrid xhr"
  xmlns:px="http://panax.io"
>
  <xsl:import href="../resources/datagrid.xslt"/>
  <xsl:decimal-format
      name="money"
      grouping-separator=","
      decimal-separator="."/>

  <xsl:key name="groupBy" match="/" use="."/>
  <xsl:key name="datagrid" match="*[@controlType='datagridView']" use="generate-id()"/>

  <xsl:template mode="identity" match="px:dataRow">
    <xsl:text/>NULL<xsl:text/>
  </xsl:template>

  <xsl:template mode="identity" match="px:dataRow/*">
    <xsl:text/>\'\'<xsl:value-of select="@x:value"/>\'\'<xsl:text/>
  </xsl:template>

  <xsl:template mode="identity" match="px:dataRow">
    <xsl:variable name="primary_field" select="*[key('primary_field',@fieldId)]"/>
    <xsl:apply-templates mode="identity" select="$primary_field"/>
  </xsl:template>

  <xsl:template mode="identity" match="px:dataRow[@identity!='']">
    <xsl:value-of select="@identity"/>
  </xsl:template>

  <xsl:template match="*[key('field',generate-id())][@headerText]" mode="datagrid.header.headertext">
    <xsl:value-of select="@headerText"/>
  </xsl:template>

  <xsl:template match="px:layout//px:field" mode="datagrid.header">
    <xsl:apply-templates mode="datagrid.header" select="key('field',@fieldId)"/>
  </xsl:template>

  <xsl:template match="px:layout//px:field" mode="datagrid.body">
    <xsl:param name="data_row"/>
    <xsl:variable name="field" select="."/>
    <xsl:apply-templates mode="datagrid.body" select="$data_row/*[@fieldId=$field/@fieldId]">
      <xsl:with-param name="field" select="key('field',@fieldId)"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="px:layout//px:field" mode="datagrid.footer">
    <xsl:apply-templates mode="datagrid.footer" select="key('field',@fieldId)"/>
  </xsl:template>

  <xsl:template match="px:fields" mode="datagrid.data.buttons" priority="-1">
    <xsl:apply-templates select="." mode="datagrid.data.buttons.add"/>
    <xsl:apply-templates select="x:message" mode="messages.popover"/>
  </xsl:template>

  <xsl:template match="px:dataRow" mode="datagrid.data.buttons" priority="-1">
    <xsl:apply-templates select="." mode="datagrid.data.buttons.check"/>
    <xsl:apply-templates select="." mode="datagrid.data.buttons.edit"/>
    <xsl:apply-templates select="." mode="datagrid.data.buttons.delete"/>
    <xsl:apply-templates select="x:message" mode="messages.popover"/>
  </xsl:template>
  
  <xsl:template mode="datagrid.data.buttons.edit.style" match="*"></xsl:template>

  <xsl:template mode="datagrid.data.buttons.edit.onclick" match="*[not(key('junctionTable',../@fieldId))]/px:data/px:dataRow" priority="-1">
    <xsl:variable name="table" select="ancestor::*[key('data_table',generate-id())][1]"/>
    <xsl:text/>/*<xsl:value-of select="count(ancestor::*[key('data_table',generate-id())])"/>*/px.request('[<xsl:value-of select="$table/@Schema"/>].[<xsl:value-of select="$table/@Name"/>]', 'edit', '[<xsl:value-of select="$table/@identityKey"/>]=<xsl:apply-templates mode="identity" select="."/>', '<xsl:value-of select="@x:id"/>'); <xsl:text/>
  </xsl:template>

  <xsl:template mode="datagrid.data.buttons.edit.onclick" match="*[not(key('junctionTable',../@fieldId))]/px:data/px:dataRow[not(@identity!='')]" priority="-1">
    <xsl:variable name="table" select="ancestor::*[key('data_table',generate-id())][1]"/>
    <xsl:text/>px.modifyInlineRecord({ref:'<xsl:value-of select="@x:id"/>', schema:'<xsl:value-of select="$table/@Schema"/>', name:'<xsl:value-of select="$table/@Name"/>', mode:'add'}); <xsl:text/>
  </xsl:template>

  <xsl:template mode="datagrid.data.buttons.edit.onclick" match="*[not(key('junctionTable',../@fieldId))]/px:data/px:dataRow[not(@identity!='')][../../px:fields/*/@isPrimaryKey]" priority="-1">
    <xsl:variable name="table" select="ancestor::*[key('data_table',generate-id())][1]"/>
    <xsl:text/>/*<xsl:value-of select="count(ancestor::*[key('data_table',generate-id())])"/>*/px.request('[<xsl:value-of select="$table/@Schema"/>].[<xsl:value-of select="$table/@Name"/>]', 'edit', '[<xsl:value-of select="$table/@primaryKey"/>]=<xsl:apply-templates mode="identity" select="."/>', '<xsl:value-of select="@x:id"/>'); <xsl:text/>
  </xsl:template>

  <xsl:template mode="datagrid.data.buttons.delete.style" match="*"></xsl:template>

  <xsl:template mode="datagrid.data.buttons.delete.onclick" match="*[not(key('junctionTable',../@fieldId))]/px:data/px:dataRow" priority="-1">
    <xsl:variable name="table" select="ancestor::*[key('data_table',generate-id())][1]"/>
    <xsl:text/>px.removeRecord('<xsl:value-of select="@x:id"/>'); <xsl:text/>
  </xsl:template>

  <xsl:template mode="datagrid.data.buttons.add.style" match="*">btn btn-primary btn-circle</xsl:template>

  <xsl:template mode="datagrid.data.buttons.add.onclick" match="*[not(key('junctionTable',../@fieldId))]/px:fields" priority="-1">
    <xsl:param name="parent_record" select="../.."/>
    <xsl:variable name="table" select="ancestor::*[key('data_table',generate-id())][1]"/>
    <xsl:text/>px.request('[<xsl:value-of select="$table/@Schema"/>].[<xsl:value-of select="$table/@Name"/>]', 'add', undefined, '<xsl:value-of select="$parent_record/@x:id"/>'); <xsl:text/>
  </xsl:template>
</xsl:stylesheet>
