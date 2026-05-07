#!/usr/bin/env python

from subprocess import Popen, DEVNULL
import shlex, os, errno, time, glob
from collections import deque
import math

""" 
Zhenhao Zhang	zzh133@u.rochester.edu
CSC 212 HW 7
Github Account: X0X0X00
Github repo: https://github.com/X0X0X00/OpenFaceVision
"""


#Constants for later use
of2_verbose = False
temp_output = "of2_out"
temp_output_file = temp_output + '.csv'
landmark_count = 68

# Init Parameters
WINDOW_SIZE = 32  
GESTURE_THRESHOLD = 10  
COOLDOWN_FRAMES = 30 

# History
pitch_history = deque(maxlen=WINDOW_SIZE)
yaw_history = deque(maxlen=WINDOW_SIZE)
roll_history = deque(maxlen=WINDOW_SIZE)

gesture_cooldown = 0
expression_cooldown = 0

def distance(p1, p2):
	return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)



#This line finds the openface software
#If you're getting an error here, make sure this file is in the same folder as your openface installation
exe = ([exe for exe in glob.glob("./**/FeatureExtraction", recursive=True) if os.path.isfile(exe)]+[exe for exe in glob.glob(".\\**\\FeatureExtraction.exe", recursive=True)])[0]

#Clean up the temp file from a previous run, if it exists
try:
	os.remove(temp_output_file)
except OSError as e: 
	if e.errno != errno.ENOENT: # errno.ENOENT = no such file or directory
		raise # re-raise exception if a different error occurred

#These lines write the command to run openface with the correct options
command = shlex.split(" -device 0 -out_dir . -pose -2Dfp -of "+temp_output)
command.insert(0, exe)

#This line starts openface
of2 = Popen(command, stdin=DEVNULL, stdout=(None if of2_verbose else DEVNULL), stderr=DEVNULL)

#This loop waits until openface has actually started, as it can take some time to start producing output
while not os.path.exists(temp_output_file):
	time.sleep(.5)

#Openface saves info to a file, and we open that file here
data = open(temp_output_file,'r')

#This loop repeats while openface is still running
#Inside the loop, we read from the file that openface outputs to and check to see if there's anything new
#We handle the data if there is any, and wait otherwise
while(of2.poll() == None):
	line = data.readline().strip()
	
	if(line != ""):
		try:
			#Parse the line and save the useful values
			of_values = [float(v) for v in line.split(',')]
			timestamp, confidence, success = of_values[2:5]
			# OpenFace outputs angles in radians, convert to degrees
			pitch = math.degrees(of_values[8])
			yaw = math.degrees(of_values[9])
			roll = math.degrees(of_values[10])
			landmarks = []
			# x coordinates start at index 11, y coordinates start at index 11+68=79
			for i in range(landmark_count):
				landmarks.append((of_values[11+i], of_values[79+i]))
		except (ValueError, IndexError) as e:
			#This exception handles the header line or malformed data
			continue
			
		#********************************************
		# Most, maybe all, of your code will go here
		#********************************************

		'''
		Gesture Detection:
		Cond 1: "Yes" (Nodding) - Significant pitch changes
		Cond 2: "No" (Shaking head) - Significant yaw changes
		Cond 3: "Indian Nod" - Significant roll changes
		Expression Detection:
		Cond 4: "Smile" - Mouth corners move apart significantly
		Cond 5: "Surprise" - Eyebrows raised and mouth opens significantly
		'''
  
		# Add current angles to history
		pitch_history.append(pitch)
		yaw_history.append(yaw)
		roll_history.append(roll)

		# Decrease cooldown counters
		gesture_cooldown = max(0, gesture_cooldown - 1)
		expression_cooldown = max(0, expression_cooldown - 1)
		
		# Gesture detection
		if len(pitch_history) >= WINDOW_SIZE and gesture_cooldown == 0:
			# Calculate ranges
			pitch_range = max(pitch_history) - min(pitch_history)
			yaw_range = max(yaw_history) - min(yaw_history)
			roll_range = max(roll_history) - min(roll_history)

			# This is a debug print
			# if int(timestamp * 10) % 30 == 0:
			# 	print(f"[Debug] Pitch:{pitch_range:.1f} Yaw:{yaw_range:.1f} Roll:{roll_range:.1f}")

			# Yes
			if pitch_range > GESTURE_THRESHOLD and pitch_range > yaw_range and pitch_range > roll_range:
				print("\nYES\n")
				gesture_cooldown = COOLDOWN_FRAMES

			# No
			elif yaw_range > GESTURE_THRESHOLD and yaw_range > pitch_range and yaw_range > roll_range:
				print("\nNO\n")
				gesture_cooldown = COOLDOWN_FRAMES

			# Indian Nod
			elif roll_range > GESTURE_THRESHOLD and roll_range > pitch_range and roll_range > yaw_range:
				print("\nINDIAN NOD\n")
				gesture_cooldown = COOLDOWN_FRAMES

		# Facial expression detection
		if len(landmarks) == landmark_count and expression_cooldown == 0:

			# Key landmarks for expressions
			mouth_left = landmarks[48]
			mouth_right = landmarks[54]
			mouth_top = landmarks[51]
			mouth_bottom = landmarks[57]

			left_eyebrow_top = landmarks[19]
			right_eyebrow_top = landmarks[24]

			left_eye_top = landmarks[37]
			left_eye_bottom = landmarks[41]
			right_eye_top = landmarks[43]
			right_eye_bottom = landmarks[47]

			mouth_width = distance(mouth_left, mouth_right)
			mouth_height = distance(mouth_top, mouth_bottom)

			left_eye_brow_dist = distance(left_eyebrow_top, left_eye_top)
			right_eye_brow_dist = distance(right_eyebrow_top, right_eye_top)
			avg_eyebrow_height = (left_eye_brow_dist + right_eye_brow_dist) / 2

			mouth_aspect_ratio = mouth_width / (mouth_height + 1e-6) 

			# This is a debug print
			# if int(timestamp * 10) % 30 == 0:
			# 	print(f"[Debug] Smile ratio:{mouth_aspect_ratio:.1f} Eyebrow:{avg_eyebrow_height:.1f} Mouth height:{mouth_height:.1f}")

			# Smile
			if mouth_width > 0 and mouth_height > 0:
				if mouth_aspect_ratio > 4.5:  
					print("\nSMILE\n")
					expression_cooldown = COOLDOWN_FRAMES

				# SURPRISE
				elif avg_eyebrow_height > 30 and mouth_height > 25:  
					print("\nSURPRISE\n")
					expression_cooldown = COOLDOWN_FRAMES
     
		#Replace this line
		# print("time:", timestamp, "\tpitch:", pitch, "\tyaw:", yaw, "\troll:", roll)
		
	else:
		time.sleep(.01)
	
#Reminder: press 'q' to exit openface

print("Program ended")

data.close()