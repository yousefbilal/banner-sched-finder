import re
# from course import *

course_codes = ["AUS","ACC","ANT","ARA","ARC","ART","BIO","BME","BSE","BPE","BUS","BIS","BLW","CHE",
                "CHM","CVE","COE","CMP","CMT","DES","ECO","ELE","NGN","EGM","ESM","ENG","ELP","ELT",
                "ENV","EWE","FLM","FIN","GEO","HIS","INE","ISA","IEN","IDE","INS","KOR","MGT","MKT",
                "MCM","MBA","MSE","MTH","MCE","MTR","MUM","MUS","PHI","PHY","POL","PSY","QBA","SOC",
                "STA","ABRD","SCM","THE","TRA","UPA","UPL","VIS","WST","WRI"]

def find_course(courses, title):
    '''the first return value represents whether a course exists
        given the course title, and return True if the course found is a lab
        as the second return value'''
    for course in courses:
        if course == title:
            return True, title[-1] == 'L' or title[-1] == 'R'
    return False, False

def time_to_float(time : str) -> list:
    times = time.split(' - ')
    times_edited = []
    for time in times:
        time = time.replace(':', '.')
        if time.endswith('pm'):
            time = time.replace('pm', '')
            time = float(time)
            if time < 12.00:
                time += 12
            times_edited.append(time)
        elif time.endswith('am'):
            time = time.replace('am','')
            times_edited.append(float(time))
    return times_edited

def float_to_time(float_time: list) -> str:
    times_edited = []
    for time in float_time:
        if time >= 12:
            period = ' pm'
            if time >= 13:
                time -= 12
        else: 
            period = ' am'
        time = format(time,'.2f')
        time = time.replace('.', ':')
        times_edited.append(time + period)
    return ' - '.join(times_edited)

def find_required_section(course_name):
    if 'Take it with' in course_name:
        # the regex pattern returns a list of section numbers
        return True, [int(i) for i in re.findall("Sec\.([0-9]+)", course_name)]
    return False, []

def all_courses_added(courses, current_sched):
    for course in courses:
        if not course in [i.course_code for i in current_sched]:
            return False
    return True


def already_added(lecture, current_sched):
    return lecture.course_code in [course.course_code for course in current_sched]


# def generate_scheds(courses:list, lectures:list, labs:list, current_schedule:list, all_schedules:list):
#     if all_courses_added(courses, current_schedule):
#         all_schedules.append(current_schedule.copy())
#         return
#     for lecture in lectures:
#         if already_added(lecture, current_schedule):
#             continue
#         if not lecture.is_conflicting(current_schedule):
#             current_schedule.append(lecture)
#             if lecture.has_lab:
#                 for lab in lecture.get_available_labs(labs):
#                     if not lab.is_conflicting(current_schedule):
#                         current_schedule.append(lab)
#                         generate_scheds(courses, [x for x in lectures if x!=lecture],labs ,current_schedule, all_schedules)
#                         current_schedule.remove(lab)   
#             else:
#                 generate_scheds(courses, [x for x in lectures if x!=lecture], labs, current_schedule, all_schedules)
#             current_schedule.remove(lecture)

def generate_scheds(lectures:list, labs:list):
    def helper(lectures:list, labs:list, current_schedule:list, all_schedules:list):
        if len(lectures) ==0 :
            all_schedules.append(current_schedule[:])
            return
        
        for lecture in lectures[0]:
            
            if not lecture.is_conflicting(current_schedule):
                current_schedule.append(lecture)
                if lecture.has_lab:
                    for lab in lecture.get_available_labs(labs):
                        if not lab.is_conflicting(current_schedule):
                            current_schedule.append(lab)
                            helper(lectures[1:],labs ,current_schedule, all_schedules)
                            current_schedule.pop()   
                else:
                    helper(lectures[1:], labs, current_schedule, all_schedules)
                current_schedule.pop()
                
    all_scheds = []
    helper(lectures, labs, [], all_scheds)
    return all_scheds



# def prod(ls:list[list], current:list, all_combos:list[list]):
#     if len(ls) == 0:
#         all_combos.append(current[:])
#         return
    
    
#     for j in ls[0]:
#         current.append(j)
#         prod(ls[1:], current, all_combos)
#         current.pop()
    