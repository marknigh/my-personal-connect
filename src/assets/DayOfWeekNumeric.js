function DayOfWeekNumeric (day) {
  let dow
  switch (day.Day) {
    case 'SUNDAY':
      dow = 0
      break
    case 'MONDAY':
      dow = 1
      break
    case 'TUESDAY':
      dow = 2
      break
    case 'WEDNESDAY':
      dow = 3
      break
    case 'THURSDAY':
      dow = 4
      break
    case 'FRIDAY':
      dow = 5
      break
    case 'SATURDAY':
      dow = 6
      break
    default:
      break
  }

  return dow
}
export default DayOfWeekNumeric
