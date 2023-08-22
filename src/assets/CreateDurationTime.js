function CreateDurationTime (day) {
  const startTime = new Date()
  const endTime = new Date()
  startTime.setHours(day.StartTime.Hours)
  startTime.setMinutes(day.StartTime.Minutes)
  endTime.setHours(day.EndTime.Hours)
  endTime.setMinutes(day.EndTime.Minutes)
  const hourDifference = (endTime - startTime)
  return hourDifference / 60 / 1000
}

export default CreateDurationTime
