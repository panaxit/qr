<% 
Response.CharSet = "ISO-8859-1"
DIM oConfiguration:	set oConfiguration = Server.CreateObject("MSXML2.DOMDocument"): 
oConfiguration.Async = false: 
oConfiguration.setProperty "SelectionLanguage", "XPath"
oConfiguration.Load(Server.MapPath("../../../config/system.config"))

DIM sConnectionId
IF  request.form("database_id")<>"" THEN
	sConnectionId=request.form("database_id")
ELSEIF Application("database_id")<>"" THEN
	sConnectionId=Application("database_id")
ELSEIF  request.form("Connection_id")<>"" THEN
	sConnectionId=request.form("Connection_id")
ELSEIF Application("Connection_id")<>"" THEN
	sConnectionId=Application("Connection_id")
END IF

IF oConfiguration.documentElement IS NOTHING THEN
    Response.ContentType = "application/json"
    Response.CharSet = "ISO-8859-1"
    Response.Status = "412 Precondition Failed" %>
	{
	"success": false,
	"message": "No se encontró el archivo de configuración system.config"
	}
<% 	response.end
END IF

DIM sConnectionString
IF sConnectionId<>"" THEN
	sConnectionString="@Id='"&sConnectionId&"' or Alias/text()='"&sConnectionId&"'"
ELSE
	sConnectionString="1=0"
END IF

DIM oDatabase: 
SET oDatabase = oConfiguration.documentElement.selectSingleNode("/configuration/Databases/Database["&sConnectionString&"]")
IF oDatabase IS NOTHING THEN
    SET oDatabase = oConfiguration.documentElement.selectSingleNode("/configuration/Databases/Database[@Id=../@Default or string(../@Default)='' and (@Id='default' or @Id='main')]")
END IF

IF oDatabase IS NOTHING THEN
    Response.ContentType = "application/json"
    Response.CharSet = "ISO-8859-1"
    Response.Status = "401 Unauthorized" %>
	{
	"success": false,
	"message": `No se encontró definida la conexión <%= REPLACE(sConnectionId,"\","\\") %> en el archivo de configuración system.config`
	}
<% 	response.end
END IF
SESSION("connection_id") = oDatabase.getAttribute("Id")
SESSION("database_id") = oDatabase.getAttribute("Id")
Dim RegEx: Set RegEx = New RegExp
With RegEx
    .Pattern = "(\[[^\[]*\])+"
    .IgnoreCase = True
    .Global = True
    .MultiLine = True
End With

function asyncCall(strUrl)
    Set xmlHttp = Server.Createobject("MSXML2.ServerXMLHTTP")
    xmlHttp.Open "GET", strUrl, False
    xmlHttp.setRequestHeader "User-Agent", "asp httprequest"
    xmlHttp.setRequestHeader "content-type", "application/x-www-form-urlencoded"
    xmlHttp.Send
    'response.write xmlHttp.responseText
    'xmlHttp.abort()
    set xmlHttp = Nothing   
end function 

function Sleep(seconds)
    set oShell = CreateObject("Wscript.Shell")
    cmd = "%COMSPEC% /c timeout " & seconds & " /nobreak"
    oShell.Run cmd,0,1
End function

function curPageURL()
 dim protocol, port
 protocol = LCase(Request.ServerVariables("SERVER_PROTOCOL"))
 protocol=Left(protocol, instrRev(protocol, "/")-1)
 if Request.ServerVariables("HTTPS") = "on" then
   protocol=protocol&"s"
 end if  

 if Request.ServerVariables("SERVER_PORT") = "80" then
   port = ""
 else
   port = ":" & Request.ServerVariables("SERVER_PORT")
 end if  

 curPageURL = protocol & "://" & Request.ServerVariables("SERVER_NAME") &_
              port & Request.ServerVariables("SCRIPT_NAME")
end function

Set oCn = Server.CreateObject("ADODB.Connection")
oCn.ConnectionTimeout = 5
oCn.CommandTimeout = 60

DIM sDatabaseName, sDatabaseDriver, sDatabaseEngine, sDatabaseServer, sDatabaseUser, sDatabasePassword
sDatabaseName  		= oDatabase.getAttribute("Name")
sDatabaseEngine 	= oDatabase.getAttribute("Engine")
sDatabaseServer		= oDatabase.getAttribute("Server")
sDatabaseUser     	= oDatabase.getAttribute("User")
sDatabasePassword 	= oDatabase.getAttribute("Password")
sDefaultUser     	= oDatabase.getAttribute("DefaultUser")
IF ISNULL(sDefaultUser) THEN
    sDefaultUser     	= ""
