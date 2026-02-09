import google.generativeai as genai
import os

api_key = "AIzaSyB0k4zTVx8-KCtyjvmOdz9GGzUJnsd7YU4"
genai.configure(api_key=api_key)

print("Available Models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
