<% SERVER.SCRIPTTIMEOUT = 4800 %>
<%
ON ERROR RESUME NEXT
'Stores only files with size less than MaxFileSize

'Using Huge-ASP file upload
'Dim Form: Set Form = Server.CreateObject("ScriptUtils.ASPForm")
'Using Pure-ASP file upload
Dim Form: Set Form = New ASPForm %>
<!--#INCLUDE FILE="upload.motobit.asp"-->
<% 
Server.ScriptTimeout = 2000
Form.SizeLimit = &HF000000

'{b}Set the upload ID for this form.
'Progress bar window will receive the same ID.
if len(Request.QueryString("UploadID"))>0 then
	Form.UploadID = Request.QueryString("UploadID")'{/b}
    else
    Randomize
	Form.UploadID = clng(rnd * &H7FFFFFFF)
end if
'was the Form successfully received?
Const fsCompleted  = 0
If Form.State = fsCompleted Then 'Completed
  'was the Form successfully received?
  If Form.State = 0 then %><% 
	Dim parentFolder
	Dim fileName, saveAs, extension
	Dim relativeTargetPath, DestinationPath
	Dim fso:	Set fso = Server.CreateObject("Scripting.FileSystemObject")
	parentFolder=Request.QueryString("parentFolder")'TRIM(Form("parentFolder").Value)
    IF parentFolder="" THEN 
      parentFolder="FilesRepository"
    END IF
%>
		    {
		    success:true, 
		    files: [{}
<%  DIM File 
    FOR EACH File IN Form.Files.Items
	    saveAs=Request.QueryString("saveAs")'TRIM(Form("saveAs").Value)
        extension = fso.GetExtensionName(Form.Files.Item(File.Name).FileName)
	    Form.Files.Item(File.Name).FileName = "tmp_"&Form.UploadID&"."&extension
	    IF TRIM(saveAs)<>"" THEN
		    Form.Files.Item(File.Name).FileName = saveAs&"."&extension
	    END IF
	    'fileName = Form.Files.Items.Item(0).FileName
	    relativeTargetPath=parentFolder & "/" & fileName
	    ' Ruta donde se va a guardar el file
	    DestinationPath = Server.mapPath("../../../"&parentFolder)
	
	    'response.write "DestinationPath: "&DestinationPath: response.end
	    'response.end
    %>
    <% Form.Files.Save DestinationPath %>
    <% IF Err.Number<>0 THEN %>
	    ,{
	    success: false,
	    statusMessage: "Error: <%= REPLACE(Err.Description, "[Microsoft][ODBC SQL Server Driver][SQL Server]", "") %><% IF session("user_id")=1 THEN response.write " \n\n"&sSQL %>"
	    }
    <% ELSE %>
        ,{
                    uploadId: "<%= Form.UploadID %>",
                    sourceId: "<%= File.Name %>",
				    file: "<%= parentFolder %>/<%= File.FileName %>",
				    fileExtension: "<%= extension %>",
				    originalFile: "<%= REPLACE(File.FilePath, "\", "\\") %>",
				    fileName:"<%= File.FileName %>",
				    parentFolder:"<%= parentFolder %>",
				    status:"success"
			    }
	<%  END IF
    NEXT %>
		],
		statusMessage:"<%= Form.Files.Count %> file(s) uploaded to <%= Request.ServerVariables("HTTP_HOST") %> (<%= relativeTargetPath %>)"
		}
<%
	ElseIf Form.State > 10 then
	  Const fsSizeLimit = &HD %>
			<script language="JavaScript">
				var resultObject = new Object();
				resultObject.status="error";
				resultObject.statusMessage="<% Select case Form.State
			case fsSizeLimit: %>Source form size (<%= Form.TotalBytes %>B) exceeds form limit (<%= Form.SizeLimit %>B)<% case else %>Some form error.<% end Select %>";
			    alert(resultObject.statusMessage)
			    window.close();
			</script>	
	<%	response.end
	End If'Form.State = 0 then %>
<% END IF %>
