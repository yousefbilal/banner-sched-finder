from dataclasses import dataclass
import matplotlib as mpl
from matplotlib import pyplot as plt, dates
from matplotlib.patches import Rectangle
from datetime import datetime
import matplotlib.colors as mcolors
import random
import numpy as np
from course import Course
from matplotlib.ticker import AutoMinorLocator

@dataclass
class Schedule:
    courses_list: list[Course]
    def __init__(self, courses_list):
        self.courses_list = sorted(courses_list, key= lambda course: course.time[0]) 
    
    def draw_schedule(self):
        fig, ax = plt.subplots(figsize=(19.2,10.8))
        plt.rc('font', size=8)
        
        ax.xaxis.tick_top()
        ax.yaxis_date()
        ax.yaxis.set_major_formatter(dates.DateFormatter('%I:%M %p'))
        
        start_time = datetime(1900,1,1,self.courses_list[0].time[0].hour,0) # Starting time
        end_time = datetime(1900,1,1, self.courses_list[-1].time[1].hour+1 , 0) # Ending time
        start = dates.date2num(start_time)
        end = dates.date2num(end_time)
            
        width = 1
        colors = list(mcolors.TABLEAU_COLORS.keys())
        
        for course in self.courses_list:    
            height = dates.date2num(course.time[1]) - dates.date2num(course.time[0])
            choice = random.choice(colors)
            colors.remove(choice)
            # Plot rectangles
            days_figure_indices = {'M':0, 'T':1, 'W':2, 'R':3}
            for day in course.days:
                ax.add_patch(Rectangle((days_figure_indices[day], dates.date2num(course.time[0])), width, height, facecolor=choice, edgecolor=None, alpha = 0.5))
                plt.text(days_figure_indices[day] + 0.5, dates.date2num(course.time[0]),
                        f'\n{course.course_code}-{course.section}\n\n{course.instructor}\n\n{course.time[0].strftime("%I:%M %p")}-{course.time[1].strftime("%I:%M %p")}', 
                        horizontalalignment='center',
                        verticalalignment='top')
            
        labels = ['Mon', 'Tue', 'Wed', 'Thu']
        ax.set_xticks(np.arange(0.5,4, 1), labels, )
        ax.set_xticks(np.arange(0, 5, 1), minor = True)
        ax.yaxis.set_major_locator(dates.HourLocator())
        ax.yaxis.set_minor_locator(AutoMinorLocator())
        plt.xlim([0,4])
        plt.ylim([end,start])
        plt.grid(which='minor', axis = 'x', alpha =0.2)
        plt.grid(which='both', axis = 'y', alpha =0.2)
        
        for label in ax.get_yticklabels():
            label.set_fontsize(8)
         
        ax.tick_params(which='major', length = 0)
        ax.tick_params(which='minor', colors =[0,0,0,0.15], length = 7)
        ax.set_frame_on(False)
        
        plt.show()
        
        
if __name__ == '__main__':
    s = Schedule([Course('CMP111', '123', 1, [datetime(1900,1,1,9,30), datetime(1900,1,1,10,20)], 'MW', 'Ahmed Abdeljawad Al Nabulsi'), Course('MTH100', '1234', 5, [datetime(1900,1,1,14,0), datetime(1900,1,1,16,50)], 'TR', 'Issam')])
    s.draw_schedule()
    input('')