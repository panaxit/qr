<!--#include file="vbscript.asp"-->
<%
DIM content_type: content_type=Request.ServerVariables("HTTP_ACCEPT")
Response.CharSet = "ISO-8859-1"
'ON ERROR  RESUME NEXT'
'IF INSTR(content_type,"xml") THEN
'Response.ContentType = "text/xml"
DIM file_location, file_name
file_name = request.QueryString("target_name")
DIM xmlDoc
Set xmlDoc=Server.CreateObject("Microsoft.XMLDOM")
xmlDoc.async="false"
xmlDoc.load(Request)
xmlDoc.setProperty "SelectionLanguage", "XPath"
xmlDoc.setProperty "SelectionNamespaces", "xmlns:xsl=""http://www.w3.org/1999/XSL/Transform"""
Randomize

DIM ext
IF (TypeName(xmlDoc.selectSingleNode("/xsl:*"))<>"Nothing") THEN
    ext="xsl"
ELSEIF (TypeName(xmlDoc.selectSingleNode("/*[namespace-uri()='']"))<>"Nothing") THEN
    ext="xml"
ELSE
    ext="xml"
END IF

IF (file_name="") then
    file_name="user_"&session("user_id")&"_"&REPLACE(REPLACE(REPLACE(NOW(),":",""),"/","")," ","_")&"_"& Rnd &"."&ext    
END IF
file_location=server.MapPath(".")&"\..\custom\sessions\"&file_name
xmlDoc.save file_location %>
this.fileName="<%= file_name %>";
<%
IF Err.Number<>0 THEN
	ErrorDesc=Err.Description
    %>
    this.status='exception';
    this.message="<%= REPLACE(REPLACE(ErrorDesc, "[Microsoft][ODBC SQL Server Driver][SQL Server]", ""), """", "\""") %>";
    <%
    response.end
ELSE
%>
	this.status='success'
<%
END IF %>