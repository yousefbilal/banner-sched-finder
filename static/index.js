let subjects
let courses
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
  const dropdownselect = document.createElement('select')
  dropdownselect.setAttribute('name', 'subject')
  dropdownselect.classList.add('input')
  dropdownselect.classList.add('subject')
  dropdownselect.setAttribute('required', 'true')
  const dropdownlabelTwo = document.createElement('label')
  // dropdownlabelTwo.setAttribute('for', 'code')
  dropdownlabelTwo.innerHTML = 'Code'
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
    alertBox.innerHTML = 'Generating Schedule...'
    const selectedCourses = document.querySelectorAll('.entry')
    const selectedCoursesArray = []
    selectedCourses.forEach((course) => {
      const subject = course.querySelector('.subject').value
      const code = course.querySelector('.code').value
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
    if (schedules.length === 0) {
      throw new Error('No schedules found')
    }
    // decode the base 64 images
    schedules.forEach((schedule, index) => {
      const img = document.createElement('img')
      img.src = `data:image/png;base64,${schedule}`
      img.style.display = 'block'
      img.id = `schedule${index}`
      const a = document.createElement('a')
      a.href = `data:image/png;base64,${schedule}`
      a.style.display = 'block'
      a.download = `schedule${index}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
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
