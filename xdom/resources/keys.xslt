<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:msxsl="urn:schemas-microsoft-com:xslt"
xmlns:x="http://panax.io/xdom"
xmlns:px="http://panax.io"
xmlns:state="http://panax.io/state"
xmlns:session="http://panax.io/session"
xmlns:confirmed="http://panax.io/xdom/values/confirmed"
xmlns:initial="http://panax.io/xdom/values/initial"
xmlns:source="http://panax.io/xdom/binding/source"
exclude-result-prefixes="msxsl"
>
  <!--schema-->

  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')][string(@x:deleting)='true']" use="generate-id()"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')][@x:checked='true' and not(@initial:checked='true')]" use="generate-id()"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')][@x:checked='false' and (string(@identity)!='')]" use="generate-id()"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')]/*[not(@x:isSubmitable='false') and @x:value!=@initial:value]" use="generate-id(..)"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')]/*/*[not(@x:isSubmitable='false') and @initial:value!=@x:value]" use="generate-id(../..)"/>

  <!--<xsl:key name="user" match="session:user_login" use=""/>-->

  <xsl:key name="data_table" match="*[px:data or px:fields or px:layout]" use="concat(@Schema,'.',@Name)"/>
  <xsl:key name="data_row" match="px:data/*" use="concat(../../@Schema,'.',../../@Name)"/>
  <xsl:key name="data_field" match="px:data/px:dataRow/*" use="concat(../../../@Schema,'.',../../../@Name,'.',local-name())"/>

  <xsl:key name="data_table" match="*[px:data or px:fields or px:layout]" use="generate-id()"/>
  <xsl:key name="data_set" match="px:data/*" use="generate-id(../..)"/>
  <xsl:key name="data_row" match="px:data/*" use="generate-id()"/>
  <xsl:key name="data_layout" match="px:layout" use="generate-id(..)"/>
  <xsl:key name="data_field" match="px:dataRow/*" use="generate-id(../..)"/>
  <xsl:key name="data_fields" match="px:data/px:dataRow/*" use="generate-id(../../..)"/>
  <xsl:key name="primary_field" match="px:fields/*[@isPrimaryKey='1']" use="@fieldId"/>
  <xsl:key name="fields" match="*[not(px:layout)]/px:fields/*" use="generate-id(../..)"/>
  <xsl:key name="fields" match="px:layout//px:field" use="generate-id(ancestor::px:layout/..)"/>
  <xsl:key name="field" match="px:fields//*[@x:fieldId]" use="@x:fieldId"/>
  <xsl:key name="field" match="px:fields/*" use="@fieldId"/>
  <xsl:key name="field" match="px:fields/*" use="generate-id()"/>
  <xsl:key name="hidden" match="px:fields/*[@dataType='identity']" use="generate-id()"/>
  <xsl:key name="filterBy" match="x:dummy" use="generate-id()"/>
  <xsl:key name="default_filter" match="px:data/*/*/@x:value" use="concat(generate-id(../../../..),'::',name(..))"/>
  
  <xsl:key name="model_row" match="px:data/*[1]" use="generate-id()"/>

  <xsl:key name="fields" match="x:dummy" use="concat(generate-id(..),'::',name())"/>
  <xsl:key name="filterBy" match="x:dummy" use="generate-id()"/>
  <xsl:key name="totalizer" match="x:dummy" use="."/>
  <xsl:key name="hidden" match="x:dummy" use="generate-id()"/>
  <xsl:key name="editable" match="x:dummy" use="generate-id()"/>
  <xsl:key name="readonly" match="px:fields/*[@mode='readonly']" use="@fieldId"/>
  <xsl:key name="readonly" match="px:fields/*[@mode='readonly']" use="@x:fieldId"/>
  <xsl:key name="readonly" match="px:fields/*[@mode='readonly']" use="generate-id()"/>
  <xsl:key name="readonly" match="px:fields//*[ancestor-or-self::*[@mode][1]/@mode='readonly']" use="@fieldId"/>
  <xsl:key name="readonly" match="px:fields//*[ancestor-or-self::*[@mode][1]/@mode='readonly']" use="@x:fieldId"/>
  <xsl:key name="readonly" match="*[@disableUpdate=1 and @mode='edit']/px:fields/*" use="@fieldId"/>
  <xsl:key name="readonly" match="*[@disableInsert=1 and @mode='add']/px:fields/*" use="@fieldId"/>
  <xsl:key name="readonly" match="*[@disableUpdate=1 and @mode='edit']/px:fields/*" use="@x:fieldId"/>
  <xsl:key name="readonly" match="*[@disableInsert=1 and @mode='add']/px:fields/*" use="@x:fieldId"/>

  <xsl:key name="required" match="px:fields/*[@isNullable='0']" use="generate-id()"/>
  <xsl:key name="required" match="px:fields/*[@isNullable='0']" use="@fieldId"/>
  <xsl:key name="required" match="px:fields/*[@isNullable='0']" use="@x:fieldId"/>

  <xsl:key name="type.boolean" match="px:fields/*[@dataType='bit']" use="@fieldId"/>

  <xsl:key name="controls.checkbox" match="px:fields/*[contains(@controlType,'checkbox')]" use="generate-id()"/>
  <xsl:key name="controls.radiogroup" match="px:fields/*[@controlType='radiogroup']" use="generate-id()"/>
  <xsl:key name="controls.date" match="px:fields/*[contains(@dataType,'date')]" use="generate-id()"/>
  <xsl:key name="controls.yesno" match="px:fields/*[@dataType='bit']" use="generate-id()"/>
  <xsl:key name="controls.input" match="px:fields/*[@mode='readonly']" use="generate-id()"/>
  <xsl:key name="controls.file" match="px:fields/*[@controlType='file']" use="generate-id()"/>
  <xsl:key name="controls.file" match="px:fields/*[@dataType='file']" use="generate-id()"/>
  <xsl:key name="controls.email" match="px:fields/*[@controlType='email']" use="generate-id()"/>
  <xsl:key name="controls.email" match="px:fields/*[@dataType='email']" use="generate-id()"/>
  <xsl:key name="controls.password" match="px:fields/*[@controlType='password']" use="generate-id()"/>

  <xsl:key name="controls.percentage" match="px:fields/*[@dataType='percentage']" use="@fieldId"/>
  <xsl:key name="controls.checkbox" match="px:fields/*[contains(@controlType,'checkbox')]" use="@fieldId"/>
  <xsl:key name="controls.radiogroup" match="px:fields/*[@controlType='radiogroup']" use="@fieldId"/>
  <xsl:key name="controls.date" match="px:fields/*[contains(@dataType,'date')]" use="@fieldId"/>
  <xsl:key name="controls.yesno" match="px:fields/*[@dataType='bit']" use="@fieldId"/>
  <xsl:key name="controls.input" match="px:fields/*[@mode='readonly']" use="@fieldId"/>
  <xsl:key name="controls.file" match="px:fields/*[@controlType='file']" use="@fieldId"/>
  <xsl:key name="controls.file" match="px:fields/*[@dataType='file']" use="@fieldId"/>
  <xsl:key name="controls.email" match="px:fields/*[@controlType='email']" use="@fieldId"/>
  <xsl:key name="controls.password" match="px:fields/*[@controlType='password']" use="@fieldId"/>
  <xsl:key name="controls.password" match="px:fields/*[@dataType='password' and @controlType='default']" use="@fieldId"/>
  <xsl:key name="controls.money" match="px:fields/*[@dataType='money']" use="@fieldId"/>
  <xsl:key name="controls.picture" match="px:fields/*[@controlType='photo']" use="@fieldId"/>
  <xsl:key name="controls.picture" match="px:fields/*[@dataType='picture']" use="@fieldId"/>
  <xsl:key name="controls.xml" match="px:fields/*[@dataType='xml']" use="@fieldId"/>
  <xsl:key name="controls.treeview" match="*[@referencesItself]" use="@fieldId"/>

  <xsl:key name="records_per_parent" match="*[@referencesItself]/source:value/x:r" use="concat(generate-id(..),'::',@*[name()=ancestor::*[@referencesItself]/@foreignKey])"/>

  <xsl:key name="junctionTable" match="px:fields/*[@dataType='junctionTable']" use="@fieldId"/>
  <xsl:key name="foreignKey" match="px:fields/*[@dataType='foreignKey']" use="@fieldId"/>
  <xsl:key name="foreignKey" match="px:fields/*[@dataType='foreignKey']//*[@Schema and not(@dataType)]" use="concat((ancestor::*[@fieldId and @dataType])[1]/@fieldId,'::',local-name())"/>
  <xsl:key name="foreignKey" match="px:fields/*[@dataType='foreignKey']//*[@Schema and not(@dataType)]" use="generate-id()"/>

  <xsl:key name="blocked" match="*[@dataType='junctionTable']/*/px:fields/*[@dataType='foreignKey' and @isPrimaryKey='1']" use="@fieldId"/>
  <xsl:key name="blocked" match="*[@dataType='junctionTable']/*/px:fields/*[@dataType='foreignKey' and @isPrimaryKey='1']/*" use="@fieldId"/>
  <xsl:key name="modalOpen" match="*[@confirmed:value!=@x:value]" use="true()"/>
  <xsl:key name="modalOpen" match="*[@state:modal='on']" use="true()"/>


  <xsl:key name="foreignTable" match="px:fields/*[@dataType='foreignTable' or @dataType='junctionTable']" use="@fieldId"/>


  <xsl:key name="active" match="*[self::px:tab or self::px:groupTabPanel][not(../@state:active)][1]" use="generate-id()"/>
  <xsl:key name="active" match="*[self::px:tab or self::px:groupTabPanel][position()=../@state:active]" use="generate-id()"/>


  <xsl:key name="enable_paging" match="*[@totalRecords &gt; @pageSize]" use="true()"/>
  <xsl:key name="enable_paging" match="*[@pageSize &gt; @totalRecords and @pageIndex &gt; 1]" use="true()"/>
  <xsl:key name="enable_paging" match="*" use="true()"/>
  <xsl:key name="disable_insert" match="*[@supportsInsert=0]" use="@fieldId"/>
  <xsl:key name="disable_delete" match="*[@supportsDelete=0]" use="@fieldId"/>
  <xsl:key name="disable_edit" match="*[@supportsEdit=0]" use="@fieldId"/>
  <xsl:key name="disable_insert" match="*[@disableInsert=1]" use="@fieldId"/>
  <xsl:key name="disable_delete" match="*[@disableInsert=1]" use="@fieldId"/>
  <xsl:key name="disable_edit" match="*[@disableInsert=1]" use="@fieldId"/>

  <xsl:key name="disable_insert" match="*[@supportsInsert=0]" use="generate-id()"/>
  <xsl:key name="disable_delete" match="*[@supportsDelete=0]" use="generate-id()"/>
  <xsl:key name="disable_edit" match="*[@supportsEdit=0]" use="generate-id()"/>
  <xsl:key name="disable_insert" match="*[@disableInsert=1]" use="generate-id()"/>
  <xsl:key name="disable_delete" match="*[@disableInsert=1]" use="generate-id()"/>
  <xsl:key name="disable_edit" match="*[@disableInsert=1]" use="generate-id()"/>

  <xsl:variable name="pageIndex" select="@pageIndex"/>
  <xsl:variable name="totalRecords" select="@totalRecords"/>
  <xsl:variable name="pageSize" select="@pageSize"/>
  <xsl:variable name="maxIndex" select="ceiling($totalRecords div $pageSize)"/>


  <xsl:key name="blocked" match="*[@state:submitting='true']" use="true()"/>
  <xsl:key name="blocked" match="*[@state:submitted='true']" use="true()"/>

  <xsl:key name="submitting" match="*[@state:submitting='true']" use="true()"/>
  <xsl:key name="submitted" match="*[@state:submitted='true']" use="true()"/>

  <xsl:key name="blocked" match="px:dataRow[@state:submitting='true']" use="generate-id()"/>
  <xsl:key name="blocked" match="px:dataRow[@state:submitted='true']" use="generate-id()"/>
  <xsl:key name="blocked" match="px:dataRow[@state:submitting='true']//*[@fieldId]" use="@fieldId"/>
  <xsl:key name="blocked" match="px:dataRow[@state:submitted='true']//*[@fieldId]" use="@fieldId"/>

  <xsl:key name="submitting" match="px:dataRow[ancestor-or-self::*[@state:submitting='true']]" use="generate-id()"/>
  <xsl:key name="submitted" match="px:dataRow[ancestor-or-self::*[@state:submitted='true']]" use="generate-id()"/>

  <xsl:key name="required" match="px:fields/*[@isNullable='0']" use="generate-id()"/>

  <xsl:key name="empty" match="px:dataRow/*[string(@x:value)='']" use="generate-id()"/>
  <xsl:key name="empty" match="px:dataRow/*[string(@x:value)='0']" use="generate-id()"/>

  <!--datatypes-->
  <xsl:key name="money" match="/" use="."/>
  <xsl:key name="date" match="/" use="."/>

  <xsl:key name="data_set" match="px:fields//px:data/*" use="@fieldId"/>
  <xsl:key name="data_set" match="source:value/*" use="generate-id(../..)"/>


</xsl:stylesheet>
