import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileData, fileName, mimeType } = await req.json();

    // Get Google Drive access token from connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    if (!accessToken) {
      return Response.json({ 
        error: 'Google Drive not connected. Please authorize Google Drive access.' 
      }, { status: 403 });
    }

    // Convert base64 to blob if needed
    let fileContent;
    if (fileData.startsWith('data:')) {
      const base64Data = fileData.split(',')[1];
      fileContent = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } else {
      fileContent = new TextEncoder().encode(fileData);
    }

    // Create metadata for the file
    const metadata = {
      name: fileName,
      mimeType: mimeType || 'application/pdf'
    };

    // Create multipart form data
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const metadataPart = delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata);

    const dataPart = delimiter +
      `Content-Type: ${mimeType || 'application/pdf'}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      btoa(String.fromCharCode(...fileContent));

    const multipartBody = new TextEncoder().encode(metadataPart + dataPart + closeDelim);

    // Upload to Google Drive
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
      const errorText = await uploadResponse.text();
      console.error('Drive upload error:', errorText);
      return Response.json({ 
        error: 'Failed to upload to Google Drive',
        details: errorText 
      }, { status: uploadResponse.status });
    }

    const result = await uploadResponse.json();

    return Response.json({
      success: true,
      fileId: result.id,
      fileName: result.name,
      webViewLink: `https://drive.google.com/file/d/${result.id}/view`
    });

  } catch (error) {
    console.error('Save to Drive error:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
});