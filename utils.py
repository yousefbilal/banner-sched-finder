from Schedule import Schedule
from course import *
from datetime import datetime
course_codes = ["AUS","ACC","ANT","ARA","ARC","ART","BIO","BME","BSE","BPE","BUS","BIS","BLW","CHE",
                "CHM","CVE","COE","CMP","CMT","DES","ECO","ELE","NGN","EGM","ESM","ENG","ELP","ELT",
                "ENV","EWE","FLM","FIN","GEO","HIS","INE","ISA","IEN","IDE","INS","KOR","MGT","MKT",
                "MCM","MBA","MSE","MTH","MCE","MTR","MUM","MUS","PHI","PHY","POL","PSY","QBA","SOC",
                "STA","ABRD","SCM","THE","TRA","UPA","UPL","VIS","WST","WRI"]

# def find_course(courses, title):
#     '''the first return value represents whether a course exists
#         given the course title, and return True if the course found is a lab
#         as the second return value
#         Note: I treated labs with no lecture as a lecture and the "and" check is for that reason'''
#     for course in courses:
#         if course == title:
#             return True, title[-1] == 'R' or (title[-1] == 'L' and title[:-1] in courses)
#     return False, False


def generate_scheds(lectures:list[list[Lecture]], labs:dict[str, list[Lab]]) -> list[Schedule]:
    
    def helper(lectures:list[list[Lecture]], labs:dict[str, list[Lab]], current_schedule:list[Course], all_schedules:list[Schedule], min_time:datetime, max_time:datetime) -> list[Schedule]:
        if not lectures : #if lectures is empty
            all_schedules.append(Schedule(current_schedule[:], f"{min_time.hour}:00", f"{max_time.hour+1}:00"))
            return
        
        for lecture in lectures[0]:
            
            if not lecture.is_conflicting(current_schedule):
                current_schedule.append(lecture)
                cmin_time = min(min_time, lecture.time[0])
                cmax_time = max(max_time, lecture.time[1])
                if lecture.has_lab:
                    for lab in lecture.get_available_labs(labs):
                        if not lab.is_conflicting(current_schedule):
                            current_schedule.append(lab)
                            cmin_time = min(cmin_time, lab.time[0])
                            cmax_time = max(cmax_time, lab.time[1])
                            helper(lectures[1:],labs ,current_schedule, all_schedules, cmin_time, cmax_time)
                            current_schedule.pop()   
                else:
                    helper(lectures[1:], labs, current_schedule, all_schedules, cmin_time, cmax_time)
                current_schedule.pop()
    max_time = datetime(1,1,1,0,0)
    min_time = datetime(9999,1,1,0,0)
    
    all_scheds = []
    helper(lectures, labs, [], all_scheds, min_time, max_time)
    return all_scheds
