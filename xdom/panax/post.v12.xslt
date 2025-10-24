<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns="http://panax.io/persistence"
xmlns:x="http://panax.io/xdom"
xmlns:px="http://panax.io"
xmlns:xdom="http://panax.io/xdom"
xmlns:state="http://panax.io/state"
xmlns:debug="http://panax.io/debug"
xmlns:initial="http://panax.io/xdom/values/initial"
xmlns:session="http://panax.io/session"
exclude-result-prefixes="initial session xdom debug px"
>
  <xsl:output method="xml" indent="no" omit-xml-declaration="yes"/>

  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')][string(@x:deleting)='true']" use="generate-id()"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')][@x:checked='true' and not(@initial:checked='true')]" use="generate-id()"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')][@x:checked='false' and (string(@identity)!='')]" use="generate-id()"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')]/*[not(@x:isSubmitable='false') and @x:value!=@initial:value]" use="generate-id(..)"/>
  <xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')]/*/*[not(@x:isSubmitable='false') and @initial:value!=@x:value]" use="generate-id(../..)"/>
  <!--<xsl:key name="changed" match="px:dataRow[not(@state:submitted='true')][.//*[@initial:value!=@x:value]]" use="generate-id()"/>-->

  <!--<xsl:key name="data_fields" match="px:fields/*" use="@fieldId"/>-->
  <xsl:key name="data_fields" match="px:dataRow/*" use="@fieldId"/>

  <xsl:key name="foreignTable" match="px:data/px:dataRow/*[*/px:data]" use="@fieldId"/>
  <!--<xsl:key name="foreignTable" match="px:fields/*[@dataType='foreignTable']" use="@fieldId"/>
  <xsl:key name="foreignTable" match="px:fields/*[@dataType='junctionTable']" use="@fieldId"/>-->
  <xsl:key name="foreignKey" match="px:fields/*[@dataType='foreignKey']" use="@fieldId"/>

  <xsl:key name="dataType.date" match="px:fields/*[contains(@dataType,'date')]" use="@fieldId"/>

  <xsl:key name="submitable_fields" match="px:fields/*[@isPrimaryKey='1']" use="@fieldId"/>

  <xsl:key name="submitable_fields" match="px:data/px:dataRow/*[not(*[@initial:value!=@x:value]/@fieldId)][@initial:value!=@x:value]" use="@fieldId"/>
  <xsl:key name="submitable_fields" match="px:data/px:dataRow/*/*[@fieldId][@initial:value!=@x:value]" use="@fieldId"/>
  <xsl:key name="submitable_fields" match="px:data/px:dataRow[not(@identity)]/*[@initial:value!=@x:value]" use="@fieldId"/>
  <xsl:key name="not_submitable_fields" match="px:data/px:dataRow/*[@x:isSubmitable='false']" use="generate-id()"/>

  <xsl:key name="isNewRecord" match="px:dataRow[not(@identity!='') and not(@primaryValue!='')][not(@x:checked or @initial:checked)]" use="generate-id(.)"/>
  <xsl:key name="isNewRecord" match="px:dataRow[not(@identity!='') and not(@primaryValue!='')][@x:checked='true' and not(@initial:checked='true')]" use="generate-id(.)"/>
  
  <!--<xsl:key name="isNewRecord" match="px:dataRow[not(@identity!='') and not(@primaryValue!='')]" use="generate-id(.)"/>-->

  <!-- mode="field_attributes" -->
  <xsl:template mode="field_attributes" match="text()"/>
  <xsl:template mode="field_attributes" match="IdOperacionDetalle">
    <xsl:attribute name="isPK">true</xsl:attribute>
  </xsl:template>

  <!-- mode="complete_data" -->
  <xsl:template mode="complete_data" match="*"/>

  <xsl:template mode="complete_data" match="*[key('foreignTable',@fieldId)]/*/px:data/px:dataRow">
    <xsl:variable name="foreignTable" select="key('data_fields',ancestor::*[key('foreignTable',@fieldId)][1]/@fieldId)/*[@foreignReference]"/>
    <!--<xsl:comment>
      <xsl:text/>foreign table: <xsl:value-of select="$foreignTable/@x:id"/>
    </xsl:comment>-->
    <xsl:call-template name="build_fKeys">
      <xsl:with-param name="name" select="$foreignTable/@foreignReference"/>
      <xsl:with-param name="maps">
        <xsl:choose>
          <xsl:when test="contains($foreignTable/@foreignReference,',')">
            <xsl:value-of select="$foreignTable/@primaryKey"/>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="($foreignTable[not(../Mappings)]/ancestor::*[px:data])[1]/@primaryKey"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="build_fKeys">
    <xsl:param name="name" />
    <xsl:param name="maps" />
    <xsl:if test="$name!=''">
      <fkey>
        <xsl:choose>
          <xsl:when test="contains($name, ',')">
            <xsl:attribute name="name">
              <xsl:value-of select="substring-before($name,',')"/>
            </xsl:attribute>
            <xsl:attribute name="maps">
              <xsl:value-of select="substring-before($maps,',')"/>
            </xsl:attribute>
          </xsl:when>
          <xsl:otherwise>
            <xsl:attribute name="name">
              <xsl:value-of select="$name"/>
            </xsl:attribute>
            <xsl:attribute name="maps">
              <xsl:value-of select="$maps"/>
            </xsl:attribute>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:apply-templates mode="post" select="field[@name=substring-before($name,',')]"/>
        <!--<xsl:choose>
          <xsl:when test="string(@identity)=''">NULL</xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="@identity"/>
          </xsl:otherwise>
        </xsl:choose>-->
      </fkey>
      <xsl:call-template name="build_fKeys">
        <xsl:with-param name="name" select="substring-after($name, ',')"/>
        <xsl:with-param name="maps" select="substring-after($maps, ',')"/>
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- identitValue mode -->
  <xsl:template mode="identitValue" match="Operacion">
    <xsl:value-of select="IdOperacion/@x:value"/>
  </xsl:template>

  <xsl:template mode="identitValue" match="Detalle">
    <xsl:value-of select="IdOperacionDetalle/@x:value"/>
  </xsl:template>

  <!-- post mode -->
  <xsl:template mode="post" match="px:dataRow/*[not(key('submitable_fields',@fieldId))][not(key('foreignKey',@fieldId))]">
  </xsl:template>

  <xsl:template mode="post" match="px:dataRow/*/*[not(key('submitable_fields',@fieldId))]">
  </xsl:template>

  <xsl:template mode="post" match="px:dataRow/*[key('submitable_fields',@fieldId)]">
    <xsl:param name="reference" select=".."/>
    <xsl:variable name="field_name">
      <xsl:choose>
        <xsl:when test="@fieldName">
          <xsl:value-of select="@fieldName"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="local-name(key('data_fields',@fieldId)|.)"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <!-- TODO: Corregir que el nombre de la columna venga de fields. Cuando es una tabla que tiene menos fields que el datarow, no va a encontrar la definición. Revisar si se corrige en que la aplicación la envíe o que se complete la información cuando se intente hacer la persistencia-->
    <field name="{$field_name}">
      <xsl:apply-templates mode="field_attributes" select="."/>
      <xsl:apply-templates mode="post.value" select="."/>
      <!--<xsl:apply-templates select="$values/@x:value"/>-->
    </field>
  </xsl:template>

  <xsl:template mode="post" match="CotizacionDetalle/px:data/px:dataRow/Proceso">
    <xsl:param name="reference" select=".."/>
    <xsl:variable name="field_name">
      <xsl:choose>
        <xsl:when test="@fieldName">
          <xsl:value-of select="@fieldName"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="local-name(key('data_fields',@fieldId)|.)"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <field name="{$field_name}">
      <value>
        <xsl:copy-of select="*"/>
      </value>
    </field>
  </xsl:template>

  <xsl:template mode="post" match="px:dataRow/*[key('foreignTable',@fieldId)]">
    <xsl:param name="reference" select=".."/>
    <xsl:variable name="field_name" select="key('foreignTable',@fieldId)/@fieldName"/>
    <xsl:apply-templates mode="post" select="*">
      <xsl:with-param name="reference" select="*/px:data/px:dataRow"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template mode="post" match="px:dataRow/*/*[key('submitable_fields',@fieldId)]">
    <xsl:param name="reference" select=".."/>
    <xsl:variable name="field_name">
      <xsl:choose>
        <xsl:when test="@fieldName">
          <xsl:value-of select="@fieldName"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="local-name(key('data_fields',../@fieldId)|.)"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <field name="{$field_name}">
      <xsl:apply-templates mode="field_attributes" select="."/>
      <xsl:apply-templates mode="post.value" select="."/>
      <!--<xsl:apply-templates select="$values/@x:value"/>-->
    </field>
  </xsl:template>

  <xsl:template mode="post" match="px:dataRow/*[key('not_submitable_fields',generate-id())]" priority="10"/>

  <xsl:template mode="post" match="px:dataRow">
    <xsl:param name="reference" select="."/>
    <xsl:variable name="operation_name">
      <xsl:choose>
        <xsl:when test="key('isNewRecord',generate-id())">insertRow</xsl:when>
        <xsl:when test="@x:deleting='true' or @initial:checked='true' and not(@x:checked='true')">deleteRow</xsl:when>
        <xsl:otherwise>updateRow</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:element name="{$operation_name}">
      <xsl:apply-templates mode="post" select="@identity|self::*[not(@identity)]/@primaryValue">
        <xsl:with-param name="reference" select="."/>
      </xsl:apply-templates>
      <xsl:if test="not($operation_name='deleteRow')">
        <xsl:apply-templates mode="complete_data" select="."/>
        <xsl:apply-templates mode="post" select="*">
          <xsl:with-param name="reference" select="$reference"/>
        </xsl:apply-templates>
        <xsl:apply-templates select=".">
          <xsl:with-param name="reference" select="$reference"/>
        </xsl:apply-templates>
      </xsl:if>
    </xsl:element>
  </xsl:template>

  <xsl:template mode="post" match="px:dataRow[not(key('changed',generate-id()))][not(descendant-or-self::px:dataRow[key('changed',generate-id())])]" priority="5">
    <!--<xsl:comment>Not changed</xsl:comment>-->
  </xsl:template>

  <xsl:template mode="post" match="@identity|@primaryValue">
    <xsl:attribute name="identityValue">
      <xsl:value-of select="."/>
    </xsl:attribute>
  </xsl:template>

  <xsl:template mode="post.value" match="*">
    <xsl:apply-templates mode="post" select="@x:value"/>
  </xsl:template>

  <!--<xsl:template mode="post.value" match="*[key('foreignKey',@fieldId)]">
    cascade
  </xsl:template>-->

  <xsl:template mode="post" match="@x:value">
    <xsl:text>'</xsl:text>
    <xsl:call-template name="replace">
      <xsl:with-param name="text" select="."/>
      <xsl:with-param name="replace">'</xsl:with-param>
      <xsl:with-param name="by">''</xsl:with-param>
    </xsl:call-template>
    <xsl:text>'</xsl:text>
  </xsl:template>

  <xsl:template mode="post" match="*[key('dataType.date',@fieldId)][not(contains(@x:value,'T'))]/@x:value">
    <xsl:text>'</xsl:text>
    <xsl:value-of select="translate(.,'-','')"/>
    <xsl:text>'</xsl:text>
  </xsl:template>

  <xsl:template mode="post" match="*[contains(@x:value,'C:\fakepath\')]/@x:value">
    <xsl:text>'C:\fakepath\</xsl:text>
    <xsl:value-of select="../@x:id"/>
    <xsl:text>.</xsl:text>
    <xsl:value-of select="substring-after(.,'.')"/>
    <xsl:text>'</xsl:text>
  </xsl:template>

  <xsl:template mode="post" match="*[@x:format='money' or number(@x:value)=@x:value and not(starts-with(@x:value,'0'))]/@x:value">
    <xsl:value-of select="."/>
  </xsl:template>

  <xsl:template mode="post" match="@x:value[.='' or .='NULL']" priority="2">NULL</xsl:template>

  <!-- modeless -->
  <xsl:template match="text()|node()|@*"/>

  <xsl:template mode="post" match="*[not(parent::px:dataRow)][px:fields or px:data]">
    <xsl:param name="reference" select="px:data/px:dataRow"/>
    <xsl:choose>
      <xsl:when test="$reference/descendant-or-self::px:dataRow[key('changed',generate-id())]">
        <dataTable name="[{@Schema}].[{@Name}]">
          <xsl:attribute name="identityKey">
            <xsl:value-of select="@identityKey|self::*[not(@identityKey)]/@primaryKey[not(contains(.,','))]"/>
          </xsl:attribute>
          <!--<xsl:apply-templates mode="post.identity" select="."/>-->
          <xsl:apply-templates mode="post" select="$reference">
            <xsl:sort select="@initial:checked" order="descending"/>
            <xsl:sort select="@x:checked" order="ascending"/>
          </xsl:apply-templates>
        </dataTable>
      </xsl:when>
      <xsl:otherwise>
        <!--<xsl:comment>
          <xsl:text/>Not implemented <xsl:value-of select="@x:id"/>
        </xsl:comment>-->
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/*">
    <xsl:apply-templates mode="post" select="."/>
  </xsl:template>

  <xsl:template match="/">
    <batch>
      <xsl:apply-templates mode="post" select="."/>
    </batch>
  </xsl:template>

  <xsl:template name="replace">
    <xsl:param name="text" />
    <xsl:param name="replace" />
    <xsl:param name="by" />
    <xsl:choose>
      <xsl:when test="$text = '' or $replace = '' or not($replace)" >
        <xsl:value-of select="$text" />
      </xsl:when>
      <xsl:when test="contains($text, $replace)">
        <xsl:value-of select="substring-before($text,$replace)" />
        <xsl:value-of select="$by" />
        <xsl:call-template name="replace">
          <xsl:with-param name="text" select="substring-after($text,$replace)" />
          <xsl:with-param name="replace" select="$replace" />
          <xsl:with-param name="by" select="$by" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$text" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>