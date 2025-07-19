
module.exports = (req, res) => {
  const { id } = req.query;
  const course = db.courses.find((c) => c.id === id);

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const { goalGrade, assessments } = course;

  if (goalGrade === null || goalGrade === undefined) {
    return res.status(400).json({ error: 'Goal grade not set for this course' });
  }

  // Separate graded and ungraded assessments
  const gradedAssessments = assessments.filter(a => a.grade !== null && a.grade !== undefined);
  const ungradedAssessments = assessments.filter(a => a.grade === null || a.grade === undefined);

  if (ungradedAssessments.length === 0) {
    return res.status(400).json({ error: 'No ungraded assessments found' });
  }

  // Calculate weighted grade for already graded assessments
  const gradedWeight = gradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);
  const gradedScore = gradedAssessments.reduce((sum, a) => sum + ((a.grade || 0) * (a.weight || 0)), 0);

  // Total weight of all assessments
  const totalWeight = assessments.reduce((sum, a) => sum + (a.weight || 0), 0);

  // Current grade (weighted average)
  const currentGrade = gradedWeight > 0 ? (gradedScore / gradedWeight) : 0;

  // Calculate remaining weight (sum of weights of ungraded assessments)
  const remainingWeight = ungradedAssessments.reduce((sum, a) => sum + (a.weight || 0), 0);

  // Calculate the required score to reach the goal grade
  const requiredScore = goalGrade * totalWeight - gradedScore;

  // If the required score is less than or equal to the graded score, no future grades are needed
  if (requiredScore <= gradedScore) {
    return res.json({
      message: 'You have already reached or exceeded your goal grade!',
      currentGrade,
      remainingWeight: 0,
      requiredGrades: []
    });
  }

  // Calculate the average grade needed on future assessments
  const averageGradeNeeded = remainingWeight > 0 ? requiredScore / remainingWeight : 0;

  // Check if it’s even possible to reach the goal grade
  if (averageGradeNeeded > 100) {
    return res.status(400).json({
      error: 'It is not possible to reach your goal grade with the remaining assessments.'
    });
  }

  // Distribute the required grade evenly across all ungraded assessments
  const requiredGrades = ungradedAssessments.map(a => ({
    assessmentId: a.id,
    title: a.title,
    requiredGrade: averageGradeNeeded
  }));

  res.json({
    message: 'Future grade requirements calculated.',
    currentGrade,
    remainingWeight,
    requiredGrades
  });
};
