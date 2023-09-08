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
# schedulesCollection = db.get_collection('schedules')
# schedulesProjection = {"_id": 0, "courses": 1, "schedules": 1}
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
        # findSchedule = schedulesCollection.find_one(
        #     {"courses": {"$all": selectedCoursesArrayString}}, schedulesProjection)
        # if(findSchedule != None):
        #     return jsonify({'schedules': findSchedule["schedules"]}), 200

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
                    labs_list.append(Lab(course_code, crn, section,
                                     time, days, instructor_name))
                else:
                    lectures_dict.setdefault(course_code, []).append(Lecture(course_code, crn, section,
                                                                             time, days, instructor_name, selectedCoursesArrayString, *Lecture.find_required_section(course["full_name"])))
        for value in lectures_dict.values():
            lectures_list.append(value)
        del lectures_dict
        # print(lectures_list)
        # try:
        #     rmtree('output', ignore_errors=True)
        #     os.mkdir('output')
        # except:
        #     print("An unexpected error occured")
        #     exit(-1)

        all_schedules = generate_scheds(lectures_list, labs_list)
        if (len(all_schedules) == 0):
            return jsonify({'message': 'no schedules found'}), 300
        images = []

        del lectures_list
        del labs_list

        for i in range(len(all_schedules)):
            
            # # convert to base64
            image = all_schedules[i].draw_schedule()
            with io.BytesIO() as imgByte:
                image.save(imgByte, format='PNG')
                base64_image = base64.b64encode(imgByte.getvalue()).decode('utf-8')
                images.append(base64_image)
            # os.remove("output/schedule" + str(i) + ".png")
        # rmtree('output', ignore_errors=True)
        del all_schedules
        # save the schedules to the database
        # schedulesCollection.insert_one(
        #     {"courses": selectedCoursesArrayString, "schedules": images})
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


if __name__ == '__main__':
    from waitress import serve
    serve(app, host="0.0.0.0", port=8080)
