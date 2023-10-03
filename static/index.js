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
  fillSubjects(subjects, dropdownselect)
  fillCodes(courses, dropdownselectTwo)
  //   dropdownselect.addEventListener('change', (e) => {
  //     e.stopPropagation()
  //     fillCodes(courses, e.target.parentNode.querySelector('.code'))
  //   })
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
    // synchronize crn
    // editPanelSection.addEventListener('change', (e) => {
    //   e.stopPropagation()
    //   const crn = e.target.value
    //   const instructor = e.target.parentNode.querySelector('.instructorSelect')
    //   if (crn === 'Any') {
    //     instructor.value = 'Any'
    //     return
    //   }
    //   courses.forEach((course) => {
    //     if (course.crn === crn) {
    //       instructor.value = course.instructor
    //     }
    //   })
    // })
    // any
    const optionAny = document.createElement('option')
    optionAny.value = 'Any'
    optionAny.innerHTML = 'Any'
    editPanelSection.appendChild(optionAny)
    courses.forEach((course) => {
      if (course.subject === subject && course.code === code) {
        const option = document.createElement('option')
        option.value = course.section + ' ' + course.instructor
        option.innerHTML = course.section + ' ' + course.instructor
        editPanelSection.appendChild(option)
      }
    })
    // const instructorLabel = document.createElement('label')
    // instructorLabel.innerHTML = 'Instructor'
    // instructorLabel.classList.add('formLabel')
    // const instructorInput = document.createElement('select')
    // instructorInput.setAttribute('name', 'instructor')
    // instructorInput.classList.add('input')
    // instructorInput.classList.add('instructorSelect')
    // // any
    // const optionAnyInstructor = document.createElement('option')
    // optionAnyInstructor.value = 'Any'
    // optionAnyInstructor.innerHTML = 'Any'
    // instructorInput.appendChild(optionAnyInstructor)
    // courses.forEach((course) => {
    //   if (course.subject === subject && course.code === code) {
    //     const option = document.createElement('option')
    //     option.value = course.instructor
    //     option.innerHTML = course.instructor
    //     instructorInput.appendChild(option)
    //   }
    // })
    // synchronize instructor
    // instructorInput.addEventListener('change', (e) => {
    //   e.stopPropagation()
    //   const instructor = e.target.value
    //   const crn = e.target.parentNode.querySelector('.crnSelect')
    //   if (instructor === 'Any') {
    //     crn.value = 'Any'
    //     return
    //   }
    //   const fileteredCourses = courses.filter((course) => {
    //     return (
    //       course.instructor === instructor &&
    //       course.subject === subject &&
    //       course.code === code
    //     )
    //   })
    //   crn.value = fileteredCourses[0].crn
    // })

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
    editForm.appendChild(editEntry)
    const editFormSave = document.createElement('input')
    editFormSave.setAttribute('type', 'button')
    editFormSave.setAttribute('value', 'Back')
    editFormSave.classList.add('inputBtn')
    editFormSave.classList.add('deleteBtn')
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
  // synchronize crn
  // editPanelSection.addEventListener('change', (e) => {
  //   e.stopPropagation()
  //   const crn = e.target.value
  //   const instructor = e.target.parentNode.querySelector('.instructorSelect')
  //   if (crn === 'Any') {
  //     instructor.value = 'Any'
  //     return
  //   }
  //   courses.forEach((course) => {
  //     if (course.crn === crn) {
  //       instructor.value = course.instructor
  //     }
  //   })
  // })
  // any
  const optionAny = document.createElement('option')
  optionAny.value = 'Any'
  optionAny.innerHTML = 'Any'
  editPanelSection.appendChild(optionAny)
  courses.forEach((course) => {
    if (course.subject === subject && course.code === code) {
      const option = document.createElement('option')
      option.value = course.section + ' ' + course.instructor
      option.innerHTML = course.section + ' ' + course.instructor
      editPanelSection.appendChild(option)
    }
  })
  // const instructorLabel = document.createElement('label')
  // instructorLabel.innerHTML = 'Instructor'
  // instructorLabel.classList.add('formLabel')
  // const instructorInput = document.createElement('select')
  // instructorInput.setAttribute('name', 'instructor')
  // instructorInput.classList.add('input')
  // instructorInput.classList.add('instructorSelect')
  // // any
  // const optionAnyInstructor = document.createElement('option')
  // optionAnyInstructor.value = 'Any'
  // optionAnyInstructor.innerHTML = 'Any'
  // instructorInput.appendChild(optionAnyInstructor)
  // courses.forEach((course) => {
  //   if (course.subject === subject && course.code === code) {
  //     const option = document.createElement('option')
  //     option.value = course.instructor
  //     option.innerHTML = course.instructor
  //     instructorInput.appendChild(option)
  //   }
  // })
  // synchronize instructor
  // instructorInput.addEventListener('change', (e) => {
  //   e.stopPropagation()
  //   const instructor = e.target.value
  //   const crn = e.target.parentNode.querySelector('.crnSelect')
  //   if (instructor === 'Any') {
  //     crn.value = 'Any'
  //     return
  //   }
  //   const fileteredCourses = courses.filter((course) => {
  //     return (
  //       course.instructor === instructor &&
  //       course.subject === subject &&
  //       course.code === code
  //     )
  //   })
  //   crn.value = fileteredCourses[0].crn
  // })
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
  advancedOptionsFormInputTwo.classList.add('input')
  advancedOptionsFormInputTwo.classList.add('noMultipleLabs')
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
  advancedEntryFour.appendChild(advancedOptionsFormLabelFour)
  advancedEntryFour.appendChild(advancedOptionsFormInputFour)
  const advancedEntryThree = document.createElement('div')
  advancedEntryThree.className = 'advancedEntry'
  const advancedOptionsFormLabelThree = document.createElement('label')
  advancedOptionsFormLabelThree.innerHTML = 'Break Between '
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
  const backButton = document.createElement('input')
  backButton.setAttribute('type', 'button')
  backButton.setAttribute('value', 'Back')
  backButton.classList.add('inputBtn')
  backButton.classList.add('backBtn')
  backButton.onclick = (event) => {
    advancedOptionsForm.style.display = 'none'
    form.style.display = 'block'
  }
  advancedEntryThree.appendChild(advancedOptionsFormLabelThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThreeExtra)
  advancedEntryThree.appendChild(addBreakButton)
  advancedEntryThree.appendChild(deleteBreakButton)
  advancedOptionsForm.appendChild(advancedEntry)
  advancedOptionsForm.appendChild(advancedEntryTwo)
  advancedOptionsForm.appendChild(advancedEntryFour)
  advancedOptionsForm.appendChild(advancedEntryThree)
  advancedOptionsForm.appendChild(backButton)
  formContainer.appendChild(advancedOptionsForm)
  form.style.display = 'none'
}
const addBreakEntry = (e) => {
  const advancedOptionsForm = e.target.parentNode.parentNode
  const advancedEntryThree = document.createElement('div')
  advancedEntryThree.className = 'advancedEntry'
  const advancedOptionsFormLabelThree = document.createElement('label')
  advancedOptionsFormLabelThree.innerHTML = 'Break Between '
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
  advancedEntryThree.appendChild(advancedOptionsFormLabelThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThree)
  advancedEntryThree.appendChild(advancedOptionsFormInputThreeExtra)
  advancedEntryThree.appendChild(addBreakButton)
  advancedEntryThree.appendChild(deleteBreakButton)
  advancedOptionsForm.insertBefore(
    advancedEntryThree,
    advancedOptionsForm.childNodes[advancedOptionsForm.childNodes.length - 1]
  )
}
const deleteBreakEntry = (e) => {
  const breakEntry = e.target.parentNode
  const advancedOptionsForm = breakEntry.parentNode
  // if its the last breakEntry then just reset it
  if (advancedOptionsForm.querySelectorAll('.advancedEntry').length === 4) {
    const options = breakEntry.querySelectorAll('.breakBetween')
    options.forEach((option) => {
      option.value = 'None'
    })
    return
  }
  breakEntry.remove()
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
    // if (data.status != '200') {
    //   throw new Error(data.message)
    // }
    const schedules = data.schedules
    if (!schedules || schedules.length === 0) {
      throw new Error('No schedules found')
    }
    // var zip = new JSZip() // commented in html file
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
  try {
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
          sections.push(section.value.split(' ')[0])
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
        breaks.push({
          startTime: breakBetweenSelect[i].value,
          endTime: breakBetweenSelect[i + 1].value,
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
  const scheduleTotalHeader = document.getElementById('schedule-total-header')
  scheduleTotalHeader.style.display = 'none'
}
