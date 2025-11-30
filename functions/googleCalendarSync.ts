import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await req.json();
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");

    switch (action) {
      case 'listCalendars':
        return await listCalendars(accessToken);
      
      case 'syncToGoogle':
        return await syncToGoogle(accessToken, data, base44);
      
      case 'syncFromGoogle':
        return await syncFromGoogle(accessToken, data, base44);
      
      case 'deleteFromGoogle':
        return await deleteFromGoogle(accessToken, data);
      
      case 'fullSync':
        return await fullSync(accessToken, data, base44);
      
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Google Calendar Sync Error:', error);
    return Response.json({ 
      error: error.message || 'Sync failed',
      details: error.toString()
    }, { status: 500 });
  }
});

async function listCalendars(accessToken) {
  const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list calendars: ${error}`);
  }
  
  const data = await response.json();
  return Response.json({ 
    success: true, 
    calendars: data.items?.map(c => ({
      id: c.id,
      summary: c.summary,
      primary: c.primary,
      backgroundColor: c.backgroundColor
    })) || []
  });
}

async function syncToGoogle(accessToken, { event, calendarId = 'primary', eventType }, base44) {
  const googleEvent = {
    summary: event.title,
    description: event.description || '',
    start: {},
    end: {},
  };

  // Handle date/time
  if (event.due_time || event.start_time) {
    const startTime = event.start_time || event.due_time || '09:00';
    const endTime = event.end_time || (event.due_time ? addHours(event.due_time, 1) : '10:00');
    const date = event.due_date || event.date;
    
    googleEvent.start = { 
      dateTime: `${date}T${startTime}:00`,
      timeZone: 'Africa/Freetown'
    };
    googleEvent.end = { 
      dateTime: `${date}T${endTime}:00`,
      timeZone: 'Africa/Freetown'
    };
  } else {
    // All-day event
    const date = event.due_date || event.date;
    googleEvent.start = { date };
    googleEvent.end = { date };
  }

  // Add metadata to identify synced events
  googleEvent.extendedProperties = {
    private: {
      sourceApp: 'brifatsen',
      sourceId: event.id,
      sourceType: eventType
    }
  };

  // Color coding based on priority/type
  if (eventType === 'task') {
    const colorMap = { urgent: '11', high: '6', medium: '5', low: '8' };
    googleEvent.colorId = colorMap[event.priority] || '5';
  } else if (eventType === 'meeting') {
    googleEvent.colorId = '9'; // Purple for meetings
    if (event.location) googleEvent.location = event.location;
    if (event.meeting_link) {
      googleEvent.conferenceData = {
        entryPoints: [{ entryPointType: 'video', uri: event.meeting_link }]
      };
    }
  }

  let response;
  let googleEventId = event.google_event_id;

  if (googleEventId) {
    // Update existing event
    response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      }
    );
  } else {
    // Create new event
    response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      }
    );
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to sync to Google: ${error}`);
  }

  const result = await response.json();
  
  // Update local record with Google event ID
  if (!googleEventId && eventType === 'task') {
    await base44.asServiceRole.entities.Task.update(event.id, { 
      google_event_id: result.id 
    });
  }

  return Response.json({ 
    success: true, 
    googleEventId: result.id,
    message: googleEventId ? 'Event updated in Google Calendar' : 'Event created in Google Calendar'
  });
}

async function syncFromGoogle(accessToken, { calendarId = 'primary', timeMin, timeMax, orgId }, base44) {
  const params = new URLSearchParams({
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime'
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch from Google: ${error}`);
  }

  const data = await response.json();
  const events = data.items || [];
  
  // Filter out events that originated from our app
  const externalEvents = events.filter(e => 
    !e.extendedProperties?.private?.sourceApp || 
    e.extendedProperties.private.sourceApp !== 'brifatsen'
  );

  const imported = [];
  
  for (const gEvent of externalEvents) {
    // Check if already imported
    const existing = await base44.asServiceRole.entities.Task.filter({
      organisation_id: orgId,
      google_event_id: gEvent.id
    });

    if (existing.length === 0) {
      // Create new task from Google event
      const date = gEvent.start.date || gEvent.start.dateTime?.split('T')[0];
      const time = gEvent.start.dateTime ? gEvent.start.dateTime.split('T')[1].substring(0, 5) : null;
      
      const task = await base44.asServiceRole.entities.Task.create({
        organisation_id: orgId,
        title: gEvent.summary || 'Untitled Event',
        description: gEvent.description || '',
        due_date: date,
        due_time: time,
        category: 'meeting',
        status: 'pending',
        priority: 'medium',
        google_event_id: gEvent.id
      });
      
      imported.push(task);
    }
  }

  return Response.json({ 
    success: true, 
    imported: imported.length,
    total: externalEvents.length,
    message: `Imported ${imported.length} new events from Google Calendar`
  });
}

async function deleteFromGoogle(accessToken, { googleEventId, calendarId = 'primary' }) {
  if (!googleEventId) {
    return Response.json({ success: true, message: 'No Google event to delete' });
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`,
    {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  // 404 is okay - event might already be deleted
  if (!response.ok && response.status !== 404) {
    const error = await response.text();
    throw new Error(`Failed to delete from Google: ${error}`);
  }

  return Response.json({ success: true, message: 'Event deleted from Google Calendar' });
}

async function fullSync(accessToken, { orgId, calendarId = 'primary', syncSettings }, base44) {
  const results = { 
    exported: 0, 
    imported: 0, 
    errors: [] 
  };

  // Export tasks to Google
  if (syncSettings?.syncTasks) {
    const tasks = await base44.asServiceRole.entities.Task.filter({
      organisation_id: orgId,
      status: { $ne: 'cancelled' }
    });

    for (const task of tasks) {
      // Skip if doesn't match priority filter
      if (syncSettings.taskPriorities?.length > 0 && 
          !syncSettings.taskPriorities.includes(task.priority)) {
        continue;
      }

      try {
        await syncToGoogle(accessToken, { 
          event: task, 
          calendarId, 
          eventType: 'task' 
        }, base44);
        results.exported++;
      } catch (error) {
        results.errors.push({ id: task.id, title: task.title, error: error.message });
      }
    }
  }

  // Export meetings to Google
  if (syncSettings?.syncMeetings) {
    const meetings = await base44.asServiceRole.entities.Meeting.filter({
      organisation_id: orgId,
      status: { $ne: 'cancelled' }
    });

    for (const meeting of meetings) {
      // Skip if doesn't match type filter
      if (syncSettings.meetingTypes?.length > 0 && 
          !syncSettings.meetingTypes.includes(meeting.meeting_type)) {
        continue;
      }

      try {
        await syncToGoogle(accessToken, { 
          event: meeting, 
          calendarId, 
          eventType: 'meeting' 
        }, base44);
        results.exported++;
      } catch (error) {
        results.errors.push({ id: meeting.id, title: meeting.title, error: error.message });
      }
    }
  }

  // Import from Google
  if (syncSettings?.importFromGoogle) {
    try {
      const importResult = await syncFromGoogle(accessToken, { 
        calendarId, 
        orgId 
      }, base44);
      const importData = await importResult.json();
      results.imported = importData.imported;
    } catch (error) {
      results.errors.push({ type: 'import', error: error.message });
    }
  }

  return Response.json({
    success: true,
    results,
    message: `Synced ${results.exported} events to Google, imported ${results.imported} from Google`
  });
}

function addHours(time, hours) {
  const [h, m] = time.split(':').map(Number);
  const newH = (h + hours) % 24;
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}