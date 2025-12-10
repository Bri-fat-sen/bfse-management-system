import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId, fileName, mimeType } = await req.json();

    if (!fileId || !fileName) {
      return Response.json({ error: 'Missing fileId or fileName' }, { status: 400 });
    }

    // Get Google Drive access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    let exportMimeType = null;

    // Handle Google Docs/Sheets - need to export them
    if (mimeType === 'application/vnd.google-apps.spreadsheet') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
      exportMimeType = 'text/csv';
    } else if (mimeType === 'application/vnd.google-apps.document') {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
      exportMimeType = 'application/pdf';
    }

    // Download file from Google Drive
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to download from Google Drive: ${error}`);
    }

    // Get file content as blob
    const blob = await response.blob();
    
    // Convert to File object
    const finalFileName = exportMimeType 
      ? fileName.replace(/\.[^/.]+$/, '') + (exportMimeType === 'text/csv' ? '.csv' : '.pdf')
      : fileName;

    const file = new File([blob], finalFileName, { 
      type: exportMimeType || mimeType 
    });

    // Upload to Base44
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ 
      file: file 
    });

    return Response.json({
      file_url: uploadResult.file_url,
      fileName: finalFileName,
      mimeType: exportMimeType || mimeType
    });

  } catch (error) {
    console.error('Download Google Drive file error:', error);
    return Response.json(
      { error: error.message || 'Failed to download file from Google Drive' },
      { status: 500 }
    );
  }
});