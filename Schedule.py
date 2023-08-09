from dataclasses import dataclass
from matplotlib import pyplot as plt, dates
from matplotlib.patches import Rectangle
from datetime import datetime, timedelta
import matplotlib.colors as mcolors
import random
import numpy as np
from course import Course

@dataclass
class Schedule:
    courses_list: list[Course]
    def __init__(self, courses_list):
        self.courses_list = courses_list.sorted(key= lambda course: course.time[0]) 
    
    def draw_schedule(self):
        fig, ax = plt.subplots()

        ax.xaxis.tick_top()
        ax.yaxis_date()
        ax.yaxis.set_major_formatter(dates.DateFormatter('%I:%M %p'))
        
        start_time = datetime(1900,1,1,self.courses_list[0].time[0].hour,0) # Starting time
        end_time = datetime(1900,1,1, self.courses_list[-1].time[1].hour+1 , 0) # Ending time
        time_interval = timedelta(hours=1) # Time interval
        start = dates.date2num(start_time)
        end = dates.date2num(end_time)
        
        times = []
        while start_time <= end_time:
            times.append(start_time)
            start_time += time_interval
            
        width = 1
        colors = list(mcolors.TABLEAU_COLORS.keys())
        
        for course in self.courses_list:    
            height = dates.date2num(course.time[1]) - dates.date2num(course.time[0])
            choice = random.choice(colors)
            colors.remove(choice)
            # Plot rectangles
            days_figure_indices = {'M':0, 'T':1, 'W':2, 'R':3}
            for day in course.days:
                ax.add_patch(Rectangle((days_figure_indices[day], dates.date2num(course.time[0])), width, height, color='yellow', alpha = 0.5))
                plt.text(days_figure_indices[day], dates.date2num(course.time[0]),
                        f'{course.course_code}-{course.section}\n{course.instructor}\n{course.time[0].strftime("%I:%H %p")}-{course.time[1].strftime("%I:%H %p")}', 
                        horizontalalignment='left',
                        verticalalignment='top')
            
        labels = 9*[""]
        labels[1::2] = ['M', 'T', 'W', 'R']
        ax.set_xticks(np.arange(0,4.5, 0.5), labels)
        ax.set_yticks(times)
        plt.ylim([end,start])
        plt.show()
        