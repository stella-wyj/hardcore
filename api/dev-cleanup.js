import fs from 'fs';
import { CLEAR_DATA_ON_START, DEBUG_MODE } from './dev-config.js';

// Development cleanup - only clear data when server is completely stopped
let isShuttingDown = false;

// Only clear data when the process is forcefully terminated (Ctrl+C twice or kill)
process.on('SIGINT', () => {
  if (isShuttingDown) {
    // Second SIGINT - clear data and exit
    if (DEBUG_MODE) {
      console.log('\n🧹 Development mode: Clearing data on force exit...');
    }
    
    try {
      if (fs.existsSync('database.json')) {
        const emptyDatabase = {
          courses: [],
          assessments: [],
          nextCourseId: 1,
          nextAssessmentId: 1
        };
        fs.writeFileSync('database.json', JSON.stringify(emptyDatabase, null, 2));
        if (DEBUG_MODE) {
          console.log('🗑️ Cleared database.json file');
        }
      }
    } catch (error) {
      console.error('Error clearing database file:', error);
    }
    
    if (DEBUG_MODE) {
      console.log('✅ Cleanup complete. Exiting...');
    }
    process.exit(0);
  } else {
    // First SIGINT - just exit without clearing data
    isShuttingDown = true;
    if (DEBUG_MODE) {
      console.log('\n🛑 Server stopping (press Ctrl+C again to clear data)...');
    }
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  // SIGTERM - exit without clearing data (graceful shutdown)
  if (DEBUG_MODE) {
    console.log('\n🛑 Server stopping gracefully...');
  }
  process.exit(0);
}); 