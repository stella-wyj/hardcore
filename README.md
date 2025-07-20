# CourseFlow - Syllabus Analyzer with OCR

A comprehensive academic syllabus analysis tool that uses OCR (Optical Character Recognition) technology to extract and organize information from PDF syllabi, including scanned documents.

## Features

- **OCR Technology**: Uses Tesseract.js and Poppler for advanced PDF text extraction
- **AI Analysis**: Leverages Google Gemini AI to intelligently parse syllabus information
- **Grade Tracking**: Complete grade calculator with assessment management
- **Calendar Integration**: Google Calendar integration for scheduling
- **Modern UI**: Clean, responsive web interface

## OCR Technology Stack

- **Tesseract.js**: JavaScript OCR engine for text recognition
- **Poppler**: PDF to image conversion utilities
- **Sharp**: Image processing and enhancement for better OCR accuracy
- **Google Gemini AI**: Intelligent text analysis and information extraction

## Prerequisites

Before running this application, you need to install Poppler utilities:

### macOS
```bash
brew install poppler
```

### Ubuntu/Debian
```bash
sudo apt-get install poppler-utils
```

### Windows
Download from: https://github.com/oschwartz10612/poppler-windows/releases

See `install-poppler.md` for detailed installation instructions.

## How OCR Works

1. **PDF Conversion**: Poppler converts PDF pages to high-quality PNG images (300 DPI)
2. **Image Enhancement**: Sharp processes images for optimal OCR accuracy
3. **Text Recognition**: Tesseract.js performs OCR on each page
4. **AI Analysis**: Gemini AI extracts and organizes syllabus information
5. **Data Storage**: Information is stored in the database for grade tracking

# GradeCalc Backend
## Deploying on Vercel

1. Push this repo to GitHub.
2. Import your repo at https://vercel.com/import.
3. Vercel will auto-deploy:
   - `/public/mock-frontend.html` at your root URL
   - `/api/*.js` as serverless API endpoints

## API Endpoints

- `POST /courses` – Create a new course
- `GET /courses` – List all courses
- `GET /courses/:id` – Get course details
- `PUT /courses/:id` – Update course info
- `DELETE /courses/:id` – Delete a course
- `POST /courses/:id/assessments` – Add assessment(s)
- `PUT /courses/:id/assessments/:aid` – Update assessment
- `DELETE /courses/:id/assessments/:aid` – Remove assessment
- `POST /courses/:id/assessments/:aid/grade` – Add/update grade
- `GET /courses/:id/grade-summary` – Get current grade and required average for goal 


# Front End
## FRONT END DESCRIPTION GOES HERE ##