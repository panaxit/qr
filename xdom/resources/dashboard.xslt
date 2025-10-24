<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:debug="http://panax.io/debug"
  xmlns:msxsl="urn:schemas-microsoft-com:xslt"
  xmlns:x="http://panax.io/xdom"
  xmlns:session="http://panax.io/session"
  xmlns:filters="http://panax.io/filters"
  xmlns:custom="http://panax.io/custom"
  xmlns:datagrid="http://panax.io/widgets/datagrid"
  xmlns="http://www.w3.org/1999/xhtml"
>
  <xsl:import href="keys.xslt"/>
  <xsl:import href="format_values.xslt"/>
  <xsl:output method="xml" indent="yes" />


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

  <xsl:template match="/">
    <main id="main" class="w3-responsive">
      <style>
        <![CDATA[
      .header-column {white-space: nowrap; padding-right: 3px;}
      .column {white-space: pre-line;}
      .money {color:blue;}
      .negative {color:red;}
      .w3-dropdown-content a:hover {text-decoration:none}
      
      main {
        overflow-y: scroll;
        position: relative;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        height: 100%;
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
      ]]>
      </style>
      <div class="main-container_2">
        <xsl:variable name="data_set" select="key('data_set',generate-id(*))[not(key('hidden',generate-id()))][key('filterBy',generate-id())]"/>
        <table width="100%" border="1" cellspacing="0" class="w3-table-all w3-tiny table table-hover">
          <thead>
            <xsl:apply-templates mode="datagrid.header" select="."/>
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
                            <span class="far fa-minus-square" style="padding-right: 5pt; cursor: pointer;" onclick="xdom.datagrid.columns.groupCollapse('{name(..)}','{.}')"></span>
                          </xsl:when>
                          <xsl:otherwise>
                            <span class="far fa-plus-square" style="padding-right: 5pt; cursor: pointer;" onclick="xdom.datagrid.columns.groupCollapse('{name(..)}','{.}')"></span>
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
              <tbody>
                <xsl:apply-templates mode="datagrid.body" select="$data_set">
                </xsl:apply-templates>
              </tbody>
            </xsl:otherwise>
          </xsl:choose>
          <tfoot>
            <xsl:apply-templates mode="datagrid.footer" select="."/>
          </tfoot>
        </table>
      </div>
    </main>
  </xsl:template>

  <xsl:template match="text()"></xsl:template>
  <xsl:template match="text()" mode="datagrid.header"></xsl:template>
  <xsl:template match="text()" mode="datagrid.body"></xsl:template>
  <xsl:template match="text()" mode="datagrid.footer"></xsl:template>

  <xsl:template match="*" mode="datagrid.settings">
    <div class="dropdown" onmouseleave="xdom.data.update('{@x:id}','@datagrid:show_settings','false')">
      <div class="w3-dropdown-click" style="width: 100%;">
        <span class="fas fa-cog w3-button" style="cursor:pointer;">
          <xsl:attribute name="onclick">
            <xsl:text/>xdom.data.update('<xsl:value-of select="@x:id"/>','@datagrid:show_settings',<xsl:choose>
              <xsl:when test="string(@datagrid:show_settings)!='true'">'true'</xsl:when>
              <xsl:otherwise>'false'</xsl:otherwise>
            </xsl:choose>)<xsl:text/>
          </xsl:attribute>
        </span>
        <div>
          <xsl:attribute name="class">
            <xsl:text>w3-dropdown-content w3-bar-block w3-border </xsl:text>
            <xsl:if test="@datagrid:show_settings='true'">w3-show</xsl:if>
          </xsl:attribute>
          <div class="w3-bar-item w3-button w3-green" onclick="myAccFunc('settings_datagrid_filters')">
            Columnas <i class="fa fa-caret-down"></i>
          </div>
          <div id="settings_datagrid_filters" class="w3-hide w3-white w3-card-4 w3-show">
            <xsl:for-each select="key('data_fields',generate-id())">
              <a href="#" class="w3-bar-item w3-button" style="white-space:nowrap;">
                <span onclick="xdom.datagrid.columns.toggleVisibility('{name()}')" style="cursor:pointer;">
                  <xsl:choose>
                    <xsl:when test="key('hidden',generate-id())">
                      <span class="far fa-square w3-text-gray" style="padding-right: 5pt;"></span>
                    </xsl:when>
                    <xsl:otherwise>
                      <span class="far fa-check-square w3-text-green" style="padding-right: 5pt;"></span>
                    </xsl:otherwise>
                  </xsl:choose>
                  <xsl:apply-templates mode="datagrid.header.headertext" select="."/>
                </span>
                <xsl:if test="key('groupBy',concat(name(),'::',@x:value))">
                  <span class="fas fa-layer-group" style="padding-left: 5pt; cursor:pointer;" onclick="xdom.datagrid.columns.groupBy('{name()}')"></span>
                </xsl:if>
              </a>
            </xsl:for-each>
          </div>
          <!--<div class="w3-bar-item w3-button w3-green" onclick="myAccFunc('settings_datagrid_filters')">
            Herramientas <i class="fa fa-caret-down"></i>
          </div>
          <div id="settings_datagrid_filters" class="w3-hide w3-white w3-card-4 w3-show">
            <a href="#" class="w3-bar-item w3-button" style="white-space:nowrap;">
              <span onclick="xdom.datagrid.columns.toggleVisibility('{name()}')" style="cursor:pointer;">
                <xsl:choose>
                  <xsl:when test="key('enable_selection',generate-id())">
                    <span class="far fa-square w3-text-gray" style="padding-right: 5pt;"></span>
                  </xsl:when>
                  <xsl:otherwise>
                    <span class="far fa-check-square w3-text-green" style="padding-right: 5pt;"></span>
                  </xsl:otherwise>
                </xsl:choose>
                Seleccionar registros
              </span>
            </a>
          </div>-->
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="*[key('data_row',generate-id())][not(key('hidden',generate-id()))]" mode="datagrid.body">
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
        <th class="headcol_2" style="text-align: right; padding-right: 5px; white-space: nowrap;" onclick="xdom.data.selectRecord('{@x:id}')">
          <xsl:if test="@x:selected='true'">
            <xsl:attribute name="style">text-align: right; padding-right: 5px; white-space: nowrap; background-color:lime;</xsl:attribute>
            <xsl:attribute name="onclick">xdom.data.unselectRecord('<xsl:value-of select="@x:id"/>')</xsl:attribute>
          </xsl:if>
          <xsl:value-of select="count(preceding-sibling::*[key('visible',generate-id())][not(key('hidden',generate-id()))]|self::*)"/>
          <!--<xsl:text>:</xsl:text>
        <xsl:value-of select="position()"/>-->
        </th>
      </xsl:if>
      <th style="width:50px; white-space:nowrap; text-align:center;">
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
      <xsl:apply-templates mode="datagrid.body" select="key('fields',generate-id(ancestor::*[key('data_table',generate-id())][1]))">
        <xsl:with-param name="data_row" select="."/>
        <xsl:with-param name="row_number" select="position()"/>
      </xsl:apply-templates>
    </tr>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons" priority="-1">
    <xsl:apply-templates select="." mode="datagrid.data.buttons.edit"/>
    <xsl:apply-templates select="." mode="datagrid.data.buttons.delete"/>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.edit" priority="-1">
    <span class="far fa-edit xdom-action-button">
      <xsl:attribute name="style">cursor:pointer;</xsl:attribute>
      <xsl:apply-templates select="." mode="datagrid.data.buttons.edit.action"/>
    </span>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.delete" priority="-1">
    <span class="far fa-trash-alt xdom-action-button">
      <xsl:attribute name="style">cursor:pointer;</xsl:attribute>
      <xsl:apply-templates select="." mode="datagrid.data.buttons.delete.action"/>
    </span>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.edit.action" priority="-1">
    <xsl:attribute name="style">display:none;</xsl:attribute>
  </xsl:template>

  <xsl:template match="*" mode="datagrid.data.buttons.delete.action" priority="-1">
    <xsl:attribute name="style">display:none;</xsl:attribute>
  </xsl:template>

  <xsl:template match="*[key('visible',generate-id())][not(key('hidden',generate-id()))][@editing='true']" mode="datagrid.body">
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
    <xsl:value-of select="translate(local-name(),'-_','  ')"/>
  </xsl:template>

  <xsl:template match="*" mode="filter.values">
    <xsl:param name="node-set" select="key('filterBy',name())"/>
    <xsl:variable name="current" select="."/>
    <!--<xsl:choose>
      <xsl:when test="1=0 and key('money',generate-id())">
        <xsl:text> Monto entre: </xsl:text>
        <br/>
        <input type="text" value="" size="15" maxlength="15" onchange="xdom.data.update(this.id,'@x:value',this.value);"/>
        <xsl:text> y </xsl:text>
        <input type="text" value="" size="15" maxlength="15" onchange="xdom.data.update(this.id,'@x:value',this.value);"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:for-each select="/*/*[not(@forDeletion='true')]/*[local-name()=local-name($current)][count(key('filters',concat(name(),'::',@x:value))[1]|.)=1]">
          <xsl:sort select="@x:value" data-type="number" order="ascending"/>
          <xsl:sort select="@x:value" data-type="text" order="ascending"/>
          <a href="#" class="w3-bar-item w3-button" onclick="xdom.data.filterBy('{local-name()}','{@x:value}')" style="white-space:nowrap;">
            <xsl:apply-templates select="@x:value"/>
            <span class="w3-badge w3-margin-left">
              <xsl:value-of select="count(key('filters',concat(name(),'::',@x:value)))"/>
            </span>
          </a>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>-->
    <xsl:variable name="value-set" select="key('filters',concat(generate-id(ancestor::*[key('data_table',generate-id())][1]),'::',name()))"/>
    <div class="w3-bar-item w3-button w3-green" onclick="myAccFunc('settings_{name()}_filters')">
      Filters <i class="fa fa-caret-down"></i>
    </div>
    <div id="settings_{name()}_filters" class="w3-hide w3-white w3-card-4 w3-responsive w3-show" style="height:500px;">
      <xsl:for-each select="$value-set">
        <xsl:sort select="." data-type="number" order="ascending"/>
        <xsl:variable name="current_name" select="name(..)"/>
        <xsl:variable name="current_value" select="."/>
        <xsl:if test="count($value-set[name()=name(current()) and .=current()][1]|.)=1">
          <a href="#" class="w3-bar-item w3-button" onclick="xdom.data.filterBy('{name(..)}','{.}')" style="white-space:nowrap; cursor:default;">
            <xsl:if test="not(key('filterBy', generate-id(/*))) and key('filterBy', generate-id(..))">
              <xsl:attribute name="onclick">
                <xsl:text/>xdom.data.clearFilterOption('<xsl:value-of select="name(..)"/>','<xsl:value-of select="."/>')<xsl:text/>
              </xsl:attribute>
            </xsl:if>
            <xsl:variable name="total_records" select="($value-set[name()=name(current()) and .=current()]/../..)[key(concat('other_filters_',$current_name),generate-id())]"/>
            <xsl:if test="not($total_records)">
              <xsl:attribute name="class">w3-bar-item w3-button w3-disabled</xsl:attribute>
            </xsl:if>
            <xsl:variable name="value">
              <xsl:apply-templates select="."/>
            </xsl:variable>
            <xsl:choose>
              <xsl:when test="not(key('filterBy', generate-id(/*))) and key('filterBy', generate-id(..))">
                <span class="fas fa-filter" style="padding-right: 5pt;"></span>
              </xsl:when>
              <xsl:otherwise>
                <span class="far fa-square w3-text-gray" style="padding-right: 5pt;"></span>
              </xsl:otherwise>
            </xsl:choose>
            <label>
              <xsl:choose>
                <xsl:when test="$value=''">
                  <xsl:text>-Vacío-</xsl:text>
                </xsl:when>
                <xsl:otherwise>
                  <xsl:value-of select="$value" />
                </xsl:otherwise>
              </xsl:choose>
              <!---
          <xsl:value-of select="count(/*/*[key('filterBy',generate-id())])"/>
          -
          <xsl:value-of select="count(key(concat('other_filters_',$current_name),generate-id(..)))"/>::-->

            </label>
            <span class="w3-badge w3-margin-left">
              <xsl:value-of select="count($total_records)"/>
            </span>
          </a>
        </xsl:if>
      </xsl:for-each>
    </div>
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

  <xsl:template match="*" mode="datagrid.body.cell.style">
    <xsl:text>position:relative;</xsl:text>
  </xsl:template>

  <xsl:template match="*[key('data_row',generate-id())][not(key('hidden',generate-id()))]/*[not(key('hidden',generate-id()))]" mode="datagrid.body">
    <xsl:param name="data_row" select=".."/>
    <xsl:variable name="field" select="."/>
    <xsl:for-each select="$data_row/*[name()=name($field)]">
      <td id="container_{@x:id}">
        <xsl:attribute name="style">
          <xsl:apply-templates mode="datagrid.body.cell.style" select="."/>
        </xsl:attribute>
        <xsl:attribute name="class">
          <xsl:text>column </xsl:text>
          <xsl:if test="@x:value!=@x:original_value">
            <xsl:text>changed </xsl:text>
          </xsl:if>
          <xsl:if test="normalize-space(@x:value)=''">
            <xsl:text>required </xsl:text>
          </xsl:if>
        </xsl:attribute>
        <xsl:choose>
          <xsl:when test="*">
            <xsl:apply-templates select="."/>
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
      </td>
    </xsl:for-each>
  </xsl:template>

  <!--<xsl:template match="/*/*[key('visible',generate-id())][not(key('hidden',generate-id()))]/IdOperacion[key('visible',generate-id())][not(key('hidden',generate-id()))]" mode="datagrid.body">
    <td>
      <xsl:attribute name="class">
        <xsl:text>column </xsl:text>
        <xsl:if test="@x:value!=@x:original_value">
          <xsl:text>changed </xsl:text>
        </xsl:if>
        <xsl:if test="normalize-space(@x:value)=''">
          <xsl:text>required </xsl:text>
        </xsl:if>
      </xsl:attribute>
      <xsl:choose>
        <xsl:when test="key('money',generate-id())">
          <xsl:attribute name="style">
            <xsl:text/>text-align:right;<xsl:text/>
            <xsl:choose>
              <xsl:when test="@x:value&lt;0">color:red;</xsl:when>
              <xsl:otherwise>color:blue;</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:apply-templates select="@x:value"/>
          -->
  <!--<xsl:value-of select="format-number(@x:value, '$###,##0.00', 'money')"/>-->
  <!--
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="@x:value"/>
        </xsl:otherwise>
      </xsl:choose>
    </td>
  </xsl:template>-->

  <xsl:template match="/*/*[key('visible',generate-id())][not(key('hidden',generate-id()))]/*[key('visible',generate-id())][not(key('hidden',generate-id()))]" mode="datagrid.body.rowspan">
    <xsl:text>1</xsl:text>
    <xsl:apply-templates mode="datagrid.body.rowspan" select="../following-sibling::*[1][not(@editing='true')]/*[name()=name(current())][@x:value=current()/@x:value]"/>
  </xsl:template>

  <xsl:template match="/*[@autospan='true']/*[key('visible',generate-id())][not(key('hidden',generate-id()))]/*[key('visible',generate-id())][not(key('hidden',generate-id()))]" mode="datagrid.body">
    <xsl:variable name="position" select="position()"/>
    <xsl:variable name="rowspan">
      <!--select="''"-->
      <xsl:apply-templates mode="datagrid.body.rowspan" select="../following-sibling::*[1][not(@editing='true')]/*[name()=name(current())][@x:value=current()/@x:value]"/>
    </xsl:variable>
    <xsl:if test="count(../preceding-sibling::*[1][not(@editing='true')]/*[name()=name(current())][@x:value=current()/@x:value])=0">
      <td>
        <xsl:if test="string-length($rowspan)+1&gt;1">
          <xsl:attribute name="rowspan">
            <xsl:value-of select="string-length($rowspan)+1"/>
          </xsl:attribute>
        </xsl:if>
        <xsl:value-of select="@x:value"/>
      </td>
    </xsl:if>
  </xsl:template>

  <xsl:template match="/*/*[not(key('hidden',generate-id()))][@editing='true']/*[not(key('hidden',generate-id()))]" mode="datagrid.body" priority="10">
    <td id="container_{@x:id}" style="position:relative;">
      <input id="{@x:id}" type="text" value="{@x:value}" size="15" maxlength="15" onchange="xdom.data.update(this.id,'@x:value',this.value);" onkeyup="console.log(event.keyCode)" onfocus="var oRange = this.createTextRange(); oRange.moveStart('character', 0); oRange.moveEnd('character', this.value.length-1); oRange.select();">
        <xsl:attribute name="onfocus">
          return;
          if (document.selection) { //IE
          var range = document.body.createTextRange();
          range.moveToElementText(this);
          range.select();
          } else if (window.getSelection) { //others
          var range = document.createRange();
          range.selectNode(this);
          window.getSelection().addRange(range);
          this.select();
          }
        </xsl:attribute>
        <xsl:attribute name="onkeyup">
          (function(){
          //console.log(event.keyCode)
          switch (event.keyCode) {
          case 40:
          xdom.data.update('<xsl:value-of select="../following-sibling::*[1]/@x:id"/>','@editing','true',true)
          xdom.dom.refresh();
          try{document.getElementById('<xsl:value-of select="../following-sibling::*[1]/*[name()=name(current())]/@x:id"/>').focus()} catch(e) {console.log(e.description)}
          break;
          case 38:
          xdom.data.update('<xsl:value-of select="../preceding-sibling::*[1]/@x:id"/>','@editing','true',true)
          try{document.getElementById('<xsl:value-of select="../preceding-sibling::*[1]/*[name()=name(current())]/@x:id"/>').focus()} catch(e) {console.log(e.description)}
          break;
          default:
          break;
          }
          })();
        </xsl:attribute>
      </input>
    </td>
  </xsl:template>

  <!--mode="datagrid.header"-->
  <xsl:template match="*[key('field',generate-id())]" mode="datagrid.header">
    <xsl:param name="ref_node" select="."/>
    <th class="header-column w3-padding-small w3-display-container" style="vertical-align: middle;" id="container_{@x:id}">
      <!--ondragover="xdom.dom.allowDrop(event);"-->
      <xsl:variable name="current" select="."/>
      <xsl:choose>
        <xsl:when test="key('filterBy',name())">
          <div class="dropdown">
            <div class="w3-dropdown-hover" style="width: 100%;">
              <div class="w3-button w3-block w3-left-align">
                <span class="far fa-caret-square-down" style="cursor:pointer; padding-right: 5pt;">
                  <xsl:attribute name="onclick">
                    xdom.data.clearFilter('<xsl:value-of select="name()"/>')
                  </xsl:attribute>
                </span>
                <span style="cursor: pointer;">
                  <xsl:attribute name="onclick">
                    xdom.data.sortBy('<xsl:value-of select="name()"/>',<xsl:value-of select="number(@x:value) = @x:value"/><xsl:if test="key('sortOrder',concat('ascending::',name()))">,'descending'</xsl:if>);
                  </xsl:attribute>
                  <label>
                    <xsl:apply-templates select="$ref_node" mode="datagrid.header.headertext"/>
                  </label>
                  <xsl:choose>
                    <xsl:when test="key('sortOrder',concat('ascending::',name()))">&#160;&#8595;&#160;</xsl:when>
                    <xsl:when test="key('sortOrder',concat('descending::',name()))">&#160;&#8593;&#160;</xsl:when>
                  </xsl:choose>
                </span>
                <xsl:if test="key('groupBy',concat(name(),'::',@x:value))">
                  <span class="fas fa-layer-group" style="padding-left: 5pt; cursor:pointer;" onclick="xdom.datagrid.columns.groupBy('{name()}')"></span>
                </xsl:if>
                <xsl:for-each select="(key('filterBy',name())[not(key('filterBy', generate-id(/*))) and key('filterBy', generate-id())])[1]">
                  <span class="fas fa-filter" style="padding-left: 5pt; cursor: pointer;">
                    <xsl:attribute name="onclick">
                      <xsl:text/>xdom.data.clearFilterOption('<xsl:value-of select="name()"/>')<xsl:text/>
                    </xsl:attribute>
                  </span>
                </xsl:for-each>
              </div>
              <div class="w3-dropdown-content w3-bar-block w3-border">
                <xsl:apply-templates mode="filter.values" select="."/>
              </div>
            </div>
          </div>
        </xsl:when>
        <xsl:otherwise>
          <span class="far fa-caret-square-down" style="cursor:pointer; padding-right: 5pt;">
            <xsl:attribute name="onclick">
              xdom.data.filterBy('<xsl:value-of select="name()"/>');
            </xsl:attribute>
          </span>
          <span style="cursor: pointer;">
            <xsl:attribute name="onclick">
              xdom.data.sortBy('<xsl:value-of select="name()"/>',<xsl:value-of select="number(@x:value) = @x:value"/><xsl:if test="key('sortOrder',concat('ascending::',name()))">,'descending'</xsl:if>)
            </xsl:attribute>
            <label>
              <xsl:apply-templates select="$ref_node" mode="datagrid.header.headertext"/>
            </label>
            <xsl:choose>
              <xsl:when test="key('sortOrder',concat('ascending::',name()))">&#160;&#8595;&#160;</xsl:when>
              <xsl:when test="key('sortOrder',concat('descending::',name()))">&#160;&#8593;&#160;</xsl:when>
            </xsl:choose>
          </span>
          <xsl:if test="key('groupBy',concat(name(),'::',@x:value))">
            <span class="fas fa-layer-group" style="padding-left: 5pt; cursor:pointer;" onclick="xdom.datagrid.columns.groupBy('{name()}')"></span>
          </xsl:if>
        </xsl:otherwise>
      </xsl:choose>
      <div class="columnSelector" onmousedown="xdom.datagrid.columns.resize.mousedown(event)" onmouseover="xdom.datagrid.columns.resize.mouseover(event)"></div>
    </th>
  </xsl:template>

  <xsl:template match="/*/*[count(key('model_row','first')|.)=1]/*[key('hidden',generate-id()) or not(key('visible',generate-id()))]" mode="datagrid.header">
  </xsl:template>

  <!--<xsl:template match="/*/*[position()=1]/*[@ref]" mode="datagrid.header">
    <th onclick="xdom.data.sortBy('{@ref}')" style="cursor:pointer;" id="container_{@x:id}">
      <xsl:value-of select="@ref"/>
    </th>
  </xsl:template>-->

  <xsl:template match="*[key('data_table',generate-id())]" mode="datagrid.header">
    <xsl:apply-templates select="." mode="datagrid.header.columns"/>
  </xsl:template>

  <xsl:template match="*[key('hidden',generate-id())]" mode="datagrid.header"/>

  <!--mode="datagrid.header.columns"-->
  <xsl:template match="*" mode="datagrid.header.columns">
    <tr>
      <th class="header-column w3-padding-small w3-display-container headcol_2" style="text-align:center; width:6em;">
        <xsl:text>#</xsl:text>
      </th>
      <th>
        <xsl:apply-templates mode="datagrid.settings" select="."/>
      </th>
      <xsl:apply-templates mode="datagrid.header" select="key('fields',generate-id())"/>
    </tr>
  </xsl:template>

  <!--mode="datagrid.footer"-->
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

  <xsl:template match="*[key('data_table',generate-id())]" mode="datagrid.footer">
    <xsl:apply-templates select="." mode="datagrid.footer.columns"/>
  </xsl:template>

  <xsl:template match="*[key('hidden',generate-id())]" mode="datagrid.footer"/>

  <!--mode="datagrid.footer.columns"-->
  <xsl:template match="*" mode="datagrid.footer.columns">
    <tr id="container_{@x:id}">
      <th colspan="2">
        &#160;
      </th>
      <xsl:apply-templates mode="datagrid.footer" select="key('fields',generate-id())"/>
    </tr>
  </xsl:template>

  <xsl:template match="x:*"/>
  <xsl:template match="x:*" mode="datagrid.header"/>
  <xsl:template match="x:*" mode="datagrid.body"/>
  <xsl:template match="x:*" mode="datagrid.footer"/>
</xsl:stylesheet>
