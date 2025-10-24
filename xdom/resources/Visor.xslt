<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl"
   xmlns:ldv="http://www.uif.shcp.gob.mx/recepcion/inm">

<xsl:output method="html" indent="yes"/>
  

<xsl:template match="ldv:archivo">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"/>

    <div class="container">
      <div  style="margin-top:40px">
        <table class="table table-bordered table-condensed " width="100%">
          <thead class="thead-dark text-center">
            <tr>
            <th colspan="4">Datos generales</th>
            </tr>
          </thead>
          <tbody>
          <tr>
            
            <td align="center" class="table-secondary" > <xsl:number/> RFC</td>
            <td>
              <xsl:number level="multiple" count="//ldv:sujeto_obligado | //ldv:sujeto_obligado/ldv:clave_sujeto_obligado" format="1.1"/>
              
              <xsl:apply-templates select="ldv:informe/ldv:sujeto_obligado/ldv:clave_sujeto_obligado "/>
            </td>  
            <td align="center" class="table-secondary">Referencia</td>
            <td>
              <xsl:value-of select="ldv:informe/ldv:aviso/ldv:referencia_aviso"/>
            </td>
          </tr>
          
          <tr>
            <td align="center" class="table-secondary" >Clave actividad</td>
            <td>
              <xsl:value-of select="ldv:informe/ldv:sujeto_obligado/ldv:clave_actividad"/>
            </td>            
            <td align="center" class="table-secondary">Prioridad</td>
            <td>
              <xsl:value-of select="ldv:informe/ldv:aviso/ldv:prioridad"/>
            </td>
          </tr>

          <tr>
            <td align="center" class="table-secondary">Mes reportado</td>
            <td>
              <xsl:value-of select="ldv:informe/ldv:mes_reportado"/>
            </td>
            <td align="center" class="table-secondary">Tipo alerta</td>
            <td>
              <xsl:value-of select="ldv:informe/ldv:aviso/ldv:alerta/ldv:tipo_alerta"/>
            </td>
          </tr>
           
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="container">
      <div  style="margin-top:40px">
        <table class="table table-striped" width="100%">
          <thead class="thead-dark text-center">
            <tr>
              <th colspan="8">Datos de identificacion </th>
            </tr>
          </thead>
          <tbody>
            <xsl:apply-templates select=".//ldv:persona_aviso/ldv:tipo_persona/ldv:persona_fisica|//ldv:persona_moral"/>     
          </tbody>
          </table>
      </div>
    </div>
    
      
    <div class="container">
      <div  style="margin-top:40px">
        
        <table class="table table-striped" width="100%">
          <thead class="thead-dark text-center">
            <tr>
              <th colspan="8">Datos del domicilio</th>
            </tr>
          </thead>
          <tbody>
          <tr class="table-secondary">
              <td>Pais</td>
              <td>Estado</td>
              <td>Ciudad</td>
              <td>Colonia</td>
              <td>Calle</td>
              <td>Número exterior</td>
              <td>Número interior</td>
              <td>Código Postal</td>
          </tr>        
            <xsl:apply-templates select=".//ldv:tipo_domicilio/ldv:nacional|//ldv:extranjero"/>
         
          </tbody>
          
     </table>
  
      </div>
    </div>
   
    
    <div class="container">
      <div  style="margin-top:40px">        
        <table class="table table-striped" width="100%">
          <thead class="thead-dark text-center">
            <tr>
              <th colspan="3">Datos del contacto</th>
            </tr>
          </thead>
          <tbody>
          <tr class="table-secondary">
              <td>Clave de país</td>
              <td>Número de teléfono</td>
              <td>Correo electrónico</td>
          </tr>
        <xsl:apply-templates select=".//ldv:telefono"/>
          </tbody>
     </table>
      </div>
    </div>
    
   
    <div class="container">
          <div  style="margin-top:40px">        
            <table class="table table-striped" width="100%">
              <thead class="thead-dark text-center">
                <tr>
                  <th colspan="4">Datos operacion</th>
                </tr>
              </thead>
              <tbody>
              <tr class=" table-secondary">
                  <td>Fecha</td>
                  <td>Tipo</td>
                  <td>Figura cliente</td>
                  <td>Figura de persona que <br/>realiza la actividad</td>
              </tr>
            <xsl:apply-templates select=".//ldv:datos_operacion"/>
              </tbody>
         </table>
          </div>
    </div>


    <div class="container">
          <div  style="margin-top:40px">        
            <table class="table table-striped" width="100%">
              <thead class="thead-dark text-center">
                <tr>
                  <th colspan="9">Caracteristicas inmueble</th>
                </tr>
              </thead>
              <tbody>
              <tr class="table-secondary">
                  <td>Tipo</td>
                  <td>Valor pactado</td>
                  <td>Colonia</td>
                  <td>Calle</td>
                  <td>Numero exterior</td>
                  <td>Código postal</td>
                  <td>Dimension terreno</td>
                  <td>Dimension construido</td>
                  <td>Folio real</td>
              </tr>
            <xsl:apply-templates select=".//ldv:caracteristicas_inmueble"/>
              </tbody>
         </table>
          </div>
    </div>
  

    <div class="container">
          <div  style="margin-top:40px">        
            <table class="table table-striped" width="100%">
              <thead class="thead-dark text-center">
                <tr>
                  <th colspan="5">Datos del contrato privado o público</th>
                </tr>
              </thead>
              <tbody>
              <tr class="table-secondary">
                  <td>Número</td>
                  <td>Fecha</td>
                  <td>Notario</td>
                  <td>Entidad</td>
                  <td>Valor</td>
              </tr>
            <xsl:apply-templates select=".//ldv:datos_instrumento_publico"/>
              </tbody>
         </table>
          </div>
    </div>
  
  
    <div class="container">
          <div  style="margin-top:40px">        
            <table class="table table-striped" width="100%">
              <thead class="thead-dark text-center">
                <tr>
                  <th colspan="5">Datos liquidación</th>
                </tr>
              </thead>
              <tbody>
              <tr class="table-secondary">
                  <td>Fecha pago</td>
                  <td>Forma pago</td>
                  <td>Instrumento</td>
                  <td>Moneda</td>
                  <td>Monto</td>
              </tr>
            <xsl:apply-templates select=".//ldv:datos_liquidacion"/>
              </tbody>
         </table>
          </div>
    </div>
   
   
