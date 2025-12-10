import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, fileId, fileName, mimeType, fileData, folderId } = await req.json();
    
    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');
    
    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected. Please authorize Google Drive access first.' 
      }, { status: 401 });
    }

    if (action === 'list') {
      // List files and folders in a specific folder (or root if no folderId)
      let query = folderId 
        ? `'${folderId}' in parents and trashed = false`
        : `trashed = false`;
      
      const listResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&pageSize=100&orderBy=folder,modifiedTime desc&fields=files(id,name,mimeType,modifiedTime,size,thumbnailLink,parents)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!listResponse.ok) {
        const errorText = await listResponse.text();
        return Response.json({ 
          error: `Drive access limited: With current permissions, you can only see files created by this app. To browse all your Drive files, you need broader Drive permissions.`,
          folders: [],
          files: []
        });
      }
      
      const data = await listResponse.json();
      
      // Separate folders and files
      const folders = data.files?.filter(f => f.mimeType === 'application/vnd.google-apps.folder') || [];
      const files = data.files?.filter(f => f.mimeType !== 'application/vnd.google-apps.folder') || [];
      
      return Response.json({ 
        folders, 
        files,
        message: folders.length === 0 && files.length === 0 ? 
          'No files found. With drive.file scope, you can only see files created by this app or files you explicitly select.' : 
          null
      });
    }

    if (action === 'download') {
      // Download a file from Google Drive
      if (!fileId) {
        return Response.json({ error: 'fileId required' }, { status: 400 });
      }
      
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!downloadResponse.ok) {
        throw new Error(`Failed to download file: ${await downloadResponse.text()}`);
      }
      
      const fileBlob = await downloadResponse.arrayBuffer();
      
      // Upload to Base44 storage
      const formData = new FormData();
      const blob = new Blob([fileBlob], { type: mimeType || 'application/octet-stream' });
      formData.append('file', blob, fileName || 'file');
      
      const uploadResult = await base44.integrations.Core.UploadFile({ 
        file: blob 
      });
      
      return Response.json({ 
        file_url: uploadResult.file_url,
        fileName: fileName
      });
    }

    if (action === 'upload') {
      // Upload a file to Google Drive
      if (!fileData || !fileName) {
        return Response.json({ error: 'fileData and fileName required' }, { status: 400 });
      }
      
      // Create file metadata
      const metadata = {
        name: fileName,
        mimeType: mimeType || 'application/octet-stream'
      };
      
      // Convert base64 to binary
      const base64Data = fileData.split(',')[1] || fileData;
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Create multipart upload
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;
      
      const metadataPart = delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata);
      
      const dataPart = delimiter +
        `Content-Type: ${mimeType || 'application/octet-stream'}\r\n` +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        base64Data;
      
      const multipartBody = new TextEncoder().encode(metadataPart + dataPart + closeDelimiter);
      
      const uploadResponse = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body: multipartBody
        }
      );
      
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload to Drive: ${await uploadResponse.text()}`);
      }
      
      const driveFile = await uploadResponse.json();
      
      return Response.json({ 
        driveFileId: driveFile.id,
        fileName: driveFile.name,
        success: true
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Google Drive operation error:', error);
    return Response.json({ 
      error: error.message || 'Failed to perform Google Drive operation' 
    }, { status: 500 });
  }
});