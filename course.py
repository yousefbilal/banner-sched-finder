from dataclasses import dataclass
# from utils import *
import re
from datetime import datetime

@dataclass(slots=True)
class Course:
    course_code: str
    crn: str
    section: str
    time: list[datetime]
    days: str
    instructor: str
    
    def is_conflicting(self, current_sched:list):
        # current_course_time = time_to_float(self.time)
        for course in current_sched:
            # course_time = time_to_float(course.time)
            same_day = False
            for day in self.days:
                if day in course.days:
                    same_day = True
                    break
            
            if same_day and (self.time[0] >= course.time[0] and self.time[0] <= course.time[1]\
            or self.time[1] >= course.time[0] and self.time[1] <= course.time[1]):
                return True
        return False
    
    
@dataclass(slots=True)
class Lab(Course):
    def __str__(self):
        return f'Lab({self.course_code} - {self.section} - {self.crn} - {self.days} - {self.time} - {self.instructor})'
 
            
@dataclass(slots=True)
class Lecture(Course):
    has_lab: bool
    is_required_with_section : bool
    required_sections : list
    def __init__(self, course_code, crn, section, time, days, instructor, courses_list, is_required_with_section, required_sections):
        super().__init__(course_code,crn, section, time,days, instructor)
        self.has_lab = course_code+'L' in courses_list or course_code+'R' in courses_list
        self.is_required_with_section = is_required_with_section
        self.required_sections = required_sections
    
    def get_available_labs(self, lab_list : list[Lab]):
        available_labs =[]
        for lab in lab_list:
            if self.course_code in lab.course_code:
                if not self.is_required_with_section or lab.section in self.required_sections:
                    available_labs.append(lab)
        return available_labs
    
    def __str__(self):
        return f'Lecture({self.course_code} - {self.section} - {self.crn} - {self.days} - {self.time} - {self.instructor})'
    
    @staticmethod
    def find_required_section(course_name):
        if 'Take it with' in course_name:
            # the regex pattern returns a list of section numbers
            return True, [int(i) for i in re.findall("Sec\.([0-9]+)", course_name)]
        return False, []
        