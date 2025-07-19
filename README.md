# Gemini AI Backend
## BACK END DESCRIPTION GOES HERE ##

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