END IF
sUserLogin = LCASE(URLDecode(request.form("UserName")))
sUserName = sUserLogin
sPassword = URLDecode(request.form("Password"))
IF ISNULL(oDatabase.getAttribute("User")) THEN
    IF sUserName="" AND sPassword="" AND sDefaultUser<>"" THEN
        sUserName = sDefaultUser
    END IF

    DIM oUser: SET oUser=oDatabase.selectSingleNode("(./User[@Name='"&sUserName&"' or @Name='*'])[1]")
    IF oUser IS NOTHING THEN
        Response.ContentType = "application/json"
        Response.CharSet = "ISO-8859-1"
        Response.Status = "401 Unauthorized" %>
	{
	"success": false,
	"message": "No se encontró el usuario para la instancia"
	}
<% 	    response.end
    END IF
    sDatabaseUser = oUser.getAttribute("InstanceUser")
    IF ISNULL(sDatabaseUser) THEN
        sDatabaseUser = sUserName
    END IF
    sDatabasePassword 	= oUser.getAttribute("InstancePassword")
    IF sPassword="" AND NOT ISNULL(oUser.getAttribute("Password")) THEN
        sPassword = oUser.getAttribute("Password")
    END IF
ELSE
    IF sUserName<>"webmaster" THEN
        sDatabaseUser = sUserName
        sDatabasePassword = "40A965D05136639974C40FAF6CFDF21D"
        IF sUserName="guest" THEN
            sPassword = "40A965D05136639974C40FAF6CFDF21D"
        END IF
    END IF
END IF
SESSION("secret_database_user") = sDatabaseUser
SESSION("secret_database_password") = sDatabasePassword
SESSION("secret_server_id") = oDatabase.getAttribute("Server")
SESSION("secret_database_name") = sDatabaseName

DIM StrCnn: StrCnn = "driver={SQL Server};server="&SESSION("secret_server_id")&";uid="&SESSION("secret_database_user")&";pwd="&SESSION("secret_database_password")&";database="&SESSION("secret_database_name")

DIM currentLocation: currentLocation = curPageURL()
FUNCTION checkConnection()
    If oCn.State = 0 THEN
        ON ERROR RESUME NEXT
        oCn.Open StrCnn
    End if
    IF Err.Number=0 AND (TRIM(SESSION("secret_server_id"))<>"" AND TRIM(SESSION("secret_database_user"))<>"" AND TRIM(SESSION("secret_database_password"))<>"" AND TRIM(SESSION("secret_database_name"))<>"") THEN 
        Session("AccessGranted") = TRUE
        session("status") = "authorized"
    ELSE
        Session("AccessGranted") = FALSE
        Session("status") = "unauthorized"
        DIM error_description
        IF (Err.number<>0) THEN
            error_description = Err.Description
        ELSEIF oCn.errors.count<>0 THEN
            error_description = "Can't connect"
        END IF
	    ErrorDesc=RegEx.Replace(error_description, "")
        'response.write Err.Number&": "&Err.Description
        IF INSTR(ErrorDesc,"SQL Server does not exist or access denied")>0 OR INSTR(ErrorDesc,"Communication link failure")>0 OR INSTR(ErrorDesc,"ConnectionWrite")>0 THEN
            AsyncCall "https://server.panax.io:8081/startSQL"
            'AsyncCall Left(currentLocation, instrRev(currentLocation, "/"))&"reconnect.asp"
            Err.Clear
            Sleep(3)
            If oCn.State = 0 Then
                'response.write "Here 1 "&oCn.State&"<br/>"
                ON ERROR RESUME NEXT
                oCn.Open StrCnn
                IF Err.Number<>0 THEN 
                    'response.write "Here 2 "&oCn.State
                    Response.ContentType = "application/json"
                    Response.CharSet = "ISO-8859-1"
	                ErrorDesc=RegEx.Replace(Err.Description, "")
                    'response.Write ErrorDesc
                    IF INSTR(ErrorDesc,"SQL Server does not exist or access denied")>0 OR INSTR(ErrorDesc,"Communication link failure")>0 THEN
                        Response.Status = "503 Service Unavailable" '"408 Request Timeout"
                    %>
	                {
	                "success": false,
	                "message": `No se pudo establecer una conexión con la base de datos <%= sDatabaseName %>: <%= REPLACE(RegEx.Replace(Err.Description, ""),"\","\\") %>`
	                }
                <% 	response.end
                    END IF
                END IF
            End If
        END IF
    END IF
