from schedule import Schedule
from course import *
from datetime import datetime
from typing import Iterator
import json


def generate_scheds(
    lectures: list[list[Lecture]], labs: dict[str, list[Lab]]
) -> Iterator[str]:

    def helper(
        lectures: list[list[Lecture]],
        labs: dict[str, list[Lab]],
        current_schedule: list[Course],
        min_time: datetime,
        max_time: datetime,
    ) -> Iterator[Schedule]:
        if not lectures:  # if lectures is empty
            yield Schedule(
                current_schedule[:], f"{min_time.hour}:00", f"{max_time.hour+1}:00"
            )
            return

        for lecture in lectures[0]:

            if not lecture.is_conflicting(current_schedule):
                current_schedule.append(lecture)
                if lecture.course_code != "BREAK":
                    cmin_time = min(min_time, lecture.time[0])
                    cmax_time = max(max_time, lecture.time[1])
                else:
                    cmin_time = min_time
                    cmax_time = max_time

                if lecture.has_lab:
                    for lab in lecture.get_available_labs(labs):
                        if not lab.is_conflicting(current_schedule):
                            current_schedule.append(lab)
                            cmin_time = min(cmin_time, lab.time[0])
                            cmax_time = max(cmax_time, lab.time[1])
                            yield from helper(
                                lectures[1:],
                                labs,
                                current_schedule,
                                cmin_time,
                                cmax_time,
                            )
                            current_schedule.pop()
                else:
                    yield from helper(
                        lectures[1:],
                        labs,
                        current_schedule,
                        cmin_time,
                        cmax_time,
                    )
                current_schedule.pop()

    max_time = datetime(1, 1, 1, 0, 0)
    min_time = datetime(9999, 1, 1, 0, 0)
    try:
        for schedule in helper(lectures, labs, [], min_time, max_time):
            yield json.dumps(schedule.to_dict(), default=str) + "\n"
    except GeneratorExit:
        print("Client closed the connection")
    except Exception as e:
        print(f"An error occurred: {e}")
