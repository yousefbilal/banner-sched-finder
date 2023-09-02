from course import *
from datetime import datetime, timedelta
from utils import *
from bs4 import BeautifulSoup
import requests
import os
from shutil import rmtree
from sys import exit
from PIL import Image
import io
import base64

from flask import Flask, jsonify, render_template, request
# mongo db
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
app = Flask(__name__)
# mongo db

uri = os.environ.get('MONGODB_URI')
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Get the database
db = client.get_database('banner')
# Get the collection
collection = db.get_collection('subjects')
coursesCollection = db.get_collection('courses')
projection = {"_id": 0, "subject": 1, "code": 1}
# end of mongo db


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/generateSchedule', methods=['POST'])
def generate():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        lectures_list = []
        lectures_dict = dict()
        labs_list = []
        selectedCoursesArray = data["selectedCoursesArray"]
        # selectedCoursesArray is a list of objects (strings)
        # make it a list of strings
        selectedCoursesArrayString = [
            f"{obj['subject']} {obj['code']}" for obj in selectedCoursesArray]
        for i in range(len(selectedCoursesArray)):
            dataCourse = data["selectedCoursesArray"][i]
            courses = coursesCollection.find(
                {"code": dataCourse["code"], "subject": dataCourse["subject"]})
            for course in courses:
                course_code = course["fullCode"]
                crn = course["crn"]
                section = course["section"]
                time = course["time"]
                days = course["days"]
                instructor_name = course["instructor"]
                isLab = course["isLab"]
                if isLab:
                    labs_list.append(Lab(course_code, crn, int(section),
                                     time, days, instructor_name))
                else:
                    if (section.endswith('A') or section.endswith('E')):  # if its ARA course
                        section = section[:-1]
                    lectures_dict.setdefault(course_code, []).append(Lecture(course_code, crn, int(section),
                                                                             time, days, instructor_name, selectedCoursesArrayString, *Lecture.find_required_section(course["full_name"])))
        for value in lectures_dict.values():
            lectures_list.append(value)

        # print(lectures_list)
        try:
            rmtree('output', ignore_errors=True)
            os.mkdir('output')
        except:
            input("An unexpected error occured")
            exit(-1)

        all_schedules = generate_scheds(lectures_list, labs_list)
        if (len(all_schedules) == 0):
            return jsonify({'message': 'no schedules found'}), 300
        images = []
        for i in range(len(all_schedules)):
            all_schedules[i].draw_schedule("output/schedule" + str(i) + ".png")
            # # convert to base64
            image = Image.open("output/schedule" + str(i) + ".png")
            imgByte = io.BytesIO()
            image.save(imgByte, format='PNG')
            base64_image = base64.b64encode(imgByte.getvalue()).decode('utf-8')
            images.append(base64_image)

        # send back the schedules
        return jsonify({'schedules': images}), 200


@app.route('/getCourses', methods=['GET'])
def getCourses():
    try:
        subjects = list(collection.find())
        courses = list(coursesCollection.find({}, projection))
        for subject in subjects:
            subject['_id'] = str(subject['_id'])
        # for course in courses:
        #     course['_id'] = str(course['_id']) #dont send back the id for courses

        return jsonify({'subjects': subjects, 'courses': courses}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'error'}), 500


def scrape(semester_specifier):
    try:
        # request payload
        payload = {
            "term_in": semester_specifier,
            "sel_day": "dummy",
            "sel_schd": "dummy",
            "sel_insm": "dummy",
            "sel_camp": "dummy",
            "sel_sess": "dummy",
            "sel_ptrm": "dummy",
            "sel_subj": ["dummy"] + course_codes,
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

        r = requests.post(url="https://banner.aus.edu/axp3b21h/owa/bwckschd.p_get_crse_unsec",
                          data=payload)

        soup = BeautifulSoup(r.text, 'html.parser')

        row_list = soup.find('table', class_='datadisplaytable').find_all(
            'tr', recursive=False)
        # # delete all entries in courseCollection
        coursesCollection.delete_many({})

        for i in range(0, len(row_list), 2):
            # [full name, CRN, course code, section]
            *full_name, crn, course_code, section = row_list[i].get_text().rstrip().split(' - ')
            full_name = " ".join(full_name)
            subject = course_code.split()[0]
            course_code_number = course_code.split()[1]
            if (collection.count_documents({"subject": subject}) == 0):
                print(course_code)  # for debugging
                collection.insert_one({"subject": subject})
            if (coursesCollection.count_documents({"code": course_code_number, 'subject': subject, 'crn': crn, "fullCode": course_code}) == 0):
                print(course_code)  # for debugging
                try:
                    course_info = row_list[i+1].find('table', class_='datadisplaytable').find_all(
                        'tr', recursive=False)[1].find_all('td')

                # contains [type, time, days, seats, where, date range, sched type, instructor]
                    useful_info = [course_info[i].find(string=True, recursive=False) for i in [
                        1, 2, -1]]  # contains [time, days, instructor]
                    time = [datetime.strptime(time_str.upper(), '%I:%M %p')
                            for time_str in useful_info[0].split(' - ')]
                    days = useful_info[1]
                # some instructor names have 3 spaces separating their names and others only have 2
                # removes ' (' at the end of instructor name
                    instructor_name = useful_info[-1][:-2].replace(
                        '   ', ' ') if useful_info[-1] else useful_info[-1]
                    instructor_name = instructor_name.replace(
                        '  ', ' ') if useful_info[-1] else "TBA"
                except Exception as e:
                    print(e)
                    continue
                if course_code.endswith('L') or course_code.endswith('R'):
                    coursesCollection.insert_one({"code": course_code_number, 'subject': subject, 'crn': crn, "fullCode": course_code, 'full_name': full_name,
                                                 'time': time, 'days': days, 'section': section, 'instructor': instructor_name, 'isLab': True})
                else:
                    coursesCollection.insert_one({"code": course_code_number, 'subject': subject, 'crn': crn, "fullCode": course_code, 'full_name': full_name,
                                                 'time': time, 'days': days, 'section': section, 'instructor': instructor_name, 'isLab': False})
    except Exception as e:
        print(e + ' - error scraping')


# scrape('202410') # this was intentionally commented out
if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=8080)
