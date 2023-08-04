import requests
from bs4 import BeautifulSoup
from utils import *
import sys # temporary
from course import *

def main():
    sys.stdin = open('input.txt', 'rt')

    while True:
        semester = input("Semester (eg. Fall 2022): ").lower().split()
        if semester and (semester[0] == "fall" or semester[0] == "spring" or semester[0] == "summer"):
            break

    first = True

    courses = []
    while True:
        course_name = input("course number (eg. CMP 120)" + ". Press ENTER when done"*first + ": ").upper()
        if course_name == '' and first: # no input in the first prompt
            continue 
        elif course_name == '' and not first: #no input in a later prompt
            break
        elif course_name.split()[0] in course_codes:
            courses.append(course_name) 
            first = False
        else:
            print("Incorrect course code was entered")

    # Determining semester specifier
    if semester[0] == "fall":
        semester_specifier = str(int(semester[1]) + 1) + "10"
    elif semester[0] == "spring":
        semester_specifier = semester[1] + "20"
    elif semester[0] == "summer":
        semester_specifier = semester[1] + "30"
        
    # request payload
    payload = {
        "term_in": semester_specifier,
        "sel_day": "dummy",
        "sel_schd": "dummy",
        "sel_insm": "dummy",
        "sel_camp": "dummy",
        "sel_sess": "dummy",
        "sel_ptrm": "dummy",
        "sel_subj": ["dummy"] + [course.split()[0] for course in courses],
        "sel_crse": "",
        "sel_title": "",
        "sel_from_cred": "",
        "sel_to_cred": "",
        "sel_levl": ["dummy", "%"],
        "sel_instr": ["dummy", "%"],
        "sel_attr": ["dummy", "%"],
        "begin_hh": "0",
        "begin_mi": "0",
        "begin_ap": "a",
        "end_hh": "0",
        "end_mi": "0",
        "end_ap": "a"
    }

    r = requests.post(url = "https://banner.aus.edu/axp3b21h/owa/bwckschd.p_get_crse_unsec",
                    data = payload)

    soup = BeautifulSoup(r.text, 'html.parser')
        
    row_list = soup.find('table', class_ = 'datadisplaytable').find_all('tr', recursive=False)
    
    lectures_list = []
    lectures_dict = dict()
    labs_list = []
    for i in range(0, len(row_list), 2):
        *full_name, crn, course_code, section = row_list[i].get_text().rstrip().split(' - ') # [full name, CRN, course code, section]
        full_name = "".join(full_name)
        
        found, is_lab = find_course(courses, course_code)  
        if found:
            course_info = row_list[i+1].find('table', class_ = 'datadisplaytable').find_all('tr', recursive=False)[1].find_all('td')
            # contains [type, time, days, seats, where, date range, sched type, instructor]
            useful_info = [course_info[i].find(string=True, recursive=False) for i in [1,2,-1]] # contains [time, days, instructor]
            useful_info[-1] = useful_info[-1][:-2] if useful_info[-1] else useful_info[-1] #removes ' (' at the emd of instructor name
            if is_lab:
                labs_list.append(Lab(course_code, crn, int(section),
                                    *useful_info))
            else: 
                lectures_dict.setdefault(course_code, []).append(Lecture(course_code, crn, int(section),
                                            *useful_info, courses, *find_required_section(full_name)))
        
    for value in lectures_dict.values():
        lectures_list.append(value)
    
    # print(lectures_list)
    
    all_schedules = []
    generate_scheds(courses, lectures_list, labs_list, [], all_schedules)
    with open("output.txt", 'wt') as sys.stdout:
        print(all_schedules)
if __name__ == '__main__':
    main()
    
    
    

