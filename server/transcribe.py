import sys
import speech_recognition as sr
import os

def main():
    if len(sys.argv) < 3:
        print("ERROR: Missing arguments. Usage: transcribe.py <audio_file_path> <language_code>")
        sys.exit(1)
        
    audio_path = sys.argv[1]
    lang = sys.argv[2] # 'te-IN' or 'en-US'
    
    if not os.path.exists(audio_path):
        print(f"ERROR: Audio file not found at {audio_path}")
        sys.exit(1)
        
    r = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path) as source:
            audio_data = r.record(source)
            
        # Using Google Web Speech API (completely free, no API key needed, has excellent Telugu/English support)
        text = r.recognize_google(audio_data, language=lang)
        print(text)
    except sr.UnknownValueError:
        print("ERROR: Speech was unintelligible")
    except sr.RequestError as e:
        print(f"ERROR: Could not request results from Google Speech Recognition service; {e}")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    main()
