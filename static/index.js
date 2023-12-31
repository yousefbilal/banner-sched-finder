let subjects
let courses
let coursesWithInfo
let schedules
const timings = [
  'None',
  '08:00',
  '08:15',
  '08:30',
  '08:45',
  '09:00',
  '09:15',
  '09:30',
  '09:45',
  '10:00',
  '10:15',
  '10:30',
  '10:45',
  '11:00',
  '11:15',
  '11:30',
  '11:45',
  '12:00',
  '12:15',
  '12:30',
  '12:45',
  '13:00',
  '13:15',
  '13:30',
  '13:45',
  '14:00',
  '14:15',
  '14:30',
  '14:45',
  '15:00',
  '15:15',
  '15:30',
  '15:45',
  '16:00',
  '16:15',
  '16:30',
  '16:45',
  '17:00',
  '17:15',
  '17:30',
  '17:45',
  '18:00',
  '18:15',
  '18:30',
  '18:45',
  '19:00',
  '19:15',
  '19:30',
  '19:45',
  '20:00',
  '20:15',
  '20:30',
  '20:45',
  '21:00',
  '21:15',
  '21:30',
  '21:45',
  '22:00',
]
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
const checkEditForm = (courses, element) => {
  const formContainer = document.getElementById('form-container')
  const editForm = formContainer.querySelector(
    '.editForm[data-id="' + element.getAttribute('data-id') + '"]'
  )
  if (editForm == null) {
    return
  }
  if (editForm) {
    editForm.remove()
  }
  // add edit form
  const editFormNew = document.createElement('form')
  editFormNew.className = 'editForm'
  const subject = element.querySelector('.subject').value
  const code = element.querySelector('.code').value
  editFormNew.setAttribute('data-id', element.getAttribute('data-id'))
  editFormNew.setAttribute('data-entry-subject', subject)
  editFormNew.setAttribute('data-entry-code', code)
  const editEntry = document.createElement('div')
  editEntry.className = 'editEntry'
  const editPanelSectionLabel = document.createElement('label')
  editPanelSectionLabel.innerHTML = 'Section'
  editPanelSectionLabel.classList.add('formLabel')
  const editPanelSection = document.createElement('select')
  editPanelSection.setAttribute('name', 'section')
  editPanelSection.classList.add('input')
  editPanelSection.classList.add('sectionSelect')
  // any
  const optionAny = document.createElement('option')
  optionAny.value = 'Any'
  optionAny.innerHTML = 'Any'
  editPanelSection.appendChild(optionAny)

  courses.forEach((course) => {
    if (course.subject === subject && course.code === code) {
      const option = document.createElement('option')
      const startTime = new Date(course.time[0])
      const endTime = new Date(course.time[1])
      let startTimeFormatted =
        startTime.getUTCHours() + ':' + startTime.getUTCMinutes()
      let endTimeFormatted =
        endTime.getUTCHours() + ':' + endTime.getUTCMinutes()
      if (startTime.getUTCMinutes() === 0) {
        startTimeFormatted += '0'
      }
      if (endTime.getUTCMinutes() === 0) {
        endTimeFormatted += '0'
      }
      option.value = course.section
      option.innerHTML =
        course.section +
        ' ' +
        course.instructor +
        ' ' +
        course.days +
        ' ' +
        startTimeFormatted +
        '-' +
        endTimeFormatted
      editPanelSection.appendChild(option)
    }
  })
  const addButton = document.createElement('input')
  addButton.setAttribute('type', 'button')
  addButton.setAttribute('value', '+')
  addButton.classList.add('inputBtn')
  addButton.classList.add('addBtn')
  addButton.onclick = (event) => {
    addSection(event)
  }
  const deleteButton = document.createElement('input')
  deleteButton.setAttribute('type', 'button')
  deleteButton.setAttribute('value', 'x')
  deleteButton.classList.add('inputBtn')
  deleteButton.classList.add('deleteBtn')
  deleteButton.onclick = (event) => {
    deleteSection(event)
  }
  editEntry.appendChild(editPanelSectionLabel)
  editEntry.appendChild(editPanelSection)
  editEntry.appendChild(deleteButton)
  editFormNew.appendChild(editEntry)
  const editFormSave = document.createElement('input')
  editFormSave.setAttribute('type', 'button')
  editFormSave.setAttribute('value', 'Back')
  editFormSave.classList.add('inputBtn')
  editFormSave.classList.add('deleteBtn')
  editFormSave.onclick = (event) => {
    editFormNew.style.display = 'none'
    form.style.display = 'block'
  }
  editFormNew.appendChild(addButton)
  editFormNew.appendChild(editFormSave)
  formContainer.appendChild(editFormNew)
  editFormNew.style.display = 'none'
}
const fillCodes = async (courses, element) => {
  try {
    if (!courses) {
      element.parentNode.remove()
      throw new Error('Too fast!')
    }
    //reset options
    element.innerHTML = ''
    // remove edit form for previous subject
    const entry = element.parentNode
    const formContainer = document.getElementById('form-container')
    const editForm = formContainer.querySelector(
      '.editForm[data-id="' + entry.getAttribute('data-id') + '"]'
    )
    if (editForm) {
      editForm.remove()
    }
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
      if (course.full_name && course.full_name.includes('(Take it with')) {
        option.innerHTML =
          course.code + ' - ' + course.full_name.split('(Take')[0]
      } else {
        option.innerHTML = course.code + ' - ' + course.full_name
      }
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
    let token = localStorage.getItem('token')
    if (!token || token == 'undefined') {
      token = 'null'
    } else {
      token = 'Bearer ' + token
    }
    const response = await fetch('/getCourses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
    const data = await response.json()
    if (token == 'null') {
      localStorage.setItem('token', data.token)
    }
    subjects = data.subjects
    courses = data.courses
    const dropdown = document.querySelector('.subject')
    fillSubjects(subjects, dropdown)
    fillCodes(courses, document.querySelector('.code'))
    // add change event listener to code dropdown
    const firstDropdown = document.getElementById('inputTextTwo0')
    firstDropdown.addEventListener('change', (e) => {
      e.stopPropagation()
      checkEditForm(courses, e.target.parentNode)
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
  const editButton = document.createElement('input')
  editButton.setAttribute('type', 'button')
  editButton.setAttribute('value', 'Ξ')
  editButton.classList.add('inputBtn')
  editButton.classList.add('deleteBtn')
  editButton.onclick = (event) => {
    editEntry(event)
  }
  entry.appendChild(dropdownlabel)
  entry.appendChild(dropdownselect)

  entry.appendChild(dropdownlabelTwo)
  entry.appendChild(dropdownselectTwo)
  entry.appendChild(editButton)
  entry.appendChild(deleteButton)
  const entries = document.getElementById('entries')
  entries.appendChild(entry)
  dropdownselect.addEventListener('change', (e) => {
    e.stopPropagation()
    fillCodes(courses, e.target.parentNode.querySelector('.code'))
  })
  dropdownselectTwo.addEventListener('change', (e) => {
    e.stopPropagation()
    checkEditForm(courses, e.target.parentNode)
  })
  fillSubjects(subjects, dropdownselect)
  fillCodes(courses, dropdownselectTwo)
}
const deleteEntry = (e) => {
  const entry = e.target.parentNode
  // const subject = entry.querySelector('.subject').value
  // const code = entry.querySelector('.code').value
  const formContainer = document.getElementById('form-container')
  const editForm = formContainer.querySelector(
    '.editForm[data-id="' + entry.getAttribute('data-id') + '"]'
  )
  if (editForm) {
    editForm.remove()
  }
  entry.remove()
}
const editEntry = (e) => {
  try {
    if (!subjects) {
      throw new Error('Too fast!')
    }
    const entry = e.target.parentNode
    const subject = entry.querySelector('.subject').value
    const code = entry.querySelector('.code').value
    const formContainer = document.getElementById('form-container')
    const form = document.getElementById('form')
    if (
      formContainer.querySelector(
        '.editForm[data-id="' + entry.getAttribute('data-id') + '"]'
      )
    ) {
      // if edit form already exists show it
      formContainer.querySelector(
        '.editForm[data-id="' + entry.getAttribute('data-id') + '"]'
      ).style.display = 'block'
      form.style.display = 'none'
      return
    }
    // create edit panel
    const editForm = document.createElement('form')
    let randomid = Math.random().toString(36).substring(7)
    // make sure its unique
    while (
      formContainer.querySelector('.editForm[data-id="' + randomid + '"]')
    ) {
      randomid = Math.random().toString(36).substring(7)
    }
    editForm.className = 'editForm'
    editForm.setAttribute('data-entry-subject', subject)
    editForm.setAttribute('data-entry-code', code)
    editForm.setAttribute('data-id', randomid)
    entry.setAttribute('data-id', randomid)
    form.style.display = 'none'
    const editEntry = document.createElement('div')
    editEntry.className = 'editEntry'
    const editPanelSectionLabel = document.createElement('label')
    editPanelSectionLabel.innerHTML = 'Section'
    editPanelSectionLabel.classList.add('formLabel')
    const editPanelSection = document.createElement('select')
    editPanelSection.setAttribute('name', 'section')
    editPanelSection.classList.add('input')
    editPanelSection.classList.add('sectionSelect')
    // any
    const optionAny = document.createElement('option')
    optionAny.value = 'Any'
    optionAny.innerHTML = 'Any'
    editPanelSection.appendChild(optionAny)
    courses.forEach((course) => {
      if (course.subject === subject && course.code === code) {
        const option = document.createElement('option')
        const startTime = new Date(course.time[0])
        const endTime = new Date(course.time[1])
        let startTimeFormatted =
          startTime.getUTCHours() + ':' + startTime.getUTCMinutes()
        let endTimeFormatted =
          endTime.getUTCHours() + ':' + endTime.getUTCMinutes()
        if (startTime.getUTCMinutes() === 0) {
          startTimeFormatted += '0'
        }
        if (endTime.getUTCMinutes() === 0) {
          endTimeFormatted += '0'
        }
        option.value = course.section
        option.innerHTML =
          course.section +
          ' ' +
          course.instructor +
          ' ' +
          course.days +
          ' ' +
          startTimeFormatted +
          '-' +
          endTimeFormatted
        editPanelSection.appendChild(option)
      }
    })
    const addButton = document.createElement('input')
    addButton.setAttribute('type', 'button')
    addButton.setAttribute('value', '+')
    addButton.classList.add('inputBtn')
    addButton.classList.add('addBtn')
    addButton.classList.add('addBtnEditForm')
    addButton.onclick = (event) => {
      addSection(event)
    }
    const deleteButton = document.createElement('input')
    deleteButton.setAttribute('type', 'button')
    deleteButton.setAttribute('value', 'x')
    deleteButton.classList.add('inputBtn')
    deleteButton.classList.add('deleteBtn')
    deleteButton.onclick = (event) => {
      deleteSection(event)
    }
    editEntry.appendChild(editPanelSectionLabel)
    editEntry.appendChild(editPanelSection)
    editEntry.appendChild(deleteButton)
    editForm.appendChild(editEntry)
    const editFormSave = document.createElement('input')
    editFormSave.setAttribute('type', 'button')
    editFormSave.setAttribute('value', 'Back')
    editFormSave.classList.add('inputBtn')
    editFormSave.classList.add('deleteBtn')
    editFormSave.classList.add('backBtnEditForm')
    editFormSave.onclick = (event) => {
      editForm.style.display = 'none'
      form.style.display = 'block'
    }
    editForm.appendChild(addButton)
    editForm.appendChild(editFormSave)
    formContainer.appendChild(editForm)
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
const addSection = (e) => {
  const formContainer = e.target.parentNode
  const subject = formContainer.getAttribute('data-entry-subject')
  const code = formContainer.getAttribute('data-entry-code')
  // add section entry
  const editEntry = document.createElement('div')
  editEntry.className = 'editEntry'
  const editPanelSectionLabel = document.createElement('label')
  editPanelSectionLabel.innerHTML = 'Section'
  editPanelSectionLabel.classList.add('formLabel')
  const editPanelSection = document.createElement('select')
  editPanelSection.setAttribute('name', 'section')
  editPanelSection.classList.add('input')
  editPanelSection.classList.add('sectionSelect')
  // any
  const optionAny = document.createElement('option')
  optionAny.value = 'Any'
  optionAny.innerHTML = 'Any'
  editPanelSection.appendChild(optionAny)
  courses.forEach((course) => {
    if (course.subject === subject && course.code === code) {
      const option = document.createElement('option')
      const startTime = new Date(course.time[0])
      const endTime = new Date(course.time[1])
      let startTimeFormatted =
        startTime.getUTCHours() + ':' + startTime.getUTCMinutes()
      let endTimeFormatted =
        endTime.getUTCHours() + ':' + endTime.getUTCMinutes()
      if (startTime.getUTCMinutes() === 0) {
        startTimeFormatted += '0'
      }
      if (endTime.getUTCMinutes() === 0) {
        endTimeFormatted += '0'
      }
      option.value = course.section
      option.innerHTML =
        course.section +
        ' ' +
        course.instructor +
        ' ' +
        course.days +
        ' ' +
        startTimeFormatted +
        '-' +
        endTimeFormatted
      editPanelSection.appendChild(option)
    }
  })
  const deleteButton = document.createElement('input')
  deleteButton.setAttribute('type', 'button')
  deleteButton.setAttribute('value', 'x')
  deleteButton.classList.add('inputBtn')
  deleteButton.classList.add('deleteBtn')
  deleteButton.onclick = (event) => {
    deleteSection(event)
  }
  editEntry.appendChild(editPanelSectionLabel)
  editEntry.appendChild(editPanelSection)
  editEntry.appendChild(deleteButton)
  // add it third to last child
  formContainer.insertBefore(
    editEntry,
    formContainer.childNodes[formContainer.childNodes.length - 2]
  )
}
const deleteSection = (e) => {
  const sectionEntry = e.target.parentNode
  sectionEntry.remove()
}
const displayAdvancedOptions = () => {
  const formContainer = document.getElementById('form-container')
  const form = document.getElementById('form')
  const advancedOptions = document.getElementById('advancedOptions')
  if (advancedOptions != null) {
    advancedOptions.style.display = 'block'
    form.style.display = 'none'
    return
  }
  const advancedOptionsForm = document.createElement('form')
  advancedOptionsForm.className = 'advancedOptions'
  advancedOptionsForm.id = 'advancedOptions'
  const advancedEntry = document.createElement('div')
  advancedEntry.className = 'advancedEntry'
  const advancedOptionsFormLabel = document.createElement('label')
  advancedOptionsFormLabel.innerHTML = 'No 8 AM Classes'
  advancedOptionsFormLabel.classList.add('formLabel')
  const advancedOptionsFormInput = document.createElement('input')
  advancedOptionsFormInput.setAttribute('type', 'checkbox')
  advancedOptionsFormInput.setAttribute('name', 'no8AM')
  advancedOptionsFormInput.classList.add('input')
  advancedOptionsFormInput.classList.add('no8AM')
  advancedOptionsFormInput.id = 'no8AM'
  advancedEntry.appendChild(advancedOptionsFormLabel)
  advancedEntry.appendChild(advancedOptionsFormInput)
  const advancedEntryTwo = document.createElement('div')
  advancedEntryTwo.className = 'advancedEntry'
  const advancedOptionsFormLabelTwo = document.createElement('label')
  advancedOptionsFormLabelTwo.innerHTML = 'No Multiple Labs on Same Day'
  advancedOptionsFormLabelTwo.classList.add('formLabel')
  const advancedOptionsFormInputTwo = document.createElement('input')
  advancedOptionsFormInputTwo.setAttribute('type', 'checkbox')
  advancedOptionsFormInputTwo.setAttribute('name', 'noMultipleLabs')
  advancedOptionsFormInputTwo.disabled = true
  advancedOptionsFormInputTwo.classList.add('input')
  advancedOptionsFormInputTwo.classList.add('noMultipleLabs')
  advancedOptionsFormInputTwo.id = 'noMultipleLabs'
  advancedEntryTwo.appendChild(advancedOptionsFormLabelTwo)
  advancedEntryTwo.appendChild(advancedOptionsFormInputTwo)
  const advancedEntryFour = document.createElement('div')
  advancedEntryFour.className = 'advancedEntry'
  const advancedOptionsFormLabelFour = document.createElement('label')
  advancedOptionsFormLabelFour.innerHTML = 'No Classes after 5 PM'
  advancedOptionsFormLabelFour.classList.add('formLabel')
  const advancedOptionsFormInputFour = document.createElement('input')
  advancedOptionsFormInputFour.setAttribute('type', 'checkbox')
  advancedOptionsFormInputFour.setAttribute('name', 'noClassesAfter5PM')
  advancedOptionsFormInputFour.classList.add('input')
  advancedOptionsFormInputFour.classList.add('noClassesAfter5PM')
  advancedOptionsFormInputFour.id = 'noClassesAfter5PM'
  advancedEntryFour.appendChild(advancedOptionsFormLabelFour)
  advancedEntryFour.appendChild(advancedOptionsFormInputFour)
  const advancedEntryThree = document.createElement('div')
  advancedEntryThree.className = 'advancedEntry'
  const advancedOptionsFormLabelThree = document.createElement('label')
  advancedOptionsFormLabelThree.innerHTML = 'Break'
  advancedOptionsFormLabelThree.classList.add('formLabel')
  const advancedOptionsFormInputThree = document.createElement('select')
  advancedOptionsFormInputThree.setAttribute('name', 'breakBetween')
  advancedOptionsFormInputThree.classList.add('input')
  advancedOptionsFormInputThree.classList.add('breakBetween')
  // advancedOptionsFormInputThree.setAttribute('placeholder', 'Start Time')
  const advancedOptionsFormInputThreeExtra = document.createElement('select')
  advancedOptionsFormInputThreeExtra.setAttribute('name', 'breakBetween')
  advancedOptionsFormInputThreeExtra.classList.add('input')
  advancedOptionsFormInputThreeExtra.classList.add('breakBetween')
  // advancedOptionsFormInputThreeExtra.setAttribute('placeholder', 'End Time')
  timings.forEach((time) => {
    const option = document.createElement('option')
    option.value = time
    option.innerHTML = time
    advancedOptionsFormInputThree.appendChild(option)
    advancedOptionsFormInputThreeExtra.appendChild(option.cloneNode(true))
  })
  const addBreakButton = document.createElement('input')
  addBreakButton.setAttribute('type', 'button')
  addBreakButton.setAttribute('value', '+')
  addBreakButton.classList.add('inputBtn')
  addBreakButton.classList.add('deleteBtn')
  addBreakButton.classList.add('addBtnBreak')
  addBreakButton.onclick = (event) => {
    addBreakEntry(event)
  }
  const deleteBreakButton = document.createElement('input')
  deleteBreakButton.setAttribute('type', 'button')
  deleteBreakButton.setAttribute('value', 'x')
  deleteBreakButton.classList.add('inputBtn')
  deleteBreakButton.classList.add('deleteBtn')
  deleteBreakButton.classList.add('deleteBtnBreak')
  deleteBreakButton.onclick = (event) => {
    deleteBreakEntry(event)
  }
  // days of break
  const daysOfBreak = document.createElement('div')
  daysOfBreak.className = 'daysOfBreak'
  const daysOfBreakLabel = document.createElement('label')
  daysOfBreakLabel.innerHTML = ''
  daysOfBreakLabel.classList.add('formLabel')
  daysOfBreak.appendChild(daysOfBreakLabel)
  // add checkboxes for days
  const days = ['M', 'T', 'W', 'R' /*, 'F'*/]
  days.forEach((day) => {
    const dayLabel = document.createElement('label')
    dayLabel.innerHTML = day
    dayLabel.classList.add('formLabel')
    const dayInput = document.createElement('input')
    dayInput.setAttribute('type', 'checkbox')
    dayInput.setAttribute('name', 'day')
    dayInput.classList.add('input')
    dayInput.classList.add('day')
    dayInput.classList.add(day)
    dayInput.value = day
    const singleDayContainer = document.createElement('div')
    singleDayContainer.className = 'singleDayContainer'
    singleDayContainer.appendChild(dayLabel)
    singleDayContainer.appendChild(dayInput)
    daysOfBreak.appendChild(singleDayContainer)
    // daysOfBreak.appendChild(dayLabel)
    // daysOfBreak.appendChild(dayInput)
  })

  const backButton = document.createElement('input')
  backButton.setAttribute('type', 'button')
  backButton.setAttribute('value', 'Back')
  backButton.classList.add('inputBtn')
  backButton.classList.add('backBtn')
  backButton.id = 'backBtnAdvancedForm'
  backButton.onclick = (event) => {
    advancedOptionsForm.style.display = 'none'
    form.style.display = 'block'
  }
  advancedEntryThree.appendChild(advancedOptionsFormLabelThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThreeExtra)

  advancedOptionsForm.appendChild(advancedEntry)
  advancedOptionsForm.appendChild(advancedEntryTwo)
  advancedOptionsForm.appendChild(advancedEntryFour)
  daysOfBreak.appendChild(addBreakButton)
  daysOfBreak.appendChild(deleteBreakButton)
  advancedEntryThree.appendChild(daysOfBreak)
  advancedOptionsForm.appendChild(advancedEntryThree)
  advancedOptionsForm.appendChild(backButton)
  formContainer.appendChild(advancedOptionsForm)
  form.style.display = 'none'
}
const addBreakEntry = (e) => {
  const advancedOptionsForm = e.target.parentNode.parentNode.parentNode
  const advancedEntryThree = document.createElement('div')
  advancedEntryThree.className = 'advancedEntry'
  const advancedOptionsFormLabelThree = document.createElement('label')
  advancedOptionsFormLabelThree.innerHTML = 'Break '
  advancedOptionsFormLabelThree.classList.add('formLabel')
  const advancedOptionsFormInputThree = document.createElement('select')
  advancedOptionsFormInputThree.setAttribute('name', 'breakBetween')
  advancedOptionsFormInputThree.classList.add('input')
  advancedOptionsFormInputThree.classList.add('breakBetween')
  // advancedOptionsFormInputThree.setAttribute('placeholder', 'Start Time')
  const advancedOptionsFormInputThreeExtra = document.createElement('select')
  advancedOptionsFormInputThreeExtra.setAttribute('name', 'breakBetween')
  advancedOptionsFormInputThreeExtra.classList.add('input')
  advancedOptionsFormInputThreeExtra.classList.add('breakBetween')
  // advancedOptionsFormInputThreeExtra.setAttribute('placeholder', 'End Time')
  timings.forEach((time) => {
    const option = document.createElement('option')
    option.value = time
    option.innerHTML = time
    advancedOptionsFormInputThree.appendChild(option)
    advancedOptionsFormInputThreeExtra.appendChild(option.cloneNode(true))
  })
  const addBreakButton = document.createElement('input')
  addBreakButton.setAttribute('type', 'button')
  addBreakButton.setAttribute('value', '+')
  addBreakButton.classList.add('inputBtn')
  addBreakButton.classList.add('deleteBtn')
  addBreakButton.onclick = (event) => {
    addBreakEntry(event)
  }
  const deleteBreakButton = document.createElement('input')
  deleteBreakButton.setAttribute('type', 'button')
  deleteBreakButton.setAttribute('value', 'x')
  deleteBreakButton.classList.add('inputBtn')
  deleteBreakButton.classList.add('deleteBtn')
  deleteBreakButton.onclick = (event) => {
    deleteBreakEntry(event)
  }
  // days of break
  const daysOfBreak = document.createElement('div')
  daysOfBreak.className = 'daysOfBreak'
  const daysOfBreakLabel = document.createElement('label')
  daysOfBreakLabel.innerHTML = ''
  daysOfBreakLabel.classList.add('formLabel')
  daysOfBreak.appendChild(daysOfBreakLabel)
  // add checkboxes for days
  const days = ['M', 'T', 'W', 'R' /*, 'F'*/]
  days.forEach((day) => {
    const dayLabel = document.createElement('label')
    dayLabel.innerHTML = day
    dayLabel.classList.add('formLabel')
    const dayInput = document.createElement('input')
    dayInput.setAttribute('type', 'checkbox')
    dayInput.setAttribute('name', 'day')
    dayInput.classList.add('input')
    dayInput.classList.add('day')
    dayInput.value = day
    const singleDayContainer = document.createElement('div')
    singleDayContainer.className = 'singleDayContainer'
    singleDayContainer.appendChild(dayLabel)
    singleDayContainer.appendChild(dayInput)
    daysOfBreak.appendChild(singleDayContainer)
    // daysOfBreak.appendChild(dayLabel)
    // daysOfBreak.appendChild(dayInput)
  })

  advancedEntryThree.appendChild(advancedOptionsFormLabelThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThreeExtra)
  daysOfBreak.appendChild(addBreakButton)
  daysOfBreak.appendChild(deleteBreakButton)
  advancedEntryThree.appendChild(daysOfBreak)
  // advancedOptionsForm.appendChild(advancedEntryThree)
  advancedOptionsForm.insertBefore(
    advancedEntryThree,
    advancedOptionsForm.childNodes[advancedOptionsForm.childNodes.length - 1]
  )
  // advancedOptionsForm.insertBefore(
  //   daysOfBreak,
  //   advancedOptionsForm.childNodes[advancedOptionsForm.childNodes.length - 1]
  // )
}
const deleteBreakEntry = (e) => {
  const breakEntry = e.target.parentNode.parentNode
  const advancedOptionsForm = breakEntry.parentNode
  // const daysOfBreak = breakEntry.nextSibling
  // if its the last breakEntry then just reset it

  if (advancedOptionsForm.querySelectorAll('.advancedEntry').length === 4) {
    const options = breakEntry.querySelectorAll('.breakBetween')
    options.forEach((option) => {
      option.value = 'None'
    })
    const days = breakEntry.querySelectorAll('.day')
    days.forEach((day) => {
      day.checked = false
    })
    return
  }
  breakEntry.remove()
  // daysOfBreak.remove()
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
  try {
    e.preventDefault()
    const submitBtn = document.getElementById('submitBtn')
    submitBtn.disabled = true
    const alertBox = document.getElementById('alertBox')
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    alertBox.innerHTML = 'Generating Schedules...'
    const historyBtn = document.getElementById('historyBtn')
    historyBtn.disabled = true
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
      let sections = []
      const formContainer = document.getElementById('form-container')
      const editForm = formContainer.querySelector(
        '.editForm[data-id="' + course.getAttribute('data-id') + '"]'
      )
      if (editForm) {
        const sectionsSelect = editForm.querySelectorAll('.sectionSelect')
        sectionsSelect.forEach((section) => {
          if (section.value === 'Any') {
            sections = ['Any']
            return
          }
          sections.push(section.value)
        })
      }
      if (sections.length === 0) {
        sections = ['Any']
      }
      selectedCoursesArray.push({ subject, code, sections })
    })
    const advancedOptionsForm = document.getElementById('advancedOptions')
    const breaks = []
    if (advancedOptionsForm) {
      const no8AM = advancedOptionsForm.querySelector('.no8AM').checked
      const noMultipleLabs = //to do
        advancedOptionsForm.querySelector('.noMultipleLabs').checked
      const noClassesAfter5PM =
        advancedOptionsForm.querySelector('.noClassesAfter5PM').checked
      const breakBetweenSelect =
        advancedOptionsForm.querySelectorAll('.breakBetween')
      for (let i = 0; i < breakBetweenSelect.length; i += 2) {
        if (
          breakBetweenSelect[i].value === 'None' ||
          breakBetweenSelect[i + 1].value === 'None' ||
          breakBetweenSelect[i].value === breakBetweenSelect[i + 1].value ||
          breakBetweenSelect[i].value > breakBetweenSelect[i + 1].value
        ) {
          continue
        }
        const days =
          breakBetweenSelect[i].parentNode.parentNode.querySelector(
            '.daysOfBreak'
          )
        let daysString = ''
        const daysInput = days.querySelectorAll('.day')
        daysInput.forEach((day) => {
          if (day.checked) {
            daysString += day.value
          }
        })
        if (daysString === '') {
          continue
        }
        breaks.push({
          startTime: breakBetweenSelect[i].value,
          endTime: breakBetweenSelect[i + 1].value,
          days: daysString,
        })
      }
      if (no8AM) {
        breaks.push({
          startTime: '08:00',
          endTime: '09:00',
        })
      }
      if (noClassesAfter5PM) {
        breaks.push({
          startTime: '17:00',
          endTime: '22:00',
        })
      }
    }
    if (selectedCoursesArray.length === 0) {
      throw new Error('Please add at least one course')
    }
    const response = await fetch('/generateScheduleDOM', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({ selectedCoursesArray, breaks }),
    })
    const data = await response.json()
    schedules = data.schedules
    if (!schedules || schedules.length === 0) {
      throw new Error('No schedules found')
    }
    const schedulediv = document.getElementById('schedule-body')
    schedulediv.innerHTML = ''
    // add first schedule
    // show relevant time items
    const timeItems = document.querySelectorAll('.schedule-time-item')
    let heightOfOneHourTimeSlot = 48
    timeItems.forEach((timeItem) => {
      if (
        Number(timeItem.getAttribute('data-time').split(':')[0]) >=
          Number(schedules[0].min_hour.split(':')[0]) &&
        Number(timeItem.getAttribute('data-time').split(':')[0]) <=
          Number(schedules[0].max_hour.split(':')[0])
      ) {
        timeItem.style.display = 'block'
        if (
          Number(timeItem.getAttribute('data-time').split(':')[0]) ==
          Number(schedules[0].min_hour.split(':')[0]) + 1
        ) {
          heightOfOneHourTimeSlot =
            timeItem.offsetTop - timeItem.previousElementSibling.offsetTop
        }
      } else {
        timeItem.style.display = 'none'
      }
    })
    let colorCount = 0
    schedules[0].courses_list.forEach((scheduleEntry) => {
      if (scheduleEntry.course_code === 'BREAK') {
      } else {
        createScheduleEntry(
          scheduleEntry,
          scheduleEntry.days.length,
          colorCount++,
          heightOfOneHourTimeSlot
        )
      }
    })
    const formContainer = document.getElementById('form-container')
    formContainer.style.display = 'none'
    alertBox.innerHTML = 'Schedule(s) generated'
    const scheduleContainer = document.getElementById('schedule-container')
    scheduleContainer.style.visibility = 'visible'
    const scheduleExtra = document.getElementById('schedule-extra')
    scheduleExtra.style.visibility = 'visible'
    const scheduleTotalHeader = document.getElementById('schedule-total-header')
    scheduleTotalHeader.style.display = 'flex'
    scheduleTotalHeader.innerHTML =
      '<input type="button" value="x" class="inputBtn backToFormBtn" onclick="backToForm()"/> <i class="fa-solid fa-arrow-left" onclick ="goPreviousSchedule()"></i> ' +
      ' <span class="schedule-total-span" id="schedule-total-span"> 1 of ' +
      schedules.length +
      ' </span><i class="fa-solid fa-arrow-right" onclick="goNextSchedule()"></i>'
    submitBtn.disabled = false
    historyBtn.style.display = 'none'
    historyBtn.disabled = false
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
    const historyBtn = document.getElementById('historyBtn')
    historyBtn.style.display = 'block'
    historyBtn.disabled = false
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  }
}
const createScheduleEntry = (entry, count, color, heightOfOneHourTimeSlot) => {
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
    positionScheduleEntry(scheduleEntry, heightOfOneHourTimeSlot)
    if (scheduleEntry.scrollHeight > scheduleEntry.clientHeight) {
      const instructorArray = entry.instructor.split(' ')
      scheduleEntryInfoInstructor.innerHTML =
        instructorArray[0] + ' ' + instructorArray[instructorArray.length - 1]
    }
  }
}
// schedule
const positionScheduleEntry = (element, heightOfOneHourTimeSlot) => {
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
    //calculations
    const scheduleEntryTop = scheduleEntryTopElement.offsetTop
    const scheduleEntryBottom = scheduleEntryBottomElement.offsetTop
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
  // show relevant time items
  const timeItems = document.querySelectorAll('.schedule-time-item')
  let heightOfOneHourTimeSlot = 48
  timeItems.forEach((timeItem) => {
    if (
      Number(timeItem.getAttribute('data-time').split(':')[0]) >=
        Number(schedules[previousSchedule - 1].min_hour.split(':')[0]) &&
      Number(timeItem.getAttribute('data-time').split(':')[0]) <=
        Number(schedules[previousSchedule - 1].max_hour.split(':')[0])
    ) {
      timeItem.style.display = 'block'
      if (
        Number(timeItem.getAttribute('data-time').split(':')[0]) ==
        Number(schedules[previousSchedule - 1].min_hour.split(':')[0]) + 1
      ) {
        heightOfOneHourTimeSlot =
          timeItem.offsetTop - timeItem.previousElementSibling.offsetTop
      }
    } else {
      timeItem.style.display = 'none'
    }
  })
  let colorCount = 0
  schedules[previousSchedule - 1].courses_list.forEach((scheduleEntry) => {
    if (scheduleEntry.course_code === 'BREAK') {
    } else {
      createScheduleEntry(
        scheduleEntry,
        scheduleEntry.days.length,
        colorCount++,
        heightOfOneHourTimeSlot
      )
    }
  })
  scheduleTotalSpan.innerHTML = ' ' + previousSchedule + ' of ' + totalSchedules
  const scheduleContainer = document.getElementById('schedule-container')
  scheduleContainer.style.visibility = 'visible'
  const scheduleExtra = document.getElementById('schedule-extra')
  scheduleExtra.style.visibility = 'visible'
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
  // show relevant time items
  const timeItems = document.querySelectorAll('.schedule-time-item')
  let heightOfOneHourTimeSlot = 48
  timeItems.forEach((timeItem) => {
    if (
      Number(timeItem.getAttribute('data-time').split(':')[0]) >=
        Number(schedules[nextSchedule - 1].min_hour.split(':')[0]) &&
      Number(timeItem.getAttribute('data-time').split(':')[0]) <=
        Number(schedules[nextSchedule - 1].max_hour.split(':')[0])
    ) {
      timeItem.style.display = 'block'
      if (
        Number(timeItem.getAttribute('data-time').split(':')[0]) ==
        Number(schedules[nextSchedule - 1].min_hour.split(':')[0]) + 1
      ) {
        heightOfOneHourTimeSlot =
          timeItem.offsetTop - timeItem.previousElementSibling.offsetTop
      }
    } else {
      timeItem.style.display = 'none'
    }
  })
  let colorCount = 0
  schedules[nextSchedule - 1].courses_list.forEach((scheduleEntry) => {
    if (scheduleEntry.course_code === 'BREAK') {
    } else {
      createScheduleEntry(
        scheduleEntry,
        scheduleEntry.days.length,
        colorCount++,
        heightOfOneHourTimeSlot
      )
    }
  })
  scheduleTotalSpan.innerHTML = ' ' + nextSchedule + ' of ' + totalSchedules
  const scheduleContainer = document.getElementById('schedule-container')
  scheduleContainer.style.visibility = 'visible'
  const scheduleExtra = document.getElementById('schedule-extra')
  scheduleExtra.style.visibility = 'visible'
}
const backToForm = () => {
  const schedulediv = document.getElementById('schedule-body')
  schedulediv.innerHTML = ''
  const formContainer = document.getElementById('form-container')
  formContainer.style.display = 'block'
  const timeItems = document.querySelectorAll('.schedule-time-item')
  timeItems.forEach((timeItem) => {
    timeItem.style.display = 'none'
  })
  const scheduleContainer = document.getElementById('schedule-container')
  scheduleContainer.style.visibility = 'hidden'
  const scheduleExtra = document.getElementById('schedule-extra')
  scheduleExtra.style.visibility = 'hidden'
  const scheduleTotalHeader = document.getElementById('schedule-total-header')
  scheduleTotalHeader.style.display = 'none'
  const historyBtn = document.getElementById('historyBtn')
  historyBtn.style.display = 'block'
}
window.addEventListener('resize', () => {
  const schedulediv = document.getElementById('schedule-body')
  if (schedulediv == null) {
    return
  }
  schedulediv.innerHTML = ''
  // show relevant time items
  const timeItems = document.querySelectorAll('.schedule-time-item')
  if (timeItems.length === 0) {
    return
  }

  let heightOfOneHourTimeSlot = 48
  const scheduleTotalSpan = document.getElementById('schedule-total-span')
  if (scheduleTotalSpan == null) {
    return
  }
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(' ')[1])
  timeItems.forEach((timeItem) => {
    if (
      Number(timeItem.getAttribute('data-time').split(':')[0]) >=
        Number(schedules[currentSchedule - 1].min_hour.split(':')[0]) &&
      Number(timeItem.getAttribute('data-time').split(':')[0]) <=
        Number(schedules[currentSchedule - 1].max_hour.split(':')[0])
    ) {
      timeItem.style.display = 'block'
      if (
        Number(timeItem.getAttribute('data-time').split(':')[0]) ==
        Number(schedules[currentSchedule - 1].min_hour.split(':')[0]) + 1
      ) {
        heightOfOneHourTimeSlot =
          timeItem.offsetTop - timeItem.previousElementSibling.offsetTop
      }
    } else {
      timeItem.style.display = 'none'
    }
  })
  let colorCount = 0
  schedules[currentSchedule - 1].courses_list.forEach((scheduleEntry) => {
    if (scheduleEntry.course_code === 'BREAK') {
    } else {
      createScheduleEntry(
        scheduleEntry,
        scheduleEntry.days.length,
        colorCount++,
        heightOfOneHourTimeSlot
      )
    }
  })
})

const downloadSchedule = async () => {
  try {
    const canvas = await html2canvas(document.getElementById('schedule-container'), 
    { scale: 3.5, backgroundColor: '#1a1a1a' })
  
    const scheduleTotalSpan = document.getElementById('schedule-total-span')
    const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(' ')[1])
    const b64img = canvas.toDataURL('image/png')
    let anchor = document.createElement('a')
    anchor.href = b64img
    anchor.download = `schedule-${currentSchedule}.png`
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(b64img)
    const alertBox = document.getElementById('alertBox')
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    alertBox.innerHTML = 'Schedule downloaded'
    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  } catch(err) {
    const alertBox = document.getElementById('alertBox')
    alertBox.style.backgroundColor = '#ccc'
    alertBox.style.color = '#1a1a1a'
    alertBox.style.display = 'block'
    alertBox.innerHTML = 'Downloading failed, please try again later'
    setTimeout(() => {
      alertBox.innerHTML = ''
      alertBox.style.display = 'none'
    }, 5000)
  }
}
const copyCRNs = () => {
  const scheduleTotalSpan = document.getElementById('schedule-total-span')
  const currentSchedule = Number(scheduleTotalSpan.innerHTML.split(' ')[1])
  const crns = []
  schedules[currentSchedule - 1].courses_list.forEach((scheduleEntry) => {
    if (scheduleEntry.course_code === 'BREAK') {
    } else {
      crns.push(scheduleEntry.crn)
    }
  })
  const crnsString = crns.join(', ')
  navigator.clipboard.writeText(crnsString)
  const alertBox = document.getElementById('alertBox')
  alertBox.style.backgroundColor = '#ccc'
  alertBox.style.color = '#1a1a1a'
  alertBox.style.display = 'block'
  alertBox.innerHTML = 'CRNs copied to clipboard'
  setTimeout(() => {
    alertBox.innerHTML = ''
    alertBox.style.display = 'none'
  }, 5000)
}
