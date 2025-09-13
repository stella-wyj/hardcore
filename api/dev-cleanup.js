import fs from 'fs';
import path from 'path';
import { CLEAR_DATA_ON_START, DEBUG_MODE } from './dev-config.js';

// Development cleanup - clear data when server starts and when it exits
let isShuttingDown = false;

// Function to clear the database
function clearDatabase() {
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
}

// Function to clear uploaded files
function clearUploads() {
  try {
    const uploadsDir = 'uploads';
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          if (DEBUG_MODE) {
            console.log(`🗑️ Deleted uploaded file: ${file}`);
          }
        }
      });
      if (DEBUG_MODE && files.length > 0) {
        console.log(`🗑️ Cleared ${files.length} uploaded files`);
      }
    }
  } catch (error) {
    console.error('Error clearing uploaded files:', error);
  }
}

// Function to perform complete cleanup
function performCleanup() {
  clearDatabase();
  clearUploads();
}

// Clear data on server start if configured
if (CLEAR_DATA_ON_START) {
  if (DEBUG_MODE) {
    console.log('🧹 Development mode: Clearing data on server start...');
  }
  performCleanup();
}

// Clear data when the process is terminated (Ctrl+C or kill)
process.on('SIGINT', () => {
  if (isShuttingDown) {
    // Second SIGINT - clear data and exit
    if (DEBUG_MODE) {
      console.log('\n🧹 Development mode: Clearing data on force exit...');
    }
    performCleanup();
    if (DEBUG_MODE) {
      console.log('✅ Cleanup complete. Exiting...');
    }
    process.exit(0);
  } else {
    // First SIGINT - clear data and exit
    isShuttingDown = true;
    if (DEBUG_MODE) {
      console.log('\n🧹 Development mode: Clearing data on exit...');
    }
    performCleanup();
    if (DEBUG_MODE) {
      console.log('✅ Cleanup complete. Exiting...');
    }
    process.exit(0);
  }
});

process.on('SIGTERM', () => {
  // SIGTERM - clear data and exit
  if (DEBUG_MODE) {
    console.log('\n🧹 Development mode: Clearing data on graceful shutdown...');
  }
  performCleanup();
  if (DEBUG_MODE) {
    console.log('✅ Cleanup complete. Exiting...');
  }
  process.exit(0);
});

// Also clear data on uncaught exceptions
process.on('uncaughtException', (error) => {
  if (DEBUG_MODE) {
    console.log('\n🧹 Development mode: Clearing data due to uncaught exception...');
  }
  performCleanup();
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  if (DEBUG_MODE) {
    console.log('\n🧹 Development mode: Clearing data due to unhandled rejection...');
  }
  performCleanup();
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 