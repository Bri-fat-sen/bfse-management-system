import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, folderId, fileName, fileContent, mimeType, query } = await req.json();

    // Use OAuth connector for full Drive access
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected. Please authorize Drive access.' 
      }, { status: 403 });
    }

    console.log('Using OAuth Drive connector');

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    switch (action) {
      case 'getRootFolder': {
        const rootResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/root?fields=id,name`,
          { headers }
        );
        const rootData = await rootResponse.json();
        return Response.json({ success: true, folder: rootData });
      }

      case 'listFiles': {
        let q;
        if (folderId) {
          q = `'${folderId}' in parents and trashed=false`;
        } else if (query) {
          q = query;
        } else {
          // Root - list all user's files
          q = `'root' in parents and trashed=false`;
        }

        const params = new URLSearchParams({
          q: q,
          fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,createdTime,owners,shared)',
          orderBy: 'modifiedTime desc',
          pageSize: '1000',
          supportsAllDrives: 'true',
          includeItemsFromAllDrives: 'true'
        });

        const listResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
          { headers }
        );

        if (!listResponse.ok) {
          const errorText = await listResponse.text();
          console.error('Drive list error:', errorText);
          return Response.json({ 
            error: 'Failed to list files',
            details: errorText
          }, { status: listResponse.status });
        }

        const data = await listResponse.json();
        console.log(`Found ${data.files?.length || 0} files`);

        const sorted = (data.files || []).sort((a, b) => {
          const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
          const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';
          if (aIsFolder && !bIsFolder) return -1;
          if (!aIsFolder && bIsFolder) return 1;
          return 0;
        });

        return Response.json({ success: true, files: sorted });
      }

      case 'uploadFile': {
        if (!folderId || !fileName || !fileContent) {
          return Response.json({ error: 'Missing fields' }, { status: 400 });
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

      case 'createFolder': {
        if (!fileName) {
          return Response.json({ error: 'Folder name required' }, { status: 400 });
        }

        const metadata = {
          name: fileName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: folderId ? [folderId] : undefined
        };

        const createResponse = await fetch(
          'https://www.googleapis.com/drive/v3/files',
          {
            method: 'POST',
            headers,
            body: JSON.stringify(metadata)
          }
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          return Response.json({ error: 'Failed to create folder', details: errorText }, { status: 500 });
        }

        const result = await createResponse.json();
        return Response.json({
          success: true,
          folderId: result.id,
          folderName: result.name
        });
      }

      case 'moveFile': {
        const { fileId, newParentId, removeParents } = await req.json();
        
        if (!fileId || !newParentId) {
          return Response.json({ error: 'fileId and newParentId required' }, { status: 400 });
        }

        const params = new URLSearchParams({
          addParents: newParentId,
          removeParents: removeParents || '',
          fields: 'id,name,parents'
        });

        const moveResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`,
          {
            method: 'PATCH',
            headers
          }
        );

        if (!moveResponse.ok) {
          const errorText = await moveResponse.text();
          return Response.json({ error: 'Failed to move file', details: errorText }, { status: 500 });
        }

        const result = await moveResponse.json();
        return Response.json({ success: true, file: result });
      }

      case 'deleteFile': {
        const { fileId } = await req.json();
        
        if (!fileId) {
          return Response.json({ error: 'fileId required' }, { status: 400 });
        }

        const deleteResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        if (!deleteResponse.ok && deleteResponse.status !== 204) {
          const errorText = await deleteResponse.text();
          return Response.json({ error: 'Failed to delete file', details: errorText }, { status: 500 });
        }

        return Response.json({ success: true, message: 'File deleted' });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Drive error:', error);
    return Response.json({ 
      error: 'Internal error',
      details: error.message 
    }, { status: 500 });
  }
});