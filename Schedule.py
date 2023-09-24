from dataclasses import dataclass
from matplotlib import pyplot as plt, dates
from matplotlib.patches import Rectangle
from datetime import datetime, timedelta
import matplotlib.colors as mcolors
import random
import numpy as np
from course import Course
from matplotlib.ticker import AutoMinorLocator
import matplotlib
from PIL import Image
matplotlib.use('Agg')
plt.rc('font', size=9)


@dataclass(slots=True)
class Schedule:

    courses_list: list[Course]
    min_hour: str
    max_hour: str
    
    def draw_schedule(self):

        min_time = min([i.time[0] for i in self.courses_list])
        max_time = max([i.time[1] for i in self.courses_list])
        start_time = datetime(
            min_time.year, min_time.month, min_time.day, min_time.hour, 0)
        end_time = datetime(
            max_time.year, max_time.month, max_time.day, max_time.hour + 1, 0)
        start = dates.date2num(start_time)
        end = dates.date2num(end_time)

        fig, ax = plt.subplots(
            figsize=(10, 1.25*((end_time-start_time)/timedelta(minutes=50))), dpi=200)

        ax.xaxis.tick_top()
        ax.yaxis.set_major_formatter(dates.DateFormatter('%I:%M %p'))

        width = 1
        colors = list(mcolors.TABLEAU_COLORS.keys())

        for course in self.courses_list:
            height = dates.date2num(
                course.time[1]) - dates.date2num(course.time[0])
            choice = random.choice(colors)
            colors.remove(choice)
            # Plot rectangles
            days_figure_indices = {'M': 0, 'T': 1, 'W': 2, 'R': 3}
            font_size = 6 if len(course.instructor) >= 30 else 7
            for day in course.days:
                ax.add_patch(Rectangle((days_figure_indices[day], dates.date2num(
                    course.time[0])), width, height, facecolor=choice, edgecolor=None, alpha=0.5))
                ax.text(days_figure_indices[day] + 0.5, dates.date2num(course.time[0]),
                        f'\n{course.course_code}-{course.section}\n\nCRN:{course.crn}\n\n{course.instructor}\n\n{course.time[0].strftime("%I:%M %p")}-{course.time[1].strftime("%I:%M %p")}',
                        horizontalalignment='center',
                        verticalalignment='top', fontsize=font_size)

        labels = ['Mon', 'Tue', 'Wed', 'Thu']
        ax.set_xticks(np.arange(0.5, 4, 1), labels)
        ax.set_xticks(np.arange(0, 5, 1), minor=True)
        ax.yaxis.set_major_locator(dates.HourLocator())
        ax.yaxis.set_minor_locator(AutoMinorLocator())
        ax.set_xlim([0, 4])
        ax.set_ylim([end, start])
        ax.grid(which='minor', axis='x', alpha=0.2)
        ax.grid(which='both', axis='y', alpha=0.2)

        ax.tick_params(which='major', length=0)
        ax.tick_params(which='minor', colors=[0, 0, 0, 0.15], length=7)
        ax.set_frame_on(False)

        fig.canvas.draw()
        rgb = fig.canvas.tostring_rgb()
        width, height = fig.canvas.get_width_height()
        img = Image.frombytes('RGB', (width, height), rgb)

        # plt.savefig(name, dpi=200)
        plt.close(fig)
        return img
