import re
import os

def check_images():
    # 1. Get list of actual files
    images_dir = "public/images"
    try:
        actual_files = set(os.listdir(images_dir))
    except FileNotFoundError:
        print(f"Error: Directory {images_dir} not found.")
        return

    # 2. Extract image references from data files
    data_files = ["data/kingsData.ts", "data/partData.ts"]

    missing_images = []

    print("Checking image references...")

    for file_path in data_files:
        try:
            with open(file_path, "r") as f:
                content = f.read()
                # Find matches for imageUrl: "..." or imageUrl: '...'
                # We assume the path starts with "images/" or just the filename if that's how it's stored
                # Based on previous reads, it looks like "images/filename.jpg"
                matches = re.findall(r'imageUrl:\s*["\']([^"\']+)["\']', content)

                for match in matches:
                    # Clean up the path to get just the filename
                    # Assumes format "images/filename.jpg"
                    if "/" in match:
                        filename = match.split("/")[-1]
                    else:
                        filename = match

                    if filename not in actual_files:
                        missing_images.append(f"{file_path}: References '{match}' (File '{filename}' not found in {images_dir})")
                    else:
                        # print(f"OK: {match}")
                        pass

        except FileNotFoundError:
            print(f"Warning: Data file {file_path} not found.")

    if missing_images:
        print("\nFOUND MISSING IMAGES:")
        for err in missing_images:
            print(err)
    else:
        print("\nSUCCESS: All image references match files in public/images/")

if __name__ == "__main__":
    check_images()
