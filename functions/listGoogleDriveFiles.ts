import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Google Drive access token from connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googledrive');

    // List files from Google Drive
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=50&fields=files(id,name,mimeType,size,modifiedTime)&q=' + 
      encodeURIComponent("(mimeType='application/pdf' or mimeType='text/csv' or mimeType='image/png' or mimeType='image/jpeg' or mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.google-apps.document') and trashed=false"),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API error: ${error}`);
    }

    const data = await response.json();

    return Response.json({
      files: data.files || [],
      accessToken: accessToken // Pass token for subsequent calls
    });

  } catch (error) {
    console.error('List Google Drive files error:', error);
    return Response.json(
      { error: error.message || 'Failed to list Google Drive files' },
      { status: 500 }
    );
  }
});