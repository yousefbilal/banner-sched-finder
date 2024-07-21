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

    def is_conflicting(self, current_sched: list) -> bool:
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
    def find_required_sections(course_name) -> tuple[bool, list[str]]:
        if "Take it with" in course_name:
            # the regex pattern returns a list of section numbers
            return True, [i for i in re.findall("Sec\.([0-9]+)", course_name)]
        return False, []

    def to_dict(self) -> dict:
        return {
            "course_code": self.course_code,
            "crn": self.crn,
            "section": self.section,
            "time": [t.strftime("%a, %d %b %Y %H:%M:%S GMT") for t in self.time],
            "days": self.days,
            "instructor": self.instructor,
        }


@dataclass
class Lab(Course):
    def __str__(self) -> str:
        return f"Lab({self.course_code} - {self.section} - {self.crn} - {self.days} - {self.time} - {self.instructor})"


@dataclass
class Lecture(Course):
    has_lab: bool
    is_required_with_section: bool
    required_sections: list

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

    def __str__(self) -> str:
        return f"Lecture({self.course_code} - {self.section} - {self.crn} - {self.days} - {self.time} - {self.instructor})"

    @classmethod
    def createBreak(cls, start_time, end_time, days) -> "Lecture":
        return cls(
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
    ) -> "Lecture":
        has_lab = False
        for course in courses_list:
            if course_code + "L" == course or course_code + "R" == course:
                has_lab = True
                break
        return cls(
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


@dataclass(slots=True)
class Schedule:
    courses_list: list[Course]
    min_hour: str
    max_hour: str

    def to_dict(self) -> dict:
        return {
            "courses_list": [course.to_dict() for course in self.courses_list],
            "min_hour": self.min_hour,
            "max_hour": self.max_hour,
        }
