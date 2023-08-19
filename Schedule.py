from dataclasses import dataclass
from matplotlib import pyplot as plt, dates
from matplotlib.patches import Rectangle
from datetime import datetime, timedelta
import matplotlib.colors as mcolors
import random
import numpy as np
from course import Course
from matplotlib.ticker import AutoMinorLocator

@dataclass
class Schedule:
    
    courses_list: list[Course]
    
    def __init__(self, courses_list):
        self.courses_list = sorted(courses_list, key= lambda course: course.time[1]) 
    
    def draw_schedule(self, name :str):
        
        start_time = datetime(1900,1,1,self.courses_list[0].time[0].hour,0) # Starting time
        end_time = datetime(1900,1,1, self.courses_list[-1].time[1].hour+1 , 0) # Ending time
        start = dates.date2num(start_time)
        end = dates.date2num(end_time)
        
        plt.rc('font', size=9)
        fig, ax = plt.subplots(figsize=(11, 1.1*((end_time-start_time)/timedelta(minutes=50))), dpi=100)
        
        ax.xaxis.tick_top()
        ax.yaxis.set_major_formatter(dates.DateFormatter('%I:%M %p'))
        
        width = 1
        colors = list(mcolors.TABLEAU_COLORS.keys())
        
        for course in self.courses_list:    
            height = dates.date2num(course.time[1]) - dates.date2num(course.time[0])
            choice = random.choice(colors)
            colors.remove(choice)
            # Plot rectangles
            days_figure_indices = {'M':0, 'T':1, 'W':2, 'R':3}
            font_size = 7 if len(course.instructor) >= 30 else 8
            for day in course.days:
                ax.add_patch(Rectangle((days_figure_indices[day], dates.date2num(course.time[0])), width, height, facecolor=choice, edgecolor=None, alpha = 0.5))
                plt.text(days_figure_indices[day] + 0.5, dates.date2num(course.time[0]),
                        f'\n{course.course_code}-{course.section}\n\n{course.instructor}\n\n{course.time[0].strftime("%I:%M %p")}-{course.time[1].strftime("%I:%M %p")}', 
                        horizontalalignment='center',
                        verticalalignment='top', fontsize = font_size)
            
        labels = ['Mon', 'Tue', 'Wed', 'Thu']
        ax.set_xticks(np.arange(0.5,4, 1), labels)
        ax.set_xticks(np.arange(0, 5, 1), minor = True)
        ax.yaxis.set_major_locator(dates.HourLocator())
        ax.yaxis.set_minor_locator(AutoMinorLocator())
        plt.xlim([0,4])
        plt.ylim([end,start])
        plt.grid(which='minor', axis = 'x', alpha =0.2)
        plt.grid(which='both', axis = 'y', alpha =0.2)
        
         
        ax.tick_params(which='major', length = 0)
        ax.tick_params(which='minor', colors =[0,0,0,0.15], length = 7)
        ax.set_frame_on(False)
        plt.savefig(name, dpi=1000)
        plt.close()
        
# if __name__ == '__main__':
#     s = Schedule([Course('CMP111', '123', 1, [datetime(1900,1,1,8,0), datetime(1900,1,1,8,50)], 'MW', 'Ahmed Abdeljawad Al Nabulsi')])
#     s.draw_schedule()
#     input('')