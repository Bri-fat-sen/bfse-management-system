import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, folderId, fileName, fileContent, fileType, mimeType, query } = await req.json();

    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected. Please authorize Google Drive access.' 
      }, { status: 403 });
    }

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // Get employee info for folder naming
    const employees = await base44.entities.Employee.filter({ user_email: user.email });
    const employee = employees[0];
    const orgId = employee?.organisation_id;
    
    const organisations = orgId ? await base44.entities.Organisation.filter({ id: orgId }) : [];
    const orgName = organisations[0]?.name || 'Organisation';
    const orgCode = organisations[0]?.code || '';

    // Root app folder name
    const appFolderName = `${orgName}${orgCode ? ' (' + orgCode + ')' : ''} - Business Suite`;

    switch (action) {
      case 'setup': {
        // Find or create root app folder
        const searchResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='${appFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          { headers }
        );
        const searchData = await searchResponse.json();
        
        let rootFolderId;
        if (searchData.files && searchData.files.length > 0) {
          rootFolderId = searchData.files[0].id;
        } else {
          // Create root folder
          const createResponse = await fetch(
            'https://www.googleapis.com/drive/v3/files',
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                name: appFolderName,
                mimeType: 'application/vnd.google-apps.folder'
              })
            }
          );
          const rootFolder = await createResponse.json();
          rootFolderId = rootFolder.id;
        }

        // Create subfolders
        const subfolders = [
          'Reports',
          'Payroll & Payslips',
          'Financial Documents',
          'Invoices & Receipts',
          'HR Documents',
          'Imported Documents',
          'Expenses',
          'Bank Statements'
        ];

        const folderIds = { root: rootFolderId };

        for (const folderName of subfolders) {
          const searchSub = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            { headers }
          );
          const subData = await searchSub.json();
          
          if (subData.files && subData.files.length > 0) {
            folderIds[folderName] = subData.files[0].id;
          } else {
            const createSub = await fetch(
              'https://www.googleapis.com/drive/v3/files',
              {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  name: folderName,
                  mimeType: 'application/vnd.google-apps.folder',
                  parents: [rootFolderId]
                })
              }
            );
            const subFolder = await createSub.json();
            folderIds[folderName] = subFolder.id;
          }
        }

        return Response.json({ success: true, folders: folderIds, rootName: appFolderName });
      }

      case 'listFiles': {
        const q = folderId 
          ? `'${folderId}' in parents and trashed=false`
          : query || 'trashed=false';
        
        const listResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&orderBy=modifiedTime desc&pageSize=50`,
          { headers }
        );
        const data = await listResponse.json();
        return Response.json({ success: true, files: data.files || [] });
      }

      case 'uploadFile': {
        if (!folderId || !fileName || !fileContent) {
          return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const boundary = '-------314159265358979323846';
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelim = `\r\n--${boundary}--`;

        const metadata = {
          name: fileName,
          mimeType: mimeType || 'application/pdf',
          parents: [folderId]
        };

        const multipartRequestBody = 
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${mimeType || 'application/pdf'}\r\n` +
          'Content-Transfer-Encoding: base64\r\n\r\n' +
          fileContent +
          closeDelim;

        const uploadResponse = await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': `multipart/related; boundary=${boundary}`
            },
            body: multipartRequestBody
          }
        );

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          return Response.json({ error: 'Upload failed', details: errorText }, { status: 500 });
        }

        const result = await uploadResponse.json();
        return Response.json({
          success: true,
          fileId: result.id,
          fileName: result.name,
          webViewLink: `https://drive.google.com/file/d/${result.id}/view`
        });
      }

      case 'downloadFile': {
        if (!folderId) { // using folderId as fileId for download
          return Response.json({ error: 'Missing fileId' }, { status: 400 });
        }

        const downloadResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${folderId}?alt=media`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!downloadResponse.ok) {
          return Response.json({ error: 'Download failed' }, { status: 500 });
        }

        const fileData = await downloadResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fileData)));
        
        return Response.json({
          success: true,
          content: base64,
          mimeType: downloadResponse.headers.get('content-type')
        });
      }

      case 'getFileMetadata': {
        if (!folderId) {
          return Response.json({ error: 'Missing fileId' }, { status: 400 });
        }

        const metaResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink`,
          { headers }
        );

        const metadata = await metaResponse.json();
        return Response.json({ success: true, metadata });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Google Drive Manager error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});