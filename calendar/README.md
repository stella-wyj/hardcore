# 📅 Google Calendar Integration for Schedulize

This module provides Google Calendar integration for the Schedulize student management system, allowing you to sync course schedules, assessment deadlines, and office hours with your Google Calendar.

## 🚀 Features

- **Course Schedule Sync**: Automatically add course sessions to Google Calendar
- **Assessment Deadlines**: Sync all assignment due dates, quiz dates, and exam schedules
- **Office Hours**: Include professor office hours in calendar events
- **Color Coding**: Each course gets its own color in Google Calendar
- **Smart Reminders**: Automatic reminders for upcoming deadlines
- **Bidirectional Sync**: View upcoming events from Google Calendar in the app

## 🔧 Setup Instructions

### 1. Google Cloud Project Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create Credentials

#### API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API Key
4. (Optional) Restrict the API key to Google Calendar API for security

#### OAuth 2.0 Client ID
1. In the same Credentials page, click "Create Credentials" > "OAuth 2.0 Client IDs"
2. Set application type to "Web application"
3. Add authorized JavaScript origins:
   - `http://localhost:3001` (for development)
   - `https://yourdomain.com` (for production)
4. Copy the generated Client ID

### 3. Integration with Your App

#### Option 1: Use the Example Page
1. Open `calendar-integration-example.html` in your browser
2. Enter your API Key and Client ID
3. Click "Initialize Google Calendar"
4. Use the sync buttons to test functionality

#### Option 2: Integrate with Existing Frontend
```javascript
// Include the Google Calendar manager
<script src="calendar/googleCalendar.js"></script>

// Initialize the manager
const calendarManager = new GoogleCalendarManager();
await calendarManager.initialize('YOUR_API_KEY', 'YOUR_CLIENT_ID');

// Sync all courses
await calendarManager.syncAllCourses();
```

## 📋 API Reference

### GoogleCalendarManager Class

#### Constructor
```javascript
const manager = new GoogleCalendarManager();
```

#### Methods

##### `initialize(apiKey, clientId)`
Initialize the Google Calendar integration.
```javascript
await manager.initialize('your-api-key', 'your-client-id');
```

##### `authenticate()`
Authenticate the user with Google OAuth.
```javascript
await manager.authenticate();
```

##### `addCourseEvents(courseData)`
Add all events for a specific course to Google Calendar.
```javascript
const courseData = {
    name: "CS101",
    color: "#4285f4",
    schedule: [...],
    assessments: [...]
};
await manager.addCourseEvents(courseData);
```

##### `syncAllCourses(apiBaseUrl)`
Sync all courses from your backend to Google Calendar.
```javascript
await manager.syncAllCourses('http://localhost:3001');
```

##### `getUpcomingEvents(maxResults)`
Get upcoming events from Google Calendar.
```javascript
const events = await manager.getUpcomingEvents(10);
```

##### `deleteCourseEvents(courseName)`
Delete all events for a specific course.
```javascript
await manager.deleteCourseEvents("CS101");
```

## 🎨 Event Format

The integration creates Google Calendar events with the following structure:

### Course Sessions
- **Summary**: `{Course Name} - {Session Type}`
- **Description**: Course name and session type
- **Reminders**: 15 minutes before

### Assessments
- **Summary**: `{Course Name} - {Assessment Name}`
- **Description**: Course name, assessment details, weight, type
- **Reminders**: 1 day and 2 hours before
- **Duration**: 1 hour (configurable)

## 🔒 Security Considerations

1. **API Key Restrictions**: Restrict your API key to only the Google Calendar API
2. **OAuth Scopes**: The integration only requests calendar events permission
3. **Client-Side Storage**: Credentials are not stored permanently
4. **HTTPS**: Use HTTPS in production for secure OAuth flow

## 🐛 Troubleshooting

### Common Issues

1. **"Google APIs not initialized"**
   - Make sure you've called `initialize()` before other methods
   - Check that your API Key and Client ID are correct

2. **"Access denied" errors**
   - Verify your OAuth 2.0 Client ID is configured correctly
   - Check that your domain is in the authorized origins

3. **Events not appearing**
   - Check browser console for errors
   - Verify the course data format matches expected structure
   - Ensure assessment due dates are in ISO format

### Debug Mode
Enable debug logging by opening browser console and looking for detailed error messages.

## 🔄 Integration with Schedulize Features

This Google Calendar integration works seamlessly with the full Schedulize feature set:

- **Syllabus Upload**: Automatically creates calendar events from parsed syllabus data
- **Grade Calculator**: Assessment events include weight information
- **Gemini Assistant**: AI can suggest calendar management based on upcoming events
- **Color Coding**: Each course maintains its color across all views
- **Office Hours**: Professor office hours are included in calendar events

## 📝 Example Usage

```javascript
// Complete integration example
async function setupCalendarIntegration() {
    const manager = new GoogleCalendarManager();
    
    try {
        // Initialize with your credentials
        await manager.initialize('YOUR_API_KEY', 'YOUR_CLIENT_ID');
        
        // Sync all existing courses
        const results = await manager.syncAllCourses();
        console.log(`Synced ${results.length} courses`);
        
        // Get upcoming events
        const events = await manager.getUpcomingEvents(5);
        console.log('Upcoming events:', events);
        
    } catch (error) {
        console.error('Calendar integration error:', error);
    }
}
```

## 🤝 Contributing

To extend this integration:

1. Add new event types in `createEventsFromCourse()`
2. Implement additional calendar operations as needed
3. Add support for recurring events
4. Implement two-way sync for real-time updates

## 📄 License

This integration is part of the Schedulize project and follows the same license terms. 