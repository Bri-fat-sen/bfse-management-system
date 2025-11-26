import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { RtcTokenBuilder, RtcRole } from 'npm:agora-token@2.0.3';

const APP_ID = Deno.env.get("AGORA_APP_ID");
const APP_CERTIFICATE = Deno.env.get("AGORA_APP_CERTIFICATE");

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { channelName, uid } = await req.json();

        if (!channelName) {
            return Response.json({ error: 'Channel name is required' }, { status: 400 });
        }

        if (!APP_ID || !APP_CERTIFICATE) {
            return Response.json({ error: 'Agora credentials not configured' }, { status: 500 });
        }

        // Token expires in 1 hour
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // Use uid or 0 for wildcard
        const uidNum = uid ? parseInt(uid) : 0;

        const token = RtcTokenBuilder.buildTokenWithUid(
            APP_ID,
            APP_CERTIFICATE,
            channelName,
            uidNum,
            RtcRole.PUBLISHER,
            privilegeExpiredTs
        );

        return Response.json({ 
            token, 
            appId: APP_ID,
            channelName,
            uid: uidNum
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});