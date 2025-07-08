import os
import time
# import playsound
import speech_recognition as sr
from gtts import gTTS


def get_audio():
	r = sr.Recognizer()
	with sr.Microphone() as source:
		audio = r.listen(source)
		said = ""
		try:
			said = r.recognize_google(audio)
			print(said)
			return said
		except Exception as e:
		    print("Exception: " + str(e))
    # return 
	
print(get_audio())