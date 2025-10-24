<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:debug="http://panax.io/debug"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns:x="http://panax.io/xdom"
  xmlns:initial="http://panax.io/xdom/values/initial"
  xmlns:session="http://panax.io/session"
  xmlns:filters="http://panax.io/filters"
  xmlns:custom="http://panax.io/custom"
  xmlns:datagrid="http://panax.io/widgets/datagrid"
  xmlns:px="http://panax.io"
  exclude-result-prefixes="debug msxsl x initial session filters custom datagrid px"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <xsl:import href="messages.xslt"/>
  <xsl:import href="keys.xslt"/>
  <xsl:import href="format_values.xslt"/>
  <xsl:import href="controls.xslt"/>
  <xsl:output method="xml" indent="yes" />

  <xsl:key name="supports_new" match="*[@supportsInsert='1' and not(@disableInsert='1') and not(../@dataType='junctionTable')]" use="generate-id()"/>
  <xsl:key name="groupBy" match="/*[@x:groupBy='true']" use="'enabled'"/>
  <xsl:key name="groupBy" match="/*/*/*[@datagrid:groupBy=true]" use="name()"/>

  <xsl:key name="groupCollapse" match="/" use="."/>

  <xsl:key match="/*[not(@filterByValue)][@showAll='true']/*[not(@forDeletion='true')][position()&lt;=99999]" name="visible" use="generate-id(.)"/>
  <xsl:key name="visible" match="/" use="."/>
  <xsl:key name="visible" match="/*[@showAll='true']/*/*" use="generate-id()"/>

  <xsl:key name="visible" match="/*[not(@filterByValue)]/*[not(@forDeletion='true')][position()&lt;=99999][position()&gt;=1 and position()&lt;=1000]" use="generate-id(.)"/>
  <xsl:key name="visible" match="/*/*[not(@forDeletion='true')]/*[local-name()=../../@filterBy][@x:value=../../@filterByValue]" use="generate-id(..)"/>

  <xsl:key name="model_row" match="/*/*[1]" use="generate-id()"/>
  <xsl:key name="model_row" match="/*/*/*" use="concat(generate-id(..),'::',local-name())"/>

  <xsl:key name="sortBy" match="/*" use="@sortBy"/>
  <xsl:key name="enable_selection" match="*" use="generate-id()"/>

  <xsl:key name="sortOrder" match="/*" use="concat(@sortOrder,'::',@sortBy)"/>
  <xsl:key name="controls.datagrid" match="*[@controlType='datagridView']" use="generate-id()"/>
  <xsl:key name="controls.datagrid" match="*[@controlType='default' and @dataType='foreignTable']" use="@fieldId"/>

  <xsl:key name="hidden" match="px:dataRow[@x:deleting='true']" use="generate-id()"/>
  <xsl:key name="search_field" match="px:dummy" use="generate-id()"/>

  <xsl:key name="required" match="px:fields[@isNullable=1]" use="@fieldId"/>
  <xsl:key name="empty" match="px:dataRow/*[@x:value='']" use="generate-id()"/>

  <xsl:key name="invalid" match="px:dataRow/*[@x:value=''][@fieldId=ancestor::px:data[1]/../px:fields/*[@isNullable=1]/@fieldId]" use="generate-id()"/>

  <xsl:template match="/">
    <div class="w3-responsive">
      <xsl:if test="key('modalOpen',true())">
        <xsl:attribute name="class">table form modal-open</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates select=".//x:message"/>
      <xsl:apply-templates mode="datagrid"/>
      <xsl:if test="key('modalOpen',true())">
        <div class="modal-backdrop fade show"></div>
      </xsl:if>
    </div>
  </xsl:template>

  <xsl:template mode="datagrid.styles" match="*" priority="-1">
    <xsl:param name="cell-width" select="100 div count(key('fields',generate-id())[not(key('hidden',generate-id()))])"/>
    <style>
      <![CDATA[
      .header-column {white-space: nowrap; padding-right: 3px;}
      .column {white-space: pre-line;}
      .money {color:blue;}
      .negative {color:red;}
      .w3-dropdown-content a:hover {text-decoration:none}
      
      .w3-responsive {
          overflow-x: inherit !important;
      }
 
      main {
        /*overflow-y: scroll;
        position: relative;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;*/
        width:100%;
        /*height: 100vh;*/
      }
      
      div.main-container {
        width: 100%;
          overflow-x: scroll;
          margin-left: 5em;
          overflow-y: visible;
          padding: 0;
      }
      
      .headcol {
        position: absolute;
        left: 0;
        top: auto;
        /*height: 100%;*/
        border-top-width: 1px;
        /*only relevant for first row*/
        margin-top: -1px;
        /*compensate for top border*/
      }
      
      .columnSelector {
        top: 0px; 
        right: 0px; 
        width: 2px; 
        position: absolute; 
        cursor: col-resize; 
        user-select: none; 
        height: 1000px; 
        border-right: 2px solid transparent;
      }
      
      .columnSelector.hover {
        border-right: 4px solid #0000f;
      }
      
      div.popover.exception {border-color:red;}
      div.popover.exception .popover-header {background-color:red; color:white;}
      div.popover.exception .arrow:before {border-right-color: red;}

      table {
        width: 100%; /* must have this set */
      }
      
      .rowhead input[type='checkbox'] {
        display: none;
      }
      
      .junctionTable .rowhead input[type='checkbox'] {
        display: inline !important;
      }
      
      footer.footer {
        background: unset;
      }
      
      label {
        margin-bottom: unset;
      }
        
      iframe {
        width:100%;
        height:100%;
      }
      ]]>
      <xsl:value-of select="concat('#',@x:id)"/> tbody td {
      width: <xsl:value-of select="concat($cell-width,'%')"/> !important;
      }
      <xsl:value-of select="concat('#',@x:id)"/> thead th {
      width: <xsl:value-of select="concat($cell-width,'%')"/> !important;
      }
      <xsl:value-of select="concat('#',@x:id)"/> thead th.rowhead {
      width: 50px !important;
      }
    </style>
  </xsl:template>

  <xsl:template mode="datagrid.table" match="*">
    <xsl:param name="parent_record" select="x:dummy"/>
    <xsl:param name="data_row" select="key('data_set',generate-id())"/>
    <xsl:variable name="columns" select="key('fields',generate-id())[not(key('hidden',generate-id()))]"/>
    <xsl:variable name="cell-width" select="100 div count($columns)"/>
    <xsl:variable name="data_set" select="$data_row[key('filterBy',generate-id())]"/>
    <table border="1" cellspacing="0" class="w3-table-all table table-striped table-hover table-sm datagrid" style="" id="{@x:id}">
      <thead>
        <xsl:apply-templates mode="datagrid.header" select=".">
          <xsl:with-param name="parent_record" select="$parent_record"/>
          <xsl:with-param name="columns" select="$columns"/>
        </xsl:apply-templates>
      </thead>
      <xsl:variable name="groupers" select="($data_set/*/@x:value[key('groupBy',concat(name(..),'::',.))])"/>
      <!--[count(.|key('groupBy',concat(name(..),'::',.))[1])=1]-->
      <xsl:choose>
        <xsl:when test="$groupers">
          <xsl:for-each select="$groupers">
            <xsl:sort data-type="number" select="."/>
            <xsl:sort data-type="text" select="."/>
            <xsl:variable name="field_name" select="name(..)"/>
            <xsl:variable name="value" select="."/>
            <xsl:if test="count($groupers[name()=name(current()) and .=current()][1]|.)=1">
              <!--<xsl:for-each select="key('groupBy',concat($field_name,'::',$value))">-->
              <xsl:variable name="group" select="(key('groupBy',concat(name(..),'::',.))/../..)[key('filterBy',generate-id())]"/>
              <!--<xsl:variable name="group" select="key('filterBy',concat(name(..),'::',.))/.."/>-->
              <tbody>
                <tr>
                  <th colspan="15">
                    <xsl:choose>
                      <xsl:when test="not(key('groupCollapse',concat(name(..),'::',.)))">
                        <span class="far fa-minus-square" style="margin-right: 5pt; cursor: pointer; font-size:10pt;" onclick="xdom.datagrid.columns.groupCollapse('{name(..)}','{.}')"></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="far fa-plus-square" style="margin-right: 5pt; cursor: pointer; font-size:10pt;" onclick="xdom.datagrid.columns.groupCollapse('{name(..)}','{.}')"></span>
                      </xsl:otherwise>
                    </xsl:choose>
                    <xsl:apply-templates select="."/>
                  </th>
                </tr>
                <tr>
                  <td colspan="20">
                    <xsl:value-of select="count($group)"/> Registros
                  </td>
                </tr>
                <xsl:if test="not(key('groupCollapse',concat(name(..),'::',.)))">
                  <xsl:apply-templates mode="datagrid.body" select="$group">
                    <xsl:with-param name="columns" select="$columns"/>
                  </xsl:apply-templates>
                </xsl:if>
              </tbody>
              <!--</xsl:for-each>-->

              <!--<xsl:for-each select="/*/*/*[name()=$field_name][count((key('groupBy',concat(name(),'::',@x:value))/../..)[1] | ..)=1]">
                  <xsl:sort select="@x:value" order="ascending"/>
                  <xsl:variable name="value" select="@x:value"/>
                  <xsl:variable name="data_set" select="(key('groupBy',concat($field_name,'::',$value))/../..)[key('visible',generate-id())][key('filterBy',generate-id())]"/>
                  <xsl:if test="$data_set">
                  </xsl:if>
                </xsl:for-each>-->
            </xsl:if>
          </xsl:for-each>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates mode="datagrid.body" select=".">
            <xsl:with-param name="data_set" select="$data_set"/>
            <xsl:with-param name="columns" select="$columns"/>
          </xsl:apply-templates>
        </xsl:otherwise>
      </xsl:choose>
      <tfoot>
        <xsl:apply-templates mode="datagrid.footer" select=".">
          <xsl:with-param name="columns" select="$columns"/>
        </xsl:apply-templates>
        <xsl:apply-templates select="." mode="datagrid.paging">
          <xsl:with-param name="columns" select="$columns"/>
        </xsl:apply-templates>
      </tfoot>
    </table>
  </xsl:template>

  <xsl:template mode="datagrid" match="*">
    <xsl:param name="parent_record" select="x:dummy"/>
    <xsl:param name="data_row" select="key('data_set',generate-id())"/>
    <xsl:variable name="columns" select="key('fields',generate-id())[not(key('hidden',generate-id()))]"/>
    <xsl:variable name="cell-width" select="100 div count($columns)"/>
    <div class="main-container_2">
      <xsl:apply-templates mode="datagrid.styles" select=".">
        <xsl:with-param name="cell-width" select="$cell-width"/>
      </xsl:apply-templates>
      <!--[not(key('hidden',generate-id()))]-->
      <xsl:apply-templates mode="datagrid.table" select=".">
        <xsl:with-param name="parent_record" select="$parent_record"/>
        <xsl:with-param name="data_row" select="$data_row"/>
      </xsl:apply-templates>
    </div>
  </xsl:template>

  <xsl:template match="text()"></xsl:template>
  <xsl:template match="text()" mode="datagrid.header" priority="-1"></xsl:template>
  <xsl:template match="text()" mode="datagrid.body" priority="-1"></xsl:template>
  <xsl:template match="text()" mode="datagrid.footer"></xsl:template>

  <xsl:template match="*" mode="datagrid.settings">
    <div class="dropdown" onmouseleave="xdom.data.update('{@x:id}','@datagrid:show_settings','false')">
      <div class="w3-dropdown-click" style="width: 100%;">
        <xsl:variable name="attribute_list">
          <xsl:apply-templates mode="filter.attributes" select="."/>
        </xsl:variable>
        <span class="fas fa-cog w3-button" style="cursor:pointer;">
          <xsl:attribute name="onclick">
            <xsl.if test="$attribute_list!=''">
              <xsl:text/>xdom.data.filterBy([<xsl:value-of select="substring-after($attribute_list,',')"/>]); <xsl:text/>
            </xsl.if>
            <xsl:text/>xdom.data.update('<xsl:value-of select="@x:id"/>','@datagrid:show_settings',<xsl:choose>
              <xsl:when test="string(@datagrid:show_settings)!='true'">'true'</xsl:when>
              <xsl:otherwise>'false'</xsl:otherwise>
            </xsl:choose>)<xsl:text/>
          </xsl:attribute>
        </span>
        <div>
          <xsl:attribute name="class">
            <xsl:text>non_printable w3-dropdown-content w3-bar-block w3-border </xsl:text>
            <xsl:if test="@datagrid:show_settings='true'">w3-show</xsl:if>
          </xsl:attribute>
          <div class="w3-bar-item w3-button w3-green" onclick="myAccFunc('settings_datagrid_columns')">
            Columnas <i class="fa fa-caret-down"></i>
          </div>
          <div id="settings_datagrid_columns" class="w3-hide w3-white w3-card-4 w3-show">
            <xsl:for-each select="key('data_fields',generate-id())">
              <a href="#" class="w3-bar-item w3-button" style="white-space:nowrap;">
                <span onclick="xdom.datagrid.columns.toggleVisibility('{name()}')" style="cursor:pointer;">
                  <xsl:choose>
                    <xsl:when test="key('hidden',generate-id())">
                      <span class="far fa-square w3-text-gray" style="margin-right: 5pt; font-size:10pt;"></span>
                    </xsl:when>
                    <xsl:otherwise>
                      <span class="far fa-check-square w3-text-green" style="margin-right: 5pt; font-size:10pt;"></span>
                    </xsl:otherwise>
                  </xsl:choose>
                  <xsl:apply-templates mode="datagrid.header.headertext" select="."/>
                </span>
                <xsl:if test="key('groupBy',concat(name(),'::',@x:value))">
                  <span class="fas fa-layer-group" style="margin-left: 5pt; cursor:pointer;" onclick="xdom.datagrid.columns.groupBy('{name()}')"></span>
                </xsl:if>
              </a>
            </xsl:for-each>
          </div>
          <xsl:apply-templates mode="filter.values" select=".">
            <xsl:with-param name="value_set" select="key('filterBy',concat(generate-id(),'::','self::*'))"/>
          </xsl:apply-templates>
          <!--<div class="w3-bar-item w3-button w3-green" onclick="myAccFunc('settings_datagrid_filters')">
            Filtros <i class="fa fa-caret-down"></i>
          </div>
          <div id="settings_datagrid_filters" class="w3-hide w3-white w3-card-4 w3-show">
            <a href="#" class="w3-bar-item w3-button" onclick="xdom.datagrid.columns.groupBy('{name()}')" style="white-space:nowrap; cursor:default;">
              <xsl:text>Registros seleccionados</xsl:text>
            </a>
            <a href="#" class="w3-bar-item w3-button" onclick="xdom.datagrid.columns.toggleVisibility('{name()}')" style="white-space:nowrap; cursor:default;">
                <xsl:text>Registros no seleccionados</xsl:text>
            </a>
          </div>-->
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="*[key('data_table',generate-id())]" mode="datagrid.body" priority="-1">
    <xsl:param name="data_set" select="x:dummy"/>
    <xsl:param name="columns" select="x:dummy"/>
    <tbody>
      <xsl:apply-templates mode="datagrid.body" select="$data_set">
        <xsl:with-param name="columns" select="$columns"/>
      </xsl:apply-templates>
    </tbody>
  </xsl:template>

  <xsl:template match="*[key('data_row',generate-id())]" mode="datagrid.body" priority="-1">
    <xsl:param name="columns" select="dummy"/>
    <tr onclick="" id="container_{@x:id}">
      <!--ondblclick="xdom.data.update(this.id,'@editing','true',true);"-->
      <!--<xsl:attribute name="onclick">
        <xsl:choose>
          <xsl:when test="@x:selected='true'"><![CDATA[xdom.data.unselectRecord(this.id);]]></xsl:when>
          <xsl:otherwise><![CDATA[xdom.data.selectRecord(this.id);]]></xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>-->
      <xsl:attribute name="class">
        <xsl:if test="@x:selected='true'">
          <xsl:text>selected </xsl:text>
        </xsl:if>
      </xsl:attribute>
      <xsl:if test="string(../@showRowNumber)!='false'">
        <th scope="row" class="headcol_2 rowhead" style="text-align: right; padding-right: 5px; white-space: nowrap; width:50px;" onclick="xdom.data.selectRecord('{@x:id}')">
          <xsl:if test="@x:selected='true'">
            <xsl:attribute name="style">text-align: right; padding-right: 5px; white-space: nowrap; background-color:lime;</xsl:attribute>
            <xsl:attribute name="onclick">
              <xsl:text/>xdom.data.unselectRecord('<xsl:value-of select="@x:id"/>')<xsl:text/>
            </xsl:attribute>
          </xsl:if>
          <xsl:variable name="row_number" select="count(preceding-sibling::*[not(key('hidden',generate-id()) and not(key('visible',generate-id())))]|self::*)"/>
          <xsl:choose>
            <xsl:when test="number(../../@pageIndex)=../../@pageIndex and number(../../@pageSize)=../../@pageSize">
              <xsl:value-of select="$row_number+((../../@pageIndex - 1) * ../../@pageSize)"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$row_number"/>
            </xsl:otherwise>
          </xsl:choose>
          <!--<xsl:text>:</xsl:text>
        <xsl:value-of select="position()"/>-->
        </th>
      </xsl:if>
      <th scope="row" style="white-space:nowrap; text-align:center; width:50px;" class="rowhead non_printable">
        <span style="cursor:pointer;">
          <!--onclick="xdom.app['Operaciones'].actualizarStatus('{@x:trid}');"-->
          <xsl:if test="not(@x:selected='true')">
            <xsl:apply-templates select="." mode="datagrid.data.buttons"/>
          </xsl:if>
        </span>
      </th>

      <xsl:variable name="current" select="."/>
      <!--<xsl:for-each select="key('fields',generate-id(ancestor::*[key('data_table',generate-id())][1]))">
        <td>
          <xsl:value-of select="name()"/>
        </td>
      </xsl:for-each>-->
      <xsl:apply-templates mode="datagrid.body" select="$columns">
        <xsl:with-param name="data_row" select="."/>
        <xsl:with-param name="columns" select="$columns"/>
        <xsl:with-param name="row_number" select="position()"/>
      </xsl:apply-templates>
    </tr>
  </xsl:template>

  <xsl:template match="*|text()" mode="datagrid.data.buttons" priority="-1"/>

  <xsl:template mode="datagrid.data.buttons.search" match="*">
    <xsl:variable name="table" select="ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <button class="btn btn-primary btn-circle" title="Buscar por {local-name()}">
      <xsl:attribute name="onclick">
        <xsl:text/>var busqueda = prompt('Buscar por <xsl:value-of select="@Name"/>'); if (!busqueda) return; px.request('<xsl:value-of select="$table/@Schema"/>.<xsl:value-of select="$table/@Name"/>', '<xsl:value-of select="$table/@mode"/>', '[<xsl:value-of select="@Name"/>] like \'%'+ busqueda +'%\'' )
      </xsl:attribute>
      <i class="fas fa-search"></i>
    </button>
  </xsl:template>

  <xsl:template mode="datagrid.data.buttons.search" match="px:fields/*[@dataType='foreignKey']">
    <xsl:variable name="table" select="ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <button class="btn btn-primary btn-circle">
      <xsl:attribute name="onclick">
        <xsl:text/>var busqueda = prompt('Buscar por <xsl:value-of select="@Name"/>'); if (!busqueda) return; px.request('<xsl:value-of select="$table/@Schema"/>.<xsl:value-of select="$table/@Name"/>', '<xsl:value-of select="$table/@mode"/>', `EXISTS(SELECT 1 FROM <xsl:value-of select="*/@Schema"/>.<xsl:value-of select="*/@Name"/> C WHERE <xsl:value-of select="*/@dataText"/> like '%${busqueda}%' AND C.<xsl:value-of select="*/@primaryKey"/>=[#Table].<xsl:value-of select="@Name"/> )`)
      </xsl:attribute>
      <i class="fas fa-search"></i>
    </button>
  </xsl:template>

  <xsl:template mode="datagrid.data.buttons.search" match="px:fields/*[contains(@dataType,'date')]">
    <xsl:variable name="table" select="ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <button class="btn btn-primary btn-circle">
      <xsl:attribute name="onclick">
        <xsl:text/>var busqueda = prompt('Buscar por <xsl:value-of select="@Name"/> desde'); var busqueda2 = prompt('Buscar por <xsl:value-of select="@Name"/> hasta'); if (!(busqueda &amp;&amp; busqueda2)) return; px.request('<xsl:value-of select="$table/@Schema"/>.<xsl:value-of select="$table/@Name"/>', '<xsl:value-of select="$table/@mode"/>', `<xsl:value-of select="@Name"/>&gt;='${busqueda}' AND <xsl:value-of select="@Name"/>&lt;dateadd(day,1,'${busqueda2}')`)
      </xsl:attribute>
      <i class="fas fa-search"></i>
    </button>
  </xsl:template>

  <xsl:template match="*[key('blocked',true())]" mode="datagrid.data.buttons.add" priority="10">&#160;</xsl:template>
  <xsl:template match="*[key('blocked',true())]" mode="datagrid.data.buttons.check" priority="10">&#160;</xsl:template>
  <xsl:template match="*[key('blocked',true())]" mode="datagrid.data.buttons.edit" priority="10">&#160;</xsl:template>
  <xsl:template match="*[key('blocked',true())]" mode="datagrid.data.buttons.delete" priority="10">&#160;</xsl:template>

  <!--Panax-->
  <xsl:template match="*[key('data_row',generate-id())]" mode="datagrid.data.buttons.check"/>

  <xsl:template match="*[key('junctionTable',../@fieldId) or @mode='browse']/px:data/px:dataRow" mode="datagrid.data.buttons.check" priority="1">
    <input type="checkbox" name="{../@x:id}" value="" id="{@x:id}" style="display:inline; height: 15px; width: 15px;" onclick="">
      <xsl:attribute name="onclick">
        <xsl:text/>xdom.data.update(this.id,'@x:checked',!<xsl:value-of select="boolean(translate(@x:checked,'false',''))"/>);<xsl:text/>
        <xsl:if test="../../self::*[@mode='browse']">
          proveedores.selections["<xsl:value-of select="@identity"/>"]=!<xsl:value-of select="boolean(translate(@x:checked,'false',''))"/>;
        </xsl:if>
      </xsl:attribute>
      <xsl:if test="@x:checked='true'">
        <xsl:attribute name="checked">checked</xsl:attribute>
      </xsl:if>
    </input>
  </xsl:template>

  <!--Panax-->
  <xsl:template match="*[key('junctionTable',../@fieldId) and (key('field',../@fieldId)/@maxSelections=1 or key('field',../@fieldId)/@relationshipType='hasOne')]/px:data/px:dataRow" mode="datagrid.data.buttons.check" priority="1">
    <input type="radio" name="{../@x:id}" value="" id="{@x:id}" style="height: 15px; width: 15px;" onclick="xdom.data.clearChecked('{../@x:id}'); xdom.data.update(this.id,'@x:checked',!{boolean(translate(@x:checked,'false',''))})">
      <xsl:if test="@x:checked='true'">
        <xsl:attribute name="checked">checked</xsl:attribute>
      </xsl:if>
    </input>
  </xsl:template>

  <xsl:template match="*[not(key('junctionTable',../@fieldId))]/px:fields" mode="datagrid.data.buttons.add" priority="-1">
    <xsl:param name="parent_record" select="../.."/>
    <span>
      <xsl:attribute name="class">
        <xsl:text/>xdom-action-button <xsl:text/>
        <xsl:apply-templates mode="datagrid.data.buttons.add.class" select="."/>
      </xsl:attribute>
      <xsl:attribute name="style">
        <xsl:text/>cursor:pointer; <xsl:apply-templates mode="datagrid.data.buttons.add.style" select="."/>
      </xsl:attribute>
      <xsl:attribute name="onclick">
        <xsl:apply-templates mode="datagrid.data.buttons.add.onclick" select=".">
          <xsl:with-param name="parent_record" select="$parent_record"/>
        </xsl:apply-templates>
      </xsl:attribute>
      <i>
        <xsl:attribute name="class">
          <xsl:apply-templates mode="datagrid.data.buttons.add.icon.class" select="."/>
          <xsl:apply-templates mode="datagrid.data.buttons.add.icon" select="."/>
        </xsl:attribute>
      </i>
    </span>
  </xsl:template>

  <xsl:template match="*[not(key('junctionTable',../@fieldId))]/px:data/px:dataRow" mode="datagrid.data.buttons.edit" priority="-1">
    <span>
      <xsl:attribute name="class">
        <xsl:text/>xdom-action-button <xsl:text/>
        <xsl:apply-templates mode="datagrid.data.buttons.edit.class" select="."/>
      </xsl:attribute>
      <xsl:attribute name="style">
        <xsl:text/>cursor:pointer; <xsl:apply-templates mode="datagrid.data.buttons.edit.style" select="."/>
      </xsl:attribute>
      <xsl:attribute name="onclick">
        <xsl:apply-templates mode="datagrid.data.buttons.edit.onclick" select="."/>
      </xsl:attribute>
      <i>
        <xsl:attribute name="class">
          <xsl:apply-templates mode="datagrid.data.buttons.edit.icon.class" select="."/>
          <xsl:apply-templates mode="datagrid.data.buttons.edit.icon" select="."/>
        </xsl:attribute>
      </i>
    </span>
  </xsl:template>

  <xsl:template match="*[not(key('junctionTable',../@fieldId))]/px:data/px:dataRow" mode="datagrid.data.buttons.delete" priority="-1">
    <span>
      <xsl:attribute name="class">
        <xsl:text/>xdom-action-button <xsl:text/>
        <xsl:apply-templates mode="datagrid.data.buttons.delete.class" select="."/>
      </xsl:attribute>
      <xsl:attribute name="style">
        <xsl:text/>cursor:pointer; <xsl:apply-templates mode="datagrid.data.buttons.delete.style" select="."/>
      </xsl:attribute>
      <xsl:attribute name="onclick">
        <xsl:apply-templates mode="datagrid.data.buttons.delete.onclick" select="."/>
      </xsl:attribute>
      <i>
        <xsl:attribute name="class">
          <xsl:apply-templates mode="datagrid.data.buttons.delete.icon.class" select="."/>
          <xsl:apply-templates mode="datagrid.data.buttons.delete.icon" select="."/>
        </xsl:attribute>
      </i>
    </span>
  </xsl:template>

  <xsl:template match="*[key('data_row',generate-id()) and key('blocked',true())]" mode="datagrid.data.buttons.check" priority="10">
    &#160;
  </xsl:template>

  <xsl:template match="*[key('data_row',generate-id()) and key('blocked',true()) and @x:checked='true']" mode="datagrid.data.buttons.check" priority="10">
    <i class="fas fa-check"></i>
  </xsl:template>

  <xsl:template match="*[key('disable_delete',@fieldId) or key('disable_delete',generate-id())]/px:data/px:dataRow" mode="datagrid.data.buttons.delete" priority="5">
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.add.style" priority="-1">
    <xsl:text>display:none;</xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.edit.style" priority="-1">
    <xsl:text>display:none;</xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.delete.style" priority="-1">
    <xsl:text>display:none;</xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.add.class" priority="-1">
    <xsl:text>btn btn-primary btn-circle</xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.edit.class" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.delete.class" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.add.onclick" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.edit.onclick" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.delete.onclick" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.add.icon.class" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.edit.icon.class" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.delete.icon.class" priority="-1">
    <xsl:text></xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.add.icon" priority="-1">
    <xsl:text>fa fa-plus</xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.delete.icon" priority="-1">
    <xsl:text>far fa-trash-alt</xsl:text>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.edit.icon" priority="-1">
    <xsl:text>far fa-edit</xsl:text>
  </xsl:template>

  <xsl:template match="*[key('visible',generate-id())][@editing='true']" mode="datagrid.body" priority="-1">
    <tr id="container_{@x:id}">
      <xsl:attribute name="class">
        <xsl:if test="@x:selected='true'">
          <xsl:text>selected </xsl:text>
        </xsl:if>
      </xsl:attribute>
      <th>
        <xsl:value-of select="count(preceding-sibling::*[key('visible',generate-id())][not(key('hidden',generate-id()))]|self::*)"/>
      </th>
      <th>
        <button type="button" onclick="xdom.data.update('{@x:id}','@editing','false',true);">Done</button>
      </th>
      <xsl:apply-templates mode="datagrid.body">
        <xsl:with-param name="row_number" select="position()"/>
      </xsl:apply-templates>
    </tr>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.header.headertext">
    <xsl:apply-templates mode="headerText" select="."/>
  </xsl:template>

  <xsl:template match="*" mode="headerText" priority="-1">
    <xsl:value-of select="translate(local-name(),'-_','  ')"/>
  </xsl:template>

  <xsl:template match="*" mode="group.values">
    <div class="w3-bar-item w3-button w3-green" onclick="myAccFunc('settings_{name()}_more')">
      More <i class="fa fa-caret-down"></i>
    </div>
    <div id="settings_{name()}_more" class="w3-hide w3-white w3-card-4 w3-show">
      <a href="#" class="w3-bar-item w3-button" onclick="xdom.datagrid.columns.groupBy('{name()}')" style="white-space:nowrap; cursor:default;">
        <xsl:choose>
          <xsl:when test="key('groupBy',concat(name(),'::',@x:value))">Desagrupar columna</xsl:when>
          <xsl:otherwise>Agrupar por esta columna</xsl:otherwise>
        </xsl:choose>
      </a>
      <a href="#" class="w3-bar-item w3-button" onclick="xdom.datagrid.columns.toggleVisibility('{name()}')" style="white-space:nowrap; cursor:default;">
        <xsl:if test="not(key('hidden',generate-id()))">
          <xsl:text>Ocultar columna</xsl:text>
        </xsl:if>
      </a>
    </div>
  </xsl:template>

  <xsl:template match="*" mode="filter.values" priority="2">
    <xsl:param name="value_set" select="key('filterBy',concat(generate-id(ancestor::*[key('data_table',generate-id())][1]),'::',name()))"/>
    <xsl:choose>
      <xsl:when test="count($value_set)=0">
        <xsl:variable name="default-set" select="key('default_filter',concat(generate-id(ancestor-or-self::*[key('data_table',generate-id())][1]),'::',name()))"/>
        <xsl:apply-templates mode="filter.values.container" select="$default-set">
          <xsl:with-param name="field_ref" select="."/>
          <xsl:with-param name="value_set" select="$default-set"/>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates mode="filter.values.container" select="$value_set">
          <xsl:with-param name="field_ref" select="."/>
          <xsl:with-param name="value_set" select="$value_set"/>
        </xsl:apply-templates>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*[key('data_table',generate-id())]" mode="filter.values" priority="2">
    <xsl:param name="value_set" select="key('filterBy',concat(generate-id(ancestor::*[key('data_table',generate-id())][1]),'::',name()))"/>
    <xsl:apply-templates mode="filter.values.container" select="$value_set">
      <xsl:with-param name="field_name">*</xsl:with-param>
      <xsl:with-param name="value_set" select="$value_set"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="@*" mode="filter.values.container.label">
    <xsl:text/> por <xsl:value-of select="local-name()"/><xsl:text/>
  </xsl:template>

  <xsl:template match="@x:value" mode="filter.values.container.label"></xsl:template>
  <xsl:template match="@x:selected" mode="filter.values.container.label"> por selección</xsl:template>

  <xsl:template match="@*" mode="filter.values.container">
    <xsl:param name="value_set" select="."/>
    <xsl:param name="field_ref" select="ancestor-or-self::*[key('data_field',generate-id())][1]"/>
    <xsl:variable name="target" select="$field_ref/ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <xsl:variable name="attribute_name" select="name()"/>
    <xsl:variable name="key_name">
      <xsl:call-template name="format_key_name">
        <xsl:with-param name="table" select="$target"/>
        <xsl:with-param name="field" select="$field_ref"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="field_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:text/>
      <xsl:value-of select="concat(&quot;*[@x:id='&quot;,$target/@x:id,&quot;']/&quot;)"/>
      <xsl:text/>
      <xsl:call-template name="absolute-path">
        <xsl:with-param name="source" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
        <xsl:with-param name="target" select="$target"/>
        <xsl:with-param name="inclusive" select="false()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="attribute_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:call-template name="absolute-path">
        <xsl:with-param name="source" select="."/>
        <xsl:with-param name="target" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
        <xsl:with-param name="inclusive" select="false()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="relative_attribute_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:call-template name="absolute-path">
        <xsl:with-param name="source" select="."/>
        <xsl:with-param name="target" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
        <xsl:with-param name="inclusive" select="false()"/>
        <xsl:with-param name="relative" select="true()"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:if test="count($value_set[name()=$attribute_name][1] | .)=1">
      <div class="w3-bar-item w3-button w3-green">
        <span onclick="myAccFunc('settings_{name(..)}_filters_{translate(name(.),':','_')}')">
          Filtros <xsl:apply-templates mode="filter.values.container.label" select="."/>&#160;<i class="fa fa-caret-down"></i>
        </span>
        <!--<br/>
        <xsl:value-of select="$field_path"/>
        <br/>
        <xsl:value-of select="$attribute_path"/>
        <br/>
        <xsl:value-of select="$key_name"/>
        <br/>
        <xsl:value-of select="count(key('filterBy',$key_name))"/>-->

        <xsl:for-each select="key('filterBy',$key_name)[name()=$attribute_name][key('filterBy',concat('@',name(),'::',generate-id(ancestor-or-self::*[@fieldId=$field_ref/@fieldId])))][1]">
          <xsl:if test="key('filterBy',$key_name)[name()!=$attribute_name]">
            <span class="fas fa-filter" style="margin-left: 25pt; cursor: pointer;">
              <xsl:attribute name="onclick">
                <xsl:text/>xdom.data.clearFilterOption({match:`<xsl:value-of select="$field_path"/>`, attribute:`<xsl:value-of select="$attribute_path"/>`})<xsl:text/>
              </xsl:attribute>
            </span>
          </xsl:if>
        </xsl:for-each>
      </div>
      <div id="settings_{name(..)}_filters_{translate(name(.),':','_')}" class="w3-hide w3-white w3-card-4 w3-responsive w3-show" style="height:500px;">
        <xsl:apply-templates mode="filter.values.list" select="$value_set[name()=name(current())]">
          <xsl:sort select="." data-type="number" order="ascending"/>
          <xsl:with-param name="field_ref" select="$field_ref"/>
          <xsl:with-param name="value_set" select="$value_set[name()=name(current())]"/>
        </xsl:apply-templates>
      </div>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="filter.attributes" priority="2">
    <xsl:param name="value_set" select="key('filterBy',concat(generate-id(ancestor-or-self::*[key('data_table',generate-id())][1]),'::',name()))"/>
    <xsl:choose>
      <xsl:when test="count($value_set)=0">
        <xsl:variable name="default-set" select="key('default_filter',concat(generate-id(ancestor-or-self::*[key('data_table',generate-id())][1]),'::',name()))"/>
        <xsl:apply-templates mode="filter.attributes" select="$default-set">
          <xsl:with-param name="value_set" select="$default-set"/>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates mode="filter.attributes" select="$value_set">
          <xsl:with-param name="value_set" select="$value_set"/>
        </xsl:apply-templates>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="*[key('data_table',generate-id())]" mode="filter.attributes" priority="2">
    <xsl:param name="value_set" select="key('filterBy',concat(generate-id(ancestor-or-self::*[key('data_table',generate-id())][1]),'::self::*'))"/>
    <xsl:choose>
      <xsl:when test="count($value_set)=0"></xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates mode="filter.attributes" select="$value_set">
          <xsl:with-param name="value_set" select="$value_set"/>
        </xsl:apply-templates>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@*" mode="filter.attributes">
    <xsl:param name="field_ref" select=".."/>
    <xsl:param name="value_set" select="."/>
    <xsl:param name="target" select="$field_ref/ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <xsl:param name="use">
      <xsl:text/>'<xsl:value-of select="concat($target/@x:id,'::',name(..))"/>'<xsl:text/>
    </xsl:param>
    <xsl:param name="value">undefined</xsl:param>
    <xsl:variable name="attribute_name" select="name()"/>
    <xsl:if test="count($value_set[name()=$attribute_name][1] | .)=1">
      <xsl:variable name="field_path">
        <xsl:if test="count($target|..)=1">self::*</xsl:if>
        <xsl:text/>
        <xsl:value-of select="concat(&quot;*[@x:id='&quot;,$target/@x:id,&quot;']/&quot;)"/>
        <xsl:text/>
        <xsl:call-template name="absolute-path">
          <xsl:with-param name="source" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
          <xsl:with-param name="target" select="$target"/>
          <xsl:with-param name="inclusive" select="false()"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:variable name="attribute_path">
        <xsl:if test="count($target|..)=1">self::*</xsl:if>
        <xsl:call-template name="absolute-path">
          <xsl:with-param name="source" select="."/>
          <xsl:with-param name="target" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
          <xsl:with-param name="inclusive" select="false()"/>
        </xsl:call-template>
      </xsl:variable>
      <xsl:value-of select="concat(',','{match:`',$field_path,&quot;`, use:`&quot;,$use,&quot;`, attribute:`&quot;,$attribute_path,'`, value:',$value,'}')"/>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="filter.values.list">
    ,<xsl:value-of select="name()"/>
  </xsl:template>

  <!--<xsl:template name="absolute-path">
    <xsl:param name="source" select="."/>
    <xsl:param name="target" select="."/>
    <xsl:param name="path"></xsl:param>
    <xsl:choose>
      <xsl:when test="$current/parent::* and count($current|$target)!=1">
        <xsl:call-template name="absolute-path">
          <xsl:with-param name="source" select="$current/parent::*"/>
          <xsl:with-param name="target" select="$target"/>
          <xsl:with-param name="path" select="concat('/',name($current),$path)"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="concat(name($current),$path)"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>-->

  <xsl:template name="absolute-path">
    <xsl:param name="source" select="."/>
    <xsl:param name="target" select="."/>
    <xsl:param name="inclusive" select="true()"/>
    <xsl:param name="path"></xsl:param>
    <xsl:variable name="current">
      <xsl:choose>
        <xsl:when test="not($source/self::*)">
          <xsl:value-of select="concat('/@',name($source))"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="concat('/',name($source))"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="$inclusive=true() and count($source|$target)=1">
        <xsl:value-of select="substring-after(concat($current,$path),'/')"/>
      </xsl:when>
      <xsl:when test="count($source|$target)=1">
        <xsl:value-of select="substring-after($path,'/')"/>
      </xsl:when>
      <xsl:when test="$source/parent::* and count($source|$target)!=1">
        <xsl:call-template name="absolute-path">
          <xsl:with-param name="source" select="$source/parent::*"/>
          <xsl:with-param name="target" select="$target"/>
          <xsl:with-param name="inclusive" select="$inclusive"/>
          <xsl:with-param name="path" select="concat($current,$path)"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$path"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="relative-path">
    <xsl:param name="source" select="."/>
    <xsl:param name="target" select="."/>
    <xsl:param name="inclusive" select="true()"/>
    <xsl:param name="path"></xsl:param>
    <xsl:choose>
      <xsl:when test="count($source|$target)=1">
        <xsl:value-of select="substring-after($path,'/')"/>
      </xsl:when>
      <xsl:when test="$source/parent::* and count($source|$target)!=1">
        <xsl:call-template name="relative-path">
          <xsl:with-param name="source" select="$source/parent::*"/>
          <xsl:with-param name="target" select="$target"/>
          <xsl:with-param name="inclusive" select="$inclusive"/>
          <xsl:with-param name="path" select="concat('/parent::*',$path)"/>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$path"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="@*" mode="filter.values.list">
    <xsl:param name="value_set" select="."/>
    <xsl:param name="field_ref" select="ancestor-or-self::*[key('data_field',generate-id())][1]"/>
    <xsl:param name="field_name" select="name($field_ref)"/>
    <xsl:variable name="target" select="$field_ref/ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <xsl:variable name="attribute_name" select="name()"/>
    <xsl:variable name="current_value" select="."/>
    <xsl:variable name="datafield_ref" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
    <xsl:variable name="field_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:text/>
      <xsl:value-of select="concat(&quot;*[@x:id='&quot;,$target/@x:id,&quot;']/&quot;)"/>
      <xsl:text/>
      <xsl:call-template name="absolute-path">
        <xsl:with-param name="source" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
        <xsl:with-param name="target" select="$target"/>
        <xsl:with-param name="inclusive" select="false()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="attribute_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:call-template name="absolute-path">
        <xsl:with-param name="source" select="."/>
        <xsl:with-param name="target" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
        <xsl:with-param name="inclusive" select="false()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="relative_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:call-template name="relative-path">
        <xsl:with-param name="source" select="."/>
        <xsl:with-param name="target" select="ancestor::*[@fieldId=$field_ref/@fieldId][1]"/>
        <xsl:with-param name="inclusive" select="false()"/>
        <xsl:with-param name="relative" select="true()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="field_attributes">
      <xsl:choose>
        <xsl:when test="key('data_row',generate-id(..))">
          <xsl:text>self::*</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates mode="filter.attributes" select=".">
            <xsl:with-param name="field_ref" select="$field_ref"/>
            <xsl:with-param name="value">
              <xsl:text/>'<xsl:value-of select="."/>'<xsl:text/>
            </xsl:with-param>
            <xsl:with-param name="use">
              <xsl:text/>concat('@<xsl:value-of select="name()"/>::',generate-id(<xsl:value-of select="$relative_path"/>)<xsl:text/>)<xsl:text/>
            </xsl:with-param>
          </xsl:apply-templates>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:if test="count($value_set[name()=name(current()) and .=current()][1]|.)=1">
      <a href="#" class="w3-bar-item w3-button" style="white-space:nowrap; cursor:default;">
        <xsl:variable name="total_records" select="($value_set[name()=name(current()) and .=current()]/ancestor-or-self::*[key('data_row',generate-id())][1])[key(concat('other_filters_',translate(concat($field_path,'/',$attribute_path),&quot;/-:*[]@='&quot;,'_________')),generate-id())]"/>
        <xsl:if test="not($total_records)">
          <xsl:attribute name="class">w3-bar-item w3-button w3-disabled</xsl:attribute>
        </xsl:if>
        <xsl:variable name="value">
          <xsl:apply-templates select="."/>
        </xsl:variable>
        <xsl:variable name="key_name">
          <xsl:text/>@<xsl:value-of select="name()"/>::<xsl:value-of select="generate-id($datafield_ref)"/>
        </xsl:variable>
        <xsl:choose>
          <xsl:when test="not(key('filterBy', generate-id(/*))) and key('filterBy', $key_name)">
            <!--generate-id(ancestor::*[key('data_field',generate-id()) or key('data_row',generate-id())][1])-->
            <span class="fas fa-filter" style="padding-right: 5pt;">
              <xsl:attribute name="onclick">
                <xsl:text/>xdom.data.clearFilterOption({match:`<xsl:value-of select="$field_path"/>`, attribute:`@<xsl:value-of select="name()"/>`, value:'<xsl:value-of select="."/>'})<xsl:text/>
              </xsl:attribute>
            </span>
          </xsl:when>
          <xsl:otherwise>
            <span class="far fa-square w3-text-gray" style="margin-right: 5pt; font-size:10pt;">
              <xsl:attribute name="onclick">
                <xsl:text/>xdom.data.filterBy([<xsl:value-of select="substring-after($field_attributes,',')"/>]);<xsl:text/>
              </xsl:attribute>
            </span>
          </xsl:otherwise>
        </xsl:choose>
        <label style="cursor:pointer;">
          <xsl:attribute name="onclick">
            <xsl:text/>xdom.data.filterBy([<xsl:value-of select="substring-after($field_attributes,',')"/>],{exclusive:!xdom.listeners.keys.ctrlKey}); /*<xsl:value-of select="name()"/><xsl:value-of select="count(key('filterBy',concat(generate-id(../..),'::',name())))"/>*/<!--<xsl:value-of select="$field_path"/>-->
          </xsl:attribute>
          <xsl:choose>
            <xsl:when test="$value=''">
              <xsl:text>-Vacío-</xsl:text>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="$value" />
            </xsl:otherwise>
          </xsl:choose>
        </label>
        <span class="w3-badge w3-margin-left">
          <xsl:value-of select="count($total_records)"/>
        </span>
      </a>
    </xsl:if>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.body.cell.style">
    <xsl:text>position:relative;</xsl:text>
  </xsl:template>

  <xsl:template match="*[key('data_row',generate-id())]/*" mode="datagrid.body" priority="-1">
    <xsl:param name="data_row" select=".."/>
    <xsl:param name="field" select="."/>
    <td id="container_{@x:id}">
      <xsl:for-each select="$data_row/*[@x:fieldId=$field/@x:fieldId]">
        <xsl:attribute name="style">
          <xsl:apply-templates mode="datagrid.body.cell.style" select="."/>
        </xsl:attribute>
        <xsl:attribute name="class">
          <xsl:text>column </xsl:text>
          <!--<xsl:if test="@x:value!=@x:original_value">
            <xsl:text>changed </xsl:text>
          </xsl:if>
          <xsl:if test="normalize-space(@x:value)=''">
            <xsl:text>required </xsl:text>
          </xsl:if>-->
        </xsl:attribute>
        <xsl:choose>
          <!--<xsl:when test="*">
            <xsl:apply-templates select="."/>
          </xsl:when>-->
          <xsl:when test="$field/@isPrimaryKey=0 and boolean(translate(@x:checked,'false',''))!=true() and $field/../../../@dataType='junctionTable'">
          </xsl:when>
          <!--Panax-->
          <xsl:when test="$field/@dataType='foreignTable' or $field/@dataType='junctionTable'">
            <xsl:apply-templates select="$field" mode="control">
              <xsl:with-param name="data_field" select="."/>
            </xsl:apply-templates>
          </xsl:when>
          <!--Panax-->
          <xsl:when test="key('controls.picture',@fieldId) or key('controls.file',@fieldId)">
            <xsl:apply-templates mode="control" select="current()"/>
          </xsl:when>
          <xsl:when test="key('money',generate-id())">
            <xsl:attribute name="style">
              <xsl:text/>text-align:right;<xsl:text/>
              <xsl:choose>
                <xsl:when test="@x:value&lt;0">color:red;</xsl:when>
                <xsl:otherwise>color:blue;</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            <xsl:apply-templates select="@x:value"/>
            <!--<xsl:value-of select="format-number(@x:value, '$###,##0.00', 'money')"/>-->
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates select="@x:value"/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:for-each>
    </td>
  </xsl:template>

  <xsl:template match="*[key('data_row',generate-id()) and not(ancestor::*[@mode='browse'])][@x:checked='true']/*" mode="datagrid.body" priority="-1">
    <xsl:param name="columns" select="dummy"/>
    <xsl:param name="field" select="."/>
    <td>
      <xsl:apply-templates select="$field" mode="control">
        <xsl:with-param name="data_field" select="."/>
      </xsl:apply-templates>
    </td>
  </xsl:template>

  <!--Panax-->
  <xsl:template mode="datagrid.body" match="*[key('controls.datagrid', @fieldId)]//*[key('controls.datagrid',@fieldId)]" priority="-1">
    <style>
      ul.checklist {
      list-style: none;
      }
    </style>
    <xsl:value-of select="@x:id"/>
    <ul class="checklist">
      <xsl:for-each select="*[@x:value!='']">
        <li>
          <xsl:apply-templates select="@x:value"/>
        </li>
      </xsl:for-each>
    </ul>
  </xsl:template>

  <xsl:template match="*[key('data_table',generate-id())]" mode="datagrid.header" priority="-1">
    <xsl:param name="parent_record" select="x:dummy"/>
    <xsl:param name="columns" select="key('fields',generate-id())"/>
    <xsl:variable name="table" select="ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <xsl:if test="not($parent_record)">
      <tr class="non_printable">
        <td colspan="{count($columns)+2}" style="position: sticky; top: -5px; width: 100%; z-index: 99;height: 65px;
    padding-left: 0px;">
          <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <xsl:choose>
              <xsl:when test="not(ancestor::*[key('data_table',generate-id())][1])">
                <a class="navbar-brand" href="#">
                  <xsl:value-of select="@headerText"/>
                </a>
              </xsl:when>
              <xsl:otherwise>
                <xsl:attribute name="style">padding:unset;</xsl:attribute>
              </xsl:otherwise>
            </xsl:choose>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto">
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Acciones
                  </a>
                  <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                    <xsl:if test="key('supports_new',generate-id($table))">
                      <a class="dropdown-item" href="#">
                        <xsl:attribute name="onclick">
                          <xsl:text/>px.request('<xsl:value-of select="$table/@Schema"/>.<xsl:value-of select="$table/@Name"/>', 'add', undefined, '<xsl:value-of select="$parent_record/@x:id"/>')
                        </xsl:attribute>
                        <xsl:text/>Nuevo<xsl:text/>
                      </a>
                    </xsl:if>
                    <a class="dropdown-item" href="#">
                      <xsl:attribute name="onclick">
                        <xsl:text/>px.request(px.getEntityInfo());<xsl:text/>
                      </xsl:attribute>
                      <xsl:text/>Actualizar<xsl:text/>
                    </a>
                    <xsl:if test="key('supports_new',generate-id($table))">
                    </xsl:if>
                  </div>
                </li>
              </ul>
              <xsl:if test="not(ancestor::*[key('data_table',generate-id())][1])">
                <!--<button class="btn btn-default btn-circle">
                <i class="fa fa-download"></i>
              </button>-->
                <button class="btn btn-success btn-circle" title="Guardar como excel">
                  <xsl:attribute name="onclick">
                    <xsl:text/>xdom.dom.toExcel(document.querySelector('table'),'Reporte')<xsl:text/>
                  </xsl:attribute>
                  <i class="far fa-file-excel"></i>
                </button>
                <xsl:apply-templates select="key('search_field',generate-id())" mode="datagrid.data.buttons.search"/>
                <xsl:if test="key('supports_new',generate-id($table)) and not(key('blocked',true()))">
                  <button class="btn btn-primary btn-circle" title="Nuevo registro">
                    <xsl:attribute name="onclick">
                      <xsl:text/>px.request('<xsl:value-of select="$table/@Schema"/>.<xsl:value-of select="$table/@Name"/>', 'add', undefined, '<xsl:value-of select="$parent_record/@x:id"/>')
                    </xsl:attribute>
                    <i class="fa fa-plus"></i>
                  </button>
                </xsl:if>
                <button class="btn btn-warning btn-circle" title="Volver a cargar datos">
                  <xsl:attribute name="onclick">
                    <xsl:text/>px.request(px.getEntityInfo());<xsl:text/>
                  </xsl:attribute>
                  <i class="fa fa-sync-alt"></i>
                </button>
                <xsl:if test="//px:dataRow[key('changed',generate-id())]">
                  <button class="btn btn-success btn-circle" title="Guardar cambios">
                    <xsl:attribute name="onclick">
                      <xsl:text/>xdom.data.submit()<xsl:text/>
                    </xsl:attribute>
                    <i class="fas fa-save"></i>
                  </button>
                </xsl:if>
              </xsl:if>
            </div>
          </nav>
        </td>
      </tr>
    </xsl:if>
    <xsl:apply-templates select="." mode="datagrid.paging">
      <xsl:with-param name="columns" select="$columns"/>
    </xsl:apply-templates>
    <xsl:apply-templates select="." mode="datagrid.header.columns">
      <xsl:with-param name="parent_record" select="$parent_record"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="*[key('enable_paging',true())][not(ancestor::*[key('data_table',generate-id())][1])]" mode="datagrid.paging">
    <xsl:param name="columns" select="key('fields',generate-id())"/>
    <xsl:variable name="pageIndex" select="@pageIndex"/>
    <xsl:variable name="totalRecords" select="@totalRecords"/>
    <xsl:variable name="pageSize" select="@pageSize"/>
    <xsl:variable name="maxIndex" select="ceiling($totalRecords div $pageSize)"/>
    <xsl:if test="string(number($maxIndex))!='NaN' and string(number($maxIndex))!='Infinity'">
      <tr class="non_printable">
        <td colspan="{count($columns)+2}">
          <nav aria-label="..." class="navbar">
            <ul class="pagination">
              <li class="page-item">
                <xsl:if test="$pageIndex=1">
                  <xsl:attribute name="class">page-item disabled</xsl:attribute>
                </xsl:if>
                <a class="page-link" href="#1" tabindex="-1" aria-disabled="true">Primera</a>
              </li>
              <li class="page-item">
                <xsl:if test="$pageIndex=1">
                  <xsl:attribute name="class">page-item disabled</xsl:attribute>
                </xsl:if>
                <a class="page-link" href="#{number($pageIndex)-1}" tabindex="-1" aria-disabled="true">Anterior</a>
              </li>
              <xsl:variable name="max_elements">25</xsl:variable>
              <xsl:apply-templates mode="datagrid.paging" select="(//@*)[position()&lt;=$max_elements]">
                <xsl:with-param name="pageIndex" select="$pageIndex"/>
                <xsl:with-param name="maxIndex" select="$maxIndex"/>
                <xsl:with-param name="elements" select="$max_elements"/>
              </xsl:apply-templates>
              <li class="page-item">
                <xsl:if test="$pageIndex=$maxIndex">
                  <xsl:attribute name="class">page-item disabled</xsl:attribute>
                </xsl:if>
                <a class="page-link" href="#{number($pageIndex)+1}">Siguiente</a>
              </li>
              <li class="page-item">
                <xsl:if test="$pageIndex=$maxIndex">
                  <xsl:attribute name="class">page-item disabled</xsl:attribute>
                </xsl:if>
                <a class="page-link" href="#{$maxIndex}">
                  Última
                </a>
              </li>
            </ul>
            <form class="form-inline">
              <span class="navbar-text">
                Registros por página:
                <input type="text" size="5" value="{$pageSize}" onchange="xdom.manifest.setConfig({{'pageSize':this.value}}); px.request(px.getEntityInfo());"/>
              </span>
              <!--<input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"/>
              <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>-->
            </form>
          </nav>
        </td>
      </tr>
    </xsl:if>
  </xsl:template>

  <xsl:template match="@*" mode="datagrid.paging">
    <xsl:param name="pageIndex" select="1"/>
    <xsl:param name="elements" select="5"/>
    <xsl:param name="maxIndex" select="99"/>
    <xsl:variable name="current_page" select="format-number($pageIndex+position()-1-($elements div 2), '0')"/>
    <xsl:if test="$current_page&gt;0 and $current_page&lt;=$maxIndex">
      <li class="page-item">
        <xsl:if test="number($pageIndex)=$current_page">
          <xsl:attribute name="class">page-item active</xsl:attribute>
        </xsl:if>
        <a class="page-link" href="#{$current_page}">
          <xsl:value-of select="$current_page"/>
        </a>
      </li>
    </xsl:if>
  </xsl:template>

  <xsl:template match="x:*" mode="datagrid.paging">
  </xsl:template>

  <xsl:template name="format_key_name">
    <xsl:param name="table" select="dummy"/>
    <xsl:param name="field" select="dummy"/>
    <xsl:value-of select="concat($table/@x:id,'::',name($field))"/>
  </xsl:template>

  <xsl:template match="*[key('field',generate-id())]" mode="datagrid.header" priority="-1">
    <xsl:param name="parent_record" select="x:dummy"/>
    <xsl:param name="field_ref" select="."/>
    <xsl:variable name="target" select="$field_ref/ancestor-or-self::*[key('data_table',generate-id())][1]"/>
    <xsl:variable name="datafield_ref" select="key('data_fields',generate-id($target))[@fieldId=$field_ref/@fieldId]"/>
    <xsl:variable name="key_name">
      <xsl:call-template name="format_key_name">
        <xsl:with-param name="table" select="ancestor::*[key('data_table',generate-id())][1]"/>
        <xsl:with-param name="field" select="."/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="field_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:text/>
      <xsl:value-of select="concat(&quot;*[@x:id='&quot;,$target/@x:id,&quot;']/&quot;)"/>
      <xsl:text/>
      <xsl:call-template name="absolute-path">
        <xsl:with-param name="source" select="$datafield_ref"/>
        <xsl:with-param name="target" select="$target"/>
        <xsl:with-param name="inclusive" select="false()"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="attribute_path">
      <xsl:if test="count($target|..)=1">self::*</xsl:if>
      <xsl:text/>
      <xsl:value-of select="concat(&quot;*[@x:id='&quot;,$target/@x:id,&quot;']/&quot;)"/>
      <xsl:text/>
      <xsl:call-template name="absolute-path">
        <xsl:with-param name="source" select="."/>
        <xsl:with-param name="target" select="$target"/>
        <xsl:with-param name="inclusive" select="false()"/>
      </xsl:call-template>
    </xsl:variable>
    <th class="header-column w3-padding-small w3-display-container" style="vertical-align: middle;" id="container_{@x:id}">
      <!--<xsl:variable name="current" select="."/>
      selections:<xsl:for-each select="key('filterBy',$key_name)[key('filterBy',concat('@',name(),'::',generate-id(ancestor-or-self::*[@fieldId=$field_ref/@fieldId])))]">
        <xsl:value-of select="name()"/>
        <xsl:text/> - <xsl:text/>
        <xsl:value-of select="position()"/>
        <xsl:text/>) <xsl:text/>
        <xsl:value-of select="."/>
        <br/>
      </xsl:for-each>-->
      <xsl:choose>
        <xsl:when test="key('blocked',true())">
          <label>
            <xsl:apply-templates select="$field_ref" mode="datagrid.header.headertext"/>
          </label>
        </xsl:when>
        <xsl:when test="key('filterBy',concat(ancestor::*[key('data_table',generate-id())][1]/@x:id,'::',name()))">
          <div class="dropdown">
            <div class="w3-dropdown-hover" style="width: 100%;">
              <div class="w3-button w3-block w3-left-align">
                <span class="far fa-caret-square-down" style="cursor:pointer; margin-right: 5pt; font-size:10pt;">
                  <xsl:attribute name="onclick">
                    <xsl:text/>xdom.data.clearFilter(`<xsl:value-of select="$key_name"/>`)
                  </xsl:attribute>
                </span>
                <span style="cursor: pointer;">
                  <xsl:attribute name="onclick">
                    xdom.data.sortBy('<xsl:value-of select="name()"/>',<xsl:value-of select="number(@x:value) = @x:value"/><xsl:if test="key('sortOrder',concat('ascending::',name()))">,'descending'</xsl:if>);
                  </xsl:attribute>
                  <label>
                    <xsl:apply-templates select="$field_ref" mode="datagrid.header.headertext"/>
                  </label>
                  <xsl:choose>
                    <xsl:when test="key('sortOrder',concat('ascending::',name()))">&#160;&#8595;&#160;</xsl:when>
                    <xsl:when test="key('sortOrder',concat('descending::',name()))">&#160;&#8593;&#160;</xsl:when>
                  </xsl:choose>
                </span>
                <xsl:if test="key('groupBy',concat(name(),'::',@x:value))">
                  <span class="fas fa-layer-group" style="margin-left: 5pt; cursor:pointer;" onclick="xdom.datagrid.columns.groupBy('{name()}')"></span>
                </xsl:if>
                <!--<xsl:for-each select="(key('filterBy',concat(ancestor::*[key('data_table',generate-id())][1]/@x:id,'::',name()))[not(key('filterBy', generate-id(/*))) and key('filterBy', generate-id())])[1]">-->
                <xsl:for-each select="key('filterBy',$key_name)[key('filterBy',concat('@',name(),'::',generate-id(ancestor-or-self::*[@fieldId=$field_ref/@fieldId])))][1]">
                  <span class="fas fa-filter" style="margin-left: 5pt; cursor: pointer;">
                    <xsl:attribute name="onclick">
                      <xsl:text/>xdom.data.clearFilterOption({match:`<xsl:value-of select="$field_path"/>`})<xsl:text/>
                    </xsl:attribute>
                  </span>
                </xsl:for-each>
              </div>
              <div class="non_printable w3-dropdown-content w3-bar-block w3-border">
                <xsl:apply-templates mode="filter.values" select="."/>
                <xsl:apply-templates mode="group.values" select="."/>
              </div>
            </div>
          </div>
        </xsl:when>
        <xsl:otherwise>
          <span class="far fa-caret-square-down" style="cursor:pointer; margin-right: 5pt; font-size:10pt;">
            <xsl:variable name="attribute_list">
              <xsl:apply-templates mode="filter.attributes" select="."/>
            </xsl:variable>
            <xsl:attribute name="onclick">
              <xsl:text/>xdom.data.filterBy([<xsl:value-of select="substring-after($attribute_list,',')"/>]); /*<xsl:value-of select="concat(ancestor-or-self::*[key('data_table',generate-id())][1]/@x:id,'::',name())"/>::<xsl:value-of select="count(key('filterBy',concat(generate-id(../..),'::',name())))"/>*/<!--<xsl:value-of select="$field_path"/>-->
            </xsl:attribute>
          </span>
          <span style="cursor: pointer;">
            <xsl:attribute name="onclick">
              <xsl:text/>xdom.data.sortBy('<xsl:value-of select="name()"/>',<xsl:value-of select="number(@x:value) = @x:value"/><xsl:if test="key('sortOrder',concat('ascending::',name()))">,'descending'</xsl:if>)
            </xsl:attribute>
            <label>
              <xsl:apply-templates select="$field_ref" mode="datagrid.header.headertext"/>
            </label>
            <xsl:choose>
              <xsl:when test="key('sortOrder',concat('ascending::',name()))">&#160;&#8595;&#160;</xsl:when>
              <xsl:when test="key('sortOrder',concat('descending::',name()))">&#160;&#8593;&#160;</xsl:when>
            </xsl:choose>
          </span>
          <xsl:if test="key('groupBy',concat(name(),'::',@x:value))">
            <span class="fas fa-layer-group" style="margin-left: 5pt; cursor:pointer;" onclick="xdom.datagrid.columns.groupBy('{name()}')"></span>
          </xsl:if>
          <xsl:if test="key('foreignKey',@fieldId) and key('junctionTable',../@fieldId) and not(key('blocked',true()))">
            <button class="btn btn-primary btn-circle">
              <xsl:attribute name="onclick">
                <xsl:apply-templates mode="datagrid.data.buttons.add.onclick">
                  <xsl:with-param name="parent_record" select="$parent_record"/>
                </xsl:apply-templates>
              </xsl:attribute>
              <i class="fa fa-plus"></i>
            </button>
          </xsl:if>
        </xsl:otherwise>
      </xsl:choose>
      <div class="columnSelector" onmousedown="xdom.datagrid.columns.resize.mousedown(event)" onmouseover="xdom.datagrid.columns.resize.mouseover(event)"></div>
    </th>
  </xsl:template>

  <xsl:template match="/*/*[count(key('model_row','first')|.)=1]/*[key('hidden',generate-id())]" mode="datagrid.header" priority="-1">
  </xsl:template>

  <!--<xsl:template match="/*/*[position()=1]/*[@ref]" mode="datagrid.header" priority="-1">
    <th onclick="xdom.data.sortBy('{@ref}')" style="cursor:pointer;" id="container_{@x:id}">
      <xsl:value-of select="@ref"/>
    </th>
  </xsl:template>-->

  <!--mode="datagrid.header.columns"-->
  <xsl:template match="*" mode="datagrid.header.columns">
    <xsl:param name="columns" select="key('fields',generate-id())"/>
    <xsl:param name="parent_record" select="."/>
    <xsl:variable name="table" select="."/>
    <tr>
      <th scope="col" class="header-column w3-padding-small w3-display-container headcol_2 rowhead" style="text-align:center;">
        <xsl:if test="1=0 and not(key('blocked',true()))">
          <xsl:apply-templates mode="datagrid.settings" select="."/>
        </xsl:if>
      </th>
      <th class="rowhead non_printable">
        <xsl:if test="key('supports_new',generate-id($table)) and not(key('blocked',true()))">
          <xsl:apply-templates mode="datagrid.data.buttons.add" select="px:fields">
            <xsl:with-param name="parent_record" select="$parent_record"/>
          </xsl:apply-templates>
        </xsl:if>
        <xsl:if test="not(key('blocked',true())) and key('junctionTable',../@fieldId) and not(key('field',../@fieldId)/@maxSelections=1 or key('field',../@fieldId)/@relationshipType='hasOne') and count($parent_record/px:data/px:dataRow)&gt;1">
          <div class="form-check">
            <input class="form-check-input position-static" type="checkbox" id="_check_all_{../@x:id}" aria-label="..." onclick="xdom.data.checkAll('{$parent_record/@x:id}', this.checked)" style="height: 15px; width: 15px;">
              <xsl:if test="count($parent_record/px:data/px:dataRow)=count($parent_record/px:data/px:dataRow[@x:checked='true'])">
                <xsl:attribute name="checked">checked</xsl:attribute>
              </xsl:if>
            </input>
          </div>
        </xsl:if>
      </th>
      <xsl:apply-templates mode="datagrid.header" select="$columns">
        <xsl:with-param name="parent_record" select="$parent_record"/>
      </xsl:apply-templates>
    </tr>
  </xsl:template>

  <!--mode="datagrid.footer"-->

  <xsl:template match="*[key('data_table',generate-id())]" mode="datagrid.footer">
    <xsl:apply-templates select="." mode="datagrid.footer.columns"/>
  </xsl:template>

  <xsl:template match="*[key('field',generate-id())]" mode="datagrid.footer">
    <xsl:param name="ref_node" select="."/>
    <th style="text-align:right;" id="container_{@x:id}">
      <xsl:variable name="total">
        <xsl:value-of select="sum(../../*[key('visible',generate-id())][not(key('hidden',generate-id()))]/*[name()=name(current())][number(@x:value)=@x:value]/@x:value)"/>
      </xsl:variable>
      <xsl:choose>
        <xsl:when test="key('totalizer',name())">
          Suma: <xsl:value-of select="format-number($total, '$###,##0.00', 'money')"/>
        </xsl:when>
        <xsl:when test="1=0 and number(@x:value)=@x:value and contains(@x:value,'.')">
          <!--<xsl:value-of select="sum(../../*/*[name()=name(current())][number(@x:value)=@x:value])"/>-->
          <xsl:value-of select="format-number($total, '$###,##0.00', 'money')"/>
        </xsl:when>
        <xsl:when test="1=0 and number(@x:value)=@x:value">
          <xsl:value-of select="sum(../../*[key('visible',generate-id())][not(key('hidden',generate-id()))]/*[name()=name(current())][number(@x:value)=@x:value]/@x:value)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text> </xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </th>
  </xsl:template>

  <xsl:template match="*[key('hidden',generate-id())]" mode="datagrid.header" priority="5"/>
  <xsl:template match="*[key('hidden',generate-id())]" mode="datagrid.footer" priority="5"/>
  <xsl:template match="*[key('hidden',generate-id())]" mode="datagrid.body" priority="5"/>
  <xsl:template match="*[key('hidden',generate-id())]//*" mode="datagrid.header" priority="5"/>
  <xsl:template match="*[key('hidden',generate-id())]//*" mode="datagrid.footer" priority="5"/>
  <xsl:template match="*[key('hidden',generate-id())]//*" mode="datagrid.body" priority="5"/>
  <!--mode="datagrid.footer.columns"-->
  <xsl:template match="*" mode="datagrid.footer.columns">
    <xsl:param name="columns" select="key('fields',generate-id())"/>
    <tr id="container_{@x:id}">
      <th scope="row" style="" class="rowhead">
        &#160;
      </th>
      <th scope="row" style="" class="rowhead non_printable">
        &#160;
      </th>
      <xsl:apply-templates mode="datagrid.footer" select="$columns"/>
    </tr>
  </xsl:template>

  <xsl:template match="x:*"/>
  <xsl:template match="x:*[not(key('data_table',generate-id()))]" mode="datagrid.header" priority="-1">
    <xsl:comment>
      Nodo ignorado <xsl:value-of select="name()"/>
    </xsl:comment>
  </xsl:template>

  <xsl:template match="x:*[not(key('data_table',generate-id()) or key('data_row',generate-id()))]" mode="datagrid.body" priority="-1">
    <xsl:comment>
      Nodo ignorado <xsl:value-of select="name()"/>
    </xsl:comment>
  </xsl:template>

  <xsl:template match="x:*[not(key('data_table',generate-id()))]" mode="datagrid.footer">
    <xsl:comment>
      Nodo ignorado <xsl:value-of select="name()"/>
    </xsl:comment>
  </xsl:template>

  <xsl:template match="px:layout//px:field" mode="datagrid.header">
    <xsl:param name="parent_record" select="x:dummy"/>
    <xsl:apply-templates mode="datagrid.header" select="key('field',@fieldId)">
      <xsl:with-param name="parent_record" select="$parent_record"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="px:layout//px:field" mode="datagrid.body">
    <xsl:param name="parent_record" select="x:dummy"/>
    <xsl:param name="data_row"/>
    <xsl:variable name="field" select="."/>
    <xsl:apply-templates mode="datagrid.body" select="$data_row/*[@fieldId=$field/@fieldId]">
      <xsl:with-param name="parent_record" select="$parent_record"/>
      <xsl:with-param name="field" select="key('field',@fieldId)"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="px:layout//px:field" mode="datagrid.footer">
    <xsl:param name="parent_record" select="x:dummy"/>
    <xsl:apply-templates mode="datagrid.footer" select="key('field',@fieldId)">
      <xsl:with-param name="parent_record" select="$parent_record"/>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="px:layout//px:field[key('hidden',generate-id())]" mode="datagrid.header" priority="5"/>
  <xsl:template match="px:layout//px:field[key('hidden',generate-id())]" mode="datagrid.body" priority="5"/>
  <xsl:template match="px:layout//px:field[key('hidden',generate-id())]" mode="datagrid.footer" priority="5"/>

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

  <xsl:template match="*[key('data_row',generate-id())][key('hidden',generate-id())]" mode="datagrid.body" priority="10">
    <tr style="height: 1px !important; background-color: red !important; ">
      <td colspan="10"></td>
    </tr>
  </xsl:template>


  <xsl:template match="/*/x:message" priority="1">
    <div class="w3-panel w3-red w3-display-container w3-animate-top">
      <span onclick="this.parentElement.style.display='none'; xdom.data.remove('{@x:id}')"
      class="w3-button w3-large w3-display-topright">&#215;</span>
      <h3>¡Aviso!</h3>
      <p>
        <xsl:value-of select="."/>
      </p>
    </div>
  </xsl:template>
</xsl:stylesheet>
