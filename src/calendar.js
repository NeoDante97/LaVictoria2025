export function renderMonthCalendar(month, isAdmin, dayCheckState) {
  const daysInMonth = new Date(2025, getMonthIndex(month) + 1, 0).getDate();
  const firstDayOfMonth = new Date(2025, getMonthIndex(month), 1).getDay(); // 0 (Sunday) to 6 (Saturday)
  const monthIndex = getMonthIndex(month);
  let calendarHTML = `<table class="calendar-table"><thead><tr>`;
  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  daysOfWeek.forEach(day => {
    calendarHTML += `<th>${day}</th>`;
  });
  calendarHTML += '</tr></thead><tbody>';

  let dayCounter = 1;
  for (let i = 0; i < 6; i++) { // Up to 6 weeks in a month
    calendarHTML += '<tr>';
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfMonth) {
        // Empty cells before the first day of the month
        calendarHTML += '<td></td>';
      } else if (dayCounter <= daysInMonth) {
        // Actual days of the month
        const dayKey = `${month}-${dayCounter}`;
        const isChecked = dayCheckState[dayKey] || false; // Retrieve check state
        const isToday = isTodayDate(2025, monthIndex, dayCounter);
        const todayClass = isToday ? ' today' : '';

        calendarHTML += `<td><div class="day-cell${todayClass}" data-day="${dayCounter}" data-month="${month}">`;
        calendarHTML += dayCounter;
        if (isAdmin) {
          calendarHTML += `<div class="checkbox-container"><input type="checkbox" id="${month}-day-${dayCounter}" style="transform: scale(1.5);" ${isChecked ? 'checked' : ''} ></div>`;
        } else {
          if (isChecked) {
            calendarHTML += `<span class="checked-indicator">✓</span>`; // Display checkmark for visitor view
          }
        }
        calendarHTML += `</div></td>`;
        dayCounter++;
      } else {
        // Empty cells after the last day of the month
        calendarHTML += '<td></td>';
      }
    }
    calendarHTML += '</tr>';
    if (dayCounter > daysInMonth) {
      break; // Stop creating rows if all days are rendered
    }
  }

  calendarHTML += '</tbody></table>';

  return calendarHTML;
}

function getMonthIndex(month) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre',
    'Noviembre', 'Diciembre'
  ];
  return months.indexOf(month);
}

function isTodayDate(year, month, day) {
  const today = new Date();
  return today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day;
}