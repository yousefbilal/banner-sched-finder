from course import *
from utils import *
import os
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
collection = db.get_collection('subjectss24')
coursesCollection = db.get_collection('coursess24_backup')
subjProjection = {"_id": 0, "subject": 1}
projection = {"_id": 0, "full_name": 1, "subject": 1, "code": 1,
              "section": 1, "instructor": 1, "time": 1, "days": 1}
schedulesCollection = db.get_collection('schedules')
schedulesProjection = {"_id": 0, "courses": 1, "schedules": 1}
# end of mongo db


def generateHelper(selectedCoursesArray, breaks):
    try:
        lectures_list = []
        lectures_dict = dict()
        labs_dict = dict()
        selectedCoursesArrayString = [
            f"{obj['subject']} {obj['code']}" for obj in selectedCoursesArray]
        for dataCourse in selectedCoursesArray:
            courses = []
            if dataCourse["sections"][0] != "Any":
                for section in dataCourse["sections"]:
                    courses += coursesCollection.find(
                        {"code": dataCourse["code"], "subject": dataCourse["subject"], "section": section})
            else:
                courses = coursesCollection.find(
                    {"code": dataCourse["code"], "subject": dataCourse["subject"]})

            course_code = dataCourse["subject"] + ' ' + dataCourse["code"]
            for course in courses:
                crn = course["crn"]
                section = course["section"]
                time = course["time"]
                days = course["days"]
                instructor_name = course["instructor"]
                # isLab = course["isLab"]
                if course["isLab"] and course_code[:-1] in selectedCoursesArrayString:
                    labs_dict.setdefault(course_code[:-1], []).append(Lab(course_code, crn, section, time, days,
                                                                          instructor_name, *Course.find_required_sections(course["full_name"])))
                else:
                    lectures_dict.setdefault(course_code, []).append(Lecture.createLecture(course_code, crn, section, time, days,
                                                                                           instructor_name, selectedCoursesArrayString, *Course.find_required_sections(course["full_name"])))
        for value in lectures_dict.values():
            lectures_list.append(value)

        for _break in breaks:
            lectures_list.append([Lecture.createBreak(
                _break["startTime"], _break["endTime"], _break.get("days", "MTWR"))])

        all_schedules = generate_scheds(lectures_list, labs_dict)
        # if (len(all_schedules) == 0):
        #     return all_schedules
        # print(all_schedules)
        # insert the schedules into the database
        # schedulesCollection.insert_one(
        #     {"courses": selectedCoursesArrayString, "schedules": all_schedules.to_dict()})

        return all_schedules
    except Exception as e:
        print(e)
        return []


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/generateScheduleDOM', methods=['POST'])
def generatedom():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        selectedCoursesArray = data["selectedCoursesArray"]
        breaks = data["breaks"]
        # selectedCoursesArray is a list of objects (strings)
        # make it a list of strings

        # all_schedules = schedulesCollection.find_one(
        #     {"courses": {"$all": selectedCoursesArrayString}}, schedulesProjection)
        # found = False
        # if (all_schedules != None):
        #     found = True
        #     all_sc hedules = list(all_schedules)
        # if (found == False):
        all_schedules = generateHelper(selectedCoursesArray, breaks)
        if (len(all_schedules) == 0):
            return jsonify({'message': 'no schedules found'}), 300

        return jsonify({'schedules': all_schedules}), 200


@app.route('/generateSchedule', methods=['POST'])
def generate():
    if request.method == 'POST':
        data = request.get_json()
        print(data)

        selectedCoursesArray = data["selectedCoursesArray"]
        # selectedCoursesArray is a list of objects (strings)
        # make it a list of strings
        selectedCoursesArrayString = [
            f"{obj['subject']} {obj['code']}" for obj in selectedCoursesArray]
        # all_schedules = schedulesCollection.find_one(
        #     {"courses": {"$all": selectedCoursesArrayString}}, schedulesProjection)
        # found = False
        # if (all_schedules != None):
        #     found = True
        #     all_schedules = list(all_schedules)
        # if (found == False):
        all_schedules = generateHelper(
            selectedCoursesArray, selectedCoursesArrayString)

        if (len(all_schedules) == 0):
            return jsonify({'message': 'no schedules found'}), 300

        images = []
        # try:
        #     rmtree('output', ignore_errors=True)
        #     os.mkdir('output')
        # except:
        #     print("An unexpected error occured")
        #     exit(-1)
        for i in range(len(all_schedules)):

            # # convert to base64
            image = all_schedules[i].draw_schedule()
            with io.BytesIO() as imgByte:
                image.save(imgByte, format='PNG')
                base64_image = base64.b64encode(
                    imgByte.getvalue()).decode('utf-8')
                images.append(base64_image)
            # os.remove("output/schedule" + str(i) + ".png")
        # rmtree('output', ignore_errors=True)
        del all_schedules
        # save the schedules to the database
        # send back the schedules
        return jsonify({'schedules': images}), 200


# @app.route('/scrapebannernow', methods=['POST'])
# def scrapenow():
#     if request.method == 'POST':
#         print('requested')
#         data = request.get_json()
#         print(data["key"])
#         if data["key"] != 'akvn':
#             return jsonify({'message': 'unauthorized', 'status': False}), 301
#         else:
#             return jsonify({'message': 'done', 'status': True}), 200


@app.route('/getCourses', methods=['GET'])
def getCourses():
    try:
        subjects = list(collection.find(
            {}, subjProjection).sort([("subject", 1)]))
        courses = list(coursesCollection.find(
            {}, projection).sort([("code", 1)]))
        return jsonify({'subjects': subjects, 'courses': courses}), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'error'}), 500


if __name__ == '__main__':
    # app.run(debug=True, port=8080)
    from waitress import serve
    serve(app, host="0.0.0.0", port=8080, threads=100)