END FUNCTION
%>
<!--#include file="vbscript.asp"-->
<%
ON ERROR RESUME NEXT
checkConnection()
session("user_login") = sUserName
strSQL="EXEC [#Security].Authenticate '" & REPLACE(RTRIM(sUserName),"'", "''") & "', '"& REPLACE(RTRIM(sPassword),"'", "''") & "'"
'response.write "strSQL: "&strSQL: response.end
Set rsResult = Server.CreateObject("ADODB.RecordSet")
rsResult.CursorLocation 	= 3
rsResult.CursorType 		= 3
set rsResult = oCn.Execute(strSQL)
checkConnection()
IF Err.Number<>0 THEN 
    Response.ContentType = "application/json"
    Response.CharSet = "ISO-8859-1"
    IF Err.Number=-2147217911 THEN
        Response.Status = "401 Unauthorized"
    ELSE 
        Response.Status = "409 Conflict"
    END IF
    ErrorDesc=""
    IF sUserLogin<>"" THEN
        ErrorDesc=RegEx.Replace(Err.Description, "")
    END IF
    Session.Contents.Remove("StrCnn")
    %>
	{
	"code": 2
	, "success": false
    , "user_login": "<%= session("user_login") %>"
    , "database_id": "<%= session("database_id") %>"
    , "connection_id": "<%= session("connection_id") %>"
	, "message": `<%= REPLACE(REPLACE(RegEx.Replace(ErrorDesc, ""),"\","\\"),CHR(13),"\n") %>`
	}
<% 	response.end
END IF
'	alert('<%= REPLACE(strSQL, "'", "\'") %%')
'<%	'response.end
'Response.CodePage = 65001
'Response.CharSet = "UTF-8"
Response.ContentType = "application/json" 
If rsResult.BOF and rsResult.EOF Then
	Session("AccessGranted") = FALSE
    session("status") = "unauthorized"
ELSE
	Session("AccessGranted") = TRUE
    session("status") = "authorized"
	Response.Cookies("AntiPopUps") = REQUEST.FORM("AntiPopUps")
	Response.Cookies("AntiPopUps").Expires = Date() + 1
	Session.Timeout = 600
	Session("AccessGranted") = TRUE
	session("user_id")=rsResult(0)
    session("expires") = DateAdd("n", session.Timeout, NOW)
    IF session("user_id")=1 THEN
        session("debug") = TRUE
    END IF
	oCn.execute "IF EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.ROUTINES IST WHERE routine_schema IN ('$Application') AND ROUTINE_NAME IN ('OnStartUp')) BEGIN EXEC [$Application].OnStartUp END"
%>
    	{
	"success": true
    , "userId": "<%= session("user_id") %>"
    , "user_login": "<%= session("user_login") %>"
    , "database_id": "<%= session("database_id") %>"
    , "connection_id": "<%= session("connection_id") %>"
<%
FOR EACH oField IN rsResult.fields %>
<% IF oField.name="" Then %>
<%
%>
<% END IF %>
<% IF TypeName(oField)="Field" THEN %><% sType=TypeName(oField.value): sValue=oField.value %><% ELSE %><% sType=TypeName(oField): sValue=oField %><% END IF %>
<% SESSION(oField.name)= sValue %>
		    ,"<%= oField.name %>":<% SELECT CASE UCASE(sType): CASE "NULL": %>null<% CASE "BOOLEAN": %><% IF sValue THEN %>true<% ELSE %>false<% END IF %><% CASE ELSE %>"<%= RTRIM(REPLACE(replaceMatch(sValue, "["&chr(13)&""&chr(10)&""&vbcr&""&vbcrlf&"]", ""&vbcrlf),"""", """")) %>"<% END SELECT %> 
	    <% NEXT %>
}
<% rsResult.Close 
END IF%>
<% IF NOT(Session("AccessGranted")) THEN %>
	{
	"success": false
    , "user_login": "<%= session("user_login") %>"
    , "status": "unauthorized"
	, "message": "Nombre de usuario o contraseña inválidos"
    , "source": "<%= REPLACE(strSQL,"""","""") %>"
	}
<% END IF 
If oCn.State = 1 THEN
    oCn.Close
END IF
%>