</xsl:template>


<xsl:template match="ldv:persona_aviso/ldv:tipo_persona/ldv:persona_fisica|//ldv:persona_moral">
  <xsl:if test="self::ldv:persona_fisica">
  
   <tr class="table-secondary">
              <td>Nombre</td>
              <td>Apellido Paterno</td>
              <td>Apellido Materno</td>
              <td>Fecha de Nacimiento</td>
              <td>RFC</td>
              <td>CURP</td>
              <td>País</td>
              <td>Actividad económica</td>
  </tr> 
    
    <tr>
    <td> <xsl:apply-templates select="ldv:nombre"/>  </td>
     <td> <xsl:apply-templates select="ldv:apellido_paterno"/>  </td>
     <td> <xsl:apply-templates select="ldv:apellido_materno"/>  </td>
     <td> 
              <!--<xsl:call-template name="fecha">
                <xsl:with-param name="fecha" select="ldv:fecha_nacimiento "/>  
              </xsl:call-template>-->
      </td>
     <td> <xsl:apply-templates mode="campo" select="ldv:rfc "/>  </td>
     <td> <xsl:apply-templates select="ldv:curp "/>  </td>
     <td> <xsl:apply-templates select="ldv:pais_nacionalidad "/>  </td>
     <td> <xsl:apply-templates select="ldv:actividad_economica "/>  </td>
   </tr>       
   </xsl:if>

  <xsl:if test="self::ldv:persona_moral">
   <tr class="table-secondary">
              <td>Denominación razón</td>
              <td>Fecha</td>
              <td>RFC</td>
              <td>Pais</td>
              <td colspan="2">Giro mercantil</td>
    </tr> 
  
    <tr>
     <td> <xsl:apply-templates select="ldv:denominacion_razon"/>  </td>
     <td>   
              <!--<xsl:call-template name="fecha">
                <xsl:with-param name="fecha" select="ldv:fecha_constitucion "/>  
              </xsl:call-template>-->
     </td>
     <td> <xsl:apply-templates mode="campo" select="ldv:rfc"/>  </td>
     <td> <xsl:apply-templates select="ldv:pais_nacionalidad"/>  </td>
     <td> <xsl:apply-templates select="ldv:giro_mercantil"/>  </td>
   </tr>
    
     <table class="table">
    <thead class="text-center">
      <tr class="table-secondary">
        <th colspan="8">Representante apoderado</th>
      </tr>
    </thead>
    <tbody>
      <tr class="table-secondary">
              <td>Nombre</td>
              <td>Apellido Materno</td>
              <td>Apellido Paterno</td>
              <td>Fecha nacimiento</td>
              <td>RFC</td>
              <td>CURP</td>
      </tr>
            <tr>            
               <td> <xsl:apply-templates select="ldv:representante_apoderado/ldv:nombre"/>  </td>
               <td> <xsl:apply-templates select="ldv:representante_apoderado/ldv:apellido_paterno"/>  </td>
               <td> <xsl:apply-templates select="ldv:representante_apoderado/ldv:apellido_materno"/>  </td>
               <td> <!--<xsl:call-template name="fecha">
                    <xsl:with-param name="fecha" select="ldv:representante_apoderado/ldv:fecha_nacimiento"/>  
                    </xsl:call-template>-->
               <xsl:apply-templates mode="fecha" select="ldv:representante_apoderado/ldv:fecha_nacimiento"/>
               </td>
               <td> <xsl:apply-templates select="ldv:representante_apoderado/ldv:rfc"/></td>
               <td> <xsl:apply-templates mode="campo" select="ldv:representante_apoderado/ldv:curp"/></td>
       </tr>
    </tbody>
  </table>
   
  </xsl:if>
