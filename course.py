from dataclasses import dataclass
import re
from datetime import datetime


@dataclass
class Course:
    course_code: str
    crn: str
    section: str
    time: list[datetime]
    days: str
    instructor: str
    is_required_with_section: bool
    required_sections: list

    def is_conflicting(self, current_sched: list):
        for course in current_sched:
            same_day = False
            for day in self.days:
                if day in course.days:
                    same_day = True
                    break

            if same_day and (
                (self.time[0] <= course.time[1] and self.time[1] >= course.time[0])
                or (course.time[0] <= self.time[1] and course.time[1] >= self.time[0])
            ):
                return True
        return False

    @staticmethod
    def find_required_sections(course_name):
        if "Take it with" in course_name:
            # the regex pattern returns a list of section numbers
            return True, [i for i in re.findall("Sec\.([0-9]+)", course_name)]
        return False, []

    def to_dict(self):
        return {
            "course_code": self.course_code,
            "crn": self.crn,
            "section": self.section,
            "time": self.time,
            "days": self.days,
            "instructor": self.instructor,
        }


@dataclass
class Lab(Course):
    def __str__(self):
        return f"Lab({self.course_code} - {self.section} - {self.crn} - {self.days} - {self.time} - {self.instructor})"


@dataclass
class Lecture(Course):
    has_lab: bool
    is_required_with_section: bool
    required_sections: list
    # def __init__(self, course_code, crn, section, time, days, instructor, courses_list, is_required_with_section, required_sections):
    #     super().__init__(course_code,crn, section, time,days, instructor, is_required_with_section, required_sections)
    #     self.has_lab = False
    #     for course in courses_list:
    #         if self.course_code + 'L' == course or self.course_code + 'R' == course:
    #             self.has_lab = True
    #             break

    def get_available_labs(self, lab_dict: dict[str, list[Lab]]) -> list[Lab]:
        available_labs = []
        labs_list = lab_dict[self.course_code]
        for lab in labs_list:
            if (
                not self.is_required_with_section and not lab.is_required_with_section
            ) or (
                self.is_required_with_section
                and lab.section.lstrip("0") in self.required_sections
            ):
                available_labs.append(lab)
        return available_labs

    def __str__(self):
        return f"Lecture({self.course_code} - {self.section} - {self.crn} - {self.days} - {self.time} - {self.instructor})"

    @classmethod
    def createBreak(cls, start_time, end_time, days):
        return Lecture(
            "BREAK",
            "",
            "",
            [
                datetime.strptime(start_time, "%H:%M"),
                datetime.strptime(end_time, "%H:%M"),
            ],
            days,
            "",
            False,
            [],
            False,
        )

    @classmethod
    def createLecture(
        cls,
        course_code,
        crn,
        section,
        time,
        days,
        instructor,
        courses_list,
        is_required_with_section,
        required_sections,
    ):
        has_lab = False
        for course in courses_list:
            if course_code + "L" == course or course_code + "R" == course:
                has_lab = True
                break
        return Lecture(
            course_code,
            crn,
            section,
            time,
            days,
            instructor,
            is_required_with_section,
            required_sections,
            has_lab,
        )
