from Schedule import Schedule

course_codes = ["AUS","ACC","ANT","ARA","ARC","ART","BIO","BME","BSE","BPE","BUS","BIS","BLW","CHE",
                "CHM","CVE","COE","CMP","CMT","DES","ECO","ELE","NGN","EGM","ESM","ENG","ELP","ELT",
                "ENV","EWE","FLM","FIN","GEO","HIS","INE","ISA","IEN","IDE","INS","KOR","MGT","MKT",
                "MCM","MBA","MSE","MTH","MCE","MTR","MUM","MUS","PHI","PHY","POL","PSY","QBA","SOC",
                "STA","ABRD","SCM","THE","TRA","UPA","UPL","VIS","WST","WRI"]

def find_course(courses, title):
    '''the first return value represents whether a course exists
        given the course title, and return True if the course found is a lab
        as the second return value
        Note: I treated labs with no lecture as a lecture and the "and" check is for that reason'''
    for course in courses:
        if course == title:
            return True, title[-1] == 'R' or (title[-1] == 'L' and title[:-1] in courses)
    return False, False

# def time_to_float(time : str) -> list:
#     times = time.split(' - ')
#     times_edited = []
#     for time in times:
#         time = time.replace(':', '.')
#         if time.endswith('pm'):
#             time = time.replace('pm', '')
#             time = float(time)
#             if time < 12.00:
#                 time += 12
#             times_edited.append(time)
#         elif time.endswith('am'):
#             time = time.replace('am','')
#             times_edited.append(float(time))
#     return times_edited

# def float_to_time(float_time: list) -> str:
#     times_edited = []
#     for time in float_time:
#         if time >= 12:
#             period = ' pm'
#             if time >= 13:
#                 time -= 12
#         else: 
#             period = ' am'
#         time = format(time,'.2f')
#         time = time.replace('.', ':')
#         times_edited.append(time + period)
#     return ' - '.join(times_edited)

def generate_scheds(lectures:list, labs:list):
    def helper(lectures:list, labs:list, current_schedule:list, all_schedules:list) -> list[Schedule]:
        if not lectures : #if lectures is empty
            all_schedules.append(Schedule(current_schedule[:]))
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