</xsl:template>

<xsl:template mode="fecha" match="*">
    <xsl:param name="fecha" />
    <xsl:variable name="dia" select="substring($fecha, 7,2)" />
    <xsl:variable name="mes" select="substring($fecha,5,2)" />
    <xsl:variable name="año" select="substring($fecha,1,4)" />
    <xsl:value-of select="concat($dia,'/',$mes, '/', $año)" />    
</xsl:template>

  
<xsl:template match="ldv:tipo_domicilio/ldv:nacional|//ldv:extranjero">   
  <xsl:if test="self::ldv:nacional">
   <tr> 
    <td> <xsl:apply-templates mode="campo" select="ldv:pais"/>  </td>
    <td> <xsl:apply-templates mode="campo" select="ldv:estado"/>  </td>
    <td> <xsl:apply-templates mode="campo" select="ldv:ciudad"/>  </td>
     <td> <xsl:apply-templates select="ldv:colonia"/>  </td>
    <td> <xsl:apply-templates select="ldv:calle "/>  </td> 
    <td> <xsl:apply-templates select="ldv:numero_exterior"/>  </td> 
    <td> <xsl:apply-templates mode="campo" select="ldv:numero_interior"/></td>
    <td> <xsl:apply-templates select="ldv:codigo_postal"/></td>
  </tr>
   </xsl:if>
   <xsl:if test="self::ldv:extranjero">
   <tr> 
    <td> <xsl:apply-templates mode="campo" select="ldv:pais"/>  </td>
    <td> <xsl:apply-templates mode="campo" select="ldv:estado"/>  </td>
    <td> <xsl:apply-templates mode="campo" select="ldv:ciudad"/>  </td>
    <td> <xsl:apply-templates select="ldv:colonia"/>  </td>
    <td> <xsl:apply-templates select="ldv:calle "/>  </td> 
    <td> <xsl:apply-templates select="ldv:numero_exterior"/>  </td> 
    <td> <xsl:apply-templates mode="campo" select="ldv:numero_interior"/></td>
    <td> <xsl:apply-templates select="ldv:codigo_postal"/></td>
  </tr>
   </xsl:if>
 
