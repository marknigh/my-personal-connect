function CreateTimeString (day) {
  const stringHours = day.StartTime.Hours < 10 ? '0' + day.StartTime.Hours + ':' : day.StartTime.Hours + ':'
  const stringMinutes = day.StartTime.Minutes < 10 ? '0' + day.StartTime.Minutes : day.StartTime.Minutes
  return stringHours + stringMinutes
}

export default CreateTimeString
