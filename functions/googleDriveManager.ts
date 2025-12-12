import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, folderId, fileName, fileContent, mimeType, query } = await req.json();

    // Use service account key only
    const serviceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
      
      if (!serviceAccountKey) {
        return Response.json({ 
          error: 'Google Drive not connected. Please authorize Google Drive or set GOOGLE_SERVICE_ACCOUNT_KEY secret.' 
        }, { status: 403 });
      }

      // Parse service account JSON
      const credentials = JSON.parse(serviceAccountKey);

      // Generate JWT for service account authentication
      const header = { alg: 'RS256', typ: 'JWT' };
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: credentials.client_email,
        scope: 'https://www.googleapis.com/auth/drive',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
      };

      // Import crypto key
      const privateKey = credentials.private_key;
      const pemHeader = '-----BEGIN PRIVATE KEY-----';
      const pemFooter = '-----END PRIVATE KEY-----';
      const pemContents = privateKey.substring(
        pemHeader.length,
        privateKey.length - pemFooter.length
      ).trim();
      const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );

      // Create JWT
      const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
      const unsignedToken = `${encodedHeader}.${encodedPayload}`;

      const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        new TextEncoder().encode(unsignedToken)
      );

      const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const jwt = `${unsignedToken}.${encodedSignature}`;

      // Exchange JWT for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        return Response.json({ 
          error: 'Failed to get access token',
          details: tokenData.error_description || 'Invalid service account key'
        }, { status: 500 });
      }

      accessToken = tokenData.access_token;
    }

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
        // List files - OAuth shows user's files, service account shows limited access
        let q;
        if (folderId) {
          q = `'${folderId}' in parents and trashed=false`;
        } else if (query) {
          q = query;
        } else {
          // Root level query
          q = `trashed=false`;
        }
        
        console.log('Drive query:', q);
        console.log('Using OAuth:', usingOAuth);
        
        // Build URL - only add shared drive params when using OAuth
        const params = new URLSearchParams({
          q: q,
          fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink,createdTime,owners,shared)',
          orderBy: 'modifiedTime desc',
          pageSize: '1000'
        });
        
        if (usingOAuth) {
          params.append('supportsAllDrives', 'true');
          params.append('includeItemsFromAllDrives', 'true');
        }
        
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
        console.log(`Found ${data.files?.length || 0} files (OAuth: ${usingOAuth})`);
        
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