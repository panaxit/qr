<!--<!DOCTYPE stylesheet [ //En Internet Explorer no funciona, marca error de que 
  <!ENTITY nbsp "">
]>-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:debug="http://panax.io/debug"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns:x="http://panax.io/xdom"
  xmlns:state="http://panax.io/state"
  xmlns:session="http://panax.io/session"
  xmlns:filters="http://panax.io/filters"
  xmlns:custom="http://panax.io/custom"
  xmlns:datagrid="http://panax.io/widgets/datagrid"
  xmlns:source="http://panax.io/xdom/binding/source"
  xmlns:px="http://panax.io"
  exclude-result-prefixes="debug msxsl x state session filters custom datagrid px source"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <!--<xsl:import href="format_values.xslt"/>-->
  <xsl:import href="controls.xslt"/>
  <!--<xsl:include href="keys.xslt"/>-->
  <xsl:output method="xml" indent="yes" />
  <xsl:param name="state:busy">false</xsl:param>

  <xsl:template match="*" mode="formview.styles" priority="-1">
    <style>
      <![CDATA[
        .table.form iframe { 
          width:1050px; 
          height:1000px;
        }
        
        .table .foot {
          min-height: 30px;
        }
      ]]>
    </style>
  </xsl:template>

  <xsl:template match="/">
    <div>
      <xsl:apply-templates mode="formview.styles"/>
      <xsl:apply-templates select="*/px:data/px:dataRow"/>
    </div>
  </xsl:template>

  <xsl:template match="*" mode="form.body.attributes" priority="-1"/>

  <xsl:template match="*[key('data_row',generate-id())]">
    <xsl:variable name="data_table" select="ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <div>
      <div class="table form">
        <div class="head">
          <xsl:apply-templates mode="form.header" select=".">
            <!--<xsl:with-param name="data_row" select="."/>-->
          </xsl:apply-templates>
        </div>
        <div class="body">
          <xsl:apply-templates mode="form.body.attributes" select="."/>
          <xsl:apply-templates mode="form.body.layout" select="key('data_layout',generate-id($data_table))[last()]|key('field',$data_table/../@fieldId)/*/px:layout">
            <xsl:with-param name="data_row" select="."/>
          </xsl:apply-templates>
        </div>
        <div class="foot">
          <xsl:apply-templates mode="form.footer" select=".">
            <!--<xsl:with-param name="data_row" select="."/>-->
          </xsl:apply-templates>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template mode="form.header.buttons" match="*">
    <xsl:apply-templates mode="form.buttons.save" select="."/>
  </xsl:template>

  <xsl:template mode="form.buttons.save" match="*">
    <xsl:variable name="changes" select="descendant-or-self::*[key('changed',generate-id())]"/>
    <button type="button">
      <xsl:attribute name="class">
        <xsl:text/>btn btn-outline-success my-2 my-sm-0<xsl:if test="not($changes)">
          <xsl:text/> disabled
        </xsl:if>
      </xsl:attribute>
      <xsl:if test="not($changes)">
        <xsl:attribute name="onclick"/>
      </xsl:if>
      <xsl:choose>
        <!--<xsl:when test="not(//*[key('changed',generate-id())])">
          <xsl:attribute name="class">btn btn-success my-2 my-sm-0</xsl:attribute>
          <xsl:attribute name="onclick">window.history.back();</xsl:attribute>
          <xsl:text>Regresar</xsl:text>
        </xsl:when>-->
        <xsl:when test="key('submitting',generate-id())">
          <xsl:attribute name="class">btn btn-warning my-2 my-sm-0 working</xsl:attribute>
          <xsl:attribute name="onclick">xdom.data.remove(xdom.data.document.selectSingleNode('//@state:submitting')); xdom.dom.refresh({forced:true});</xsl:attribute>
          <xsl:text>Guardando...</xsl:text>
        </xsl:when>
        <xsl:when test="key('submitted',generate-id())">
          <xsl:attribute name="class">btn btn-success my-2 my-sm-0</xsl:attribute>
          <xsl:attribute name="onclick">window.history.back();</xsl:attribute>
          <xsl:text>Regresar</xsl:text>
        </xsl:when>
        <xsl:when test="$state:busy='true'">
          <xsl:attribute name="class">btn btn-warning my-2 my-sm-0 working</xsl:attribute>
          <xsl:attribute name="onclick"></xsl:attribute>
          <xsl:text>Trabajando...</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="onclick">
            <xsl:apply-templates mode="form.buttons.save.onclick" select="."/>
          </xsl:attribute>
          <xsl:text/>Guardar<xsl:text/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text> </xsl:text>
      <!--<xsl:for-each select="//*[key('changed',generate-id())]">
        <xsl:value-of select="count(key('changed',generate-id()))"/>:
        <xsl:for-each select="key('changed',generate-id())">
          <xsl:if test="position()&gt;1">, </xsl:if><xsl:value-of select="name()"/>
        </xsl:for-each>
      </xsl:for-each>-->
    </button>
  </xsl:template>


  <xsl:template mode="form.buttons.save" match="*[.//source:*[not(*)]]">
    <h4 class="font-weight-bold text-info my-4 mx-5 my-sm-0">
      Cargando información...
      <i class="fas fa-spinner fa-spin text-info"></i>
    </h4>
  </xsl:template>


  <xsl:template mode="form.buttons.save.onclick" match="*">
    <xsl:text><![CDATA[try{this.store.submit();} catch(e){alert(e)}]]></xsl:text>
  </xsl:template>



  <xsl:template mode="form.buttons.save" match="*[key('disable_insert',generate-id()) and key('disable_edit',generate-id()) and key('disable_delete',generate-id())]" priority="5">
  </xsl:template>

  <xsl:template mode="form.header" match="*">
    <xsl:param name="data_row" select="."/>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <xsl:choose>
        <xsl:when test="not(../../ancestor::*[key('data_table',generate-id())][1])">
          <a class="navbar-brand" href="#">
            <xsl:value-of select="../../@headerText"/>
          </a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="style">padding:unset; display:none;</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <xsl:if test="not(../../ancestor::*[key('data_table',generate-id())][1])">
          <form class="form-inline my-2 my-lg-0" onsubmit="return false;">
            <xsl:apply-templates mode="form.header.buttons" select="."/>
          </form>
        </xsl:if>
      </div>
    </nav>
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:fieldSet[@name!='']">
    <xsl:param name="data_row"/>
    <fieldset>
      <legend>
        <xsl:value-of select="@name"/>
      </legend>
      <xsl:apply-templates mode="form.body.layout">
        <xsl:with-param name="data_row" select="$data_row"/>
      </xsl:apply-templates>
    </fieldset>
  </xsl:template>

  <!--<xsl:template mode="form.body.layout" match="px:tab">
    <xsl:param name="data_row"/>
    <div class="tab-pane fade" id="{generate-id()}" role="tabpanel" aria-labelledby="v-pills-profile-tab">
      <xsl:attribute name="class">tab-pane fade show active</xsl:attribute>
      <xsl:apply-templates mode="form.body.layout">
        <xsl:with-param name="data_row" select="$data_row"/>
      </xsl:apply-templates>
    </div>
  </xsl:template>-->

  <xsl:template mode="form.body.layout" match="px:tabPanel|*[not(self::px:tabPanel)]/px:tab">
    <xsl:param name="data_row"/>
    <ul class="nav nav-tabs">
      <xsl:for-each select="px:tab|self::px:tab">
        <xsl:if test="not(key('hidden',generate-id()))">
          <li class="nav-item">
            <a class="nav-link" href="#" onclick="xdom.data.update('{../@x:id}','@state:active','{position()}')">
              <xsl:if test="key('active',generate-id())">
                <xsl:attribute name="class">nav-link active</xsl:attribute>
              </xsl:if>
              <xsl:value-of select="@name"/>
            </a>
          </li>
        </xsl:if>
      </xsl:for-each>
      <!--<li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="#">Action</a>
          <a class="dropdown-item" href="#">Another action</a>
          <a class="dropdown-item" href="#">Something else here</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#">Separated link</a>
        </div>
      </li>-->
    </ul>
    <div class="tab-content" id="container_{@x:id}">
      <div>
        <xsl:apply-templates mode="form.body.layout">
          <xsl:with-param name="data_row" select="$data_row"/>
        </xsl:apply-templates>
      </div>
    </div>
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:groupTabPanel">
    <xsl:param name="data_row"/>
    <div class="tab-pane fade" id="{generate-id()}" role="tabpanel" aria-labelledby="v-pills-profile-tab">
      <xsl:if test="key('active',generate-id())">
        <xsl:attribute name="class">tab-pane fade show active</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates mode="form.body.layout">
        <xsl:with-param name="data_row" select="$data_row"/>
      </xsl:apply-templates>
    </div>
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:layout">
    <xsl:param name="data_row"/>
    <xsl:apply-templates mode="form.body.layout">
      <xsl:with-param name="data_row" select="$data_row"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:layout[px:groupTabPanel]">
    <xsl:param name="data_row"/>
    <div class="row group-tab-pane">
      <div class="col-4 col-md-3 col-lg-2 col-xl-2 group-tab-nav">
        <ul class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical" style="width:fit-content;">
          <xsl:for-each select="px:groupTabPanel">
            <xsl:if test="not(key('hidden',generate-id()))">
              <li class="nav-item" style="margin-bottom: 10px;">
                <a class="nav-link" id="v-pills-home-tab" data-toggle="pill" href="#v-pills-home" role="tab" aria-controls="v-pills-home" aria-selected="true" onclick="xdom.data.update('{../@x:id}','@state:active','{position()}')">
                  <xsl:if test="key('active',generate-id())">
                    <xsl:attribute name="class">nav-link active</xsl:attribute>
                  </xsl:if>
                  <xsl:value-of select="@name"/>
                </a>
              </li>
            </xsl:if>
          </xsl:for-each>
          <!--<li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-toggle="dropd!own" href="#" role="button" aria-haspopup="true" aria-expanded="false">Dropdown</a>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#">Action</a>
              <a class="dropdown-item" href="#">Another action</a>
              <a class="dropdown-item" href="#">Something else here</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#">Separated link</a>
            </div>
          </li>-->
        </ul>
      </div>
      <div class="col-8 col-md-9 col-lg-10 col-xl-10" style="padding-left: unset;">
        <div class="tab-content" id="v-pills-tabContent">
          <xsl:apply-templates select="px:groupTabPanel" mode="form.body.layout">
            <xsl:with-param name="data_row" select="$data_row"/>
          </xsl:apply-templates>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:fieldContainer[px:field[1][key('type.boolean',@fieldId)]]">
    <xsl:param name="data_row"/>
    <xsl:variable name="field" select="key('field',@fieldId)[1]"/>
    <xsl:apply-templates mode="form.body.layout" select="px:field[1]|*[$data_row/*[1]/@x:value='1']">
      <xsl:with-param name="data_row" select="$data_row"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:field">
    <xsl:param name="data_row"/>
    <xsl:variable name="field" select="key('field',@fieldId)[1]"/>
    <xsl:variable name="data_field" select="$data_row/*[@fieldId=$field/@fieldId]"/>
    <xsl:apply-templates mode="form.body.field" select="$data_field">
      <xsl:with-param name="field" select="$field"/>
      <xsl:with-param name="data_row" select="$data_row"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template mode="form.body.field" match="px:dataRow/*">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="key('field',@fieldId)[1]"/>
    <xsl:param name="data_row" select="$data_field/.."/>
    <xsl:if test="not(key('hidden',generate-id($data_field)))">
      <div class="form-group row">
        <label class="col-sm-3 col-form-label">
          <xsl:apply-templates mode="form.body.field.label" select="$field"/>
        </label>
        <div class="col-sm-9">
          <xsl:apply-templates mode="control" select="$data_field">
            <xsl:with-param name="field" select="$field"/>
            <xsl:with-param name="data_field" select="$data_field"/>
            <!--<xsl:with-param name="data_catalog" select="($field/px:data|$data_field/*/source:value)[last()]"/>-->
          </xsl:apply-templates>
        </div>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template mode="form.body.field" match="px:dataRow/*[key('foreignTable',@fieldId)]">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="key('field',@fieldId)[1]"/>
    <xsl:param name="data_row" select="$data_field/.."/>
    <div class="form-group row">
      <div class="col-12">
        <fieldset>
          <legend>
            <xsl:apply-templates mode="form.body.field.label" select="$field"/>
          </legend>
          <xsl:apply-templates mode="control" select="$data_field">
            <xsl:with-param name="field" select="$field"/>
            <xsl:with-param name="data_field" select="$data_row/*[@fieldId=$field/@fieldId]"/>
          </xsl:apply-templates>
        </fieldset>
      </div>
    </div>
  </xsl:template>

  <xsl:template mode="form.body.field" match="px:dataRow/*[key('foreignKey',@fieldId)][*[@fieldId]]">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="key('field',@fieldId)[1]"/>
    <xsl:param name="data_row" select="$data_field/.."/>
    <xsl:apply-templates mode="form.body.field" select="*[@fieldId]">
      <xsl:with-param name="field" select="$field"/>
      <xsl:with-param name="data_field" select="$data_field"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template mode="form.body.field" match="px:dataRow/*[key('foreignKey',@fieldId)][*[@fieldId][*[@Schema and @Name]]]">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="key('field',@fieldId)[1]"/>
    <xsl:param name="data_row" select="$data_field/.."/>
    <fieldset>
      <legend>
        <xsl:apply-templates mode="form.body.field.label" select="($field)[1]"/>
      </legend>
      <xsl:apply-templates mode="form.body.field" select="*[@fieldId]">
        <xsl:with-param name="field" select="$field"/>
        <xsl:with-param name="data_field" select="$data_field"/>
        <!--<xsl:with-param name="data_catalog" select="($field/px:data|$data_field/*/source:value)[last()]"/>-->
      </xsl:apply-templates>
    </fieldset>
  </xsl:template>

  <xsl:key name="foreignKey" match="px:fields/*[@dataType='foreignKey']//*[@Schema and not(@dataType) and not(ancestor::x:r)]" use="concat((ancestor::*[@fieldId and @dataType])[1]/@fieldId,'::',local-name())"/>

  <xsl:template mode="form.body.field" match="px:dataRow/*[key('foreignKey',@fieldId)]//*">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="field" select="key('field',@fieldId)[1]"/>
    <xsl:param name="data_row" select="$data_field/.."/>
    <xsl:variable name="parent" select="current()/*[key('foreignKey',concat($field/@fieldId,'::',local-name()))]"/>
    <xsl:apply-templates mode="form.body.field" select="$parent">
      <xsl:with-param name="data_field" select="($data_field//*[name()=name($parent) and not(ancestor::x:r)])[1]"/>
      <xsl:with-param name="data_row" select="$data_row"/>
      <xsl:with-param name="field" select="$field"/>
    </xsl:apply-templates>
    <div class="form-group row">
      <label class="col-sm-3 col-form-label">
        <xsl:apply-templates mode="form.body.field.label" select="."/>
      </label>
      <div class="col-sm-9">
        <xsl:variable name="current_data_field" select="parent::*[key('foreignKey',@fieldId)]|current()[not(parent::*[key('foreignKey',@fieldId)])]"/>
        <xsl:variable name="current_field" select="key('field',$current_data_field/@x:fieldId)[1] | key('foreignKey',concat($field/@fieldId,'::',local-name()))[not(parent::*[key('foreignKey',@fieldId)])]"/>
        <xsl:apply-templates mode="control" select="$current_data_field">
          <xsl:with-param name="field" select="$current_field"/>
          <xsl:with-param name="data_row" select="$data_row"/>
          <xsl:with-param name="data_field" select="$data_field"/>
          <!--<xsl:with-param name="data_catalog" select="($current_field/px:data|source:value)[last()]/*"/>-->
        </xsl:apply-templates>
      </div>
    </div>
  </xsl:template>

  <!-- form.body.field.label -->
  <xsl:template mode="form.body.field.label" match="*">
    <xsl:variable name="headerText">
      <xsl:apply-templates mode="headerText" select="key('field',@fieldId)[1]"/>
    </xsl:variable>
    <xsl:value-of select="concat($headerText,':')"/>
  </xsl:template>

  <xsl:template mode="form.body.field.label" match="*[key('foreignTable',@fieldId)]">
    <xsl:apply-templates mode="headerText" select="key('field',@fieldId)[1]"/>
  </xsl:template>

  <xsl:template mode="form.body.field.label" match="*[not(@fieldId)]|*[key('foreignKey',@fieldId)]//*">
    <xsl:variable name="headerText">
      <xsl:apply-templates mode="headerText" select="."/>
    </xsl:variable>
    <xsl:value-of select="concat($headerText,':')"/>
  </xsl:template>

  <xsl:template mode="form.body.field.label" match="*[key('foreignKey',@fieldId)]/*[@fieldId]">
    <xsl:variable name="headerText">
      <xsl:apply-templates mode="headerText" select="key('field',../@fieldId)[1]"/>
    </xsl:variable>
    <xsl:value-of select="concat($headerText,':')"/>
  </xsl:template>

  <xsl:template mode="headerText" match="*">
    <xsl:value-of select="@headerText"/>
  </xsl:template>


  <xsl:template mode="control" match="px:dataRow/*" priority="-5">
    <xsl:param name="data_field" select="."/>
    <xsl:param name="data_row" select=".."/>
    <xsl:param name="field" select="key('field',@fieldId)[1]"/>
    <!--<xsl:param name="data_catalog" select="($field/px:data|$data_field/*/source:value)[last()]"/>-->
    <xsl:apply-templates mode="control" select="$field">
      <xsl:with-param name="field" select="$field"/>
      <xsl:with-param name="data_row" select="$data_row"/>
      <xsl:with-param name="data_field" select="$data_field"/>
      <!--<xsl:with-param name="data_catalog" select="$data_catalog"/>-->
    </xsl:apply-templates>
  </xsl:template>


  <xsl:template mode="control" match="px:fields/*[key('foreignKey',@fieldId)]">
    <xsl:param name="data_row"/>
    <xsl:param name="field" select="."/>
    <xsl:param name="data_field" select="$data_row/*[@fieldId=$field/@fieldId]"/>
    <!--<xsl:param name="data_catalog" select="px:dummy"/>-->
    <xsl:apply-templates mode="control" select="*[@Schema and @Name]">
      <xsl:with-param name="field" select="$field"/>
      <xsl:with-param name="data_row" select="$data_row"/>
      <xsl:with-param name="data_field" select="$data_field"/>
      <!--<xsl:with-param name="data_catalog" select="$data_catalog"/>-->
    </xsl:apply-templates>

    <!--<xsl:apply-templates mode="form.body" select="$field/*[key('foreignKey',concat(ancestor::*[@fieldId and @dataType][1]/@fieldId,'::',local-name()))]">
      <xsl:with-param name="field" select="$field"/>
      <xsl:with-param name="data_field" select="$data_row/*[@fieldId=$field/@fieldId]"/>
    </xsl:apply-templates>-->
  </xsl:template>

  <xsl:template mode="form.body" match="px:field[key('foreignKey',@fieldId) and key('foreignKey',@fieldId)//*[not(@fieldId)]]">
    <xsl:param name="data_row"/>
    <xsl:variable name="field" select="key('field',@fieldId)[1]"/>
    <!--<fieldset>
      <legend>
        <xsl:value-of select="concat($field/@headerText,':')"/>
      </legend>-->
    <xsl:apply-templates mode="form.body" select="$field/*[key('foreignKey',concat(ancestor::*[@fieldId and @dataType][1]/@fieldId,'::',local-name()))]">
      <xsl:with-param name="field" select="$field"/>
      <xsl:with-param name="data_field" select="$data_row/*[@fieldId=$field/@fieldId]"/>
    </xsl:apply-templates>
    <!--</fieldset>-->
  </xsl:template>

  <xsl:template mode="form.footer" match="*">
    <xsl:param name="data_row" select="px:dummy"/>
    <div class="row">
      <div class="col-12">
      </div>
    </div>
  </xsl:template>

  <xsl:template mode="form.body.field" match="px:dataRow/*[key('hidden',generate-id())]" priority="5">
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:layout//*[key('hidden',generate-id())]" priority="2">
  </xsl:template>

  <xsl:template mode="form.body.layout" match="px:tab[not(key('active',generate-id()))]" priority="5">
  </xsl:template>

</xsl:stylesheet>
