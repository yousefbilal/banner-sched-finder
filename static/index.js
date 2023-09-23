let subjects
let courses
let schedules
const fillSubjects = async (subjects, element) => {
  try {
    if (!subjects) {
      element.parentNode.remove()
      throw new Error('Too fast!')
    }
    subjects.forEach((subject) => {
      const option = document.createElement('option')
      option.value = subject.subject
      option.innerText = subject.subject
      element.appendChild(option)
    })
  } catch (e) {
    console.log(e.message)
    const alertBox = document.getElementById('alertBox')
    alertBox.innerHTML = e.message
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  }
}
const fillCodes = async (courses, element) => {
  try {
    if (!courses) {
      element.parentNode.remove()
      throw new Error('Too fast!')
    }
    //reset options
    element.innerHTML = ''
    //get selected subject
    const subject = element.parentNode.querySelector('.subject').value
    const coursesWithSubject = courses.filter((course) => {
      return course.subject === subject
    })
    const uniqueCoursesWithSubject = coursesWithSubject.filter(
      (course, index, self) =>
        index === self.findIndex((c) => c.code === course.code)
    ) //filter out duplicates
    uniqueCoursesWithSubject.forEach((course) => {
      const option = document.createElement('option')
      option.value = course.code
      option.innerHTML = course.code
      element.appendChild(option)
    })
  } catch (e) {
    console.log(e.message)
    const alertBox = document.getElementById('alertBox')
    alertBox.innerHTML = e.message
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  }
}
const subjectsElements = document.querySelectorAll('.subject')
subjectsElements.forEach((element) => {
  element.addEventListener('change', (e) => {
    e.stopPropagation()
    fillCodes(courses, e.target.parentNode.querySelector('.code'))
  })
})
const initalDisplayOfCourses = async () => {
  try {
    const response = await fetch('/getCourses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    subjects = data.subjects
    courses = data.courses
    const dropdown = document.querySelector('.subject')
    fillSubjects(subjects, dropdown)
    fillCodes(courses, document.querySelector('.code'))
  } catch (e) {
    console.log(e.message)
    const alertBox = document.getElementById('alertBox')
    alertBox.innerHTML = e.message
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  }
}
document.addEventListener('DOMContentLoaded', initalDisplayOfCourses)
// ------------------------------
const addEntry = (e) => {
  const entry = document.createElement('div')
  entry.className = 'entry'
  const dropdownlabel = document.createElement('label')
  // dropdownlabel.setAttribute('for', 'subject')
  dropdownlabel.innerHTML = 'Subject'
  dropdownlabel.classList.add('formLabel')
  const dropdownselect = document.createElement('select')
  dropdownselect.setAttribute('name', 'subject')
  dropdownselect.classList.add('input')
  dropdownselect.classList.add('subject')
  dropdownselect.setAttribute('required', 'true')
  const dropdownlabelTwo = document.createElement('label')
  // dropdownlabelTwo.setAttribute('for', 'code')
  dropdownlabelTwo.innerHTML = 'Code'
  dropdownlabelTwo.classList.add('formLabel')
  const dropdownselectTwo = document.createElement('select')
  dropdownselectTwo.setAttribute('name', 'code')
  dropdownselectTwo.classList.add('input')
  dropdownselectTwo.classList.add('code')
  dropdownselectTwo.setAttribute('required', 'true')
  const deleteButton = document.createElement('input')
  deleteButton.setAttribute('type', 'button')
  deleteButton.setAttribute('value', 'x')
  deleteButton.classList.add('inputBtn')
  deleteButton.classList.add('deleteBtn')
  deleteButton.onclick = (event) => {
    deleteEntry(event)
  }
  entry.appendChild(dropdownlabel)
  entry.appendChild(dropdownselect)

  entry.appendChild(dropdownlabelTwo)
  entry.appendChild(dropdownselectTwo)
  entry.appendChild(deleteButton)
  const entries = document.getElementById('entries')
  entries.appendChild(entry)
  dropdownselect.addEventListener('change', (e) => {
    e.stopPropagation()
    fillCodes(courses, e.target.parentNode.querySelector('.code'))
  })
  fillSubjects(subjects, dropdownselect)
  fillCodes(courses, dropdownselectTwo)
  //   dropdownselect.addEventListener('change', (e) => {
  //     e.stopPropagation()
  //     fillCodes(courses, e.target.parentNode.querySelector('.code'))
  //   })
}
const deleteEntry = (e) => {
  const entry = e.target.parentNode
  entry.remove()
}
const generateSchedule = async (e) => {
  try {
    e.preventDefault()
    const submitBtn = document.getElementById('submitBtn')
    submitBtn.disabled = true
    const alertBox = document.getElementById('alertBox')
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    alertBox.innerHTML = 'Generating Schedules...'
    const selectedCourses = document.querySelectorAll('.entry')
    const selectedCoursesArray = []
    selectedCourses.forEach((course) => {
      const subject = course.querySelector('.subject').value
      const code = course.querySelector('.code').value
      if (
        selectedCoursesArray.find(
          (c) => c.code === code && c.subject === subject
        )
      ) {
        throw new Error('Please remove duplicate courses')
      }
      selectedCoursesArray.push({ subject, code })
    })

    if (selectedCoursesArray.length === 0) {
      throw new Error('Please add at least one course')
    }
    const response = await fetch('/generateSchedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ selectedCoursesArray }),
    })
    const data = await response.json()
    // console.log(data)
    // if (data.status != '200') {
    //   throw new Error(data.message)
    // }
    const schedules = data.schedules
    if (!schedules || schedules.length === 0) {
      throw new Error('No schedules found')
    }
    var zip = new JSZip()
    // add the base 64 images to the zip
    schedules.forEach((schedule, index) => {
      zip.file(`schedule${index + 1}.png`, schedule, {
        base64: true,
      })
    })
    // generate the zip file
    zip.generateAsync({ type: 'blob' }).then(function (content) {
      var blob = new Blob([content], { type: 'application/zip' })
      var link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = 'schedules.zip'
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
    })

    alertBox.innerHTML = 'Schedule(s) generated'
    submitBtn.disabled = false

    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  } catch (e) {
    console.log(e.message)
    const submitBtn = document.getElementById('submitBtn')
    submitBtn.disabled = false
    const alertBox = document.getElementById('alertBox')
    alertBox.innerHTML = e.message
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  }
}
const colors = [
  '#FF6B6B', // Red
  '#7D3C98', // Purple
  '#F9A825', // Yellow
  '#1E90FF', // Blue
  '#00B894', // Green
  '#D63031', // Dark Red
  '#6F1E51', // Dark Purple
  '#FBC02D', // Amber
  '#3498DB', // Dark Blue
  '#00A86B', // Dark Green
  '#E74C3C', // Light Red
  '#8E44AD', // Light Purple
  '#FDD835', // Light Yellow
  '#2980B9', // Light Blue
  '#27AE60', // Light Green
]
const generateScheduleDOM = async (e) => {
  e.preventDefault()
  // const submitBtn = document.getElementById('submitBtn')
  // submitBtn.disabled = true

  const alertBox = document.getElementById('alertBox')
  alertBox.style.backgroundColor = '#ccc'
  alertBox.style.color = '#1a1a1a'
  alertBox.style.display = 'block'
  alertBox.innerHTML = 'Generating Schedules...'
  const selectedCourses = document.querySelectorAll('.entry')
  const selectedCoursesArray = []
  selectedCourses.forEach((course) => {
    const subject = course.querySelector('.subject').value
    const code = course.querySelector('.code').value
    if (
      selectedCoursesArray.find((c) => c.code === code && c.subject === subject)
    ) {
      throw new Error('Please remove duplicate courses')
    }
    selectedCoursesArray.push({ subject, code })
  })

  if (selectedCoursesArray.length === 0) {
    throw new Error('Please add at least one course')
  }
  const response = await fetch('/generateScheduleDOM', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selectedCoursesArray }),
  })
  const data = await response.json()
  schedules = data.schedules
  if (!schedules || schedules.length === 0) {
    throw new Error('No schedules found')
  }
  const schedulediv = document.getElementById('schedule-body')
  schedulediv.innerHTML = ''
  // add first schedule
  const timeItems = document.querySelectorAll('.schedule-time-item')
  timeItems.forEach((timeItem) => {
    timeItem.style.visibility = 'hidden'
  })
  let colorCount = 0
  schedules[0].courses_list.forEach((scheduleEntry) => {
    createScheduleEntry(scheduleEntry, scheduleEntry.days.length, colorCount++)
  })
  const formContainer = document.getElementById('form-container')
  formContainer.style.display = 'none'
  alertBox.innerHTML = 'Schedule(s) generated'
  const scheduleContainer = document.getElementById('schedule-container')
  scheduleContainer.style.visibility = 'visible'
  const scheduleTotalHeader = document.getElementById('schedule-total-header')
  scheduleTotalHeader.style.display = 'flex'
  scheduleTotalHeader.innerHTML =
    '<input type="button" value="x" class="inputBtn backToFormBtn" onclick="backToForm()"/> <i class="fa-solid fa-arrow-left" onclick ="goPreviousSchedule()"></i> ' +
    ' <span class="schedule-total-span" id="schedule-total-span"> 1 of ' +
    schedules.length +
    ' </span><i class="fa-solid fa-arrow-right" onclick="goNextSchedule()"></i>'
  // submitBtn.disabled = false
  setTimeout(() => {
    alertBox.innerHTML = ''
    alertBox.style.display = 'none'
  }, 5000)
}
const createScheduleEntry = (entry, count, color) => {
  for (let i = 0; i < count; i++) {
    const scheduleEntry = document.createElement('div')
    scheduleEntry.className = 'schedule-entry'
    scheduleEntry.style.display = 'none'
    scheduleEntry.style.backgroundColor = colors[color]
    const scheduleEntryInfo = document.createElement('div')
    scheduleEntryInfo.className = 'schedule-entry-info'
    scheduleEntryInfo.setAttribute('data-day', entry.days[i])
    const startTime = new Date(entry.time[0])
    const endTime = new Date(entry.time[1])
    let startTimeFormatted =
      startTime.getUTCHours() + ':' + startTime.getUTCMinutes()
    let endTimeFormatted = endTime.getUTCHours() + ':' + endTime.getUTCMinutes()
    if (startTime.getUTCMinutes() === 0) {
      startTimeFormatted = startTimeFormatted + '0'
    }
    if (endTime.getUTCMinutes() === 0) {
      endTimeFormatted = endTimeFormatted + '0'
    }
    scheduleEntryInfo.setAttribute('data-start-time', startTimeFormatted)
    scheduleEntryInfo.setAttribute('data-end-time', endTimeFormatted)
    const scheduleEntryInfoSubject = document.createElement('h1')
    scheduleEntryInfoSubject.className = 'schedule-name'
    scheduleEntryInfoSubject.innerHTML = entry.course_code + ' ' + entry.section
    const scheduleEntryInfoCode = document.createElement('h1')
    scheduleEntryInfoCode.className = 'schedule-crn'
    scheduleEntryInfoCode.innerHTML = entry.crn
    const scheduleEntryInfoInstructor = document.createElement('h1')
    scheduleEntryInfoInstructor.className = 'schedule-professor'
    scheduleEntryInfoInstructor.innerHTML = entry.instructor
    const scheduleEntryInfoTime = document.createElement('h1')
    scheduleEntryInfoTime.className = 'schedule-time'
    scheduleEntryInfoTime.innerHTML =
      startTimeFormatted + ' - ' + endTimeFormatted
    scheduleEntryInfo.appendChild(scheduleEntryInfoSubject)
    scheduleEntryInfo.appendChild(scheduleEntryInfoCode)
    scheduleEntryInfo.appendChild(scheduleEntryInfoInstructor)
    scheduleEntryInfo.appendChild(scheduleEntryInfoTime)
    scheduleEntry.appendChild(scheduleEntryInfo)
    positionScheduleEntry(scheduleEntry)
    if (scheduleEntry.scrollHeight > scheduleEntry.clientHeight) {
      const instructorArray = entry.instructor.split(' ')
      scheduleEntryInfoInstructor.innerHTML =
        instructorArray[0] + ' ' + instructorArray[instructorArray.length - 1]
    }
  }
}
// schedule
const positionScheduleEntry = (element) => {
  try {
    const scheduleEntry = element
    const startTime = scheduleEntry
      .querySelector('.schedule-entry-info')
      .getAttribute('data-start-time')
    const endTime = scheduleEntry
      .querySelector('.schedule-entry-info')
      .getAttribute('data-end-time')
    let day = scheduleEntry
      .querySelector('.schedule-entry-info')
      .getAttribute('data-day')
    // position the schedule entry (y axis)
    let scheduleEntryTopElement = document.querySelector(
      '.schedule-time-item[data-time="' + startTime + '"]'
    )
    let scheduleEntryBottomElement = document.querySelector(
      '.schedule-time-item[data-time="' + endTime + '"]'
    )
    let startMinutes = 0
    let endMinutes = 0
    if (scheduleEntryTopElement == null) {
      startMinutes = Number(startTime.slice(-2))
      startMinutes = startMinutes / 60
      const newTime = startTime.slice(0, -2) + '00'
      scheduleEntryTopElement = document.querySelector(
        '.schedule-time-item[data-time="' + newTime + '"]'
      )
    }
    if (scheduleEntryBottomElement == null) {
      endMinutes = Number(endTime.slice(-2))
      endMinutes = endMinutes / 60
      const newTime = endTime.slice(0, -2) + '00'
      scheduleEntryBottomElement = document.querySelector(
        '.schedule-time-item[data-time="' + newTime + '"]'
      )
    }
    //show the used times
    scheduleEntryTopElement.style.visibility = 'visible'
    let previousElement = scheduleEntryTopElement.previousElementSibling
    while (previousElement != null) {
      previousElement.style.visibility = 'visible'
      previousElement = previousElement.previousElementSibling
    }
    // show elements between top and bottom
    let nextElement = scheduleEntryTopElement.nextElementSibling
    while (nextElement != scheduleEntryBottomElement) {
      nextElement.style.visibility = 'visible'
      nextElement = nextElement.nextElementSibling
    }
    scheduleEntryBottomElement.style.visibility = 'visible'

    let timePlusOne = endTime.split(':')[0]

    timePlusOne = Number(timePlusOne) + 1
    timePlusOne = timePlusOne + ':00'
    const scheduleEntryTimePlusOneElement = document.querySelector(
      '.schedule-time-item[data-time="' + timePlusOne + '"]'
    )
    if (scheduleEntryTimePlusOneElement != null) {
      scheduleEntryTimePlusOneElement.style.visibility = 'visible'
    }
    //calculations
    const scheduleEntryTop = scheduleEntryTopElement.offsetTop
    const scheduleEntryBottom = scheduleEntryBottomElement.offsetTop
    const heightOfOneHourTimeSlot =
      document.querySelector('.schedule-time-item[data-time="10:00"]')
        .offsetTop -
      document.querySelector('.schedule-time-item[data-time="9:00"]').offsetTop
    const scheduleEntryHeight = //calculate height based on start and end time
      scheduleEntryBottom -
      scheduleEntryTop +
      endMinutes * heightOfOneHourTimeSlot -
      startMinutes * heightOfOneHourTimeSlot
    // endMinutes * scheduleEntryBottom -
    // endMinutes * scheduleEntryTop -
    // (startMinutes * scheduleEntryBottom - startMinutes * scheduleEntryTop)
    scheduleEntry.style.height = scheduleEntryHeight + 'px'
    scheduleEntry.style.top =
      scheduleEntryTop +
      1 +
      heightOfOneHourTimeSlot * startMinutes + //calculate top based on start and end time
      'px' // 1 is to compensate for the border
    // position the schedule entry (x axis)
    const scheduleEntryLeft = document.querySelector(
      '.schedule-header-item[data-day="' + day + '"]'
    ).offsetLeft
    const margin = 32 //to compensate for margin left/right
    const scheduleEntryWidth = document.querySelector(
      '.schedule-header-item[data-day="' + day + '"]'
    ).offsetWidth
    scheduleEntry.style.left = scheduleEntryLeft - margin / 2 + 'px'
    scheduleEntry.style.width = scheduleEntryWidth + margin + 'px'
    element.style.display = 'flex'
    const schedulediv = document.getElementById('schedule-body')
    schedulediv.appendChild(scheduleEntry)
  } catch (e) {
    console.log(e.message)
  }
}
const goPreviousSchedule = () => {
  //current schedule
  const scheduleTotalSpan = document.getElementById('schedule-total-span')
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(' ')[1])
  let previousSchedule = currentSchedule - 1
  const totalSchedules = schedules.length
  if (previousSchedule < 1) {
    previousSchedule = totalSchedules
  }
  //remove current schedule
  const schedulediv = document.getElementById('schedule-body')
  schedulediv.innerHTML = ''
  // add previous schedule
  const timeItems = document.querySelectorAll('.schedule-time-item')
  timeItems.forEach((timeItem) => {
    timeItem.style.visibility = 'hidden'
  })
  let colorCount = 0
  schedules[previousSchedule - 1].courses_list.forEach((scheduleEntry) => {
    createScheduleEntry(scheduleEntry, scheduleEntry.days.length, colorCount++)
  })
  scheduleTotalSpan.innerHTML = ' ' + previousSchedule + ' of ' + totalSchedules
  const scheduleContainer = document.getElementById('schedule-container')
  scheduleContainer.style.visibility = 'visible'
}
const goNextSchedule = () => {
  //current schedule
  const scheduleTotalSpan = document.getElementById('schedule-total-span')
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(' ')[1])
  let nextSchedule = currentSchedule + 1
  const totalSchedules = schedules.length
  if (currentSchedule > totalSchedules - 1) {
    nextSchedule = 1
  }
  //remove current schedule
  const schedulediv = document.getElementById('schedule-body')
  schedulediv.innerHTML = ''
  // add next schedule
  const timeItems = document.querySelectorAll('.schedule-time-item')
  timeItems.forEach((timeItem) => {
    timeItem.style.visibility = 'hidden'
  })
  let colorCount = 0
  schedules[nextSchedule - 1].courses_list.forEach((scheduleEntry) => {
    createScheduleEntry(scheduleEntry, scheduleEntry.days.length, colorCount++)
  })
  scheduleTotalSpan.innerHTML = ' ' + nextSchedule + ' of ' + totalSchedules
  const scheduleContainer = document.getElementById('schedule-container')
  scheduleContainer.style.visibility = 'visible'
}
const backToForm = () => {
  const schedulediv = document.getElementById('schedule-body')
  schedulediv.innerHTML = ''
  const formContainer = document.getElementById('form-container')
  formContainer.style.display = 'block'
  const timeItems = document.querySelectorAll('.schedule-time-item')
  timeItems.forEach((timeItem) => {
    timeItem.style.visibility = 'hidden'
  })
  const scheduleContainer = document.getElementById('schedule-container')
  scheduleContainer.style.visibility = 'hidden'
  const scheduleTotalHeader = document.getElementById('schedule-total-header')
  scheduleTotalHeader.style.display = 'none'
}