</xsl:template>

  
<xsl:template match="ldv:telefono">
     
  <tr>
     <td> <xsl:apply-templates select="ldv:numero_telefono"/>  </td>
     <td> <xsl:apply-templates select="ldv:clave_pais"/>  </td>
    <td>  <xsl:apply-templates mode="campo" select="ldv:correo_electronico|current()[not(ldv:correo_electronico)]"/></td> 
    </tr>
</xsl:template>

  
<xsl:template match="ldv:datos_operacion">
     
  <tr>
     <td>  
              <!--<xsl:call-template name="fecha">
                <xsl:with-param name="fecha" select="ldv:fecha_operacion "/>
              </xsl:call-template>-->
     </td>
     <td> <xsl:apply-templates select="ldv:tipo_operacion"/>  </td>
     <td> <xsl:apply-templates select="ldv:figura_cliente"/> </td>      
     <td> <xsl:apply-templates select="ldv:figura_so"/> </td> 
    </tr>
</xsl:template>

  
<xsl:template match="ldv:caracteristicas_inmueble">
  <tr>
     <td> <xsl:apply-templates select="ldv:tipo_inmueble"/>  </td>
     <td> <xsl:apply-templates select="ldv:valor_pactado"/>  </td>
     <td> <xsl:apply-templates mode="campo" select="ldv:colonia"/> </td>    
     <td> <xsl:apply-templates select="ldv:calle"/> </td>      
     <td> <xsl:apply-templates select="ldv:numero_exterior"/> </td>       
     <td> <xsl:apply-templates select="ldv:codigo_postal"/> </td>         
     <td> <xsl:apply-templates select="ldv:dimension_terreno"/> </td>       
     <td> <xsl:apply-templates select="ldv:dimension_construido"/> </td>    
     <td> <xsl:apply-templates select="ldv:folio_real"/> </td>
    </tr>
</xsl:template>


<xsl:template match="ldv:datos_instrumento_publico">
  <tr>
     <td> <xsl:apply-templates select="ldv:numero_instrumento_publico"/>  </td>
     <td> 
         <!--<xsl:call-template name="fecha">
         <xsl:with-param name="fecha" select="ldv:fecha_instrumento_publico "/> 
         </xsl:call-template>--> 
    </td>
     <td> <xsl:apply-templates select="ldv:notario_instrumento_publico"/> </td>    
     <td> <xsl:apply-templates select="ldv:entidad_instrumento_publico"/> </td>      
     <td> <xsl:apply-templates select="ldv:valor_avaluo_catastral"/> </td> 
    </tr>
</xsl:template>

  
<xsl:template match="ldv:datos_liquidacion">
  <tr>
     <td>
              <!--<xsl:call-template name="fecha">
                <xsl:with-param name="fecha" select="ldv:fecha_pago "/>  
              </xsl:call-template>-->
     </td>
     <td> <xsl:apply-templates select="ldv:forma_pago"/>  </td>
     <td> <xsl:apply-templates mode="campo" select="ldv:instrumento_monetario"/> </td>    
     <td> <xsl:apply-templates select="ldv:moneda"/> </td>      
     <td> <xsl:apply-templates select="ldv:monto_operacion"/> </td> 
    </tr>
</xsl:template>

  
<xsl:template mode="campo" match="*">      
      <xsl:if test="not(text())">
        <xsl:attribute name="bgcolor">#29335F</xsl:attribute>
      </xsl:if>  
</xsl:template>
  

<!--<xsl:template name="fecha">            
    <xsl:param name="fecha" />
    <xsl:variable name="dia" select="substring($fecha, 7,2)" />
    <xsl:variable name="mes" select="substring($fecha,5,2)" />
    <xsl:variable name="año" select="substring($fecha,1,4)" />
    <xsl:value-of select="concat($dia,'/',$mes, '/', $año)" />
</xsl:template>-->
 



</xsl:stylesheet>
