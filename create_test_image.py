from PIL import Image
import os

def create_test_image():
    img = Image.new('RGB', (100, 100), color = 'red')
    img.save('dist/images/era_01_magadha.jpg')
    print("Created test image at dist/images/era_01_magadha.jpg")

if __name__ == "__main__":
    create_test_image()
