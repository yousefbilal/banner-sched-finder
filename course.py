from dataclasses import dataclass
from utils import *
@dataclass
class Course:
    course_code: str
    crn: str
    section: int
    time: str
    day: str
    instructor: str
    def is_conflicting(self, current_sched:list):
        current_course_time = time_to_float(self.time)
        for course in current_sched:
            course_time = time_to_float(course.time)
            if self.day in course.day and (current_course_time[0] >= course_time[0] and current_course_time[0] <= course_time[1]\
            or current_course_time[1] >= course_time[0] and current_course_time[1] <= course_time[1]):
                return True
        return False
    

@dataclass
class Lab(Course):
    pass

    
@dataclass
class Lecture(Course):
    has_lab: bool
    is_required_with_section : bool
    required_sections : list
    def __init__(self, course_code, crn, section, time, day, instructor, courses_list, is_required_with_section, required_sections):
        super().__init__(course_code,crn, section, time,day, instructor)
        self.has_lab = course_code+'L' in courses_list or course_code+'R' in courses_list
        self.is_required_with_section = is_required_with_section
        self.required_sections = required_sections
    
    def get_available_labs(self, lab_list : list[Lab]):
        if not self.has_lab:
            return []
        
        available_labs =[]
        for lab in lab_list:
            if self.course_code in lab.course_code:
                if not self.is_required_with_section or lab.section in self.required_sections:
                    available_labs.append(lab)
        return available_labs
    
                    
        
        
        
        
        
        